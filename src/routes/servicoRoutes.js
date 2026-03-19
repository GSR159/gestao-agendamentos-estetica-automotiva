const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servicoController');

router.get('/', servicoController.getServicos);
router.post('/', servicoController.postServico);

module.exports = router;