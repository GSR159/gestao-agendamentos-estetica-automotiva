/**
 * completar-perfil.js
 * ─────────────────────────────────────────────────────────────
 * Exibe um modal de conclusão de cadastro quando o cliente faz
 * login pela primeira vez (perfil_completo = false).
 * Inclui integração com ViaCEP para autopreenchimento de endereço.
 *
 * Como usar: adicione <script src="completar-perfil.js"></script>
 * em tela_cliente.html APÓS auth.js e config.js.
 * A função init() é chamada automaticamente.
 * ─────────────────────────────────────────────────────────────
 */

(function () {

  // ── Injeta estilos do modal ──────────────────────────────────
  function injetarEstilos() {
    if (document.getElementById('cp-styles')) return;
    const style = document.createElement('style');
    style.id = 'cp-styles';
    style.textContent = `
      #cp-overlay {
        position: fixed; inset: 0; z-index: 8000;
        background: rgba(2,6,23,0.92);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        padding: 1rem;
        animation: cpFadeIn 0.3s ease;
      }

      @keyframes cpFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      #cp-box {
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 1.5rem;
        padding: 2rem 2rem 1.5rem;
        width: 100%; max-width: 560px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 30px 80px rgba(0,0,0,0.7);
        animation: cpSlide 0.35s cubic-bezier(0.34,1.56,0.64,1);
      }

      @keyframes cpSlide {
        from { opacity: 0; transform: scale(0.93) translateY(16px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }

      .cp-titulo {
        font-size: 1.25rem; font-weight: 800;
        color: #f8fafc; margin-bottom: 0.25rem;
      }

      .cp-subtitulo {
        font-size: 0.875rem; color: #64748b;
        margin-bottom: 1.5rem; line-height: 1.5;
      }

      .cp-secao {
        font-size: 0.7rem; font-weight: 700;
        color: #3b82f6; text-transform: uppercase;
        letter-spacing: 0.08em; margin: 1.25rem 0 0.75rem;
      }

      .cp-grid {
        display: grid; gap: 0.75rem;
      }

      .cp-grid-2 { grid-template-columns: 1fr 1fr; }
      .cp-grid-3 { grid-template-columns: 1fr 1fr 1fr; }

      .cp-label {
        display: block;
        font-size: 0.7rem; font-weight: 700;
        color: #64748b; text-transform: uppercase;
        letter-spacing: 0.05em; margin-bottom: 0.35rem;
      }

      .cp-input {
        background: #1e293b;
        border: 1px solid #334155;
        color: #f8fafc;
        border-radius: 0.65rem;
        padding: 0.6rem 0.875rem;
        font-size: 0.875rem; outline: none;
        width: 100%; box-sizing: border-box;
        transition: border-color 0.2s;
        font-family: inherit;
      }

      .cp-input:focus { border-color: #3b82f6; }
      .cp-input::placeholder { color: #475569; }
      .cp-input:disabled { opacity: 0.5; cursor: not-allowed; }

      /* CEP com botão inline */
      .cp-cep-wrapper { position: relative; }
      .cp-cep-wrapper .cp-input { padding-right: 6rem; }

      .cp-btn-cep {
        position: absolute; right: 0.4rem; top: 50%;
        transform: translateY(-50%);
        background: #1d4ed8; color: white;
        border: none; border-radius: 0.5rem;
        padding: 0.3rem 0.75rem;
        font-size: 0.75rem; font-weight: 700;
        cursor: pointer; transition: background 0.2s;
      }
      .cp-btn-cep:hover { background: #2563eb; }
      .cp-btn-cep:disabled { opacity: 0.5; cursor: wait; }

      .cp-cep-status {
        font-size: 0.72rem; margin-top: 0.3rem;
        min-height: 1rem;
      }
      .cp-cep-ok  { color: #22c55e; }
      .cp-cep-err { color: #ef4444; }

      .cp-rodape {
        display: flex; gap: 0.75rem;
        margin-top: 1.75rem; padding-top: 1.25rem;
        border-top: 1px solid #1e293b;
      }

      .cp-btn-pular {
        flex: 1; padding: 0.7rem;
        border-radius: 0.75rem;
        border: 1px solid #334155;
        background: transparent; color: #64748b;
        font-weight: 700; font-size: 0.875rem;
        cursor: pointer; transition: all 0.2s;
        font-family: inherit;
      }
      .cp-btn-pular:hover { color: #f8fafc; border-color: #475569; }

      .cp-btn-salvar {
        flex: 2; padding: 0.7rem;
        border-radius: 0.75rem; border: none;
        background: #3b82f6; color: white;
        font-weight: 700; font-size: 0.875rem;
        cursor: pointer; transition: all 0.2s;
        font-family: inherit;
      }
      .cp-btn-salvar:hover { background: #2563eb; }
      .cp-btn-salvar:disabled { opacity: 0.6; cursor: wait; }

      .cp-lgpd {
        font-size: 0.7rem; color: #475569;
        text-align: center; margin-top: 0.75rem;
        line-height: 1.5;
      }

      /* Banner de aniversário */
      #cp-banner-aniversario {
        display: none;
        background: linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06));
        border: 1px solid rgba(251,191,36,0.3);
        border-radius: 1rem;
        padding: 1rem 1.25rem;
        margin-bottom: 1.5rem;
        text-align: center;
      }

      #cp-banner-aniversario .cp-aniv-emoji { font-size: 2rem; margin-bottom: 0.5rem; }
      #cp-banner-aniversario .cp-aniv-titulo {
        font-size: 1rem; font-weight: 800; color: #fbbf24; margin-bottom: 0.25rem;
      }
      #cp-banner-aniversario .cp-aniv-desc {
        font-size: 0.8rem; color: #92400e; color: #d97706;
      }

      @media (max-width: 520px) {
        .cp-grid-2, .cp-grid-3 { grid-template-columns: 1fr; }
        #cp-box { padding: 1.5rem 1.25rem 1.25rem; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Cria o HTML do modal ─────────────────────────────────────
  function criarModal() {
    const div = document.createElement('div');
    div.id = 'cp-overlay';
    div.innerHTML = `
      <div id="cp-box">

        <!-- Banner de aniversário (oculto por padrão) -->
        <div id="cp-banner-aniversario">
          <div class="cp-aniv-emoji">🎂</div>
          <div class="cp-aniv-titulo">Feliz Aniversário!</div>
          <div class="cp-aniv-desc">
            No seu próximo agendamento você ganha <strong>15% de desconto</strong> + um brinde especial!
          </div>
        </div>

        <div class="cp-titulo">Complete o seu cadastro</div>
        <p class="cp-subtitulo">
          Precisamos de mais alguns dados para personalizar o seu atendimento.
          Todos os dados são protegidos pela <strong style="color:#94a3b8">LGPD</strong>.
        </p>

        <!-- Dados pessoais -->
        <div class="cp-secao">📋 Dados Pessoais</div>
        <div class="cp-grid cp-grid-2">
          <div>
            <label class="cp-label">Telefone *</label>
            <input id="cp-telefone" class="cp-input" type="tel" placeholder="(11) 99999-9999">
          </div>
          <div>
            <label class="cp-label">Data de Nascimento *</label>
            <input id="cp-nascimento" class="cp-input" type="date"
                   max="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>

        <!-- Endereço -->
        <div class="cp-secao">📍 Endereço</div>

        <!-- CEP com ViaCEP -->
        <div style="margin-bottom:0.75rem">
          <label class="cp-label">CEP *</label>
          <div class="cp-cep-wrapper">
            <input id="cp-cep" class="cp-input" type="text"
                   placeholder="00000-000" maxlength="9"
                   oninput="window._cpFormatarCEP(this)">
            <button class="cp-btn-cep" onclick="window._cpBuscarCEP()">Buscar</button>
          </div>
          <div id="cp-cep-status" class="cp-cep-status"></div>
        </div>

        <div class="cp-grid cp-grid-3" style="margin-bottom:0.75rem">
          <div style="grid-column: span 2">
            <label class="cp-label">Logradouro (Rua/Av.) *</label>
            <input id="cp-logradouro" class="cp-input" placeholder="Rua das Flores">
          </div>
          <div>
            <label class="cp-label">Número</label>
            <input id="cp-numero" class="cp-input" placeholder="123">
          </div>
        </div>

        <div class="cp-grid cp-grid-3">
          <div>
            <label class="cp-label">Complemento</label>
            <input id="cp-complemento" class="cp-input" placeholder="Apto 4B">
          </div>
          <div>
            <label class="cp-label">Bairro</label>
            <input id="cp-bairro" class="cp-input" placeholder="Centro">
          </div>
          <div>
            <label class="cp-label">Cidade *</label>
            <input id="cp-cidade" class="cp-input" placeholder="São Paulo">
          </div>
        </div>

        <div style="margin-top:0.75rem; max-width: 120px">
          <label class="cp-label">Estado *</label>
          <input id="cp-estado" class="cp-input" placeholder="SP" maxlength="2"
                 oninput="this.value=this.value.toUpperCase()">
        </div>

        <div class="cp-rodape">
          <button class="cp-btn-pular" onclick="window._cpPular()">Pular por agora</button>
          <button class="cp-btn-salvar" id="cp-btn-salvar" onclick="window._cpSalvar()">
            Salvar e continuar
          </button>
        </div>

        <p class="cp-lgpd">
          🔒 Seus dados são armazenados com segurança e não serão compartilhados.
          Você pode removê-los a qualquer momento em "Minha Conta".
        </p>
      </div>
    `;
    document.body.appendChild(div);
  }

  // ── Formata CEP enquanto digita ──────────────────────────────
  window._cpFormatarCEP = function (input) {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8);
    input.value = v;
  };

  // ── Busca CEP na API ViaCEP ──────────────────────────────────
  window._cpBuscarCEP = async function () {
    const cep     = document.getElementById('cp-cep').value.replace(/\D/g, '');
    const status  = document.getElementById('cp-cep-status');
    const btnCep  = document.querySelector('.cp-btn-cep');

    if (cep.length !== 8) {
      status.textContent = 'Digite um CEP válido com 8 dígitos.';
      status.className   = 'cp-cep-status cp-cep-err';
      return;
    }

    btnCep.disabled    = true;
    btnCep.textContent = '...';
    status.textContent = 'Buscando...';
    status.className   = 'cp-cep-status';

    try {
      const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();

      if (data.erro) {
        status.textContent = 'CEP não encontrado. Verifique e tente novamente.';
        status.className   = 'cp-cep-status cp-cep-err';
        return;
      }

      // Preenche os campos automaticamente
      document.getElementById('cp-logradouro').value  = data.logradouro  || '';
      document.getElementById('cp-bairro').value      = data.bairro      || '';
      document.getElementById('cp-cidade').value      = data.localidade  || '';
      document.getElementById('cp-estado').value      = data.uf          || '';
      document.getElementById('cp-complemento').value = data.complemento || '';

      status.textContent = `✓ ${data.localidade} — ${data.uf}`;
      status.className   = 'cp-cep-status cp-cep-ok';

      // Foca no número após preencher
      document.getElementById('cp-numero').focus();

    } catch (err) {
      status.textContent = 'Erro ao buscar CEP. Tente novamente.';
      status.className   = 'cp-cep-status cp-cep-err';
    } finally {
      btnCep.disabled    = false;
      btnCep.textContent = 'Buscar';
    }
  };

  // Busca ao pressionar Enter no campo CEP
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.activeElement?.id === 'cp-cep') {
      window._cpBuscarCEP();
    }
  });

  // ── Pular cadastro ───────────────────────────────────────────
  window._cpPular = function () {
    const overlay = document.getElementById('cp-overlay');
    if (overlay) overlay.remove();
  };

  // ── Salvar perfil ────────────────────────────────────────────
  window._cpSalvar = async function () {
    const btn = document.getElementById('cp-btn-salvar');

    const telefone       = document.getElementById('cp-telefone').value.trim();
    const data_nascimento = document.getElementById('cp-nascimento').value;
    const cep            = document.getElementById('cp-cep').value.trim();
    const logradouro     = document.getElementById('cp-logradouro').value.trim();
    const numero         = document.getElementById('cp-numero').value.trim();
    const complemento    = document.getElementById('cp-complemento').value.trim();
    const bairro         = document.getElementById('cp-bairro').value.trim();
    const cidade         = document.getElementById('cp-cidade').value.trim();
    const estado         = document.getElementById('cp-estado').value.trim();

    // Validações mínimas
    if (!telefone || !data_nascimento || !cep || !logradouro || !cidade || !estado) {
      if (typeof toast !== 'undefined') {
        toast.aviso('Preencha os campos obrigatórios (*) antes de continuar.');
      } else {
        alert('Preencha os campos obrigatórios.');
      }
      return;
    }

    btn.disabled    = true;
    btn.textContent = 'Salvando...';

    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${window.API}/cliente/minha-conta`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ telefone, data_nascimento, cep, logradouro, numero, complemento, bairro, cidade, estado })
      });

      const data = await res.json();

      if (!res.ok) {
        if (typeof toast !== 'undefined') toast.erro(data.erro ?? 'Erro ao salvar dados.');
        else alert(data.erro ?? 'Erro ao salvar dados.');
        return;
      }

      if (typeof toast !== 'undefined') toast.sucesso('Cadastro concluído com sucesso! 🎉');

      // Fecha modal
      const overlay = document.getElementById('cp-overlay');
      if (overlay) overlay.remove();

      // Recarrega informações da conta se a função existir
      if (typeof preencherInfoConta === 'function') preencherInfoConta();

    } catch (err) {
      console.error(err);
      if (typeof toast !== 'undefined') toast.erro('Erro de conexão. Tente novamente.');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Salvar e continuar';
    }
  };

  // ── Banner de aniversário ────────────────────────────────────
  function mostrarBannerAniversario() {
    const banner = document.getElementById('cp-banner-aniversario');
    if (banner) banner.style.display = 'block';
  }

  // ── Verificar se precisa mostrar o modal ─────────────────────
  async function verificarPerfil() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res  = await fetch(`${window.API}/cliente/minha-conta`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;

      const conta = await res.json();

      // Mostra banner de aniversário em qualquer caso
      if (conta.aniversario_hoje) {
        // Se o modal for aberto, mostra lá dentro
        // Senão, mostra como toast
        if (!conta.perfil_completo) {
          // vai mostrar no modal abaixo
        } else if (typeof toast !== 'undefined') {
          toast.sucesso(
            '🎂 Feliz Aniversário! Seu próximo agendamento tem 15% de desconto + brinde!',
            { duracao: 8000, titulo: 'Parabéns! 🎉' }
          );
        }
      }

      // Só abre modal se perfil incompleto
      if (conta.perfil_completo) return;

      injetarEstilos();
      criarModal();

      if (conta.aniversario_hoje) mostrarBannerAniversario();

    } catch (err) {
      console.warn('Erro ao verificar perfil:', err);
    }
  }

  // ── Init — aguarda o DOM estar pronto ───────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verificarPerfil);
  } else {
    // DOM já carregado, aguarda 800ms para o auth.js terminar
    setTimeout(verificarPerfil, 800);
  }

})();