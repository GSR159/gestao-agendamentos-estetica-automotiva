// ─────────────────────────────────────────
//  RASCUNHO — sessionStorage
// ─────────────────────────────────────────
const RASCUNHO_KEY = 'register_rascunho';

function salvarRascunho() {
  const dados = {
    nome:            document.getElementById('nome')?.value            || '',
    email:           document.getElementById('email')?.value           || '',
    confirmar_email: document.getElementById('confirmar_email')?.value || '',
    lgpd:            document.getElementById('lgpd')?.checked          || false,
  };
  sessionStorage.setItem(RASCUNHO_KEY, JSON.stringify(dados));
}

function restaurarRascunho() {
  try {
    const raw = sessionStorage.getItem(RASCUNHO_KEY);
    if (!raw) return;
    const dados = JSON.parse(raw);
    if (dados.nome)            document.getElementById('nome').value            = dados.nome;
    if (dados.email)           document.getElementById('email').value           = dados.email;
    if (dados.confirmar_email) document.getElementById('confirmar_email').value = dados.confirmar_email;
    if (dados.lgpd)            document.getElementById('lgpd').checked          = true;
  } catch (e) {
    console.warn('Erro ao restaurar rascunho:', e);
  }
}

function limparRascunho() {
  sessionStorage.removeItem(RASCUNHO_KEY);
}

// ─────────────────────────────────────────
//  INICIALIZAÇÃO
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Restaura campos ao voltar (mesma aba) ou recarregar a página
  restaurarRascunho();

  // Salva a cada interação nos campos relevantes
  ['nome', 'email', 'confirmar_email', 'lgpd'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input',  salvarRascunho);
    el.addEventListener('change', salvarRascunho);
  });

  // ✅ CORREÇÃO PRINCIPAL: salva ANTES de sair da página
  // Cobre casos onde o link abre na mesma aba (mobile, etc.)
  window.addEventListener('beforeunload', salvarRascunho);

  // ✅ CORREÇÃO SECUNDÁRIA: intercepta cliques nos links dos termos
  // e força salvar antes de navegar (mesmo com target="_blank")
  document.querySelectorAll('a[href="termos.html"], a[href="LGPD.html"]').forEach(link => {
    link.addEventListener('click', salvarRascunho);
  });

  // ✅ CORREÇÃO TERCIÁRIA: restaura ao voltar via histórico do browser
  // (evento pageshow cobre bfcache — back/forward cache do navegador)
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      // Página veio do cache de navegação (back/forward)
      restaurarRascunho();
    }
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
    erroDiv.style.display = 'flex';
    throw new Error('Validação falhou');
  }

  const res = await fetch(`${API}/auth/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ nome, email, senha, telefone })
  });

  const data = await res.json();

  if (!res.ok) {
    erroDiv.innerHTML =
      `<strong>Atenção:</strong><ul style='margin-left:1rem;list-style-type:disc;margin-top:.5rem'>` +
      `<li>${data.erro || 'Erro ao cadastrar usuário.'}</li></ul>`;
    erroDiv.style.display = 'flex';
    throw new Error(data.erro || 'Erro ao cadastrar usuário.');
  }

  // Sucesso — apaga o rascunho salvo
  limparRascunho();
  return data;
}