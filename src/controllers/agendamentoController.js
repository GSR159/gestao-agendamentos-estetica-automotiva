const agendamentoModel = require('../models/agendamentoModel');

const getAgendamentos = async (req, res) => {
  try {
    const agendamentos = await agendamentoModel.listarAgendamentos();
    res.status(200).json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ erro: 'Erro ao listar agendamentos' });
  }
};

const postAgendamento = async (req, res) => {
  try {
    const { cliente_id, veiculo_id, servico_id, data, status } = req.body;

    if (!cliente_id || !veiculo_id || !servico_id || !data || !status) {
      return res.status(400).json({
        erro: 'cliente_id, veiculo_id, servico_id, data e status são obrigatórios'
      });
    }

    const novoAgendamento = await agendamentoModel.criarAgendamento(
      cliente_id,
      veiculo_id,
      servico_id,
      data,
      status
    );

    res.status(201).json(novoAgendamento);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ erro: 'Erro ao criar agendamento' });
  }
};

module.exports = {
  getAgendamentos,
  postAgendamento,
};