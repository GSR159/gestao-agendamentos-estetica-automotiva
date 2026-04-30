const db = require('../config/db');

const listarVeiculos = async () => {
  const resultado = await db.query(`
    SELECT 
      veiculos.id,
      veiculos.cliente_id,
      clientes.nome AS cliente,
      veiculos.marca,
      veiculos.modelo,
      veiculos.placa,
      veiculos.cor,
      veiculos.ano
    FROM veiculos
    LEFT JOIN clientes ON clientes.id = veiculos.cliente_id
    ORDER BY veiculos.id ASC
  `);

  return resultado.rows;
};

const criarVeiculo = async (cliente_id, marca, modelo, placa, cor, ano) => {
  const resultado = await db.query(
    `INSERT INTO veiculos (cliente_id, marca, modelo, placa, cor, ano)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [cliente_id, marca, modelo, placa, cor, ano]
  );

  return resultado.rows[0];
};

module.exports = {
  listarVeiculos,
  criarVeiculo,
};