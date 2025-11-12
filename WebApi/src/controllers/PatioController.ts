import { Request, Response } from "express";
import { prisma } from "../config/prismaClient";
import { Status } from "@prisma/client";
import { z } from "zod";

// Schema para criar (só o nome é obrigatório)
const createPatioSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  telefone: z.string().optional(),
  email: z.string().email({ message: "Email inválido" }).optional(),
  responsavel: z.string().optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  cep: z.string().optional(),
  bairro: z.string().optional(),
  referencia: z.string().optional(),
  linkMaps: z.string().url({ message: "Link do Maps deve ser uma URL válida" }).optional(),
});

// Schema para atualizar (tudo opcional)
const updatePatioSchema = createPatioSchema.partial().extend({
  status: z.nativeEnum(Status).optional(),
});

export class PatioController {

  static async createPatio(req: Request, res: Response) {
    try {
      const data = createPatioSchema.parse(req.body);
      const patio = await prisma.patio.create({ data });
      return res.status(201).json(patio);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      }
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  // (Esta é a rota que o Comum usará, ela traz os dados relacionados)
  static async listPatiosAtivos(req: Request, res: Response) {
    try {
      const patios = await prisma.patio.findMany({
        where: { status: Status.ATIVO },
        orderBy: { nome: "asc" },
        include: {
          // Incluir apenas os relacionados ATIVOS
          cidades: { where: { status: Status.ATIVO } },
          orgaos: { where: { status: Status.ATIVO } },
          guincheiros: { where: { status: Status.ATIVO } },
        },
      });
      return res.status(200).json(patios);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  // (Esta é a rota do Admin, traz tudo)
  static async listAllPatios(req: Request, res: Response) {
    try {
      const patios = await prisma.patio.findMany({
        orderBy: { nome: "asc" },
        include: {
          cidades: true,
          orgaos: true,
          guincheiros: true,
        },
      });
      return res.status(200).json(patios);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
  
  // (Pega um pátio específico com todos os dados)
  static async getPatioById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const patio = await prisma.patio.findUnique({
        where: { id },
        include: { // Inclui tudo (Admin)
          cidades: true,
          orgaos: true,
          guincheiros: true,
        },
      });
      if (!patio) {
        return res.status(404).json({ message: "Pátio não encontrado" });
      }
      return res.status(200).json(patio);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async updatePatio(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updatePatioSchema.parse(req.body);
      const patio = await prisma.patio.update({
        where: { id },
        data: data,
      });
      return res.status(200).json(patio);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.issues });
      }
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async deletePatio(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // (Atenção: Prisma vai bloquear se houver Cidades ligadas a este Pátio)
      await prisma.patio.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ 
        message: "Erro interno no servidor. (Nota: O Pátio pode ter Cidades associadas)" 
      });
    }
  }
}