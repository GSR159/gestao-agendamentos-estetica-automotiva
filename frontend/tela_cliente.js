// ============================================================
//  tela_cliente.js
// ============================================================

// ---------- NAVEGAÇÃO ----------
function trocarTela(tela) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById(tela).classList.add('active');
  document.getElementById('btn-' + tela).classList.add('active');
  lucide.createIcons();
}

// ---------- BADGES ----------
function getBadge(status) {
  const map = {
    pendente:  { cls: 'badge-pending',  icon: 'clock',        label: 'Pendente'  },
    aprovado:  { cls: 'badge-approved', icon: 'check',        label: 'Aprovado'  },
    concluido: { cls: 'badge-approved', icon: 'check-circle', label: 'Concluído' },
    recusado:  { cls: 'badge-rejected', icon: 'x',            label: 'Recusado'  },
  };
  const s = map[(status || '').toLowerCase()] ?? { cls: 'badge-pending', icon: 'clock', label: status };
  return `<span class="badge ${s.cls}">
            <i data-lucide="${s.icon}" style="width:11px;height:11px"></i>
            ${s.label}
          </span>`;
}

// ---------- GOOGLE CALENDAR ----------
function abrirGoogleCalendar(agendamento) {
  const inicio = new Date(agendamento.data);
  const fim    = new Date(inicio.getTime() + 60 * 60 * 1000);
  const fmt    = d => d.toISOString().replace(/-|:|\.\d{3}/g, '');
  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     `Serviço: ${agendamento.servico}`,
    dates:    `${fmt(inicio)}/${fmt(fim)}`,
    details:  `Veículo: ${agendamento.veiculo?.modelo ?? ''} · ${agendamento.veiculo?.placa ?? ''}`,
    location: 'Smart System'
  });
  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
}

// ---------- APPLE CALENDAR ----------
function baixarICS(agendamento) {
  const inicio  = new Date(agendamento.data);
  const fim     = new Date(inicio.getTime() + 60 * 60 * 1000);
  const fmt     = d => d.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const uid     = `agendamento-${agendamento.id}@smartsystem`;
  const veiculo = `${agendamento.veiculo?.modelo ?? ''} · ${agendamento.veiculo?.placa ?? ''}`;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Smart System//PT',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(inicio)}`,
    `DTEND:${fmt(fim)}`,
    `SUMMARY:Serviço: ${agendamento.servico}`,
    `DESCRIPTION:Veículo: ${veiculo}`,
    'LOCATION:Smart System Auto',
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `agendamento-${agendamento.id}.ics`; a.click();
  URL.revokeObjectURL(url);
}

// ---------- BOTÕES CALENDÁRIO ----------
function getBotoesCalendario(agendamento) {
  if ((agendamento.status ?? '').toLowerCase() !== 'aprovado') return '';
  const dados = encodeURIComponent(JSON.stringify(agendamento));
  return `
    <div class="flex items-center gap-2 mt-1">
      <button onclick='abrirGoogleCalendar(JSON.parse(decodeURIComponent("${dados}")))'
        class="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors border border-blue-500/20 hover:border-blue-400/40 rounded-lg px-2 py-1">
        <i data-lucide="calendar-plus" style="width:12px;height:12px"></i> Google
      </button>
      <button onclick='baixarICS(JSON.parse(decodeURIComponent("${dados}")))'
        class="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors border border-slate-600/30 hover:border-slate-400/40 rounded-lg px-2 py-1">
        <i data-lucide="apple" style="width:12px;height:12px"></i> Apple
      </button>
    </div>`;
}

// ---------- AGENDAMENTOS ----------
async function carregarAgendamentos() {
  try {
    const res  = await fetch(`${API}/cliente/meus-agendamentos`, { headers: getHeaders() });
    const data = await res.json();

    document.getElementById('stat-total').textContent      = data.length;
    document.getElementById('stat-pendentes').textContent  = data.filter(a => a.status?.toLowerCase() === 'pendente').length;
    document.getElementById('stat-concluidos').textContent = data.filter(a => ['aprovado','concluido'].includes(a.status?.toLowerCase())).length;

    const tabela = document.getElementById('listaAgendamentos');

    if (!data.length) {
      tabela.innerHTML = `
        <tr>
          <td colspan="5" class="py-10 text-center text-slate-500 italic">
            Nenhum agendamento encontrado.
          </td>
        </tr>`;
      return;
    }

    tabela.innerHTML = data.map(a => {
      const data_fmt = a.data ? new Date(a.data).toLocaleDateString('pt-BR') : '—';
      const hora     = a.hora ?? '—';
      const servico  = a.servico ?? '—';
      const veiculo  = a.veiculo ? `${a.veiculo.modelo} · ${a.veiculo.placa}` : '—';
      return `
        <tr>
          <td>${data_fmt}</td>
          <td>${hora}</td>
          <td>${servico}</td>
          <td>${veiculo}</td>
          <td>${getBadge(a.status)}${getBotoesCalendario(a)}</td>
        </tr>`;
    }).join('');

    lucide.createIcons();
  } catch (err) {
    console.error('Erro ao carregar agendamentos:', err);
    toast.erro('Não foi possível carregar seus agendamentos.');
  }
}

