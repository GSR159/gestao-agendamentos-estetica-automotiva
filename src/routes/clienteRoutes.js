const express = require('express');
const router = express.Router();

const {
  listarClientes,
  buscarClientePorId,
  criarCliente,
  atualizarCliente,
  deletarCliente
} = require('../controllers/ClienteController');

router.get('/', listarClientes);
router.get('/:id', buscarClientePorId);
router.post('/', criarCliente);
router.put('/:id', atualizarCliente);
router.delete('/:id', deletarCliente);

module.exports = router;