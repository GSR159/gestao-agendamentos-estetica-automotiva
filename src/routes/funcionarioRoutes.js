const express = require('express');
const router  = express.Router();
const verificarToken  = require('../middlewares/authMiddleware');
const verificarAdmin  = require('../middlewares/adminMiddleware');
const {
  listarFuncionarios,
  listarFuncionariosAtivos,
  criarFuncionario,
  atualizarFuncionario,
  deletarFuncionario,
  funcionariosDisponiveis,
} = require('../controllers/funcionarioController');

// Todos precisam de token
router.use(verificarToken);

// Qualquer usuário logado pode ver funcionários ativos e disponibilidade
router.get('/ativos',        listarFuncionariosAtivos);
router.get('/disponiveis',   funcionariosDisponiveis);

// Apenas admin pode gerenciar
router.get   ('/',    verificarAdmin, listarFuncionarios);
router.post  ('/',    verificarAdmin, criarFuncionario);
router.put   ('/:id', verificarAdmin, atualizarFuncionario);
router.delete('/:id', verificarAdmin, deletarFuncionario);

module.exports = router;