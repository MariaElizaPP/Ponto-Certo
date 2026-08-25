document.querySelector('.cadastrar').addEventListener('click', function(e){
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