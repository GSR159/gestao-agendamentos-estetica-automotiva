const verificarAdmin = (req, res, next) => {
  if (req.usuario.tipo !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  next();
};

module.exports = verificarAdmin;