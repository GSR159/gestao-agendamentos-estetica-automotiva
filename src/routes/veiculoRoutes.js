const express = require('express');
const router = express.Router();

const {
  listarVeiculos,
  buscarVeiculoPorId,
  criarVeiculo,
  atualizarVeiculo,
  deletarVeiculo
} = require('../controllers/veiculoController');

router.get('/', listarVeiculos);
router.get('/:id', buscarVeiculoPorId);
router.post('/', criarVeiculo);
router.put('/:id', atualizarVeiculo);
router.delete('/:id', deletarVeiculo);

module.exports = router;