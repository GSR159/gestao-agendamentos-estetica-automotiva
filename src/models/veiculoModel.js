const pool = require('../config/db');

const listar = async ({ tipo, cliente_id, limit, offset }) => {
  const where = tipo === 'cliente' ? ' WHERE v.cliente_id = $1' : '';
  const whereParams = tipo === 'cliente' ? [cliente_id] : [];

  const totalR = await pool.query(
    `SELECT COUNT(*) FROM veiculos v${where}`, whereParams
  );
  const total = parseInt(totalR.rows[0].count, 10);

  const params = [...whereParams];
  let query = `SELECT v.id, v.cliente_id, v.marca, v.modelo, v.placa, v.cor, v.ano, c.nome AS cliente
               FROM veiculos v JOIN clientes c ON c.id = v.cliente_id${where} ORDER BY v.id ASC`;
  if (limit != null) {
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset || 0);
  }
  const r = await pool.query(query, params);
  return { rows: r.rows, total };
};

const buscarPorId = async (id) => {
  const r = await pool.query(`
    SELECT v.*, c.nome AS cliente FROM veiculos v
    JOIN clientes c ON c.id = v.cliente_id WHERE v.id = $1`, [id]);
  return r.rows[0] || null;
};

const criar = async ({ cliente_id, marca, modelo, placa, cor, ano }) => {
  const r = await pool.query(
    'INSERT INTO veiculos (cliente_id, marca, modelo, placa, cor, ano) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [cliente_id, marca || null, modelo, placa, cor || null, ano || null]
  );
  return r.rows[0];
};

const atualizar = async (id, { cliente_id, marca, modelo, placa, cor, ano }) => {
  const r = await pool.query(
    'UPDATE veiculos SET cliente_id=$1, marca=$2, modelo=$3, placa=$4, cor=$5, ano=$6 WHERE id=$7 RETURNING *',
    [cliente_id, marca || null, modelo, placa, cor || null, ano || null, id]
  );
  return r.rows[0] || null;
};

const deletar = async (id) => {
  const r = await pool.query('DELETE FROM veiculos WHERE id=$1 RETURNING *', [id]);
  return r.rows[0] || null;
};

const buscarPorCliente = async (cliente_id) => {
  const r = await pool.query(
    'SELECT id, modelo, placa, cor, ano, marca FROM veiculos WHERE cliente_id=$1 ORDER BY id ASC', [cliente_id]
  );
  return r.rows;
};

module.exports = { listar, buscarPorId, criar, atualizar, deletar, buscarPorCliente };