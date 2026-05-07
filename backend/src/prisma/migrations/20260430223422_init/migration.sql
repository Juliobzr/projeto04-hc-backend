-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracaoUsuario" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "numero" TEXT,
    "instituicao" TEXT,
    "cidade" TEXT,
    "pais" TEXT NOT NULL DEFAULT 'Brasil',
    "estado" TEXT NOT NULL DEFAULT 'PE',
    "foto" TEXT,

    CONSTRAINT "ConfiguracaoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nomeSocial" TEXT,
    "dataNascimento" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT,
    "nomeResponsavel" TEXT,
    "prontuario" TEXT,
    "cartaoSUS" TEXT,
    "especialidade" TEXT,
    "unidade" TEXT,
    "deficiencia" TEXT NOT NULL DEFAULT 'Não',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilTEA" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "nivelSuporte" TEXT,
    "autonomia" TEXT,
    "comunicacao" TEXT,
    "comunicacaoAlternativa" TEXT,
    "interacaoSocial" TEXT[],
    "fatoresDesregulacao" TEXT[],
    "dificuldadesSensoriais" TEXT[],
    "fatoresClinicos" TEXT[],
    "hiperfoco" TEXT,

    CONSTRAINT "PerfilTEA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracaoUsuario_usuarioId_key" ON "ConfiguracaoUsuario"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilTEA_pacienteId_key" ON "PerfilTEA"("pacienteId");

-- AddForeignKey
ALTER TABLE "ConfiguracaoUsuario" ADD CONSTRAINT "ConfiguracaoUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilTEA" ADD CONSTRAINT "PerfilTEA_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
