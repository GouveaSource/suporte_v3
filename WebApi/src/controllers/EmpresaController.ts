import { Request, Response } from "express";
import { prisma } from "../config/prismaClient";
import { Status } from "@prisma/client";
import { z } from "zod";

const createEmpresaSchema = z.object({
  nome: z.string()
    .min(3, { message: "O nome é obrigatório e deve ter no mínimo 3 caracteres" }),
  
  cnpj: z.string()
    .length(14, { message: "O CNPJ é obrigatório e deve ter 14 dígitos (sem máscara)" }),
});

const updateEmpresaSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter no mínimo 3 caracteres" }).optional(),
  cnpj: z.string().length(14, { message: "O CNPJ deve ter 14 dígitos" }).optional(),
  status: z.nativeEnum(Status).optional(),
});

export class EmpresaController {
  
  static async createEmpresa(req: Request, res: Response) {
    try {
      const data = createEmpresaSchema.parse(req.body);

      const cnpjExists = await prisma.empresa.findUnique({
        where: { cnpj: data.cnpj },
      });
      if (cnpjExists) {
        return res.status(409).json({ message: "Este CNPJ já está cadastrado" });
      }

      const empresa = await prisma.empresa.create({
        data: {
          nome: data.nome,
          cnpj: data.cnpj,
        },
      });

      return res.status(201).json(empresa);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Erro de validação",
          errors: error.issues, 
        });
      }
      console.error("Erro ao criar empresa:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async listEmpresasAtivas(req: Request, res: Response) {
    try {
      const empresas = await prisma.empresa.findMany({
        where: { status: Status.ATIVO },
        orderBy: { nome: "asc" },
      });
      return res.status(200).json(empresas);
    } catch (error) {
      console.error("Erro ao listar empresas:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async listAllEmpresas(req: Request, res: Response) {
    try {
      const empresas = await prisma.empresa.findMany({
        orderBy: { nome: "asc" },
      });
      return res.status(200).json(empresas);
    } catch (error) {
      console.error("Erro ao listar empresas:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }


  static async updateEmpresa(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateEmpresaSchema.parse(req.body);

      if (data.cnpj) {
        const cnpjExists = await prisma.empresa.findUnique({
          where: { cnpj: data.cnpj },
        });
        if (cnpjExists && cnpjExists.id !== id) {
          return res.status(409).json({ message: "Este CNPJ já está em uso" });
        }
      }

      const empresa = await prisma.empresa.update({
        where: { id },
        data: data,
      });

      return res.status(200).json(empresa);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Erro de validação",
          errors: error.issues,
        });
      }
      console.error("Erro ao atualizar empresa:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async deleteEmpresa(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.empresa.delete({
        where: { id },
      });
      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar empresa:", error);
      return res.status(500).json({ 
        message: "Erro interno no servidor. (Nota: A empresa pode ter Reboques ou Guincheiros associados)" 
      });
    }
  }
}