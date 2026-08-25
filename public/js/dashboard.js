const ctx = document.getElementById('myChart').getContext('2d');

const labels = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];

const data = {
    labels : labels,
    datasets: [{
        label: "Gráfico de Linha",
        data: [65, 59, 80, 81, 56, 40, 72, 85, 90, 78, 95, 110],
        fill: false,
        borderColor: '#6D5960',
        tension: 0.1,  
    }]
};

const config = {
    type:'line',
    data: data,
};

const myChart = new Chart(ctx, config);