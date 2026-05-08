// ============================================================
//  tela_cliente.js
// ============================================================

// ---------- HELPERS ----------
function getHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function getUsuario() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return null; }
}

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
  return `<span class="badge ${s.cls}"><i data-lucide="${s.icon}" style="width:11px;height:11px"></i> ${s.label}</span>`;
}

// ---------- GOOGLE CALENDAR ----------
function abrirGoogleCalendar(agendamento) {
  const inicio = new Date(agendamento.data);
  const fim    = new Date(inicio.getTime() + 60 * 60 * 1000);
  const fmt    = d => d.toISOString().replace(/-|:|\.\d{3}/g, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE', text: `Serviço: ${agendamento.servico}`,
    dates: `${fmt(inicio)}/${fmt(fim)}`,
    details: `Veículo: ${agendamento.veiculo?.modelo ?? ''} · ${agendamento.veiculo?.placa ?? ''}`,
    location: 'Smart System'
  });
  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
}

function baixarICS(agendamento) {
  const inicio  = new Date(agendamento.data);
  const fim     = new Date(inicio.getTime() + 60 * 60 * 1000);
  const fmt     = d => d.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const veiculo = `${agendamento.veiculo?.modelo ?? ''} · ${agendamento.veiculo?.placa ?? ''}`;
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Smart System//PT','BEGIN:VEVENT',
    `UID:agendamento-${agendamento.id}@smartsystem`,
    `DTSTAMP:${fmt(new Date())}`,`DTSTART:${fmt(inicio)}`,`DTEND:${fmt(fim)}`,
    `SUMMARY:Serviço: ${agendamento.servico}`,`DESCRIPTION:Veículo: ${veiculo}`,
    'LOCATION:Smart System Auto','END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  a.download = `agendamento-${agendamento.id}.ics`; a.click();
}

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
      tabela.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-slate-500 italic">Nenhum agendamento encontrado.</td></tr>`;
      return;
    }

    tabela.innerHTML = data.map(a => {
      const data_fmt = a.data ? new Date(a.data).toLocaleDateString('pt-BR') : '—';
      const hora     = a.hora ?? '—';
      return `<tr>
        <td>${data_fmt}</td><td>${hora}</td>
        <td>${a.servico ?? '—'}</td>
        <td>${a.veiculo ? `${a.veiculo.modelo} · ${a.veiculo.placa}` : '—'}</td>
        <td>${getBadge(a.status)}${getBotoesCalendario(a)}</td>
      </tr>`;
    }).join('');
    lucide.createIcons();
  } catch (err) {
    console.error(err);
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
          class="text-slate-500 hover:text-red-400 transition-colors">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `).join('');
    lucide.createIcons();
  } catch (err) {
    console.error(err);
    toast.erro('Não foi possível carregar seus veículos.');
  }
}

let _veiculoParaExcluir = null;

function confirmarExcluirVeiculo(id) {
  _veiculoParaExcluir = id;
  const m = document.getElementById('modal-excluir-veiculo');
  if (m) { m.classList.remove('hidden'); m.classList.add('flex'); }
  else excluirVeiculoConfirmado(id);
}

async function excluirVeiculoConfirmado(id) {
  const idReal = id ?? _veiculoParaExcluir;
  _veiculoParaExcluir = null;
  const m = document.getElementById('modal-excluir-veiculo');
  if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }

  try {
    const res = await fetch(`${API}/cliente/meus-veiculos/${idReal}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) { const e = await res.json(); toast.erro(e.erro ?? 'Erro ao remover.'); return; }
    toast.sucesso('Veículo removido com sucesso.');
    carregarVeiculos();
  } catch { toast.erro('Erro de conexão.'); }
}

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
    if (!res.ok) { const e = await res.json(); toast.erro(e.erro ?? 'Erro ao adicionar.'); return; }
    ['marca','modelo','placa','cor','ano'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('placa-contador').textContent = '0/7';
    document.getElementById('placa-contador').classList.remove('limite');
    toast.sucesso('Veículo adicionado com sucesso!');
    carregarVeiculos();
  } catch { toast.erro('Erro de conexão.'); }
}

