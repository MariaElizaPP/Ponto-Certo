document.querySelector('.cadastrar').addEventListener('click', function(e){
    e.preventDefault();

    const nomeCompleto = document.getElementById('nome').value.trim();
    const dataNascimento = document.getElementById('data-nascimento').value.trim();
    const genero = document.getElementById('genero').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const confirmarSenha = document.getElementById('confirmar-senha').value.trim();
   

    limparErros();

    let valido = true;

    if (!nomeCompleto){
        mostrarErro('nome', 'O nome é obrigatório');
        valido = false;
    }
    if (!dataNascimento){
        mostrarErro('data-nascimento', 'A data de nascimento é obrigatório');
        valido = false;
    }
    if (!genero){
        mostrarErro('genero', 'O gênero é obrigatório');
        valido = false;
    }
    if (!telefone){
        mostrarErro('telefone', 'O telefone é obrigatório');
        valido = false;
    }
    if (!email){
        mostrarErro('email', 'O email é obrigatório');
        valido = false;
    }
    if (!senha){
        mostrarErro('senha', 'O senha é obrigatório');
        valido = false;
    }
    if (!confirmarSenha){
        mostrarErro('confirmar-senha', 'A confirmação da senha é obrigatória');
        valido = false;
    }
   
    const senhaRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!*@#$%^&(),.?":{}|<>_\-+=~`\[\]\/]).{8,}$/;
    
    if(!senhaRegex.test(senha) ){
        mostrarErro("senha", "A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, minúscula e um caractere especial");
        valido = false;
    }
    
    if(senha !== confirmarSenha){
        mostrarErro("confirmar-senha", "As senhas não coincidem");
        valido = false;
    }

    if(!valido){
        return;
    }

    document.getElementById('modal-abrir').showModal();
    
});

function mostrarErro(id, mensagem){
    document.getElementById(id).classList.add('erro');
    document.getElementById('erro-' + id).textContent = mensagem;
}

function limparErros(){
    document.querySelectorAll('.placeholder').forEach(campo => campo.classList.remove('erro'));
    document.querySelectorAll('.erro-msg').forEach(span => span.textContent = '');
}
