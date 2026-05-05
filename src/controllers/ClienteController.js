const pool = require('../config/db');

const listarClientes = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM clientes ORDER BY id ASC');
    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ erro: 'Erro ao listar clientes' });
  }
};

const buscarClientePorId = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ erro: 'Erro ao buscar cliente' });
  }
};

const criarCliente = async (req, res) => {
  let { nome, telefone, email } = req.body;
  email = email.toLowerCase().trim();
  try {
    const resultado = await pool.query(
      'INSERT INTO clientes (nome, telefone, email) VALUES ($1, $2, $3) RETURNING *',
      [nome, telefone, email]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ erro: 'Erro ao criar cliente' });
  }
};

const atualizarCliente = async (req, res) => {
  const { id } = req.params;
  let { nome, telefone, email } = req.body;
  email = email.toLowerCase().trim();
  try {
    const resultado = await pool.query(
      'UPDATE clientes SET nome = $1, telefone = $2, email = $3 WHERE id = $4 RETURNING *',
      [nome, telefone, email, id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ erro: 'Erro ao atualizar cliente' });
  }
};

// LGPD — anonimiza em vez de deletar
const deletarCliente = async (req, res) => {
  const { id } = req.params;
  try {
    // Busca o usuario_id antes de anonimizar
    const clienteResult = await pool.query(
      'SELECT usuario_id FROM clientes WHERE id = $1',
      [id]
    );

    if (clienteResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    const usuario_id = clienteResult.rows[0].usuario_id;

    // Anonimiza o cliente — histórico de agendamentos preservado
    await pool.query(
      `UPDATE clientes 
       SET nome = 'Usuário Removido',
           email = NULL,
           telefone = NULL,
           usuario_id = NULL
       WHERE id = $1`,
      [id]
    );

    // Deleta o login do usuário
    if (usuario_id) {
      await pool.query('DELETE FROM usuarios WHERE id = $1', [usuario_id]);
    }

    res.status(200).json({ mensagem: 'Conta removida em conformidade com a LGPD' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ erro: 'Erro ao deletar cliente' });
  }
};

module.exports = {
  listarClientes,
  buscarClientePorId,
  criarCliente,
  atualizarCliente,
  deletarCliente,
};