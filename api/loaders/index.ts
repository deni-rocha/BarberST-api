import mongoose from "mongoose"

const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

const loaders = {
  startDB: async (): Promise<void> => {
    try {
      mongoose.set("strictQuery", true)

      await mongoose.connect(
        `mongodb+srv://${dbUser}:${dbPassword}@cluster0.sq7oujl.mongodb.net/barberST?retryWrites=true&w=majority`,
      )

      console.log("banco conectado")
    } catch (error) {
      console.log("banco não conectado", error)
    }
  },
}

export default loaders
