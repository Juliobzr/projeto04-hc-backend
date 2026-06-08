import { cadastrar, login } from '../../src/controllers/authController'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

jest.mock('../../src/lib/prisma/client', () => {
  return {
    __esModule: true,
    default: {
      usuario: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    },
  }
})

jest.mock('bcryptjs')
jest.mock('jsonwebtoken')

import prisma from '../../src/lib/prisma/client'

function mockResponse() {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

function mockRequest(body: any = {}) {
  return { body } as any
}

describe('authController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
  })

  describe('cadastrar', () => {
    test('cadastrar cria um novo usuário com sucesso', async () => {
      const usuarioInput = { nome: 'João', email: 'joao@test.com', senha: '123456', role: 'FUNCIONARIO' }
      const usuarioComSenha = { ...usuarioInput, senha: 'hashed_password', id: 'user-1', criadoEm: new Date() }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password')
      ;(prisma.usuario.create as jest.Mock).mockResolvedValue(usuarioComSenha)

      const req = mockRequest(usuarioInput)
      const res = mockResponse()

      await cadastrar(req, res)

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({ where: { email: usuarioInput.email } })
      expect(bcrypt.hash).toHaveBeenCalledWith(usuarioInput.senha, 10)
      expect(prisma.usuario.create).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        id: usuarioComSenha.id,
        nome: usuarioComSenha.nome,
        email: usuarioComSenha.email,
        role: usuarioComSenha.role,
      })
    })

    test('cadastrar retorna erro se email já existe', async () => {
      const usuarioInput = { nome: 'João', email: 'joao@test.com', senha: '123456' }
      const usuarioExistente = { ...usuarioInput, id: 'user-1', role: 'FUNCIONARIO', criadoEm: new Date() }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(usuarioExistente)

      const req = mockRequest(usuarioInput)
      const res = mockResponse()

      await cadastrar(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Este e-mail já está cadastrado' })
    })

    test('cadastrar retorna erro se faltam campos', async () => {
      const usuarioInput = { nome: 'João', email: 'joao@test.com' }

      const req = mockRequest(usuarioInput)
      const res = mockResponse()

      await cadastrar(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Preencha todos os campos' })
    })

    test('cadastrar define role como GESTOR quando fornecido', async () => {
      const usuarioInput = { nome: 'Admin', email: 'admin@test.com', senha: '123456', role: 'GESTOR' }
      const usuarioCriado = { ...usuarioInput, id: 'user-1', criadoEm: new Date() }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password')
      ;(prisma.usuario.create as jest.Mock).mockResolvedValue(usuarioCriado)

      const req = mockRequest(usuarioInput)
      const res = mockResponse()

      await cadastrar(req, res)

      expect(prisma.usuario.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'GESTOR',
          }),
        })
      )
    })
  })

  describe('login', () => {
    test('login retorna token e usuário quando credenciais são corretas', async () => {
      const loginInput = { email: 'joao@test.com', senha: '123456' }
      const usuarioEncontrado = {
        id: 'user-1',
        nome: 'João',
        email: loginInput.email,
        senha: 'hashed_password',
        role: 'FUNCIONARIO',
      }
      const token = 'jwt_token_aqui'

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(usuarioEncontrado)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(jwt.sign as jest.Mock).mockReturnValue(token)

      const req = mockRequest(loginInput)
      const res = mockResponse()

      await login(req, res)

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({ where: { email: loginInput.email } })
      expect(bcrypt.compare).toHaveBeenCalledWith(loginInput.senha, usuarioEncontrado.senha)
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: usuarioEncontrado.id,
          email: usuarioEncontrado.email,
          role: usuarioEncontrado.role,
        }),
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      )
      expect(res.json).toHaveBeenCalledWith({
        token,
        usuario: {
          id: usuarioEncontrado.id,
          nome: usuarioEncontrado.nome,
          email: usuarioEncontrado.email,
          role: usuarioEncontrado.role,
        },
      })
    })

    test('login retorna erro quando usuário não encontrado', async () => {
      const loginInput = { email: 'inexistente@test.com', senha: '123456' }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null)

      const req = mockRequest(loginInput)
      const res = mockResponse()

      await login(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ erro: 'E-mail ou senha incorretos' })
    })

    test('login retorna erro quando senha está incorreta', async () => {
      const loginInput = { email: 'joao@test.com', senha: '123456' }
      const usuarioEncontrado = {
        id: 'user-1',
        nome: 'João',
        email: loginInput.email,
        senha: 'hashed_password',
        role: 'FUNCIONARIO',
      }

      ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(usuarioEncontrado)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const req = mockRequest(loginInput)
      const res = mockResponse()

      await login(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ erro: 'E-mail ou senha incorretos' })
    })

    test('login retorna erro se faltam campos', async () => {
      const req = mockRequest({ email: 'joao@test.com' })
      const res = mockResponse()

      await login(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ erro: 'Preencha e-mail e senha' })
    })
  })
})
