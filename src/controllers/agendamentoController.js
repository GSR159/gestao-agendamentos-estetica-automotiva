const pool = require('../config/db');
const { Resend } = require('resend');

const EMAIL_FROM = process.env.EMAIL_USER || 'noreply@smartsystemauto.com.br';
const FRONT_URL  = process.env.FRONT_URL  || 'http://127.0.0.1:5500';

// ─────────────────────────────────────────
//  TEMPLATE BASE
// ─────────────────────────────────────────
function emailBase({ titulo, subtitulo, corpo, btnTexto, btnHref, rodape, acento }) {
  const cor = acento || '#3b82f6';
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#0f172a;border-radius:16px;padding:14px 24px;">
                    <span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:0.5px;">🚗 Smart System</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${cor};height:4px;line-height:4px;font-size:0;">&nbsp;</td>
                </tr>

                <tr>
                  <td style="padding:40px 40px 32px;">
                    <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3;">${titulo}</p>
                    ${subtitulo ? `<p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.6;">${subtitulo}</p>` : '<div style="margin-bottom:28px;"></div>'}
                    ${corpo}
                    ${btnTexto && btnHref ? `
                    <table cellpadding="0" cellspacing="0" style="margin-top:32px;">
                      <tr>
                        <td style="background:${cor};border-radius:10px;">
                          <a href="${btnHref}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
                            ${btnTexto} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>` : ''}
                  </td>
                </tr>

                <tr>
                  <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;">
                    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">${rodape || 'Se você não solicitou esta ação, ignore este e-mail com segurança.'}</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">Smart System &mdash; Estética Automotiva</p>
              <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1;">&copy; ${new Date().getFullYear()} smartsystemauto.com.br</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────
//  TEMPLATE NOTIFICAÇÃO AGENDAMENTO
// ─────────────────────────────────────────
function emailAgendamento(nomeCliente, status, ag) {
  const aprovado  = status === 'aprovado';
  const concluido = status === 'concluido';
  const cor       = aprovado ? '#16a34a' : concluido ? '#0ea5e9' : '#dc2626';
  const titulo    = aprovado  ? 'Agendamento confirmado'
                  : concluido ? 'Serviço concluído!'
                  : 'Agendamento não confirmado';
  const subtitulo = aprovado
    ? `Olá, ${nomeCliente}! Seu agendamento foi aprovado.`
    : concluido
    ? `Olá, ${nomeCliente}! Seu serviço foi concluído com sucesso.`
    : `Olá, ${nomeCliente}. Infelizmente seu agendamento não pôde ser confirmado.`;

  const dataFormatada = new Date(ag.data).toLocaleString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });

  const corpo = `
    <p style="margin:0 0 20px;font-size:15px;color:#334155;line-height:1.7;">
      ${aprovado
        ? 'Seu veículo está confirmado para atendimento. Confira os detalhes abaixo:'
        : concluido
        ? 'Obrigado por escolher a Smart System! Seu veículo está pronto.'
        : 'Entre em contato conosco para mais informações ou para reagendar.'}
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:8px;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.6px;">Data e Hora</p>
          <p style="margin:4px 0 0;font-size:14px;color:#0f172a;font-weight:600;">${dataFormatada}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.6px;">Serviço</p>
          <p style="margin:4px 0 0;font-size:14px;color:#0f172a;font-weight:600;">${ag.servico}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;${ag.funcionario ? 'border-bottom:1px solid #e2e8f0;' : ''}">
          <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.6px;">Veículo</p>
          <p style="margin:4px 0 0;font-size:14px;color:#0f172a;font-weight:600;">${ag.veiculo}</p>
        </td>
      </tr>
      ${ag.funcionario ? `
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.6px;">Responsável</p>
          <p style="margin:4px 0 0;font-size:14px;color:#0f172a;font-weight:600;">${ag.funcionario}</p>
        </td>
      </tr>` : ''}
    </table>
  `;

  return emailBase({
    titulo,
    subtitulo,
    corpo,
    btnTexto: (aprovado || concluido) ? 'Ver meus agendamentos' : null,
    btnHref:  (aprovado || concluido) ? `${FRONT_URL}/tela_cliente.html` : null,
    acento:   cor,
    rodape:   'Você está recebendo este e-mail pois possui uma conta no Smart System.'
  });
}

