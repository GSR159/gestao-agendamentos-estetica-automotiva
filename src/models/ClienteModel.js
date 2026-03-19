const db = require('../config/db');

const listarClientes = async () => {
  const resultado = await db.query('SELECT * FROM clientes ORDER BY id ASC');
  return resultado.rows;
};

const criarCliente = async (nome, telefone, email) => {
  const resultado = await db.query(
    'INSERT INTO clientes (nome, telefone, email) VALUES ($1, $2, $3) RETURNING *',
    [nome, telefone, email]
  );
  return resultado.rows[0];
};

module.exports = {
  listarClientes,
  criarCliente,
};