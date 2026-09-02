/*const formularioLogin = document.getElementById("form-login");
formularioLogin.addEventListener("submit", function(evento){
    evento.preventDefault();

    limparErros();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if(email === "cliente@gmail.com" && senha === "1234"){
        window.location.href = "/src/views/index.html";
        
    }else{
        mostrarErro('erro-acesso', "Credenciais inválidas");
    }
});

function mostrarErro(id, mensagem){
    document.getElementById(id).textContent = mensagem;
}

function limparErros(){
    document.querySelectorAll('.erro-acesso').forEach(span => span.textContent = '');
}*/


document.querySelector('.btn-entrar').addEventListener('click', function (e) {
    e.preventDefault();
 
    localStorage.setItem('clienteId', 8);
 
    window.location.href = 'configuracoes.html'; // ou a tela inicial que vocês definirem
});