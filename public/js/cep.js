function buscaCep() {
    let campoCep = document.querySelector('[name="cep"]');
    let cep = apenasNumeros(campoCep.value);

    limparErros();

    if (cep === "") {
        return;
    }

    if (!validarFormatoCep(cep)) {
        return;
    }

    let url = "https://brasilapi.com.br/api/cep/v1/" + cep;

    let req = new XMLHttpRequest();
    req.open("GET", url);
    req.send();

    //tratar a resposta da requisicao
    req.onload = function () {
        if (req.status === 200) {
            let endereco = JSON.parse(req.response);
            document.getElementById('[name="logradouro"]').value = endereco.street;
            document.getElementById('[name="bairro"]').value = endereco.neighborhood;
            document.getElementById('[name="cidade"]').value = endereco.city;
            document.getElementById('[name="estado"]').value = endereco.state;
            document.getElementById('[name="pais"]').value = "Brasil";

        }
        else if (req.status === 404) {
            mostrarErro('cep', 'CEP não encontrado');
        }
        else if (req.status === 400) {
            mostrarErro('cep', 'Insira um CEP válido');
        }
    }
}

function apenasNumeros(valor) {
    return valor.replace(/\D/g, '');
}

function validarFormatoCep(cep) {

    if (cep.length !== 8) {
        mostrarErro('cep', 'O CEP deve conter 8 dígitos');
        return false;
    }

    if (/^(\d)\1{7}$/.test(cep)) {
        mostrarErro('cep', 'Insira um CEP válido');
        return false;
    }

    return true;
}


function mostrarErro(id, mensagem) {
    document.getElementById(id).classList.add('erro');
    document.getElementById('erro-' + id).textContent = mensagem;
}

function limparErros() {
    document.querySelectorAll('.placeholder').forEach(campo => campo.classList.remove('erro'));
    document.querySelectorAll('.erro-msg').forEach(span => span.textContent = '');
}

document.addEventListener('blur', function (e) {
    const campoCep = e.target.closest('[name="cep"]');
    if (!campoCep) return;

    const bloco = campoCep.closest('.bloco-endereco');
    if (bloco) buscaCep(bloco);
}, true);