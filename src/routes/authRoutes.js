const express = require('express');
const router = express.Router();

const {
  register,
  login,
  confirmarEmail
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/confirmar-email', confirmarEmail);

module.exports = router;