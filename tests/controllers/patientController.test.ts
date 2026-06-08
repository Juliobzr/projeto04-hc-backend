import { listar, criar } from '../../src/controllers/patientController'

jest.mock('../../src/lib/prisma/client', () => {
  return {
    __esModule: true,
    default: {
      paciente: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    },
  }
})

import prisma from '../../src/lib/prisma/client'

function mockResponse() {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  return res
}

function mockRequest(body: any = {}, params: any = {}, query: any = {}) {
  return { body, params, query } as any
}

describe('patientController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('listar', () => {
    test('listar retorna a lista de pacientes', async () => {
      const pacientesMock = [
        { id: '1', nome: 'João', cpf: '123', dataNascimento: '01/01/2010', tea: null },
        { id: '2', nome: 'Ana', cpf: '456', dataNascimento: '02/02/2012', tea: null },
      ]

      ;(prisma.paciente.findMany as jest.Mock).mockResolvedValue(pacientesMock)

      const req = mockRequest()
      const res = mockResponse()

      await listar(req, res)

      expect(prisma.paciente.findMany).toHaveBeenCalledWith({ include: { tea: true }, orderBy: { criadoEm: 'desc' } })
      expect(res.json).toHaveBeenCalledWith(pacientesMock)
    })

    test('listar retorna lista vazia quando não há pacientes', async () => {
      ;(prisma.paciente.findMany as jest.Mock).mockResolvedValue([])

      const req = mockRequest()
      const res = mockResponse()

      await listar(req, res)

      expect(res.json).toHaveBeenCalledWith([])
    })

    test('listar retorna erro quando falha na busca', async () => {
      ;(prisma.paciente.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const req = mockRequest()
      const res = mockResponse()

      await listar(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao buscar pacientes' })
    })
  })

  describe('criar', () => {
    test('criar cria um paciente e retorna 201', async () => {
      const usuarioLogado = { id: 'user-1' }
      const pacienteInput = { nome: 'Carlos', cpf: '789', dataNascimento: '10/10/2015' }
      const createdPaciente = { id: '3', ...pacienteInput, usuarioId: usuarioLogado.id, tea: null }

      ;(prisma.paciente.create as jest.Mock).mockResolvedValue(createdPaciente)

      const req = mockRequest({ usuarioLogado, ...pacienteInput })
      const res = mockResponse()

      await criar(req, res)

      expect(prisma.paciente.create).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(createdPaciente)
    })

    test('criar retorna erro se falta nome', async () => {
      const usuarioLogado = { id: 'user-1' }
      const pacienteInput = { cpf: '789', dataNascimento: '10/10/2015' }

      const req = mockRequest({ usuarioLogado, ...pacienteInput })
      const res = mockResponse()

      await criar(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Nome, CPF e data de nascimento são obrigatórios' })
    })

    test('criar retorna erro se falta CPF', async () => {
      const usuarioLogado = { id: 'user-1' }
      const pacienteInput = { nome: 'Carlos', dataNascimento: '10/10/2015' }

      const req = mockRequest({ usuarioLogado, ...pacienteInput })
      const res = mockResponse()

      await criar(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Nome, CPF e data de nascimento são obrigatórios' })
    })

    test('criar retorna erro se falta data de nascimento', async () => {
      const usuarioLogado = { id: 'user-1' }
      const pacienteInput = { nome: 'Carlos', cpf: '789' }

      const req = mockRequest({ usuarioLogado, ...pacienteInput })
      const res = mockResponse()

      await criar(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Nome, CPF e data de nascimento são obrigatórios' })
    })

    test('criar cria paciente com dados TEA', async () => {
      const usuarioLogado = { id: 'user-1' }
      const pacienteInput = {
        nome: 'Carlos',
        cpf: '789',
        dataNascimento: '10/10/2015',
      }
      const teaData = { nivelSuporte: 'Nível 2', autonomia: 'Moderada' }
      const createdPaciente = {
        id: '3',
        ...pacienteInput,
        usuarioId: usuarioLogado.id,
        tea: teaData,
      }

      ;(prisma.paciente.create as jest.Mock).mockResolvedValue(createdPaciente)

      const req = mockRequest({ usuarioLogado, ...pacienteInput, tea: teaData })
      const res = mockResponse()

      await criar(req, res)

      expect(prisma.paciente.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tea: expect.any(Object),
          }),
        })
      )
      expect(res.status).toHaveBeenCalledWith(201)
    })

    test('criar retorna erro quando falha na criação', async () => {
      const usuarioLogado = { id: 'user-1' }
      const pacienteInput = { nome: 'Carlos', cpf: '789', dataNascimento: '10/10/2015' }

      ;(prisma.paciente.create as jest.Mock).mockRejectedValue(new Error('Database error'))

      const req = mockRequest({ usuarioLogado, ...pacienteInput })
      const res = mockResponse()

      await criar(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao criar paciente' })
    })
  })
})
