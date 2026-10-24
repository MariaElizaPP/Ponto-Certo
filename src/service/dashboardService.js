const { DashboardModel } = require('../models/dashboardModel');
const { CategoriaService } = require('./categoriaService');

const pad = (n) => String(n).padStart(2, '0');
const padrao_mes_grafico = 12;

function somarMeses(ano, mes, quantidade) {
    const data = new Date(ano, mes - 1 + quantidade, 1);
    return { ano: data.getFullYear(), mes: data.getMonth() + 1, timestamp: data.getTime() };
}

function parseData(texto) {
    const partes = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(texto || '');
    if (!partes) return null;

    const ano = Number(partes[1]);
    const mes = Number(partes[2]);
    const dia = Number(partes[3] || 1);

    const data = new Date(ano, mes - 1, dia);
    const dataExiste =
        data.getFullYear() === ano &&
        data.getMonth() === mes - 1 &&
        data.getDate() === dia;
    if (!dataExiste) return null;

    return { ano, mes, timestamp: data.getTime() };
}

class DashboardService {

    async vendas({ categorias, dataInicio, dataFinal }) {
        let periodoInicio = dataInicio ? parseData(dataInicio) : null;
        let periodoFinal = dataFinal ? parseData(dataFinal) : null;

        if ((dataInicio && !periodoInicio) || (dataFinal && !periodoFinal))
            throw { status: 400, mensagem: 'Informe datas válidas.' };

        if (!periodoInicio && !periodoFinal) {
            const hoje = new Date();
            periodoFinal = somarMeses(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            periodoInicio = somarMeses(periodoFinal.ano, periodoFinal.mes, -(padrao_mes_grafico - 1));
        } else if (!periodoFinal) {
            periodoFinal = somarMeses(periodoInicio.ano, periodoInicio.mes, padrao_mes_grafico - 1);
        } else if (!periodoInicio) {
            periodoInicio = somarMeses(periodoFinal.ano, periodoFinal.mes, -(padrao_mes_grafico - 1));
        }
        if (periodoFinal.timestamp < periodoInicio.timestamp)
            throw { status: 400, mensagem: 'A data de fim não pode ser anterior à data de início.' };

        const quantidadeMeses = (periodoFinal.ano - periodoInicio.ano) * 12 + (periodoFinal.mes - periodoInicio.mes) + 1;
        if (quantidadeMeses < 1 || quantidadeMeses > 24)
            throw { status: 400, mensagem: 'O período deve ter no mínimo 1 mês e no máximo 24 meses.' };


        const todasCategorias = await new CategoriaService().listar();
        const nomeCategoria = new Map(todasCategorias.map(c => [c.cat_id, c.cat_nome]));

        // categorias que o administrador selecionou (só as que existem)
        let ids = String(categorias || '')
            .split(',').map(Number).filter(id => nomeCategoria.has(id));

        // nenhuma selecionada: usa todas (visão geral)
        if (!ids.length)
            ids = todasCategorias.map(c => c.cat_id);

        if (!ids.length)
            return { labels: [], series: [] };

        const proxAno = periodoFinal.mes === 12 ? periodoFinal.ano + 1 : periodoFinal.ano;
        const proxMes = periodoFinal.mes === 12 ? 1 : periodoFinal.mes + 1;

        const model = new DashboardModel();
        const rows = await model.vendas({
            categorias: ids,
            dataInicio: `${periodoInicio.ano}-${pad(periodoInicio.mes)}-01`,
            dataFimExclusiva: `${proxAno}-${pad(proxMes)}-01`
        });

        const meses = [];
        let ano = periodoInicio.ano, mes = periodoInicio.mes;
        for (let i = 0; i < quantidadeMeses; i++) {
            meses.push(`${ano}-${pad(mes)}`);
            mes++;
            if (mes > 12) { mes = 1; ano++; }
        }
        const mapa = new Map(rows.map(r => [`${r.cat_id}|${r.mes_ano}`, Number(r.total)]));

        const series = ids
            .filter(id => nomeCategoria.has(id))
            .map(id => ({
                categoriaId: id,
                categoria: nomeCategoria.get(id),
                valores: meses.map(mes => mapa.get(`${id}|${mes}`) || 0)
            }));



        return {
            labels: meses.map(mes => `${mes.slice(5)}/${mes.slice(0, 4)}`),
            series
        };
    }
}

module.exports = { DashboardService };

