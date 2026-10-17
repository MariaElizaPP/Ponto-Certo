const pool = require('../config/database');
class NotificacaoModel {
    async listarNaoLidas(cliId) {
        const [linhas] = await pool.execute(`
            SELECT ntf_id, ntf_mensagem, ntf_criadoEm
            FROM notificacao WHERE ntf_cli_id = ? AND ntf_lidaEm IS NULL
            ORDER BY ntf_criadoEm DESC
        `, [cliId]);
        return linhas;
    }

    async marcarLida(ntfId, cliId) {
        await pool.execute(
            `UPDATE notificacao SET ntf_lidaEm = NOW() WHERE ntf_id = ? AND ntf_cli_id = ?`,
            [ntfId, cliId]
        );
    }

    async criar(conexao, cliId, mensagem) {
        await conexao.execute(
            `INSERT INTO notificacao (ntf_cli_id, ntf_mensagem) VALUES (?, ?)`, [cliId, mensagem]
        );
    }

}

module.exports = { NotificacaoModel };