// ---------- VEÍCULOS ----------
async function carregarVeiculos() {
  try {
    const res   = await fetch(`${API}/cliente/meus-veiculos`, { headers: getHeaders() });
    const data  = await res.json();
    const lista = document.getElementById('listaVeiculos');

    if (!data.length) {
      lista.innerHTML = `<p class="text-center text-slate-500 italic py-6">Nenhum veículo cadastrado.</p>`;
      return;
    }

    lista.innerHTML = data.map(v => `
      <div class="vehicle-card">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <i data-lucide="car-front" class="w-5 h-5"></i>
          </div>
          <div>
            <p class="font-bold text-sm text-white">${v.modelo ?? '—'}</p>
            <p class="text-xs text-slate-500">${v.placa ?? '—'}${v.ano ? ' · ' + v.ano : ''}</p>
          </div>
        </div>
        <button onclick="confirmarExcluirVeiculo('${v.id}')"
          class="text-slate-500 hover:text-red-400 transition-colors" title="Remover veículo">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `).join('');

    lucide.createIcons();
  } catch (err) {
    console.error('Erro ao carregar veículos:', err);
    toast.erro('Não foi possível carregar seus veículos.');
  }
}

// Guarda o id do veículo a excluir para usar no modal
let _veiculoParaExcluir = null;

function confirmarExcluirVeiculo(id) {
  _veiculoParaExcluir = id;
  const m = document.getElementById('modal-excluir-veiculo');
  if (m) {
    m.classList.remove('hidden'); m.classList.add('flex');
  } else {
    // fallback se o modal não existir na página
    excluirVeiculoConfirmado(id);
  }
}

async function excluirVeiculoConfirmado(id) {
  const idReal = id ?? _veiculoParaExcluir;
  _veiculoParaExcluir = null;
  const m = document.getElementById('modal-excluir-veiculo');
  if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }

  try {
    const res = await fetch(`${API}/cliente/meus-veiculos/${idReal}`, {
      method: 'DELETE', headers: getHeaders()
    });
    if (!res.ok) { const e = await res.json(); toast.erro(e.erro ?? 'Erro ao remover veículo.'); return; }
    toast.sucesso('Veículo removido com sucesso.');
    carregarVeiculos();
  } catch (err) {
    console.error(err);
    toast.erro('Erro de conexão ao remover veículo.');
  }
}

// ---------- CRIAR VEÍCULO (Ponto 8) ----------
async function criarVeiculo() {
  const marca  = document.getElementById('marca').value.trim();
  const modelo = document.getElementById('modelo').value.trim();
  const placa  = document.getElementById('placa').value.trim().toUpperCase();
  const cor    = document.getElementById('cor').value.trim();
  const ano    = document.getElementById('ano').value.trim();

  if (!modelo || !placa) { toast.aviso('Preencha ao menos o modelo e a placa.'); return; }

  const placaLimpa = placa.replace(/[^A-Z0-9]/g, '');
  if (placaLimpa.length < 6 || placaLimpa.length > 7) {
    toast.erro('Placa inválida. Use o formato ABC-1234 ou Mercosul (7 caracteres).');
    return;
  }

  try {
    const res = await fetch(`${API}/cliente/meus-veiculos`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ modelo, placa, ano, marca, cor })
    });

    if (!res.ok) { const e = await res.json(); toast.erro(e.erro ?? 'Erro ao adicionar veículo.'); return; }

    ['marca','modelo','placa','cor','ano'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('placa-contador').textContent = '0/7';
    document.getElementById('placa-contador').classList.remove('limite');

    toast.sucesso('Veículo adicionado com sucesso!');
    carregarVeiculos();
  } catch (err) {
    console.error(err);
    toast.erro('Erro de conexão ao adicionar veículo.');
  }
}

// ---------- AGENDAMENTO (NOVO) ----------
let listaServicosCliente = [];

async function carregarServicosParaAgendamento() {
  try {
    const res = await fetch(`${API}/servicos`, { headers: getHeaders() });
    listaServicosCliente = await res.json();
    const select = document.getElementById('agend-servico');
    if (!select) return;
    select.innerHTML = `<option value="">Selecione o serviço</option>` +
      listaServicosCliente.map(s =>
        `<option value="${s.id}">${s.nome} (${s.duracao_minutos} min) — R$ ${Number(s.preco).toFixed(2).replace('.', ',')}</option>`
      ).join('');
  } catch (err) { console.error(err); }
}

