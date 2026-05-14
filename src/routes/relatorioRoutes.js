const express        = require('express');
const router         = express.Router();
const verificarToken  = require('../middlewares/authMiddleware');
const verificarAdmin  = require('../middlewares/adminMiddleware');
const { obterRelatorios } = require('../controllers/relatorioController');

// Relatórios - Somente Admin
router.get('/', verificarToken, verificarAdmin, obterRelatorios);

module.exports = router;
