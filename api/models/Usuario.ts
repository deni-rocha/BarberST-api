import { model, Schema } from "mongoose"

export interface IUsuario {
  nome: string
  email: string
  senha: string
  permissao: string
}

const usuarioSchema = new Schema<IUsuario>({
  nome: { type: String, required: true, minlength: 4 },
  senha: { type: String, required: true },
  email: { type: String, required: true },
  permissao: {
    type: String,
    enum: ["ADMIN", "USUARIO"],
    default: "USUARIO",
    required: true,
  },
})

const User = model<IUsuario>("Usuario", usuarioSchema)

export default User
