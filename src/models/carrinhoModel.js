const pool = require('../config/database');

class CarrinhoModel {

    async buscarEstoquePorVariacao(vprId) {
        const [linhas] = await pool.execute(`SELECT est_quantidade FROM estoque WHERE est_vpr_id = ?`, [vprId]);

        return linhas[0];
    }

    async buscarPrecoVariacao(vprId) {
        const [linhas] = await pool.execute(
            `SELECT p.prd_preco FROM variacao_produto vp JOIN produtos p on p.prd_id = vp.vpr_prd_id WHERE vp.vpr_id = ?`, [vprId]
        );

        return linhas[0];
    }

    async buscarCarrinhoCliente(cliId) {
        const [linhas] = await pool.execute(
            `SELECT crr_id FROM carrinho WHERE crr_cli_id = ?`, [cliId]
        );
        return linhas[0];
    }

    async criarCarrinho(cliId) {
        const [resultado] = await pool.execute(
            `INSERT INTO carrinho (crr_cli_id) VALUES (?)`, [cliId]
        );
        return resultado.insertId;
    }

    async buscarItemCarrinho(crrId, vprId) {
        const [linhas] = await pool.execute(
            `SELECT itm_id, itm_quantidade, itm_precoUnitario FROM item_carrinho WHERE itm_crr_id = ? AND itm_vpr_id = ?`,
            [crrId, vprId]
        );
        return linhas[0];
    }

    async inserirItem(crrId, vprId, quantidade, precoUnitario) {
        await pool.execute(
            `INSERT INTO item_carrinho (itm_crr_id, itm_vpr_id, itm_quantidade, itm_precoUnitario) 
         VALUES (?, ?, ?, ?)`,
            [crrId, vprId, quantidade, precoUnitario]
        );
    }

    async atualizarQuantidadeItem(itmId, quantidade) {
        await pool.execute(
            `UPDATE item_carrinho SET itm_quantidade = ? WHERE itm_id = ?`,
            [quantidade, itmId]
        );
    }

    async deletarItem(vprId, crrId) {
        await pool.execute(
            `DELETE from item_carrinho WHERE itm_crr_id = ? AND itm_vpr_id = ?`,
            [vprId, crrId]
        );
    }

    async mostrarCarrinho(cliId) {
        const [resultado] = await pool.execute(`SELECT c.crr_id, i.itm_vpr_id, i.itm_precoUnitario, i.itm_quantidade, p.prd_nome, v.vpr_imgUrl from carrinho c 
            JOIN item_carrinho i on i.itm_crr_id = c.crr_id 
            JOIN variacao_produto v on v.vpr_id = i.itm_vpr_id
            JOIN produtos p on p.prd_id = v.vpr_id WHERE c.crr_cli_id = ?`,
        [cliId]);

        return resultado;
    }




}

module.exports = { CarrinhoModel };