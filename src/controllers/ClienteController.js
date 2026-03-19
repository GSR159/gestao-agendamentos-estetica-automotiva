const clienteModel = require('../models/ClienteModel');

const getClientes = async (req, res) => {
  try {
    const clientes = await clienteModel.listarClientes();
    res.status(200).json(clientes);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ erro: 'Erro ao listar clientes' });
  }
};

const postCliente = async (req, res) => {
  try {
    const { nome, telefone, email } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: 'O nome é obrigatório' });
    }

    const novoCliente = await clienteModel.criarCliente(nome, telefone, email);
    res.status(201).json(novoCliente);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ erro: 'Erro ao criar cliente' });
  }
};

module.exports = {
  getClientes,
  postCliente,
};