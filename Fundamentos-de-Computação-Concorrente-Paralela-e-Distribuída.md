#### Equipe
 - Jonas de Lima Neto - jln@cesar.school
 - Luiz Henrique da silva neves - lhsn@cesar.school
 - Matheus José Cardoso Luna - mjcl@cesar.school
 - João Eduardo Monteiro Cavalcanti - jemc@cesar.school
 - Glauco Santos Seixas Cerqueira - gssc@cesar.school
 - Francisco Italo Machado Dantas - fimd@cesar.school
 - Julio Bezerra Coelho - jbc@cesar.school
 - Leonardo Felipe Demétrio Lins Nascimento - lfdln@cesar.school

## 1. ARQUITETURA DISTRIBUÍDA
#### Justificativa da Arquitetura

1. **Separação de Responsabilidades:** Frontend e Backend completamente desacoplados, permitindo evolução independente
2. **Escalabilidade:** Backend stateless (JWT) pode ser replicado facilmente
3. **Integração de IA:** Utiliza APIs externas (Google Gemini) para gerar relatórios automaticamente
4. **Segurança:** Autenticação e autorização centralizadas no backend

### Comunicação Entre Componentes

1. Frontend → Backend
   - Método: HTTP REST
   - Autenticação: Bearer Token (JWT)
   - Content-Type: application/json
   - Exemplo: POST /api/pacientes

2. Backend → PostgreSQL
   - Método: SQL (via Prisma Client)
   - Conexão: TCP Pool
   - Exemplo: await prisma.paciente.findMany()

3. Backend → Google Gemini API
   - Método: HTTPS REST
   - Autenticação: API Key
   - Formato: JSON
   - Uso: Geração de relatórios IA

## 2. DESENHO DA ARQUITETURA
- <img width="638" height="1600" alt="image" src="https://github.com/user-attachments/assets/ee66f603-0e88-4abc-be17-43413937b6ce" />
#### Componentes Identificados

**Backend:**
```
projeto04-hc-backend/
├── src/
│   ├── server.ts              (Entrada principal)
│   ├── controllers/           (Lógica de requisição)
│   │   ├── authController.ts
│   │   ├── patientController.ts
│   │   └── userController.ts
│   ├── services/              (Lógica de negócio)
│   │   └── reportService.ts   (Integração com IA)
│   ├── middlewares/           (Autenticação/Autorização)
│   │   └── authMiddleware.ts
│   ├── routes/                (Endpoints)
│   │   ├── authRoutes.ts
│   │   ├── pacienteRoutes.ts
│   │   └── usuarioRoutes.ts
│   └── lib/
│       └── prisma/            (ORM e BD)
│           ├── client.ts
│           ├── schema.prisma
│           └── migrations/
```

**Frontend:**
```
projeto04-hc/
├── src/
│   ├── app/                   (Páginas/Rotas)
│   │   ├── login/
│   │   ├── admin/
│   │   ├── pacientes/
│   │   ├── nova-triagem/
│   │   ├── configuracoes/
│   │   └── inicio/
│   ├── components/            (Componentes React)
│   ├── hooks/                 (Lógica customizada)
│   ├── services/              (Requisições API)
│   │   ├── patients.ts
│   │   ├── auth.ts
│   │   └── users.ts
│   ├── types/                 (TypeScript types)
│   ├── lib/
│   │   └── apiClient.ts       (Cliente HTTP)
│   └── constants/
└── package.json
```

## 3. CONCORRÊNCIA E PARALELISMO
#### Mecanismos de Concorrência Identificados

##### 1. **Async/Await (Corrotinas)**
// Backend - src/controllers/patientController.ts
export async function listar(req: Request, res: Response) {
  try {
    const pacientes = await prisma.paciente.findMany({
      include: { tea: true },
      orderBy: { criadoEm: "desc" },
    })
    return res.json(pacientes)
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar pacientes" })
  }
}
**Benefício:** Evita bloqueio de thread durante operações I/O (BD, rede)

##### 2. **Event Loop do Node.js**

**Como funciona:**
```
Node.js (Single-threaded Event Loop)
├─ Request 1: Autenticação + Busca BD
├─ Request 2: Listar pacientes
├─ Request 3: Gerar relatório IA
└─ ... (múltiplas requisições processadas concorrentemente)

Enquanto Request 1 aguarda BD, 
Node.js processa Request 2 e 3
```

**Arquivo:** `src/server.ts` (usa Express, que gerencia o event loop)

```typescript
import express from "express"
const app = express()
const PORT = process.env.PORT || 3333

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
```
## 4. OTIMIZAÇÃO
#### A. OTIMIZAÇÕES IMPLEMENTADAS
##### 1. **ORM com Queries Otimizadas (Prisma)**

**Implementado:** `src/lib/prisma/schema.prisma` + Controllers

```typescript
// Usa include para evitar múltiplas queries
const pacientes = await prisma.paciente.findMany({
  include: { tea: true },  // Busca relacionamento em 1 query
  orderBy: { criadoEm: "desc" }  // Ordenação no BD
})

// Busca apenas um por ID
const paciente = await prisma.paciente.findUnique({
  where: { id },
  include: { tea: true }
})

// Busca com filtro (case-insensitive em CPF)
const pacientes = await prisma.paciente.findMany({
  where: {
    cpf: { contains: String(cpf) }  // Filtro no BD
  }
})
```

**Impacto:** Reduz número de queries ao banco, melhora tempo de resposta

##### 2. **Autenticação Stateless (JWT)**

**Implementado:** `src/middlewares/authMiddleware.ts`

```typescript
export function autenticar(req: Request, res: Response, next: NextFunction) {
  const token = authHeader.split(" ")[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    // Sem necessidade de sessão em servidor
    next()
  } catch {
    return res.status(401).json({ erro: "Token inválido" })
  }
}
```

**Impacto:** 
- Permite horizontal scaling (múltiplos servidores)
- Reduz uso de memória
- Melhor escalabilidade

##### 3. **CORS Configurado (Apenas Frontend Autorizado)**

**Implementado:** `src/server.ts`

```typescript
app.use(cors({ 
  origin: ["http://localhost:3000", "https://projeto04-hc.vercel.app"],
  credentials: true 
}))
```

**Impacto:** Segurança + reduz requisições não autorizadas