// ─────────────────────────────────────────
//  ENVIAR EMAIL
// ─────────────────────────────────────────
async function notificarCliente(emailCliente, nomeCliente, status, agendamento) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const assunto = status === 'aprovado'  ? '✅ Agendamento confirmado — Smart System'
                : status === 'concluido' ? '🏁 Serviço concluído — Smart System'
                : '❌ Agendamento não confirmado — Smart System';
  try {
    const { data, error } = await resend.emails.send({
      from:    `Smart System <${EMAIL_FROM}>`,
      to:      emailCliente,
      subject: assunto,
      html:    emailAgendamento(nomeCliente, status, agendamento),
    });
    if (error) console.error('[RESEND ERROR]', error);
    else       console.log('[EMAIL AGENDAMENTO]', data?.id);
  } catch (err) {
    console.error('[RESEND EXCEPTION]', err.message);
  }
}

// ─────────────────────────────────────────
//  LISTAR + EXPIRAÇÃO AUTOMÁTICA
// ─────────────────────────────────────────
const listarAgendamentos = async (req, res) => {
  try {
    await pool.query(`
      UPDATE agendamentos SET status = 'recusado'
      WHERE status = 'pendente' AND criado_em < NOW() - INTERVAL '48 hours'
    `);
    const resultado = await pool.query(`
      SELECT DISTINCT a.id, c.nome AS cliente, v.modelo AS veiculo,
        s.nome AS servico, f.nome AS funcionario, a.funcionario_id,
        a.data, a.status, a.desconto_aniversario
      FROM agendamentos a
      JOIN clientes  c ON a.cliente_id  = c.id
      JOIN veiculos  v ON a.veiculo_id  = v.id
      JOIN servicos  s ON a.servico_id  = s.id
      LEFT JOIN funcionarios f ON a.funcionario_id = f.id
      ORDER BY a.data ASC
    `);
    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ erro: 'Erro ao listar agendamentos' });
  }
};

// ─────────────────────────────────────────
//  CRIAR AGENDAMENTO
// ─────────────────────────────────────────
const criarAgendamento = async (req, res) => {
  const { cliente_id, veiculo_id, servico_id, data, funcionario_id } = req.body;
  if (!cliente_id || !veiculo_id || !servico_id || !data)
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });

  try {
    const servicoResult = await pool.query('SELECT duracao_minutos FROM servicos WHERE id = $1', [servico_id]);
    if (servicoResult.rows.length === 0) return res.status(404).json({ erro: 'Serviço não encontrado.' });

    const duracaoMinutos = servicoResult.rows[0].duracao_minutos;
    const veiculoCheck   = await pool.query('SELECT * FROM veiculos WHERE id = $1 AND cliente_id = $2', [veiculo_id, cliente_id]);
    if (veiculoCheck.rows.length === 0) return res.status(400).json({ erro: 'Veículo não pertence ao cliente.' });

    const inicioNovo = new Date(data);
    const fimNovo    = new Date(inicioNovo.getTime() + duracaoMinutos * 60000);

    if (funcionario_id) {
      const funcRes = await pool.query('SELECT id FROM funcionarios WHERE id = $1 AND ativo = TRUE', [funcionario_id]);
      if (funcRes.rows.length === 0) return res.status(400).json({ erro: 'Funcionário não encontrado ou inativo.' });

      const conflitos = await pool.query(`
        SELECT a.data, s.duracao_minutos FROM agendamentos a
        JOIN servicos s ON a.servico_id = s.id
        WHERE a.funcionario_id = $1 AND a.status != 'recusado'
          AND a.data BETWEEN $2 AND $3
      `, [funcionario_id,
          new Date(inicioNovo.getTime() - 24*60*60*1000).toISOString(),
          new Date(fimNovo.getTime()   + 24*60*60*1000).toISOString()]);

      for (const ag of conflitos.rows) {
        const iEx = new Date(ag.data);
        const fEx = new Date(iEx.getTime() + ag.duracao_minutos * 60000);
        if (inicioNovo < fEx && fimNovo > iEx)
          return res.status(400).json({ erro: 'Este funcionário já está ocupado neste horário.' });
      }
    } else {
      const conflitos = await pool.query(`
        SELECT a.data, s.duracao_minutos FROM agendamentos a
        JOIN servicos s ON a.servico_id = s.id
        WHERE a.status != 'recusado' AND a.data BETWEEN $1 AND $2
      `, [new Date(inicioNovo.getTime() - 24*60*60*1000).toISOString(),
          new Date(fimNovo.getTime()   + 24*60*60*1000).toISOString()]);

      for (const ag of conflitos.rows) {
        const iEx = new Date(ag.data);
        const fEx = new Date(iEx.getTime() + ag.duracao_minutos * 60000);
        if (inicioNovo < fEx && fimNovo > iEx)
          return res.status(400).json({ erro: 'Horário já ocupado.' });
      }
    }

    const resultado = await pool.query(
      `INSERT INTO agendamentos (cliente_id, veiculo_id, servico_id, data, duracao_minutos, status, funcionario_id)
       VALUES ($1,$2,$3,$4,$5,'pendente',$6) RETURNING *`,
      [cliente_id, veiculo_id, servico_id, data, duracaoMinutos, funcionario_id || null]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ erro: 'Erro ao criar agendamento.' });
  }
};

