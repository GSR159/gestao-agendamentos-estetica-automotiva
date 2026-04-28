// ================= FORM =================
window.abrirFormulario = function () {
  document.getElementById("formAgendamento").style.display = "block";
};

window.fecharFormulario = function () {
  document.getElementById("formAgendamento").style.display = "none";
};

// ================= CLIENTES =================
async function carregarClientes() {
  const res = await fetch(`${API}/clientes`, {
    headers: getHeaders()
  });

  const dados = await res.json();

  const select = document.getElementById("cliente_id");

  select.innerHTML = dados.map(c => `
    <option value="${c.id}">${c.nome}</option>
  `).join("");

  carregarVeiculosDoCliente();
}

// ================= VEÍCULOS =================
window.carregarVeiculosDoCliente = async function () {
  const cliente_id = document.getElementById("cliente_id").value;

  const res = await fetch(`${API}/veiculos`, {
    headers: getHeaders()
  });

  const dados = await res.json();

  const filtrados = dados.filter(v => v.cliente_id == cliente_id);

  const select = document.getElementById("veiculo_id");

  select.innerHTML = filtrados.map(v => `
    <option value="${v.id}">${v.modelo} - ${v.placa}</option>
  `).join("");
};

// ================= SERVIÇOS =================
let listaServicos = [];

async function carregarServicos() {
  const res = await fetch(`${API}/servicos`, {
    headers: getHeaders()
  });

  listaServicos = await res.json();

  const select = document.getElementById("servico_id");

  select.innerHTML = listaServicos.map(s => `
    <option value="${s.id}">${s.nome}</option>
  `).join("");
}

// ================= BLOQUEIO =================
async function horarioOcupado(dataSelecionada, servico_id) {
  const res = await fetch(`${API}/agendamentos`, {
    headers: getHeaders()
  });

  const agendamentos = await res.json();

  const servico = listaServicos.find(s => s.id == servico_id);
  if (!servico) return false;

  const inicioNovo = new Date(dataSelecionada);
  const fimNovo = new Date(inicioNovo);
  fimNovo.setMinutes(fimNovo.getMinutes() + servico.duracao_minutos);

  for (const a of agendamentos) {
    if (a.status === "recusado") continue;

    const inicioExistente = new Date(a.data);

    const servicoExistente = listaServicos.find(s => s.nome === a.servico);
    if (!servicoExistente) continue;

    const fimExistente = new Date(inicioExistente);
    fimExistente.setMinutes(
      fimExistente.getMinutes() + servicoExistente.duracao_minutos
    );

    const conflito =
      inicioNovo < fimExistente && fimNovo > inicioExistente;

    if (conflito) return true;
  }

  return false;
}

// ================= CRIAR =================
window.criarAgendamento = async function () {
  const cliente_id = document.getElementById("cliente_id").value;
  const veiculo_id = document.getElementById("veiculo_id").value;
  const servico_id = document.getElementById("servico_id").value;
  const data = document.getElementById("data").value;

  if (!cliente_id || !veiculo_id || !servico_id || !data) {
    alert("Preencha tudo");
    return;
  }

  const ocupado = await horarioOcupado(data, servico_id);

  if (ocupado) {
    alert("Horário ocupado");
    return;
  }

  const res = await fetch(`${API}/agendamentos`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      cliente_id,
      veiculo_id,
      servico_id,
      data
    })
  });

  if (res.ok) {
    fecharFormulario();
    carregarAgendamentos();
  } else {
    const erro = await res.json();
    alert(erro.erro || "Erro ao agendar");
  }
};

// ================= STATUS =================
window.atualizarStatus = async function (id, status) {
  try {
    const res = await fetch(`${API}/agendamentos/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });

    if (res.ok) {
      carregarAgendamentos();
    } else {
      const erro = await res.json();
      alert(erro.erro || "Erro ao atualizar status");
    }

  } catch (erro) {
    console.error("Erro no update:", erro);
  }
};

// ================= LISTAR =================
window.carregarAgendamentos = async function () {
  const res = await fetch(`${API}/agendamentos`, {
    headers: getHeaders()
  });

  const dados = await res.json();

  const tabela = document.getElementById("tabela");
  tabela.innerHTML = "";

  dados.forEach(a => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${a.cliente}</td>
      <td>${a.veiculo}</td>
      <td>${a.servico}</td>
      <td>${new Date(a.data).toLocaleString("pt-BR")}</td>
      <td>
        <span class="status ${a.status}">
          ${a.status.toUpperCase()}
        </span>
      </td>
      <td>
        ${a.status === "pendente" ? `
          <button onclick="atualizarStatus(${a.id}, 'aprovado')">Aprovar</button>
          <button onclick="atualizarStatus(${a.id}, 'recusado')">Recusar</button>
        ` : ""}

        <button onclick="deletar(${a.id})">Excluir</button>
      </td>
    `;

    tabela.appendChild(tr);
  });
};

// ================= DELETE =================
window.deletar = async function (id) {
  await fetch(`${API}/agendamentos/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });

  carregarAgendamentos();
};

// ================= INICIAR =================
carregarClientes();
carregarServicos();
carregarAgendamentos();