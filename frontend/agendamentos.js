const API = "http://localhost:3000";

async function carregarAgendamentos() {
  const res = await fetch(`${API}/agendamentos`);
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
      <td> class="admin-only">
        <button onclick="atualizarStatus(${a.id}, 'aprovado')">✔</button>
        <button onclick="atualizarStatus(${a.id}, 'recusado')">❌</button>
        <button onclick="deletar(${a.id})">🗑</button>
      </td>
    `;

    tabela.appendChild(tr);
  });
}

async function atualizarStatus(id, status) {
  await fetch(`${API}/agendamentos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });

  carregarAgendamentos();
}

async function deletar(id) {
  await fetch(`${API}/agendamentos/${id}`, {
    method: "DELETE"
  });

  carregarAgendamentos();
}

carregarAgendamentos();