async function carregarVeiculosParaAgendamento() {
  try {
    const res   = await fetch(`${API}/cliente/meus-veiculos`, { headers: getHeaders() });
    const dados = await res.json();
    const select = document.getElementById('agend-veiculo');
    if (!select) return;
    select.innerHTML = `<option value="">Selecione o veículo</option>` +
      dados.map(v => `<option value="${v.id}">${v.modelo} — ${v.placa}</option>`).join('');
  } catch (err) { console.error(err); }
}

function abrirFormAgendamento() {
  const agora  = new Date();
  const minimo = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  document.getElementById('agend-data').min = minimo;
  carregarVeiculosParaAgendamento();
  carregarServicosParaAgendamento();
  document.getElementById('formAgendamentoCliente').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  lucide.createIcons();
}

function fecharFormAgendamento() {
  document.getElementById('formAgendamentoCliente').style.display = 'none';
  document.getElementById('agend-veiculo').value = '';
  document.getElementById('agend-servico').value = '';
  document.getElementById('agend-data').value    = '';
}

async function enviarAgendamento() {
  const veiculo_id = document.getElementById('agend-veiculo').value;
  const servico_id = document.getElementById('agend-servico').value;
  const data       = document.getElementById('agend-data').value;

  if (!veiculo_id || !servico_id || !data) { toast.aviso('Preencha todos os campos.'); return; }
  if (new Date(data) <= new Date())         { toast.aviso('Não é possível agendar em data passada.'); return; }

  try {
    const res     = await fetch(`${API}/cliente/agendar`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ veiculo_id, servico_id, data })
    });
    const resposta = await res.json();
    if (!res.ok) { toast.erro(resposta.erro ?? 'Erro ao criar agendamento.'); return; }
    toast.sucesso('Agendamento criado! Aguarde a aprovação.');
    fecharFormAgendamento();
    carregarAgendamentos();
  } catch (err) {
    console.error(err);
    toast.erro('Erro de conexão com o servidor.');
  }
}

// ---------- CONTA ----------
async function preencherInfoConta() {
  try {
    const usuario = getUsuario();
    const email   = usuario?.email ?? 'cliente@email.com';
    const nome    = usuario?.nome  ?? email.split('@')[0];
    const inicial = nome.charAt(0).toUpperCase();

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setEl('usuario-logado',  nome);
    setEl('user-initial',    inicial);
    setEl('conta-avatar',    inicial);
    setEl('conta-nome',      nome);
    setEl('conta-email',     email);
    setEl('conta-nome-row',  nome);
    setEl('conta-email-row', email);

    if (usuario?.iat) {
      const d = new Date(usuario.iat * 1000).toLocaleDateString('pt-BR', {
        month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo'
      });
      setEl('conta-membro-desde', d.charAt(0).toUpperCase() + d.slice(1));
    }

    const contaRes = await fetch(`${API}/cliente/minha-conta`, { headers: getHeaders() });
    if (contaRes.ok) {
      const conta = await contaRes.json();
      setEl('conta-telefone', conta.telefone || '—');
    }
  } catch (e) {
    console.warn('Não foi possível preencher dados da conta:', e);
  }
}

// ---------- TELEFONE ----------
function editarTelefone() {
  document.getElementById('row-editar-telefone').style.display = 'flex';
  document.getElementById('input-telefone').focus();
}

function cancelarEdicaoTelefone() {
  document.getElementById('row-editar-telefone').style.display = 'none';
  document.getElementById('input-telefone').value = '';
}

async function salvarTelefone() {
  const telefone = document.getElementById('input-telefone').value.trim();
  if (!telefone) { toast.aviso('Digite um telefone válido.'); return; }

  try {
    const res  = await fetch(`${API}/cliente/minha-conta`, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ telefone })
    });
    const data = await res.json();
    if (!res.ok) { toast.erro(data.erro ?? 'Erro ao salvar telefone.'); return; }
    document.getElementById('conta-telefone').textContent = telefone;
    cancelarEdicaoTelefone();
    toast.sucesso('Telefone atualizado com sucesso!');
  } catch (err) {
    console.error(err);
    toast.erro('Erro de conexão ao salvar telefone.');
  }
}

// ---------- EXCLUIR CONTA (LGPD) — chamado pelo modal do HTML ----------
async function excluirConta() {
  try {
    const res  = await fetch(`${API}/cliente/minha-conta`, {
      method: 'DELETE', headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) { toast.erro(data.erro ?? 'Erro ao excluir conta.'); return; }

    toast.sucesso('Conta excluída. Redirecionando...', { duracao: 2500 });
    setTimeout(() => {
      if (typeof logout === 'function') logout();
      else { localStorage.clear(); window.location.href = 'login.html'; }
    }, 2500);
  } catch (err) {
    console.error(err);
    toast.erro('Erro de conexão ao excluir conta.');
  }
}

// ---------- INIT ----------
window.onload = () => {
  verificarLogin();
  preencherInfoConta();
  carregarAgendamentos();
  carregarVeiculos();
};