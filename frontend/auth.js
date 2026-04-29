const API = "http://localhost:3000";

// 🔐 verifica se está logado
function verificarLogin() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
  }
}

// ================= LOGIN =================
async function login() {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const senha = document.getElementById("senha").value;
  const erroEl = document.getElementById("erro");

  erroEl.innerText = "";
  erroEl.style.color = "#ef4444";

  if (!email || !senha) {
    erroEl.innerText = "Preencha todos os campos";
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    if (!res.ok) {
      erroEl.innerText = data.erro || "Erro ao fazer login";

      // 🔥 mostra botão se não confirmou email
      if (data.erro && data.erro.includes("Confirme seu email")) {
        mostrarBotaoReenvio(true);
      } else {
        mostrarBotaoReenvio(false);
      }

      return;
    }

    // sucesso → limpa botão
    mostrarBotaoReenvio(false);

    localStorage.setItem("token", data.token);

    const usuario = parseJwt(data.token);

    if (!usuario) {
      erroEl.innerText = "Token inválido recebido do servidor";
      localStorage.removeItem("token");
      return;
    }

    if (usuario.tipo === "admin" || usuario.tipo === "superadmin") {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "tela_cliente.html";
    }

  } catch (erro) {
    console.error(erro);
    erroEl.innerText = "Erro ao conectar com servidor";
  }
}

// ================= REENVIAR EMAIL =================
async function reenviarEmail() {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const erroEl = document.getElementById("erro");

  if (!email) {
    erroEl.innerText = "Digite seu email para reenviar.";
    erroEl.style.color = "#ef4444";
    return;
  }

  try {
    const res = await fetch(`${API}/auth/reenviar-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.erro);
    }

    erroEl.style.color = "#22c55e";
    erroEl.innerText = data.mensagem;

  } catch (error) {
    erroEl.style.color = "#ef4444";
    erroEl.innerText = error.message;
  }
}

// ================= BOTÃO DINÂMICO =================
function mostrarBotaoReenvio(mostrar) {
  const btn = document.getElementById("btn-reenviar");

  if (!btn) return;

  btn.style.display = mostrar ? "block" : "none";
}

// 🔓 decode seguro do JWT
function parseJwt(token) {
  try {
    const base64 = token.split('.')[1];
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    console.error("Token inválido:", e);
    return null;
  }
}

// 👤 pega usuário do token
function getUsuario() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  return parseJwt(token);
}

// 👤 mostra usuário logado
function mostrarUsuario() {
  const usuario = getUsuario();
  if (!usuario) return;

  const el = document.getElementById("usuario-logado");

  if (el) {
    el.innerText = usuario.tipo
      ? usuario.tipo.toUpperCase()
      : "USUARIO";
  }
}

// 🔐 controle de acesso
function ocultarParaCliente() {
  const usuario = getUsuario();
  const elementosAdmin = document.querySelectorAll(".admin-only");

  if (!usuario || (usuario.tipo !== "admin" && usuario.tipo !== "superadmin")) {
    elementosAdmin.forEach(el => {
      el.style.display = "none";
    });
    return;
  }

  elementosAdmin.forEach(el => {
    if (el.tagName === "TD" || el.tagName === "TH") {
      el.style.display = "table-cell";
    } else {
      el.style.display = "block";
    }
  });
}

// 🔐 headers autenticados
function getHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

// 🚪 logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}