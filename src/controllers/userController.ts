import { Request, Response } from "express"
import prisma from "../lib/prisma/client"

// busca as configurações do usuário logado
export async function buscarConfiguracoes(req: Request, res: Response) {
  try {
    const { usuarioLogado } = req.body

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioLogado.id },
      include: { configuracao: true },
    })

    return res.json({
      nome: usuario?.nome,
      email: usuario?.email,
      ...usuario?.configuracao,
    })
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar configurações" })
  }
}

// salva as configurações do usuário logado
export async function salvarConfiguracoes(req: Request, res: Response) {
  try {
    const { usuarioLogado, nome, email, numero, instituicao, cidade, pais, estado, foto } = req.body

    // atualiza nome e email do usuário
    await prisma.usuario.update({
      where: { id: usuarioLogado.id },
      data: { nome, email },
    })

    // cria ou atualiza as configurações extras
    const configuracao = await prisma.configuracaoUsuario.upsert({
      where: { usuarioId: usuarioLogado.id },
      create: { usuarioId: usuarioLogado.id, numero, instituicao, cidade, pais, estado, foto },
      update: { numero, instituicao, cidade, pais, estado, foto },
    })

    return res.json(configuracao)
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao salvar configurações" })
  }
}
