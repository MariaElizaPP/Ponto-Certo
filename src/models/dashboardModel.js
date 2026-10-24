const pool = require('../config/database');

const STATUS_CONTABILIZADOS = ['APROVADA', 'EM TRÂNSITO', 'EM TRANSPORTE', 'ENTREGUE'];

class DashboardModel {

    async vendas({ categorias, dataInicio, dataFimExclusiva }) {
        const sql = `
            SELECT
                DATE_FORMAT(p.ped_realizadoEm, '%Y-%m') AS mes_ano,
                c.cat_id,
                c.cat_nome,
                SUM(ip.itm_quantidade * ip.itm_precoUnitario) AS total
            FROM pedidos p
            JOIN status_pedidos sp      ON sp.stp_id = p.ped_stp_id
            JOIN item_pedido ip         ON ip.itm_ped_id = p.ped_id
            JOIN variacao_produto v     ON v.vpr_id = ip.itm_vpr_id
            JOIN produto_categoria pc   ON pc.prc_prd_id = v.vpr_prd_id
            JOIN categorias c           ON c.cat_id = pc.prc_cat_id
            WHERE sp.stp_status IN (?)
              AND p.ped_realizadoEm >= ?
              AND p.ped_realizadoEm <  ?
              AND c.cat_id IN (?)
            GROUP BY mes_ano, c.cat_id, c.cat_nome
            ORDER BY mes_ano, c.cat_nome`;

        const [rows] = await pool.query(sql, [
            STATUS_CONTABILIZADOS, dataInicio, dataFimExclusiva, categorias
        ]);
        return rows;
    }

}

module.exports = {DashboardModel}