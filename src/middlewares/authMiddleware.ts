import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export function autenticar(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não fornecido" })
  }

  // o token vem assim: "Bearer eyJhbGci..."
  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.body.usuarioLogado = decoded
    next()
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado" })
  }
}
