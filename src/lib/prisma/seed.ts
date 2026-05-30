import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const senhaHash = await bcrypt.hash("123456", 10)

  // Criar gestor
  const gestor = await prisma.usuario.create({
    data: {
      nome: "Administrador",
      email: "admin@email.com",
      senha: senhaHash,
      role: "GESTOR",
    },
  })

  console.log("✓ Gestor criado")

  // Criar pacientes fictícios
  const pacientes = [
    {
      nome: "João Silva",
      nomeSocial: null,
      dataNascimento: "15/05/2010",
      cpf: "12345678901",
      telefone: "(81) 98765-4321",
      nomeResponsavel: "Maria Silva",
      prontuario: "HC-2024-001",
      cartaoSUS: "123456789012345678",
      especialidade: "Pediatria",
      unidade: "HC Central",
      deficiencia: "TEA",
      tea: {
        nivelSuporte: "nivel2",
        autonomia: "parcial",
        comunicacao: "verbal_suporte",
        comunicacaoAlternativa: "Tablet com PECS",
        interacaoSocial: ["Interação atípica", "Evita contato visual"],
        fatoresDesregulacao: ["Espera prolongada", "Quebra de rotina"],
        dificuldadesSensoriais: ["Sensível a barulho", "Sensível a odores fortes"],
        fatoresClinicos: ["Distúrbios de Sono", "Rigidez Cognitiva"],
        hiperfoco: "Trens e ferrovias",
      },
    },
    {
      nome: "Ana Santos",
      nomeSocial: "Sofia",
      dataNascimento: "22/08/2008",
      cpf: "98765432109",
      telefone: "(81) 99123-5678",
      nomeResponsavel: "Carlos Santos",
      prontuario: "HC-2024-002",
      cartaoSUS: "987654321098765432",
      especialidade: "Neurologia",
      unidade: "HC Oeste",
      deficiencia: "TEA",
      tea: {
        nivelSuporte: "nivel1",
        autonomia: "independente",
        comunicacao: "verbal",
        comunicacaoAlternativa: null,
        interacaoSocial: ["Sem restrições"],
        fatoresDesregulacao: ["Ambiente novo"],
        dificuldadesSensoriais: ["Gosta de barulho"],
        fatoresClinicos: ["Alterações Motoras"],
        hiperfoco: "Astronomia e planetas",
      },
    },
    {
      nome: "Pedro Costa",
      nomeSocial: null,
      dataNascimento: "10/03/2015",
      cpf: "55544433221",
      telefone: "(81) 98888-1234",
      nomeResponsavel: "Ana Costa",
      prontuario: "HC-2024-003",
      cartaoSUS: "555444333221000111",
      especialidade: "Psiquiatria",
      unidade: "HC Sul",
      deficiencia: "TEA",
      tea: {
        nivelSuporte: "nivel3",
        autonomia: "total",
        comunicacao: "nao_verbal",
        comunicacaoAlternativa: "Gestos e apontamentos",
        interacaoSocial: ["Isolamento", "Interação atípica"],
        fatoresDesregulacao: ["Multidões", "Quebra de rotina", "Espera prolongada"],
        dificuldadesSensoriais: ["Sensível a barulho", "Aversão a toque físico", "Aversão a certos tecidos"],
        fatoresClinicos: ["Seletividade Alimentar", "Rigidez Cognitiva"],
        hiperfoco: "Números e sequências",
      },
    },
    {
      nome: "Lucas Ferreira",
      nomeSocial: null,
      dataNascimento: "18/11/2012",
      cpf: "11122233344",
      telefone: "(81) 97777-8888",
      nomeResponsavel: "Roberto Ferreira",
      prontuario: "HC-2024-004",
      cartaoSUS: "111222333440000555",
      especialidade: "Terapia Ocupacional",
      unidade: "HC Centro",
      deficiencia: "Não",
      tea: null,
    },
    {
      nome: "Mariana Oliveira",
      nomeSocial: "Mari",
      dataNascimento: "07/06/2011",
      cpf: "99988877766",
      telefone: "(81) 98765-0000",
      nomeResponsavel: "Juliana Oliveira",
      prontuario: "HC-2024-005",
      cartaoSUS: "999888777660000111",
      especialidade: "Fonoaudiologia",
      unidade: "HC Leste",
      deficiencia: "TEA",
      tea: {
        nivelSuporte: "nivel2",
        autonomia: "parcial",
        comunicacao: "nao_verbal",
        comunicacaoAlternativa: "AAC com símbolos",
        interacaoSocial: ["Interação atípica"],
        fatoresDesregulacao: ["Quebra de rotina", "Espera prolongada"],
        dificuldadesSensoriais: ["Sensível a odores fortes", "Temperatura"],
        fatoresClinicos: ["Seletividade Alimentar"],
        hiperfoco: "Animais domésticos",
      },
    },
    {
      nome: "Gabriel Mendes",
      nomeSocial: null,
      dataNascimento: "25/02/2014",
      cpf: "44455566677",
      telefone: "(81) 99999-4444",
      nomeResponsavel: "Fernanda Mendes",
      prontuario: "HC-2024-006",
      cartaoSUS: "444555666770000222",
      especialidade: "Psicologia",
      unidade: "HC Norte",
      deficiencia: "Não",
      tea: null,
    },
  ]

  for (const pacienteData of pacientes) {
    const { tea, ...pacienteInfo } = pacienteData
    const paciente = await prisma.paciente.create({
      data: {
        ...pacienteInfo,
        usuarioId: gestor.id,
      },
    })

    if (tea) {
      await prisma.perfilTEA.create({
        data: {
          pacienteId: paciente.id,
          ...tea,
        },
      })
    }

    console.log(`✓ Paciente criado: ${paciente.nome}`)
  }

  console.log("\n✓ Seed concluído com sucesso!")
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })