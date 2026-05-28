import { Router } from "express"
import {
  buscarConfiguracoes,
  salvarConfiguracoes,
  listarFuncionarios,
  buscarFuncionarioPorId,
  cadastrarFuncionario,
  atualizarFuncionario,
  excluirFuncionario,
} from "../controllers/userController"
import { autenticar, autorizarRoles } from "../middlewares/authMiddleware"

const router = Router()

router.use(autenticar)

router.get("/configuracoes", autorizarRoles("GESTOR"), buscarConfiguracoes)
router.put("/configuracoes", autorizarRoles("GESTOR"), salvarConfiguracoes)

router.get("/funcionarios", autorizarRoles("GESTOR"), listarFuncionarios)
router.get("/funcionarios/:id", autorizarRoles("GESTOR"), buscarFuncionarioPorId)
router.post("/funcionarios", autorizarRoles("GESTOR"), cadastrarFuncionario)
router.put("/funcionarios/:id", autorizarRoles("GESTOR"), atualizarFuncionario)
router.delete("/funcionarios/:id", autorizarRoles("GESTOR"), excluirFuncionario)

export default router
