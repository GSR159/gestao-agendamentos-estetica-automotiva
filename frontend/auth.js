// 🔐 verifica se está logado
function verificarLogin() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
  }
}

// ================= LOGIN =================
async function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    document.getElementById("erro").innerText = "Preencha todos os campos";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);

      const usuario = parseJwt(data.token);
      
      if(usuario.tipo === "admin" || usuario.tipo === "superadmin")
        {
        window.location.href = "dashboard.html";
      }
      else {
        window.location.href = "tela_cliente.html";
      }
    }
    
  } catch (erro) {
    console.error(erro);
    document.getElementById("erro").innerText = "Erro ao conectar com servidor";
  }
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

  if (!usuario || usuario.tipo !== "admin") {
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