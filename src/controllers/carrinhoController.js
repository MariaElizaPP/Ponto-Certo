const {CarrinhoService} = require ('../service/carrinhoService');

async function adicionarItem(req, res) {
    try {

        const service = new CarrinhoService();
        const {cliId, vprId, quantidade} = req.body

        const resultado = await service.adicionarItem(cliId, vprId, quantidade);
        return res.status(201).json(resultado);

        
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        const mensagem = error.mensagem || 'Erro ao adicionar item ao carrinho';
        return res.status(status).json({ mensagem });
    }
}

async function mostrarCarrinho(req, res) {
    try {
        const service = new CarrinhoService();

        const resultado = await service.mostrarCarrinho(req.params.cliId);
        return res.status(200).json(resultado);
    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        const mensagem = error.mensagem || 'Erro ao mostrar o carrinho';
        return res.status(status).json({ mensagem });
    }
}

module.exports = {adicionarItem, mostrarCarrinho};