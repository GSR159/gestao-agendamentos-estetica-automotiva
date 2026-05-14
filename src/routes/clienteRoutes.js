const express       = require('express');
const router        = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');

const {
  listarClientes,
  buscarClientePorId,
  criarCliente,
  atualizarCliente,
  deletarCliente
} = require('../controllers/ClienteController');

// Todas as rotas exigem token + perfil admin
router.use(verificarToken, verificarAdmin);

router.get('/',    listarClientes);
router.get('/:id', buscarClientePorId);
router.post('/',   criarCliente);
router.put('/:id', atualizarCliente);
router.delete('/:id', deletarCliente);

module.exports = router;
