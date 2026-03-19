const db = require('../config/db');

const listarVeiculos = async () => {
  const resultado = await db.query(`
    SELECT 
      veiculos.id,
      veiculos.cliente_id,
      clientes.nome AS cliente_nome,
      veiculos.modelo,
      veiculos.placa,
      veiculos.cor
    FROM veiculos
    LEFT JOIN clientes ON clientes.id = veiculos.cliente_id
    ORDER BY veiculos.id ASC
  `);

  return resultado.rows;
};

const criarVeiculo = async (cliente_id, modelo, placa, cor) => {
  const resultado = await db.query(
    `INSERT INTO veiculos (cliente_id, modelo, placa, cor)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [cliente_id, modelo, placa, cor]
  );

  return resultado.rows[0];
};

module.exports = {
  listarVeiculos,
  criarVeiculo,
};