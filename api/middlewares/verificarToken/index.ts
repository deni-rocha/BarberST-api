import { Request, Response, NextFunction } from "express"
import { verify } from "jsonwebtoken"

function verificarToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({
      msg: "Acesso negado!",
    })
  }

  try {
    const secret = process.env.SECRET

    verify(token, secret)

    next()
  } catch (err) {
    return res.status(400).json({ msg: "Token inválido!" })
  }
}

export default verificarToken
