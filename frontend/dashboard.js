async function carregarDashboard() {
  try {
    const res = await fetch(`${API}/agendamentos`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao buscar dados');

    const {dados} = await res.json();

    // ── CARDS ────────────────────────────────────────────────
    document.getElementById('total').innerText     = dados.length;
    document.getElementById('pendentes').innerText = dados.filter(a => a.status === 'pendente').length;
    document.getElementById('aprovados').innerText = dados.filter(a => a.status === 'aprovado').length;
    document.getElementById('recusados').innerText = dados.filter(a => a.status === 'recusado').length;

    // ── GRÁFICO ──────────────────────────────────────────────
    const dias = {};
    dados.forEach(a => {
      const data = new Date(a.data).toLocaleDateString('pt-BR');
      if (!dias[data]) dias[data] = { aprovado: 0, pendente: 0, recusado: 0 };
      dias[data][a.status]++;
    });

    const labels        = Object.keys(dias);
    const aprovadosData = labels.map(d => dias[d].aprovado);
    const pendentesData = labels.map(d => dias[d].pendente);
    const recusadosData = labels.map(d => dias[d].recusado);

    const canvas = document.getElementById('grafico');
    if (!canvas) return;

    if (window.graficoInstance) window.graficoInstance.destroy();

    window.graficoInstance = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Aprovados', data: aprovadosData, backgroundColor: '#22c55e', borderRadius: 6 },
          { label: 'Pendentes', data: pendentesData, backgroundColor: '#f59e0b', borderRadius: 6 },
          { label: 'Recusados', data: recusadosData, backgroundColor: '#ef4444', borderRadius: 6 }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { color: '#94a3b8', padding: 16 } }
        },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0, color: '#94a3b8' }, grid: { color: '#1e293b' } },
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
        }
      }
    });

    // ── AGENDA DE HOJE ───────────────────────────────────────
    const hoje = new Date().toLocaleDateString('pt-BR');
    const agendaHoje = dados
      .filter(a => new Date(a.data).toLocaleDateString('pt-BR') === hoje)
      .sort((a, b) => new Date(a.data) - new Date(b.data));

    const container = document.getElementById('agendaHoje');
    container.innerHTML = '';
    const contador = document.getElementById('contador-hoje');
    if (contador) contador.textContent = agendaHoje.length + (agendaHoje.length === 1 ? ' serviço' : ' serviços');

    if (agendaHoje.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:2rem 0;color:#475569;font-size:.875rem;font-style:italic;">
          Nenhum serviço agendado para hoje.
        </div>`;
      return;
    }

    const badgeMap = {
      aprovado: { bg: 'rgba(34,197,94,.12)', color: '#22c55e', label: 'Aprovado' },
      pendente: { bg: 'rgba(251,191,36,.12)', color: '#fbbf24', label: 'Pendente' },
      recusado: { bg: 'rgba(239,68,68,.12)',  color: '#ef4444', label: 'Recusado' },
    };

    agendaHoje.forEach(a => {
      const hora  = new Date(a.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const badge = badgeMap[a.status] || badgeMap.pendente;

      const div = document.createElement('div');
      div.style.cssText = `
        display:flex; align-items:center; gap:12px;
        padding:10px 12px; border-radius:10px;
        background:rgba(30,41,59,.4); border:1px solid #1e293b;
        margin-bottom:8px; transition:border-color .2s;
      `;
      div.onmouseenter = () => div.style.borderColor = '#3b82f6';
      div.onmouseleave = () => div.style.borderColor = '#1e293b';

      div.innerHTML = `
        <!-- HORA -->
        <div style="min-width:44px;text-align:center;">
          <span style="font-size:.8rem;font-weight:800;color:#3b82f6;">${hora}</span>
        </div>

        <!-- DIVISOR -->
        <div style="width:1px;height:32px;background:#334155;flex-shrink:0;"></div>

        <!-- INFO -->
        <div style="flex:1;min-width:0;">
          <p style="margin:0;font-size:.875rem;font-weight:600;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${a.cliente}
          </p>
          <p style="margin:2px 0 0;font-size:.75rem;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${a.servico} · ${a.veiculo}
          </p>
        </div>

        <!-- BADGE STATUS -->
        <span style="
          display:inline-flex; align-items:center;
          padding:3px 10px; border-radius:9999px; flex-shrink:0;
          font-size:.7rem; font-weight:700;
          background:${badge.bg}; color:${badge.color};
        ">${badge.label}</span>
      `;

      container.appendChild(div);
    });

  } catch (erro) {
    console.error('Erro no dashboard:', erro);
  }
}

carregarDashboard();