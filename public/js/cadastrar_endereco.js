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
        mostrarErro('tipo-residencia', 'O tipo de residência é obrigatório')
    }
    if (!cep){
        mostrarErro('cep', 'O cep é obrigatório')
    }
    if (!tipoLogradouro){
        mostrarErro('tipo-logradouro', 'O tipo de logradouro é obrigatório')
    }
    if (!cidade){
        mostrarErro('cidade', 'A cidade é obrigatória')
    }
    if (!pais){
        mostrarErro('pais', 'O país é obrigatório')
    }
    if (!estado){
        mostrarErro('estado', 'O estado é obrigatório')
    }
    if (!bairro){
        mostrarErro('bairro', 'O bairro é obrigatório')
    }
    if (!logradouro){
        mostrarErro('logradouro', 'O logradouro é obrigatório')
    }
    if (!nomeEndereco){
        mostrarErro('nome-endereco', 'O nome do endereco é obrigatório')
    }
    if (!numero){
        mostrarErro('numero', 'O número é obrigatório')
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
