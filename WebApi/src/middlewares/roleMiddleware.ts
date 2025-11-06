import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

interface TokenPayload {
  userId: string;
  role: Role;
}

export const checkRole = (allowedRoles: Role[]) => {
  
  return (req: Request, res: Response, next: NextFunction) => {
    
    const { role } = (req as any).user as TokenPayload;

    if (!role) {
      return res.status(403).json({ message: "Função (Role) do utilizador não encontrada" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ 
        message: `Acesso negado. Esta rota requer uma das seguintes funções: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};