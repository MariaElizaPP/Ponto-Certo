const tempo = Number(process.env.CARRINHO_TEMPO_BLOQUEIO_MIN);
const aviso = Number(process.env.CARRINHO_TEMPO_AVISO);

if (!Number.isFinite(tempo) || tempo <= 0) {
    throw new Error('CARRINHO_TEMPO_BLOQUEIO_MIN não configurado ou inválido no .env');
}

module.exports = {
    carrinhoTempoBloqueioMin: tempo,
    carrinhoMinutosAviso: aviso  
};