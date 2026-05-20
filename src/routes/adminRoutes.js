// adminRoutes.js
// Todas as rotas aqui exigem token válido + tipo superadmin.

const express              = require('express');
const router               = express.Router();
const verificarToken       = require('../middlewares/authMiddleware');
const verificarSuperAdmin  = require('../middlewares/superadminMiddleware');

const {
  listarAdmins,
  criarAdmin,
  toggleAdmin,
  excluirAdmin,
} = require('../controllers/adminController');

// Todas as rotas aqui embaixo exigem superadmin
router.use(verificarToken, verificarSuperAdmin);

router.get   ('/',           listarAdmins);  // lista todos os admins
router.post  ('/',           criarAdmin);    // cria novo admin
router.patch ('/:id/toggle', toggleAdmin);   // ativa ou desativa
router.delete('/:id',        excluirAdmin);  // exclui permanentemente

module.exports = router;