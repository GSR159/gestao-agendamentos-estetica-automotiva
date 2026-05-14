const express        = require('express');
const router         = express.Router();
const verificarToken  = require('../middlewares/authMiddleware');
const verificarAdmin  = require('../middlewares/adminMiddleware');
const { obterRelatorios } = require('../controllers/relatorioController');

// Relatórios são dados sensíveis — somente admin autenticado
router.get('/', verificarToken, verificarAdmin, obterRelatorios);

module.exports = router;
