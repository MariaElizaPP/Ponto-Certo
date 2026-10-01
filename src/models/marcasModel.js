const pool = require('../config/database');

class MarcasModel{
    async listarMarcas(){
        const[linhas] = await pool.execute('SELECT mrc_id, mrc_nome FROM marca ORDER BY mrc_nome');
        return linhas;
    }
}

module.exports = {MarcasModel};