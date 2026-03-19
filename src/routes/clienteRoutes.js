const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/ClienteController');

router.get('/', clienteController.getClientes);
router.post('/', clienteController.postCliente);

module.exports = router;