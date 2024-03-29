import { Request, Response } from "express"
import Agendamento from "../models/Agendamento"
import Horario from "../models/Horario"
import { hourToMinutes, sliceMinutes } from "../util/index"

const horario = {
  criar: async (req: Request, res: Response): Promise<void> => {
    const { dias, inicio, fim } = req.body

    const horarios = sliceMinutes(inicio, fim)

    try {
      await Horario.create({
        dias,
        horarios,
      })
      // HTTP Status 201: Created
      res.status(201).end()
    } catch (erro) {
      console.log(erro)
      // HTTP 500: Internal Server Error
      res.status(500).send(erro)
    }
  },
  listar: async function (_req: Request, res: Response): Promise<void> {
    try {
      const lista = await Horario.find({})
      res.send(lista) // HTTP 200 implícito
    } catch (erro) {
      console.log(erro)
      res.status(500).send(erro)
    }
  },
  obterUm: async function (req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id
      const obj = await Horario.findById(id)
      if (obj) {
        // obj foi encontrado
        res.send(obj) // HTTP 200
      } else {
        // HTTP 404: Not found
        res.status(404).end()
      }
    } catch (erro) {
      console.log(erro)
      res.status(500).send(erro)
    }
  },
  atualizar: async function (req: Request, res: Response): Promise<void> {
    try {
      const id = req.body._id
      const obj = await Horario.findByIdAndUpdate(id, req.body)
      if (obj) {
        // obj foi encontrado e atualizado
        // HTTP 204: No content
        res.status(204).end()
      } else {
        res.status(404).end()
      }
    } catch (erro) {
      console.log(erro)
      res.status(500).send(erro)
    }
  },
  excluir: async function (req: Request, res: Response): Promise<void> {
    try {
      const id = req.body._id
      const obj = await Horario.findOneAndDelete(id)
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

  datasDisponiveis: async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id

    if (!id) res.json({ message: "necessário passar o id" })

    const dataAtual = new Date()
    const dataAtualFixa = dataAtual.toLocaleDateString("pt-br", {
      timeZone: "America/Sao_Paulo",
    })
    const dataAtualFixaHora = dataAtual.toLocaleTimeString("pt-br", {
      hour: "numeric",
      minute: "numeric",
      timeZone: "America/Sao_Paulo",
    })

    // agenda que terá os próximos 7 dias com seus respectivos horários disponiveis
    const agenda = [{}]
    const quantidadeDia = 7

    // obtém os horarios cadastrados no banco
    const horario = await Horario.findById(id)

    // verificar se já existe agendamento marcado para esse horário
    const existeAgendamento = await Agendamento.find({
      data: { $gte: dataAtual },
    })

    while (agenda.length <= quantidadeDia) {
      let horariosDoDia: string[] = []
      const weekdayName = dataAtual.toLocaleDateString("pt-br", {
        weekday: "long",
      })

      // verifica se o dia da semana está cadastrado
      const diaIncluso = horario?.dias.includes(weekdayName)

      if (diaIncluso) {
        const opcoesFormato: Intl.DateTimeFormatOptions = {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        }

        // data com o formato em inglês
        const dateFormatEn = dataAtual.toLocaleDateString(
          "en-US",
          opcoesFormato,
        )

        // data com o formato brasileiro
        const dateFormatPtBr = dataAtual.toLocaleDateString("pt-br", {
          ...opcoesFormato,
        })

        existeAgendamento.forEach((objAgendamento) => {
          // formatando a data para string
          const dateAgendamentoEn = objAgendamento.data.toLocaleDateString(
            "en-US",
            opcoesFormato,
          )

          if (dateAgendamentoEn === dateFormatEn) {
            const dateAgendamentoHour = objAgendamento.data.toLocaleTimeString(
              "pt-br",
              { hour: "numeric", minute: "numeric" },
            )

            horario?.horarios.forEach((h) => {
              // para evitar o duplicamento das horas no array
              if (horariosDoDia.length === horario.horarios.length) {
                const novoHorariosDoDia = horariosDoDia.map((hora) =>
                  hora === dateAgendamentoHour ? "-" : hora,
                )
                horariosDoDia = novoHorariosDoDia
              } else {
                h !== dateAgendamentoHour
                  ? horariosDoDia.push(h)
                  : horariosDoDia.push("-")
              }
            })
          }
        })

        // caso não tenha horário agendado no dia, adicionamos o horário completo sem alterações
        const listaHorarios = horariosDoDia.length
          ? horariosDoDia
          : horario?.horarios

        // adicionando os horarios na agenda
        agenda.push({
          // criando objeto com data e horas
          [dateFormatPtBr]: listaHorarios,
        })
      }

      // atualiza a data
      dataAtual.setHours(24)
    }

    // atualiza a agenda comparando com o horário atual
    const updateAgenda = agenda.map((obj) => {
      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(dataAtualFixa)) {
        return {
          [dataAtualFixa]: obj[dataAtualFixa].map((h: string) => {
            const horaInt = hourToMinutes(h)
            const horaAtualInt = hourToMinutes(dataAtualFixaHora)
            return horaInt <= horaAtualInt ? "-" : h
          }),
        }
      }

      return obj
    })

    // remove o primeiro elemento do array que neste caso é um objeto vazio
    updateAgenda.shift()

    res.send(updateAgenda)
  },
}

export default horario
