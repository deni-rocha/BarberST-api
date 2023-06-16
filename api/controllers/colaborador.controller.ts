import { Request, Response } from "express"
import Colaborador, { IColaborador } from "../models/Colaborador"

const colaborador = {
  criar: async (req: Request, res: Response): Promise<void> => {
    const {
      nome,
      email,
      senha,
      sexo,
      dataDeNascimento,
      foto,
      horario,
      permissao,
    }: IColaborador = req.body

    // verificar se já existe agendamento marcado para esse horário
    const existeColaborador = await Colaborador.findOne({ email })

    if (existeColaborador) {
      console.log(existeColaborador)
      res
        .status(400)
        .send({ msg: "colaborador com esse email já foi cadastrado!" })
      return
    }
    try {
      await Colaborador.create({
        nome,
        email,
        senha,
        sexo,
        dataDeNascimento,
        foto,
        horario,
        permissao,
      })
      // HTTP Status 201: Created
      res.status(201).end()
    } catch (erro) {
      console.log(erro)
      // HTTP 500: Internal Server Error
      res.status(500).send(erro)
    }
  },
  listar: async (req: Request, res: Response): Promise<void> => {
    // verifica se usuário existe

    if (Object.keys(req.query).length > 0) {
      // Se houver query string
      busca(req, res)
    } else {
      // sem query string
      try {
        // find(), sem parâmetros, retorna todos
        // O parâmetro de populate() é o *ATRIBUTO* relacionado
        const lista = await Colaborador.find()
        res.send(lista) // HTTP 200 implícito
      } catch (erro) {
        console.log(erro)
        res.status(500).send(erro)
      }
    }
  },
  obterUm: async function (req: Request, res: Response): Promise<void> {
    const id = req.params.id
    const retorno = await obterUmInterno(id)

    if (retorno.status == 200) {
      if (retorno.result) res.send(retorno.result) // HTTP 200 implícito
      else res.status(404).end() // HTTP 404
    } else {
      res.status(500).send(retorno.result)
    }
  },
  atualizar: async function (req: Request, res: Response): Promise<void> {
    const id = req.body._id
    const retorno = await atualizarInterno(id, req.body)
    if (retorno.status == 500) {
      res.status(500).send(retorno.result)
    } else {
      res.status(retorno.status).end()
    }
  },
  excluir: async function (req: Request, res: Response): Promise<void> {
    try {
      const id = req.body._id

      // exclusão lógica
      const obj = await Colaborador.findByIdAndDelete(id)
      if (obj) {
        res.status(204).end()
      } else {
        res.status(404).end()
      }
    } catch (erro) {
      console.log(erro)
      res.status(500).send(erro)
    }
  },
}

async function busca(req: Request, res: Response): Promise<void> {
  const criterio = {}

  const atrib = Object.keys(req.query)[0]
  const valor = Object.values(req.query)[0]

  // $options: 'i' => case insensitive
  criterio[atrib] = { $regex: valor, $options: "i" }

  console.log("Critério:")
  console.log(criterio)

  try {
    const lista = await Colaborador.find(criterio)
    res.send(lista)
  } catch (erro) {
    console.log(erro)
    res.status(500).send(erro)
  }
}

async function obterUmInterno(id: string): Promise<{
  status: number
  result: object
}> {
  try {
    const obj = await Colaborador.findById(id)
    return { status: 200, result: obj }
  } catch (erro) {
    console.log(erro)
    return { status: 500, result: erro }
  }
}

async function atualizarInterno(
  id: string,
  body: object,
): Promise<{
  status: number
  result: object
}> {
  try {
    const obj = await Colaborador.findByIdAndUpdate(id, body)
    if (obj) {
      // obj encontrado e atualizado
      // HTTP 204: No content
      return { status: 204, result: undefined }
    } else {
      return { status: 404, result: undefined }
    }
  } catch (erro) {
    console.log(erro)
    return { status: 500, result: erro }
  }
}

export default colaborador
