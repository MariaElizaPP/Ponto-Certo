const { DashboardModel } = require('../models/dashboardModel');
const { CategoriaService } = require('./categoriaService');

class DashboardService {

    async vendas({ categorias, dataInicio, dataFinal }) {
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth() + 1;

        const [anoIni, mesIni] = dataInicio ? dataInicio.split('-').map(Number) : [anoAtual - 1, mesAtual];
        const [anoFim, mesFim] = dataFinal ? dataFinal.split('-').map(Number) : [anoAtual, mesAtual];

        const qtdMeses = (anoFim - anoIni) * 12 + (mesFim - mesIni) + 1;
        if (qtdMeses < 1 || qtdMeses > 24) {
            throw { status: 400, mensagem: 'O período deve ter entre 1 e 24 meses.' };
        }

        const todasCategorias = await new CategoriaService().listar();
        const nomeCategoria = new Map(todasCategorias.map(c => [c.cat_id, c.cat_nome]));

        let ids = String(categorias || '').split(',').map(Number).filter(id => nomeCategoria.has(id));

        if (!ids.length) {
            ids = todasCategorias.map(c => c.cat_id);
        }

        let proxAno = anoFim;
        let proxMes = mesFim + 1;
        if (proxMes > 12) {
            proxMes = 1;
            proxAno++;
        }

        const pad = (n) => String(n).padStart(2, '0');

        const model = new DashboardModel();
        const rows = await model.vendas({
            categorias: ids,
            dataInicio: `${anoIni}-${pad(mesIni)}-01`,
            dataFimExclusiva: `${proxAno}-${pad(proxMes)}-01`
        });

        const meses = [];
        let a = anoIni, m = mesIni;
        for (let i = 0; i < qtdMeses; i++) {
            meses.push(`${a}-${pad(m)}`);
            m++;
            if (m > 12) { m = 1; a++; }
        }

        const mapa = new Map(rows.map(r => [`${r.cat_id}|${r.mes_ano}`, Number(r.total)]));

        const series = ids.map(id => ({
            categoriaId: id,
            categoria: nomeCategoria.get(id),
            valores: meses.map(mes => mapa.get(`${id}|${mes}`) || 0) // Preenche com 0 se não houver venda
        }));

        return {
            labels: meses.map(mes => `${mes.slice(5)}/${mes.slice(0, 4)}`),
            series
        };
    }
}

module.exports = { DashboardService };