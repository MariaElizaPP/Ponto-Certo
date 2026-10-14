const pool = require('../config/database');

class EstoqueModel {

    async bloquear(vprId, quantidade) {
        const [r] = await pool.execute(`
            UPDATE estoque SET est_bloqueado = est_bloqueado + ?
            WHERE est_vpr_id = ? AND est_quantidade - est_bloqueado >= ?
        `, [quantidade, vprId, quantidade]);
        return r.affectedRows > 0;
    }

    async liberar(vprId, quantidade) {
        await pool.execute(`
            UPDATE estoque SET est_bloqueado = GREATEST(est_bloqueado - ?, 0)
            WHERE est_vpr_id = ?
        `, [quantidade, vprId]);
    }

    async confirmarBaixa(vprId, quantidade) {
        await pool.execute(`
            UPDATE estoque
            SET est_quantidade = est_quantidade - ?,
                est_bloqueado = GREATEST(est_bloqueado - ?, 0)
            WHERE est_vpr_id = ?
        `, [quantidade, quantidade, vprId]);
    }
}

module.exports = { EstoqueModel };