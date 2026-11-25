const form = document.querySelector("form");
const email = document.getElementById("email");
const senha = document.getElementById("senha");

form.addEventListener("submit", (event) => {
    event.preventDefault()

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
                console.log(resultado.dados.Error);
                return
            }

            console.log("Login realizado com sucesso!");
            console.log(resultado.dados)
            localStorage.setItem("token", resultado.dados.token)

            const token = localStorage.getItem("token")
            console.log(token)

            fetch("http://localhost:3000/perfil", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((resposta) => {
                return resposta.json()
            })
            .then((dados) => {
                console.log("Dados do perfil:", dados);
            })
            .catch((error) => {
                console.log(error)
            })   
        })
        .catch((error) => {
            console.log(error)
        }) 
});


