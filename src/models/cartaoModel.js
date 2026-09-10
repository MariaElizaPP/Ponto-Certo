const pool = require('../config/database');

class CartaoModel {

    async cadastrarCartao(dados) {
        const conexao = await pool.getConnection();

        try {
            await conexao.beginTransaction();

            if (dados.preferencial === true) {
                await conexao.execute(
                    'UPDATE cartao SET car_preferencial = false WHERE car_cli_id = ?',
                    [dados.cliId]
                );
            }
            const [resultado] = await conexao.execute(`INSERT INTO cartao (car_cli_id, car_bdr_id, car_numero, car_nomeImpresso, car_cvv, car_preferencial)
         VALUES (?, ?, ?, ?, ?, ?)`, [
                dados.cliId,
                dados.bandeiraCartao,
                dados.numeroCartao,
                dados.nomeCartao,
                dados.cvv,
                dados.preferencial || false
            ]);

            await conexao.commit();
            return resultado;
        } catch (error) {
            await conexao.rollback();
            throw error;
        } finally {
            conexao.release();
        }


    }

    async listarCartoes(cliId) {
        const [linhas] = await pool.execute(`SELECT c.*, b.bdr_nome 
        FROM cartao AS c
        INNER JOIN bandeira as b ON c.car_bdr_id = b.bdr_id
        WHERE c.car_cli_id = ?`, [cliId]);
        return linhas;
    }

    async buscarPorId(cliId, id) {
        const [linhas] = await pool.execute(`SELECT * FROM cartao WHERE car_cli_id=? AND car_id=?`, [
            cliId,
            id
        ])

        return linhas[0] || null;
    }

    async deletar(cliId, id) {
        const [linhas] = await pool.execute(`DELETE FROM cartao WHERE car_id=? AND car_cli_id=?`, [id, cliId]);
        return linhas.affectedRows > 0;
    }

    async limparPreferencial(cliId) {
        await pool.execute(
            'UPDATE cartao SET car_preferencial = false WHERE car_cli_id = ?',
            [cliId]
        );
    }

    async marcarPreferencial(cliId, id) {
        const [linhas] = await pool.execute(`UPDATE cartao SET car_preferencial = true WHERE car_id=? AND car_cli_id=?`, [id, cliId]);
        return linhas.affectedRows > 0;
    }
}

module.exports = { CartaoModel };