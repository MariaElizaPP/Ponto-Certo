const pool = require('../config/database');

class CategoriaModel{
    async listar(){
        const [linhas] = await pool.execute('SELECT * FROM categorias ORDER BY cat_nome');
        return linhas;
    }
}

module.exports= {CategoriaModel};