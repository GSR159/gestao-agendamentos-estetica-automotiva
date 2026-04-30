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

// ---------- CONTA ----------
function preencherInfoConta() {
  try {
    // Ajuste conforme a estrutura do seu localStorage / auth.js
    const usuario = JSON.parse(localStorage.getItem("usuario") ?? "{}");
    const nome    = usuario.nome  ?? "Nome do Cliente";
    const email   = usuario.email ?? "cliente@email.com";
    const inicial = nome.charAt(0).toUpperCase();

    // Sidebar
    const nomeSpan = document.getElementById("usuario-logado");
    const avatarEl = document.getElementById("user-initial");
    if (nomeSpan) nomeSpan.textContent = nome;
    if (avatarEl) avatarEl.textContent = inicial;

    // Tela Conta
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
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

// ---------- INIT ----------
window.onload = () => {
  verificarLogin();
  preencherInfoConta();
  carregarAgendamentos();
  carregarVeiculos();
};