const API = "http://localhost:3000";

async function logar() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, senha })
  });

  const data = await res.json();

  if (res.status !== 200) {
    alert("Login inválido");
    return;
  }

  // salvar sessão
  localStorage.setItem("usuario", JSON.stringify(data));

  // redirecionar
  if (data.tipo === "admin") {
    window.location.href = "dashboard.html";
  } else {
    window.location.href = "index.html";
  }
}