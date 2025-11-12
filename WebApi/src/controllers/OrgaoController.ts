import { Request, Response } from "express";
import { prisma } from "../config/prismaClient";
import { Status } from "@prisma/client";

export class OrgaoController {
  
  static async createOrgao(req: Request, res: Response) {
    try {
      const { nome } = req.body;

      if (!nome) {
        return res.status(400).json({ message: "O nome é obrigatório" });
      }

      const orgao = await prisma.orgao.create({
        data: { nome },
      });

      return res.status(201).json(orgao);
    } catch (error) {
      console.error("Erro ao criar órgão:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async listOrgaosAtivos(req: Request, res: Response) {
    try {
      const orgaos = await prisma.orgao.findMany({
        where: { status: Status.ATIVO },
        orderBy: { nome: "asc" },
      });
      return res.status(200).json(orgaos);
    } catch (error) {
      console.error("Erro ao listar órgãos:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async listAllOrgaos(req: Request, res: Response) {
    try {
      const orgaos = await prisma.orgao.findMany({
        orderBy: { nome: "asc" },
      });
      return res.status(200).json(orgaos);
    } catch (error) {
      console.error("Erro ao listar órgãos:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async updateOrgao(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, status } = req.body;

      const orgao = await prisma.orgao.update({
        where: { id },
        data: {
          nome,
          status,
        },
      });

      return res.status(200).json(orgao);
    } catch (error) {
      console.error("Erro ao atualizar órgão:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async deleteOrgao(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.orgao.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar órgão:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
}