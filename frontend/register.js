// Salva os dados no sessionStorage ao sair da página
function salvarRascunho() {
  const dados = {
    nome:            document.getElementById('nome')?.value            || '',
    email:           document.getElementById('email')?.value           || '',
    confirmar_email: document.getElementById('confirmar_email')?.value || '',
    lgpd:            document.getElementById('lgpd')?.checked          || false,
  };
  sessionStorage.setItem('register_rascunho', JSON.stringify(dados));
}

// Restaura os dados ao voltar para a página
function restaurarRascunho() {
  try {
    const raw = sessionStorage.getItem('register_rascunho');
    if (!raw) return;

    const dados = JSON.parse(raw);

    if (dados.nome)            document.getElementById('nome').value            = dados.nome;
    if (dados.email)           document.getElementById('email').value           = dados.email;
    if (dados.confirmar_email) document.getElementById('confirmar_email').value = dados.confirmar_email;
    if (dados.lgpd)            document.getElementById('lgpd').checked          = dados.lgpd;

  } catch (e) {
    console.warn('Erro ao restaurar rascunho:', e);
  }
}

// Limpa o rascunho após cadastro bem-sucedido
function limparRascunho() {
  sessionStorage.removeItem('register_rascunho');
}

// Salva automaticamente a cada mudança nos campos
document.addEventListener('DOMContentLoaded', () => {
  restaurarRascunho();

  ['nome', 'email', 'confirmar_email', 'lgpd'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', salvarRascunho);
    if (el) el.addEventListener('input',  salvarRascunho);
  });
});

// ─────────────────────────────────────────
//  CADASTRAR
// ─────────────────────────────────────────
async function cadastrar() {
  const nome     = document.getElementById('nome').value.trim();
  const email    = document.getElementById('email').value.trim().toLowerCase();
  const senha    = document.getElementById('senha').value;
  const telefone = document.getElementById('telefone')?.value || '';

  const erroDiv = document.getElementById('alerta-erro');
  erroDiv.style.display = 'none';
  erroDiv.innerText = '';

  if (!nome || !email || !senha) {
    erroDiv.innerText = 'Preencha todos os campos';
    erroDiv.style.display = 'block';
    throw new Error('Validação falhou');
  }

  try {
    const res = await fetch(`${API}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ nome, email, senha, telefone })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.erro || 'Erro ao cadastrar usuário.');

    limparRascunho();
    return data;

  } catch (error) {
    console.error(error);
    erroDiv.innerText = error.message || 'Erro ao conectar com servidor';
    erroDiv.style.display = 'block';
    throw error;
  }
}