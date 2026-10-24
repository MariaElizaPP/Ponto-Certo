const { ExportacaoService } = require('../service/exportacaoService');

const service = new ExportacaoService();

async function vendas(req, res) {
    try {
        const { categorias, dataInicio, dataFim } = req.query;
        const { nomeArquivo, conteudo } = await service.vendas({ categorias, dataInicio, dataFim });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
        return res.status(200).send(conteudo);

    } catch (error) {
        console.log(error);       
        return res.status(500).json({ mensagem: 'Erro ao exportar dados' });
    }
}

module.exports = { vendas };