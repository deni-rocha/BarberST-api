import { Router } from "express"
import usuario from "../controllers/usuario.controller"

const router = Router()

router.get("/usuario", usuario.listarTodos)

export default router
