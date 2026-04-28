async function carregarDashboard() {
  try {
    const res = await fetch(`${API}/agendamentos`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      throw new Error("Erro ao buscar dados");
    }

    const dados = await res.json();

    // ================= CARDS =================
    document.getElementById("total").innerText = dados.length;

    const pendentes = dados.filter(a => a.status === "pendente").length;
    const aprovados = dados.filter(a => a.status === "aprovado").length;
    const recusados = dados.filter(a => a.status === "recusado").length;

    document.getElementById("pendentes").innerText = pendentes;
    document.getElementById("aprovados").innerText = aprovados;
    document.getElementById("recusados").innerText = recusados;

    // ================= AGRUPAMENTO =================
    const dias = {};

    dados.forEach(a => {
      const data = new Date(a.data).toLocaleDateString("pt-BR");

      if (!dias[data]) {
        dias[data] = {
          aprovado: 0,
          pendente: 0,
          recusado: 0
        };
      }

      dias[data][a.status]++;
    });

    const labels = Object.keys(dias);

    const aprovadosData = labels.map(d => dias[d].aprovado);
    const pendentesData = labels.map(d => dias[d].pendente);
    const recusadosData = labels.map(d => dias[d].recusado);

    // ================= GRÁFICO =================
    const canvas = document.getElementById("grafico");

    if (!canvas) {
      console.error("Canvas não encontrado");
      return;
    }

    const ctx = canvas.getContext("2d");

    if (window.graficoInstance) {
      window.graficoInstance.destroy();
    }

    window.graficoInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Aprovados",
            data: aprovadosData,
            backgroundColor: "#22c55e"
          },
          {
            label: "Pendentes",
            data: pendentesData,
            backgroundColor: "#f59e0b"
          },
          {
            label: "Recusados",
            data: recusadosData,
            backgroundColor: "#ef4444"
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top"
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });

    // ================= AGENDA DO DIA =================
    const hoje = new Date().toLocaleDateString("pt-BR");

    const agendaHoje = dados.filter(a => {
      const data = new Date(a.data).toLocaleDateString("pt-BR");
      return data === hoje;
    });

    const tabela = document.getElementById("agendaHoje");
    tabela.innerHTML = "";

    if (agendaHoje.length === 0) {
      tabela.innerHTML = `
        <tr>
          <td colspan="5">Nenhum agendamento hoje</td>
        </tr>
      `;
      return;
    }

    agendaHoje.forEach(a => {
      const tr = document.createElement("tr");

      const hora = new Date(a.data).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      });

      tr.innerHTML = `
        <td>${hora}</td>
        <td>${a.cliente}</td>
        <td>${a.veiculo}</td>
        <td>${a.servico}</td>
        <td>
          <span class="status ${a.status}">
            ${a.status}
          </span>
        </td>
      `;

      tabela.appendChild(tr);
    });

  } catch (erro) {
    console.error("Erro no dashboard:", erro);
  }
}

carregarDashboard();