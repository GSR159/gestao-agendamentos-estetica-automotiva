const servicoModel = require('../models/servicoModel');

const getServicos = async (req, res) => {
  try {
    const servicos = await servicoModel.listarServicos();
    res.status(200).json(servicos);
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({ erro: 'Erro ao listar serviços' });
  }
};

const postServico = async (req, res) => {
  try {
    const { nome, preco } = req.body;

    if (!nome || preco === undefined) {
      return res.status(400).json({
        erro: 'nome e preco são obrigatórios'
      });
    }

    const novoServico = await servicoModel.criarServico(nome, preco);
    res.status(201).json(novoServico);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ erro: 'Erro ao criar serviço' });
  }
};

module.exports = {
  getServicos,
  postServico,
};