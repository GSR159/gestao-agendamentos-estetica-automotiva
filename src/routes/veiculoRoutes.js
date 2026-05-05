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

router.get('/', verificarToken, listarVeiculos);
router.get('/:id', verificarToken, buscarVeiculoPorId);

// Cliente pode criar o veiculo
router.post('/', verificarToken, criarVeiculo);

// Só admin pode editar e deletar
router.put('/:id', verificarToken, verificarAdmin, atualizarVeiculo);
router.delete('/:id', verificarToken, verificarAdmin, deletarVeiculo);

module.exports = router;