import { Request, Response } from "express"
import prisma from "../lib/prisma/client"
import { gerarRelatorioIA } from "../services/reportService"

export async function listar(req: Request, res: Response) {
  try {
    const pacientes = await prisma.paciente.findMany({
      include: { tea: true },
      orderBy: { criadoEm: "desc" },
    })

    return res.json(pacientes)
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar pacientes" })
  }
}

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

export async function buscarPorCpf(req: Request, res: Response) {
  try {
    const { cpf } = req.query

    const pacientes = await prisma.paciente.findMany({
      where: {
        cpf: { contains: String(cpf) },
      },
      include: { tea: true },
    })

    return res.json(pacientes)
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar paciente" })
  }
}

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

export async function atualizar(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { usuarioLogado, tea, ...dadosPaciente } = req.body

    const paciente = await prisma.paciente.update({
      where: { id },
      data: {
        ...dadosPaciente,
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

export async function excluir(req: Request, res: Response) {
  try {
    const { id } = req.params

    await prisma.perfilTEA.deleteMany({ where: { pacienteId: id } })
    await prisma.paciente.delete({ where: { id } })

    return res.status(204).send()
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao excluir paciente" })
  }
}

export async function gerarRelatorio(req: Request, res: Response) {
  try {
    const { id } = req.params

    const paciente = await prisma.paciente.findUnique({
      where: { id },
      include: { tea: true },
    })

    if (!paciente) {
      return res.status(404).json({ erro: "Paciente não encontrado" })
    }

    if (!paciente.tea) {
      return res.status(400).json({ erro: "Paciente não possui dados TEA para gerar relatório" })
    }

    const relatorio = await gerarRelatorioIA({
      nome: paciente.nome,
      dataNascimento: paciente.dataNascimento,
      tea: paciente.tea,
    })

    return res.json({ relatorio })
  } catch (error: any) {
    console.error("Erro ao gerar relatório:", error)
    return res.status(500).json({ erro: error.message || "Erro ao gerar relatório" })
  }
}
