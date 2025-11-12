import { Request, Response } from "express";
import { prisma } from "../config/prismaClient";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

 interface TokenPayload {
    userId: string;
    role: string;
    status: string;
    jti?: string;
  }

export class AuthController {

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email e senha são obrigatórios" });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      if (user.status === "INATIVO") {
        return res.status(403).json({ message: "Utilizador inativo." });
      }

      const isPasswordValid = await compare(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
      const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
      const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN;
      const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN;

      if (
        !ACCESS_SECRET ||
        !REFRESH_SECRET ||
        !ACCESS_EXPIRES ||
        !REFRESH_EXPIRES
      ) {
        console.error("Variáveis de ambiente JWT não configuradas no .env!");
        throw new Error("Erro de configuração interna do servidor.");
      }

      const payload: TokenPayload = {
        userId: user.id,
        role: user.role,
        status: user.status,
      };

      const accessToken = jwt.sign(
        payload,
        ACCESS_SECRET as jwt.Secret,
        ({ expiresIn: ACCESS_EXPIRES } as jwt.SignOptions)
      );

      const jti = uuidv4();
      const refreshTokenPayload: TokenPayload = {
        ...payload,
        jti: jti,
      };

      const refreshToken = jwt.sign(
        refreshTokenPayload,
        REFRESH_SECRET as jwt.Secret,
        ({ expiresIn: REFRESH_EXPIRES } as jwt.SignOptions)
      );

      return res.status(200).json({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error("Erro no login:", error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token é obrigatório" });
      }

      const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
      const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
      const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN;

      if (!REFRESH_SECRET || !ACCESS_SECRET || !ACCESS_EXPIRES) {
        throw new Error("Erro de configuração interna do servidor.");
      }

      const payload = jwt.verify(
        refreshToken,
        REFRESH_SECRET as jwt.Secret
      ) as TokenPayload;

      const isTokenRevoked = await prisma.revokedToken.findUnique({
        where: { jti: payload.jti }
      });

      if (isTokenRevoked) {
        return res
          .status(401)
          .json({ message: "Refresh token foi revogado (logout)" });
      }

      const newPayload: TokenPayload = {
        userId: payload.userId,
        role: payload.role,
        status: payload.status,
      };

      const accessToken = jwt.sign(
        newPayload,
        ACCESS_SECRET as jwt.Secret,
        ({ expiresIn: ACCESS_EXPIRES } as jwt.SignOptions)
      );

      return res.status(200).json({ accessToken });
    } catch (error) {
      console.error("Erro no refresh token:", error);
      return res
        .status(401)
        .json({ message: "Refresh token inválido ou expirado" });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token é obrigatório" });
      }

      const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
      if (!REFRESH_SECRET) {
        throw new Error("Erro de configuração interna do servidor.");
      }

      const payload = jwt.verify(
        refreshToken,
        REFRESH_SECRET as jwt.Secret
      ) as TokenPayload;

      if (!payload.jti) {
        return res.status(400).json({ message: "Token inválido" });
      }

      const expiryLimit = new Date();
      expiryLimit.setDate(expiryLimit.getDate() - 1);

      await prisma.revokedToken.deleteMany({
        where: {
          revokedAt: {
            lt: expiryLimit,
          },
        },
      });

      await prisma.revokedToken.create({
        data: {
          jti: payload.jti,
        },
      });

      return res.status(200).json({ message: "Logout bem-sucedido" });
    } catch (error) {
      console.error("Erro no logout (provável token inválido):", error);
      return res.status(200).json({ message: "Logout bem-sucedido" });
    }
  }
}