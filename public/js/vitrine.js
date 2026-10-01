let produtos = [];
const categoriasSelecionadas = new Set();

document.addEventListener('DOMContentLoaded', async () => {
    await carregarMarcas();
    await carregarCategorias();
    await carregarVitrine();
});

document.addEventListener('change', (evento) => {
    if (evento.target.matches('input[name="marca"], input[name="preco"]')) {
        carregarVitrine();
    }
});

document.addEventListener('click', (evento) => {
    const link = evento.target.closest('.subcategoria-lista a');
    if (!link || !link.dataset.catId) return;

    evento.preventDefault();
    const catId = link.dataset.catId;

    if (categoriasSelecionadas.has(catId)) {
        categoriasSelecionadas.delete(catId);
        link.classList.remove('selecionado');
    } else {
        categoriasSelecionadas.add(catId);
        link.classList.add('selecionado');
    }

    carregarVitrine();
});

function montarQueryString() {
    const params = new URLSearchParams();

    const marcasAtivas = [...document.querySelectorAll('input[name="marca"]:checked')].map(i => i.value);
    marcasAtivas.forEach(id => params.append('marcas', id)); 

    const precosAtivos = [...document.querySelectorAll('input[name="preco"]:checked')].map(i => i.value);
    precosAtivos.forEach(chave => params.append('faixasPreco', chave)); 

    categoriasSelecionadas.forEach(id => params.append('categorias', id));

    return params.toString();
}

async function carregarVitrine() {
    try {
        const query = montarQueryString();
        const res = await fetch(`http://localhost:3000/api/vitrine?${query}`);

        if (!res.ok) {
            throw new Error(`Erro ${res.status} ao buscar produtos`);
        }

        produtos = await res.json();
        renderizarProdutos(produtos);
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

async function carregarMarcas() {
    try {
        const res = await fetch('http://localhost:3000/api/marcas');
        const marcas = await res.json();

        const container = document.querySelector('.opcoes-marca');
        container.innerHTML = '';

        marcas.forEach(marca => {
            const label = document.createElement('label');
            label.classList.add('checkbox');
            label.innerHTML = `
                <input type="checkbox" name="marca" value="${marca.mrc_id}">
                <span class="checkbox-texto">${marca.mrc_nome}</span>
            `;
            container.appendChild(label);
        });
    } catch (error) {
        console.error('Erro ao carregar marcas:', error);
    }
}

async function carregarCategorias() {
    try {
        const res = await fetch('http://localhost:3000/api/categorias');
        const categorias = await res.json();

        document.querySelectorAll('.subcategoria-lista a').forEach(link => {
            const nomeLink = normalizar(link.textContent);
            const categoria = categorias.find(c => normalizar(c.cat_nome) === nomeLink);

            if (categoria) {
                link.dataset.catId = categoria.cat_id;
            } else {
                console.warn(`Categoria "${link.textContent.trim()}" não encontrada no banco.`);
            }
        });
    } catch (erro) {
        console.error('Erro ao carregar categorias:', erro);
    }
}

function normalizar(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}