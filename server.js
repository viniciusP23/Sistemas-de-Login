import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "./models/User.js";
import conectarBanco from "./db.js";

const app = express();
app.use(express.json());


// Listar Usuários
app.get("/usuarios", async (req, res) => {
    try {
        const usuarios = await User.find();
        res.json(usuarios);

    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: "Erro ao listar Usuários." });
    }
});

// Listar Usuário pelo ID
app.get("/usuarios/:id", async (req, res) => {
    try {
        const id = req.params.id

        // Indetificar IDs inválidos
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ Error: "ID no formato inválido." });
        }

        const buscarId = await User.findById(id);

        if (!buscarId) {
            return res.status(404).json({ Error: "Erro ao encontrar Usuário" });
        }

        res.json(buscarId);

    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: "Erro ao buscar Usuário." });
    }
});

// Criar Usuário
app.post("/usuarios", async (req, res) => {
    try {
        const user = req.body

        // Validar o cadastro campo nome
        if (!user.nome || typeof user.nome !== "string" || user.nome.trim() === "") {
            return res.status(400).json({ Error: "Nome inválido" });
        }

        // Validar o cadastro campo email
        if (!user.email || typeof user.email !== "string" || user.email.trim() === "") {
            return res.status(400).json({ Error: "E-mail inválido" });
        }

        if (!user.email.includes("@")) {
            return res.status(400).json({ Error: " '@' é obrigatório no E-mail" });
        }

        // implementar a criptografia 
        const senhaHash = await bcrypt.hash(user.senha, 10);

        const novoUsuario = await User.create({
            ...user,
            senha: senhaHash
        })

        res.status(201).json(novoUsuario);

    } catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Erro ao criar Usuário." });
    }
});

// Atualizar Usuário
app.put("/usuarios/:id", async (req, res) => {
    try {
        const id = req.params.id
        const dados = req.body

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ Error: "ID no formato inválido." });
        }

        const atualizarId = await User.findByIdAndUpdate(
            id,
            dados,
            { new: true, runValidators: true }
        );

        if (!atualizarId) {
            return res.status(404).json({ Error: "Usuário não encontrado." });
        };

        res.status(200).json(atualizarId);

    } catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Erro ao atualizar Usuário." });
    }
});

// Deletar Usuário
app.delete("/usuarios/:id", async (req, res) => {
    try {
        const id = req.params.id

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ Error: "ID no formato inválido." });
        }

        const deletarUser = await User.findByIdAndDelete(id);

        if (!deletarUser) {
            return res.status(404).json({ Error: "Erro ao encontrar Usuário" })
        }

        res.status(200).json(deletarUser);

    } catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Erro ao deletar Usuário." });
    }
});

function autenticarToken(req, res, next) {
    const authHeader = req.headers.authorization

    if(!authHeader) {
        return res.status(401).json({Error: "Token não fornecido."});
    }

    const token = authHeader.split(" ")[1]
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next();

    }catch(error) {
        return res.status(401).json({Error: "token inválido ou expirado."});
    }
}

app.get("/perfil", autenticarToken, async (req, res) => {
    const id = req.user.id
    res.status(200).json({
        message: "Acesso autorizado!",
        id
    });
});

// Login do Usuário
app.post("/login", async (req, res) => {
    try {
        const user = req.body

        const buscarUsuario = await User.findOne({ email: user.email });

        if (!buscarUsuario) {
            return res.status(404).json({ Error: 'Usuário não encontrado' });
        }

        const senhaCorreta = await bcrypt.compare(
            user.senha,
            buscarUsuario.senha
        )

        if (!senhaCorreta) {
            return res.status(401).json({ Error: "Senha incorreta." });
        }

        const token = jwt.sign(
            {id: buscarUsuario._id},
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        );

        res.status(200).json({
            message: "Login realizado com sucesso!.",
            token
        });

    }catch(error) {
        console.log(error)
        res.status(500).json({Error: "Erro"});
    }
});


async function conectarServer() {
    await conectarBanco()
    app.listen(3000, console.log("Servidor Conectado..."))
}

conectarServer();