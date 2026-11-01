import express from "express"
import mongoose from "mongoose"
import bcrypt from "bcrypt"

import User from "./models/User.js"
import conectarBanco from "./db.js"

const app = express()
app.use(express.json())


// Listar Usuários
app.get("/usuarios", async (req, res) => {
    try {
        const usuarios = await User.find()
        res.json(usuarios)

    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: "Erro ao listar Usuários." })
    }
})

// Listar Usuário pelo ID
app.get("/usuarios/:id", async (req, res) => {
    try {
        const id = req.params.id

        // Indetificar IDs inválidos
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ Error: "ID no formato inválido." })
        }

        const buscarId = await User.findById(id)

        if (!buscarId) {
            return res.status(404).json({ Error: "Erro ao encontrar Usuário" })
        }

        res.json(buscarId)

    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: "Erro ao buscar Usuário." })
    }
})

// Criar Usuário
app.post("/usuarios", async (req, res) => {
    try {
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

        // implementar a criptografia 
        const senhaHash = await bcrypt.hash(user.senha, 10)

        const novoUsuario = await User.create({
            ...user,
            senha: senhaHash
        })

        res.status(201).json(novoUsuario)

    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: "Erro ao criar Usuário." })
    }
})

// Atualizar Usuário
app.put("/usuarios/:id", async (req, res) => {
    try {
        const id = req.params.id
        const dados = req.body

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ Error: "ID no formato inválido." })
        }

        const atualizarId = await User.findByIdAndUpdate(
            id,
            dados,
            { new: true, runValidators: true }
        )

        if (!atualizarId) {
            return res.status(404).json({ Error: "Usuário não encontrado." })
        }

        res.status(200).json(atualizarId)

    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: "Erro ao atualizar Usuário." })
    }
})

// Deletar Usuário
app.delete("/usuarios/:id", async (req, res) => {
    try {
        const id = req.params.id

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ Error: "ID no formato inválido." })
        }

        const deletarUser = await User.findByIdAndDelete(id)

        if (!deletarUser) {
            return res.status(404).json({ Error: "Erro ao encontrar Usuário" })
        }

        res.status(200).json(deletarUser)

    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: "Erro ao deletar Usuário." })
    }
})

// Login do Usuário
app.post("/login", async (req, res) => {
    try {
        const user = req.body

        const buscarUsuario = await User.findOne({ email: user.email })

        if (!buscarUsuario) {
            return res.status(404).json({ Error: 'Usuário não encontrado' })
        }

        const senhaCorreta = await bcrypt.compare(
            user.senha,
            buscarUsuario.senha
        )

        if (!senhaCorreta) {
            return res.status(401).json({ Error: "Senha incorreta." })
        }

        res.status(200).json({message: "Login realizado com sucesso!."})

    }catch(error) {
        console.log(error)
        res.status(500).json({Error: "Erro"})
    }
})


async function conectarServer() {
    await conectarBanco()
    app.listen(3000, console.log("Servidor Conectado..."))
}

conectarServer()