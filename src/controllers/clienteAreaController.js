const pool = require('../config/db');

async function buscarClientePorEmail(email) {
  const resultado = await pool.query(
    'SELECT * FROM clientes WHERE email = $1',
    [email]
  );
  return resultado.rows[0] || null;
}

// Verifica se hoje é o aniversário do cliente
function ehAniversario(dataNascimento) {
  if (!dataNascimento) return false;
  const hoje = new Date();
  const nasc  = new Date(dataNascimento);
  return (
    hoje.getDate()  === nasc.getUTCDate() &&
    hoje.getMonth() === nasc.getUTCMonth()
  );
}

const meusAgendamentos = async (req, res) => {
  try {
    const cliente = await buscarClientePorEmail(req.usuario.email);
    if (!cliente) return res.status(200).json([]);

    const resultado = await pool.query(`
      SELECT
        a.id,
        a.data,
        a.status,
        a.desconto_aniversario,
        s.nome            AS servico,
        s.duracao_minutos,
        s.preco,
        v.modelo          AS veiculo_modelo,
        v.placa           AS veiculo_placa
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      JOIN veiculos v ON a.veiculo_id = v.id
      WHERE a.cliente_id = $1
      ORDER BY a.data DESC
    `, [cliente.id]);

    const agendamentos = resultado.rows.map(a => {
      const dataObj = new Date(a.data);
      return {
        id:                   a.id,
        data:                 a.data,
        hora:                 dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status:               a.status,
        servico:              a.servico,
        duracao_minutos:      a.duracao_minutos,
        preco:                a.preco,
        desconto_aniversario: a.desconto_aniversario,
        veiculo: {
          modelo: a.veiculo_modelo,
          placa:  a.veiculo_placa
        }
      };
    });

    res.status(200).json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ erro: 'Erro ao listar agendamentos' });
  }
};

const meusVeiculos = async (req, res) => {
  try {
    const cliente = await buscarClientePorEmail(req.usuario.email);
    if (!cliente) return res.status(200).json([]);

    const resultado = await pool.query(
      'SELECT id, modelo, placa, cor, ano, marca FROM veiculos WHERE cliente_id = $1 ORDER BY id ASC',
      [cliente.id]
    );

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ erro: 'Erro ao listar veículos' });
  }
};

