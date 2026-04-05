const jwt = require('jsonwebtoken');

const SECRET = "segredo_super_forte";

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    req.usuario = decoded; // 🔥 salva info do usuário
    next();
  } catch (error) {
    return res.status(403).json({ erro: 'Token inválido' });
  }
};

module.exports = verificarToken;