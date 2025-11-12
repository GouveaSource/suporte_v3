import { Request, Response } from "express";
import { prisma } from "../config/prismaClient";
import { Status } from "@prisma/client";

export class AcessorioController {
  
  static async createAcessorio(req: Request, res: Response) {
    try {
      const { nome } = req.body;

      if (!nome) {
        return res.status(400).json({ message: "O nome é obrigatório" });
      }

      const acessorio = await prisma.acessorio.create({
        data: {
          nome,
        },
      });

      return res.status(201).json(acessorio);
    } catch (error) {
      console.error("Erro ao criar acessório:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async listAcessoriosAtivos(req: Request, res: Response) {
    try {
      const acessorios = await prisma.acessorio.findMany({
        where: {
          status: Status.ATIVO,
        },
        orderBy: { nome: "asc" },
      });
      return res.status(200).json(acessorios);
    } catch (error) {
      console.error("Erro ao listar acessórios:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async listAllAcessorios(req: Request, res: Response) {
    try {
      const acessorios = await prisma.acessorio.findMany({
        orderBy: { nome: "asc" },
      });
      return res.status(200).json(acessorios);
    } catch (error) {
      console.error("Erro ao listar acessórios:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async updateAcessorio(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, status } = req.body;

      const acessorio = await prisma.acessorio.update({
        where: { id },
        data: {
          nome,
          status,
        },
      });

      return res.status(200).json(acessorio);
    } catch (error) {
      console.error("Erro ao atualizar acessório:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async deleteAcessorio(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.acessorio.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error) {

      console.error("Erro ao deletar acessório:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
}