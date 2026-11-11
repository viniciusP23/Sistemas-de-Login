import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";

import User from "./models/User.js";
import conectarBanco from "./db.js";

const app = express();
app.use(express.json());

// Limite de tentativas em Login
const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: "Muitas tentativas de login. Tente novamente mais tarde."
})


// Listar Usuários
app.get("/usuarios", async (req, res) => {
    try {
        const usuarios = await User.find().select("-senha");
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

        const buscarId = await User.findById(id).select("-senha");

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

        if (!user.senha || typeof user.senha !== "string" || user.senha.trim() === "") {
            return res.status(400).json({ Error: "Senha inválida." })
        }

        if (user.idade !== undefined) {

            if (!Number.isInteger(user.idade)) {
                return res.status(400).json({ Error: "Somente números inteiros." })
            }

            if (user.idade < 0 || user.idade > 120) {
                return res.status(400).json({ Error: "Idade deve estar entre 0 e 120 anos." })
            }
        }

        const nomeNormalizado = user.nome.trim()

        const emailNormalizado = user.email.trim().toLowerCase()

        // Validação de senha
        const senhaValida = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,255}$/.test(user.senha);

        if (!senhaValida) {
            return res.status(400).json({ Error: "Senha não corresponde ao padrão." });
        }

        // Validação de E-mail
        const emailValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailNormalizado);

        if (!emailValido) {
            return res.status(400).json({ Error: "O e-mail não corresponde ao padrão." });
        }

        const tamanhoSenha = Buffer.byteLength(user.senha, "utf8");

        if (tamanhoSenha > 72) {
            return res.status(400).json({ Error: "A senha ultrapassa o limite permitido." })
        }

        const emailExistente = await User.findOne({
            email: emailNormalizado
        });

        if (emailExistente) {
            return res.status(409).json({ Error: "Não foi possível realizar o cadastro com os dados informados." })
        }

        // implementar criptografia 
        const senhaHash = await bcrypt.hash(user.senha, 10);

        const novoUsuario = await User.create({
            nome: nomeNormalizado,
            email: emailNormalizado,
            senha: senhaHash,
            idade: user.idade
        });

        const usuarioResposta = novoUsuario.toObject();
        delete usuarioResposta.senha;

        res.status(201).json(usuarioResposta);

    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            return res.status(409).json({ Error: "Não foi possível realizar o cadastro com os dados informados." });
        }
        res.status(500).json({ Error: "Erro ao criar Usuário." });
    }
});

