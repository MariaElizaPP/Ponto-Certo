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


document.querySelector('.btn-entrar').addEventListener('click', async function (e) {
    e.preventDefault();
    const clienteId = 8;

    try {
        const resposta = await fetch(`http://localhost:3000/api/buscarCliente/${clienteId}`);

        const cliente = await resposta.json();
        
        if (!resposta.ok) {
            exibirErroServidor(cliente.mensagem || "Erro ao buscar cliente.");
            return;
        }

        if (!cliente.ativo) {
            exibirErroServidor("Cliente inativado pelo administrador.");
            return;
        }

        localStorage.setItem('clienteId', clienteId);
        window.location.href = 'index.html';

    } catch (error) {
        console.error(error);
        exibirErroServidor("Erro ao verificar cliente. Tente novamente.");
    }
});


function mostrarErro(id, mensagem) {
    document.getElementById(id).classList.add('erro');
    document.getElementById('erro-' + id).textContent = mensagem;
}

function limparErros() {
    document.querySelectorAll('.placeholder, select').forEach(campo => campo.classList.remove('erro'));
    document.querySelectorAll('.erro-msg').forEach(span => span.textContent = '');
}


function mostrarToast(mensagem, tipo = 'erro') {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.className = `toast mostrar ${tipo}`;

    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

function exibirErroServidor(mensagem) {
    mostrarToast(mensagem, 'erro');
}
