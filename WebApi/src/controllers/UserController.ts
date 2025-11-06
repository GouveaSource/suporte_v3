import { Request, Response } from "express";
import { prisma } from "../config/prismaClient";
import { hash as hashPassword } from "bcrypt";

export class UserController {
  static async createUser(req: Request, res: Response) {
    try {
      const { email, nome, password } = req.body;

      if (!email || !nome || !password) {
        return res.status(400).json({ message: "Dados incompletos" });
      }

      const userExists = await prisma.user.findUnique({
        where: { email },
      });

      if (userExists) {
        return res.status(409).json({ message: "Email já cadastrado" });
      }

      const password_hash = await hashPassword(password, 10);

      const newUser = await prisma.user.create({
        data: {
          email,
          nome,
          password_hash,
        },
        select: {
          id: true,
          email: true,
          nome: true,
          role: true,
          createdAt: true,
        },
      });

      return res.status(201).json(newUser);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async listUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          nome: true,
          role: true,
          createdAt: true,
        },
      });

      return res.status(200).json(users);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          nome: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

    static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, nome, role, password } = req.body;

      const userExists = await prisma.user.findUnique({ where: { id } });
      if (!userExists) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const updateData: any = {};

      if (nome) updateData.nome = nome;
      if (role) updateData.role = role;

      if (email) {
        const emailExists = await prisma.user.findUnique({
          where: { email },
        });
        
        if (emailExists && emailExists.id !== id) {
          return res.status(409).json({ message: "Email já em uso" });
        }
        updateData.email = email;
      }

      if (password) {
        updateData.password_hash = await hashPassword(password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          nome: true,
          role: true,
          updatedAt: true,
        },
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const userExists = await prisma.user.findUnique({ where: { id } });
      if (!userExists) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      await prisma.user.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
}