const pool = require('../config/db');
const bcrypt = require('bcrypt');

// 🔥 CADASTRAR USUÁRIO (AQUI FICA O PASSO 2)
const criarUsuario = async (req, res) => {
  const { email, senha, tipo } = req.body;

  try {
    // 🔐 PASSO 2 - CRIPTOGRAFAR SENHA
    const senhaHash = await bcrypt.hash(senha, 10);

    await pool.query(
      'INSERT INTO usuarios (email, senha, tipo) VALUES ($1, $2, $3)',
      [email, senhaHash, tipo]
    );

    res.status(201).json({ mensagem: "Usuário criado com sucesso" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar usuário" });
  }
};

module.exports = { criarUsuario };