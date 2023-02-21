import { Request, Response } from "express"
import Usuario from "../models/Usuario"

const usuario = {
  listarTodos: async (_req: Request, res: Response): Promise<Response> => {
    // verifica se usuário existe
    const usuario = await Usuario.find({})
    if (!usuario) {
      return res.status(404).json({
        msg: "Usuário não encontrado!",
      })
    }

    return res.status(200).json({
      usuario,
    })
  },
}

export default usuario
