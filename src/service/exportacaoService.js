const { DashboardService } = require('./dashboardService');

class ExportacaoService {

    async vendas(filtros) {
        const dashboardService = new DashboardService();
        const { labels, series } = await dashboardService.vendas(filtros);

        const cabecalho = ['Período', 'Categoria', 'Valor de venda'];
        const linhas = series.flatMap(s =>
            labels.map((periodo, i) => [periodo, s.categoria, s.valores[i]])
        );

        return {
            nomeArquivo: 'historico-vendas.csv',
            conteudo: this.gerarCsv(cabecalho, linhas)
        };
    }

    gerarCsv(cabecalho, linhas) {
        const formatar = (valor) => {
            if (typeof valor === 'number')
                return valor.toFixed(2).replace('.', ',');
            return `"${String(valor).replace(/"/g, '""')}"`;
        };

        const corpo = linhas.map(l => l.map(formatar).join(';'));

        return '\uFEFF' + [cabecalho.join(';'), ...corpo].join('\r\n');
    }
}

module.exports = { ExportacaoService };