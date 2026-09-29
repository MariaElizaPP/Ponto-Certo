const { PedidoService } = require('../service/pagamentoService');

async function listarDadosPagamento(req, res) {

    try {

        const service = new PedidoService();

        const {cliId} = req.params;
        
        const dados = await service.listarDadosPagamento(cliId);

        return res.status(200).json(dados);

    } catch (error) {

        console.error(error);

        if(error.status){
            return res.status(error.status).json({mensagem:error.mensagem});
        }

        return res.status(500).json({mensagem: 'Erro ao carregar dados'});

    }

}

async function finalizarPedido(req, res) {
    try {
        const service = new PedidoService();
        const { cliId, enderecoId, cartoes, cupons } = req.body;
 
        const resultado = await service.finalizarPedido( cliId, enderecoId, cartoes, cupons );
 
        return res.status(201).json(resultado);
 
    } catch (error) {
        console.error(error);
 
        if (error.status) {
            return res.status(error.status).json({mensagem: error.mensagem, alteracoes: error.alteracoes});
        }
 
        return res.status(500).json({ mensagem: 'Erro ao finalizar o pedido.' });
    }
}

module.exports = { listarDadosPagamento, finalizarPedido }