const criarVeiculoCliente = async (req, res) => {
  const { modelo, placa, ano, marca, cor } = req.body;

  if (placa && placa.replace(/[^a-zA-Z0-9]/g, '').length > 7)
    return res.status(400).json({ erro: 'Placa inválida. Máximo de 7 caracteres alfanuméricos.' });

  try {
    const cliente = await buscarClientePorEmail(req.usuario.email);
    if (!cliente) return res.status(400).json({ erro: 'Cliente não encontrado para este usuário.' });

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

const atualizarVeiculoCliente = async (req, res) => {
  const { id } = req.params;
  const { modelo, placa, ano, marca, cor } = req.body;

  try {
    const cliente = await buscarClientePorEmail(req.usuario.email);
    if (!cliente) return res.status(400).json({ erro: 'Cliente não encontrado.' });

    const resultado = await pool.query(
      `UPDATE veiculos SET modelo = $1, placa = $2, ano = $3, marca = $4, cor = $5
       WHERE id = $6 AND cliente_id = $7 RETURNING *`,
      [modelo, placa, ano || null, marca || null, cor || null, id, cliente.id]
    );

    if (resultado.rows.length === 0)
      return res.status(404).json({ erro: 'Veículo não encontrado ou não pertence a você.' });

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    res.status(500).json({ erro: 'Erro ao atualizar veículo' });
  }
};

const excluirVeiculoCliente = async (req, res) => {
  const { id } = req.params;
  try {
    const cliente = await buscarClientePorEmail(req.usuario.email);
    if (!cliente) return res.status(400).json({ erro: 'Cliente não encontrado.' });

    const resultado = await pool.query(
      'DELETE FROM veiculos WHERE id = $1 AND cliente_id = $2 RETURNING *',
      [id, cliente.id]
    );

    if (resultado.rows.length === 0)
      return res.status(404).json({ erro: 'Veículo não encontrado ou não pertence a você.' });

    res.status(200).json({ mensagem: 'Veículo removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir veículo:', error);
    res.status(500).json({ erro: 'Erro ao excluir veículo' });
  }
};

const criarAgendamentoCliente = async (req, res) => {
  const { veiculo_id, servico_id, data } = req.body;

  if (!veiculo_id || !servico_id || !data)
    return res.status(400).json({ erro: 'Veículo, serviço e data são obrigatórios.' });

  try {
    const cliente = await buscarClientePorEmail(req.usuario.email);
    if (!cliente) return res.status(400).json({ erro: 'Cliente não encontrado para este usuário.' });

    const servicoResult = await pool.query(
      'SELECT duracao_minutos, preco FROM servicos WHERE id = $1', [servico_id]
    );
    if (servicoResult.rows.length === 0)
      return res.status(404).json({ erro: 'Serviço não encontrado.' });

    const { duracao_minutos: duracaoMinutos } = servicoResult.rows[0];

    const veiculoCheck = await pool.query(
      'SELECT * FROM veiculos WHERE id = $1 AND cliente_id = $2', [veiculo_id, cliente.id]
    );
    if (veiculoCheck.rows.length === 0)
      return res.status(400).json({ erro: 'Veículo não pertence a você.' });

    const inicioNovo = new Date(data);
    const fimNovo    = new Date(inicioNovo.getTime() + duracaoMinutos * 60000);

    // Janela de busca — um dia antes e depois pra cobrir serviços longos
    const janelaInicio = new Date(inicioNovo.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const janelaFim    = new Date(fimNovo.getTime()    + 24 * 60 * 60 * 1000).toISOString();

    // Busca total de funcionários ativos
    const totalFuncRes = await pool.query(
      "SELECT COUNT(*) AS total FROM funcionarios WHERE ativo = TRUE"
    );
    const totalFuncionarios = parseInt(totalFuncRes.rows[0].total, 10);

    if (totalFuncionarios === 0)
      return res.status(400).json({ erro: 'Não há funcionários disponíveis no momento.' });

    // Busca todos os agendamentos ativos que podem colidir com o horário pedido
    const agendamentosExistentes = await pool.query(`
      SELECT a.data, s.duracao_minutos
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      WHERE a.status NOT IN ('recusado', 'cancelado', 'concluido')
        AND a.data BETWEEN $1 AND $2
    `, [janelaInicio, janelaFim]);

    // Conta quantos agendamentos de fato se sobrepõem ao intervalo pedido
    let funcionariosOcupados = 0;
    for (const ag of agendamentosExistentes.rows) {
      const inicioEx = new Date(ag.data);
      const fimEx    = new Date(inicioEx.getTime() + ag.duracao_minutos * 60000);
      if (inicioNovo < fimEx && fimNovo > inicioEx) {
        funcionariosOcupados++;
      }
    }

    // Só bloqueia se todos os funcionários estiverem ocupados — igual à lógica da barbearia
    if (funcionariosOcupados >= totalFuncionarios) {
      return res.status(400).json({
        erro: `Todos os funcionários já estão ocupados neste horário. Escolha outro horário.`
      });
    }

    // Tudo certo — verifica desconto de aniversário e cria o agendamento
    const isAniversario = ehAniversario(cliente.data_nascimento);

    const resultado = await pool.query(
      `INSERT INTO agendamentos
         (cliente_id, veiculo_id, servico_id, data, duracao_minutos, status, desconto_aniversario)
       VALUES ($1, $2, $3, $4, $5, 'pendente', $6) RETURNING *`,
      [cliente.id, veiculo_id, servico_id, data, duracaoMinutos, isAniversario]
    );

    const resposta = resultado.rows[0];

    if (isAniversario) {
      return res.status(201).json({
        ...resposta,
        mensagem_aniversario: '🎂 Parabéns! Você ganhou 15% de desconto por ser seu aniversário!'
      });
    }

    res.status(201).json(resposta);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ erro: 'Erro ao criar agendamento' });
  }
};

const buscarConta = async (req, res) => {
  try {
    const cliente = await buscarClientePorEmail(req.usuario.email);
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado.' });

    res.status(200).json({
      id:               cliente.id,
      nome:             cliente.nome,
      email:            cliente.email,
      telefone:         cliente.telefone         || null,
      data_nascimento:  cliente.data_nascimento  || null,
      cep:              cliente.cep              || null,
      logradouro:       cliente.logradouro       || null,
      numero:           cliente.numero           || null,
      complemento:      cliente.complemento      || null,
      bairro:           cliente.bairro           || null,
      cidade:           cliente.cidade           || null,
      estado:           cliente.estado           || null,
      perfil_completo:  cliente.perfil_completo  || false,
      criado_em:        cliente.criado_em        || null,
      aniversario_hoje: ehAniversario(cliente.data_nascimento),
    });
  } catch (error) {
    console.error('Erro ao buscar conta:', error);
    res.status(500).json({ erro: 'Erro ao buscar dados da conta.' });
  }
};

const atualizarConta = async (req, res) => {
  const {
    telefone, data_nascimento, cep, logradouro,
    numero, complemento, bairro, cidade, estado
  } = req.body;

  try {
    const cliente = await buscarClientePorEmail(req.usuario.email);
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado.' });

    const campos  = [];
    const valores = [];
    let idx = 1;

    const adicionar = (campo, valor) => {
      if (valor !== undefined) { campos.push(`${campo} = $${idx++}`); valores.push(valor); }
    };

    adicionar('telefone',        telefone);
    adicionar('data_nascimento', data_nascimento || null);
    adicionar('cep',             cep);
    adicionar('logradouro',      logradouro);
    adicionar('numero',          numero);
    adicionar('complemento',     complemento);
    adicionar('bairro',          bairro);
    adicionar('cidade',          cidade);
    adicionar('estado',          estado);

    if (campos.length === 0)
      return res.status(400).json({ erro: 'Nenhum campo enviado para atualização.' });

    // Recalcula se o perfil ficou completo com os novos dados
    const c = cliente;
    const perfilCompleto = !!(
      (telefone        ?? c.telefone)        &&
      (data_nascimento ?? c.data_nascimento) &&
      (cep             ?? c.cep)             &&
      (logradouro      ?? c.logradouro)      &&
      (cidade          ?? c.cidade)
    );

    adicionar('perfil_completo', perfilCompleto);

    valores.push(cliente.id);
    const resultado = await pool.query(
      `UPDATE clientes SET ${campos.join(', ')} WHERE id = $${idx} RETURNING *`,
      valores
    );

    if (telefone) {
      await pool.query(
        'UPDATE usuarios SET telefone = $1 WHERE id = $2',
        [telefone.trim(), req.usuario.id]
      );
    }

    res.status(200).json({
      mensagem:        'Dados atualizados com sucesso.',
      perfil_completo: perfilCompleto,
      cliente:         resultado.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    res.status(500).json({ erro: 'Erro ao atualizar conta.' });
  }
};

const excluirConta = async (req, res) => {
  try {
    const cliente = await buscarClientePorEmail(req.usuario.email);

    if (cliente) {
      // Anonimiza dados sensíveis do veículo mas mantém o histórico
      await pool.query(
        `UPDATE veiculos SET placa = NULL, cor = NULL WHERE cliente_id = $1`,
        [cliente.id]
      );
      // Anonimiza o cliente conforme a LGPD
      await pool.query(
        `UPDATE clientes
         SET nome = 'Usuário Removido', email = NULL, telefone = NULL,
             data_nascimento = NULL, cep = NULL, logradouro = NULL,
             numero = NULL, complemento = NULL, bairro = NULL,
             cidade = NULL, estado = NULL, usuario_id = NULL, perfil_completo = FALSE
         WHERE id = $1`,
        [cliente.id]
      );
    }

    // Remove o login
    await pool.query('DELETE FROM usuarios WHERE id = $1', [req.usuario.id]);

    res.status(200).json({ mensagem: 'Conta removida em conformidade com a LGPD.' });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({ erro: 'Erro ao excluir conta' });
  }
};

module.exports = {
  meusAgendamentos,
  meusVeiculos,
  criarVeiculoCliente,
  atualizarVeiculoCliente,
  excluirVeiculoCliente,
  criarAgendamentoCliente,
  buscarConta,
  atualizarConta,
  excluirConta,
};