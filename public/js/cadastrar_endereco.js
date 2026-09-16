const clienteId = localStorage.getItem('clienteId');

function apenasNumeros(valor) {
    return valor.replace(/\D/g, '');
}

function mascararCep(valor) {
    let v = apenasNumeros(valor).slice(0, 8);
    v = v.replace(/(\d{5})(\d)/, '$1-$2');
    return v;
}

document.getElementById('cep').addEventListener('input', function (e) {
    e.target.value = mascararCep(e.target.value);
});

document.addEventListener('DOMContentLoaded', function () {
    if (!clienteId) {
        window.location.href = 'login.html';
        return;
    }
});

document.querySelector('.cadastrar').addEventListener('click', async function(e){
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
    const tipoEndereco = document.getElementById('tipo-endereco').value.trim();
    const complemento = document.getElementById('complemento').value.trim();

    limparErros();

    let valido = true;

    if (!tipoResidencia){
        mostrarErro('tipo-residencia', 'O tipo de residência é obrigatório');
        valido = false;
    }
    if (!tipoEndereco){
        mostrarErro('tipo-endereco', 'O tipo de endereço é obrigatório');
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

    const payload = {
        cliId: clienteId,
        tipoResidencia: tipoResidencia,
        cep: apenasNumeros(cep),
        tipoLogradouro: tipoLogradouro,
        cidade: cidade,
        pais: pais,
        estado: estado,
        bairro: bairro,
        logradouro: logradouro,
        nomeEndereco: nomeEndereco,
        numero: numero,
        tipoEndereco: tipoEndereco,
        complemento: complemento || null
    }

    try {
        const response = await fetch(`http://localhost:3000/api/cadastrarEndereco`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const erro = await response.json().catch(() => ({}));
            throw new Error(erro.mensagem || 'Erro ao cadastrar o cliente');
        }
        document.getElementById('modal-abrir').showModal();
    } catch (error) {
        
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
