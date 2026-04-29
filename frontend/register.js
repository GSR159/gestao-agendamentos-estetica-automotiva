const API = "http://localhost:3000";

async function cadastrar() {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const senha = document.getElementById("senha").value;
  const telefone = document.getElementById("telefone")?.value || ""; // opcional

  const erroDiv = document.getElementById("alerta-erro");

  // reset erro
  erroDiv.style.display = "none";
  erroDiv.innerText = "";

  if (!nome || !email || !senha) {
    erroDiv.innerText = "Preencha todos os campos";
    erroDiv.style.display = "block";
    throw new Error("Validação falhou");
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
        telefone
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.erro || "Erro ao cadastrar usuário.");
    }

    // 🔥 IMPORTANTE: não redireciona mais
    return data;

  } catch (error) {
    console.error(error);
    erroDiv.innerText = error.message || "Erro ao conectar com servidor";
    erroDiv.style.display = "block";
    throw error;
  }
}