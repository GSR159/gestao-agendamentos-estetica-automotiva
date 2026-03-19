const db = require('../config/db');

const listarAgendamentos = async () => {
  const resultado = await db.query(`
    SELECT
      agendamentos.id,
      agendamentos.cliente_id,
      clientes.nome AS cliente_nome,
      agendamentos.veiculo_id,
      veiculos.modelo AS veiculo_modelo,
      agendamentos.servico_id,
      servicos.nome AS servico_nome,
      agendamentos.data,
      agendamentos.status
    FROM agendamentos
    LEFT JOIN clientes ON clientes.id = agendamentos.cliente_id
    LEFT JOIN veiculos ON veiculos.id = agendamentos.veiculo_id
    LEFT JOIN servicos ON servicos.id = agendamentos.servico_id
    ORDER BY agendamentos.id ASC
  `);

  return resultado.rows;
};

const criarAgendamento = async (cliente_id, veiculo_id, servico_id, data, status) => {
  const resultado = await db.query(
    `INSERT INTO agendamentos (cliente_id, veiculo_id, servico_id, data, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [cliente_id, veiculo_id, servico_id, data, status]
  );

  return resultado.rows[0];
};

module.exports = {
  listarAgendamentos,
  criarAgendamento,
};