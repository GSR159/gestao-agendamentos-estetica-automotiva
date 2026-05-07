// src/test/agendamentos.test.js
'use strict';

jest.mock('../config/db', () => require('./mocks/db'));

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const app     = require('../app');
const pool    = require('../config/db');

const SECRET = process.env.JWT_SECRET || 'segredo_super_forte';

const tokenAdmin = jwt.sign(
  { id: 1, tipo: 'admin', email: 'admin@test.com', cliente_id: null },
  SECRET, { expiresIn: '1d' }
);

function mockQuery(rows = [], rowCount = 1) {
  pool.query.mockResolvedValueOnce({ rows, rowCount });
}

beforeEach(() => jest.clearAllMocks());

describe('GET /agendamentos', () => {

  test('deve retornar 401 sem token', async () => {
    const res = await request(app).get('/agendamentos');
    expect(res.status).toBe(401);
  });

  test('deve listar agendamentos para admin', async () => {
    mockQuery([]);
    mockQuery([{ id: 1, cliente: 'João', veiculo: 'Corolla', servico: 'Lavagem', data: new Date(), status: 'pendente', funcionario: null, desconto_aniversario: false }]);

    const res = await request(app)
      .get('/agendamentos')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /agendamentos', () => {

  test('deve retornar 400 se campos obrigatórios faltarem', async () => {
    const res = await request(app)
      .post('/agendamentos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cliente_id: 1 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erro');
  });

  test('deve retornar 404 se serviço não existir', async () => {
    mockQuery([]);

    const res = await request(app)
      .post('/agendamentos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cliente_id: 1, veiculo_id: 1, servico_id: 999, data: '2030-01-01T10:00:00' });

    expect(res.status).toBe(404);
    expect(res.body.erro).toMatch(/serviço não encontrado/i);
  });

  test('deve retornar 400 se veículo não pertencer ao cliente', async () => {
    mockQuery([{ duracao_minutos: 60 }]);
    mockQuery([]);

    const res = await request(app)
      .post('/agendamentos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cliente_id: 1, veiculo_id: 99, servico_id: 1, data: '2030-01-01T10:00:00' });

    expect(res.status).toBe(400);
    expect(res.body.erro).toMatch(/não pertence/i);
  });

  test('deve criar agendamento com sucesso', async () => {
    mockQuery([{ duracao_minutos: 60 }]);
    mockQuery([{ id: 1 }]);
    mockQuery([]);
    mockQuery([{ id: 99, status: 'pendente', cliente_id: 1 }]);

    const res = await request(app)
      .post('/agendamentos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cliente_id: 1, veiculo_id: 1, servico_id: 1, data: '2030-06-15T10:00:00' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});

describe('PUT /agendamentos/:id', () => {

  test('deve retornar 400 com status inválido', async () => {
    const res = await request(app)
      .put('/agendamentos/1')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ status: 'invalido' });

    expect(res.status).toBe(400);
    expect(res.body.erro).toMatch(/status inválido/i);
  });

  test('deve retornar 404 se agendamento não existir', async () => {
    mockQuery([]);

    const res = await request(app)
      .put('/agendamentos/999')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ status: 'aprovado' });

    expect(res.status).toBe(404);
  });

  test('deve atualizar status com sucesso', async () => {
    mockQuery([{ id: 1, status: 'aprovado' }]);

    const res = await request(app)
      .put('/agendamentos/1')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ status: 'aprovado' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('aprovado');
  });
});

describe('DELETE /agendamentos/:id', () => {

  test('deve retornar 404 se agendamento não existir', async () => {
    mockQuery([]);

    const res = await request(app)
      .delete('/agendamentos/999')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(404);
  });

  test('deve deletar agendamento com sucesso', async () => {
    mockQuery([{ id: 1 }]);

    const res = await request(app)
      .delete('/agendamentos/1')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensagem');
  });
});