const express        = require('express');
const router         = express.Router();
const verificarToken  = require('../middlewares/authMiddleware');
const verificarAdmin  = require('../middlewares/adminMiddleware');

const {
  listarServicos,
  buscarServicoPorId,
  criarServico,
  atualizarServico,
  deletarServico,
} = require('../controllers/servicoController');

// Leitura — qualquer pessoa (clientes precisam ver os serviços disponíveis)
router.get('/',    listarServicos);
router.get('/:id', buscarServicoPorId);

// Mutações — somente admin autenticado
router.post  ('/',    verificarToken, verificarAdmin, criarServico);
router.put   ('/:id', verificarToken, verificarAdmin, atualizarServico);
router.delete('/:id', verificarToken, verificarAdmin, deletarServico);

module.exports = router;