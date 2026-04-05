const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}
const API = "http://localhost:3000";

async function carregarServicos() {
  try {
    const res = await fetch(`${API}/servicos`);
    const dados = await res.json();

    const tabela = document.getElementById("tabela");

    tabela.innerHTML = dados.map(s => `
      <tr>
        <td>${s.nome}</td>
        <td>${s.tempo}</td>
        <td>R$ ${s.preco}</td>
      </tr>
    `).join("");

  } catch (erro) {
    console.error(erro);
    document.getElementById("tabela").innerHTML =
      `<tr><td colspan="3">Erro ao carregar serviços</td></tr>`;
  }
}

carregarServicos();