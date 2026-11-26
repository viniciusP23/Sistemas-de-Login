const form = document.querySelector("form");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const mensagem = document.getElementById("mensagem");

const dadosPerfil = document.getElementById("dadosPerfil");
const btnSair = document.getElementById("btnSair");
const secaoPerfil = document.getElementById("secaoPerfil");

secaoPerfil.style.display = "none";

form.addEventListener("submit", (event) => {
    event.preventDefault();

    mensagem.textContent = "";

    const emailDigitado = email.value
    const senhaDigitada = senha.value

    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({ email: emailDigitado, senha: senhaDigitada })
    })
        .then((resposta) => {
            return resposta.json().then((dados) => {
                return {
                    ok: resposta.ok,
                    dados: dados
                }
            });
        })
        .then((resultado) => {
            if (!resultado.ok) {
                console.log("Erro no login!");
                mensagem.textContent = resultado.dados.Error
                return
            }

            console.log("Login realizado com sucesso!");
            console.log(resultado.dados);
            localStorage.setItem("token", resultado.dados.token);

            const token = localStorage.getItem("token");
            console.log(token);

            fetch("http://localhost:3000/perfil", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then((resposta) => {
                    return resposta.json();
                })
                .then((dados) => {
                    console.log("Dados do perfil:", dados);
                    dadosPerfil.textContent = `Seu ID: ${dados.id}`
                    secaoPerfil.style.display = "block";
                })
                .catch((error) => {
                    console.log(error);
                })
        })
        .catch((error) => {
            console.log(error);
            mensagem.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
        })
});

btnSair.addEventListener("click", () => {
    secaoPerfil.style.display = "none";
    dadosPerfil.textContent = ""
    form.reset();
});

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (token) {
        fetch("http://localhost:3000/perfil", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((resposta) => {

                if (!resposta.ok) {
                    localStorage.removeItem("token");
                    return
                }

                return resposta.json();

            })
            .then((dados) => {

                if (dados.id) {
                    dadosPerfil.textContent = `Seu ID: ${dados.id}`;
                    secaoPerfil.style.display = "block";
                }
            })
    }
});
