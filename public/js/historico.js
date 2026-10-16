const API = 'http://localhost:3000/api';
const clienteId = localStorage.getItem('clienteId');

const STATUS_PEDIDO = {
    'EM PROCESSAMENTO': { texto: 'Em processamento', tag: 'tag-processamento', rodape: 'rodape-em-transito', acao: 'cancelar' },
    'APROVADA': { texto: 'Aprovada', tag: 'tag-processamento', rodape: 'rodape-em-transito', acao: 'cancelar' },
    'REPROVADA': { texto: 'Reprovada', tag: 'tag-negado', rodape: 'rodape-negado', acao: '' },
    'EM TRANSPORTE': { texto: 'Em transporte', tag: 'tag-transito', rodape: 'rodape-em-transito', acao: '' },
    'EM TRANSITO': { texto: 'Em trânsito', tag: 'tag-transito', rodape: 'rodape-em-transito', acao: '' },
    'ENTREGUE': { texto: 'Entregue', tag: 'tag-entregue', rodape: 'rodape-entregue', acao: 'trocar' },
    'CANCELADO': { texto: 'Cancelado', tag: 'tag-negado', rodape: 'rodape-negado', acao: '' }
};

const ACOES_PEDIDO = {
    cancelar: {
        sucesso: 'Pedido cancelado com sucesso.',
        requisicao: (pedId) => ({
            url: `${API}/cancelarPedido/${pedId}`,
            metodo: 'PATCH'
        })
    },

    trocar: {
        sucesso: 'Troca solicitada com sucesso.',
        requisicao: (pedId, itens) => ({
            url: `${API}/solicitar`,
            metodo: 'POST',
            corpo: { cliId: Number(clienteId), pedidoId: Number(pedId), itens }
        })
    }
};

let listaPedidos = [];

document.addEventListener('DOMContentLoaded', function () {
    carregarHistorico();
});

document.getElementById('campo-busca').addEventListener('input', function () {
    aplicarBusca();
});

document.getElementById('botao-busca').addEventListener('click', function () {
    aplicarBusca();
});

document.addEventListener('click', function (e) {
    const botao = e.target.closest('button[data-acao]');

    if (!botao) {
        return;
    }

    const { acao, pedId } = botao.dataset;
    let dados;

    if (acao === 'trocar') {
        const coleta = coletarItensTroca(botao.closest('dialog'));

        if (coleta.erro) {
            mostrarToast(coleta.erro, 'erro');
            return;
        }

        dados = coleta.itens;
    }

    executarAcao(acao, pedId, dados);
});

document.addEventListener('input', function (e) {
    if (!e.target.classList.contains('troca-qtd')) {
        return;
    }

    e.target.closest('.item-troca').querySelector('.troca-check').checked = true;
});

async function carregarHistorico() {
    try {
        const response = await fetch(`${API}/historico/${clienteId}`);

        if (!response.ok) {
            throw new Error('Erro ao carregar histórico');
        }

        listaPedidos = await response.json();

        aplicarBusca();
    } catch (erro) {
        console.error(erro);
        exibirErroServidor('Não foi possível carregar o histórico de pedidos.');
    }
}

async function executarAcao(acao, pedId, dados) {
    const config = ACOES_PEDIDO[acao];

    if (!config) {
        return;
    }

    const { url, metodo, corpo } = config.requisicao(pedId, dados);

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: corpo ? JSON.stringify(corpo) : undefined
        });

        const resultado = await response.json().catch(() => ({}));

        if (!response.ok) {
            mostrarToast(resultado.mensagem || 'Erro ao atualizar o pedido', 'erro');
            return;
        }

        mostrarToast(config.sucesso, 'sucesso');
        carregarHistorico();
    } catch (erro) {
        console.error(erro);
        mostrarToast('Não foi possível conectar ao servidor', 'erro');
    }
}

function pedidoContemTermo(pedido, termo) {
    for (const item of pedido.itens) {
        if (item.nomeProduto.toLowerCase().includes(termo)) {
            return true;
        }
    }

    return false;
}

function aplicarBusca() {
    const termo = document.getElementById('campo-busca').value.trim().toLowerCase();

    if (!termo) {
        renderizarPedidos(listaPedidos);
        return;
    }

    const filtrados = listaPedidos.filter(function (pedido) {
        return pedidoContemTermo(pedido, termo);
    });

    renderizarPedidos(filtrados);
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data) {
    const d = new Date(data);
    const dia = d.toLocaleDateString('pt-BR');
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return `${dia} às ${hora}`;
}

// Quantidade que ainda pode ser solicitada para troca
// (trocas recusadas não entram na conta: o back-end já as exclui das somas)
function quantidadeRestante(item) {
    return item.quantidade - (item.qtdEmTroca || 0) - (item.qtdTrocada || 0);
}

function trocaItemHtml(item) {
    const tags = [];

    if (item.qtdEmTroca > 0) {
        tags.push(`<span class="tag-aguardando">${item.qtdEmTroca} em troca</span>`);
    }

    if (item.qtdTrocada > 0) {
        tags.push(`<span class="tag-finalizado">${item.qtdTrocada} trocada(s)</span>`);
    }

    return tags.length > 0 ? `<span class="troca-tags">${tags.join('')}</span>` : '';
}

function montarModalHtml(idModal, classeModal, titulo, texto, textoConfirmar, acao, pedId, conteudoExtra = '') {
    return `
        <dialog id="${idModal}" class="${classeModal}">
            <img class="icone-alerta" src="/public/images/modal-alerta.svg" alt="alerta-modal">
            <h3>${titulo}</h3>
            <span>${texto}</span>
            ${conteudoExtra}
            <div class="botoes-modais">
                <button class="btn-modal-cancelar" data-modal="${idModal}" type="button">Cancelar</button>
                <button class="btn-modal-fechar btn-tema-alerta" data-modal="${idModal}" data-acao="${acao}" data-ped-id="${pedId}" type="button">${textoConfirmar}</button>
            </div>
        </dialog>
    `;
}

