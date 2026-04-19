const API = "http://localhost:3000";

// 🔄 trocar telas
function trocarTela(tela) {
  ["agendamentos", "veiculos", "conta"].forEach(id => {
    document.getElementById(id).classList.add("hidden");
  });

  document.getElementById(tela).classList.remove("hidden");
}

// 📅 AGENDAMENTOS
async function carregarAgendamentos() {
  const res = await fetch(`${API}/cliente/meus-agendamentos`, {
    headers: getHeaders()
  });

  const data = await res.json();

  const tabela = document.getElementById("listaAgendamentos");
  tabela.innerHTML = "";

  data.forEach(a => {
    tabela.innerHTML += `
      <tr>
        <td>${new Date(a.data).toLocaleDateString()}</td>
        <td>${a.servico}</td>
        <td>${a.status}</td>
      </tr>
    `;
  });
}

// 🚗 VEÍCULOS
async function carregarVeiculos() {
  const res = await fetch(`${API}/cliente/meus-veiculos`, {
    headers: getHeaders()
  });

  const data = await res.json();

  const lista = document.getElementById("listaVeiculos");
  lista.innerHTML = "";

  data.forEach(v => {
    lista.innerHTML += `<li>${v.modelo} - ${v.placa}</li>`;
  });
}

async function criarVeiculo() {
  const modelo = document.getElementById("modelo").value;
  const placa = document.getElementById("placa").value;

  await fetch(`${API}/cliente/meus-veiculos`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ modelo, placa })
  });

  carregarVeiculos();
}

// ❌ EXCLUIR CONTA
async function excluirConta() {
  if (!confirm("Isso vai excluir sua conta PERMANENTEMENTE. Deseja continuar?")) return;

  const res = await fetch(`${API}/cliente/minha-conta`, {
    method: "DELETE",
    headers: getHeaders()
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.erro);
    return;
  }

  alert("Conta excluída com sucesso");
  logout();
}

// INIT
window.onload = () => {
  verificarLogin();
  carregarAgendamentos();
  carregarVeiculos();
};