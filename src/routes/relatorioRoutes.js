const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const receita = await pool.query(`
      SELECT SUM(s.preco) AS total
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      WHERE a.status = 'aprovado'
    `);

    const ticket = await pool.query(`
      SELECT AVG(s.preco) AS medio
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      WHERE a.status = 'aprovado'
    `);

    const evolucao = await pool.query(`
      SELECT DATE(a.data) AS dia, SUM(s.preco) AS total
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      WHERE a.status = 'aprovado'
      GROUP BY dia
      ORDER BY dia
    `);

    const servicos = await pool.query(`
      SELECT s.nome, COUNT(*) AS total
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      WHERE a.status = 'aprovado'
      GROUP BY s.nome
    `);

    const clientes = await pool.query(`
      SELECT c.nome, COUNT(*) AS qtd, SUM(s.preco) AS total
      FROM agendamentos a
      JOIN clientes c ON a.cliente_id = c.id
      JOIN servicos s ON a.servico_id = s.id
      WHERE a.status = 'aprovado'
      GROUP BY c.nome
      ORDER BY total DESC
    `);

    const fidelizacao = await pool.query(`
      SELECT 
        ROUND(
          (COUNT(*) FILTER (WHERE qtd > 1) * 100.0) / COUNT(*), 
          2
        ) AS fidelizacao
      FROM (
        SELECT cliente_id, COUNT(*) as qtd
        FROM agendamentos
        WHERE status = 'aprovado'
        GROUP BY cliente_id
      ) t;
    `);

    res.json({
      receitaTotal: receita.rows[0].total,
      ticketMedio: ticket.rows[0].medio,
      fidelizacao: fidelizacao.rows[0].fidelizacao,
      evolucao: evolucao.rows,
      servicos: servicos.rows,
      clientes: clientes.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao gerar relatórios' });
  }
});

module.exports = router;