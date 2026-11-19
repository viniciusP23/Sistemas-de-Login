import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();
const mongoURI = process.env.MONGO_URI
console.log(mongoURI ? "MONGO_URI carregada!" : "MONGO_URI não encontrada");

async function conectarBanco() {
    try {
        await mongoose.connect(mongoURI)
        console.log("MongoDB conectado com sucesso!")
    }catch(error) {
        console.error(error)
        throw error
    }
}

export default conectarBanco