

const CORES = ['#6D5960', '#e63946', '#1d3557', '#2a9d8f', '#f4a261', '#6a4c93', '#8d99ae', '#06d6a0', '#ef476f'];
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const ctx = document.getElementById('myChart').getContext('2d');
const erro = document.getElementById('erro');
const listaCategorias = document.getElementById('listaCategorias');
const todasOpcoes = document.getElementById('todas-opcoes');
let myChart = null;

// Monta os parâmetros. Retorna null se o preenchimento estiver incompleto.
function filtros() {
    const mesInicio = document.getElementById('mesInicio').value;
    const mesFim = document.getElementById('mesFim').value;
    const ano = document.getElementById('ano').value;
    const params = new URLSearchParams();

    if ((mesInicio || mesFim) && !ano) {
        erro.textContent = 'Selecione o ano.';
        return null;
    }

    // Só o ano: janeiro a dezembro. Mês vazio completa o lado que faltou.
    if (ano) {
        params.append('dataInicio', `${ano}-${mesInicio || '01'}`);
        params.append('dataFinal', `${ano}-${mesFim || '12'}`);
    }

    const selecionadas = [...document.querySelectorAll('.cat-check:checked')].map(c => c.value);
    if (selecionadas.length) params.append('categorias', selecionadas.join(','));

    return params;
}

async function carregarCategorias() {
    const resp = await fetch(`http://localhost:3000/api/categorias`);
    const categorias = await resp.json();

    listaCategorias.innerHTML = categorias.map(c => `
    <div class="item-categoria">
        <input type="checkbox" class="cat-check" id="cat-${c.cat_id}" value="${c.cat_id}">
        <label for="cat-${c.cat_id}">${c.cat_nome}</label>
    </div>
`).join('');
}

// "Selecionar Tudo" marca/desmarca todas
todasOpcoes.addEventListener('change', () => {
    document.querySelectorAll('.cat-check').forEach(c => c.checked = todasOpcoes.checked);
});

// Mantém o "Selecionar Tudo" coerente quando se marca uma por uma
listaCategorias.addEventListener('change', () => {
    const todas = [...document.querySelectorAll('.cat-check')];
    todasOpcoes.checked = todas.length > 0 && todas.every(c => c.checked);
});

async function carregarGrafico() {
    erro.textContent = '';

    const params = filtros();
    if (!params) return;

    const resp = await fetch(`http://localhost:3000/api/dashboard?${params}`);
    const dados = await resp.json();

    if (!resp.ok) {
        erro.textContent = dados.mensagem;
        return;
    }

    const config = {
        type: 'line',
        data: {
            labels: dados.labels,
            datasets: dados.series.map((s, i) => ({
                label: s.categoria,
                data: s.valores,
                fill: false,
                borderColor: CORES[i % CORES.length],
                backgroundColor: CORES[i % CORES.length],
                tension: 0.1
            }))
        },
        options: {
            interaction: { mode: 'nearest', intersect: true },
            scales: {
                x: { title: { display: true, text: 'Período (mês/ano)' } },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Vendas (R$)' },
                    ticks: { callback: (valor) => brl.format(valor) }
                }
            },
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: (item) => `${item.dataset.label}: ${brl.format(item.parsed.y)}`
                    }
                }
            }
        }
    };

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, config);
}

async function exportar() {
    erro.textContent = '';

    const params = filtros();
    if (!params) return;

    const resp = await fetch(`http://localhost:3000/api/exportacao/vendas?${params}`);
    if (!resp.ok) {
        const dados = await resp.json();
        erro.textContent = dados.mensagem;
        return;
    }

    const url = URL.createObjectURL(await resp.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = 'historico-vendas.csv';
    link.click();
    URL.revokeObjectURL(url);
}

document.getElementById('filtrar').addEventListener('click', carregarGrafico);
document.getElementById('exportar').addEventListener('click', exportar);

carregarCategorias();
carregarGrafico();