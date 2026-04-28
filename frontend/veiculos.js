let veiculoEditando = null;

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
}

// ================= LISTAR =================
window.carregarVeiculos = async function () {
  try {
    const res = await fetch(`${API}/veiculos`, {
      headers: getHeaders()
    });

    const dados = await res.json();

    const tabela = document.getElementById("tabela");

    tabela.innerHTML = dados.map(v => `
      <tr>
        <td>${v.cliente}</td>
        <td>${v.modelo}</td>
        <td>${v.placa}</td>
        <td>
          <button onclick="editarVeiculo(${v.id})">✏️</button>
          <button onclick="deletarVeiculo(${v.id})">🗑</button>
        </td>
      </tr>
    `).join("");

  } catch (erro) {
    console.error(erro);
    document.getElementById("tabela").innerHTML =
      `<tr><td colspan="4">Erro ao carregar veículos</td></tr>`;
  }
};

// ================= FORM =================
window.abrirFormVeiculo = async function () {
  document.getElementById("formVeiculo").style.display = "block";
  await carregarClientes();
};

window.fecharFormVeiculo = function () {
  document.getElementById("formVeiculo").style.display = "none";
  veiculoEditando = null;

  document.getElementById("cliente_id").value = "";
  document.getElementById("marca").value = "";
  document.getElementById("modelo").value = "";
  document.getElementById("placa").value = "";
  document.getElementById("cor").value = "";
  document.getElementById("ano").value = "";
};

// ================= EDITAR =================
window.editarVeiculo = async function (id) {
  try {
    await carregarClientes();

    const res = await fetch(`${API}/veiculos/${id}`, {
      headers: getHeaders()
    });

    const v = await res.json();

    document.getElementById("cliente_id").value = v.cliente_id;
    document.getElementById("marca").value = v.marca;
    document.getElementById("modelo").value = v.modelo;
    document.getElementById("placa").value = v.placa;
    document.getElementById("cor").value = v.cor;
    document.getElementById("ano").value = v.ano;

    veiculoEditando = id;

    abrirFormVeiculo();

  } catch (erro) {
    console.error(erro);
    alert("Erro ao carregar veículo");
  }
};

// ================= SALVAR =================
window.salvarVeiculo = async function () {
  const cliente_id = document.getElementById("cliente_id").value;
  const marca = document.getElementById("marca").value;
  const modelo = document.getElementById("modelo").value;
  const placa = document.getElementById("placa").value;
  const cor = document.getElementById("cor").value;
  const ano = document.getElementById("ano").value;

  let res;

  if (veiculoEditando) {
    res = await fetch(`${API}/veiculos/${veiculoEditando}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        cliente_id,
        marca,
        modelo,
        placa,
        cor,
        ano
      })
    });
  } else {
    res = await fetch(`${API}/veiculos`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        cliente_id,
        marca,
        modelo,
        placa,
        cor,
        ano
      })
    });
  }

  if (res.ok) {
    alert("Salvo com sucesso!");
    fecharFormVeiculo();
    carregarVeiculos();
  } else {
    alert("Erro ao salvar");
  }
};

// ================= DELETE =================
window.deletarVeiculo = async function (id) {
  if (!confirm("Deseja deletar este veículo?")) return;

  await fetch(`${API}/veiculos/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });

  carregarVeiculos();
};

// ================= INIT =================
carregarVeiculos();