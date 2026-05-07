const express = require('express');
const router  = express.Router();

const verificarToken = require('../middlewares/authMiddleware');

const {
  listarAgendamentos,
  criarAgendamento,
  atualizarStatus,
  deletarAgendamento,
} = require('../controllers/agendamentoController');

// Todas as rotas de agendamento exigem autenticação
router.get   ('/',    verificarToken, listarAgendamentos);
router.post  ('/',    verificarToken, criarAgendamento);
router.put   ('/:id', verificarToken, atualizarStatus);
router.delete('/:id', verificarToken, deletarAgendamento);

module.exports = router;