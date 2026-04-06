const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const API = "http://localhost:3000";

// 🔥 headers
function getHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

// 🚀 carregar clientes
window.carregarClientes = async function () {
  try {
    const res = await fetch(`${API}/clientes`, {
      headers: getHeaders()
    });

    if (!res.ok) throw new Error("Erro na API");

    const dados = await res.json();

    const tabela = document.getElementById("tabela");

    if (dados.length === 0) {
      tabela.innerHTML = `
        <tr>
          <td colspan="4">Nenhum cliente cadastrado</td>
        </tr>
      `;
      return;
    }

    tabela.innerHTML = dados.map(c => `
      <tr>
        <td>${c.nome}</td>
        <td>${c.email}</td>
        <td>${c.telefone}</td>
        <td>
          <button onclick="deletarCliente(${c.id})">🗑</button>
        </td>
      </tr>
    `).join("");

  } catch (erro) {
    console.error(erro);
    document.getElementById("tabela").innerHTML =
      `<tr><td colspan="4">Erro ao carregar clientes</td></tr>`;
  }
};

// 🔥 abrir form
window.abrirFormCliente = function () {
  document.getElementById("formCliente").style.display = "block";
};

// 🔥 fechar form
window.fecharFormCliente = function () {
  document.getElementById("formCliente").style.display = "none";
};

// 🔥 criar cliente
window.criarCliente = async function () {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const telefone = document.getElementById("telefone").value;

  if (!nome || !email || !telefone) {
    alert("Preencha todos os campos");
    return;
  }

  const res = await fetch(`${API}/clientes`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ nome, email, telefone })
  });

  if (res.ok) {
    alert("Cliente criado!");
    fecharFormCliente();
    carregarClientes();
  } else {
    alert("Erro ao criar cliente");
  }
};

// 🔥 deletar
window.deletarCliente = async function (id) {
  if (!confirm("Deseja deletar?")) return;

  await fetch(`${API}/clientes/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });

  carregarClientes();
};

// 🚀 inicia
carregarClientes();