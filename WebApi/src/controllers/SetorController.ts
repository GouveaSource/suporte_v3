import { Request, Response } from "express";
import { prisma } from "../config/prismaClient";
import { Status } from "@prisma/client";

export class SetorController {

  static async createSetor(req: Request, res: Response) {
    try {
      const { nome, telefone, ramal, responsavel } = req.body;

      if (!nome) {
        return res.status(400).json({ message: "O nome é obrigatório" });
      }

      const setor = await prisma.setor.create({
        data: {
          nome,
          telefone,
          ramal,
          responsavel,
        },
      });

      return res.status(201).json(setor);
    } catch (error) {
      console.error("Erro ao criar setor:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async listSetoresAtivos(req: Request, res: Response) {
    try {
      const setores = await prisma.setor.findMany({
        where: { status: Status.ATIVO },
        orderBy: { nome: "asc" },
      });
      return res.status(200).json(setores);
    } catch (error) {
      console.error("Erro ao listar setores:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async listAllSetores(req: Request, res: Response) {
    try {
      const setores = await prisma.setor.findMany({
        orderBy: { nome: "asc" },
      });
      return res.status(200).json(setores);
    } catch (error) {
      console.error("Erro ao listar setores:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async updateSetor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, telefone, ramal, responsavel, status } = req.body;

      const setor = await prisma.setor.update({
        where: { id },
        data: {
          nome,
          telefone,
          ramal,
          responsavel,
          status,
        },
      });

      return res.status(200).json(setor);
    } catch (error) {
      console.error("Erro ao atualizar setor:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async deleteSetor(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.setor.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar setor:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
}