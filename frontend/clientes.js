// =====================================================
//  clientes.js
// =====================================================

window.carregarClientes = async function () {
  try {
    const res = await fetch(`${API}/clientes`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro na API');

    const dados = await res.json();

    // Filtra clientes anonimizados pela LGPD — não exibe no admin
    const ativos = dados.filter(c => c.nome !== 'Usuário Removido' && c.email !== null);

    const tabela = document.getElementById('tabela');

    if (ativos.length === 0) {
      tabela.innerHTML = `
        <tr>
          <td colspan="4" class="py-16 text-center text-slate-500">
            <div class="flex flex-col items-center gap-3">
              <i data-lucide="users" class="w-10 h-10 opacity-10"></i>
              <p>Nenhum cliente cadastrado.</p>
            </div>
          </td>
        </tr>`;
      lucide.createIcons();
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
              class="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20">
              Editar
            </button>
            <button onclick="confirmarExclusaoCliente(${c.id}, '${(c.nome ?? '').replace(/'/g, "\\'")}')"
              class="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20">
              Excluir
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    lucide.createIcons();
  } catch (erro) {
    console.error(erro);
    document.getElementById('tabela').innerHTML =
      `<tr><td colspan="4" class="py-8 text-center text-red-400">Erro ao carregar clientes.</td></tr>`;
  }
};

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

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (erro) {
    console.error('Erro ao carregar cliente', erro);
    toast.erro('Não foi possível carregar os dados do cliente.');
  }
};

window.salvarCliente = async function () {
  const id       = document.getElementById('clienteId').value;
  const nome     = document.getElementById('nome').value.trim();
  const email    = document.getElementById('email').value.trim();
  const telefone = document.getElementById('telefone').value.trim();

  if (!nome || !email || !telefone) {
    toast.aviso('Preencha todos os campos antes de guardar.');
    return;
  }

  try {
    const res = await fetch(
      id ? `${API}/clientes/${id}` : `${API}/clientes`,
      {
        method:  id ? 'PUT' : 'POST',
        headers: getHeaders(),
        body:    JSON.stringify({ nome, email, telefone })
      }
    );

    if (res.ok) {
      toast.sucesso(id ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
      fecharFormCliente();
      carregarClientes();
    } else {
      const err = await res.json();
      toast.erro(err.erro ?? 'Erro ao salvar cliente.');
    }
  } catch (erro) {
    console.error(erro);
    toast.erro('Erro de conexão ao salvar cliente.');
  }
};

/* ── Modal de confirmação de exclusão ── */
window.confirmarExclusaoCliente = function (id, nome) {
  const modal = document.getElementById('modal-excluir-cliente');
  document.getElementById('modal-excluir-nome').textContent = nome;
  modal.dataset.clienteId = id;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

window.fecharModalExcluirCliente = function () {
  const modal = document.getElementById('modal-excluir-cliente');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
};

window.executarExclusaoCliente = async function () {
  const modal = document.getElementById('modal-excluir-cliente');
  const id    = modal.dataset.clienteId;
  fecharModalExcluirCliente();

  try {
    const res = await fetch(`${API}/clientes/${id}`, {
      method: 'DELETE', headers: getHeaders()
    });

    if (res.ok) {
      toast.sucesso('Cliente removido com sucesso.');
      carregarClientes();
    } else {
      toast.erro('Erro ao remover cliente.');
    }
  } catch (erro) {
    console.error(erro);
    toast.erro('Erro de conexão ao remover cliente.');
  }
};

carregarClientes();