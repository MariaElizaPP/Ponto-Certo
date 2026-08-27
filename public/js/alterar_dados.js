document.querySelector('.cadastrar').addEventListener('click', function(e){
    e.preventDefault();

    const nomeCompleto = document.getElementById('nome').value.trim();
    const dataNascimento = document.getElementById('data-nascimento').value.trim();
    const genero = document.getElementById('genero').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    
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
