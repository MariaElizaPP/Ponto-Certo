const { DashboardService } = require('../service/dashboardService');

async function vendas(req, res) {
    try {
        const service = new DashboardService();
        const { categorias, dataInicio, dataFinal } = req.query;
        const grafico = await service.vendas({categorias, dataInicio, dataFinal });
        return res.status(200).json(grafico);

    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao carregar gráfico' });
    }
    
}

module.exports = { vendas };

