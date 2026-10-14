const pool = require('../config/database');
/*const parametros = require('../util/parametros');*/

class CarrinhoModel {

    /* loucura 
    async buscarTempoBloqueioMin() {
        return parametros.carrinhoTempoBloqueioMin;
    }*/

    /**antigo 


    async buscarEstoquePorVariacao(vprId) {
        const [linhas] = await pool.execute(`SELECT est_quantidade FROM estoque WHERE est_vpr_id = ?`, [vprId]);

        return linhas[0];
    }
    */

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
            `SELECT itm_id, itm_quantidade, itm_precoUnitario, itm_expirado FROM item_carrinho WHERE itm_crr_id = ? AND itm_vpr_id = ?`,
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

    async reativarItem(itmId, quantidade, precoUnitario) {
        await pool.execute(`
            UPDATE item_carrinho
            SET itm_quantidade = ?, itm_precoUnitario = ?, itm_expirado = 0
            WHERE itm_id = ?
        `, [quantidade, precoUnitario, itmId]);
    }

    async deletarItem(vprId, crrId) {
        await pool.execute(
            `DELETE from item_carrinho WHERE itm_crr_id = ? AND itm_vpr_id = ?`,
            [crrId, vprId]
        );
    }

    async mostrarCarrinho(cliId) {
        const [resultado] = await pool.execute(`
            SELECT 
            c.crr_id,
            i.itm_id,
            i.itm_vpr_id, 
            i.itm_precoUnitario, 
            i.itm_quantidade, 
            i.itm_expirado, 
            p.prd_nome, 
            v.vpr_imgUrl 
            from carrinho c 
            JOIN item_carrinho i on i.itm_crr_id = c.crr_id 
            JOIN variacao_produto v on v.vpr_id = i.itm_vpr_id
            JOIN produtos p on p.prd_id = v.vpr_prd_id
            WHERE c.crr_cli_id = ?`,
            [cliId]);

        return resultado;
    }

    async renovarBloqueio(crrId, tempoMin) {
        await pool.execute(`
            UPDATE carrinho
            SET crr_expiraEm = NOW() + INTERVAL ? MINUTE, crr_avisadoEm = NULL
            WHERE crr_id = ?
        `, [tempoMin, crrId]);
    }

    async buscarPrazo(crrId) {
        const [[linha]] = await pool.execute(`
            SELECT
                UNIX_TIMESTAMP(crr_expiraEm) * 1000 AS expiraEmMs,
                UNIX_TIMESTAMP(NOW()) * 1000 AS agoraMs
            FROM carrinho
            WHERE crr_id = ?
        `, [crrId]);
        return {
            expiraEmMs: linha.expiraEmMs !== null ? Number(linha.expiraEmMs) : null,
            agoraMs: Number(linha.agoraMs)
        };
    }

    async expirarCarrinhos() {
        const conexao = await pool.getConnection();
        try {
            await conexao.beginTransaction();

            const [vencidos] = await conexao.execute(
                `
                SELECT crr_id
                FROM carrinho
                WHERE crr_expiraEm IS NOT NULL
                    AND crr_expiraEm <= NOW()
                FOR UPDATE
                `
            );

            if (vencidos.length === 0) {
                await conexao.commit();
                return 0;
            }

            const ids = vencidos.map(v => v.crr_id);

            await conexao.query(`
                UPDATE estoque e
                JOIN (
                    SELECT
                        i.itm_vpr_id,
                        SUM(i.itm_quantidade) AS qtd
                    FROM item_carrinho i
                    WHERE i.itm_crr_id IN (?)
                    AND i.itm_expirado = 0
                    GROUP BY i.itm_vpr_id
                ) x ON x.itm_vpr_id = e.est_vpr_id
                SET e.est_bloqueado =
                    GREATEST(e.est_bloqueado - x.qtd, 0)
            `, [ids]);

            await conexao.query(
                `UPDATE item_carrinho SET itm_expirado = 1 WHERE itm_crr_id IN (?) AND itm_expirado = 0`, [ids]
            );
            await conexao.query(
                `UPDATE carrinho SET crr_expiraEm = NULL, crr_avisadoEm = NULL WHERE crr_id IN (?)`, [ids]
            );

            await conexao.commit();
            return ids.length;
        } catch (error) {
            await conexao.rollback();
            throw error;
        } finally {
            conexao.release();
        }
    }

    async avisarExpiracaoProxima(minutosAviso) {
        const conexao = await pool.getConnection();
        try {
            await conexao.beginTransaction();

            const [carrinhos] = await conexao.execute(`
                SELECT crr_id, crr_cli_id FROM carrinho
                WHERE crr_expiraEm > NOW()
                  AND crr_expiraEm <= NOW() + INTERVAL ? MINUTE
                  AND crr_avisadoEm IS NULL
                FOR UPDATE
            `, [minutosAviso]);

            for (const c of carrinhos) {
                await conexao.execute(
                    `INSERT INTO notificacao (ntf_cli_id, ntf_mensagem) VALUES (?, ?)`,
                    [c.crr_cli_id, `Os itens do seu carrinho serão removidos em até ${minutosAviso} minutos. Finalize sua compra!`]
                );
                await conexao.execute(
                    `UPDATE carrinho SET crr_avisadoEm = NOW() WHERE crr_id = ?`, [c.crr_id]
                );
            }

            await conexao.commit();
            return carrinhos.length;
        } catch (error) {
            await conexao.rollback();
            throw error;
        } finally {
            conexao.release();
        }
    }



}

module.exports = { CarrinhoModel };