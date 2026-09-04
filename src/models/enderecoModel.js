const pool = require('../config/database');

class EnderecoModel {
    async alterar(enderecoId, cliId, dados) {
        
        const [resultado] = await pool.execute(`UPDATE endereco SET end_tipoEndereco = ?, end_tipoResidencia = ?, end_tipoLogradouro = ?, end_logradouro = ?,
            end_numero = ?, end_bairro = ?, end_cep = ?, end_cidade = ?, end_estado = ?, end_pais = ?,
            end_complemento = ?, end_nomeEndereco = ? WHERE end_id = ? and end_cli_id = ?`, [
            dados.tipoEndereco,
            dados.tipoResidencia,
            dados.tipoLogradouro,
            dados.logradouro,
            dados.numero,
            dados.bairro,
            dados.cep,
            dados.cidade,
            dados.estado,
            dados.pais,
            dados.complemento || null,
            dados.nomeEndereco,
            enderecoId,
            cliId,

        ]);

        return resultado.affectedRows > 0;

    }

    async cadastrar(dados) {
        
        const [linhas] = await pool.execute(`INSERT INTO endereco (end_tipoEndereco, end_tipoResidencia, end_tipoLogradouro, end_logradouro ,
            end_numero, end_bairro, end_cep, end_cidade, end_estado, end_pais,
            end_complemento, end_nomeEndereco, end_cli_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            dados.tipoEndereco,
            dados.tipoResidencia,
            dados.tipoLogradouro,
            dados.logradouro,
            dados.numero,
            dados.bairro,
            dados.cep,
            dados.cidade,
            dados.estado,
            dados.pais,
            dados.complemento || null,
            dados.nomeEndereco,
            dados.cliId,

        ]);

        return linhas[0];

    }

    async buscarId(enderecoId, cliId) {
        const [linhas] = await pool.execute(`SELECT * FROM endereco WHERE end_id = ? AND end_cli_id = ?`, [enderecoId, cliId]);

        return linhas[0] || null;
    }

    async listar(cliId) {
        const [linhas] = await pool.execute(`SELECT * FROM endereco WHERE end_cli_id = ?`, [cliId]);
        return linhas;
    }

    async deletar(cliId, id) {
        const [linhas] = await pool.execute(`DELETE FROM endereco WHERE end_id=? AND end_cli_id=?`, [id, cliId]);
        return linhas.affectedRows > 0;
    }
}

module.exports = { EnderecoModel };