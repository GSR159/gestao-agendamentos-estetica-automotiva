const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/authMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');

const {
  listarVeiculos,
  buscarVeiculoPorId,
  criarVeiculo,
  atualizarVeiculo,
  deletarVeiculo
} = require('../controllers/veiculoController');

// 🔹 ROTAS PROTEGIDAS
router.get('/', verificarToken, listarVeiculos);
router.get('/:id', verificarToken, buscarVeiculoPorId);

// 🔹 SÓ ADMIN PODE ALTERAR
router.post('/', verificarToken, verificarAdmin, criarVeiculo);
router.put('/:id', verificarToken, verificarAdmin, atualizarVeiculo);
router.delete('/:id', verificarToken, verificarAdmin, deletarVeiculo);

module.exports = router;