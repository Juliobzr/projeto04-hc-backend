import { Request, Response } from "express"
import prisma from "../prisma/client"

// lista todos os pacientes do usuário logado
export async function listar(req: Request, res: Response) {
  try {
    const { usuarioLogado } = req.body

    const pacientes = await prisma.paciente.findMany({
      where: { usuarioId: usuarioLogado.id },
      include: { tea: true },
      orderBy: { criadoEm: "desc" },
    })

    return res.json(pacientes)
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar pacientes" })
  }
}

// busca um paciente pelo id
export async function buscarPorId(req: Request, res: Response) {
  try {
    const { id } = req.params

    const paciente = await prisma.paciente.findUnique({
      where: { id },
      include: { tea: true },
    })

    if (!paciente) {
      return res.status(404).json({ erro: "Paciente não encontrado" })
    }

    return res.json(paciente)
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar paciente" })
  }
}

// busca paciente por CPF
export async function buscarPorCpf(req: Request, res: Response) {
  try {
    const { cpf } = req.query
    const { usuarioLogado } = req.body

    const pacientes = await prisma.paciente.findMany({
      where: {
        usuarioId: usuarioLogado.id,
        cpf: { contains: String(cpf) },
      },
      include: { tea: true },
    })

    return res.json(pacientes)
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar paciente" })
  }
}

// cria um novo paciente, com perfil TEA se tiver
export async function criar(req: Request, res: Response) {
  try {
    const { usuarioLogado, tea, ...dadosPaciente } = req.body

    if (!dadosPaciente.nome || !dadosPaciente.cpf || !dadosPaciente.dataNascimento) {
      return res.status(400).json({ erro: "Nome, CPF e data de nascimento são obrigatórios" })
    }

    const paciente = await prisma.paciente.create({
      data: {
        ...dadosPaciente,
        usuarioId: usuarioLogado.id,
        // se veio perfil TEA junto, cria junto
        ...(tea && {
          tea: { create: tea },
        }),
      },
      include: { tea: true },
    })

    return res.status(201).json(paciente)
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao criar paciente" })
  }
}

// atualiza paciente e o perfil TEA se tiver
export async function atualizar(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { usuarioLogado, tea, ...dadosPaciente } = req.body

    const paciente = await prisma.paciente.update({
      where: { id },
      data: {
        ...dadosPaciente,
        // upsert: cria o perfil TEA se não existir, atualiza se existir
        ...(tea && {
          tea: {
            upsert: {
              create: tea,
              update: tea,
            },
          },
        }),
      },
      include: { tea: true },
    })

    return res.json(paciente)
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao atualizar paciente" })
  }
}

// exclui paciente (e o perfil TEA junto por causa da relação)
export async function excluir(req: Request, res: Response) {
  try {
    const { id } = req.params

    // precisa deletar o TEA antes por causa da chave estrangeira
    await prisma.perfilTEA.deleteMany({ where: { pacienteId: id } })
    await prisma.paciente.delete({ where: { id } })

    return res.status(204).send()
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao excluir paciente" })
  }
}
