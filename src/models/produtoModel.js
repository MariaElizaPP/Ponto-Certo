const pool = require('../config/database');

class ProdutoModel {
    async listarEstoque(filtros = {}) {
        let sql = `SELECT p.prd_id, p.prd_nome, p.prd_preco, p.prd_imgUrl FROM produtos p`;

        const condicoes = [];
        const parametros = [];

        if (filtros.marcas && filtros.marcas.length > 0) {
            const marcas = Array.isArray(filtros.marcas) ? filtros.marcas : [filtros.marcas];
            const placeholders = marcas.map(() => '?').join(', ');
            sql += ` JOIN marca m on p.prd_mrc_id = m.mrc_id`;
            condicoes.push(`m.mrc_id IN (${placeholders})`);
            parametros.push(...marcas);
        }

        if (filtros.categorias && filtros.categorias.length > 0) {
            const categorias = Array.isArray(filtros.categorias) ? filtros.categorias : [filtros.categorias];
            const placeholders = categorias.map(() => '?').join(', ');
            sql += ` JOIN produto_categoria pc on pc.prc_prd_id = p.prd_id`;
            condicoes.push(`pc.prc_cat_id IN (${placeholders})`);
            parametros.push(...categorias);
        }


        if (filtros.faixasPreco && filtros.faixasPreco.length > 0) {
            const faixas = Array.isArray(filtros.faixasPreco) ? filtros.faixasPreco : [filtros.faixasPreco];

            const mapaFaixas = {
                'ate20': 'p.prd_preco <= 20',
                '20a50': '(p.prd_preco > 20 AND p.prd_preco <= 50)',
                '50a100': '(p.prd_preco > 50 AND p.prd_preco <= 100)',
                'acima100': 'p.prd_preco > 100'
            };

            const condicoesPreco = faixas.map(faixa => mapaFaixas[faixa]).filter(condicao => condicao !== undefined);

            if (condicoesPreco.length > 0) {
                condicoes.push(`(${condicoesPreco.join(' OR ')})`);
            }


        }

        if (condicoes.length > 0) {
            sql += ` WHERE ` + condicoes.join(' AND ');
        }

        sql += ` ORDER BY p.prd_id`;

        const [linhas] = await pool.query(sql, parametros);
        return linhas;
    }

    async detalhesProduto(id){
        const conexao = await pool.getConnection();

        try{
            const [linha]= await conexao.execute(`SELECT p.prd_id, p.prd_nome, p.prd_preco, p.prd_descricao, p.prd_imgUrl, vp.vpr_id, vp.vpr_cor, vp.vpr_tamanho, vp.vpr_sku, vp.vpr_imgUrl FROM produtos p JOIN variacao_produto vp ON vp.vpr_prd_id = p.prd_id WHERE p.prd_id = ? `, [id]);
        
            return linha;
            
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            conexao.release();
        }
    }


}

module.exports = { ProdutoModel };



