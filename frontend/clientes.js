const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}
const API = "http://localhost:3000";

async function carregarClientes() {
  try {
    const res = await fetch(`${API}/clientes`);

    if (!res.ok) throw new Error("Erro na API");

    const dados = await res.json();

    const tabela = document.getElementById("tabela");

    tabela.innerHTML = dados.map(c => `
      <tr>
        <td>${c.nome}</td>
        <td>${c.email}</td>
        <td>${c.telefone}</td>
      </tr>
    `).join("");

  } catch (erro) {
    console.error(erro);
    document.getElementById("tabela").innerHTML =
      `<tr><td colspan="3">Erro ao carregar clientes</td></tr>`;
  }
}

carregarClientes();