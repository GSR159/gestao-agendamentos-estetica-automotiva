const express        = require('express');
const router         = express.Router();
const verificarToken  = require('../middlewares/authMiddleware');
const verificarAdmin  = require('../middlewares/adminMiddleware');

const {
  listarAgendamentos,
  criarAgendamento,
  atualizarStatus,
  deletarAgendamento,
} = require('../controllers/agendamentoController');

// Listagem e criação — qualquer usuário autenticado
router.get ('/', verificarToken, listarAgendamentos);
router.post('/', verificarToken, criarAgendamento);

// Alteração de status e exclusão — somente admin
router.put   ('/:id', verificarToken, verificarAdmin, atualizarStatus);
router.delete('/:id', verificarToken, verificarAdmin, deletarAgendamento);

module.exports = router;