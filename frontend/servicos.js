let servicoEditando = null;

// 🚀 carregar serviços
window.carregarServicos = async function () {
  try {
    const res = await fetch(`${API}/servicos`, {
      headers: getHeaders()
    });

    if (!res.ok) throw new Error("Erro na API");

    const dados = await res.json();

    const tabela = document.getElementById("tabela");

    if (dados.length === 0) {
      tabela.innerHTML = `
        <tr>
          <td colspan="4">Nenhum serviço cadastrado</td>
        </tr>
      `;
      return;
    }

    tabela.innerHTML = dados.map(s => `
      <tr>
        <td>${s.nome}</td>
        <td>${s.duracao_minutos || 0} min</td>
        <td>R$ ${Number(s.preco).toFixed(2).replace(".", ",")}</td>
        <td>
          <button onclick="editarServico(${s.id})">✏️</button>
          <button onclick="deletarServico(${s.id})">🗑</button>
        </td>
      </tr>
    `).join("");

  } catch (erro) {
    console.error(erro);
    document.getElementById("tabela").innerHTML =
      `<tr><td colspan="4">Erro ao carregar serviços</td></tr>`;
  }
};

// 🔥 abrir form
window.abrirFormServico = function () {
  document.getElementById("formServico").style.display = "block";
};

// 🔥 fechar form + reset
window.fecharFormServico = function () {
  document.getElementById("formServico").style.display = "none";

  servicoEditando = null;

  document.getElementById("nome").value = "";
  document.getElementById("duracao").value = "";
  document.getElementById("preco").value = "";
};

// 🔥 EDITAR SERVIÇO
window.editarServico = async function (id) {
  try {
    const res = await fetch(`${API}/servicos/${id}`, {
      headers: getHeaders()
    });

    const servico = await res.json();

    document.getElementById("nome").value = servico.nome;
    document.getElementById("duracao").value = servico.duracao_minutos;
    document.getElementById("preco").value = servico.preco;

    servicoEditando = id;

    abrirFormServico();

  } catch (erro) {
    console.error(erro);
    alert("Erro ao carregar serviço");
  }
};

// 🔥 CRIAR OU ATUALIZAR
window.criarServico = async function () {
  const nome = document.getElementById("nome").value.trim();
  const duracao = Number(document.getElementById("duracao").value);
  const preco = Number(document.getElementById("preco").value);

  if (!nome || !duracao || !preco) {
    alert("Preencha todos os campos corretamente");
    return;
  }

  try {
    let res;

    if (servicoEditando) {
      // 🔥 UPDATE
      res = await fetch(`${API}/servicos/${servicoEditando}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          nome,
          duracao_minutos: duracao,
          preco
        })
      });

    } else {
      // 🔥 CREATE
      res = await fetch(`${API}/servicos`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          nome,
          duracao_minutos: duracao,
          preco
        })
      });
    }

    const resposta = await res.json();

    if (!res.ok) {
      console.error(resposta);
      alert(resposta.erro || "Erro ao salvar serviço");
      return;
    }

    alert(servicoEditando ? "Serviço atualizado!" : "Serviço criado!");

    fecharFormServico();
    carregarServicos();

  } catch (erro) {
    console.error(erro);
    alert("Erro de conexão com o servidor");
  }
};

// 🔥 deletar
window.deletarServico = async function (id) {
  if (!confirm("Deseja deletar este serviço?")) return;

  await fetch(`${API}/servicos/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });

  carregarServicos();
};

// 🚀 inicia
carregarServicos();