import "dotenv/config"
import express from "express"
import router from "./routes/index"
import verificarToken from "./middlewares/verificarToken/index"
import loaders from "./loaders/index"

// configurações
const app = express()
app.use(express.json())

// conectar banco de dados
loaders.startDB()

// rotas
app.use("/api", verificarToken, router)

// servidor
const porta = process.env.PORT || 3030
app.listen(porta, () => console.log(`http://localhost:${porta}`))
