async function carregarRelatorios() {
  try {
    const res  = await fetch(`${API}/relatorios`);
    const data = await res.json();

    // 💰 CARDS
    document.getElementById('val-ticket').innerText =
      'R$ ' + Number(data.ticketMedio || 0).toFixed(2).replace('.', ',');

    document.getElementById('val-receita').innerText =
      'R$ ' + Number(data.receitaTotal || 0).toFixed(2).replace('.', ',');

    document.getElementById('val-fidelizacao').innerText =
      (data.fidelizacao || 0) + '%';

    // 📈 EVOLUÇÃO — datas formatadas em pt-BR
    const labelsReceita = data.evolucao.map(e => {
      return new Date(e.dia).toLocaleDateString('pt-BR', {
        day:      '2-digit',
        month:    'short',
        timeZone: 'UTC'
      });
    });
    const dadosReceita = data.evolucao.map(e => e.total);

    // 🧼 SERVIÇOS
    const labelsServicos = data.servicos.map(s => s.nome);
    const dadosServicos  = data.servicos.map(s => s.total);

    inicializarGraficos(labelsReceita, dadosReceita, labelsServicos, dadosServicos);

    // 👤 TABELA
    const tbody = document.getElementById('rankingClientesBody');
    tbody.innerHTML = '';

    if (!data.clientes.length) {
      tbody.innerHTML = `<tr><td colspan="3" class="py-8 text-center text-slate-500">Nenhum dado disponível.</td></tr>`;
      return;
    }

    data.clientes.forEach(cliente => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cliente.nome}</td>
        <td>${cliente.qtd}</td>
        <td class="text-right">R$ ${Number(cliente.total).toFixed(2).replace('.', ',')}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Erro ao carregar relatórios:', err);
  }
}