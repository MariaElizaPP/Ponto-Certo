const pool = require('../config/database');

class BandeiraModel{
    async listar(){
        const [linhas] = await pool.execute('SELECT bdr_id, bdr_nome FROM bandeira ORDER BY bdr_nome');
        return linhas;
    }
}

module.exports= {BandeiraModel};