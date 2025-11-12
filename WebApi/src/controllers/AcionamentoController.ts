import { Request, Response } from "express";
import { prisma } from "../config/prismaClient";
import { Status, CategoriaCNH, TipoReboque, Reboque } from "@prisma/client";
import { z } from "zod";

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
type ReboqueComCompatibilidade = Reboque & { isCnhCompativel?: boolean };
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

const buscaSchema = z.object({
  cidade: z.string().min(1, { message: "O nome da cidade é obrigatório." })
});

export class AcionamentoController {

  static async buscarGuincheiros(req: Request, res: Response) {
    try {

      const { cidade } = buscaSchema.parse(req.query);

      const guincheiros = await prisma.guincheiro.findMany({
        where: {
          status: Status.ATIVO,
          
          cidades: {
            some: {
              status: Status.ATIVO,

              nome: {
                contains: cidade,
                mode: 'insensitive',
              },
            },
          },
        },
        include: {
          empresa: { select: { nome: true } },
          reboques: { where: { status: Status.ATIVO } },
          patios: { 
            where: { status: Status.ATIVO }, 
            select: { id: true, nome: true, linkMaps: true, telefone: true } 
          },
          orgaos: { 
            where: { status: Status.ATIVO }, 
            select: { id: true, nome: true } 
          },
        },
      });

      const guincheirosProcessados = guincheiros.map((g) => ({
        ...g,
        reboques: adicionarAvisoCompatibilidade(g.reboques, g.cnh_categoria),
      }));

      return res.status(200).json(guincheirosProcessados);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Erro de validação (query param 'cidade' é obrigatório)", 
          errors: error.issues 
        });
      }
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
}