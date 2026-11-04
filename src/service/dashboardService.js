const { DashboardModel } = require('../models/dashboardModel');
const { CategoriaService } = require('./categoriaService');

class DashboardService {

    async vendas({ categorias, dataInicio, dataFinal }) {
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth() + 1;

        // 1. Definição inteligente das datas (se o usuário não mandar, pega os últimos 12 meses)
        const [anoIni, mesIni] = dataInicio ? dataInicio.split('-').map(Number) : [anoAtual - 1, mesAtual];
        const [anoFim, mesFim] = dataFinal ? dataFinal.split('-').map(Number) : [anoAtual, mesAtual];

        // Validação simples de período (máximo de 24 meses)
        const qtdMeses = (anoFim - anoIni) * 12 + (mesFim - mesIni) + 1;
        if (qtdMeses < 1 || qtdMeses > 24) {
            throw { status: 400, mensagem: 'O período deve ter entre 1 e 24 meses.' };
        }

        // 2. Busca e filtra as categorias selecionadas
        const todasCategorias = await new CategoriaService().listar();
        const nomeCategoria = new Map(todasCategorias.map(c => [c.cat_id, c.cat_nome]));

        let ids = String(categorias || '')
            .split(',')
            .map(Number)
            .filter(id => nomeCategoria.has(id));

        if (!ids.length) {
            ids = todasCategorias.map(c => c.cat_id);
        }

        // 3. Calcula o próximo mês/ano para o limite exclusivo do SQL (evita o erro do dia 31)
        let proxAno = anoFim;
        let proxMes = mesFim + 1;
        if (proxMes > 12) {
            proxMes = 1;
            proxAno++;
        }

        // Formata os valores com zero à esquerda (ex: '01', '09')
        const pad = (n) => String(n).padStart(2, '0');

        // 4. Executa a query no Model passando as datas formatadas perfeitamente para o MySQL
        const model = new DashboardModel();
        const rows = await model.vendas({
            categorias: ids,
            dataInicio: `${anoIni}-${pad(mesIni)}-01`,
            dataFimExclusiva: `${proxAno}-${pad(proxMes)}-01`
        });

        // 5. Gera a lista de meses (eixo X do gráfico)
        const meses = [];
        let a = anoIni, m = mesIni;
        for (let i = 0; i < qtdMeses; i++) {
            meses.push(`${a}-${pad(m)}`);
            m++;
            if (m > 12) { m = 1; a++; }
        }

        // Mapeia os dados do banco para consulta rápida
        const mapa = new Map(rows.map(r => [`${r.cat_id}|${r.mes_ano}`, Number(r.total)]));

        // 6. Monta as séries finais organizadas por categoria para o front-end
        const series = ids.map(id => ({
            categoriaId: id,
            categoria: nomeCategoria.get(id),
            valores: meses.map(mes => mapa.get(`${id}|${mes}`) || 0) // Preenche com 0 se não houver venda
        }));

        // 7. Retorna formatado para o gráfico (ex: labels viram 'MM/AAAA')
        return {
            labels: meses.map(mes => `${mes.slice(5)}/${mes.slice(0, 4)}`),
            series
        };
    }
}

module.exports = { DashboardService };