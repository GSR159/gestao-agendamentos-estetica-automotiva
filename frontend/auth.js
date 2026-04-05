// 🔐 verifica se está logado
function verificarLogin() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
  }
}

// 👤 pega dados do usuário do token
function getUsuario() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
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
    el.innerText = `👤 ${usuario.tipo.toUpperCase()}`;
  }
}

// 🚫 esconde elementos de admin para clientes
function ocultarParaCliente() {
  const usuario = getUsuario();

  if (!usuario) return;

  if (usuario.tipo !== 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = 'none';
    });
  }
}

// 🚪 logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}f