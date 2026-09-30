let produtos = [];

document.addEventListener('DOMContentLoaded', async () => {
    await carregarProdutos();
    renderizarProdutos(produtos); 
});

async function carregarProdutos() {
    try {
        const res = await fetch('http://localhost:3000/api/vitrine');

        if (!res.ok) {
            throw new Error(`Erro ${res.status} ao buscar produtos`);
        }

        produtos = await res.json();
    } catch (erro) {
        console.error('Falha ao carregar produtos:', erro);
    }
}

function renderizarProdutos(lista) {
    const grid = document.querySelector('.grid-produtos');
    grid.innerHTML = '';

    if (lista.length === 0) {
        grid.innerHTML = '<p class="mensagem-vazio">Nenhum produto encontrado.</p>';
        return;
    }

    lista.forEach(produto => {
        const card = document.createElement('div');
        card.classList.add('card-produto');
        card.innerHTML = `
            <div class="imagem-produto"><img src="${produto.prd_imgUrl}" alt="${produto.prd_nome}"></div>
            <h3 class="nome-produto">${produto.prd_nome}</h3>
            <div class="rodape-produto">
                <span class="preco-produto">${formatarPreco(produto.prd_preco)}</span>
                <a href="/detalhes.html?id=${produto.prd_id}">
                    <img src="/public/images/detalhes.svg" alt="detalhes">
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
}

function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}