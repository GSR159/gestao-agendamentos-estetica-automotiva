function getUsuario() {
  return JSON.parse(localStorage.getItem("usuario"));
}

// 🔥 ESCONDER ELEMENTOS DE ADMIN
function ocultarParaCliente() {
  const usuario = getUsuario();

  if (usuario.tipo !== "admin") {
    document.querySelectorAll(".admin-only").forEach(el => {
      el.style.display = "none";
    });
  }
}