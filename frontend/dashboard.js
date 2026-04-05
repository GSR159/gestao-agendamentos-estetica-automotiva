// 🔐 verifica login
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const API = "http://localhost:3000";

// 🚀 carregar dashboard
async function carregarDashboard() {
  try {
    const res = await fetch(`${API}/agendamentos`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Erro na API");
    }

    const dados = await res.json();

    // 🔥 CARDS
    document.getElementById("total").innerText = dados.length;

    const pendentes = dados.filter(a => a.status === "pendente").length;
    const aprovados = dados.filter(a => a.status === "aprovado").length;
    const recusados = dados.filter(a => a.status === "recusado").length;

    document.getElementById("pendentes").innerText = pendentes;
    document.getElementById("aprovados").innerText = aprovados;
    document.getElementById("recusados").innerText = recusados;

    // 🔥 GRÁFICO
    const mapa = {};

    dados.forEach(a => {
      const dia = new Date(a.data).toLocaleDateString();

      if (!mapa[dia]) mapa[dia] = 0;
      mapa[dia]++;
    });

    const labels = Object.keys(mapa);
    const valores = Object.values(mapa);

    const ctx = document.getElementById("grafico");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Agendamentos",
          data: valores,
          backgroundColor: "#22c55e",
          borderRadius: 10
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    // 🔥 AGENDA DE HOJE
    const hoje = new Date().toLocaleDateString();

    const agendaHoje = dados.filter(a => {
      const dataAgendamento = new Date(a.data).toLocaleDateString();
      return dataAgendamento === hoje;
    });

    const tabelaHoje = document.getElementById("agendaHoje");
    tabelaHoje.innerHTML = "";

    agendaHoje.forEach(a => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${new Date(a.data).toLocaleTimeString()}</td>
        <td>${a.cliente}</td>
        <td>${a.veiculo}</td>
        <td>${a.servico}</td>
        <td><span class="status ${a.status}">${a.status}</span></td>
      `;

      tabelaHoje.appendChild(tr);
    });

  } catch (erro) {
    console.error("Erro:", erro);
  }
}

// 🚀 inicia
carregarDashboard();