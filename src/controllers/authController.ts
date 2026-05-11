import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../../prisma/client"

export async function cadastrar(req: Request, res: Response) {
  try {
    const { nome, email, senha } = req.body

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Preencha todos os campos" })
    }

    const usuarioExiste = await prisma.usuario.findUnique({ where: { email } })
    if (usuarioExiste) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado" })
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10)

    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaCriptografada },
    })

    return res.status(201).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    })
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao cadastrar usuário" })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ erro: "Preencha e-mail e senha" })
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos" })
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha)
    if (!senhaCorreta) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos" })
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    )

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    })
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao fazer login" })
  }
}
