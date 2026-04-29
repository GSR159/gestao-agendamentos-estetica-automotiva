const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { normalizarEmail } = require('../utils/normalizar');

const SECRET = process.env.JWT_SECRET || "segredo_super_forte";
const FRONT_URL = process.env.FRONT_URL || "http://127.0.0.1:5500";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// ================= CONFIG EMAIL =================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// ================= FUNÇÃO ENVIAR EMAIL =================
async function enviarEmailConfirmacao(email, nome, link) {
  await transporter.sendMail({
    from: `"Smart System" <${EMAIL_USER}>`,
    to: email,
    subject: 'Confirme seu email - Smart System',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px;">
        <h2>Olá, ${nome}!</h2>
        <p>Seu cadastro foi realizado com sucesso.</p>
        <p>Clique abaixo para confirmar seu email:</p>

        <a href="${link}" style="
          display:inline-block;
          background:#2563eb;
          color:#fff;
          padding:12px 20px;
          border-radius:8px;
          text-decoration:none;
          font-weight:bold;
        ">
          Confirmar Email
        </a>

        <p style="margin-top:20px;">
          Ou copie e cole:
        </p>

        <p>${link}</p>
      </div>
    `
  });
}

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    let { nome, email, senha, telefone, tipo } = req.body;

    nome = nome?.trim();
    email = normalizarEmail(email);
    telefone = telefone?.trim() || null;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    }

    const existe = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ erro: 'Email já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const token = crypto.randomBytes(32).toString('hex');
    const expiracao = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const tipoUsuario = tipo || 'cliente';

    await pool.query(
      `INSERT INTO usuarios
        (nome, email, senha, telefone, tipo, email_confirmado, token_confirmacao, token_expira_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [nome, email, senhaHash, telefone, tipoUsuario, false, token, expiracao]
    );

    const link = `${FRONT_URL}/confirmar-email.html?token=${token}`;

    if (EMAIL_USER && EMAIL_PASS) {
      await enviarEmailConfirmacao(email, nome, link);
    } else {
      console.warn("LINK DE CONFIRMAÇÃO:", link);
    }

    return res.status(201).json({
      mensagem: 'Cadastro realizado com sucesso. Verifique seu email.'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    let { email, senha } = req.body;

    email = normalizarEmail(email);

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado.' });
    }

    const usuario = resultado.rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha inválida.' });
    }

    if (!usuario.email_confirmado) {
      return res.status(401).json({ erro: 'Confirme seu email antes de fazer login.' });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        tipo: usuario.tipo,
        email: usuario.email
      },
      SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// ================= CONFIRMAR EMAIL =================
const confirmarEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ erro: 'Token não informado.' });
    }

    const resultado = await pool.query(
      `SELECT id, token_expira_em, email_confirmado
       FROM usuarios
       WHERE token_confirmacao = $1`,
      [token]
    );

    if (resultado.rows.length === 0) {
      return res.status(400).json({ erro: 'Token inválido.' });
    }

    const usuario = resultado.rows[0];

    if (usuario.email_confirmado) {
      return res.status(200).json({ mensagem: 'Email já confirmado.' });
    }

    if (!usuario.token_expira_em || new Date(usuario.token_expira_em) < new Date()) {
      return res.status(400).json({ erro: 'Token expirado.' });
    }

    await pool.query(
      `UPDATE usuarios
       SET email_confirmado = true,
           token_confirmacao = NULL,
           token_expira_em = NULL
       WHERE id = $1`,
      [usuario.id]
    );

    return res.status(200).json({ mensagem: 'Email confirmado com sucesso.' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// ================= REENVIAR EMAIL =================
const reenviarEmail = async (req, res) => {
  try {
    let { email } = req.body;

    email = normalizarEmail(email);

    if (!email) {
      return res.status(400).json({ erro: 'Email é obrigatório.' });
    }

    const resultado = await pool.query(
      'SELECT id, nome, email_confirmado FROM usuarios WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const usuario = resultado.rows[0];

    if (usuario.email_confirmado) {
      return res.status(400).json({ erro: 'Email já confirmado.' });
    }

    const novoToken = crypto.randomBytes(32).toString('hex');
    const novaExpiracao = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await pool.query(
      `UPDATE usuarios
       SET token_confirmacao = $1,
           token_expira_em = $2
       WHERE id = $3`,
      [novoToken, novaExpiracao, usuario.id]
    );

    const link = `${FRONT_URL}/confirmar-email.html?token=${novoToken}`;

    if (EMAIL_USER && EMAIL_PASS) {
      await enviarEmailConfirmacao(email, usuario.nome, link);
    } else {
      console.warn("LINK DE REENVIO:", link);
    }

    return res.status(200).json({
      mensagem: 'Email reenviado com sucesso.'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

module.exports = {
  register,
  login,
  confirmarEmail,
  reenviarEmail
};