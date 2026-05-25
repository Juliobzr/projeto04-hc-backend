import { Request, Response } from "express";
import { cadastrar } from "./authController";
import prisma from "../lib/prisma/client";

// Simulamos (Mock) o Prisma para os testes não tocarem na base de dados
jest.mock("../lib/prisma/client", () => ({
  usuario: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

// Simulamos a encriptação de senha
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("senha_hasheada"),
}));

describe("AuthController - Cadastrar", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  // Antes de cada teste, limpamos os dados e preparamos os objetos falsos
  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    req = { body: {} };
    res = {
      status: statusMock,
      json: jsonMock,
    } as Partial<Response>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar erro 400 se faltarem campos obrigatórios", async () => {
    // Simulamos um envio de dados incompleto (falta email e senha)
    req.body = { nome: "João" }; 

    await cadastrar(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ erro: "Preencha todos os campos" });
  });

  it("deve criar o utilizador com sucesso e retornar 201", async () => {
    req.body = { nome: "João", email: "joao@email.com", senha: "123" };
    
    // Simulamos que o utilizador NÃO existe na base de dados
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);
    
    // Simulamos o retorno do Prisma ao criar o utilizador
    (prisma.usuario.create as jest.Mock).mockResolvedValue({
      id: "uuid-1234",
      nome: "João",
      email: "joao@email.com",
    });

    await cadastrar(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      id: "uuid-1234",
      nome: "João",
      email: "joao@email.com",
    });
  });
});