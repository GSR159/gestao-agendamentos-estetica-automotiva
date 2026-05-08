const pool   = require('../config/db');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const { normalizarEmail } = require('../utils/normalizar');

const SECRET         = process.env.JWT_SECRET    || 'segredo_super_forte';
const FRONT_URL      = process.env.FRONT_URL     || 'http://127.0.0.1:5500';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM     = process.env.EMAIL_USER    || 'noreply@smartsystemauto.com.br';

// ─────────────────────────────────────────
//  RESEND CLIENT
// ─────────────────────────────────────────
const resend = new Resend(RESEND_API_KEY);

// ─────────────────────────────────────────
//  TEMPLATE DE EMAIL
// ─────────────────────────────────────────
function templateEmail(titulo, corpo, linkTexto, linkHref) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#0f172a;color:#f8fafc;border-radius:16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#3b82f6;border-radius:12px;padding:12px 20px;">
          <span style="color:white;font-size:1.2rem;font-weight:800;">🚗 Smart System</span>
        </div>
      </div>
      <h2 style="color:#f8fafc;margin-bottom:8px;">${titulo}</h2>
      <p style="color:#94a3b8;line-height:1.6;">${corpo}</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${linkHref}"
           style="display:inline-block;background:#3b82f6;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:1rem;">
          ${linkTexto}
        </a>
      </div>
      <p style="color:#475569;font-size:0.8rem;text-align:center;">
        Se não foi você quem solicitou, ignore este e-mail.<br>
        O link expira em <strong style="color:#94a3b8;">24 horas</strong>.
      </p>
      <hr style="border:none;border-top:1px solid #1e293b;margin:20px 0;">
      <p style="color:#334155;font-size:0.75rem;text-align:center;">Smart System © ${new Date().getFullYear()}</p>
    </div>
  `;
}

// ─────────────────────────────────────────
//  ENVIAR EMAIL VIA RESEND
// ─────────────────────────────────────────
async function enviarEmail(para, assunto, html) {
  if (!RESEND_API_KEY) {
    console.warn('[EMAIL] Sem RESEND_API_KEY — email não enviado');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from:    `Smart System <${EMAIL_FROM}>`,
      to:      para,
      subject: assunto,
      html,
    });

    if (error) console.error('[RESEND ERROR]', error);
    else       console.log('[EMAIL ENVIADO]', data?.id);

  } catch (err) {
    console.error('[RESEND EXCEPTION]', err.message);
  }
}

// ─────────────────────────────────────────
//  REGISTER
// ─────────────────────────────────────────
const register = async (req, res) => {
  try {
    let { nome, email, senha, telefone, tipo } = req.body;

    nome     = nome?.trim();
    email    = normalizarEmail(email);
    telefone = telefone?.trim() || null;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    }

    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ erro: 'Email já cadastrado.' });
    }

    const senhaHash   = await bcrypt.hash(senha, 10);
    const token       = crypto.randomBytes(32).toString('hex');
    const expiracao   = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const tipoUsuario = tipo || 'cliente';

    const novoUsuario = await pool.query(
      `INSERT INTO usuarios
        (nome, email, senha, telefone, tipo, email_confirmado, token_confirmacao, token_expira_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id`,
      [nome, email, senhaHash, telefone, tipoUsuario, false, token, expiracao]
    );

    const usuarioId = novoUsuario.rows[0].id;

    if (tipoUsuario === 'cliente') {
      await pool.query(
        `INSERT INTO clientes (nome, email, telefone, usuario_id) VALUES ($1,$2,$3,$4)`,
        [nome, email, telefone, usuarioId]
      );
    }

    const link = `${FRONT_URL}/confirmar-email.html?token=${token}`;
    const html = templateEmail(
      `Olá, ${nome}! Confirme seu e-mail`,
      'Seu cadastro foi realizado com sucesso. Clique no botão abaixo para ativar sua conta.',
      'Confirmar E-mail',
      link
    );

    // Envia em background — não bloqueia a resposta
    enviarEmail(email, 'Confirme seu e-mail — Smart System', html);

    return res.status(201).json({
      mensagem: 'Cadastro realizado! Verifique seu e-mail para ativar a conta.'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// ─────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────
const login = async (req, res) => {
  try {
    let { email, senha } = req.body;
    email = normalizarEmail(email);

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado.' });
    }

    const usuario = resultado.rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha inválida.' });
    }

    if (!usuario.email_confirmado) {
      return res.status(401).json({
        erro: 'Confirme seu email antes de fazer login.',
        reenviar: true,
      });
    }

    const clienteResult = await pool.query(
      'SELECT id FROM clientes WHERE usuario_id = $1', [usuario.id]
    );
    const cliente_id = clienteResult.rows[0]?.id || null;

    const token = jwt.sign(
      { id: usuario.id, tipo: usuario.tipo, email: usuario.email, cliente_id },
      SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({ mensagem: 'Login realizado com sucesso.', token });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// ─────────────────────────────────────────
//  CONFIRMAR EMAIL
// ─────────────────────────────────────────
const confirmarEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ erro: 'Token não informado.' });
    }

    const resultado = await pool.query(
      `SELECT id, token_expira_em, email_confirmado FROM usuarios WHERE token_confirmacao = $1`,
      [token]
    );

    if (resultado.rows.length === 0) {
      return res.status(400).json({ erro: 'Token inválido.' });
    }

    const usuario = resultado.rows[0];

    if (usuario.email_confirmado) {
      return res.status(200).json({ mensagem: 'Email já confirmado. Faça login!' });
    }

    if (!usuario.token_expira_em || new Date(usuario.token_expira_em) < new Date()) {
      return res.status(400).json({ erro: 'Token expirado. Solicite um novo link.' });
    }

    await pool.query(
      `UPDATE usuarios SET email_confirmado = true, token_confirmacao = NULL, token_expira_em = NULL WHERE id = $1`,
      [usuario.id]
    );

    return res.status(200).json({ mensagem: 'E-mail confirmado com sucesso! Você já pode fazer login.' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// ─────────────────────────────────────────
//  REENVIAR EMAIL
// ─────────────────────────────────────────
const reenviarEmail = async (req, res) => {
  try {
    let { email } = req.body;
    email = normalizarEmail(email);

    if (!email) {
      return res.status(400).json({ erro: 'Email é obrigatório.' });
    }

    const resultado = await pool.query(
      'SELECT id, nome, email_confirmado FROM usuarios WHERE email = $1', [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const usuario = resultado.rows[0];

    if (usuario.email_confirmado) {
      return res.status(400).json({ erro: 'Email já confirmado.' });
    }

    const novoToken     = crypto.randomBytes(32).toString('hex');
    const novaExpiracao = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await pool.query(
      `UPDATE usuarios SET token_confirmacao = $1, token_expira_em = $2 WHERE id = $3`,
      [novoToken, novaExpiracao, usuario.id]
    );

    const link = `${FRONT_URL}/confirmar-email.html?token=${novoToken}`;
    const html = templateEmail(
      `Novo link de confirmação`,
      'Você solicitou um novo link de confirmação de e-mail. Clique abaixo para ativar sua conta.',
      'Confirmar E-mail',
      link
    );

    enviarEmail(email, 'Novo link de confirmação — Smart System', html);

    return res.status(200).json({ mensagem: 'E-mail reenviado com sucesso! Verifique sua caixa de entrada.' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// ─────────────────────────────────────────
//  ESQUECI MINHA SENHA
// ─────────────────────────────────────────
const esquecerSenha = async (req, res) => {
  try {
    let { email } = req.body;
    email = normalizarEmail(email);

    if (!email) {
      return res.status(400).json({ erro: 'Email é obrigatório.' });
    }

    const resultado = await pool.query(
      'SELECT id, nome FROM usuarios WHERE email = $1', [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(200).json({
        mensagem: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.'
      });
    }

    const usuario   = resultado.rows[0];
    const token     = crypto.randomBytes(32).toString('hex');
    const expiracao = new Date(Date.now() + 1000 * 60 * 60);

    await pool.query(
      `UPDATE usuarios SET token_recuperacao = $1, token_recuperacao_expira = $2 WHERE id = $3`,
      [token, expiracao, usuario.id]
    );

    const link = `${FRONT_URL}/redefinir-senha.html?token=${token}`;
    const html = templateEmail(
      `Redefinir sua senha`,
      `Olá, ${usuario.nome}! Recebemos uma solicitação para redefinir a senha da sua conta. O link expira em <strong>1 hora</strong>.`,
      'Redefinir Senha',
      link
    );

    enviarEmail(email, 'Redefinição de senha — Smart System', html);

    return res.status(200).json({
      mensagem: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// ─────────────────────────────────────────
//  REDEFINIR SENHA
// ─────────────────────────────────────────
const redefinirSenha = async (req, res) => {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res.status(400).json({ erro: 'Token e nova senha são obrigatórios.' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    const resultado = await pool.query(
      `SELECT id, token_recuperacao_expira FROM usuarios WHERE token_recuperacao = $1`,
      [token]
    );

    if (resultado.rows.length === 0) {
      return res.status(400).json({ erro: 'Token inválido ou já utilizado.' });
    }

    const usuario = resultado.rows[0];

    if (!usuario.token_recuperacao_expira || new Date(usuario.token_recuperacao_expira) < new Date()) {
      return res.status(400).json({ erro: 'Token expirado. Solicite um novo link.' });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await pool.query(
      `UPDATE usuarios SET senha = $1, token_recuperacao = NULL, token_recuperacao_expira = NULL WHERE id = $2`,
      [senhaHash, usuario.id]
    );

    return res.status(200).json({ mensagem: 'Senha redefinida com sucesso! Faça login com a nova senha.' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// ─────────────────────────────────────────
//  VALIDAR TOKEN DE RECUPERAÇÃO
// ─────────────────────────────────────────
const validarTokenRecuperacao = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ valido: false, erro: 'Token não informado.' });
    }

    const resultado = await pool.query(
      `SELECT id, token_recuperacao_expira FROM usuarios WHERE token_recuperacao = $1`,
      [token]
    );

    if (resultado.rows.length === 0) {
      return res.status(400).json({ valido: false, erro: 'Token inválido.' });
    }

    const usuario = resultado.rows[0];

    if (!usuario.token_recuperacao_expira || new Date(usuario.token_recuperacao_expira) < new Date()) {
      return res.status(400).json({ valido: false, erro: 'Token expirado.' });
    }

    return res.status(200).json({ valido: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ valido: false, erro: 'Erro interno no servidor.' });
  }
};

module.exports = {
  register,
  login,
  confirmarEmail,
  reenviarEmail,
  esquecerSenha,
  redefinirSenha,
  validarTokenRecuperacao,
};