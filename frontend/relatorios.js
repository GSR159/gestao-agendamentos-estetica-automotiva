async function carregarRelatorios() {
  try {
    const res  = await fetch(`${API}/relatorios`);
    const data = await res.json();

    // Cards
    document.getElementById('val-ticket').innerText =
      'R$ ' + Number(data.ticketMedio || 0).toFixed(2).replace('.', ',');
    document.getElementById('val-receita').innerText =
      'R$ ' + Number(data.receitaTotal || 0).toFixed(2).replace('.', ',');
    document.getElementById('val-fidelizacao').innerText =
      (data.fidelizacao || 0) + '%';

    // Evolução temporal — datas formatadas em pt-BR
    const labelsReceita = data.evolucao.map(e =>
      new Date(e.dia + '/2024').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        .replace(' de ', ' ')
    );
    const dadosReceita = data.evolucao.map(e => e.total);

    // Mix de serviços
    const labelsServicos = data.servicos.map(s => s.nome);
    const dadosServicos  = data.servicos.map(s => s.total);

    inicializarGraficos(labelsReceita, dadosReceita, labelsServicos, dadosServicos);

    // Tabela de clientes
    const tbody = document.getElementById('rankingClientesBody');
    tbody.innerHTML = '';

    if (!data.clientes.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="py-8 text-center text-slate-500">Nenhum dado disponível.</td></tr>`;
      return;
    }

    data.clientes.forEach(cliente => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-medium text-white">${cliente.nome}</td>
        <td>${cliente.qtd}</td>
        <td>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${(cliente.servicos_realizados || '—').split(', ').map(s =>
              s === '—' ? '<span style="color:#64748b">—</span>'
              : `<span style="background:rgba(59,130,246,.12);color:#60a5fa;padding:2px 8px;border-radius:9999px;font-size:.72rem;font-weight:600;white-space:nowrap;">${s}</span>`
            ).join('')}
          </div>
        </td>
        <td class="text-right font-bold text-white">
          R$ ${Number(cliente.total).toFixed(2).replace('.', ',')}
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Erro ao carregar relatórios:', err);
  }
}