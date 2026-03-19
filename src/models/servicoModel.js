const db = require('../config/db');

const listarServicos = async () => {
  const resultado = await db.query(
    'SELECT * FROM servicos ORDER BY id ASC'
  );
  return resultado.rows;
};

const criarServico = async (nome, preco) => {
  const resultado = await db.query(
    `INSERT INTO servicos (nome, preco)
     VALUES ($1, $2)
     RETURNING *`,
    [nome, preco]
  );

  return resultado.rows[0];
};

module.exports = {
  listarServicos,
  criarServico,
};