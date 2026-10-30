import express from "express"
import User from "./models/User.js"
import conectarBanco from "./db.js"

const app = express()
app.use(express.json())


// Listar Usuários
app.get("/usuarios", async (req, res) => {
    const usuarios = await User.find()
    res.json(usuarios)
})

// Listar Usuário pelo ID
app.get("/usuarios/:id", async (req, res) => {
    const id = req.params.id
    const buscarId = await User.findById(id)

    if (!buscarId) {
        return res.status(404).json({ Error: "Erro ao encontrar Usuário" })
    }

    res.json(buscarId)
})

// Criar Usuário
app.post("/usuarios", async (req, res) => {
    const user = req.body

    // Validar o cadastro campo nome
    if (!user.nome || typeof user.nome !== "string" || user.nome.trim() === "") {
        return res.status(400).json({ Error: "Nome inválido" })
    }

    // Validar o cadastro campo email
    if (!user.email || typeof user.email !== "string" || user.email.trim() === "") {
        return res.status(400).json({ Error: "E-mail inválido" })
    }

    if (!user.email.includes("@")) {
        return res.status(400).json({ Error: " '@' é obrigatório no E-mail" })
    }

    const novoUsuario = await User.create(user)

    res.status(201).json(novoUsuario)
})

// Atualizar Usuário
app.put("/usuarios/:id", async (req, res) => {
    const id = req.params.id
    const dados = req.body
   

    const atualizarId = await User.findByIdAndUpdate(
        id,
        dados,
        { new: true, runValidators: true }
    )
    
    res.status(200).json(atualizarId)
})

// Deletar Usuário
app.delete("/usuarios/:id", async (req, res) => {
    const id = req.params.id
    const deletarUser = await User.findByIdAndDelete(id)

    if(!deletarUser) {
        return res.status(404).json({Error: "Erro ao encontrar Usuário"})
    }

    res.status(200).json(deletarUser)
})


async function conectarServer() {
    await conectarBanco()
    app.listen(3000, console.log("Servidor Conectado..."))
}

conectarServer()