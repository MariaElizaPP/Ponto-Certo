const { TrocaService } = require ('../service/trocaService');

async function solicitar(req, res){
    try {
        const service = new TrocaService();
        const {cliId, pedidoId, itens} = req.body;
        const solicitacao = await service.solicitar(cliId, pedidoId, itens);
        return res.status(201).json(solicitacao);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        const mensagem = error.mensagem || 'Erro ao solicitar a troca';
        return res.status(status).json({ mensagem });
    }
}

async function solicitacoes (req,res) {

    try {
        const service = new TrocaService();

        const solicitacoes = await service.solicitacoes();
        return res.status(200).json(solicitacoes);
        
    } catch (error) {

        console.log(error);
        return res.status(500).json({mensagem: 'Erro ao carregar as solicitações'})
        
    }
    
}

async function autorizar(req,res) {
     try {
        const service = new TrocaService();
        const {trocaId} = req.params;
        const solicitacoes = await service.autorizar(trocaId);
        return res.status(200).json(solicitacoes);
        
    } catch (error) {

        console.log(error);
        return res.status(500).json({mensagem: 'Erro ao autorizar troca'})
        
    }
    
}

async function confirmarRecebimento(req,res) {
     try {
        const service = new TrocaService();
        const {trocaId} = req.params;
        const {retornaEstoque} = req.body;
        const solicitacoes = await service.confirmarRecebimento(trocaId, retornaEstoque);
        return res.status(200).json(solicitacoes);
        
    } catch (error) {

        console.log(error);
        return res.status(500).json({mensagem: 'Erro ao confirmar o recebimento da troca'})
        
    }
    
}

async function reprovarTroca(req, res) {
    try {
        const service = new TrocaService();
        const {trocaId} = req.params;
        const solicitacoes = await service.reprovar(trocaId);
        return res.status(200).json(solicitacoes);
        
    } catch (error) {

        console.log(error);
        return res.status(500).json({mensagem: 'Erro ao reprovar a troca'})
        
    }
}


module.exports = {solicitar, solicitacoes, autorizar, reprovarTroca, confirmarRecebimento};