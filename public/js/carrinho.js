const clienteId = localStorage.getItem('clienteId');

let itensCarrinho = [];
let freteAtual = 0;

document.addEventListener('DOMContentLoaded', async () => {
    if (!clienteId) {
        window.location.href = '/login.html';
        return;
    }
    await carregarCarrinho();
});

async function carregarCarrinho() {
    try {
        const res = await fetch(`http://localhost:3000/api/carrinho/${clienteId}`);
        if (!res.ok) throw new Error(`Erro ${res.status} ao carregar o carrinho`);

        itensCarrinho = await res.json();
        renderizarItens(itensCarrinho);
    } catch (erro) {
        console.error('Falha ao carregar o carrinho:', erro);
    }
}

function renderizarItens(lista) {
    const corpoTabela = document.querySelector('.tabela-carrinho tbody');
    corpoTabela.innerHTML = '';

    if (lista.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="4" class="mensagem-vazio">Seu carrinho está vazio.</td></tr>';
        atualizarResumo();
        return;
    }

    lista.forEach(produto => {
        const linha = document.createElement('tr');
        linha.classList.add('produto-linha');
        linha.dataset.preco = produto.itm_precoUnitario;
        linha.dataset.vprId = produto.itm_vpr_id;

        linha.innerHTML = `
            <td class="celula-produto">
              <button class="botao-remover" data-modal="modal-abrir-${produto.itm_vpr_id}">
                <img src="/public/images/remover-carrinho.svg" alt="remover botao">
              </button>
              <dialog id="modal-abrir-${produto.itm_vpr_id}" class="modal-abrir">
                  <img class="icone-erro" src="/public/images/modal-alerta.svg" alt="erro-modal">
                  <h3>Remover Produto?</h3>
                  <span>Você realmente deseja remover o item do seu carrinho?</span>
                  <div class="botoes-modais">
                    <button class="btn-modal-cancelar" data-modal="modal-abrir-${produto.itm_vpr_id}">Cancelar</button>
                    <button class="btn-modal-fechar btn-tema-alerta" data-modal="modal-abrir-${produto.itm_vpr_id}" data-vpr-id="${produto.itm_vpr_id}">Remover</button>
                  </div>
              </dialog>
              <img src="${produto.vpr_imgUrl}" alt="${produto.prd_nome}">
              <span class="nome-produto-carrinho">${produto.prd_nome}</span>
            </td>

            <td class="preco-unitario">${formatarPreco(produto.itm_precoUnitario)}</td>

            <td>
              <div class="quantidade">
                <button class="botao-diminuir" aria-label="Diminuir quantidade">-</button>
                <span class="quantidade-valor">${produto.itm_quantidade}</span>
                <button class="botao-aumentar" aria-label="Aumentar quantidade">+</button>
              </div>
            </td>

            <td class="total-produto">${formatarPreco(produto.itm_precoUnitario * produto.itm_quantidade)}</td>
        `;
        corpoTabela.appendChild(linha);
    });

    atualizarResumo();
}

document.addEventListener('click', async (evento) => {
    const linha = evento.target.closest('.produto-linha');
    if (!linha) return;

    const quantidadeEl = linha.querySelector('.quantidade-valor');
    const totalProdutoEl = linha.querySelector('.total-produto');
    const precoUnitario = parseFloat(linha.dataset.preco);
    const vprId = Number(linha.dataset.vprId);

    if (evento.target.closest('.botao-aumentar')) {
        await alterarQuantidade(linha, quantidadeEl, totalProdutoEl, precoUnitario, vprId, +1);
    }

    if (evento.target.closest('.botao-diminuir')) {
        await alterarQuantidade(linha, quantidadeEl, totalProdutoEl, precoUnitario, vprId, -1);
    }

    const botaoRemoverConfirmado = evento.target.closest('.btn-modal-fechar');
    if (botaoRemoverConfirmado && botaoRemoverConfirmado.dataset.vprId) {
        await removerItem(linha, Number(botaoRemoverConfirmado.dataset.vprId));
    }
});

async function alterarQuantidade(linha, quantidadeEl, totalProdutoEl, precoUnitario, vprId, delta) {
    const quantidadeAtual = parseInt(quantidadeEl.textContent);
    const novaQuantidade = quantidadeAtual + delta;

    if (novaQuantidade < 1) return; 

    try {
        const res = await fetch('http://localhost:3000/api/itens', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cliId: Number(clienteId), vprId, quantidade: novaQuantidade })
        });

        if (!res.ok) {
            const erroBody = await res.json().catch(() => ({}));
            throw new Error(erroBody.mensagem || `Erro ${res.status} ao atualizar quantidade`);
        }

        quantidadeEl.textContent = novaQuantidade;
        totalProdutoEl.textContent = formatarPreco(precoUnitario * novaQuantidade);

        const itemEstado = itensCarrinho.find(i => i.itm_vpr_id === vprId);
        if (itemEstado) itemEstado.itm_quantidade = novaQuantidade;

        atualizarResumo();
    } catch (erro) {
        console.error('Falha ao atualizar quantidade:', erro.message);
        exibirErroServidor(erro.message);
    }
}

async function removerItem(linha, vprId) {
    try {
        const res = await fetch('http://localhost:3000/api/deletarItem', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cliId: Number(clienteId), vprId }) 
        });

        if (!res.ok) throw new Error(`Erro ${res.status} ao remover item`);

        linha.remove();
        itensCarrinho = itensCarrinho.filter(i => i.itm_vpr_id !== vprId);
        atualizarResumo();
    } catch (erro) {
        console.error('Falha ao remover item do carrinho:', erro);
        exibirErroServidor('Falha ao remover item do carrinho');
    }
}

function atualizarResumo() {
    const linhas = document.querySelectorAll('.produto-linha');
    let subtotal = 0;

    linhas.forEach(linha => {
        const preco = parseFloat(linha.dataset.preco);
        const quantidade = parseInt(linha.querySelector('.quantidade-valor').textContent);
        subtotal += preco * quantidade;
    });

    document.querySelector('.valor-subtotal').textContent = formatarPreco(subtotal);
    document.querySelector('.valor-total').textContent = formatarPreco(subtotal + freteAtual);
}

function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


document.querySelector('.botao-consultar-frete').addEventListener('click', consultarFrete);

async function buscarDadosCep(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) throw new Error('CEP inválido');

    const resposta = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepLimpo}`);
    if (!resposta.ok) throw new Error('CEP não encontrado');

    return await resposta.json();
}

async function consultarFrete() {
    const cep = document.querySelector('.input-cep').value;

    if (!cep) {
        console.error('Informe um CEP.');
        return;
    }

    try {
        const dadosCep = await buscarDadosCep(cep);

        const itensParaFrete = itensCarrinho.map(item => ({
            itm_vpr_id: item.itm_vpr_id,
            itm_quantidade: item.itm_quantidade
        }));

        const res = await fetch('http://localhost:3000/api/estimar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: dadosCep.state, itens: itensParaFrete })
        });

        if (!res.ok) throw new Error(`Erro ${res.status} ao estimar frete`);

        const frete = await res.json();
        freteAtual = Number(frete.valorFrete);

        document.querySelector('.valor-frete').textContent = formatarPreco(freteAtual);
        atualizarResumo();

    } catch (erro) {
        console.error('Falha ao consultar frete:', erro);
        exibirErroServidor('Falha ao consultar frete');
    }
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
