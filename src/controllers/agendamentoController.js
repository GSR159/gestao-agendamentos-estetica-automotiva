const pool = require('../config/db');

// 📋 LISTAR AGENDAMENTOS
const listarAgendamentos = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT DISTINCT
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

// ➕ CRIAR AGENDAMENTO
const criarAgendamento = async (req, res) => {
  const { cliente_id, veiculo_id, servico_id, data } = req.body;

  // 🔴 VALIDAÇÃO
  if (!cliente_id || !veiculo_id || !servico_id || !data) {
    return res.status(400).json({
      erro: 'Todos os campos são obrigatórios'
    });
  }

  const status = 'pendente';

  try {
    // 🔍 VERIFICA SERVIÇO
    const servicoResult = await pool.query(
      'SELECT duracao_minutos FROM servicos WHERE id = $1',
      [servico_id]
    );

    if (servicoResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }

    const duracaoMinutos = servicoResult.rows[0].duracao_minutos;

    if (!duracaoMinutos) {
      return res.status(400).json({
        erro: 'Serviço sem duração definida'
      });
    }

    // 🔍 VERIFICA VEÍCULO DO CLIENTE
    const veiculoCheck = await pool.query(
      'SELECT * FROM veiculos WHERE id = $1 AND cliente_id = $2',
      [veiculo_id, cliente_id]
    );

    if (veiculoCheck.rows.length === 0) {
      return res.status(400).json({
        erro: 'Veículo não pertence ao cliente'
      });
    }

    // 🧠 INTERVALO NOVO
    const inicioNovo = new Date(data);
    const fimNovo = new Date(inicioNovo);
    fimNovo.setMinutes(fimNovo.getMinutes() + duracaoMinutos);

    // 🔍 AGENDAMENTOS EXISTENTES
    const agendamentosExistentes = await pool.query(`
      SELECT a.data, s.duracao_minutos
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
    `);

    // 🚫 VERIFICAR CONFLITO
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
          erro: 'Horário já ocupado'
        });
      }
    }

    // ✅ INSERT
    const resultado = await pool.query(
      `INSERT INTO agendamentos 
      (cliente_id, veiculo_id, servico_id, data, duracao_minutos, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [cliente_id, veiculo_id, servico_id, data, duracaoMinutos, status]
    );

    res.status(201).json(resultado.rows[0]);

  } catch (error) {
    console.error('ERRO AO CRIAR:', error);
    res.status(500).json({ erro: error.message });
  }
};

// 🗑 DELETAR
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