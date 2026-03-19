const pool = require('../config/db');

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