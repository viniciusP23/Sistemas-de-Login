import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();
const mongoURI = process.env.MONGO_URI
console.log(mongoURI ? "MONGO_URI carregada!" : "MONGO_URI não encontrada");

console.log("Usuário na URI:", mongoURI.match(/:\/\/([^:]+):/)?.[1]);
console.log("URI começa corretamente:", mongoURI.startsWith("mongodb://"));

async function conectarBanco() {
    try {
        await mongoose.connect(mongoURI)
        console.log("MongoDB conectado com sucesso!")
    }catch(error) {
        console.error(error)
    }
}

export default conectarBanco