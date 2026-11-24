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

        body: JSON.stringify({email: emailDigitado, senha: senhaDigitada})
    });

})