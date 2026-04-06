const pool = require('../config/db');

// 📋 LISTAR SERVIÇOS
const listarServicos = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        id,
        nome,
        preco,
        descricao,
        duracao_minutos
      FROM servicos
      ORDER BY id ASC
    `);

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({ erro: 'Erro ao listar serviços' });
  }
};

// 🔍 BUSCAR POR ID
const buscarServicoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(`
      SELECT
        id,
        nome,
        preco,
        descricao,
        duracao_minutos
      FROM servicos
      WHERE id = $1
    `, [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({ erro: 'Erro ao buscar serviço' });
  }
};

// ➕ CRIAR SERVIÇO
const criarServico = async (req, res) => {
  const { nome, duracao_minutos, preco, descricao } = req.body;

  if (!nome || !duracao_minutos || !preco) {
    return res.status(400).json({
      erro: 'Nome, duração e preço são obrigatórios'
    });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO servicos (nome, preco, descricao, duracao_minutos)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nome, preco, descricao || null, duracao_minutos]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ erro: error.message });
  }
};

// ✏️ ATUALIZAR SERVIÇO
const atualizarServico = async (req, res) => {
  const { id } = req.params;
  const { nome, duracao_minutos, preco, descricao } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE servicos
       SET nome = $1,
           preco = $2,
           descricao = $3,
           duracao_minutos = $4
       WHERE id = $5
       RETURNING *`,
      [nome, preco, descricao || null, duracao_minutos, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ erro: 'Erro ao atualizar serviço' });
  }
};

// 🗑 DELETAR SERVIÇO
const deletarServico = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      'DELETE FROM servicos WHERE id = $1 RETURNING *',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }

    res.status(200).json({ mensagem: 'Serviço deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({ erro: 'Erro ao deletar serviço' });
  }
};

module.exports = {
  listarServicos,
  buscarServicoPorId,
  criarServico,
  atualizarServico,
  deletarServico,
};