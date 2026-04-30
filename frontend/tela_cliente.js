// ============================================================
//  tela_cliente.js — compatível com o novo layout Smart System
// ============================================================

// ---------- NAVEGAÇÃO ----------
function trocarTela(tela) {
  // Esconde todas as telas
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));

  // Remove active de todos os botões do sidebar
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));

  // Ativa a tela e o botão correspondente
  document.getElementById(tela).classList.add("active");
  document.getElementById("btn-" + tela).classList.add("active");

  // Reinicia os ícones Lucide para os recém-renderizados
  lucide.createIcons();
}

// ---------- BADGES DE STATUS ----------
function getBadge(status) {
  const map = {
    "pendente":  { cls: "badge-pending",  icon: "clock",        label: "Pendente"  },
    "aprovado":  { cls: "badge-approved", icon: "check",        label: "Aprovado"  },
    "concluido": { cls: "badge-approved", icon: "check-circle", label: "Concluído" },
    "recusado":  { cls: "badge-rejected", icon: "x",            label: "Recusado"  },
  };

  const s = map[(status || "").toLowerCase()] ?? { cls: "badge-pending", icon: "clock", label: status };

  return `<span class="badge ${s.cls}">
            <i data-lucide="${s.icon}" style="width:11px;height:11px"></i>
            ${s.label}
          </span>`;
}

// ---------- AGENDAMENTOS ----------
async function carregarAgendamentos() {
  try {
    const res  = await fetch(`${API}/cliente/meus-agendamentos`, { headers: getHeaders() });
    const data = await res.json();

    // Atualiza os cards de estatísticas
    const total     = data.length;
    const pendentes = data.filter(a => a.status?.toLowerCase() === "pendente").length;
    const concluidos= data.filter(a => ["aprovado","concluido"].includes(a.status?.toLowerCase())).length;

    document.getElementById("stat-total").textContent     = total;
    document.getElementById("stat-pendentes").textContent = pendentes;
    document.getElementById("stat-concluidos").textContent= concluidos;

    // Preenche a tabela
    const tabela = document.getElementById("listaAgendamentos");

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
      const data_fmt = a.data ? new Date(a.data).toLocaleDateString("pt-BR") : "—";
      const hora     = a.hora  ?? "—";
      const servico  = a.servico  ?? "—";
      const veiculo  = a.veiculo  ? `${a.veiculo.modelo} · ${a.veiculo.placa}` : "—";

      return `
        <tr>
          <td>${data_fmt}</td>
          <td>${hora}</td>
          <td>${servico}</td>
          <td>${veiculo}</td>
          <td>${getBadge(a.status)}</td>
        </tr>`;
    }).join("");

    lucide.createIcons();

  } catch (err) {
    console.error("Erro ao carregar agendamentos:", err);
  }
}

// ---------- VEÍCULOS ----------
async function carregarVeiculos() {
  try {
    const res  = await fetch(`${API}/cliente/meus-veiculos`, { headers: getHeaders() });
    const data = await res.json();

    const lista = document.getElementById("listaVeiculos");

    if (!data.length) {
      lista.innerHTML = `
        <p class="text-center text-slate-500 italic py-6">
          Nenhum veículo cadastrado.
        </p>`;
      return;
    }

    lista.innerHTML = data.map(v => `
      <div class="vehicle-card">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <i data-lucide="car-front" class="w-5 h-5"></i>
          </div>
          <div>
            <p class="font-bold text-sm text-white">${v.modelo ?? "—"}</p>
            <p class="text-xs text-slate-500">${v.placa ?? "—"}${v.ano ? " · " + v.ano : ""}</p>
          </div>
        </div>
        <button onclick="excluirVeiculo('${v.id}')"
                class="text-slate-500 hover:text-red-400 transition-colors"
                title="Remover veículo">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `).join("");

    lucide.createIcons();

  } catch (err) {
    console.error("Erro ao carregar veículos:", err);
  }
}

async function criarVeiculo() {
  const modelo = document.getElementById("modelo").value.trim();
  const placa  = document.getElementById("placa").value.trim();
  const ano    = document.getElementById("ano").value.trim();

  if (!modelo || !placa) {
    alert("Preencha ao menos o modelo e a placa.");
    return;
  }

  try {
    const res = await fetch(`${API}/cliente/meus-veiculos`, {
      method:  "POST",
      headers: getHeaders(),
      body:    JSON.stringify({ modelo, placa, ano })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.erro ?? "Erro ao adicionar veículo.");
      return;
    }

    // Limpa os campos
    document.getElementById("modelo").value = "";
    document.getElementById("placa").value  = "";
    document.getElementById("ano").value    = "";

    carregarVeiculos();

  } catch (err) {
    console.error("Erro ao criar veículo:", err);
  }
}

