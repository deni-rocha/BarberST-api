import { model, Schema } from "mongoose"

interface IService {
  nome: string
  descricao: string
  preco: string
}

const serviceSchema = new Schema<IService>({
  nome: { type: String, required: true, minlength: 4 },
  descricao: { type: String, required: true },
  preco: { type: String, required: true },
})

const User = model<IService>("Service", serviceSchema)

export default User
