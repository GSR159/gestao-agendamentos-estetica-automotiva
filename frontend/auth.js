// 🔐 verifica se está logado
function verificarLogin() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
  }
}

// 👤 pega dados do usuário do token (JWT)
function getUsuario() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const base64 = token.split('.')[1];
    const payload = JSON.parse(atob(base64));
    return payload;
  } catch (error) {
    console.error("Erro ao ler token:", error);
    return null;
  }
}

// 👤 mostra usuário logado na tela
function mostrarUsuario() {
  const usuario = getUsuario();

  if (!usuario) return;

  const el = document.getElementById("usuario-logado");

  if (el) {
    el.innerText = `👤 ${usuario.tipo?.toUpperCase() || "USUARIO"}`;
  }
}

// 🔐 controla elementos de admin
function ocultarParaCliente() {
  const usuario = getUsuario();

  const elementosAdmin = document.querySelectorAll(".admin-only");

  if (!usuario) {
    elementosAdmin.forEach(el => el.style.display = "none");
    return;
  }

  if (usuario.tipo === "admin") {
    elementosAdmin.forEach(el => {
      if (el.tagName === "TD" || el.tagName === "TH") {
        el.style.display = "table-cell";
      } else {
        el.style.display = "block";
      }
    });
  } else {
    elementosAdmin.forEach(el => {
      el.style.display = "none";
    });
  }
}

// 🚪 logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}