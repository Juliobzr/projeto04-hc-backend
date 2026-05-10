import { Router } from "express"
import { buscarConfiguracoes, salvarConfiguracoes } from "../controllers/usuarioController"
import { autenticar } from "../middlewares/authMiddleware"

const router = Router()

router.use(autenticar)

router.get("/configuracoes", buscarConfiguracoes)
router.put("/configuracoes", salvarConfiguracoes)

export default router
