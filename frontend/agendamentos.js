// 🔐 token
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const API = "http://localhost:3000";

// 🔥 headers padrão
function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

// 🚀 carregar agendamentos
async function carregarAgendamentos() {
  try {
    const res = await fetch(`${API}/agendamentos`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      throw new Error("Erro na API");
    }

    const dados = await res.json();

    const tabela = document.getElementById("tabela");
    tabela.innerHTML = "";

    dados.forEach(a => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${a.cliente}</td>
        <td>${a.veiculo}</td>
        <td>${a.servico}</td>
        <td>${new Date(a.data).toLocaleString()}</td>
        <td><span class="status ${a.status}">${a.status}</span></td>
        <td class="admin-only">
          <button onclick="atualizarStatus(${a.id}, 'aprovado')">✔</button>
          <button onclick="atualizarStatus(${a.id}, 'recusado')">❌</button>
          <button onclick="deletar(${a.id})">🗑</button>
        </td>
      `;

      tabela.appendChild(tr);
    });

  } catch (erro) {
    console.error("Erro:", erro);

    document.getElementById("tabela").innerHTML = `
      <tr>
        <td colspan="6">Erro ao carregar agendamentos</td>
      </tr>
    `;
  }
}

// 🔄 atualizar status
async function atualizarStatus(id, status) {
  await fetch(`${API}/agendamentos/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });

  carregarAgendamentos();
}

// 🗑 deletar
async function deletar(id) {
  await fetch(`${API}/agendamentos/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });

  carregarAgendamentos();
}

// 🚀 inicia
carregarAgendamentos();