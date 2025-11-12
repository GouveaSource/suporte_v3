import { Request, Response } from "express";
import { prisma } from "../config/prismaClient";
import { Status, CategoriaCNH, TipoReboque, Reboque } from "@prisma/client";
import { z } from "zod";

// --- Schemas de Validação Zod (Início) ---

const createGuincheiroSchema = z.object({
  nome: z.string().min(3, { message: "Nome é obrigatório" }),
  telefone: z
    .string()
    .min(10, { message: "Telefone deve ter 10 ou 11 dígitos" })
    .max(11, { message: "Telefone deve ter 10 ou 11 dígitos" }),
  cnh_categoria: z.nativeEnum(CategoriaCNH, {
    message: "Categoria CNH inválida",
  }),
  empresaId: z.string().uuid({ message: "O ID da empresa é obrigatório" }),
});

const updateGuincheiroSchema = createGuincheiroSchema.partial().extend({
  status: z.nativeEnum(Status).optional(),
});

// Schemas 1-para-1 (Reboque, Pátio, Órgão)
const reboqueRelationSchema = z.object({
  reboqueId: z.string().uuid({ message: "O ID do reboque é obrigatório" }),
});
const patioRelationSchema = z.object({
  patioId: z.string().uuid({ message: "O ID do pátio é obrigatório" }),
});
const orgaoRelationSchema = z.object({
  orgaoId: z.string().uuid({ message: "O ID do órgão é obrigatório" }),
});

// Schema N-N (Sincronização de Cidades)
const syncCidadesSchema = z.object({
  cidadesIds: z.array(z.string().uuid(), {
    message: "A lista de IDs de cidades deve ser um array de UUIDs",
  }),
});

// --- Fim dos Schemas Zod ---


// --- LÓGICA DE NEGÓCIO (CNH vs. TIPO REBOQUE) ---

// Mapa de Permissões CNH vs TipoReboque
const cnhReboqueMap: Record<CategoriaCNH, TipoReboque[]> = {
  A: [],
  B: [TipoReboque.LEVE],
  C: [TipoReboque.LEVE, TipoReboque.PESADO],
  D: [TipoReboque.LEVE, TipoReboque.PESADO],
  E: [TipoReboque.LEVE, TipoReboque.PESADO],
  AB: [TipoReboque.LEVE],
  AC: [TipoReboque.LEVE, TipoReboque.PESADO],
  AD: [TipoReboque.LEVE, TipoReboque.PESADO],
  AE: [TipoReboque.LEVE, TipoReboque.PESADO],
};

// Tipo Auxiliar para o Reboque processado
type ReboqueComCompatibilidade = Reboque & { isCnhCompativel?: boolean };

/**
 * Função Auxiliar: Adiciona o campo 'isCnhCompativel' aos reboques
 */
const adicionarAvisoCompatibilidade = (
  reboques: Reboque[],
  cnh: CategoriaCNH
): ReboqueComCompatibilidade[] => {
  const permissoes = cnhReboqueMap[cnh];

  return reboques.map((reboque) => ({
    ...reboque,
    isCnhCompativel: permissoes.includes(reboque.tipo),
  }));
};

// --- Fim da Lógica de Negócio ---


export class GuincheiroController {
  
  // --- CRUD BÁSICO ---

