const API = "http://localhost:3000";

async function cadastrar() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (!nome || !email || !senha) {
    document.getElementById("erro").innerText = "Preencha tudo";
    return;
  }

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nome, email, senha })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Conta criada!");
    window.location.href = "login.html";
  } else {
    document.getElementById("erro").innerText = data.erro;
  }
}