// Atualizar Usuário
app.put("/usuarios/:id", autenticarToken, async (req, res) => {
    try {
        const id = req.params.id
        const dados = req.body

        const dadosPermitidos = {
            nome: dados.nome,
            email: dados.email,
            idade: dados.idade
        }

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ Error: "ID no formato inválido." });
        }

        if (dados.nome !== undefined) {

            if (typeof dados.nome !== "string" || dados.nome.trim() === "") {
                return res.status(400).json({ Error: "Nome inválido." });
            }

            dadosPermitidos.nome = dados.nome.trim();
        }

        if (dados.idade !== undefined) {

            if (!Number.isInteger(dados.idade)) {
                return res.status(400).json({ Error: "Somente números inteiros." })
            }

            if (dados.idade < 0 || dados.idade > 120) {
                return res.status(400).json({ Error: "Idade deve estar entre 0 e 120 anos." })
            }
        }

        const idUsuarioLogado = req.user.id

        if (idUsuarioLogado.toString() !== id) {
            return res.status(403).json({ Error: "Você não tem permissão para atualizar este usuário." })
        }


        if (dados.senha !== undefined) {
            if (typeof dados.senha !== "string" || dados.senha.trim() === "") {
                return res.status(400).json({ Error: "Senha inválida." })
            }

            // Validação de senha
            const senhaValida = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,255}$/.test(dados.senha);

            if (!senhaValida) {
                return res.status(400).json({ Error: "Senha não corresponde ao padrão." });
            }

            const tamanhoSenha = Buffer.byteLength(dados.senha, "utf8");
            if (tamanhoSenha > 72) {
                return res.status(400).json({ Error: "A senha ultrapassa o limite permitido." })
            }

            dadosPermitidos.senha = await bcrypt.hash(dados.senha, 10);
        }

        if (dados.email !== undefined) {

            if (typeof dados.email !== "string" || dados.email.trim() === "") {
                return res.status(400).json({ Error: "E-mail inválido." })
            }

            const emailNormalizado = dados.email.trim().toLowerCase()

            // Validação de E-mail
            const emailValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailNormalizado);

            if (!emailValido) {
                return res.status(400).json({ Error: "O e-mail não corresponde ao padrão." });
            }

            const emailExistente = await User.findOne({
                email: emailNormalizado
            });

            if (emailExistente && idUsuarioLogado !== emailExistente._id.toString()) {
                return res.status(409).json({ Error: "Não foi possível atualizar com os dados informados." })
            }

            dadosPermitidos.email = emailNormalizado
        }

        const atualizarId = await User.findByIdAndUpdate(
            id,
            dadosPermitidos,
            { returnDocument: "after", runValidators: true }
        );

        if (!atualizarId) {
            return res.status(404).json({ Error: "Usuário não encontrado." });
        };

        const usuarioAtualizado = atualizarId.toObject();
        delete usuarioAtualizado.senha

        res.status(200).json(usuarioAtualizado);

    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            return res.status(409).json({ Error: "Não foi possível atualizar com os dados informados." });
        }
        res.status(500).json({ Error: "Erro ao atualizar Usuário." });
    }
});

// Deletar Usuário
app.delete("/usuarios/:id", autenticarToken, async (req, res) => {
    try {
        const id = req.params.id

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ Error: "ID no formato inválido." });
        }

        const idUsuarioLogado = req.user.id

        if (idUsuarioLogado.toString() !== id) {
            return res.status(403).json({ Error: "Você não tem permissão para excluir este usuário." })
        }

        const deletarUser = await User.findByIdAndDelete(id);

        if (!deletarUser) {
            return res.status(404).json({ Error: "Erro ao encontrar Usuário" })
        }

        const usuarioResposta = deletarUser.toObject();
        delete usuarioResposta.senha

        res.status(200).json(usuarioResposta);

    } catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Erro ao deletar Usuário." });
    }
});

function autenticarToken(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ Error: "Token não fornecido." });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ Error: "Formato de token inválido." })
    }

    const token = authHeader.split(" ")[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next();

    } catch (error) {
        return res.status(401).json({ Error: "token inválido ou expirado." });
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
app.post("/login", limiteLogin, async (req, res) => {
    try {
        const user = req.body

        if (!user.email || typeof user.email !== "string" || user.email.trim() === "") {
            return res.status(400).json({ Error: "Preencha os campos." })
        }

        if (!user.senha || typeof user.senha !== "string" || user.senha.trim() === "") {
            return res.status(400).json({ Error: "Preencha os campos." })
        }

        const emailNormalizado = user.email.trim().toLowerCase()

        const buscarUsuario = await User.findOne({ email: emailNormalizado });

        if (!buscarUsuario) {
            return res.status(401).json({ Error: "Email e/ou Senha incorretos" });
        }

        const senhaCorreta = await bcrypt.compare(
            user.senha,
            buscarUsuario.senha
        )

        if (!senhaCorreta) {
            return res.status(401).json({ Error: "Email e/ou Senha incorretos" });
        }

        const token = jwt.sign(
            { id: buscarUsuario._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login realizado com sucesso!.",
            token
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: "Erro" });
    }
});


async function conectarServer() {
    await conectarBanco()
    app.listen(3000, console.log("Servidor Conectado..."))
}

conectarServer();