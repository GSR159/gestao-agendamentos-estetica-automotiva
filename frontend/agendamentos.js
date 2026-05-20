// Responsável por toda a lógica da tela de agendamentos:
// listagem, criação, atualização de status, atribuição de funcionário e exclusão.

//Formulário 

window.abrirFormulario = function () {
  document.getElementById('formAgendamento').style.display = 'block';
  carregarFuncionariosSelect();
};

window.fecharFormulario = function () {
  document.getElementById('formAgendamento').style.display = 'none';
};

// Selects do formulário

// Carrega os clientes ativos (ignora os removidos pela LGPD)
async function carregarClientes() {
  const res   = await fetch(`${API}/clientes`, { headers: getHeaders() });
  const dados = await res.json();

  const ativos = dados.filter(c => c.nome !== 'Usuário Removido' && c.email !== null);

  const select = document.getElementById('cliente_id');
  select.innerHTML =
    `<option value="">Selecione o cliente</option>` +
    ativos.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');

  carregarVeiculosDoCliente();
}

// Filtra os veículos pelo cliente selecionado
window.carregarVeiculosDoCliente = async function () {
  const cliente_id = document.getElementById('cliente_id').value;
  const res        = await fetch(`${API}/veiculos`, { headers: getHeaders() });
  const dados      = await res.json();

  const filtrados = dados.filter(v => v.cliente_id == cliente_id);
  const select    = document.getElementById('veiculo_id');

  select.innerHTML =
    `<option value="">Selecione o veículo</option>` +
    filtrados.map(v => `<option value="${v.id}">${v.modelo} — ${v.placa}</option>`).join('');
};

// Serviços disponíveis no sistema
let listaServicos = [];

async function carregarServicos() {
  const res     = await fetch(`${API}/servicos`, { headers: getHeaders() });
  listaServicos = await res.json();

  const select = document.getElementById('servico_id');
  select.innerHTML =
    `<option value="">Selecione o serviço</option>` +
    listaServicos
      .map(s => `<option value="${s.id}">${s.nome} (${s.duracao_minutos} min)</option>`)
      .join('');
}

// Funcionários ativos para atribuição
async function carregarFuncionariosSelect() {
  try {
    const res   = await fetch(`${API}/funcionarios/ativos`, { headers: getHeaders() });
    const dados = await res.json();
    const select = document.getElementById('funcionario_id');
    if (!select) return;

    select.innerHTML =
      `<option value="">Sem funcionário designado</option>` +
      dados.map(f => `<option value="${f.id}">${f.nome}</option>`).join('');
  } catch (err) {
    console.error('Erro ao carregar funcionários:', err);
  }
}

// Criar agendamento

window.criarAgendamento = async function () {
  const cliente_id     = document.getElementById('cliente_id').value;
  const veiculo_id     = document.getElementById('veiculo_id').value;
  const servico_id     = document.getElementById('servico_id').value;
  const data           = document.getElementById('data').value;
  const funcionario_id = document.getElementById('funcionario_id')?.value || null;

  if (!cliente_id || !veiculo_id || !servico_id || !data) {
    toast.aviso('Preencha todos os campos obrigatórios.');
    return;
  }

  // Não deixa agendar no passado
  if (new Date(data) <= new Date()) {
    toast.aviso('Não é possível agendar em data e horário passados.');
    return;
  }

  try {
    const res = await fetch(`${API}/agendamentos`, {
      method:  'POST',
      headers: getHeaders(),
      body:    JSON.stringify({ cliente_id, veiculo_id, servico_id, data, funcionario_id: funcionario_id || null })
    });

    if (res.ok) {
      toast.sucesso('Agendamento criado com sucesso!');
      fecharFormulario();
      carregarAgendamentos();
    } else {
      const erro = await res.json();
      toast.erro(erro.erro || 'Erro ao criar agendamento.');
    }
  } catch (err) {
    console.error(err);
    toast.erro('Erro de conexão com o servidor.');
  }
};

// Atualizar status 

window.atualizarStatus = async function (id, status) {
  try {
    const res = await fetch(`${API}/agendamentos/${id}`, {
      method:  'PUT',
      headers: getHeaders(),
      body:    JSON.stringify({ status })
    });

    if (res.ok) {
      const mensagens = {
        aprovado:  'Agendamento aprovado!',
        recusado:  'Agendamento recusado.',
        concluido: 'Serviço marcado como concluído!'
      };
      const tipo = (status === 'aprovado' || status === 'concluido') ? 'sucesso' : 'aviso';
      toast[tipo](mensagens[status] ?? `Status: ${status}`);
      carregarAgendamentos();
    } else {
      const erro = await res.json();
      toast.erro(erro.erro || 'Erro ao atualizar status.');
    }
  } catch (err) {
    console.error(err);
    toast.erro('Erro de conexão ao atualizar status.');
  }
};

// Atribuir funcionário inline 

window.atribuirFuncionario = async function (agendamentoId, funcionarioId) {
  try {
    const res = await fetch(`${API}/agendamentos/${agendamentoId}`, {
      method:  'PUT',
      headers: getHeaders(),
      body:    JSON.stringify({ status: 'aprovado', funcionario_id: funcionarioId || null })
    });

    if (res.ok) {
      toast.sucesso('Funcionário atribuído e agendamento aprovado!');
      carregarAgendamentos();
    } else {
      const erro = await res.json();
      toast.erro(erro.erro || 'Erro ao atribuir funcionário.');
    }
  } catch (err) {
    console.error(err);
    toast.erro('Erro de conexão.');
  }
};

