import express from "express"

const app = express()
app.use(express.json())


const users = [
    {
        id: 1,
        nome: "vinicius"
    },
    {
        id: 2,
        nome: "pereira"
    },
    {
        id: 3,
        nome: "ana clara"
    },
]

// Listar Usuários
app.get("/usuarios", (req, res) => {
    res.json(users)
})

// Listar Usuário pelo ID
app.get("/usuarios/:id", (req, res) => {
    const id = Number(req.params.id)
    const buscarId = users.find(u => u.id === id)

    if (!buscarId) {
        return res.status(404).json({ Error: "Erro ao encontrar Usuário" })
    }

    res.json(buscarId)
})

// Criar Usuário
app.post("/usuarios", (req, res) => {
    const user = req.body

    // Validar o cadastro de usuários
    if (!user.nome || typeof user.nome !== "string" || user.nome.trim() === "") {
        return res.status(400).json({ Error: "Preencha o campo" })
    }

    let novoId;

    if (users.length > 0) {
        const ids = users.map(u => u.id)
        const maiorId = Math.max(...ids)
        novoId = maiorId + 1
    } else {
        novoId = 1
    }

    const novoUsuario = {
        id: novoId,
        nome: user.nome
    }

    users.push(novoUsuario)

    res.status(201).json(novoUsuario)
})

app.listen(3000, console.log("Servidor Conectado..."))