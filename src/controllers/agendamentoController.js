const pool = require('../config/db');

const listarAgendamentos = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        a.id,
        c.nome AS cliente,
        v.modelo AS veiculo,
        s.nome AS servico,
        a.data,
        a.status
      FROM agendamentos a
      JOIN clientes c ON a.cliente_id = c.id
      JOIN veiculos v ON a.veiculo_id = v.id
      JOIN servicos s ON a.servico_id = s.id
      ORDER BY a.data ASC
    `);

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ erro: 'Erro ao listar agendamentos' });
  }
};

const criarAgendamento = async (req, res) => {
  const { cliente_id, veiculo_id, servico_id, data, status } = req.body;

  if (!cliente_id || !veiculo_id || !servico_id || !data || !status) {
    return res.status(400).json({
      erro: 'Todos os campos são obrigatórios'
    });
  }

  try {
    const conflito = await pool.query(
      'SELECT * FROM agendamentos WHERE data = $1',
      [data]
    );

    if (conflito.rows.length > 0) {
      return res.status(400).json({
        erro: 'Já existe um agendamento para este horário'
      });
    }

    const resultado = await pool.query(
      `INSERT INTO agendamentos (cliente_id, veiculo_id, servico_id, data, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [cliente_id, veiculo_id, servico_id, data, status]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ erro: 'Erro ao criar agendamento' });
  }
};
const deletarAgendamento = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      'DELETE FROM agendamentos WHERE id = $1 RETURNING *',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    res.status(200).json({ mensagem: 'Agendamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({ erro: 'Erro ao deletar agendamento' });
  }
};

module.exports = {
  listarAgendamentos,
  criarAgendamento,
  deletarAgendamento,
};