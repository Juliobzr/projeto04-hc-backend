import {
  buscarConfiguracoes,
  salvarConfiguracoes,
  listarFuncionarios,
  buscarFuncionarioPorId,
  cadastrarFuncionario,
} from '../../src/controllers/userController'

jest.mock('../../src/lib/prisma/client', () => {
  return {
    __esModule: true,
    default: {
      usuario: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      configuracaoUsuario: {
        upsert: jest.fn(),
      },
    },
  }
})

jest.mock('bcryptjs')

import prisma from '../../src/lib/prisma/client'
import bcrypt from 'bcryptjs'

function mockResponse() {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

function mockRequest(body: any = {}, params: any = {}) {
  return { body, params } as any
}

describe('userController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('buscarConfiguracoes', () => {
    test('buscarConfiguracoes retorna configurações do usuário logado', async () => {
      const usuarioLogado = { id: 'user-1' }
      const usuario = {
        id: usuarioLogado.id,
        nome: 'João Silva',
        email: 'joao@test.com',
        configuracao: {
          numero: '123456',
          instituicao: 'Hospital XYZ',
          cidade: 'São Paulo',
          pais: 'Brasil',
          estado: 'SP',
          foto: 'url_foto',
        },
      }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(usuario)

      const req = mockRequest({ usuarioLogado })
      const res = mockResponse()

      await buscarConfiguracoes(req, res)

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: usuarioLogado.id },
        include: { configuracao: true },
      })
      expect(res.json).toHaveBeenCalledWith({
        nome: usuario.nome,
        email: usuario.email,
        ...usuario.configuracao,
      })
    })

    test('buscarConfiguracoes retorna erro quando usuário não encontrado', async () => {
      const usuarioLogado = { id: 'user-inexistente' }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null)

      const req = mockRequest({ usuarioLogado })
      const res = mockResponse()

      await buscarConfiguracoes(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao buscar configurações' })
    })
  })

  describe('salvarConfiguracoes', () => {
    test('salvarConfiguracoes atualiza nome, email e configurações extras', async () => {
      const usuarioLogado = { id: 'user-1' }
      const body = {
        usuarioLogado,
        nome: 'João Silva Updated',
        email: 'joao.updated@test.com',
        numero: '654321',
        instituicao: 'Hospital Updated',
        cidade: 'Rio de Janeiro',
        pais: 'Brasil',
        estado: 'RJ',
        foto: 'url_foto_atualizada',
      }
      const configuracoesAtualizadas = {
        usuarioId: usuarioLogado.id,
        numero: body.numero,
        instituicao: body.instituicao,
        cidade: body.cidade,
        pais: body.pais,
        estado: body.estado,
        foto: body.foto,
      }

      ;(prisma.usuario.update as jest.Mock).mockResolvedValue({})
      ;(prisma.configuracaoUsuario.upsert as jest.Mock).mockResolvedValue(configuracoesAtualizadas)

      const req = mockRequest(body)
      const res = mockResponse()

      await salvarConfiguracoes(req, res)

      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: usuarioLogado.id },
        data: { nome: body.nome, email: body.email },
      })
      expect(prisma.configuracaoUsuario.upsert).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith(configuracoesAtualizadas)
    })
  })

  describe('listarFuncionarios', () => {
    test('listarFuncionarios retorna lista de funcionários ordenada por data de criação', async () => {
      const funcionarios = [
        { id: 'user-1', nome: 'João', email: 'joao@test.com', role: 'FUNCIONARIO', criadoEm: new Date() },
        { id: 'user-2', nome: 'Ana', email: 'ana@test.com', role: 'GESTOR', criadoEm: new Date() },
      ]

      ;(prisma.usuario.findMany as jest.Mock).mockResolvedValue(funcionarios)

      const req = mockRequest()
      const res = mockResponse()

      await listarFuncionarios(req, res)

      expect(prisma.usuario.findMany).toHaveBeenCalledWith({
        orderBy: { criadoEm: 'desc' },
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          criadoEm: true,
        },
      })
      expect(res.json).toHaveBeenCalledWith(funcionarios)
    })

    test('listarFuncionarios retorna erro quando falha', async () => {
      ;(prisma.usuario.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const req = mockRequest()
      const res = mockResponse()

      await listarFuncionarios(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao listar funcionários' })
    })
  })

  describe('buscarFuncionarioPorId', () => {
    test('buscarFuncionarioPorId retorna funcionário específico', async () => {
      const funcionario = {
        id: 'user-1',
        nome: 'João',
        email: 'joao@test.com',
        role: 'FUNCIONARIO',
        criadoEm: new Date(),
      }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(funcionario)

      const req = mockRequest({}, { id: 'user-1' })
      const res = mockResponse()

      await buscarFuncionarioPorId(req, res)

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          criadoEm: true,
        },
      })
      expect(res.json).toHaveBeenCalledWith(funcionario)
    })

    test('buscarFuncionarioPorId retorna 404 quando funcionário não existe', async () => {
      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null)

      const req = mockRequest({}, { id: 'user-inexistente' })
      const res = mockResponse()

      await buscarFuncionarioPorId(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Funcionário não encontrado' })
    })
  })

  describe('cadastrarFuncionario', () => {
    test('cadastrarFuncionario cria novo funcionário com sucesso', async () => {
      const novoFuncionario = {
        nome: 'Carlos',
        email: 'carlos@test.com',
        senha: '123456',
        role: 'FUNCIONARIO',
      }
      const funcionarioCriado = {
        id: 'user-3',
        ...novoFuncionario,
        criadoEm: new Date(),
      }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password')
      ;(prisma.usuario.create as jest.Mock).mockResolvedValue(funcionarioCriado)

      const req = mockRequest(novoFuncionario)
      const res = mockResponse()

      await cadastrarFuncionario(req, res)

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: novoFuncionario.email },
      })
      expect(bcrypt.hash).toHaveBeenCalledWith(novoFuncionario.senha, 10)
      expect(prisma.usuario.create).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(201)
    })

    test('cadastrarFuncionario retorna erro se email já existe', async () => {
      const novoFuncionario = {
        nome: 'Carlos',
        email: 'carlos@test.com',
        senha: '123456',
      }
      const funcionarioExistente = { id: 'user-1', ...novoFuncionario }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(funcionarioExistente)

      const req = mockRequest(novoFuncionario)
      const res = mockResponse()

      await cadastrarFuncionario(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Este e-mail já está cadastrado' })
    })

    test('cadastrarFuncionario retorna erro se faltam campos', async () => {
      const novoFuncionario = {
        nome: 'Carlos',
        email: 'carlos@test.com',
      }

      const req = mockRequest(novoFuncionario)
      const res = mockResponse()

      await cadastrarFuncionario(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Preencha todos os campos' })
    })
  })
})
