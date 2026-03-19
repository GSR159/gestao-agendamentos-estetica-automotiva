const express = require('express');
const router = express.Router();

const {
  listarAgendamentos,
  criarAgendamento,
  deletarAgendamento,
} = require('../controllers/agendamentoController');

router.get('/', listarAgendamentos);
router.post('/', criarAgendamento);
router.delete('/:id', deletarAgendamento);

module.exports = router;