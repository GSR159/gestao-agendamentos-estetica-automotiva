const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = "segredo_super_forte"; // depois vamos pro .env

// 🔹 LOGIN
const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    const usuario = resultado.rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha inválida' });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        tipo: usuario.tipo
      },
      SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ erro: 'Erro no login' });
  }
};

module.exports = {
  login
};