// ---------- AGENDAMENTO ----------
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
  ['agend-veiculo','agend-servico','agend-data'].forEach(id => document.getElementById(id).value = '');
}

async function enviarAgendamento() {
  const veiculo_id = document.getElementById('agend-veiculo').value;
  const servico_id = document.getElementById('agend-servico').value;
  const data       = document.getElementById('agend-data').value;

  if (!veiculo_id || !servico_id || !data) { toast.aviso('Preencha todos os campos.'); return; }
  if (new Date(data) <= new Date()) { toast.aviso('Não é possível agendar em data passada.'); return; }

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
  } catch { toast.erro('Erro de conexão com o servidor.'); }
}

// ---------- CONTA — DADOS ──────────────────────────────────────
let _dadosConta = null;

async function carregarDadosConta() {
  try {
    const usuario = getUsuario();
    const nome    = usuario?.nome ?? usuario?.email?.split('@')[0] ?? 'Cliente';
    const inicial = nome.charAt(0).toUpperCase();

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('usuario-logado', nome);
    setEl('user-initial',   inicial);
    setEl('conta-avatar',   inicial);
    setEl('conta-nome',     nome);
    setEl('conta-email',    usuario?.email ?? '');
    setEl('conta-nome-row', nome);
    setEl('conta-email-row', usuario?.email ?? '');

    const res = await fetch(`${API}/cliente/minha-conta`, { headers: getHeaders() });
    if (!res.ok) return;

    const conta = await res.json();
    _dadosConta = conta;

    setEl('conta-telefone', conta.telefone || '—');
    setEl('conta-nascimento', conta.data_nascimento
      ? new Date(conta.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
      : '—');

    // Endereço
    const partes = [conta.logradouro, conta.numero, conta.complemento, conta.bairro, conta.cidade, conta.estado]
      .filter(Boolean);
    setEl('conta-endereco', partes.length ? partes.join(', ') : '—');
    setEl('conta-cep', conta.cep || '—');

    if (usuario?.iat) {
      const d = new Date(usuario.iat * 1000).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
      setEl('conta-membro-desde', d.charAt(0).toUpperCase() + d.slice(1));
    }

    // Badge perfil
    const badge = document.getElementById('badge-perfil');
    if (badge) {
      if (conta.perfil_completo) {
        badge.innerHTML = `<i data-lucide="shield-check" style="width:11px;height:11px"></i> Conta Verificada`;
        badge.className = 'badge badge-approved mt-1';
      } else {
        badge.innerHTML = `<i data-lucide="alert-circle" style="width:11px;height:11px"></i> Perfil Incompleto`;
        badge.className = 'badge badge-pending mt-1';
      }
      lucide.createIcons();
    }

  } catch (e) {
    console.warn('Erro ao carregar conta:', e);
  }
}

// alias para compatibilidade com completar-perfil.js
function preencherInfoConta() { carregarDadosConta(); }

// ---------- CONTA — EDITAR ─────────────────────────────────────
function abrirEdicaoPerfil() {
  if (!_dadosConta) return;

  const c = _dadosConta;

  // Preenche os campos com dados atuais
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('edit-telefone',    c.telefone);
  set('edit-nascimento',  c.data_nascimento ? c.data_nascimento.split('T')[0] : '');
  set('edit-cep',         c.cep);
  set('edit-logradouro',  c.logradouro);
  set('edit-numero',      c.numero);
  set('edit-complemento', c.complemento);
  set('edit-bairro',      c.bairro);
  set('edit-cidade',      c.cidade);
  set('edit-estado',      c.estado);

  // Atualiza contador do CEP se tiver
  if (c.cep) {
    const status = document.getElementById('edit-cep-status');
    if (status) { status.textContent = ''; }
  }

  document.getElementById('form-editar-perfil').style.display = 'block';
  document.getElementById('info-perfil-static').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicaoPerfil() {
  document.getElementById('form-editar-perfil').style.display = 'none';
  document.getElementById('info-perfil-static').style.display = 'block';
}

async function buscarCEPEdicao() {
  const cep    = document.getElementById('edit-cep').value.replace(/\D/g, '');
  const status = document.getElementById('edit-cep-status');
  const btn    = document.getElementById('btn-buscar-cep');

  if (cep.length !== 8) {
    status.textContent = 'CEP inválido.';
    status.style.color = '#ef4444';
    return;
  }

  btn.disabled = true; btn.textContent = '...';
  status.textContent = 'Buscando...'; status.style.color = '#94a3b8';

  try {
    const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();

    if (data.erro) {
      status.textContent = 'CEP não encontrado.';
      status.style.color = '#ef4444';
      return;
    }

    document.getElementById('edit-logradouro').value  = data.logradouro  || '';
    document.getElementById('edit-bairro').value      = data.bairro      || '';
    document.getElementById('edit-cidade').value      = data.localidade  || '';
    document.getElementById('edit-estado').value      = data.uf          || '';
    document.getElementById('edit-complemento').value = data.complemento || '';

    status.textContent = `✓ ${data.localidade} — ${data.uf}`;
    status.style.color = '#22c55e';
    document.getElementById('edit-numero').focus();

  } catch {
    status.textContent = 'Erro ao buscar CEP.';
    status.style.color = '#ef4444';
  } finally {
    btn.disabled = false; btn.textContent = 'Buscar';
  }
}

async function salvarPerfil() {
  const btn = document.getElementById('btn-salvar-perfil');

  const telefone        = document.getElementById('edit-telefone').value.trim();
  const data_nascimento = document.getElementById('edit-nascimento').value;
  const cep             = document.getElementById('edit-cep').value.trim();
  const logradouro      = document.getElementById('edit-logradouro').value.trim();
  const numero          = document.getElementById('edit-numero').value.trim();
  const complemento     = document.getElementById('edit-complemento').value.trim();
  const bairro          = document.getElementById('edit-bairro').value.trim();
  const cidade          = document.getElementById('edit-cidade').value.trim();
  const estado          = document.getElementById('edit-estado').value.trim();

  if (!telefone) { toast.aviso('Telefone é obrigatório.'); return; }

  btn.disabled = true; btn.textContent = 'Salvando...';

  try {
    const res  = await fetch(`${API}/cliente/minha-conta`, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ telefone, data_nascimento, cep, logradouro, numero, complemento, bairro, cidade, estado })
    });
    const data = await res.json();

    if (!res.ok) { toast.erro(data.erro ?? 'Erro ao salvar.'); return; }

    toast.sucesso('Perfil atualizado com sucesso!');
    cancelarEdicaoPerfil();
    carregarDadosConta();

    // Remove banner de incompleto se existir
    document.getElementById('cp-banner-incompleto')?.remove();

  } catch { toast.erro('Erro de conexão.'); }
  finally { btn.disabled = false; btn.textContent = 'Salvar alterações'; }
}

// ---------- EXCLUIR CONTA ----------
async function excluirConta() {
  try {
    const res  = await fetch(`${API}/cliente/minha-conta`, { method: 'DELETE', headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) { toast.erro(data.erro ?? 'Erro ao excluir conta.'); return; }
    toast.sucesso('Conta excluída. Redirecionando...');
    setTimeout(() => {
      if (typeof logout === 'function') logout();
      else { localStorage.clear(); window.location.href = 'login.html'; }
    }, 2500);
  } catch { toast.erro('Erro de conexão.'); }
}

// ---------- INIT ----------
window.onload = () => {
  verificarLogin();
  carregarDadosConta();
  carregarAgendamentos();
  carregarVeiculos();
};