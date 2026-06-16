import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HC Triagem API",
      version: "1.0.0",
      description:
        "API para gerenciamento de pacientes, usuários e triagem TEA",
    },

    servers: [
      {
        url: "https://projeto04-hc-backend.onrender.com",
        description: "Produção",
      },
      {
        url: "http://localhost:3333",
        description: "Desenvolvimento",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    paths: {
      "/api/auth/cadastrar": {
        post: {
          tags: ["Auth"],
          summary: "Cadastrar usuário",
          responses: {
            "201": {
              description: "Usuário cadastrado com sucesso",
            },
          },
        },
      },

      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Realizar login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: {
                      type: "string",
                      example: "admin@hc.com",
                    },
                    senha: {
                      type: "string",
                      example: "123456",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Login realizado com sucesso",
            },
            "401": {
              description: "Credenciais inválidas",
            },
          },
        },
      },

      "/api/pacientes": {
        get: {
          tags: ["Pacientes"],
          summary: "Listar pacientes",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Lista de pacientes",
            },
          },
        },

        post: {
          tags: ["Pacientes"],
          summary: "Cadastrar paciente",
          security: [{ bearerAuth: [] }],
          responses: {
            "201": {
              description: "Paciente criado",
            },
          },
        },
      },

      "/api/pacientes/buscar": {
        get: {
          tags: ["Pacientes"],
          summary: "Buscar paciente por CPF",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "cpf",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Paciente encontrado",
            },
          },
        },
      },

      "/api/pacientes/{id}": {
        get: {
          tags: ["Pacientes"],
          summary: "Buscar paciente por ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Paciente encontrado",
            },
            "404": {
              description: "Paciente não encontrado",
            },
          },
        },

        put: {
          tags: ["Pacientes"],
          summary: "Atualizar paciente",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Paciente atualizado",
            },
          },
        },

        delete: {
          tags: ["Pacientes"],
          summary: "Excluir paciente",
          security: [{ bearerAuth: [] }],
          responses: {
            "204": {
              description: "Paciente removido",
            },
          },
        },
      },

      "/api/pacientes/{id}/relatorio-ia": {
        post: {
          tags: ["Pacientes"],
          summary: "Gerar relatório IA",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Relatório gerado",
            },
          },
        },
      },

      "/api/usuarios/configuracoes": {
        get: {
          tags: ["Usuários"],
          summary: "Buscar configurações",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Configurações encontradas",
            },
          },
        },

        put: {
          tags: ["Usuários"],
          summary: "Salvar configurações",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Configurações atualizadas",
            },
          },
        },
      },

      "/api/usuarios/funcionarios": {
        get: {
          tags: ["Funcionários"],
          summary: "Listar funcionários",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Lista de funcionários",
            },
          },
        },

        post: {
          tags: ["Funcionários"],
          summary: "Cadastrar funcionário",
          security: [{ bearerAuth: [] }],
          responses: {
            "201": {
              description: "Funcionário criado",
            },
          },
        },
      },

      "/api/usuarios/funcionarios/{id}": {
        get: {
          tags: ["Funcionários"],
          summary: "Buscar funcionário por ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Funcionário encontrado",
            },
          },
        },

        put: {
          tags: ["Funcionários"],
          summary: "Atualizar funcionário",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Funcionário atualizado",
            },
          },
        },

        delete: {
          tags: ["Funcionários"],
          summary: "Excluir funcionário",
          security: [{ bearerAuth: [] }],
          responses: {
            "204": {
              description: "Funcionário removido",
            },
          },
        },
      },
    },
  },

  apis: [],
};

export default swaggerJsdoc(options);