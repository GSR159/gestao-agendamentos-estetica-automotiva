const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const API = "http://localhost:3000";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

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
          <button onclick="editarCliente(${c.id})">Editar</button>
          <button onclick="deletarCliente(${c.id})">Excluir</button>
        </td>
      </tr>
    `).join("");

  } catch (erro) {
    console.error(erro);
    document.getElementById("tabela").innerHTML =
      `<tr><td colspan="4">Erro ao carregar clientes</td></tr>`;
  }
};

window.abrirFormCliente = function () {
  document.getElementById("formCliente").style.display = "block";

  document.getElementById("clienteId").value = "";
  document.getElementById("nome").value = "";
  document.getElementById("email").value = "";
  document.getElementById("telefone").value = "";
};

window.fecharFormCliente = function () {
  document.getElementById("formCliente").style.display = "none";
};

window.editarCliente = async function (id) {
  try {
    const res = await fetch(`${API}/clientes/${id}`, {
      headers: getHeaders()
    });

    const cliente = await res.json();

    document.getElementById("formCliente").style.display = "block";

    document.getElementById("clienteId").value = cliente.id;
    document.getElementById("nome").value = cliente.nome;
    document.getElementById("email").value = cliente.email;
    document.getElementById("telefone").value = cliente.telefone;

  } catch (erro) {
    console.error("Erro ao carregar cliente", erro);
  }
};

window.salvarCliente = async function () {
  const id = document.getElementById("clienteId").value;

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const telefone = document.getElementById("telefone").value;

  if (!nome || !email || !telefone) {
    alert("Preencha todos os campos");
    return;
  }

  const dados = { nome, email, telefone };

  try {
    let res;

    if (id) {
      res = await fetch(`${API}/clientes/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(dados)
      });
    } else {
      res = await fetch(`${API}/clientes`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(dados)
      });
    }

    if (res.ok) {
      fecharFormCliente();
      carregarClientes();
    } else {
      alert("Erro ao salvar cliente");
    }

  } catch (erro) {
    console.error(erro);
  }
};

window.deletarCliente = async function (id) {
  if (!confirm("Deseja deletar?")) return;

  await fetch(`${API}/clientes/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });

  carregarClientes();
};

carregarClientes();