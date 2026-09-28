const pool = require('../config/database');

class PedidoModel{
   async finalizarPedido(cliId, statusId, enderecoId, valorFrete, itens, valorPagamento) {
        const conexao = await pool.getConnection();

        try {
            await conexao.beginTransaction();

            const pedId = await this.criarPedido(conexao, cliId, statusId, enderecoId, valorFrete);
            await this.inserirItens(conexao, pedId, itens);
            await this.inserirPagamento(conexao, pedId, valorPagamento);

            await conexao.commit();
            return pedId;
        } catch (error) {
            await conexao.rollback();
            console.log(error);
            throw error;
        } finally {
            conexao.release();
        }
    }

    async criarPedido(conexao, cliId, statusId, enderecoId, valorFrete) {
        const [resultado] = await conexao.execute(
            `INSERT INTO pedidos (ped_cli_id, ped_stp_id, ped_end_id, ped_valorFrete)
             VALUES (?, ?, ?, ?)`,
            [cliId, statusId, enderecoId, valorFrete.toFixed(2)]
        );
        return resultado.insertId;
    }

    async atualizarStatus(conexao, pedId, statusId) {
        await conexao.execute(`UPDATE pedidos SET ped_stp_id = ? WHERE ped_id = ?`, [statusId, pedId]);
    }

    async inserirItens(conexao, pedId, itens) {
        for (const item of itens) {
            await conexao.execute(
                `INSERT INTO item_pedido (itm_ped_id, itm_vpr_id, itm_quantidade, itm_precoUnitario)
                 VALUES (?, ?, ?, ?)`,
                [pedId, item.itm_vpr_id, item.itm_quantidade, item.itm_precoUnitario]
            );
        }
    }

    async inserirPagamento(conexao, pedId, valor) {
        await conexao.execute(
            `INSERT INTO pagamento (pag_ped_id, pag_valor) VALUES (?, ?)`,
            [pedId, valor.toFixed(2)]
        );
    }

    async inserirPagamentoCartao(conexao, pedId, carId, valor) {
        await conexao.execute(
            `INSERT INTO pagamento_cartao (pca_ped_id, pca_car_id, pca_valorAplicado)
             VALUES (?, ?, ?)`,
            [pedId, carId, valor.toFixed(2)]
        );
    }

    async inserirPagamentoCupom(conexao, pedId, cpmId, valor) {
        await conexao.execute(
            `INSERT INTO pagamento_cupom (pcp_ped_id, pcp_cpm_id, pcp_valorAplicado)
             VALUES (?, ?, ?)`,
            [pedId, cpmId, valor.toFixed(2)]
        );
    }

    async buscarStatusId(nome) {
        const [[status]] = await pool.execute(
            `SELECT stp_id FROM status_pedidos WHERE stp_status = ?`, [nome]
        );
        if (!status) throw new Error(`Status "${nome}" não cadastrado em status_pedidos.`);
        return status.stp_id;
    }

     async limparCarrinho(conexao, crrId) {
        await conexao.execute(`DELETE FROM item_carrinho WHERE itm_crr_id = ?`, [crrId]);
    }

}

module.exports = {PedidoModel}