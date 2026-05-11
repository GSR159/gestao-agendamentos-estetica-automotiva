const express = require('express');
const router  = express.Router();
const { obterRelatorios } = require('../controllers/relatoriosController');

router.get('/', obterRelatorios);

module.exports = router;