const pool = require('../config/db');

const obterRelatorios = async (req, res) => {
  try {
    // RECEITA TOTAL (só agendamentos aprovados/concluídos)
    const receitaResult = await pool.query(`
      SELECT COALESCE(SUM(s.preco), 0) AS total
      FROM agendamentos a
      JOIN servicos s ON s.id = a.servico_id
      WHERE a.status IN ('aprovado', 'concluido')
    `);
    const receitaTotal = Number(receitaResult.rows[0].total);

    // TICKET MÉDIO
    const totalAgendamentos = await pool.query(`
      SELECT COUNT(*) AS qtd
      FROM agendamentos
      WHERE status IN ('aprovado', 'concluido')
    `);
    const qtd = Number(totalAgendamentos.rows[0].qtd);
    const ticketMedio = qtd > 0 ? receitaTotal / qtd : 0;

    // FIDELIZAÇÃO — % de clientes com mais de 1 agendamento
    const fidelizacaoResult = await pool.query(`
      SELECT 
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE total > 1) / NULLIF(COUNT(*), 0)
        , 0) AS pct
      FROM (
        SELECT cliente_id, COUNT(*) AS total
        FROM agendamentos
        WHERE status IN ('aprovado', 'concluido')
        GROUP BY cliente_id
      ) sub
    `);
    const fidelizacao = Number(fidelizacaoResult.rows[0].pct || 0);

    // EVOLUÇÃO TEMPORAL (últimos 30 dias)
    const evolucaoResult = await pool.query(`
      SELECT 
        TO_CHAR(a.data, 'DD/MM') AS dia,
        COALESCE(SUM(s.preco), 0) AS total
      FROM agendamentos a
      JOIN servicos s ON s.id = a.servico_id
      WHERE a.status IN ('aprovado', 'concluido')
        AND a.data >= NOW() - INTERVAL '30 days'
      GROUP BY TO_CHAR(a.data, 'DD/MM'), DATE_TRUNC('day', a.data)
      ORDER BY DATE_TRUNC('day', a.data) ASC
    `);
    const evolucao = evolucaoResult.rows.map(r => ({
      dia: r.dia,
      total: Number(r.total)
    }));

    // Serviços Realizados
    const servicosResult = await pool.query(`
      SELECT s.nome, COUNT(*) AS total
      FROM agendamentos a
      JOIN servicos s ON s.id = a.servico_id
      WHERE a.status IN ('aprovado', 'concluido')
      GROUP BY s.nome
      ORDER BY total DESC
    `);
    const servicos = servicosResult.rows.map(r => ({
      nome: r.nome,
      total: Number(r.total)
    }));

    // RANKING DE CLIENTES — mostra "Usuário Removido" se usuário excluir a conta
    const clientesResult = await pool.query(`
      SELECT 
        COALESCE(c.nome, 'Usuário Removido') AS nome,
        COUNT(a.id) AS qtd,
        COALESCE(SUM(s.preco), 0) AS total
      FROM agendamentos a
      LEFT JOIN clientes c ON c.id = a.cliente_id
      JOIN servicos s ON s.id = a.servico_id
      WHERE a.status IN ('aprovado', 'concluido')
      GROUP BY c.nome
      ORDER BY total DESC
    `);
    const clientes = clientesResult.rows.map(r => ({
      nome: r.nome,
      qtd: Number(r.qtd),
      total: Number(r.total)
    }));

    res.status(200).json({
      receitaTotal,
      ticketMedio,
      fidelizacao,
      evolucao,
      servicos,
      clientes
    });

  } catch (error) {
    console.error('Erro ao obter relatórios:', error);
    res.status(500).json({ erro: error.message });
  }
};

module.exports = { obterRelatorios };