const clienteId = localStorage.getItem('clienteId');
const params = new URLSearchParams(window.location.search);
const enderecoId = params.get('enderecoId');

document.addEventListener('DOMContentLoaded', function () {
    if (!clienteId || !enderecoId) {
        window.location.href = 'login.html';
        return;
    }
    carregarDadosCliente();
});

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


async function carregarDadosCliente() {
    try {
        const response = await fetch(`http://localhost:3000/api/buscarEndereco/${clienteId}/${enderecoId}`);

        if (!response.ok) {
            throw new Error('Erro ao carregar o endereço');
        }

        const endereco = await response.json();

        document.getElementById('tipo-residencia').value = endereco.end_tipoResidencia;
        document.getElementById('cep').value = mascararCep(endereco.end_cep);
        document.getElementById('tipo-logradouro').value = endereco.end_tipoLogradouro;
        document.getElementById('cidade').value = endereco.end_cidade;
        document.getElementById('pais').value = endereco.end_pais;
        document.getElementById('estado').value = endereco.end_estado;
        document.getElementById('bairro').value = endereco.end_bairro;
        document.getElementById('logradouro').value = endereco.end_logradouro;
        document.getElementById('nome-endereco').value = endereco.end_nomeEndereco;
        document.getElementById('numero').value = endereco.end_numero;
        document.getElementById('tipo-endereco').value = endereco.end_tipoEndereco;
        document.getElementById('complemento').value = endereco.end_complemento;

    } catch (erro) {
        console.error(erro);
        exibirErroServidor('Não foi possível carregar os dados do cliente.');
    }
}

document.querySelector('.cadastrar').addEventListener('click', async function (e) {
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

    if (!tipoResidencia) {
        mostrarErro('tipo-residencia', 'O tipo de residência é obrigatório');
        valido = false;
    }
    if (!cep) {
        mostrarErro('cep', 'O cep é obrigatório');
        valido = false;
    }
    if (!tipoLogradouro) {
        mostrarErro('tipo-logradouro', 'O tipo de logradouro é obrigatório');
        valido = false;
    }
    if (!cidade) {
        mostrarErro('cidade', 'A cidade é obrigatória');
        valido = false;
    }
    if (!pais) {
        mostrarErro('pais', 'O país é obrigatório');
        valido = false;
    }
    if (!estado) {
        mostrarErro('estado', 'O estado é obrigatório');
        valido = false;
    }
    if (!bairro) {
        mostrarErro('bairro', 'O bairro é obrigatório');
        valido = false;
    }
    if (!logradouro) {
        mostrarErro('logradouro', 'O logradouro é obrigatório');
        valido = false;
    }
    if (!nomeEndereco) {
        mostrarErro('nome-endereco', 'O nome do endereco é obrigatório');
        valido = false;
    }
    if (!numero) {
        mostrarErro('numero', 'O número é obrigatório');
        valido = false;
    }
    if (!tipoEndereco) {
        mostrarErro('tipo-endereco', 'O tipo de endereço é obrigatório');
        valido = false;
    }

    if (!valido) {
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
    };

    try {
        const response = await fetch(`http://localhost:3000/api/alterarEndereco/${enderecoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const erro = await response.json().catch(() => ({}));
            throw new Error(erro.mensagem || 'Erro ao atualizar cliente');
        }

        document.getElementById('modal-abrir').showModal();

    } catch (erro) {
        console.error(erro);
        exibirErroServidor(erro.message);
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

