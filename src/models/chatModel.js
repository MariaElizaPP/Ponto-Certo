const pool = require('../config/database');

const STATUS_CONTABILIZADOS = ['APROVADA', 'EM TRANSPORTE', 'ENTREGUE'];

class ChatModel {

    // Reaproveita a sessão se ela for do cliente; senão cria uma nova
    async obterOuCriarSessao(cliId, sessaoId) {
        if (sessaoId) {
            const [rows] = await pool.query(
                `SELECT ses_id AS id, ses_interacao_id AS interacaoId
                   FROM chat_sessao
                  WHERE ses_id = ? AND ses_cli_id = ?`,
                [sessaoId, cliId]
            );
            if (rows.length) return rows[0];
        }

        const [resultado] = await pool.query(
            'INSERT INTO chat_sessao (ses_cli_id) VALUES (?)',
            [cliId]
        );
        return { id: resultado.insertId, interacaoId: null };
    }

    async atualizarInteracao(sessaoId, interacaoId) {
        await pool.query(
            'UPDATE chat_sessao SET ses_interacao_id = ? WHERE ses_id = ?',
            [interacaoId, sessaoId]
        );
    }

    // Retorna o id da mensagem criada
    async salvarMensagem(sessaoId, remetente, conteudo, produtoIds = null) {
        const [resultado] = await pool.query(
            `INSERT INTO chat_mensagem (msg_ses_id, msg_remetente, msg_conteudo, msg_produtos)
             VALUES (?, ?, ?, ?)`,
            [sessaoId, remetente, conteudo, produtoIds ? JSON.stringify(produtoIds) : null]
        );
        return resultado.insertId;
    }

    // Produtos comprados pelo cliente, do mais recente para o mais antigo
    async buscarPedidosRecentes(cliId, limite) {
        const limiteInt = parseInt(limite, 10) || 10; // Garante que é número

        const [rows] = await pool.query(
            `SELECT pr.prd_id AS id,
                    pr.prd_nome AS nome,
                    GROUP_CONCAT(DISTINCT c.cat_nome SEPARATOR ', ') AS categoria
               FROM pedidos p
               JOIN status_pedidos sp     ON sp.stp_id = p.ped_stp_id
               JOIN item_pedido ip        ON ip.itm_ped_id = p.ped_id
               JOIN variacao_produto v    ON v.vpr_id = ip.itm_vpr_id
               JOIN produtos pr           ON pr.prd_id = v.vpr_prd_id
               LEFT JOIN produto_categoria pc ON pc.prc_prd_id = pr.prd_id
               LEFT JOIN categorias c         ON c.cat_id = pc.prc_cat_id
              WHERE p.ped_cli_id = ?
                AND sp.stp_status IN (?)
              GROUP BY pr.prd_id, pr.prd_nome
              ORDER BY MAX(p.ped_realizadoEm) DESC
              LIMIT ?`,
            [cliId, STATUS_CONTABILIZADOS, limiteInt]
        );
        return rows;
    }

    // Busca por nome do produto ou da categoria (qualquer um dos termos)
    async buscarProdutosPorTermos(termos, limite) {
        if (!termos || !termos.length) return [];

        const limiteInt = parseInt(limite, 10) || 10; // Garante que é número

        const condicoes = termos
            .map(() => '(pr.prd_nome LIKE ? OR c.cat_nome LIKE ?)')
            .join(' OR ');
        const parametros = termos.flatMap(t => [`%${t}%`, `%${t}%`]);

        const [rows] = await pool.query(
            `SELECT pr.prd_id AS id,
                    pr.prd_nome AS nome,
                    MIN(pr.prd_preco) AS preco,
                    GROUP_CONCAT(DISTINCT c.cat_nome SEPARATOR ', ') AS categoria
               FROM produtos pr
               JOIN variacao_produto v ON v.vpr_prd_id = pr.prd_id
               LEFT JOIN produto_categoria pc ON pc.prc_prd_id = pr.prd_id
               LEFT JOIN categorias c         ON c.cat_id = pc.prc_cat_id
              WHERE ${condicoes}
              GROUP BY pr.prd_id, pr.prd_nome
              LIMIT ?`,
            [...parametros, limiteInt]
        );
        return rows;
    }

    //Adicione este método no seu ChatModel
    async buscarHistoricoMensagens(sessaoId) {
        const [rows] = await pool.query(
            `SELECT msg_remetente AS remetente, msg_conteudo AS conteudo
                FROM chat_mensagem
                WHERE msg_ses_id = ?
                ORDER BY msg_id DESC
                LIMIT 10`,
            [sessaoId]
        );
        // Inverte para ficar da mais antiga para a mais recente
        return rows.reverse();
    }

    async salvarFeedback(msgId, feedback) {
        const [resultado] = await pool.query(
            `UPDATE chat_mensagem SET msg_feedback = ? WHERE msg_id = ?`,
            [feedback, msgId]
        );
        // 'resultado.affectedRows' informa quantas linhas do banco foram alteradas pelo UPDATE.
        // Se for maior que 0, significa que encontrou a mensagem e salvou o feedback com sucesso (retorna true).
        // Se for 0, significa que o ID da mensagem não existe no banco (retorna false).
        return resultado.affectedRows > 0;

    }
}

module.exports = { ChatModel };