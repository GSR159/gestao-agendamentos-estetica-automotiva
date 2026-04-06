const pool = require('../config/db');

// 🔹 LISTAR VEÍCULOS
const listarVeiculos = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        v.id,
        v.cliente_id, -- 🔥 CORRIGIDO
        v.marca,
        v.modelo,
        v.placa,
        v.cor,
        v.ano,
        c.nome AS cliente
      FROM veiculos v
      JOIN clientes c ON c.id = v.cliente_id
      ORDER BY v.id ASC
    `);

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ erro: error.message });
  }
};

// 🔹 BUSCAR POR ID
const buscarVeiculoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(`
      SELECT 
        v.id,
        v.cliente_id, -- 🔥 CORRIGIDO
        v.marca,
        v.modelo,
        v.placa,
        v.cor,
        v.ano,
        c.nome AS cliente
      FROM veiculos v
      JOIN clientes c ON c.id = v.cliente_id
      WHERE v.id = $1
    `, [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    res.status(500).json({ erro: error.message });
  }
};

// 🔹 CRIAR
const criarVeiculo = async (req, res) => {
  const { cliente_id, marca, modelo, placa, cor, ano } = req.body;

  try {
    const resultado = await pool.query(
      `INSERT INTO veiculos (cliente_id, marca, modelo, placa, cor, ano)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [cliente_id, marca, modelo, placa, cor, ano]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    res.status(500).json({ erro: error.message });
  }
};

// 🔹 ATUALIZAR
const atualizarVeiculo = async (req, res) => {
  const { id } = req.params;
  const { cliente_id, marca, modelo, placa, cor, ano } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE veiculos
       SET cliente_id=$1, marca=$2, modelo=$3, placa=$4, cor=$5, ano=$6
       WHERE id=$7 RETURNING *`,
      [cliente_id, marca, modelo, placa, cor, ano, id]
    );

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// 🔹 DELETAR
const deletarVeiculo = async (req, res) => {
  const { id } = req.params;

  await pool.query('DELETE FROM veiculos WHERE id=$1', [id]);
  res.status(200).json({ ok: true });
};

module.exports = {
  listarVeiculos,
  buscarVeiculoPorId,
  criarVeiculo,
  atualizarVeiculo,
  deletarVeiculo
};