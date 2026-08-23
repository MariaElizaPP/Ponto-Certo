const formularioLogin = document.getElementById("form-login");
formularioLogin.addEventListener("submit", function(evento){
    evento.preventDefault();

    limparErros();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if(email === "admin@gmail.com" && senha === "1234"){
        window.location.href = "/src/views/admin/#";
        
    }else{
        mostrarErro('erro-acesso', "Credenciais inválidas");
    }
});

function mostrarErro(id, mensagem){
    document.getElementById(id).textContent = mensagem;
}

function limparErros(){
    document.querySelectorAll('.erro-acesso').forEach(span => span.textContent = '');
}