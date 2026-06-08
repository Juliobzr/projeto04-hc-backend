import { gerarRelatorioIA } from '../../src/services/reportService'

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: jest.fn(),
      },
    })),
  }
})

import { GoogleGenAI } from '@google/genai'

describe('reportService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('gerarRelatorioIA deve gerar relatório com todos os dados TEA', async () => {
    const pacienteData = {
      nome: 'João Silva',
      dataNascimento: '01/01/2010',
      tea: {
        nivelSuporte: 'Nível 2',
        autonomia: 'Moderada',
        comunicacao: 'Verbal',
        comunicacaoAlternativa: 'PECS',
        interacaoSocial: ['Dificuldade em iniciar interações', 'Preferência por atividades solitárias'],
        fatoresDesregulacao: ['Ruídos altos', 'Mudanças de rotina'],
        dificuldadesSensoriais: ['Sensibilidade auditiva', 'Sensibilidade tátil'],
        fatoresClinicos: ['Epilepsia', 'Distúrbio do sono'],
        hiperfoco: 'Tecnologia',
      },
    }

    const relatorioMock = 'Relatório gerado com sucesso pelo modelo Gemini...'

    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () => relatorioMock,
      },
    })

    const mockGemini = {
      models: {
        generateContent: mockGenerateContent,
      },
    }

    ;(GoogleGenAI as jest.Mock).mockReturnValue(mockGemini)

    const resultado = await gerarRelatorioIA(pacienteData)

    expect(GoogleGenAI).toHaveBeenCalledWith({
      apiKey: process.env.OPENAI_API_KEY,
    })
    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-2.5-flash',
      contents: expect.any(String),
    })
    expect(resultado).toBe(relatorioMock)
  })

  test('gerarRelatorioIA deve lançar erro quando paciente não possui dados TEA', async () => {
    const pacienteData = {
      nome: 'João Silva',
      dataNascimento: '01/01/2010',
      tea: undefined,
    }

    await expect(gerarRelatorioIA(pacienteData)).rejects.toThrow(
      'Paciente não possui dados TEA para gerar relatório'
    )
  })

  test('gerarRelatorioIA deve lidar com dados TEA parciais', async () => {
    const pacienteData = {
      nome: 'Ana Silva',
      dataNascimento: '02/02/2012',
      tea: {
        nivelSuporte: 'Nível 1',
      },
    }

    const relatorioMock = 'Relatório com dados mínimos...'

    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () => relatorioMock,
      },
    })

    const mockGemini = {
      models: {
        generateContent: mockGenerateContent,
      },
    }

    ;(GoogleGenAI as jest.Mock).mockReturnValue(mockGemini)

    const resultado = await gerarRelatorioIA(pacienteData)

    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-2.5-flash',
      contents: expect.stringContaining('Nível de Suporte: Nível 1'),
    })
    expect(resultado).toBe(relatorioMock)
  })

  test('gerarRelatorioIA deve lançar erro quando a API falha', async () => {
    const pacienteData = {
      nome: 'Carlos Silva',
      dataNascimento: '03/03/2015',
      tea: {
        nivelSuporte: 'Nível 2',
        autonomia: 'Moderada',
      },
    }

    const mockGenerateContent = jest.fn().mockRejectedValue(new Error('API Error: Rate limit exceeded'))

    const mockGemini = {
      models: {
        generateContent: mockGenerateContent,
      },
    }

    ;(GoogleGenAI as jest.Mock).mockReturnValue(mockGemini)

    await expect(gerarRelatorioIA(pacienteData)).rejects.toThrow('API Error: Rate limit exceeded')
  })

  test('gerarRelatorioIA deve incluir informações corretas no prompt', async () => {
    const pacienteData = {
      nome: 'Maria Santos',
      dataNascimento: '10/10/2008',
      tea: {
        nivelSuporte: 'Nível 3',
        autonomia: 'Suporte total',
        comunicacao: 'Não-verbal',
        interacaoSocial: ['Isolamento social'],
      },
    }

    const relatorioMock = 'Relatório personalizado...'

    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () => relatorioMock,
      },
    })

    const mockGemini = {
      models: {
        generateContent: mockGenerateContent,
      },
    }

    ;(GoogleGenAI as jest.Mock).mockReturnValue(mockGemini)

    await gerarRelatorioIA(pacienteData)

    const callArgs = mockGenerateContent.mock.calls[0][0]
    expect(callArgs.contents).toContain(pacienteData.nome)
    expect(callArgs.contents).toContain('Nível de Suporte: Nível 3')
    expect(callArgs.contents).toContain('Comunicação: Não-verbal')
    expect(callArgs.contents).toContain('Isolamento social')
  })
})
