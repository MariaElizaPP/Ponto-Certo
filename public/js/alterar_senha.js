document.querySelector('.cadastrar').addEventListener('click', async function(e){
    e.preventDefault();
    limparErros();

    const senha = document.getElementById('senha').value.trim();
    const confirmarSenha = document.getElementById('confirmar-senha').value.trim();
    let valido = true;

    if(!senha){
        mostrarErro("senha", "A senha é obrigatória");
        valido = false;
    }
    if(!confirmarSenha){
        mostrarErro("confirmar-senha", "A confirmação da senha é obrigatória");
        valido = false;
    }

    const senhaRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!*@#$%^&(),.?":{}|<>_\-+=~`\[\]\/]).{8,}$/;

    if(!senhaRegex.test(senha)){
        mostrarErro("senha", "A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, minúscula e um caractere especial");
        valido = false;
    }

    if(senha !== confirmarSenha){
        mostrarErro("confirmar-senha", "As senhas não coincidem");
        valido = false;
    }

    if(!valido) return;

    const clienteId = localStorage.getItem('clienteId');

    try {
        const response = await fetch(`http://localhost:3000/api/cliente/${clienteId}/senha`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ novaSenha: senha })
        });

        const dados = await response.json();

        if(!response.ok){
            mostrarErro("senha", dados.mensagem || "Erro ao alterar a senha");
            return;
        }

        document.getElementById('modal-abrir').showModal();

    } catch(erro){
        console.error(erro);
        mostrarErro("senha", "Não foi possível conectar ao servidor");
    }
});

function mostrarErro(id, mensagem){
    document.getElementById(id).classList.add('erro');
    document.getElementById('erro-' + id).textContent = mensagem;
}

function limparErros(){
    document.querySelectorAll('.placeholder').forEach(campo => campo.classList.remove('erro'));
    document.querySelectorAll('.erro-msg').forEach(span => span.textContent = '');
}