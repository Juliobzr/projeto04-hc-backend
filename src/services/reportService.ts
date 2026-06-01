import { GoogleGenAI } from "@google/genai";

interface TEAData {
  nivelSuporte?: string;
  autonomia?: string;
  comunicacao?: string;
  comunicacaoAlternativa?: string;
  interacaoSocial?: string[];
  fatoresDesregulacao?: string[];
  dificuldadesSensoriais?: string[];
  fatoresClinicos?: string[];
  hiperfoco?: string;
}

interface PacienteData {
  nome: string;
  dataNascimento: string;
  tea?: TEAData;
}

const gemini = new GoogleGenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function gerarRelatorioIA(paciente: PacienteData): Promise<string> {
  if (!paciente.tea) {
    throw new Error("Paciente não possui dados TEA para gerar relatório");
  }

  const teaData = paciente.tea;
  const promptData = `
Paciente: ${paciente.nome}

Avaliação TEA:
- Nível de Suporte: ${teaData.nivelSuporte || "Não informado"}
- Autonomia: ${teaData.autonomia || "Não informado"}
- Comunicação: ${teaData.comunicacao || "Não informado"}
- Comunicação Alternativa: ${teaData.comunicacaoAlternativa || "Não informado"}
- Interação Social: ${teaData.interacaoSocial?.join(", ") || "Não informado"}
- Fatores de Desregulação: ${teaData.fatoresDesregulacao?.join(", ") || "Não informado"}
- Dificuldades Sensoriais: ${teaData.dificuldadesSensoriais?.join(", ") || "Não informado"}
- Fatores Clínicos: ${teaData.fatoresClinicos?.join(", ") || "Não informado"}
- Hiperfoco: ${teaData.hiperfoco || "Não informado"}
`;

  const message = await gemini.models.generateContent({
  model: "gemini-2.5-flash",
  contents: `Você é um assistente especializado em acessibilidade, acolhimento e atendimento de pacientes com necessidades específicas.

              Analise os dados fornecidos e gere uma FICHA DE ORIENTAÇÕES PARA ATENDIMENTO.

              REGRAS IMPORTANTES:

              * Utilize linguagem objetiva e profissional.
              * Retorne sempre exatamente o mesmo formato.
              * Não invente informações que não estejam presentes nos dados.
              * Quando uma informação não estiver disponível, escreva "Não informado".
              * Limite cada tópico a no máximo 3 itens.
              * A resposta completa deve ter no máximo 300 palavras.
              * O foco é orientar recepcionistas, enfermeiros, médicos e demais profissionais durante o atendimento.

              FORMATO OBRIGATÓRIO:

              ## RESUMO DO PACIENTE

              Breve resumo em 2 ou 3 frases.

              ## COMUNICAÇÃO

              * Item 1
              * Item 2
              * Item 3

              ## AUTONOMIA E SUPORTE

              * Item 1
              * Item 2
              * Item 3

              ## FATORES DE ATENÇÃO

              * Item 1
              * Item 2
              * Item 3

              ## ADAPTAÇÕES RECOMENDADAS

              * Item 1
              * Item 2
              * Item 3

              ## CONDUTA DA EQUIPE

              * Item 1
              * Item 2
              * Item 3

              DADOS DO PACIENTE:

              ${promptData}
              `,
});

  const textContent = message.text;
  if (!textContent) {
    throw new Error("Resposta vazia do Gemini");
  }

  return textContent;
}
