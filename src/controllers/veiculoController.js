const pool = require('../config/db');

const listarVeiculos = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM veiculos ORDER BY id ASC');
    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ erro: 'Erro ao listar veículos' });
  }
};

const buscarVeiculoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query('SELECT * FROM veiculos WHERE id = $1', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    res.status(500).json({ erro: 'Erro ao buscar veículo' });
  }
};

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
    res.status(500).json({ erro: 'Erro ao criar veículo' });
  }
};

const atualizarVeiculo = async (req, res) => {
  const { id } = req.params;
  const { cliente_id, marca, modelo, placa, cor, ano } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE veiculos
       SET cliente_id = $1, marca = $2, modelo = $3, placa = $4, cor = $5, ano = $6
       WHERE id = $7
       RETURNING *`,
      [cliente_id, marca, modelo, placa, cor, ano, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    res.status(500).json({ erro: 'Erro ao atualizar veículo' });
  }
};

const deletarVeiculo = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      'DELETE FROM veiculos WHERE id = $1 RETURNING *',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }

    res.status(200).json({ mensagem: 'Veículo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    res.status(500).json({ erro: 'Erro ao deletar veículo' });
  }
};

module.exports = {
  listarVeiculos,
  buscarVeiculoPorId,
  criarVeiculo,
  atualizarVeiculo,
  deletarVeiculo,
};