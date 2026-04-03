## 🚀 Como rodar o projeto

### 1. Criar banco no PostgreSQL
Crie um banco vazio (ex: estetica_db)

### 2. Executar o script do banco
No terminal:

psql -U postgres -d estetica_db -f database/database.sql

OU via pgAdmin:
- abrir Query Tool
- rodar o arquivo database.sql

### 3. Rodar o backend

npm install
node server.js

### 4. Abrir o frontend

Abrir o arquivo login.html