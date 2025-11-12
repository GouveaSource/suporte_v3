import { Request, Response } from "express";
import { prisma } from "../config/prismaClient";
import { Status, TipoReboque } from "@prisma/client";
import { z } from "zod";

const createReboqueSchema = z.object({
  placa: z
    .string()
    .length(7, { message: "A placa deve ter 7 caracteres (ex: ABC1D23)" }),
  modelo: z.string().min(2, { message: "Modelo é obrigatório" }),
  tipo: z.nativeEnum(TipoReboque, {
    message: "Tipo deve ser LEVE ou PESADO",
  }),
  empresaId: z.string().uuid({ message: "O ID da empresa é obrigatório" }),
});

const updateReboqueSchema = z.object({
  placa: z.string().length(7, { message: "A placa deve ter 7 caracteres" }).optional(),
  modelo: z.string().min(2, { message: "Modelo é obrigatório" }).optional(),
  tipo: z.nativeEnum(TipoReboque, { message: "Tipo deve ser LEVE ou PESADO" }).optional(),
  empresaId: z.string().uuid({ message: "O ID da empresa é obrigatório" }).optional(),
  status: z.nativeEnum(Status, { message: "Status deve ser ATIVO ou INATIVO" }).optional(),
});

const syncAcessoriosSchema = z.object({
  acessoriosIds: z.array(z.string().uuid(), {
    message: "A lista de IDs de acessórios deve ser um array de UUIDs",
  }),
});

export class ReboqueController {
  static associarAcessorio(arg0: string, associarAcessorio: any) {
      throw new Error("Method not implemented.");
  }
  static desassociarAcessorio(arg0: string, desassociarAcessorio: any) {
      throw new Error("Method not implemented.");
  }

  static async createReboque(req: Request, res: Response) {
    try {
      const data = createReboqueSchema.parse(req.body);

      const empresa = await prisma.empresa.findUnique({ where: { id: data.empresaId } });
      if (!empresa) {
        return res.status(404).json({ message: "Empresa não encontrada" });
      }

      const placaExists = await prisma.reboque.findUnique({ where: { placa: data.placa } });
      if (placaExists) {
        return res.status(409).json({ message: "Placa já cadastrada" });
      }

      const reboque = await prisma.reboque.create({ data });
      return res.status(201).json(reboque);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      }
      console.error("Erro ao criar reboque:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async listReboquesAtivos(req: Request, res: Response) {
    try {
      const reboques = await prisma.reboque.findMany({
        where: { status: Status.ATIVO },
        orderBy: { modelo: "asc" },
        include: {
          empresa: { select: { nome: true } },
          acessorios: { where: { status: Status.ATIVO }, select: { nome: true } },
        },
      });
      return res.status(200).json(reboques);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async listAllReboques(req: Request, res: Response) {
    try {
      const reboques = await prisma.reboque.findMany({
        orderBy: { placa: "asc" },
        include: {
          empresa: true,
          acessorios: true,
        },
      });
      return res.status(200).json(reboques);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async updateReboque(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateReboqueSchema.parse(req.body);

      if (data.placa) {
        const placaExists = await prisma.reboque.findUnique({ where: { placa: data.placa } });
        if (placaExists && placaExists.id !== id) {
          return res.status(409).json({ message: "Placa já está em uso" });
        }
      }

      const reboque = await prisma.reboque.update({
        where: { id },
        data: data,
      });
      return res.status(200).json(reboque);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      }
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async deleteReboque(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.reboque.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ 
        message: "Erro interno no servidor. (Nota: O Reboque pode estar associado a Guincheiros)" 
      });
    }
  }

  static async sincronizarAcessorios(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { acessoriosIds } = syncAcessoriosSchema.parse(req.body);

      const reboque = await prisma.reboque.findUnique({ where: { id } });
      if (!reboque) {
        return res.status(404).json({ message: "Reboque não encontrado" });
      }
      const acessoriosFormatados = acessoriosIds.map((aid) => ({ id: aid }));

      const reboqueAtualizado = await prisma.reboque.update({
        where: { id },
        data: {
          acessorios: {
            set: acessoriosFormatados,
          },
        },
        include: { acessorios: true },
      });

      return res.status(200).json(reboqueAtualizado);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
}