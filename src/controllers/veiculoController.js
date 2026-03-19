const veiculoModel = require('../models/veiculoModel');

const getVeiculos = async (req, res) => {
  try {
    const veiculos = await veiculoModel.listarVeiculos();
    res.status(200).json(veiculos);
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ erro: 'Erro ao listar veículos' });
  }
};

const postVeiculo = async (req, res) => {
  try {
    const { cliente_id, modelo, placa, cor } = req.body;

    if (!cliente_id || !modelo) {
      return res.status(400).json({
        erro: 'cliente_id e modelo são obrigatórios'
      });
    }

    const novoVeiculo = await veiculoModel.criarVeiculo(
      cliente_id,
      modelo,
      placa,
      cor
    );

    res.status(201).json(novoVeiculo);
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    res.status(500).json({ erro: 'Erro ao criar veículo' });
  }
};

module.exports = {
  getVeiculos,
  postVeiculo,
};