// Listar agendamentos

let _listaFuncionarios = [];

window.carregarAgendamentos = async function () {

  // Busca os funcionários antes pra montar o select inline de cada linha
  try {
    const fRes = await fetch(`${API}/funcionarios/ativos`, { headers: getHeaders() });
    _listaFuncionarios = fRes.ok ? await fRes.json() : [];
  } catch {
    _listaFuncionarios = [];
  }

  const res    = await fetch(`${API}/agendamentos`, { headers: getHeaders() });
  const dados  = await res.json();
  const tabela = document.getElementById('tabela');
  tabela.innerHTML = '';

  if (!dados.length) {
    tabela.innerHTML = `
      <tr><td colspan="7" class="py-16 text-center text-slate-500">
        <div class="flex flex-col items-center gap-3">
          <i data-lucide="calendar-off" class="w-10 h-10 opacity-20"></i>
          <p>Nenhum agendamento encontrado.</p>
        </div>
      </td></tr>`;
    lucide.createIcons();
    return;
  }

  // Badges de status
  const badgeMap = {
    pendente:  '<span style="background:rgba(251,191,36,.12);color:#fbbf24;padding:.2rem .65rem;border-radius:9999px;font-size:.72rem;font-weight:700">PENDENTE</span>',
    aprovado:  '<span style="background:rgba(34,197,94,.12);color:#22c55e;padding:.2rem .65rem;border-radius:9999px;font-size:.72rem;font-weight:700">APROVADO</span>',
    recusado:  '<span style="background:rgba(239,68,68,.12);color:#ef4444;padding:.2rem .65rem;border-radius:9999px;font-size:.72rem;font-weight:700">RECUSADO</span>',
    concluido: '<span style="background:rgba(14,165,233,.12);color:#0ea5e9;padding:.2rem .65rem;border-radius:9999px;font-size:.72rem;font-weight:700">CONCLUÍDO</span>',
  };

  const opsFuncionarios =
    `<option value="">— Nenhum —</option>` +
    _listaFuncionarios.map(f => `<option value="${f.id}">${f.nome}</option>`).join('');

  dados.forEach(a => {
    const tr = document.createElement('tr');

    // Formata a data no fuso de São Paulo
    const dataFormatada = new Date(a.data).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZone: 'America/Sao_Paulo'
    });

    // Select de funcionário embutido na linha
    const selectFunc = `
      <select onchange="atribuirFuncionario(${a.id}, this.value)"
        style="background:#1e293b;border:1px solid #334155;color:#f8fafc;padding:.3rem .6rem;
               border-radius:.5rem;font-size:.75rem;outline:none;min-width:130px;">
        ${opsFuncionarios.replace(`value="${a.funcionario_id}"`, `value="${a.funcionario_id}" selected`)}
      </select>`;

    // Ícone de aniversário quando tiver desconto
    const anivBadge = a.desconto_aniversario
      ? `<span title="Desconto de aniversário" style="margin-left:.25rem;font-size:.75rem">🎂</span>`
      : '';

    // Botões de ação conforme o status atual
    const botoesAcao = () => {
      if (a.status === 'pendente') {
        return `
          <button onclick="atualizarStatus(${a.id}, 'aprovado')"
            class="text-xs font-bold px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors border border-green-500/20">
            Aprovar
          </button>
          <button onclick="atualizarStatus(${a.id}, 'recusado')"
            class="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20">
            Recusar
          </button>`;
      }
      if (a.status === 'aprovado') {
        return `
          <button onclick="atualizarStatus(${a.id}, 'concluido')"
            class="text-xs font-bold px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors border border-sky-500/20">
            Concluir
          </button>`;
      }
      return '';
    };

    tr.innerHTML = `
      <td class="text-slate-200">${a.cliente}</td>
      <td class="text-slate-400">${a.veiculo}</td>
      <td class="text-slate-400">${a.servico}${anivBadge}</td>
      <td class="text-slate-400">${dataFormatada}</td>
      <td>${badgeMap[a.status] ?? a.status}</td>
      <td>${selectFunc}</td>
      <td class="text-right">
        <div class="flex items-center justify-end gap-2">
          ${botoesAcao()}
          <button onclick="deletar(${a.id})"
            class="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-400
                   hover:text-red-400 hover:bg-red-500/10 transition-colors border border-slate-600/30">
            Excluir
          </button>
        </div>
      </td>`;

    tabela.appendChild(tr);
  });

  lucide.createIcons();
};

// Excluir agendamento 

// Abre o modal de confirmação
window.deletar = function (id) {
  const modal = document.getElementById('modal-excluir-agendamento');
  modal.dataset.agendamentoId = id;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

window.fecharModalExcluirAgendamento = function () {
  const modal = document.getElementById('modal-excluir-agendamento');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
};

window.executarExclusaoAgendamento = async function () {
  const modal = document.getElementById('modal-excluir-agendamento');
  const id    = modal.dataset.agendamentoId;
  fecharModalExcluirAgendamento();

  try {
    const res = await fetch(`${API}/agendamentos/${id}`, {
      method: 'DELETE', headers: getHeaders()
    });

    if (res.ok) {
      toast.sucesso('Agendamento excluído.');
      carregarAgendamentos();
    } else {
      toast.erro('Erro ao excluir agendamento.');
    }
  } catch (err) {
    console.error(err);
    toast.erro('Erro de conexão ao excluir.');
  }
};

// INIT

carregarClientes();
carregarServicos();
carregarAgendamentos();