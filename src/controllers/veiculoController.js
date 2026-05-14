const pool = require('../config/db');

// 🔹 LISTAR VEÍCULOS
const listarVeiculos = async (req, res) => {
  try {
    let query = `
      SELECT 
        v.id,
        v.cliente_id,
        v.marca,
        v.modelo,
        v.placa,
        v.cor,
        v.ano,
        c.nome AS cliente
      FROM veiculos v
      JOIN clientes c ON c.id = v.cliente_id
    `;
    const params = [];

    // 🔥 Cliente vê só os próprios veículos
    if (req.usuario.tipo === 'cliente') {
      query += ` WHERE v.cliente_id = $1`;
      params.push(req.usuario.cliente_id);
    }

    query += ` ORDER BY v.id ASC`;

    const resultado = await pool.query(query, params);
    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ erro: 'Erro ao listar veículos.' });
  }
};

// 🔹 BUSCAR POR ID
const buscarVeiculoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(`
      SELECT 
        v.id,
        v.cliente_id,
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
    res.status(500).json({ erro: 'Erro ao buscar veículo.' });
  }
};

// 🔹 CRIAR
const criarVeiculo = async (req, res) => {
  let { cliente_id, marca, modelo, placa, cor, ano } = req.body;

  // 🔥 Se for cliente, força o próprio cliente_id do token
  if (req.usuario.tipo === 'cliente') {
    cliente_id = req.usuario.cliente_id;
  }

  if (!cliente_id || !modelo || !placa) {
    return res.status(400).json({ erro: 'cliente_id, modelo e placa são obrigatórios.' });
  }

  const clienteIdInt = parseInt(cliente_id, 10);
  if (isNaN(clienteIdInt)) {
    return res.status(400).json({ erro: 'cliente_id deve ser um número válido.' });
  }

  const anoInt = ano ? parseInt(ano, 10) : null;
  if (ano && isNaN(anoInt)) {
    return res.status(400).json({ erro: 'ano deve ser um número válido.' });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO veiculos (cliente_id, marca, modelo, placa, cor, ano)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [clienteIdInt, marca || null, modelo, placa, cor || null, anoInt]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    res.status(500).json({ erro: 'Erro ao criar veículo.' });
  }
};

// 🔹 ATUALIZAR
const atualizarVeiculo = async (req, res) => {
  const { id } = req.params;
  let { cliente_id, marca, modelo, placa, cor, ano } = req.body;

  // 🔥 Se for cliente, força o próprio cliente_id do token
  if (req.usuario.tipo === 'cliente') {
    cliente_id = req.usuario.cliente_id;
  }

  if (!cliente_id || !modelo || !placa) {
    return res.status(400).json({ erro: 'cliente_id, modelo e placa são obrigatórios.' });
  }

  const clienteIdInt = parseInt(cliente_id, 10);
  if (isNaN(clienteIdInt)) {
    return res.status(400).json({ erro: 'cliente_id deve ser um número válido.' });
  }

  const anoInt = ano ? parseInt(ano, 10) : null;
  if (ano && isNaN(anoInt)) {
    return res.status(400).json({ erro: 'ano deve ser um número válido.' });
  }

  try {
    const resultado = await pool.query(
      `UPDATE veiculos
       SET cliente_id=$1, marca=$2, modelo=$3, placa=$4, cor=$5, ano=$6
       WHERE id=$7 RETURNING *`,
      [clienteIdInt, marca || null, modelo, placa, cor || null, anoInt, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Veículo não encontrado.' });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    res.status(500).json({ erro: 'Erro ao atualizar veículo.' });
  }
};

// 🔹 DELETAR
const deletarVeiculo = async (req, res) => {
  const { id } = req.params;
  const resultado = await pool.query('DELETE FROM veiculos WHERE id=$1 RETURNING *', [id]);
  if (resultado.rows.length === 0) {
    return res.status(404).json({ erro: 'Veículo não encontrado.' });
  }
  res.status(200).json({ ok: true });
};

module.exports = {
  listarVeiculos,
  buscarVeiculoPorId,
  criarVeiculo,
  atualizarVeiculo,
  deletarVeiculo
};