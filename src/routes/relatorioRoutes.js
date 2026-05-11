const express = require('express');
const router  = express.Router();
const { obterRelatorios } = require('../controllers/relatorioController');

router.get('/', obterRelatorios);

module.exports = router;