async function excluirVeiculo(id) {
  if (!confirm("Remover este veículo?")) return;

  try {
    await fetch(`${API}/cliente/meus-veiculos/${id}`, {
      method:  "DELETE",
      headers: getHeaders()
    });

    carregarVeiculos();

  } catch (err) {
    console.error("Erro ao excluir veículo:", err);
  }
}

// ---------- AGENDAMENTO (NOVO) ----------
let listaServicosCliente = [];

async function carregarServicosParaAgendamento() {
  try {
    const res = await fetch(`${API}/servicos`, { headers: getHeaders() });
    listaServicosCliente = await res.json();

    const select = document.getElementById("agend-servico");
    if (!select) return;

    select.innerHTML = `<option value="">Selecione o serviço</option>` +
      listaServicosCliente.map(s =>
        `<option value="${s.id}">${s.nome} (${s.duracao_minutos} min) — R$ ${Number(s.preco).toFixed(2).replace(".", ",")}</option>`
      ).join("");
  } catch (err) {
    console.error("Erro ao carregar serviços:", err);
  }
}

async function carregarVeiculosParaAgendamento() {
  try {
    const res = await fetch(`${API}/cliente/meus-veiculos`, { headers: getHeaders() });
    const dados = await res.json();

    const select = document.getElementById("agend-veiculo");
    if (!select) return;

    select.innerHTML = `<option value="">Selecione o veículo</option>` +
      dados.map(v =>
        `<option value="${v.id}">${v.modelo} — ${v.placa}</option>`
      ).join("");
  } catch (err) {
    console.error("Erro ao carregar veículos para agendamento:", err);
  }
}

function abrirFormAgendamento() {
  carregarVeiculosParaAgendamento();
  carregarServicosParaAgendamento();
  document.getElementById("formAgendamentoCliente").style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
  lucide.createIcons();
}

function fecharFormAgendamento() {
  document.getElementById("formAgendamentoCliente").style.display = "none";
  document.getElementById("agend-veiculo").value = "";
  document.getElementById("agend-servico").value = "";
  document.getElementById("agend-data").value = "";
}

async function enviarAgendamento() {
  const veiculo_id = document.getElementById("agend-veiculo").value;
  const servico_id = document.getElementById("agend-servico").value;
  const data = document.getElementById("agend-data").value;

  if (!veiculo_id || !servico_id || !data) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    const res = await fetch(`${API}/cliente/agendar`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ veiculo_id, servico_id, data })
    });

    const resposta = await res.json();

    if (!res.ok) {
      alert(resposta.erro ?? "Erro ao criar agendamento.");
      return;
    }

    alert("Agendamento criado com sucesso! Aguarde aprovação.");
    fecharFormAgendamento();
    carregarAgendamentos();
  } catch (err) {
    console.error("Erro ao criar agendamento:", err);
    alert("Erro de conexão com o servidor.");
  }
}

// ---------- CONTA ----------
function preencherInfoConta() {
  try {
    const usuario = getUsuario();
    const email   = usuario?.email ?? "cliente@email.com";
    const nome    = usuario?.nome  ?? email.split("@")[0];
    const inicial = nome.charAt(0).toUpperCase();

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setEl("usuario-logado",  nome);
    setEl("user-initial",    inicial);
    setEl("conta-avatar",    inicial);
    setEl("conta-nome",      nome);
    setEl("conta-email",     email);
    setEl("conta-nome-row",  nome);
    setEl("conta-email-row", email);
  } catch (e) {
    console.warn("Não foi possível preencher dados da conta:", e);
  }
}

async function excluirConta() {
  if (!confirm("Isso vai excluir sua conta PERMANENTEMENTE. Deseja continuar?")) return;

  try {
    const res  = await fetch(`${API}/cliente/minha-conta`, {
      method:  "DELETE",
      headers: getHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.erro ?? "Erro ao excluir conta.");
      return;
    }

    alert("Conta excluída com sucesso.");
    logout();

  } catch (err) {
    console.error("Erro ao excluir conta:", err);
  }
}

// ---------- LOGOUT ----------
function efetuarLogout() {
  if (confirm("Deseja mesmo sair do sistema?")) {
    if (typeof logout === "function") logout();
    else { localStorage.clear(); window.location.href = "login.html"; }
  }
}

// ---------- INIT ----------
window.onload = () => {
  verificarLogin();
  preencherInfoConta();
  carregarAgendamentos();
  carregarVeiculos();
};