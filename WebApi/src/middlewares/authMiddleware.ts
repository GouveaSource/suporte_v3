import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  role: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({ message: "Token de acesso não fornecido" });
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token mal formatado" });
    }

    const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
    if (!ACCESS_SECRET) {
      throw new Error("Segredo JWT de acesso não configurado no .env");
    }

    const payload = jwt.verify(
      token,
      ACCESS_SECRET as jwt.Secret
    ) as TokenPayload;

    (req as any).user = payload;
    
    next();

  } catch (error) {
    console.error("Erro de autenticação:", error);
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
};