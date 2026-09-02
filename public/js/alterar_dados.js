const clienteId = localStorage.getItem('clienteId');
 
document.addEventListener('DOMContentLoaded', function () {
    if (!clienteId) {
        window.location.href = 'login.html';
        return;
    }
    carregarDadosCliente();
});
 
async function carregarDadosCliente() {
    try {
        const response = await fetch(`http://localhost:3000/api/dadosCadastrais/${clienteId}`);
 
        if (!response.ok) {
            throw new Error('Erro ao carregar dados do cliente');
        }
 
        const cliente = await response.json();

 
        document.getElementById('nome').value = cliente.nome ?? '';
        document.getElementById('data-nascimento').value = cliente.dataNascimento ?? '';
        document.getElementById('genero').value = cliente.genero ?? '';
        document.getElementById('telefone').value = cliente.telefone ?? '';
    } catch (erro) {
        console.error(erro);
        exibirErroServidor('Não foi possível carregar os dados do cliente.');
    }
}

document.querySelector('.cadastrar').addEventListener('click', async function (e) {
    e.preventDefault();
 
    const nomeCompleto = document.getElementById('nome').value.trim();
    const dataNascimento = document.getElementById('data-nascimento').value.trim();
    const genero = document.getElementById('genero').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
 
    limparErros();
 
    let valido = true;
 
    if (!nomeCompleto) {
        mostrarErro('nome', 'O nome é obrigatório');
        valido = false;
    }
    if (!dataNascimento) {
        mostrarErro('data-nascimento', 'A data de nascimento é obrigatório');
        valido = false;
    }
    if (!genero) {
        mostrarErro('genero', 'O gênero é obrigatório');
        valido = false;
    }
    if (!telefone) {
        mostrarErro('telefone', 'O telefone é obrigatório');
        valido = false;
    }
 
    if (!valido) {
        return;
    }
 
    const payload = {
        nome: nomeCompleto,
        dataNascimento: dataNascimento,
        genero: genero,
        telefone: telefone
    };
 
    try {
        const response = await fetch(`http://localhost:3000/api/cliente/${clienteId}`, {
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

