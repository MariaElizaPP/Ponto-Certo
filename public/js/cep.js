function apenasNumeros(valor) {
    return valor.replace(/\D/g, '');
}

function validarFormatoCep(cep, bloco) {
    if (cep.length !== 8) {
        mostrarErro(bloco, 'cep', 'O CEP deve conter 8 dígitos');
        return false;
    }
    if (/^(\d)\1{7}$/.test(cep)) {
        mostrarErro(bloco, 'cep', 'Insira um CEP válido');
        return false;
    }
    return true;
}

function buscaCep(bloco) {
    const campoCep = bloco.querySelector('[name="cep"]');
    const cep = apenasNumeros(campoCep.value);

    limparErros(bloco);

    if (cep === "") return;
    if (!validarFormatoCep(cep, bloco)) return;

    const url = "https://brasilapi.com.br/api/cep/v1/" + cep;
    const req = new XMLHttpRequest();
    req.open("GET", url);
    req.send();

    req.onload = function () {
        if (req.status === 200) {
            const endereco = JSON.parse(req.response);
            bloco.querySelector('[name="logradouro"]').value = endereco.street;
            bloco.querySelector('[name="bairro"]').value = endereco.neighborhood;
            bloco.querySelector('[name="cidade"]').value = endereco.city;
            bloco.querySelector('[name="estado"]').value = endereco.state;
            bloco.querySelector('[name="pais"]').value = "Brasil";
        } else if (req.status === 404) {
            mostrarErro(bloco, 'cep', 'CEP não encontrado');
        } else if (req.status === 400) {
            mostrarErro(bloco, 'cep', 'Insira um CEP válido');
        }
    };
}

function mostrarErro(bloco, name, mensagem) {
    const campo = bloco.querySelector(`[name="${name}"]`);
    if (campo) campo.classList.add('erro');
    const container = campo ? campo.closest('.campo, .campo-pequeno, .campo-largo') : null;
    const erroSpan = container ? container.querySelector('.erro-msg') : null;
    if (erroSpan) erroSpan.textContent = mensagem;
}

function limparErros(bloco) {
    bloco.querySelectorAll('.placeholder').forEach(campo => campo.classList.remove('erro'));
    bloco.querySelectorAll('.erro-msg').forEach(span => span.textContent = '');
}

document.addEventListener('blur', function (e) {
    const campoCep = e.target.closest('[name="cep"]');
    if (!campoCep) return;

    const bloco = campoCep.closest('.bloco-endereco');
    if (bloco) buscaCep(bloco);
}, true);