
const CORES = ['#6D5960', '#e63946', '#1d3557', '#2a9d8f', '#f4a261', '#6a4c93', '#8d99ae', '#06d6a0', '#ef476f'];
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const ctx = document.getElementById('myChart').getContext('2d');
const erro = document.getElementById('erro');
let myChart = null;

function filtros() {
    const selecionadas = [...document.getElementById('categorias').selectedOptions].map(o => o.value);
    const params = new URLSearchParams();

    const inicio = document.getElementById('inicio').value;
    const fim = document.getElementById('fim').value;

    if (inicio) params.append('dataInicio', inicio);
    if (fim) params.append('dataFinal', fim);
    if (selecionadas.length) params.append('categorias', selecionadas.join(','));

    return params;
}

async function carregarCategorias() {
    const resp = await fetch(`http://localhost:3000/api/categorias`); 
    const categorias = await resp.json();

    document.getElementById('categorias').innerHTML = categorias
        .map(c => `<option value="${c.cat_id}">${c.cat_nome}</option>`)
        .join('');
}

async function carregarGrafico() {
    erro.textContent = '';

    const resp = await fetch(`http://localhost:3000/api/dashboard?${filtros()}`);
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

    const resp = await fetch(`http://localhost:3000/api/exportacao/vendas?${filtros()}`);
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