  static async createGuincheiro(req: Request, res: Response) {
    try {
      const data = createGuincheiroSchema.parse(req.body);

      const empresa = await prisma.empresa.findUnique({
        where: { id: data.empresaId },
      });
      if (!empresa) {
        return res.status(404).json({ message: "Empresa não encontrada" });
      }

      const guincheiro = await prisma.guincheiro.create({ data });
      return res.status(201).json(guincheiro);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      }
      console.error("Erro ao criar guincheiro:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async listGuincheirosAtivos(req: Request, res: Response) {
    try {
      const guincheiros = await prisma.guincheiro.findMany({
        where: { status: Status.ATIVO },
        orderBy: { nome: "asc" },
        include: {
          empresa: { select: { nome: true } },
          reboques: { where: { status: Status.ATIVO } },
          patios: { where: { status: Status.ATIVO }, select: { id: true, nome: true } },
          cidades: { where: { status: Status.ATIVO }, select: { id: true, nome: true } },
          orgaos: { where: { status: Status.ATIVO }, select: { id: true, nome: true } },
        },
      });

      const guincheirosProcessados = guincheiros.map((g) => ({
        ...g,
        reboques: adicionarAvisoCompatibilidade(g.reboques, g.cnh_categoria),
      }));

      return res.status(200).json(guincheirosProcessados);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async listAllGuincheiros(req: Request, res: Response) {
    try {
      const guincheiros = await prisma.guincheiro.findMany({
        orderBy: { nome: "asc" },
        include: {
          empresa: true,
          reboques: true,
          patios: true,
          cidades: true,
          orgaos: true,
        },
      });

      const guincheirosProcessados = guincheiros.map((g) => ({
        ...g,
        reboques: adicionarAvisoCompatibilidade(g.reboques, g.cnh_categoria),
      }));

      return res.status(200).json(guincheirosProcessados);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
  
  static async getGuincheiroById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const guincheiro = await prisma.guincheiro.findUnique({
        where: { id },
        include: { 
          empresa: true,
          reboques: true,
          patios: true,
          cidades: true,
          orgaos: true,
        },
      });
      if (!guincheiro) {
        return res.status(404).json({ message: "Guincheiro não encontrado" });
      }

      const guincheiroProcessado = {
        ...guincheiro,
        reboques: adicionarAvisoCompatibilidade(
          guincheiro.reboques,
          guincheiro.cnh_categoria
        ),
      };

      return res.status(200).json(guincheiroProcessado);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async updateGuincheiro(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateGuincheiroSchema.parse(req.body);

      const guincheiro = await prisma.guincheiro.update({
        where: { id },
        data: data,
      });
      return res.status(200).json(guincheiro);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      }
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async deleteGuincheiro(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.guincheiro.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ 
        message: "Erro interno no servidor. (Nota: O Guincheiro deve ser desassociado de Pátios/Reboques/etc. antes de ser deletado)" 
      });
    }
  }

  // --- MÉTODOS DE ASSOCIAÇÃO ---

  // --- REBOQUE (1-para-1 com lógica de CNH) ---
  static async associarReboque(req: Request, res: Response) {
    try {
      const { id } = req.params; // ID do Guincheiro
      const { reboqueId } = reboqueRelationSchema.parse(req.body);

      const [guincheiro, reboque] = await Promise.all([
        prisma.guincheiro.findUnique({ where: { id } }),
        prisma.reboque.findUnique({ where: { id: reboqueId } }),
      ]);

      if (!guincheiro) return res.status(404).json({ message: "Guincheiro não encontrado" });
      if (!reboque) return res.status(404).json({ message: "Reboque não encontrado" });

      const guincheiroAtualizado = await prisma.guincheiro.update({
        where: { id },
        data: { reboques: { connect: { id: reboqueId } } },
      });
      return res.status(200).json(guincheiroAtualizado);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async desassociarReboque(req: Request, res: Response) {
    try {
      const { id } = req.params; 
      const { reboqueId } = reboqueRelationSchema.parse(req.body);
      await prisma.guincheiro.update({
        where: { id },
        data: { reboques: { disconnect: { id: reboqueId } } },
      });
      return res.status(200).json({ message: "Reboque desassociado com sucesso" });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  // --- PÁTIO (1-para-1) ---
  static async associarPatio(req: Request, res: Response) {
    try {
      const { id } = req.params; 
      const { patioId } = patioRelationSchema.parse(req.body);
      await prisma.guincheiro.update({
        where: { id },
        data: { patios: { connect: { id: patioId } } },
      });
      return res.status(200).json({ message: "Pátio associado com sucesso" });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async desassociarPatio(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { patioId } = patioRelationSchema.parse(req.body);
      await prisma.guincheiro.update({
        where: { id },
        data: { patios: { disconnect: { id: patioId } } },
      });
      return res.status(200).json({ message: "Pátio desassociado com sucesso" });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  // --- CIDADE (N-N Sincronização) ---
  static async sincronizarCidades(req: Request, res: Response) {
    try {
      const { id } = req.params; // ID do Guincheiro
      const { cidadesIds } = syncCidadesSchema.parse(req.body);

      const guincheiro = await prisma.guincheiro.findUnique({ where: { id } });
      if (!guincheiro) {
        return res.status(404).json({ message: "Guincheiro não encontrado" });
      }

      // Converter [ "id-A", "id-B" ] para [ {id: "id-A"}, {id: "id-B"} ]
      const cidadesFormatadas = cidadesIds.map((cid) => ({ id: cid }));

      const guincheiroAtualizado = await prisma.guincheiro.update({
        where: { id },
        data: {
          cidades: {
            set: cidadesFormatadas, // "Define" a lista
          },
        },
        include: { cidades: true }, 
      });

      return res.status(200).json(guincheiroAtualizado);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  // --- ÓRGÃO (1-para-1) ---
  static async associarOrgao(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { orgaoId } = orgaoRelationSchema.parse(req.body);
      await prisma.guincheiro.update({
        where: { id },
        data: { orgaos: { connect: { id: orgaoId } } },
      });
      return res.status(200).json({ message: "Órgão associado com sucesso" });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async desassociarOrgao(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { orgaoId } = orgaoRelationSchema.parse(req.body);
      await prisma.guincheiro.update({
        where: { id },
        data: { orgaos: { disconnect: { id: orgaoId } } },
      });
      return res.status(200).json({ message: "Órgão desassociado com sucesso" });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
}