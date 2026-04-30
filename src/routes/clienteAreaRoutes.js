const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const {
  meusAgendamentos,
  meusVeiculos,
  criarVeiculoCliente,
  excluirVeiculoCliente,
  criarAgendamentoCliente,
  excluirConta
} = require('../controllers/clienteAreaController');

router.use(verificarToken);

router.get('/meus-agendamentos', meusAgendamentos);

router.get('/meus-veiculos', meusVeiculos);
router.post('/meus-veiculos', criarVeiculoCliente);
router.delete('/meus-veiculos/:id', excluirVeiculoCliente);

router.post('/agendar', criarAgendamentoCliente);

router.delete('/minha-conta', excluirConta);

module.exports = router;
