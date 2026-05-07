// src/test/auth.test.js
'use strict';

jest.mock('../config/db', () => require('./mocks/db'));

const request = require('supertest');
const app     = require('../app');
const pool    = require('../config/db');

function mockQuery(rows = [], rowCount = 1) {
  pool.query.mockResolvedValueOnce({ rows, rowCount });
}

beforeEach(() => jest.clearAllMocks());

// ============================================================
//  POST /auth/register
// ============================================================
describe('POST /auth/register', () => {

  test('deve retornar 400 se campos obrigatórios faltarem', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'teste@email.com' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erro');
  });

  test('deve retornar 400 se email já estiver cadastrado', async () => {
    mockQuery([{ id: 1 }]);

    const res = await request(app)
      .post('/auth/register')
      .send({ nome: 'João', email: 'joao@email.com', senha: 'Senha@123' });

    expect(res.status).toBe(400);
    expect(res.body.erro).toMatch(/já cadastrado/i);
  });

  test('deve criar usuário e retornar 201', async () => {
    mockQuery([]);
    mockQuery([{ id: 5 }]);
    mockQuery([]);

    const res = await request(app)
      .post('/auth/register')
      .send({ nome: 'Maria', email: 'maria@email.com', senha: 'Senha@123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('mensagem');
  });
});

// ============================================================
//  POST /auth/login
// ============================================================
describe('POST /auth/login', () => {

  test('deve retornar 400 se campos faltarem', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'teste@email.com' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erro');
  });

  test('deve retornar 401 se usuário não existir', async () => {
    mockQuery([]);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'naoexiste@email.com', senha: 'Qualquer1@' });

    expect(res.status).toBe(401);
    expect(res.body.erro).toMatch(/não encontrado/i);
  });

  test('deve retornar 401 se email não confirmado', async () => {
    const bcrypt = require('bcrypt');
    const hash   = await bcrypt.hash('Senha@123', 10);

    mockQuery([{ id: 1, email: 'x@x.com', senha: hash, tipo: 'cliente', email_confirmado: false }]);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'x@x.com', senha: 'Senha@123' });

    expect(res.status).toBe(401);
    expect(res.body.erro).toMatch(/confirme seu email/i);
  });

  test('deve retornar 401 com senha errada', async () => {
    const bcrypt = require('bcrypt');
    const hash   = await bcrypt.hash('SenhaCorreta@1', 10);

    mockQuery([{ id: 1, email: 'x@x.com', senha: hash, tipo: 'cliente', email_confirmado: true }]);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'x@x.com', senha: 'SenhaErrada@1' });

    expect(res.status).toBe(401);
    expect(res.body.erro).toMatch(/senha inválida/i);
  });

  test('deve retornar token JWT com login válido', async () => {
    const bcrypt = require('bcrypt');
    const hash   = await bcrypt.hash('Senha@123', 10);

    mockQuery([{ id: 1, email: 'ok@ok.com', senha: hash, tipo: 'cliente', email_confirmado: true }]);
    mockQuery([{ id: 10 }]);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'ok@ok.com', senha: 'Senha@123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});

// ============================================================
//  GET /auth/confirmar-email
// ============================================================
describe('GET /auth/confirmar-email', () => {

  test('deve retornar 400 sem token', async () => {
    const res = await request(app).get('/auth/confirmar-email');
    expect(res.status).toBe(400);
  });

  test('deve retornar 400 com token inválido', async () => {
    mockQuery([]);
    const res = await request(app).get('/auth/confirmar-email?token=invalido');
    expect(res.status).toBe(400);
    expect(res.body.erro).toMatch(/inválido/i);
  });

  test('deve confirmar email com token válido', async () => {
    const expira = new Date(Date.now() + 60 * 60 * 1000);
    mockQuery([{ id: 1, email_confirmado: false, token_expira_em: expira }]);
    mockQuery([]);

    const res = await request(app).get('/auth/confirmar-email?token=tokenvalido123');
    expect(res.status).toBe(200);
    expect(res.body.mensagem).toMatch(/confirmado/i);
  });

  test('deve retornar 400 com token expirado', async () => {
    const expirado = new Date(Date.now() - 1000);
    mockQuery([{ id: 1, email_confirmado: false, token_expira_em: expirado }]);

    const res = await request(app).get('/auth/confirmar-email?token=tokenexpirado');
    expect(res.status).toBe(400);
    expect(res.body.erro).toMatch(/expirado/i);
  });
});