import { buscarPorId, buscarPorCpf, atualizar, excluir, gerarRelatorio } from '../../src/controllers/patientController'
import { gerarRelatorioIA } from '../../src/services/reportService'

jest.mock('../../src/lib/prisma/client', () => {
  return {
    __esModule: true,
    default: {
      paciente: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      perfilTEA: {
        deleteMany: jest.fn(),
      },
    },
  }
})

jest.mock('../../src/services/reportService')

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

describe('patientController - Operações Avançadas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('buscarPorId', () => {
    test('buscarPorId retorna paciente quando encontrado', async () => {
      const paciente = {
        id: '1',
        nome: 'João',
        cpf: '123',
        dataNascimento: '01/01/2010',
        tea: { nivelSuporte: 'Nível 2' },
      }

      ;(prisma.paciente.findUnique as jest.Mock).mockResolvedValue(paciente)

      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await buscarPorId(req, res)

      expect(prisma.paciente.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { tea: true },
      })
      expect(res.json).toHaveBeenCalledWith(paciente)
    })

    test('buscarPorId retorna 404 quando paciente não encontrado', async () => {
      ;(prisma.paciente.findUnique as jest.Mock).mockResolvedValue(null)

      const req = mockRequest({}, { id: 'inexistente' })
      const res = mockResponse()

      await buscarPorId(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Paciente não encontrado' })
    })

    test('buscarPorId retorna erro ao falhar', async () => {
      ;(prisma.paciente.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await buscarPorId(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao buscar paciente' })
    })
  })

  describe('buscarPorCpf', () => {
    test('buscarPorCpf retorna pacientes com CPF parcial', async () => {
      const pacientes = [
        { id: '1', nome: 'João', cpf: '123456789', dataNascimento: '01/01/2010', tea: null },
        { id: '2', nome: 'Ana', cpf: '123456780', dataNascimento: '02/02/2012', tea: null },
      ]

      ;(prisma.paciente.findMany as jest.Mock).mockResolvedValue(pacientes)

      const req = mockRequest({}, {}, { cpf: '12345678' })
      const res = mockResponse()

      await buscarPorCpf(req, res)

      expect(prisma.paciente.findMany).toHaveBeenCalledWith({
        where: { cpf: { contains: '12345678' } },
        include: { tea: true },
      })
      expect(res.json).toHaveBeenCalledWith(pacientes)
    })

    test('buscarPorCpf retorna lista vazia quando nenhum paciente encontrado', async () => {
      ;(prisma.paciente.findMany as jest.Mock).mockResolvedValue([])

      const req = mockRequest({}, {}, { cpf: '999999999' })
      const res = mockResponse()

      await buscarPorCpf(req, res)

      expect(res.json).toHaveBeenCalledWith([])
    })

    test('buscarPorCpf retorna erro ao falhar', async () => {
      ;(prisma.paciente.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const req = mockRequest({}, {}, { cpf: '12345678' })
      const res = mockResponse()

      await buscarPorCpf(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao buscar paciente' })
    })
  })

  describe('atualizar', () => {
    test('atualizar modifica dados do paciente', async () => {
      const usuarioLogado = { id: 'user-1' }
      const dadosAtualizados = {
        usuarioLogado,
        nome: 'João Silva Updated',
        cpf: '123456789',
        dataNascimento: '01/01/2010',
      }
      const pacienteAtualizado = {
        id: '1',
        ...dadosAtualizados,
        tea: null,
      }

      ;(prisma.paciente.update as jest.Mock).mockResolvedValue(pacienteAtualizado)

      const req = mockRequest(dadosAtualizados, { id: '1' })
      const res = mockResponse()

      await atualizar(req, res)

      expect(prisma.paciente.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.any(Object),
        include: { tea: true },
      })
      expect(res.json).toHaveBeenCalledWith(pacienteAtualizado)
    })

    test('atualizar cria ou atualiza dados TEA do paciente', async () => {
      const usuarioLogado = { id: 'user-1' }
      const teaData = { nivelSuporte: 'Nível 2', autonomia: 'Moderada' }
      const dadosAtualizados = {
        usuarioLogado,
        nome: 'João',
        cpf: '123456789',
        dataNascimento: '01/01/2010',
        tea: teaData,
      }
      const pacienteAtualizado = {
        id: '1',
        nome: 'João',
        cpf: '123456789',
        dataNascimento: '01/01/2010',
        tea: teaData,
      }

      ;(prisma.paciente.update as jest.Mock).mockResolvedValue(pacienteAtualizado)

      const req = mockRequest(dadosAtualizados, { id: '1' })
      const res = mockResponse()

      await atualizar(req, res)

      expect(prisma.paciente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: expect.objectContaining({
            tea: expect.any(Object),
          }),
        })
      )
    })

    test('atualizar retorna erro ao falhar', async () => {
      ;(prisma.paciente.update as jest.Mock).mockRejectedValue(new Error('Database error'))

      const req = mockRequest({ usuarioLogado: { id: 'user-1' } }, { id: '1' })
      const res = mockResponse()

      await atualizar(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao atualizar paciente' })
    })
  })

  describe('excluir', () => {
    test('excluir remove paciente e seus dados TEA', async () => {
      ;(prisma.perfilTEA.deleteMany as jest.Mock).mockResolvedValue({})
      ;(prisma.paciente.delete as jest.Mock).mockResolvedValue({})

      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await excluir(req, res)

      expect(prisma.perfilTEA.deleteMany).toHaveBeenCalledWith({ where: { pacienteId: '1' } })
      expect(prisma.paciente.delete).toHaveBeenCalledWith({ where: { id: '1' } })
      expect(res.status).toHaveBeenCalledWith(204)
      expect(res.send).toHaveBeenCalled()
    })

    test('excluir retorna erro quando falha', async () => {
      ;(prisma.perfilTEA.deleteMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await excluir(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao excluir paciente' })
    })
  })

  describe('gerarRelatorio', () => {
    test('gerarRelatorio gera relatório com sucesso para paciente com dados TEA', async () => {
      const paciente = {
        id: '1',
        nome: 'João',
        dataNascimento: '01/01/2010',
        tea: {
          nivelSuporte: 'Nível 2',
          autonomia: 'Moderada',
          comunicacao: 'Verbal',
        },
      }
      const relatorioGerado = 'Relatório gerado com sucesso...'

      ;(prisma.paciente.findUnique as jest.Mock).mockResolvedValue(paciente)
      ;(gerarRelatorioIA as jest.Mock).mockResolvedValue(relatorioGerado)

      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await gerarRelatorio(req, res)

      expect(prisma.paciente.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { tea: true },
      })
      expect(gerarRelatorioIA).toHaveBeenCalledWith({
        nome: paciente.nome,
        dataNascimento: paciente.dataNascimento,
        tea: paciente.tea,
      })
      expect(res.json).toHaveBeenCalledWith({ relatorio: relatorioGerado })
    })

    test('gerarRelatorio retorna 404 quando paciente não encontrado', async () => {
      ;(prisma.paciente.findUnique as jest.Mock).mockResolvedValue(null)

      const req = mockRequest({}, { id: 'inexistente' })
      const res = mockResponse()

      await gerarRelatorio(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Paciente não encontrado' })
    })

    test('gerarRelatorio retorna 400 quando paciente não possui dados TEA', async () => {
      const paciente = {
        id: '1',
        nome: 'João',
        dataNascimento: '01/01/2010',
        tea: null,
      }

      ;(prisma.paciente.findUnique as jest.Mock).mockResolvedValue(paciente)

      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await gerarRelatorio(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Paciente não possui dados TEA para gerar relatório',
      })
    })

    test('gerarRelatorio retorna erro quando falha na geração', async () => {
      const paciente = {
        id: '1',
        nome: 'João',
        dataNascimento: '01/01/2010',
        tea: { nivelSuporte: 'Nível 2' },
      }
      const erro = new Error('Erro na API de IA')

      ;(prisma.paciente.findUnique as jest.Mock).mockResolvedValue(paciente)
      ;(gerarRelatorioIA as jest.Mock).mockRejectedValue(erro)

      const req = mockRequest({}, { id: '1' })
      const res = mockResponse()

      await gerarRelatorio(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro na API de IA' })
    })
  })
})
