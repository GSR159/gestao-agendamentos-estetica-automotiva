const express = require('express');
const router = express.Router();

const {
  listarAgendamentos,
  criarAgendamento,
  atualizarStatus,
  deletarAgendamento,
} = require('../controllers/agendamentoController');

// LISTAR
router.get('/', listarAgendamentos);

// CRIAR
router.post('/', criarAgendamento);

// ATUALIZAR STATUS
router.put('/:id', atualizarStatus);

// DELETAR
router.delete('/:id', deletarAgendamento);

module.exports = router;