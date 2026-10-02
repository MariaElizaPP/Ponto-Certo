const pool = require('../config/database');
const { CupomModel } = require('./cupomModel');


class PedidoModel {
    async finalizarPedido(cliId, enderecoId, valorFrete, itens, valorTotal, cuponsComputados, cartoesComputados, aprovado, troco) {
        const conexao = await pool.getConnection();
        const cupomModel = new CupomModel();

        try {
            await conexao.beginTransaction();

            const alteracoes = await this.conciliarEstoqueCarrinho(conexao, itens);
            if (alteracoes.length > 0) {
                await conexao.commit();
                return { alteracoes };
            }

            for (const c of cuponsComputados) {
                if (await cupomModel.usado(conexao, c.cpm_id)) {
                    throw { status: 400, mensagem: `Cupom ${c.cpm_codigo} já foi utilizado.` };
                }
            }

            const statusProcessando = await this.buscarStatusId('EM PROCESSAMENTO');
            const pedId = await this.criarPedido(conexao, cliId, statusProcessando, enderecoId, valorFrete, valorTotal);

            await this.inserirItens(conexao, pedId, itens);
            await this.inserirPagamento(conexao, pedId, valorTotal);

            for (const c of cartoesComputados) {
                await this.inserirPagamentoCartao(conexao, pedId, c.carId, c.valor);
            }
            for (const c of cuponsComputados) {
                await this.inserirPagamentoCupom(conexao, pedId, c.cpm_id, c.aplicado);
            }

            let cupomTroca = null;

            if (aprovado) {
                await this.atualizarStatus(conexao, pedId, await this.buscarStatusId('APROVADA'));
                await this.baixarEstoque(conexao, itens);

                if (troco.greaterThan(0)) {
                    cupomTroca = await cupomModel.criarCupomTroca(conexao, cliId, pedId, troco); // RN0036
                }

                await this.limparCarrinho(conexao, itens[0].crr_id);
            } else {
                await this.atualizarStatus(conexao, pedId, await this.buscarStatusId('REPROVADA'));
            }

            await conexao.commit();
            return { pedId, cupomTroca };

        } catch (error) {
            await conexao.rollback();
            console.log(error);
            throw error;
        } finally {
            conexao.release();
        }
    }


    async criarPedido(conexao, cliId, statusId, enderecoId, valorFrete, totalPedido) {
        const [resultado] = await conexao.execute(
            `INSERT INTO pedidos (ped_cli_id, ped_stp_id, ped_end_id, ped_valorFrete, ped_totalPedido)
             VALUES (?, ?, ?, ?, ?)`,
            [cliId, statusId, enderecoId, valorFrete.toFixed(2), totalPedido.toFixed(2)]
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

    async conciliarEstoqueCarrinho(conexao, itens) {
        const alteracoes = [];
        const ordenados = [...itens].sort((a, b) => a.itm_vpr_id - b.itm_vpr_id);

        for (const item of ordenados) {
            const [[estoque]] = await conexao.execute(
                `SELECT est_quantidade FROM estoque WHERE est_vpr_id = ? FOR UPDATE`,
                [item.itm_vpr_id]
            );
            const disponivel = estoque ? estoque.est_quantidade : 0;
            if (disponivel >= item.itm_quantidade) continue;

            if (disponivel <= 0) {
                await conexao.execute(
                    `DELETE FROM item_carrinho WHERE itm_crr_id = ? AND itm_vpr_id = ?`,
                    [item.crr_id, item.itm_vpr_id]
                );
            } else {
                await conexao.execute(
                    `UPDATE item_carrinho SET itm_quantidade = ? WHERE itm_crr_id = ? AND itm_vpr_id = ?`,
                    [disponivel, item.crr_id, item.itm_vpr_id]
                );
            }

            alteracoes.push({
                itm_vpr_id: item.itm_vpr_id,
                prd_nome: item.prd_nome,
                tipo: disponivel <= 0 ? 'REMOVIDO' : 'QUANTIDADE_AJUSTADA',
                quantidadeAnterior: item.itm_quantidade,
                quantidadeAtual: Math.max(disponivel, 0)
            });
        }
        return alteracoes;
    }

    async baixarEstoque(conexao, itens) {
        for (const item of itens) {
            await conexao.execute(
                `UPDATE estoque SET est_quantidade = est_quantidade - ? WHERE est_vpr_id = ?`,
                [item.itm_quantidade, item.itm_vpr_id]
            );
        }
    }

    async limparCarrinho(conexao, crrId) {
        await conexao.execute(`DELETE FROM item_carrinho WHERE itm_crr_id = ?`, [crrId]);
    }

    async historico(cliId) {
        const [resultado] = await pool.execute(`SELECT p.ped_id, p.ped_realizadoEm, p.ped_totalPedido, i.itm_id, i.itm_quantidade, i.itm_precoUnitario, v.vpr_imgUrl, pr.prd_nome, sp.stp_status
            FROM pedidos p
            JOIN item_pedido i on i.itm_ped_id = p.ped_id
            JOIN variacao_produto v on v.vpr_id = i.itm_vpr_id
            JOIN produtos pr on v.vpr_prd_id = pr.prd_id
            JOIN status_pedidos sp on p.ped_stp_id = sp.stp_id
            WHERE p.ped_cli_id = ?;`,
            [cliId]);

        return resultado;
    }

    async buscarPedido(cliId, pedId) {
    const [[pedido]] = await pool.execute(
        `SELECT p.ped_id, sp.stp_status
         FROM pedidos p
         JOIN status_pedidos sp ON p.ped_stp_id = sp.stp_id
         WHERE p.ped_id = ? AND p.ped_cli_id = ?`,
        [pedId, cliId]
    );
    return pedido;
}

async mudarStatus(pedId, novoStatus) {
    const novoId = await this.buscarStatusId(novoStatus);

    await pool.execute(
        `UPDATE pedidos SET ped_stp_id = ? WHERE ped_id = ?`,
        [novoId, pedId]
    );
}

async cancelarPedido(pedId) {
    const conexao = await pool.getConnection();

    try {
        await conexao.beginTransaction();

        const [[pedido]] = await conexao.execute(
            `SELECT sp.stp_status
             FROM pedidos p
             JOIN status_pedidos sp ON p.ped_stp_id = sp.stp_id
             WHERE p.ped_id = ? FOR UPDATE`,
            [pedId]
        );

        if (!pedido || !['EM PROCESSAMENTO', 'APROVADA'].includes(pedido.stp_status)) {
            throw { status: 409, mensagem: 'O status do pedido mudou. Atualize a página.' };
        }

        const canceladoId = await this.buscarStatusId('CANCELADO');
        await conexao.execute(`UPDATE pedidos SET ped_stp_id = ? WHERE ped_id = ?`, [canceladoId, pedId]);

        // o estoque só foi baixado quando a compra foi aprovada, então só devolve nesse caso
        if (pedido.stp_status === 'APROVADA') {
            const [itens] = await conexao.execute(
                `SELECT itm_vpr_id, itm_quantidade FROM item_pedido WHERE itm_ped_id = ?`, [pedId]
            );
            for (const item of itens) {
                await conexao.execute(
                    `UPDATE estoque SET est_quantidade = est_quantidade + ? WHERE est_vpr_id = ?`,
                    [item.itm_quantidade, item.itm_vpr_id]
                );
            }
        }

        await conexao.commit();
    } catch (error) {
        await conexao.rollback();
        console.log(error);
        throw error;
    } finally {
        conexao.release();
    }
}

}

module.exports = { PedidoModel }