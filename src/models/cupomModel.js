const pool = require('../config/database');

class CupomModel {

    async buscarPorCodigos(codigos, cliId) {
        if (codigos.length === 0) return [];

        const marcadores = codigos.map(() => '?').join(',');
        const [linhas] = await pool.execute(
            `SELECT * FROM cupom WHERE cpm_codigo IN (${marcadores})`,
            codigos
        );
        return linhas;
    }

    async usado(conexao, cpmId) {
        await conexao.execute(`SELECT cpm_id FROM cupom WHERE cpm_id = ? FOR UPDATE`, [cpmId]);

        const [[linha]] = await conexao.execute(
            `SELECT 1 AS usado
               FROM pagamento_cupom pcp
               JOIN pedidos p ON p.ped_id = pcp.pcp_ped_id
               JOIN status_pedidos sp ON sp.stp_id = p.ped_stp_id
              WHERE pcp.pcp_cpm_id = ?
                AND sp.stp_status != 'REPROVADA'
              LIMIT 1`,
            [cpmId]
        );
        return !!linha;
    }

    async criarCupomTroca(conexao, cliId, pedId, valor) {
        const codigo = `TROCA-${pedId}-${Date.now().toString(36).toUpperCase()}`;

        await conexao.execute(
            `INSERT INTO cupom (cpm_codigo, cpm_valor, cpm_tipoCupom, cpm_cli_id)
             VALUES (?, ?, 'T', ?)`,
            [codigo, valor.toFixed(2), cliId]
        );

        return { codigo, valor: valor.toNumber() };
    }

    async buscarParaValidacao(codigo) {
        const [linhas] = await pool.execute(
            `SELECT c.cpm_id, c.cpm_codigo, c.cpm_valor, c.cpm_tipoCupom, c.cpm_cli_id,
                EXISTS (
                    SELECT 1
                      FROM pagamento_cupom pcp
                      JOIN pedidos p ON p.ped_id = pcp.pcp_ped_id
                      JOIN status_pedidos sp ON sp.stp_id = p.ped_stp_id
                     WHERE pcp.pcp_cpm_id = c.cpm_id
                       AND sp.stp_status != 'REPROVADA'
                ) AS usado
           FROM cupom c
          WHERE c.cpm_codigo = ?`,
            [codigo]
        );

        return linhas[0] || null;

        
    }

    async listarPorCliente(cliId) {
    const [linhas] = await pool.execute(
        `SELECT c.cpm_codigo, c.cpm_valor, c.cpm_tipoCupom
           FROM cupom c
          WHERE c.cpm_cli_id = ?
            AND NOT EXISTS (
                SELECT 1
                  FROM pagamento_cupom pcp
                  JOIN pedidos p ON p.ped_id = pcp.pcp_ped_id
                  JOIN status_pedidos sp ON sp.stp_id = p.ped_stp_id
                 WHERE pcp.pcp_cpm_id = c.cpm_id
                   AND sp.stp_status != 'REPROVADA'
            )
          ORDER BY c.cpm_id DESC`,
        [cliId]
    );
    return linhas;
    }
}



module.exports = { CupomModel };