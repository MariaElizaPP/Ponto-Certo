const pool = require('../config/database');

class CupomModel{
    async buscarParaUso(codigos) {
        if (codigos.length === 0) return [];

        const marcadores = codigos.map(() => '?').join(',');
        const [linhas] = await pool.execute(
            `SELECT * FROM cupom WHERE cpm_codigo IN (${marcadores}) FOR UPDATE`,
            codigos
        );
        return linhas;
    }

    async usado(cpmId){
        const [[linha]] = await pool.execute(
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

    async criarCupomTroca(conn, cliId, pedId, valor) {
        const codigo = `TROCA-${pedId}-${Date.now().toString(36).toUpperCase()}`;

        await conn.execute(
            `INSERT INTO cupom (cpm_codigo, cpm_valor, cpm_tipoCupom, cpm_cli_id)
             VALUES (?, ?, 'T', ?)`,
            [codigo, valor.toFixed(2), cliId]
        );

        return { codigo, valor: valor.toNumber() };
    }
}

module.exports = {CupomModel};