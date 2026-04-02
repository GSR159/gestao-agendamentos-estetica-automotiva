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
    // 🔍 Buscar o serviço
    const servicoResult = await pool.query(
      'SELECT duracao_minutos FROM servicos WHERE id = $1',
      [servico_id]
    );

    if (servicoResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }

    const duracaoMinutos = servicoResult.rows[0].duracao_minutos;

    // 🧠 Calcular intervalo do novo agendamento
    const inicioNovo = new Date(data);
    const fimNovo = new Date(inicioNovo);
    fimNovo.setMinutes(fimNovo.getMinutes() + duracaoMinutos);

    // 🔍 Buscar agendamentos existentes
    const agendamentosExistentes = await pool.query(
      'SELECT * FROM agendamentos'
    );

    // 🚫 Verificar conflito
    for (const agendamento of agendamentosExistentes.rows) {
      const inicioExistente = new Date(agendamento.data);

      const fimExistente = new Date(inicioExistente);
      fimExistente.setMinutes(
        fimExistente.getMinutes() + agendamento.duracao_minutos
      );

      const conflito =
        inicioNovo < fimExistente && fimNovo > inicioExistente;

      if (conflito) {
        return res.status(400).json({
          erro: 'Já existe um agendamento nesse intervalo de horário'
        });
      }
    }

    // ✅ Criar agendamento
    const resultado = await pool.query(
      `INSERT INTO agendamentos 
      (cliente_id, veiculo_id, servico_id, data, duracao_minutos, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [cliente_id, veiculo_id, servico_id, data, duracaoMinutos, status]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ erro: error.message });;
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