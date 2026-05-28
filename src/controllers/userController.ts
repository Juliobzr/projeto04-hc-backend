import { Request, Response } from "express"
import prisma from "../lib/prisma/client"
import bcrypt from "bcryptjs"

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

export async function listarFuncionarios(req: Request, res: Response) {
  try {
    const funcionarios = await prisma.usuario.findMany({
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        criadoEm: true,
      },
    })

    return res.json(funcionarios)
  } catch {
    return res.status(500).json({ erro: "Erro ao listar funcionários" })
  }
}

export async function buscarFuncionarioPorId(req: Request, res: Response) {
  try {
    const { id } = req.params

    const funcionario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        criadoEm: true,
      },
    })

    if (!funcionario) {
      return res.status(404).json({ erro: "Funcionário não encontrado" })
    }

    return res.json(funcionario)
  } catch {
    return res.status(500).json({ erro: "Erro ao buscar funcionário" })
  }
}

export async function cadastrarFuncionario(req: Request, res: Response) {
  try {
    const { nome, email, senha, role } = req.body

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Preencha todos os campos" })
    }

    const usuarioExiste = await prisma.usuario.findUnique({ where: { email } })
    if (usuarioExiste) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado" })
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10)

    const funcionario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
        role: role === "GESTOR" ? "GESTOR" : "FUNCIONARIO",
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        criadoEm: true,
      },
    })

    return res.status(201).json(funcionario)
  } catch {
    return res.status(500).json({ erro: "Erro ao cadastrar funcionário" })
  }
}

export async function atualizarFuncionario(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { nome, email, role, senha } = req.body

    const funcionario = await prisma.usuario.findUnique({ where: { id } })
    if (!funcionario) {
      return res.status(404).json({ erro: "Funcionário não encontrado" })
    }

    const dadosAtualizacao: any = {}

    if (nome) dadosAtualizacao.nome = nome
    if (email) dadosAtualizacao.email = email
    if (role) dadosAtualizacao.role = role === "GESTOR" ? "GESTOR" : "FUNCIONARIO"
    if (senha) dadosAtualizacao.senha = await bcrypt.hash(senha, 10)

    const atualizado = await prisma.usuario.update({
      where: { id },
      data: dadosAtualizacao,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        criadoEm: true,
      },
    })

    return res.json(atualizado)
  } catch {
    return res.status(500).json({ erro: "Erro ao atualizar funcionário" })
  }
}

export async function excluirFuncionario(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { usuarioLogado } = req.body

    if (id === usuarioLogado.id) {
      return res.status(400).json({ erro: "Você não pode excluir o próprio usuário" })
    }

    await prisma.configuracaoUsuario.deleteMany({
      where: { usuarioId: id },
    })
    await prisma.perfilTEA.deleteMany({
      where: {
        paciente: { usuarioId: id },
      },
    })
    await prisma.paciente.deleteMany({
      where: { usuarioId: id },
    })
    await prisma.usuario.delete({
      where: { id },
    })

    return res.status(204).send()
  } catch {
    return res.status(500).json({ erro: "Erro ao excluir funcionário" })
  }
}
