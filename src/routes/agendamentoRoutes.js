const express = require('express');
const router = express.Router();

const {
  listarAgendamentos,
  criarAgendamento,
  deletarAgendamento,
} = require('../controllers/agendamentoController');

// LISTAR AGENDAMENTO
router.get('/', listarAgendamentos);

// CRIAR
router.post('/', criarAgendamento);

// ATUALIZAR STATUS 
router.put('/:id', async (req, res) => {
  const pool = require('../config/db');
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      'UPDATE agendamentos SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
});

// DELETA O AGENDAMENTO
router.delete('/:id', deletarAgendamento);

module.exports = router;