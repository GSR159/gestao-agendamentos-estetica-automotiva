const API = "http://localhost:3000";

async function cadastrar() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const telefone = document.getElementById("telefone").value; // 🔥 NOVO

  const erroDiv = document.getElementById("erro");

  if (!nome || !email || !senha) {
    erroDiv.innerText = "Preencha todos os campos";
    erroDiv.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        email,
        senha,
        telefone // 🔥 ENVIANDO
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Conta criada com sucesso!");
      window.location.href = "login.html";
    } else {
      erroDiv.innerText = data.erro;
      erroDiv.style.display = "block";
    }

  } catch (error) {
    console.error(error);
    erroDiv.innerText = "Erro ao conectar com servidor";
    erroDiv.style.display = "block";
  }
}