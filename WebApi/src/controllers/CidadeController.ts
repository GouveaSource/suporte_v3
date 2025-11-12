import { Request, Response } from "express";
import { prisma } from "../config/prismaClient";
import { Status } from "@prisma/client";
import { z } from "zod";

// Schema para criar (requer nome, estado e patioId)
const createCidadeSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  estado: z.string().length(2, { message: "Estado deve ter 2 caracteres (ex: SP)" }),
  patioId: z.string().uuid({ message: "O ID do pátio é obrigatório" }),
});

// Schema para atualizar (tudo opcional)
const updateCidadeSchema = createCidadeSchema.partial().extend({
  status: z.nativeEnum(Status).optional(),
});

export class CidadeController {
  
  static async createCidade(req: Request, res: Response) {
    try {
      const data = createCidadeSchema.parse(req.body);

      // (Lógica de Negócio: Verificar se o Pátio existe)
      const patio = await prisma.patio.findUnique({ where: { id: data.patioId } });
      if (!patio) {
        return res.status(404).json({ message: "Pátio não encontrado" });
      }

      const cidade = await prisma.cidade.create({ data });
      return res.status(201).json(cidade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      }
      console.error("Erro ao criar cidade:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  // (Vamos criar as rotas de listagem para o Comum e Admin)
  static async listCidadesAtivas(req: Request, res: Response) {
    try {
      const cidades = await prisma.cidade.findMany({
        where: { status: Status.ATIVO },
        orderBy: { nome: "asc" },
        include: { patio: { select: { nome: true } } }, // Mostrar o nome do pátio
      });
      return res.status(200).json(cidades);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async listAllCidades(req: Request, res: Response) {
    try {
      const cidades = await prisma.cidade.findMany({
        orderBy: { nome: "asc" },
        include: { patio: { select: { nome: true, status: true } } }, // Admin vê tudo
      });
      return res.status(200).json(cidades);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async updateCidade(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateCidadeSchema.parse(req.body);

      const cidade = await prisma.cidade.update({
        where: { id },
        data: data,
      });
      return res.status(200).json(cidade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      }
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async deleteCidade(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.cidade.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
}