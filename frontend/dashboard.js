//  token
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const API = "http://localhost:3000";

//  headers padrão
function getHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

// 🇧🇷 FORMATAÇÃO BR
function formatarHoraBR(data) {
  return new Date(data).toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatarDataISO_BR(data) {
  return new Date(data).toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo"
  });
}

//  carregar dashboard
async function carregarDashboard() {
  try {
    const res = await fetch(`${API}/agendamentos`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      throw new Error("Erro na API");
    }

    const dados = await res.json();

    //  REMOVE DUPLICADOS 
    const dadosUnicos = dados.filter(
      (item, index, self) =>
        index === self.findIndex(a => a.id === item.id)
    );

    //  CARDS
    document.getElementById("total").innerText = dadosUnicos.length;

    const pendentes = dadosUnicos.filter(a => a.status === "pendente").length;
    const aprovados = dadosUnicos.filter(a => a.status === "aprovado").length;
    const recusados = dadosUnicos.filter(a => a.status === "recusado").length;

    document.getElementById("pendentes").innerText = pendentes;
    document.getElementById("aprovados").innerText = aprovados;
    document.getElementById("recusados").innerText = recusados;

    //  GRÁFICO (CORRIGIDO)
    const mapa = {};

    dadosUnicos.forEach(a => {
      const dia = formatarDataISO_BR(a.data);

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
          legend: { display: false }
        }
      }
    });

    //  AGENDA DO DIA ()
    const hoje = formatarDataISO_BR(new Date());

    let agendaHoje = dadosUnicos.filter(a => {
      return formatarDataISO_BR(a.data) === hoje;
    });

    //  ORDENA POR HORÁRIO
    agendaHoje.sort((a, b) => new Date(a.data) - new Date(b.data));

    const tabelaHoje = document.getElementById("agendaHoje");
    tabelaHoje.innerHTML = "";

    if (agendaHoje.length === 0) {
      tabelaHoje.innerHTML = `
        <tr>
          <td colspan="5">Nenhum agendamento hoje</td>
        </tr>
      `;
      return;
    }

    agendaHoje.forEach(a => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${formatarHoraBR(a.data)}</td>
        <td>${a.cliente}</td>
        <td>${a.veiculo}</td>
        <td>${a.servico}</td>
        <td><span class="status ${a.status}">${a.status}</span></td>
      `;

      tabelaHoje.appendChild(tr);
    });

  } catch (erro) {
    console.error("Erro:", erro);
    alert("Erro ao carregar dashboard");
  }
}

//  inicia
carregarDashboard();