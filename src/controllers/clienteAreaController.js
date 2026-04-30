const pool = require('../config/db');

// Busca o cliente vinculado ao email do usuário logado
async function buscarClientePorEmail(email) {
  const resultado = await pool.query(
    'SELECT * FROM clientes WHERE email = $1',
    [email]
  );
  return resultado.rows[0] || null;
}

// GET /cliente/meus-agendamentos
const meusAgendamentos = async (req, res) => {
  try {
    const cliente = await buscarClientePorEmail(req.usuario.email);

    if (!cliente) {
      return res.status(200).json([]);
    }

    const resultado = await pool.query(`
      SELECT
        a.id,
        a.data,
        a.status,
        s.nome AS servico,
        s.duracao_minutos,
        v.modelo AS veiculo_modelo,
        v.placa AS veiculo_placa
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      JOIN veiculos v ON a.veiculo_id = v.id
      WHERE a.cliente_id = $1
      ORDER BY a.data DESC
    `, [cliente.id]);

    const agendamentos = resultado.rows.map(a => {
      const dataObj = new Date(a.data);
      return {
        id: a.id,
        data: a.data,
        hora: dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: a.status,
        servico: a.servico,
        duracao_minutos: a.duracao_minutos,
        veiculo: {
          modelo: a.veiculo_modelo,
          placa: a.veiculo_placa
        }
      };
    });

    res.status(200).json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar agendamentos do cliente:', error);
    res.status(500).json({ erro: 'Erro ao listar agendamentos' });
  }
};

// GET /cliente/meus-veiculos
const meusVeiculos = async (req, res) => {
  try {
    const cliente = await buscarClientePorEmail(req.usuario.email);

    if (!cliente) {
      return res.status(200).json([]);
    }

    const resultado = await pool.query(
      'SELECT id, modelo, placa, cor, ano, marca FROM veiculos WHERE cliente_id = $1 ORDER BY id ASC',
      [cliente.id]
    );

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar veículos do cliente:', error);
    res.status(500).json({ erro: 'Erro ao listar veículos' });
  }
};

// POST /cliente/meus-veiculos
const criarVeiculoCliente = async (req, res) => {
  const { modelo, placa, ano, marca, cor } = req.body;

  try {
    const cliente = await buscarClientePorEmail(req.usuario.email);

    if (!cliente) {
      return res.status(400).json({ erro: 'Cliente não encontrado para este usuário.' });
    }

    const resultado = await pool.query(
      `INSERT INTO veiculos (cliente_id, modelo, placa, ano, marca, cor)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [cliente.id, modelo, placa, ano || null, marca || null, cor || null]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    res.status(500).json({ erro: 'Erro ao criar veículo' });
  }
};

// DELETE /cliente/meus-veiculos/:id
const excluirVeiculoCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await buscarClientePorEmail(req.usuario.email);

    if (!cliente) {
      return res.status(400).json({ erro: 'Cliente não encontrado.' });
    }

    const resultado = await pool.query(
      'DELETE FROM veiculos WHERE id = $1 AND cliente_id = $2 RETURNING *',
      [id, cliente.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Veículo não encontrado ou não pertence a você.' });
    }

    res.status(200).json({ mensagem: 'Veículo removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir veículo:', error);
    res.status(500).json({ erro: 'Erro ao excluir veículo' });
  }
};

// POST /cliente/agendar
const criarAgendamentoCliente = async (req, res) => {
  const { veiculo_id, servico_id, data } = req.body;

  if (!veiculo_id || !servico_id || !data) {
    return res.status(400).json({ erro: 'Veículo, serviço e data são obrigatórios.' });
  }

  try {
    const cliente = await buscarClientePorEmail(req.usuario.email);

    if (!cliente) {
      return res.status(400).json({ erro: 'Cliente não encontrado para este usuário.' });
    }

    const servicoResult = await pool.query(
      'SELECT duracao_minutos FROM servicos WHERE id = $1',
      [servico_id]
    );

    if (servicoResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Serviço não encontrado.' });
    }

    const duracaoMinutos = servicoResult.rows[0].duracao_minutos;

    const veiculoCheck = await pool.query(
      'SELECT * FROM veiculos WHERE id = $1 AND cliente_id = $2',
      [veiculo_id, cliente.id]
    );

    if (veiculoCheck.rows.length === 0) {
      return res.status(400).json({ erro: 'Veículo não pertence a você.' });
    }

    const inicioNovo = new Date(data);
    const fimNovo = new Date(inicioNovo);
    fimNovo.setMinutes(fimNovo.getMinutes() + duracaoMinutos);

    const agendamentosExistentes = await pool.query(`
      SELECT a.data, s.duracao_minutos
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      WHERE a.status != 'recusado'
      AND a.data BETWEEN $1 AND $2
    `, [
      new Date(inicioNovo.getTime() - 24 * 60 * 60 * 1000),
      new Date(fimNovo.getTime() + 24 * 60 * 60 * 1000)
    ]);

    for (const agendamento of agendamentosExistentes.rows) {
      const inicioExistente = new Date(agendamento.data);
      const fimExistente = new Date(inicioExistente);
      fimExistente.setMinutes(fimExistente.getMinutes() + agendamento.duracao_minutos);

      const conflito = inicioNovo < fimExistente && fimNovo > inicioExistente;

      if (conflito) {
        return res.status(400).json({ erro: 'Horário já ocupado. Escolha outro horário.' });
      }
    }

    const resultado = await pool.query(
      `INSERT INTO agendamentos
       (cliente_id, veiculo_id, servico_id, data, duracao_minutos, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [cliente.id, veiculo_id, servico_id, data, duracaoMinutos, 'pendente']
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ erro: 'Erro ao criar agendamento' });
  }
};

// DELETE /cliente/minha-conta
const excluirConta = async (req, res) => {
  try {
    const cliente = await buscarClientePorEmail(req.usuario.email);

    if (cliente) {
      await pool.query('DELETE FROM agendamentos WHERE cliente_id = $1', [cliente.id]);
      await pool.query('DELETE FROM veiculos WHERE cliente_id = $1', [cliente.id]);
      await pool.query('DELETE FROM clientes WHERE id = $1', [cliente.id]);
    }

    await pool.query('DELETE FROM usuarios WHERE id = $1', [req.usuario.id]);

    res.status(200).json({ mensagem: 'Conta excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({ erro: 'Erro ao excluir conta' });
  }
};

module.exports = {
  meusAgendamentos,
  meusVeiculos,
  criarVeiculoCliente,
  excluirVeiculoCliente,
  criarAgendamentoCliente,
  excluirConta
};
