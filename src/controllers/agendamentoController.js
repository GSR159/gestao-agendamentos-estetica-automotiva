const pool = require('../config/db');

// ─────────────────────────────────────────
//  LISTAR + EXPIRAÇÃO AUTOMÁTICA
// ─────────────────────────────────────────
const listarAgendamentos = async (req, res) => {
  try {
    // Expira pendentes com mais de 48h automaticamente
    await pool.query(`
      UPDATE agendamentos
      SET status = 'recusado'
      WHERE status = 'pendente'
        AND criado_em < NOW() - INTERVAL '48 hours'
    `);

    const resultado = await pool.query(`
      SELECT DISTINCT
        a.id,
        c.nome          AS cliente,
        v.modelo        AS veiculo,
        s.nome          AS servico,
        f.nome          AS funcionario,
        a.funcionario_id,
        a.data,
        a.status,
        a.desconto_aniversario
      FROM agendamentos a
      JOIN clientes  c ON a.cliente_id  = c.id
      JOIN veiculos  v ON a.veiculo_id  = v.id
      JOIN servicos  s ON a.servico_id  = s.id
      LEFT JOIN funcionarios f ON a.funcionario_id = f.id
      ORDER BY a.data ASC
    `);

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ erro: 'Erro ao listar agendamentos' });
  }
};

// ─────────────────────────────────────────
//  CRIAR AGENDAMENTO (admin)
//  — trava por funcionário, não global
// ─────────────────────────────────────────
const criarAgendamento = async (req, res) => {
  const { cliente_id, veiculo_id, servico_id, data, funcionario_id } = req.body;

  if (!cliente_id || !veiculo_id || !servico_id || !data) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Busca duração do serviço
    const servicoResult = await pool.query(
      'SELECT duracao_minutos FROM servicos WHERE id = $1', [servico_id]
    );
    if (servicoResult.rows.length === 0)
      return res.status(404).json({ erro: 'Serviço não encontrado.' });

    const duracaoMinutos = servicoResult.rows[0].duracao_minutos;

    // Verifica se veículo pertence ao cliente
    const veiculoCheck = await pool.query(
      'SELECT * FROM veiculos WHERE id = $1 AND cliente_id = $2',
      [veiculo_id, cliente_id]
    );
    if (veiculoCheck.rows.length === 0)
      return res.status(400).json({ erro: 'Veículo não pertence ao cliente.' });

    const inicioNovo = new Date(data);
    const fimNovo    = new Date(inicioNovo.getTime() + duracaoMinutos * 60000);

    // ── Verificação de conflito ──────────────────────────────
    // Se um funcionário foi informado: trava POR funcionário
    // Se não: trava global (comportamento anterior)
    if (funcionario_id) {
      // Verifica se funcionário existe e está ativo
      const funcRes = await pool.query(
        'SELECT id FROM funcionarios WHERE id = $1 AND ativo = TRUE', [funcionario_id]
      );
      if (funcRes.rows.length === 0)
        return res.status(400).json({ erro: 'Funcionário não encontrado ou inativo.' });

      // Verifica conflito somente para este funcionário
      const conflitos = await pool.query(`
        SELECT a.data, s.duracao_minutos
        FROM agendamentos a
        JOIN servicos s ON a.servico_id = s.id
        WHERE a.funcionario_id = $1
          AND a.status != 'recusado'
          AND a.data BETWEEN $2 AND $3
      `, [
        funcionario_id,
        new Date(inicioNovo.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        new Date(fimNovo.getTime()   + 24 * 60 * 60 * 1000).toISOString()
      ]);

      for (const ag of conflitos.rows) {
        const inicioEx = new Date(ag.data);
        const fimEx    = new Date(inicioEx.getTime() + ag.duracao_minutos * 60000);
        if (inicioNovo < fimEx && fimNovo > inicioEx)
          return res.status(400).json({ erro: 'Este funcionário já está ocupado neste horário.' });
      }
    } else {
      // Sem funcionário: trava global (legado)
      const conflitos = await pool.query(`
        SELECT a.data, s.duracao_minutos
        FROM agendamentos a
        JOIN servicos s ON a.servico_id = s.id
        WHERE a.status != 'recusado'
          AND a.data BETWEEN $1 AND $2
      `, [
        new Date(inicioNovo.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        new Date(fimNovo.getTime()   + 24 * 60 * 60 * 1000).toISOString()
      ]);

      for (const ag of conflitos.rows) {
        const inicioEx = new Date(ag.data);
        const fimEx    = new Date(inicioEx.getTime() + ag.duracao_minutos * 60000);
        if (inicioNovo < fimEx && fimNovo > inicioEx)
          return res.status(400).json({ erro: 'Horário já ocupado.' });
      }
    }

    const resultado = await pool.query(
      `INSERT INTO agendamentos
       (cliente_id, veiculo_id, servico_id, data, duracao_minutos, status, funcionario_id)
       VALUES ($1, $2, $3, $4, $5, 'pendente', $6)
       RETURNING *`,
      [cliente_id, veiculo_id, servico_id, data, duracaoMinutos, funcionario_id || null]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ erro: error.message });
  }
};

// ─────────────────────────────────────────
//  ATUALIZAR STATUS (+ atribuir funcionário)
// ─────────────────────────────────────────
const atualizarStatus = async (req, res) => {
  const { id }             = req.params;
  const { status, funcionario_id } = req.body;

  const statusValidos = ['pendente', 'aprovado', 'recusado'];
  if (!statusValidos.includes(status))
    return res.status(400).json({ erro: 'Status inválido.' });

  try {
    const campos  = ['status = $1'];
    const valores = [status];
    let idx = 2;

    if (funcionario_id !== undefined) {
      campos.push(`funcionario_id = $${idx++}`);
      valores.push(funcionario_id || null);
    }

    valores.push(id);
    const resultado = await pool.query(
      `UPDATE agendamentos SET ${campos.join(', ')} WHERE id = $${idx} RETURNING *`,
      valores
    );

    if (resultado.rows.length === 0)
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
};

// ─────────────────────────────────────────
//  DELETAR
// ─────────────────────────────────────────
const deletarAgendamento = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query(
      'DELETE FROM agendamentos WHERE id = $1 RETURNING *', [id]
    );
    if (resultado.rows.length === 0)
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });

    res.status(200).json({ mensagem: 'Agendamento deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({ erro: 'Erro ao deletar agendamento' });
  }
};

module.exports = {
  listarAgendamentos,
  criarAgendamento,
  atualizarStatus,
  deletarAgendamento,
};