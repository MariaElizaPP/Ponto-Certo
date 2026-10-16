const pool = require('../config/database');
const { CupomModel } = require('../models/cupomModel');
const { NotificacaoModel } = require('./notificacaoModel');

class TrocaModel {

    async quantidadeJaSolicitada(conexao, itemId) {
        const [[linha]] = await conexao.execute(`
        SELECT COALESCE(SUM(s.str_quantidade), 0) AS total
        FROM solicitacao_troca s
        JOIN status_troca st ON s.str_stt_id = st.stt_id
        WHERE s.str_itm_id = ? AND st.stt_status <> 'RECUSADO'
    `, [itemId]);
        return Number(linha.total);
    }

    async solicitar(statusId, pedidoId, itens, dataSolicitacao) {
        const conexao = await pool.getConnection();
        try {
            await conexao.beginTransaction();

            for (const item of itens) {
                const [[itemPedido]] = await conexao.execute(`
                SELECT itm_quantidade FROM item_pedido
                WHERE itm_id = ? AND itm_ped_id = ? FOR UPDATE
            `, [item.itemId, pedidoId]);

                if (!itemPedido) {
                    throw { status: 404, mensagem: `O item ${item.itemId} não pertence ao pedido.` };
                }

                const jaSolicitada = await this.quantidadeJaSolicitada(conexao, item.itemId);
                const disponivel = itemPedido.itm_quantidade - jaSolicitada;

                if (disponivel <= 0) {
                    throw { status: 409, mensagem: `O item ${item.itemId} não possui unidades disponíveis para troca.` };
                }

                if (item.quantidade > disponivel) {
                    throw {
                        status: 422,
                        mensagem: `Item ${item.itemId}: só é possível trocar até ${disponivel} unidade(s).`
                    };
                }

                await conexao.execute(`
                INSERT INTO solicitacao_troca (str_itm_id, str_stt_id, str_realizadoEm, str_quantidade)
                VALUES (?, ?, ?, ?)
            `, [item.itemId, statusId, dataSolicitacao, item.quantidade]);
            }

            await conexao.commit();
        } catch (error) {
            await conexao.rollback();
            throw error;
        } finally {
            conexao.release();
        }
    }


    async buscarStatusId(nome) {
        const [[status]] = await pool.execute(
            `SELECT stt_id FROM status_troca WHERE stt_status = ?`, [nome]
        );
        if (!status) throw new Error(`Status "${nome}" não cadastrado em status_troca.`);
        return status.stt_id;
    }

    //ficou por ficar( vai usar depois)
    async atualizarStatus(itemId, statusId) {
        await pool.execute(`UPDATE solicitacao_troca SET str_stt_id = ? WHERE str_itm_id = ?`, [statusId, itemId]);
    }


    async exibirSolicitacoes() {
        const [resultado] = await pool.execute(`
            SELECT 
                s.str_id, s.str_itm_id, s.str_quantidade,
                itp.itm_precoUnitario * s.str_quantidade AS valor,
                c.cli_nome, p.ped_id, pr.prd_nome, st.stt_status
            FROM
                solicitacao_troca s 
                JOIN status_troca st on s.str_stt_id = st.stt_id
                JOIN item_pedido itp on s.str_itm_id = itp.itm_id
                JOIN pedidos p on itp.itm_ped_id = p.ped_id
                JOIN cliente c on c.cli_id = p.ped_cli_id
                JOIN variacao_produto vp on itp.itm_vpr_id = vp.vpr_id
                JOIN produtos pr on vp.vpr_prd_id = pr.prd_id
            ORDER BY
                s.str_realizadoEm DESC;
        `)

        return resultado;
    }

    async aprovarTroca(trocaId, statusAprovadoId, statusPendenteId) {
        const conexao = await pool.getConnection();
        const cupomModel = new CupomModel();
        const notificacaoModel = new NotificacaoModel();
        try {
            await conexao.beginTransaction();

            const [[troca]] = await conexao.execute(`
            SELECT s.str_itm_id,
                   p.ped_cli_id,
                   itp.itm_precoUnitario * s.str_quantidade AS valor
            FROM solicitacao_troca s
            JOIN item_pedido itp ON s.str_itm_id = itp.itm_id
            JOIN pedidos p ON itp.itm_ped_id = p.ped_id
            WHERE s.str_id = ? AND s.str_stt_id = ?
            FOR UPDATE
        `, [trocaId, statusPendenteId]);


            if (!troca) {
                throw { status: 404, mensagem: 'Solicitação não encontrada ou já processada.' };
            }

            await this.aprovar(conexao, trocaId, statusAprovadoId);
            await cupomModel.trocaAprovarCupom(conexao, troca.ped_cli_id, troca.str_itm_id, Number(troca.valor));

            const valorFormatado = Number(troca.valor).toFixed(2).replace('.', ',');
            const mensagem = `Sua solicitação de troca foi autorizada. Um cupom de troca de R$ ${valorFormatado} foi disponibilizado para você.`;
            await notificacaoModel.criar(conexao, troca.ped_cli_id, mensagem.slice(0, 255));


            await conexao.commit();
        } catch (error) {
            await conexao.rollback();
            console.log(error);
            throw error;
        } finally {
            conexao.release();
        }
    }

    async aprovar(conexao, trocaId, statusId) {
        const [resultado] = await conexao.execute(`
            UPDATE solicitacao_troca SET str_stt_id = ? WHERE str_id = ?
            
        `, [statusId, trocaId]);

        return resultado;
    }

    async reprovar(trocaId, statusRecusadoId, statusPendenteId) {
        const [resultado] = await pool.execute(`
        UPDATE solicitacao_troca SET str_stt_id = ?
        WHERE str_id = ? AND str_stt_id = ?
    `, [statusRecusadoId, trocaId, statusPendenteId]);

        if (resultado.affectedRows === 0) {
            throw { status: 404, mensagem: 'Solicitação não encontrada ou já processada.' };
        }
    }


}

module.exports = { TrocaModel };