import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/authRoutes"
import pacienteRoutes from "./routes/pacienteRoutes"
import usuarioRoutes from "./routes/usuarioRoutes"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3333

// permite receber requisições do frontend Next.js
app.use(cors({ origin: ["http://localhost:3000", "https://projeto04-hc.vercel.app"], credentials: true }))

// limite maior por causa da foto em base64
app.use(express.json({ limit: "10mb" }))

// rotas
app.use("/api/auth", authRoutes)
app.use("/api/pacientes", pacienteRoutes)
app.use("/api/usuarios", usuarioRoutes)

// rota só pra checar se o servidor tá rodando
app.get("/", (req, res) => {
  res.json({ mensagem: "API HC Triagem rodando!" })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
