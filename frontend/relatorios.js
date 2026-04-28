async function carregarRelatorios() {
  try {
    const res = await fetch(`${API}/relatorios`);
    const data = await res.json();

    // 💰 CARDS
    document.getElementById("val-ticket").innerText =
      "R$ " + Number(data.ticketMedio || 0).toFixed(2);

    document.getElementById("val-receita").innerText =
      "R$ " + Number(data.receitaTotal || 0).toFixed(2);

    document.getElementById("val-fidelizacao").innerText =
      (data.fidelizacao || 0) + "%";

    // 📈 EVOLUÇÃO
    const labelsReceita = data.evolucao.map(e => e.dia);
    const dadosReceita = data.evolucao.map(e => e.total);

    // 🧼 SERVIÇOS
    const labelsServicos = data.servicos.map(s => s.nome);
    const dadosServicos = data.servicos.map(s => s.total);

    inicializarGraficos(
      labelsReceita,
      dadosReceita,
      labelsServicos,
      dadosServicos
    );

    // 👤 TABELA
    const tbody = document.getElementById("rankingClientesBody");
    tbody.innerHTML = "";

    data.clientes.forEach(cliente => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${cliente.nome}</td>
        <td>${cliente.qtd}</td>
        <td class="text-right">R$ ${Number(cliente.total).toFixed(2)}</td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Erro ao carregar relatórios:", err);
  }
}