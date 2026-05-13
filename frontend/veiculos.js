let veiculoEditando = null;

// ================= MODAL DE CONFIRMAÇÃO =================
(function () {
  const overlay = document.createElement("div");
  overlay.id = "modal-confirmar-delete";
  overlay.className = "modal-overlay hidden";
  overlay.style.cssText = "display:none;position:fixed;inset:0;z-index:9000;background:rgba(2,6,23,.85);backdrop-filter:blur(6px);align-items:center;justify-content:center;";
  overlay.innerHTML = `
    <div class="modal-box" style="background:#0f172a;border:1px solid #334155;border-radius:1.25rem;padding:2rem;width:100%;max-width:420px;box-shadow:0 25px 60px rgba(0,0,0,.6);">
      <div class="modal-icone" style="width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;background:rgba(239,68,68,.12);color:#f87171;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
      </div>
      <p class="modal-titulo" style="font-size:1.125rem;font-weight:800;color:#f8fafc;text-align:center;margin-bottom:.5rem;">Deletar veículo?</p>
      <p class="modal-desc" style="font-size:.875rem;color:#94a3b8;text-align:center;line-height:1.6;margin-bottom:1.75rem;">Esta ação é irreversível. O veículo será removido permanentemente do sistema.</p>
      <div class="modal-acoes" style="display:flex;gap:.75rem;">
        <button id="btn-cancelar-delete" style="flex:1;padding:.7rem 1rem;border-radius:.75rem;border:1px solid #334155;background:transparent;color:#94a3b8;font-weight:700;font-size:.875rem;cursor:pointer;font-family:inherit;transition:all .2s;"
          onmouseover="this.style.background='rgba(255,255,255,.05)';this.style.color='#f8fafc'"
          onmouseout="this.style.background='transparent';this.style.color='#94a3b8'">
          Cancelar
        </button>
        <button id="btn-confirmar-delete" style="flex:1;padding:.7rem 1rem;border-radius:.75rem;background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.25);font-weight:700;font-size:.875rem;cursor:pointer;font-family:inherit;transition:all .2s;"
          onmouseover="this.style.background='rgba(239,68,68,.22)'"
          onmouseout="this.style.background='rgba(239,68,68,.12)'">
          Deletar
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("btn-cancelar-delete").addEventListener("click", fecharModalDelete);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) fecharModalDelete(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharModalDelete(); });
})();

function abrirModalDelete(id) {
  const overlay = document.getElementById("modal-confirmar-delete");
  overlay.style.display = "flex";

  const btnConfirmar = document.getElementById("btn-confirmar-delete");
  // Remove listener anterior para não acumular
  const novo = btnConfirmar.cloneNode(true);
  btnConfirmar.parentNode.replaceChild(novo, btnConfirmar);
  novo.addEventListener("click", () => {
    fecharModalDelete();
    executarDeleteVeiculo(id);
  });
  novo.addEventListener("mouseover", () => novo.style.background = "rgba(239,68,68,.22)");
  novo.addEventListener("mouseout",  () => novo.style.background = "rgba(239,68,68,.12)");
}

function fecharModalDelete() {
  const overlay = document.getElementById("modal-confirmar-delete");
  overlay.style.display = "none";
}

// ================= CLIENTES =================
async function carregarClientes() {
  try {
    const res = await fetch(`${API}/clientes`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Erro ao buscar clientes");

    const dados = await res.json();
    const select = document.getElementById("cliente_id");
    if (!select) return;

    select.innerHTML = `
      <option value="">Selecione um cliente</option>
      ${dados.map(c => `<option value="${c.id}">${c.nome}</option>`).join("")}
    `;
  } catch (erro) {
    console.error(erro);
    toast.erro("Erro ao carregar a lista de clientes.");
  }
}

// ================= LISTAR =================
window.carregarVeiculos = async function () {
  try {
    const res = await fetch(`${API}/veiculos`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Erro na API");

    const dados = await res.json();
    const tabela = document.getElementById("tabela");
    tabela.innerHTML = "";

    if (dados.length === 0) {
      tabela.innerHTML = `<tr><td colspan="4" class="py-20 text-center text-slate-500">
        <div class="flex flex-col items-center gap-3">
          <i data-lucide="car" class="w-10 h-10 opacity-10"></i>
          <p>Nenhum veículo cadastrado.</p>
        </div>
      </td></tr>`;
      if (typeof lucide !== "undefined") lucide.createIcons();
      return;
    }

    dados.forEach(v => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${v.cliente || "—"}</td>
        <td>${v.marca || ""} ${v.modelo || ""}</td>
        <td>${v.placa || "—"}</td>
        <td class="text-right">
          <button onclick="editarVeiculo(${v.id})" title="Editar" style="color:#3b82f6;background:none;border:none;cursor:pointer;padding:4px;margin-right:4px;transition:opacity .2s;" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">✏️</button>
          <button onclick="deletarVeiculo(${v.id})" title="Deletar" style="color:#ef4444;background:none;border:none;cursor:pointer;padding:4px;transition:opacity .2s;" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">🗑</button>
        </td>
      `;
      tabela.appendChild(tr);
    });

  } catch (erro) {
    console.error(erro);
    document.getElementById("tabela").innerHTML =
      `<tr><td colspan="4" class="py-10 text-center text-red-400">Erro ao carregar veículos.</td></tr>`;
  }
};

