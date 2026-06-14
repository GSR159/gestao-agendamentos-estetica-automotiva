// clientes.js — com paginação e busca

// ESTADO DE PAGINAÇÃO 
const LIMIT = 15;
let _offsetCli = 0;
let _totalCli  = 0;
let _buscaCli  = '';
let _buscaTimer = null;

// LISTAR 
window.carregarClientes = async function (offset = 0) {
  _offsetCli = offset;
  try {
    const params = new URLSearchParams({ limit: LIMIT, offset });
    if (_buscaCli) params.set('busca', _buscaCli);

    const res  = await fetch(`${API}/clientes?${params}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Falha na requisição');

    const body   = await res.json();
    const dados  = body.dados ?? body;
    _totalCli    = body.total ?? dados.length;

    // Remove anonimizados LGPD
    const ativos = dados.filter(c => c.nome !== 'Usuário Removido' && c.email !== null);
    const tabela = document.getElementById('tabela');

    if (ativos.length === 0) {
      tabela.innerHTML = `<tr><td colspan="4" class="py-16 text-center text-slate-500">
        <div class="flex flex-col items-center gap-3">
          <i data-lucide="users" class="w-10 h-10 opacity-10"></i>
          <p>${_buscaCli ? 'Nenhum cliente encontrado para "' + _buscaCli + '".' : 'Nenhum cliente cadastrado.'}</p>
        </div></td></tr>`;
      lucide.createIcons();
      renderizarPaginacaoClientes();
      return;
    }

    tabela.innerHTML = ativos.map(c => `
      <tr>
        <td class="text-slate-200 font-medium">${c.nome ?? '—'}</td>
        <td class="text-slate-400">${c.email ?? '—'}</td>
        <td class="text-slate-400">${c.telefone ?? '—'}</td>
        <td class="text-right">
          <div class="flex items-center justify-end gap-2">
            <button onclick="editarCliente(${c.id})"
              class="text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors border border-orange-500/20">
              Editar
            </button>
            <button onclick="confirmarExclusaoCliente(${c.id}, '${(c.nome ?? '').replace(/'/g, "\\'")}')"
              class="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20">
              Excluir
            </button>
          </div>
        </td>
      </tr>`).join('');

    lucide.createIcons();
    renderizarPaginacaoClientes();

  } catch (erro) {
    console.error(erro);
    document.getElementById('tabela').innerHTML =
      `<tr><td colspan="4" class="py-8 text-center text-red-400">Erro ao carregar clientes.</td></tr>`;
  }
};

//PAGINAÇÃO 
function renderizarPaginacaoClientes() {
  const container = document.getElementById('paginacao-clientes');
  if (!container) return;

  const totalPags = Math.ceil(_totalCli / LIMIT);
  const pagAtual  = Math.floor(_offsetCli / LIMIT) + 1;
  const inicio    = _totalCli === 0 ? 0 : _offsetCli + 1;
  const fim       = Math.min(_offsetCli + LIMIT, _totalCli);

  container.innerHTML = `
    <div class="flex items-center justify-between flex-wrap gap-3 px-4 py-3 border-t border-slate-800">
      <span class="text-xs text-slate-500">
        Mostrando <strong class="text-slate-300">${inicio}–${fim}</strong> de <strong class="text-slate-300">${_totalCli}</strong> clientes
      </span>
      <div class="flex items-center gap-1">
        <button onclick="carregarClientes(${_offsetCli - LIMIT})"
          ${pagAtual === 1 ? 'disabled' : ''}
          class="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          ← Anterior
        </button>
        <span class="px-3 py-1.5 text-xs font-bold text-slate-300">${pagAtual} / ${totalPags || 1}</span>
        <button onclick="carregarClientes(${_offsetCli + LIMIT})"
          ${pagAtual >= totalPags || totalPags === 0 ? 'disabled' : ''}
          class="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          Próximo →
        </button>
      </div>
    </div>`;
}

// BUSCA 
window.onBuscaCliente = function (valor) {
  clearTimeout(_buscaTimer);
  _buscaTimer = setTimeout(() => {
    _buscaCli   = valor.trim();
    _offsetCli  = 0;
    carregarClientes(0);
  }, 350);
};

// FORMULÁRIO
window.abrirFormCliente = function () {
  document.getElementById('formCliente').style.display = 'block';
  document.getElementById('clienteId').value = '';
  document.getElementById('nome').value      = '';
  document.getElementById('email').value     = '';
  document.getElementById('telefone').value  = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
window.fecharFormCliente = function () {
  document.getElementById('formCliente').style.display = 'none';
};

window.editarCliente = async function (id) {
  try {
    const res     = await fetch(`${API}/clientes/${id}`, { headers: getHeaders() });
    const cliente = await res.json();
    document.getElementById('formCliente').style.display = 'block';
    document.getElementById('clienteId').value = cliente.id;
    document.getElementById('nome').value      = cliente.nome;
    document.getElementById('email').value     = cliente.email;
    document.getElementById('telefone').value  = cliente.telefone;
    maskTelefone(document.getElementById('telefone'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (erro) {
    toast.erro('Não foi possível carregar os dados do cliente.');
  }
};

window.salvarCliente = async function () {
  const id       = document.getElementById('clienteId').value;
  const nome     = document.getElementById('nome').value.trim();
  const email    = document.getElementById('email').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  if (!nome || !email || !telefone) { toast.aviso('Preencha todos os campos.'); return; }
  try {
    const res = await fetch(id ? `${API}/clientes/${id}` : `${API}/clientes`, {
      method: id ? 'PUT' : 'POST', headers: getHeaders(),
      body: JSON.stringify({ nome, email, telefone })
    });
    if (res.ok) {
      toast.sucesso(id ? 'Cliente atualizado!' : 'Cliente cadastrado!');
      fecharFormCliente();
      carregarClientes(_offsetCli);
    } else {
      const err = await res.json();
      toast.erro(err.erro ?? 'Erro ao salvar cliente.');
    }
  } catch { toast.erro('Erro de conexão.'); }
};

// EXCLUIR 
window.confirmarExclusaoCliente = function (id, nome) {
  const modal = document.getElementById('modal-excluir-cliente');
  document.getElementById('modal-excluir-nome').textContent = nome;
  modal.dataset.clienteId = id;
  modal.classList.remove('hidden'); modal.classList.add('flex');
};
window.fecharModalExcluirCliente = function () {
  const modal = document.getElementById('modal-excluir-cliente');
  modal.classList.add('hidden'); modal.classList.remove('flex');
};
window.executarExclusaoCliente = async function () {
  const modal = document.getElementById('modal-excluir-cliente');
  const id    = modal.dataset.clienteId;
  fecharModalExcluirCliente();
  try {
    const res = await fetch(`${API}/clientes/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (res.ok) { toast.sucesso('Cliente removido.'); carregarClientes(_offsetCli); }
    else toast.erro('Erro ao remover cliente.');
  } catch { toast.erro('Erro de conexão.'); }
};

// INIT
carregarClientes();