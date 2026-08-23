document.querySelector('.cadastrar').addEventListener('click', function(e){
    e.preventDefault();

    const tipoResidencia = document.getElementById('tipo-residencia').value.trim();
    const cep = document.getElementById('cep').value.trim();
    const tipoLogradouro = document.getElementById('tipo-logradouro').value.trim();
    const cidade = document.getElementById('cidade').value.trim();
    const pais = document.getElementById('pais').value.trim();
    const estado = document.getElementById('estado').value.trim();
    const bairro = document.getElementById('bairro').value.trim();
    const logradouro = document.getElementById('logradouro').value.trim();
    const nomeEndereco = document.getElementById('nome-endereco').value.trim();
    const numero = document.getElementById('numero').value.trim();

    limparErros();

    let valido = true;

    if (!tipoResidencia){
        mostrarErro('tipo-residencia', 'O tipo de residência é obrigatório');
        valido = false;
    }
    if (!cep){
        mostrarErro('cep', 'O cep é obrigatório');
        valido = false;
    }
    if (!tipoLogradouro){
        mostrarErro('tipo-logradouro', 'O tipo de logradouro é obrigatório');
        valido = false;
    }
    if (!cidade){
        mostrarErro('cidade', 'A cidade é obrigatória');
        valido = false;
    }
    if (!pais){
        mostrarErro('pais', 'O país é obrigatório');
        valido = false;
    }
    if (!estado){
        mostrarErro('estado', 'O estado é obrigatório');
        valido = false;
    }
    if (!bairro){
        mostrarErro('bairro', 'O bairro é obrigatório');
        valido = false;
    }
    if (!logradouro){
        mostrarErro('logradouro', 'O logradouro é obrigatório');
        valido = false;
    }
    if (!nomeEndereco){
        mostrarErro('nome-endereco', 'O nome do endereco é obrigatório');
        valido = false;
    }
    if (!numero){
        mostrarErro('numero', 'O número é obrigatório');
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