function montarModalTrocaHtml(idModal, classeModal, titulo, texto, textoConfirmar, acao, pedId, conteudoExtra = '') {
    return `
        <dialog id="${idModal}" class="${classeModal}">
            <img class="icone-troca" src="/public/images/historico-troca.svg" alt="alerta-modal">
            <h3>${titulo}</h3>
            <span>${texto}</span>
            ${conteudoExtra}
            <div class="botoes-modais">
                <button class="btn-modal-cancelar btn-troca-cancelar" data-modal="${idModal}" type="button">Cancelar</button>
                <button class="btn-modal-fechar btn-troca-solicitar" data-modal="${idModal}" data-acao="${acao}" data-ped-id="${pedId}" type="button">${textoConfirmar}</button>
            </div>
        </dialog>
    `;
}

// Lista apenas os itens que ainda têm unidades disponíveis para troca
function montarItensTrocaHtml(itens) {
    const linhas = itens.map(item => {
        const restante = quantidadeRestante(item);

        return `
            <label class="item-troca">
                <input type="checkbox" class="troca-check" value="${item.itemId}">
                <span>${item.nomeProduto}</span>
                <input type="number" class="troca-qtd" min="1" max="${restante}" value="1">
                <small>de ${restante} disponível(is)</small>
            </label>
        `;
    }).join('');

    return `<div class="itens-troca">${linhas}</div>`;
}


function montarAcaoHtml(pedido, acao) {
    const pedId = pedido.id;

    if (acao === 'cancelar') {
        const idModal = `modal-cancelar-${pedId}`;

        return `
            <button type="button" class="botao-cancelar" data-modal="${idModal}">Cancelar Compra</button>
            ${montarModalHtml(idModal, 'modal-confirmar-entrega', 'Cancelar o seu pedido?', 'Você deseja cancelar o recebimento de seu pedido?', 'Confirmar', acao, pedId)}
        `;
    }

    if (acao === 'trocar') {
        const trocaveis = pedido.itens.filter(item => quantidadeRestante(item) > 0);

        if (trocaveis.length === 0) {
            return '<span class="linha-rodape">Troca solicitada</span>';
        }

        const idModal = `modal-trocar-${pedId}`;

        return `
            <button type="button" class="botao-trocar" data-modal="${idModal}">Trocar</button>
            ${montarModalTrocaHtml(
                idModal, 'modal-solicitar-troca',
                'Solicitar troca',
                'Selecione os itens e a quantidade que deseja trocar. A solicitação será enviada para análise.',
                'Solicitar troca', acao, pedId,
                montarItensTrocaHtml(trocaveis)
            )}
        `;
    }

    return '';
}

function renderizarPedidos(pedidos) {
    const container = document.getElementById('lista-pedidos');

    if (!pedidos || pedidos.length === 0) {
        container.innerHTML = '<p class="sem-pedidos">Nenhum pedido encontrado.</p>';
        return;
    }

    container.innerHTML = pedidos.map(pedido => {
        let status = STATUS_PEDIDO[String(pedido.status).toUpperCase()];

        if (!status) {
            status = { texto: pedido.status, tag: 'tag-processamento', rodape: 'rodape-em-transito', acao: '' };
        }

        const dataFormatada = formatarData(pedido.finalizadoEm);
        const totalFormatado = formatarMoeda(pedido.totalPedido);
        const acaoHtml = montarAcaoHtml(pedido, status.acao);

        const itensHtml = pedido.itens.map(item => {
            const precoFormatado = formatarMoeda(item.precoUnitario);
            const subtotalFormatado = formatarMoeda(Number(item.precoUnitario) * item.quantidade);

            return `
                <div class="item-historico">
                    <span class="img-historico"><img src="${item.imagemUrl}" alt=""></span>
                    <span class="linha-nome">${item.nomeProduto}</span>
                    <span class="linha-tags">${trocaItemHtml(item)}</span>
                    <span class="linha-valor">${precoFormatado}</span>
                    <div class="quantidade-historico"><span>${item.quantidade}</span></div>
                    <span class="linha-valor">${subtotalFormatado}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="historico-card">
                <div class="cabecalho-historico">
                    <span class="icone-entrega"><img src="/public/images/historico-encomenda.svg" alt=""></span>
                    <span class="titulo-historico">Compra de ${dataFormatada}</span>
                    <span class="${status.tag}">${status.texto}</span>
                </div>

                <div class="conteudo-historico">
                    ${itensHtml}
                </div>

                <div class="${status.rodape}">
                    ${acaoHtml}
                    <span class="label-rodape">Total do Pedido:</span>
                    <span class="linha-valor">${totalFormatado}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Lê os itens marcados no modal e valida a quantidade de cada um
function coletarItensTroca(modal) {
    const itens = [];

    for (const linha of modal.querySelectorAll('.item-troca')) {
        const check = linha.querySelector('.troca-check');

        if (!check.checked) {
            continue;
        }

        const campo = linha.querySelector('.troca-qtd');
        const quantidade = Number(campo.value);
        const maximo = Number(campo.max);

        if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > maximo) {
            return {
                itens: [],
                erro: `Informe uma quantidade entre 1 e ${maximo} para cada item selecionado.`
            };
        }

        itens.push({ itemId: Number(check.value), quantidade });
    }

    if (itens.length === 0) {
        return { itens, erro: 'Selecione ao menos um item para trocar.' };
    }

    return { itens, erro: null };
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