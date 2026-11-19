import json
import os

import numpy as np
import pymysql

STATUS_VALIDOS = ('APROVADA', 'EM TRÂNSITO', 'EM TRANSPORTE', 'ENTREGUE')
PESO_COMPRA = 1.0
PESO_UTIL = 0.5
PESO_NAO_UTIL = -0.5
PESO_POPULARIDADE = 0.05   # desempate e cliente novo (cold start)
TOP_N = 8

con = pymysql.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', ''),
    database=os.getenv('DB_NAME', 'ponto_certo'),
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor,
)

with con.cursor() as cur:
    cur.execute('SELECT cli_id FROM cliente ORDER BY cli_id')
    clientes = [r['cli_id'] for r in cur.fetchall()]
    cur.execute('SELECT prd_id FROM produtos ORDER BY prd_id')
    produtos = [r['prd_id'] for r in cur.fetchall()]

    # 1) Compras (RN0074: só status válidos)
    cur.execute(
        """SELECT DISTINCT p.ped_cli_id AS cli, v.vpr_prd_id AS prd
             FROM pedidos p
             JOIN status_pedidos sp   ON sp.stp_id = p.ped_stp_id
             JOIN item_pedido ip      ON ip.itm_ped_id = p.ped_id
             JOIN variacao_produto v  ON v.vpr_id = ip.itm_vpr_id
            WHERE sp.stp_status IN %s""",
        (STATUS_VALIDOS,),
    )
    compras = cur.fetchall()

    # 2) Feedback das respostas do chat
    cur.execute(
        """SELECT s.ses_cli_id AS cli, m.msg_produtos AS produtos,
                  m.msg_feedback AS feedback, m.msg_feedback_mdv_id AS mdv
             FROM chat_mensagem m
             JOIN chat_sessao s ON s.ses_id = m.msg_ses_id
            WHERE m.msg_feedback IS NOT NULL AND m.msg_produtos IS NOT NULL"""
    )
    feedbacks = cur.fetchall()

if not clientes or not produtos:
    raise SystemExit('Sem clientes ou produtos cadastrados.')

idx_cli = {c: i for i, c in enumerate(clientes)}
idx_prd = {p: i for i, p in enumerate(produtos)}

# Matrizes cliente x produto
C = np.zeros((len(clientes), len(produtos)))   # compras
F = np.zeros((len(clientes), len(produtos)))   # feedback acumulado

for r in compras:
    if r['cli'] in idx_cli and r['prd'] in idx_prd:
        C[idx_cli[r['cli']], idx_prd[r['prd']]] = PESO_COMPRA

novos = 0
for r in feedbacks:
    ids = json.loads(r['produtos']) if isinstance(r['produtos'], str) else r['produtos']
    peso = PESO_UTIL if r['feedback'] == 'util' else PESO_NAO_UTIL
    for prd in ids or []:
        if r['cli'] in idx_cli and prd in idx_prd:
            F[idx_cli[r['cli']], idx_prd[prd]] += peso
    if r['mdv'] is None:
        novos += 1

# 3) Aprende a similaridade entre produtos (cosseno)
base = C + np.maximum(F, 0)                     # sinais positivos
normas = np.linalg.norm(base, axis=0) + 1e-9
similaridade = (base.T @ base) / np.outer(normas, normas)
np.fill_diagonal(similaridade, 0)

# 4) Pontua cada produto para cada cliente
popularidade = C.sum(axis=0)
if popularidade.max() > 0:
    popularidade = popularidade / popularidade.max()

scores = base @ similaridade + F + PESO_POPULARIDADE * popularidade  # F: 👍 sobe e 👎 desce o próprio produto
scores[C > 0] = -np.inf                                               # nunca recomenda o que já comprou

# 5) Grava a nova versão e as recomendações
with con.cursor() as cur:
    cur.execute(
        'INSERT INTO modelo_versao (mdv_qtd_compras, mdv_qtd_feedbacks, mdv_qtd_feedbacks_novos) VALUES (%s, %s, %s)',
        (len(compras), len(feedbacks), novos),
    )
    mdv_id = cur.lastrowid

    linhas = []
    for c in clientes:
        topo = np.argsort(-scores[idx_cli[c]])[:TOP_N]
        for j in topo:
            valor = scores[idx_cli[c], j]
            if np.isfinite(valor):
                linhas.append((mdv_id, c, produtos[j], round(float(valor), 4)))

    cur.executemany(
        'INSERT INTO recomendacao_cliente (rec_mdv_id, rec_cli_id, rec_prd_id, rec_score) VALUES (%s, %s, %s, %s)',
        linhas,
    )

    # Marca os feedbacks que esta versão incorporou
    cur.execute(
        'UPDATE chat_mensagem SET msg_feedback_mdv_id = %s WHERE msg_feedback IS NOT NULL AND msg_feedback_mdv_id IS NULL',
        (mdv_id,),
    )
con.commit()

print(f'Modelo v{mdv_id} treinado: {len(compras)} compras, '
      f'{len(feedbacks)} feedbacks ({novos} novos), {len(linhas)} recomendações.')