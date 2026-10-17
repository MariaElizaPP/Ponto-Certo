const cron = require('node-cron');
const { CarrinhoService } = require('../service/carrinhoService');

function iniciarJobsCarrinho() {
    const service = new CarrinhoService();

    cron.schedule('*/10 * * * * *', async () => {   // a cada minuto
        try {
            await service.avisarExpiracao();
            const expirados = await service.expirarCarrinhos();
            if (expirados > 0) console.log(`${expirados} carrinho(s) expirado(s).`);
        } catch (error) {
            console.error('Erro no job do carrinho:', error);
        }
    });
}

module.exports = { iniciarJobsCarrinho };