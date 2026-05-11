import { Router } from "express"
import { cadastrar, login } from "../controllers/authController"

const router = Router()

router.post("/cadastrar", cadastrar)
router.post("/login", login)

export default router
