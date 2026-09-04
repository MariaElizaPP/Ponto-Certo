
const clienteId = localStorage.getItem('clienteId');

function apenasNumeros(valor) {
    return valor.replace(/\D/g, '');
}

function mascararCartao(valor) {
    let v = apenasNumeros(valor).slice(0, 16);
    v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    return v;
}

document.getElementById('numero-cartao').addEventListener('input', function (e) {
    e.target.value = mascararCartao(e.target.value);
});

document.addEventListener('DOMContentLoaded', () => {
    carregarBandeiras();
});

document.querySelector('.cadastrar').addEventListener('click', async function (e) {
    e.preventDefault();

    const numero = document.getElementById('numero-cartao').value.replace(/\s/g, '');
    const bandeira = document.getElementById('bandeira').value;
    const nome = document.getElementById('nome-cartao').value.trim();
    const cvv = document.getElementById('cvv').value;

    limparErros();

    let valido = true;

    if (!/^\d{13,19}$/.test(numero)) {
        mostrarErro('numero-cartao', 'Número do cartão inválido.');
        valido = false;
    } else if (!validarLuhn(numero)) {
        mostrarErro('numero-cartao', 'Número do cartão não é válido.');
        valido = false;
    }

    if (!bandeira) {
        mostrarErro('bandeira', 'Selecione a bandeira do cartão.');
        valido = false;
    }

    if (!/^[A-Za-zÀ-ÿ\s]{2,}$/.test(nome)) {
        mostrarErro('nome-cartao', 'Nome inválido.');
        valido = false;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        mostrarErro('cvv', 'CVV inválido.');
        valido = false;
    }

    if (!valido) return;

    try {
        const response = await fetch('http://localhost:3000/api/cadastrarCartao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cliId: clienteId,
                numeroCartao: apenasNumeros(numero),
                bandeiraCartao: bandeira,
                nomeCartao: nome,
                cvv: cvv
            })
        });

        const dados = await response.json();

        if (!response.ok) {
            mostrarErro('numero-cartao', dados.mensagem || 'Erro ao cadastrar o cartão');
            return;
        }

        document.getElementById('modal-abrir').showModal();
    } catch (erro) {
        console.error(erro);
        mostrarErro('numero-cartao', 'Não foi possivel conectar ao servidor');

    }

});

async function carregarBandeiras() {
    try {
        const res = await fetch('http://localhost:3000/api/bandeiras');
        const bandeiras = await res.json();

        const select = document.getElementById('bandeira');
        select.querySelectorAll('option:not([hidden])').forEach((opcao) => opcao.remove());

        bandeiras.forEach((bandeira) => {
            const option = document.createElement('option');
            option.value = bandeira.bdr_id;
            option.textContent = bandeira.bdr_nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar bandeiras:', error);
    }
}

function mostrarErro(id, mensagem) {
    document.getElementById(id).classList.add('erro');
    document.getElementById('erro-' + id).textContent = mensagem;
}

function limparErros() {
    document.querySelectorAll('.placeholder').forEach(campo => campo.classList.remove('erro'));
    document.querySelectorAll('.erro-msg').forEach(span => span.textContent = '');
}

function validarLuhn(numero) {
    let soma = 0;
    let alternar = false;

    for (let i = numero.length - 1; i >= 0; i--) {
        let n = parseInt(numero[i], 10);
        if (alternar) {
            n *= 2;
            if (n > 9) n -= 9;
        }
        soma += n;
        alternar = !alternar;
    }

    return soma % 10 === 0;
}