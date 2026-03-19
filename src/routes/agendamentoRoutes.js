const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');

router.get('/', agendamentoController.getAgendamentos);
router.post('/', agendamentoController.postAgendamento);

module.exports = router;