// ================= FORM =================
window.abrirFormVeiculo = function () {
  document.getElementById("formVeiculo").style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.fecharFormVeiculo = function () {
  document.getElementById("formVeiculo").style.display = "none";
  veiculoEditando = null;
  ["cliente_id", "marca", "modelo", "placa", "cor", "ano"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
};

// ================= EDITAR =================
window.editarVeiculo = async function (id) {
  try {
    abrirFormVeiculo();
    const res = await fetch(`${API}/veiculos/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Erro ao buscar veículo");

    const v = await res.json();
    document.getElementById("cliente_id").value = v.cliente_id;
    document.getElementById("marca").value      = v.marca;
    document.getElementById("modelo").value     = v.modelo;
    document.getElementById("placa").value      = v.placa;
    document.getElementById("cor").value        = v.cor;
    document.getElementById("ano").value        = v.ano;

    veiculoEditando = id;
  } catch (erro) {
    console.error(erro);
    toast.erro("Não foi possível carregar os dados do veículo.");
  }
};

// ================= SALVAR =================
window.salvarVeiculo = async function () {
  const cliente_id = document.getElementById("cliente_id").value;
  const marca      = document.getElementById("marca").value.trim();
  const modelo     = document.getElementById("modelo").value.trim();
  const placa      = document.getElementById("placa").value.trim();
  const cor        = document.getElementById("cor").value.trim();
  const ano        = document.getElementById("ano").value.trim();

  if (!cliente_id || !marca || !modelo || !placa) {
    toast.aviso("Preencha os campos obrigatórios: Cliente, Marca, Modelo e Placa.");
    return;
  }

  try {
    let res;
    if (veiculoEditando) {
      res = await fetch(`${API}/veiculos/${veiculoEditando}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ cliente_id, marca, modelo, placa, cor, ano })
      });
    } else {
      res = await fetch(`${API}/veiculos`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ cliente_id, marca, modelo, placa, cor, ano })
      });
    }

    if (res.ok) {
      toast.sucesso(veiculoEditando ? "Veículo atualizado com sucesso!" : "Veículo cadastrado com sucesso!");
      fecharFormVeiculo();
      carregarVeiculos();
    } else {
      const erro = await res.json().catch(() => ({}));
      toast.erro(erro.erro || "Erro ao salvar veículo.");
    }
  } catch (erro) {
    console.error(erro);
    toast.erro("Erro de conexão ao salvar o veículo.");
  }
};

// ================= DELETE =================
window.deletarVeiculo = function (id) {
  abrirModalDelete(id);
};

async function executarDeleteVeiculo(id) {
  try {
    const res = await fetch(`${API}/veiculos/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });

    if (res.ok) {
      toast.sucesso("Veículo removido com sucesso!");
    } else {
      toast.erro("Erro ao deletar o veículo.");
    }

    carregarVeiculos();
  } catch (erro) {
    console.error(erro);
    toast.erro("Erro de conexão ao tentar deletar.");
  }
}