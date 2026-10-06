const clienteId = localStorage.getItem('clienteId');
const params = new URLSearchParams(window.location.search);
const produtoId = params.get('id');

document.addEventListener('DOMContentLoaded', async () => {
    if (!clienteId || !produtoId) {
        window.location.href = '/login.html';
        return;
    }
    await carregarDetalhes();
});

let variacaoSelecionada = null;

function renderizarCores(variacoes) {
    const botaoAtual = document.getElementById('seletor-cor-atual');
    const lista = document.getElementById('seletor-cor-lista');
    lista.innerHTML = '';

    variacoes.forEach((variacao, indice) => {
        const item = document.createElement('li');
        item.classList.add('seletor-cor-item');
        item.dataset.vprId = variacao.id;
        item.innerHTML = `
            <img src="${variacao.imagemUrl}" alt="${variacao.cor}">
            <span>${variacao.cor} ${variacao.tamanho ? `- ${variacao.tamanho}` : ''}</span>
        `;

        item.addEventListener('click', () => selecionarVariacao(variacao));
        lista.appendChild(item);

        if (indice === 0) {
            selecionarVariacao(variacao);
        }
    });

    botaoAtual.addEventListener('click', () => {
        lista.classList.toggle('aberta');
    });

    document.addEventListener('click', (evento) => {
        if (!document.getElementById('seletor-cor').contains(evento.target)) {
            lista.classList.remove('aberta');
        }
    });
}

function selecionarVariacao(variacao) {
    variacaoSelecionada = variacao;

    document.querySelector('.seletor-cor-img').src = variacao.imagemUrl;
    document.querySelector('.seletor-cor-texto').textContent = `${variacao.cor} ${variacao.tamanho ? `- ${variacao.tamanho}` : ''}`;

    atualizarImagem(variacao.imagemUrl);

    document.getElementById('seletor-cor-lista').classList.remove('aberta');
}

function atualizarImagem(url) {
    document.querySelector('.img img').src = url;
}

async function carregarDetalhes() {
    try {
        const res = await fetch(`http://localhost:3000/api/detalhesProduto/${produtoId}`);

        if (!res.ok) {
            throw new Error(`Erro ${res.status} ao buscar detalhes`);
        }

        const detalhes = await res.json();

        document.querySelector('.nome-produto').textContent = detalhes.nome;
        document.querySelector('.texto').textContent = detalhes.descricao;
        document.querySelector('.preco').textContent = formatarPreco(detalhes.preco);
        document.querySelector('.img img').src = detalhes.imagemProduto;
        document.querySelector('.img img').alt = detalhes.nome;
        renderizarCores(detalhes.variacoes);

    } catch (error) {
        console.error('Erro ao carregar os detalhes do produto:', error);
    }
}

function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

document.querySelector('.btn-modal-abrir').addEventListener('click', async () => {
    if (!variacaoSelecionada) {
        mostrarToast('Nenhuma variação selecionada.');
        return;
    }

    const quantidade = Number(document.querySelector('.contar').textContent);

    if(!quantidade){ 
        mostrarToast('É necessário selecionar a quantidade'); 
        return; 
    }

    try {
        const res = await fetch('http://localhost:3000/api/carrinho/itens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cliId: Number(clienteId),
                vprId: variacaoSelecionada.id,
                quantidade
            })
        });

        const resultado = await res.json();

        if (!res.ok) {
            throw resultado;
        }

        document.getElementById('modal-abrir').showModal();

    } catch (erro) {
        console.error('Erro ao adicionar ao carrinho:', erro);
        exibirErroServidor(erro.mensagem || 'Erro ao atualizar quantidade.');
    }
});

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
