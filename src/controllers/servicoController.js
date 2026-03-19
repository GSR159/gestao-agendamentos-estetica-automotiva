const pool = require('../config/db');

const listarServicos = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM servicos ORDER BY id ASC');
    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({ erro: 'Erro ao listar serviços' });
  }
};

const buscarServicoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query('SELECT * FROM servicos WHERE id = $1', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({ erro: 'Erro ao buscar serviço' });
  }
};

const criarServico = async (req, res) => {
  const { nome, descricao, preco, duracao_minutos } = req.body;

  try {
    const resultado = await pool.query(
      `INSERT INTO servicos (nome, descricao, preco, duracao_minutos)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nome, descricao, preco, duracao_minutos]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ erro: 'Erro ao criar serviço' });
  }
};

const atualizarServico = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, duracao_minutos } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE servicos
       SET nome = $1, descricao = $2, preco = $3, duracao_minutos = $4
       WHERE id = $5
       RETURNING *`,
      [nome, descricao, preco, duracao_minutos, id]
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