// ─────────────────────────────────────────
//  ATUALIZAR STATUS + NOTIFICAR
// ─────────────────────────────────────────
const atualizarStatus = async (req, res) => {
  const { id }                     = req.params;
  const { status, funcionario_id } = req.body;

  // ← concluido adicionado aqui
  const statusValidos = ['pendente', 'aprovado', 'recusado', 'concluido'];
  if (!statusValidos.includes(status)) return res.status(400).json({ erro: 'Status inválido.' });

  try {
    const campos  = ['status = $1'];
    const valores = [status];
    let idx = 2;

    if (funcionario_id !== undefined) { campos.push(`funcionario_id = $${idx++}`); valores.push(funcionario_id || null); }

    valores.push(id);
    const resultado = await pool.query(
      `UPDATE agendamentos SET ${campos.join(', ')} WHERE id = $${idx} RETURNING *`, valores
    );
    if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Agendamento não encontrado.' });

    const agendamento = resultado.rows[0];

    // ← concluido também notifica por email
    if (status === 'aprovado' || status === 'recusado' || status === 'concluido') {
      try {
        const dadosRes = await pool.query(`
          SELECT u.email, c.nome AS nome_cliente,
                 s.nome AS servico, v.modelo AS veiculo, f.nome AS funcionario
          FROM agendamentos a
          JOIN clientes c ON a.cliente_id = c.id
          JOIN usuarios u ON c.usuario_id = u.id
          JOIN servicos s ON a.servico_id = s.id
          JOIN veiculos v ON a.veiculo_id = v.id
          LEFT JOIN funcionarios f ON a.funcionario_id = f.id
          WHERE a.id = $1
        `, [id]);

        if (dadosRes.rows.length > 0) {
          const d = dadosRes.rows[0];
          notificarCliente(d.email, d.nome_cliente, status, {
            data: agendamento.data, servico: d.servico,
            veiculo: d.veiculo, funcionario: d.funcionario,
          });
        }
      } catch (emailErr) {
        console.error('[EMAIL ERRO]', emailErr.message);
      }
    }

    res.status(200).json(agendamento);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
};

// ─────────────────────────────────────────
//  DELETAR
// ─────────────────────────────────────────
const deletarAgendamento = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('DELETE FROM agendamentos WHERE id = $1 RETURNING *', [id]);
    if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    res.status(200).json({ mensagem: 'Agendamento deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({ erro: 'Erro ao deletar agendamento' });
  }
};

module.exports = { listarAgendamentos, criarAgendamento, atualizarStatus, deletarAgendamento };