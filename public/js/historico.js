
const STATUS_PEDIDO = {
    'EM PROCESSAMENTO': { texto: 'Em processamento', tag: 'tag-processamento', rodape: 'rodape-em-transito', acao: 'cancelar' },
    'APROVADA': { texto: 'Aprovada', tag: 'tag-processamento', rodape: 'rodape-em-transito', acao: 'cancelar' },
    'REPROVADA': { texto: 'Reprovada', tag: 'tag-negado', rodape: 'rodape-negado', acao: '' },
    'EM TRANSITO': { texto: 'Em trânsito', tag: 'tag-transito', rodape: 'rodape-em-transito', acao: '' },
    'ENTREGUE': { texto: 'Entregue', tag: 'tag-entregue', rodape: 'rodape-entregue', acao: 'confirmar' },
    'FINALIZADO': { texto: 'Finalizado', tag: 'tag-finalizado', rodape: 'rodape-finalizado', acao: 'trocar' },
    'TROCA SOLICITADA': { texto: 'Aguardando Aprovação', tag: 'tag-aguardando', rodape: 'rodape-troca-solicitada', acao: 'solicitada' },
    'TROCA APROVADA': { texto: 'Troca aprovada', tag: 'tag-finalizado', rodape: 'rodape-troca-aprovada', acao: '' },
    'TROCA NEGADA': { texto: 'Troca negada', tag: 'tag-negado', rodape: 'rodape-negado', acao: 'solicitada' }
};


const ACOES_PEDIDO = {
    cancelar: { rota: 'cancelar', sucesso: 'Pedido cancelado com sucesso.' },
    confirmar: { rota: 'confirmarEntrega', sucesso: 'Entrega confirmada com sucesso.' },
    trocar: { rota: 'solicitarTroca', sucesso: 'Troca solicitada com sucesso.' }
};

const clienteId = localStorage.getItem('clienteId');

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
    const botaoConfirmar = e.target.closest('.btn-tema-alerta[data-acao]');

    if (!botaoConfirmar) {
        return;
    }

    executarAcao(botaoConfirmar.dataset.acao, botaoConfirmar.dataset.pedId);
});

async function carregarHistorico() {
   
    try {
        const response = await fetch(`http://localhost:3000/api/historico/${clienteId}`);

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

async function executarAcao(acao, pedidoId) {
    const config = ACOES_PEDIDO[acao];

    if (!config) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/pedido/${pedidoId}/${config.rota}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cliId: clienteId })
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

function montarModalHtml(idModal, classeModal, titulo, texto, textoConfirmar, acao, pedidoId) {
    return `
        <dialog id="${idModal}" class="${classeModal}">
            <img class="icone-alerta" src="/public/images/modal-alerta.svg" alt="alerta-modal">
            <h3>${titulo}</h3>
            <span>${texto}</span>
            <div class="botoes-modais">
                <button class="btn-modal-cancelar" data-modal="${idModal}" type="button">Cancelar</button>
                <button class="btn-modal-fechar btn-tema-alerta" data-modal="${idModal}" data-acao="${acao}" data-ped-id="${pedidoId}" type="button">${textoConfirmar}</button>
            </div>
        </dialog>
    `;
}

function montarAcaoHtml(pedidoId, acao) {
    if (acao === 'cancelar') {
        const idModal = `modal-cancelar-${pedidoId}`;

        return `
            <button type="button" class="botao-cancelar" data-modal="${idModal}">Cancelar Compra</button>
            ${montarModalHtml(idModal, 'modal-confirmar-entrega', 'Cancelar o seu pedido?', 'Você deseja cancelar o recebimento de seu pedido?', 'Confirmar', acao, pedidoId)}
        `;
    }

    if (acao === 'confirmar') {
        const idModal = `modal-confirmar-${pedidoId}`;

        return `
            <button type="button" class="botao-confirmar" data-modal="${idModal}">Confirmar</button>
            ${montarModalHtml(idModal, 'modal-confirmar-entrega', 'Confirmar a entrega do pedido?', 'Você deseja confirmar o recebimento de seu pedido?', 'Confirmar', acao, pedidoId)}
        `;
    }

    if (acao === 'trocar') {
        const idModal = `modal-trocar-${pedidoId}`;

        return `
            <button type="button" class="botao-trocar" data-modal="${idModal}">Trocar</button>
            ${montarModalHtml(idModal, 'modal-solicitar-troca', 'Solicitar troca deste item?', 'Você deseja solicitar a troca deste produto? Essa ação enviará a solicitação para análise.', 'Solicitar troca', acao, pedidoId)}
        `;
    }

    if (acao === 'solicitada') {
        return '<span class="linha-rodape">Troca solicitada</span>';
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
        const acaoHtml = montarAcaoHtml(pedido.id, status.acao);

        const itensHtml = pedido.itens.map(item => {
            const precoFormatado = formatarMoeda(item.precoUnitario);
            const subtotalFormatado = formatarMoeda(Number(item.precoUnitario) * item.quantidade);

            return `
                <div class="item-historico">
                    <span class="img-historico"><img src="${item.imagemUrl}" alt=""></span>
                    <span class="linha-nome">${item.nomeProduto}</span>
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