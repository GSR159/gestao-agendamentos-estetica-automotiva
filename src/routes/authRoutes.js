const express = require('express');
const router  = express.Router();

const {
  register,
  login,
  confirmarEmail,
  reenviarEmail,
  esquecerSenha,
  redefinirSenha,
  validarTokenRecuperacao,
} = require('../controllers/authController');

router.post('/register',          register);
router.post('/login',             login);
router.get ('/confirmar-email',   confirmarEmail);
router.post('/reenviar-email',    reenviarEmail);
router.post('/esqueci-senha',     esquecerSenha);
router.post('/redefinir-senha',   redefinirSenha);
router.get ('/validar-recuperacao', validarTokenRecuperacao);

module.exports = router;