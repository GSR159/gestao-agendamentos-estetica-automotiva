const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}
const API = "http://localhost:3000";

async function carregarVeiculos() {
  try {
    const res = await fetch(`${API}/veiculos`);
    const dados = await res.json();

    const tabela = document.getElementById("tabela");

    tabela.innerHTML = dados.map(v => `
      <tr>
        <td>${v.modelo}</td>
        <td>${v.placa}</td>
        <td>${v.cliente}</td>
      </tr>
    `).join("");

  } catch (erro) {
    console.error(erro);
    document.getElementById("tabela").innerHTML =
      `<tr><td colspan="3">Erro ao carregar veículos</td></tr>`;
  }
}

carregarVeiculos();