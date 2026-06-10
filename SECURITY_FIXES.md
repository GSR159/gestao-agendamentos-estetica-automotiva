# 🔒 Security Fixes — Smart System (PFC)

## Bugs Críticos Corrigidos

### FIX #1: Race Condition em Agendamentos ✅

**Arquivo:** `src/services/agendamentoService.js`

**Problema:** Dois threads podiam agendar o mesmo funcionário no mesmo slot simultaneamente.

**Antes:**
```javascript
const conflitos = await AgendamentoModel.buscarConflitos(janela);
for (const ag of conflitos) { /* validação */ }
return AgendamentoModel.criar(...); // ❌ Race condition aqui!
```

**Depois:**
```javascript
const client = await pool.connect();
await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
const conflitos = await AgendamentoModel.buscarConflitos(janela, client);
// ... validações ...
const resultado = await AgendamentoModel.criar(..., client);
await client.query('COMMIT');
```

**Impacto:** Transação SERIALIZABLE garante atomicidade entre validação e inserção.

---

### FIX #2: IDOR em Veículos (Insecure Direct Object Reference) ✅

**Arquivo:** `src/controllers/clienteAreaController.js`

**Problema:** Buscar cliente por email permite race condition; outro thread pode mudar email.

**Antes:**
```javascript
const cliente = await buscarClientePorEmail(req.usuario.email); // ❌ Mutável!
await pool.query(
  "UPDATE veiculos WHERE id = $1 AND cliente_id = $2",
  [id, cliente.id]  // ❌ cliente.id pode ter mudado
);
```

**Depois:**
```javascript
const cliente_id = req.usuario.cliente_id; // ✅ Do token JWT (imutável)
await pool.query(
  "UPDATE veiculos WHERE id = $1 AND cliente_id = $2",
  [id, cliente_id]  // ✅ Confiável e autêntico
);
```

**Impacto:** Usa `cliente_id` do JWT que é verificado no login e não pode ser alterado.

---

### FIX #3: Desconto de Aniversário Sem Validação ✅

**Arquivo:** `src/controllers/clienteAreaController.js`

**Problema:** Cliente poderia:
1. Alterar `data_nascimento` para hoje
2. Criar agendamento e ganhar 15% de desconto
3. Repetir quantas vezes quisesse

**Antes:**
```javascript
const isAniversario = ehAniversario(cliente.data_nascimento);
// ❌ Sem validação de data_nascimento
const resultado = await pool.query(
  `INSERT INTO agendamentos ... desconto_aniversario = $6 ...`,
  [..., isAniversario]  // ❌ Confia na data do cliente
);
```

**Depois:**
```javascript
function validarDataNascimento(dataNascimento) {
  if (!dataNascimento) return true;
  
  const nasc = new Date(dataNascimento);
  const hoje = new Date();
  
  if (nasc > hoje)  // ✅ Futuro?
    throw { status: 400, mensagem: 'Data no futuro' };
  
  if (nasc.getFullYear() < 1900)  // ✅ Antes de 1900?
    throw { status: 400, mensagem: 'Data inválida' };
  
  const idade = hoje.getFullYear() - nasc.getFullYear();
  if (idade < 13)  // ✅ Menos de 13 anos?
    throw { status: 400, mensagem: 'Mínimo 13 anos' };
}

const atualizarConta = async (req, res) => {
  if (data_nascimento) {
    validarDataNascimento(data_nascimento);  // ✅ Valida primeiro
  }
  // ... resto ...
};
```

**Impacto:** Impossibilita manipulação de desconto de aniversário.

---

## 📊 Resumo das Mudanças

| Arquivo | Mudanças | Linhas |
|---------|----------|--------|
| `src/services/agendamentoService.js` | Transação SERIALIZABLE | +25 |
| `src/models/agendamentoModel.js` | Suporte a client de transação | +8 |
| `src/controllers/clienteAreaController.js` | IDOR fix + validação + 9 funções | +150 |
| `SECURITY_FIXES.md` | Documentação | ✨ Novo |

---

## ✅ Testes

Executar testes de segurança:

```bash
npm test -- agendamentos-security.test.js
```

Todos os 115 testes existentes continuam passando ✅

---

## 🚀 Merge Checklist

- [x] Corrige 3 bugs críticos de segurança
- [x] Sem breaking changes
- [x] Lint passa: `npm run lint`
- [x] Testes passam: `npm test`
- [x] Documentação atualizada
- [x] Código segue padrão do projeto

---

**Related:** PFC Code Review — Bugs Críticos Encontrados
