const clienteId = localStorage.getItem('clienteId');

let carrinho = [];
let subtotalCentavos = 0;
let freteCentavos = 0;
let cuponsUsados = []; 

window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
        carregarDadosPagamento();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    carregarDadosPagamento();
});

document.getElementById('botao-finalizar').addEventListener('click', function () {
    finalizarCompra();
});

document.getElementById('multiplos-cartoes').addEventListener('change', function () {
    document.querySelectorAll('.checkbox-cartao').forEach(function (checkbox) {
        checkbox.checked = false;
    });

    atualizarCamposValorCartao();
});

document.getElementById('lista-enderecos').addEventListener('change', function (e) {
    if (e.target.matches('.checkbox-endereco')) {
        carregarFrete(e.target.value);
    }
});

document.getElementById('lista-cartoes').addEventListener('change', function (e) {
    if (e.target.matches('.checkbox-cartao')) {
        selecionarCartao(e.target);
    }
});

async function carregarDadosPagamento() {
    if (!clienteId) {
        exibirErroServidor('Faça login para finalizar a compra.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/listarDadosPedido/${clienteId}`, {cache: 'no-store'});

        if (!response.ok) {
            throw new Error('Erro ao carregar dados do pagamento');
        }

        const dados = await response.json();

        carrinho = dados.carrinho || [];
        subtotalCentavos = calcularSubtotal(carrinho);

        renderizarEnderecos(dados.enderecos);
        renderizarCartoes(dados.cartoes);
        atualizarResumo();

        if (carrinho.length === 0) {
            exibirErroServidor('Seu carrinho está vazio.');
            return;
        }

        const enderecoSelecionado = document.querySelector('.checkbox-endereco:checked');

        if (enderecoSelecionado) {
            await carregarFrete(enderecoSelecionado.value);
        }
    } catch (erro) {
        console.error(erro);
        exibirErroServidor('Não foi possível carregar os dados do pagamento.');
    }
}

async function carregarFrete(enderecoId) {
    try {
        const response = await fetch('http://localhost:3000/api/calcular', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cliId: Number(clienteId),
                enderecoId: Number(enderecoId),
                itens: carrinho
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao calcular o frete');
        }

        const frete = await response.json();

        freteCentavos = paraCentavos(frete.valorFrete);
        atualizarResumo();
    } catch (erro) {
        console.error(erro);
        exibirErroServidor('Não foi possível calcular o frete.');
    }
}

function paraCentavos(valor) {
    return Math.round(Number(valor) * 100);
}

function formatarMoeda(centavos) {
    return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcularSubtotal(itens) {
    let soma = 0;

    itens.forEach(function (item) {
        soma += paraCentavos(item.itm_precoUnitario) * item.itm_quantidade;
    });

    return soma;
}

function calcularResumo() {
    const totalCentavos = subtotalCentavos + freteCentavos;

    let somaCupons = 0;

    cuponsUsados.forEach(function (cupom) {
        somaCupons += paraCentavos(cupom.valor);
    });

    const valorCupons = Math.min(somaCupons, totalCentavos);
    const restanteCentavos = totalCentavos - valorCupons;

    return { totalCentavos, valorCupons, restanteCentavos };
}

function atualizarResumo() {
    const resumo = calcularResumo();

    document.querySelector('.subtotal-pagamento').textContent = formatarMoeda(subtotalCentavos);
    document.querySelector('.frete-pagamento').textContent = formatarMoeda(freteCentavos);
    document.querySelector('.valor-total').textContent = formatarMoeda(resumo.restanteCentavos);
}

function adicionarCupomAplicado(codigo, valor) {
    const jaAplicado = cuponsUsados.some(function (cupom) {
        return cupom.codigo === codigo;
    });

    if (jaAplicado) {
        return;
    }

    cuponsUsados.push({ codigo: codigo, valor: valor });
    atualizarResumo();
}

function removerCupomAplicado(codigo) {
    cuponsUsados = cuponsUsados.filter(function (cupom) {
        return cupom.codigo !== codigo;
    });

    atualizarResumo();
}

function renderizarEnderecos(enderecos) {
    const container = document.getElementById('lista-enderecos');

    if (!enderecos || enderecos.length === 0) {
        container.innerHTML = '<p class="sem-endereco">Nenhum endereço de entrega cadastrado.</p>';
        return;
    }

    container.innerHTML = enderecos.map((end, indice) => {
        const cepFormatado = end.end_cep ? end.end_cep.replace(/(\d{5})(\d{3})/, '$1-$2') : '';
        const complementoText = end.end_complemento ? `, ${end.end_complemento}` : '';
        const enderecoTexto = `${end.end_logradouro} ${end.end_numero}${complementoText}, ${end.end_bairro}, ${end.end_cidade}, ${end.end_estado}, ${cepFormatado}, ${end.end_pais}`;
        const checked = indice === 0 ? 'checked' : '';

        return `
            <label class="item-endereco">
                <input type="radio" name="endereco-selecionado" class="checkbox-endereco" value="${end.end_id}" ${checked}>

                <div class="informacao-endereco">
                    <p class="linha-nome">${end.end_nomeEndereco || 'Sem apelido'}</p>
                    <p class="linha-nome">${enderecoTexto}</p>
                </div>

                <div class="acoes-endereco">
                    <a href="/pagamento/alterar_endereco.html" class="link-alterar">Alterar endereço</a>
                </div>
            </label>
        `;
    }).join('');
}

function renderizarCartoes(cartoes) {
    const container = document.getElementById('lista-cartoes');

    if (!cartoes || cartoes.length === 0) {
        container.innerHTML = '<p class="sem-cartao">Nenhum cartão cadastrado.</p>';
        return;
    }

    container.innerHTML = cartoes.map(cartao => {
        const numeroMascarado = `${String(cartao.car_numero).slice(0, 4)} **** **** ****`;

        return `
            <div class="container-cartao">
                <label class="item-cartao">
                    <input type="checkbox" name="cartao-selecionado" class="checkbox-cartao" value="${cartao.car_id}" />

                    <div class="informacao-cartao">
                        <p class="linha-nome"><strong>${cartao.bdr_nome}</strong> | ${cartao.car_nomeImpresso}</p>
                        <p class="linha-nome">${numeroMascarado}</p>
                    </div>
                </label>

                <div class="input-cartao">
                    <h4 class="input-titulo escondido">Valor a pagar no cartão</h4>
                    <input type="number" class="valor-cartao escondido" placeholder="Ex. 29.99" min="10" step="0.01">
                </div>
            </div>
        `;
    }).join('');
}

function selecionarCartao(checkbox) {
    const multiplos = document.getElementById('multiplos-cartoes').checked;

    if (!multiplos && checkbox.checked) {
        document.querySelectorAll('.checkbox-cartao').forEach(function (outro) {
            if (outro !== checkbox) {
                outro.checked = false;
            }
        });
    }

    atualizarCamposValorCartao();
}

function atualizarCamposValorCartao() {
    const multiplos = document.getElementById('multiplos-cartoes').checked;

    document.querySelectorAll('.container-cartao').forEach(function (container) {
        const marcado = container.querySelector('.checkbox-cartao').checked;
        const titulo = container.querySelector('.input-titulo');
        const campo = container.querySelector('.valor-cartao');

        if (multiplos && marcado) {
            titulo.classList.remove('escondido');
            campo.classList.remove('escondido');
        } else {
            titulo.classList.add('escondido');
            campo.classList.add('escondido');
            campo.value = '';
        }
    });
}

function montarCartoesPagamento(restanteCentavos) {
    if (restanteCentavos === 0) {
        return [];
    }

    const multiplos = document.getElementById('multiplos-cartoes').checked;
    const cartoes = [];
    let somaCentavos = 0;

    const containers = document.querySelectorAll('.container-cartao');

    for (const container of containers) {
        const checkbox = container.querySelector('.checkbox-cartao');

        if (!checkbox.checked) {
            continue;
        }

        let valorCentavos = restanteCentavos;

        if (multiplos) {
            valorCentavos = paraCentavos(container.querySelector('.valor-cartao').value);

            if (!valorCentavos || valorCentavos <= 0) {
                mostrarErroCartoes('Informe o valor de cada cartão selecionado.');
                return null;
            }
        }

        if (cuponsUsados.length === 0 && valorCentavos < 1000) {
            mostrarErroCartoes('O valor mínimo por cartão é R$ 10,00.');
            return null;
        }

        somaCentavos += valorCentavos;
        cartoes.push({ carId: Number(checkbox.value), valor: valorCentavos / 100 });
    }

    if (cartoes.length === 0) {
        mostrarErroCartoes(`Selecione um cartão para pagar ${formatarMoeda(restanteCentavos)}.`);
        return null;
    }

    if (somaCentavos !== restanteCentavos) {
        mostrarErroCartoes(`Os cartões devem cobrir exatamente ${formatarMoeda(restanteCentavos)}.`);
        return null;
    }

    return cartoes;
}

async function finalizarCompra() {
    limparErroCartoes();

    if (carrinho.length === 0) {
        exibirErroServidor('Seu carrinho está vazio.');
        return;
    }

    const enderecoSelecionado = document.querySelector('.checkbox-endereco:checked');

    if (!enderecoSelecionado) {
        exibirErroServidor('Selecione um endereço de entrega.');
        return;
    }

    const resumo = calcularResumo();
    const cartoes = montarCartoesPagamento(resumo.restanteCentavos);

    if (cartoes === null) {
        return;
    }

    const cupons = cuponsUsados.map(function (cupom) {
        return cupom.codigo;
    });

    const botao = document.getElementById('botao-finalizar');
    botao.disabled = true;

    try {
        const response = await fetch('http://localhost:3000/api/finalizar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cliId: Number(clienteId),
                enderecoId: Number(enderecoSelecionado.value),
                cartoes: cartoes,
                cupons: cupons
            })
        });

        const resultado = await response.json().catch(() => ({}));

        if (!response.ok) {
            exibirErroServidor(resultado.mensagem || 'Erro ao finalizar o pedido.');

            if (response.status === 409) {
                carregarDadosPagamento();
            }

            return;
        }

        if (resultado.status === 'REPROVADA') {
            exibirErroServidor(resultado.mensagem);
            return;
        }

        document.getElementById('modal-abrir').showModal();

    } catch (erro) {
        console.error(erro);
        exibirErroServidor('Erro ao conectar com o servidor');
    } finally {
        botao.disabled = false;
    }
}

function mostrarErroCartoes(mensagem) {
    document.getElementById('mensagem-erro-cartoes').textContent = mensagem;
}

function limparErroCartoes() {
    document.getElementById('mensagem-erro-cartoes').textContent = '';
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