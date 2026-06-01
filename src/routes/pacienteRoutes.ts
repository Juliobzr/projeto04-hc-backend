import { Router } from "express"
import { listar, buscarPorId, buscarPorCpf, criar, atualizar, excluir, gerarRelatorio } from "../controllers/patientController"
import { autenticar } from "../middlewares/authMiddleware"

const router = Router()

// todas as rotas aqui exigem estar logado
router.use(autenticar)

router.get("/", listar)
router.get("/buscar", buscarPorCpf)
router.get("/:id", buscarPorId)
router.post("/", criar)
router.post("/:id/relatorio-ia", gerarRelatorio)
router.put("/:id", atualizar)
router.delete("/:id", excluir)

export default router
