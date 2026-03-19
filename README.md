[Uploading README.md…]()
# 🚗 Sistema de Agendamento para Estética Automotiva

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Node](https://img.shields.io/badge/Node.js-18+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![License](https://img.shields.io/badge/license-Acad%C3%AAmico-lightgrey)

---

## 📌 Sobre o Projeto

Este projeto consiste no desenvolvimento de um sistema backend para gerenciamento de agendamentos em uma estética automotiva.

O sistema permite o controle de clientes, veículos, serviços e agendamentos, garantindo organização operacional e evitando conflitos de horários.

Este projeto está sendo desenvolvido como Trabalho de Conclusão de Curso (TCC) em Engenharia de Software.

---

## 🎯 Objetivos do Sistema

- Gerenciar clientes e veículos
- Controlar serviços oferecidos
- Realizar agendamentos
- Evitar conflitos de horários automaticamente
- Estruturar base para dashboard e automações futuras

---

## 🛠️ Tecnologias Utilizadas

- **Node.js**
- **Express**
- **PostgreSQL**
- **pgAdmin**
- **Git & GitHub**
- *(Futuro)* MQTT + Node-RED
- *(Futuro)* Frontend Web

---

## 📂 Estrutura do Projeto

```
backend/
│
├── controllers/
├── routes/
├── models/
├── database/
│
├── app.js
└── server.js
```

---

## 🗄️ Banco de Dados

O sistema utiliza PostgreSQL com as seguintes tabelas principais:

- `clientes`
- `veiculos`
- `servicos`
- `agendamentos`

### Exemplo: tabela de agendamentos

```sql
CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    veiculo_id INTEGER REFERENCES veiculos(id),
    servico_id INTEGER REFERENCES servicos(id),
    data TIMESTAMP,
    status VARCHAR(50)
);
```

---

## 🔌 Funcionalidades Implementadas

- ✔️ Cadastro de veículos  
- ✔️ Cadastro de serviços  
- ✔️ Cadastro de agendamentos  
- ✔️ Validação de conflitos de horário  
- ✔️ API REST estruturada  
- ✔️ Integração com PostgreSQL  

---

## ⚙️ Como Executar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

- Instale o PostgreSQL
- Crie o banco de dados
- Execute os scripts SQL

### 4. Configure o arquivo `.env`

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=estetica_automotiva
DB_PORT=5432
PORT=3000
```

### 5. Inicie o servidor

```bash
npm run dev
```

ou

```bash
node server.js
```

---

## 🌐 Endpoints da API

### Veículos

- `GET /veiculos`
- `GET /veiculos/:id`
- `POST /veiculos`

### Serviços

- `GET /servicos`
- `POST /servicos`

### Agendamentos

- `GET /agendamentos`
- `POST /agendamentos`

---

## ⚠️ Observações Técnicas

- O backend trabalha com datas em **UTC**
- A conversão de horário será tratada no frontend
- A validação de conflitos de agendamento já está implementada

---

## 🚀 Roadmap

- 🔹 Desenvolvimento do frontend
- 🔹 Dashboard administrativo
- 🔹 Integração com MQTT
- 🔹 Notificações em tempo real
- 🔹 Autenticação de usuários

---

## 👨‍💻 Autor

**Guilherme Rocha**  
Estudante de Engenharia de Software

---

## 📄 Licença

Este projeto é de caráter acadêmico e educacional.
