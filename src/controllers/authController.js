const pool = require('../config/db');
const bcrypt = require('bcrypt');

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

    // 🔥 COMPARAÇÃO CORRETA
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha inválida' });
    }

    res.status(200).json({
      id: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro no login' });
  }
};

module.exports = { login };