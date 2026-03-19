const express = require('express');
const app = express();

const clienteRoutes = require('./routes/ClienteRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');

app.use(express.json());

app.use('/clientes', clienteRoutes);
app.use('/veiculos', veiculoRoutes);
app.use('/servicos', servicoRoutes);
app.use('/agendamentos', agendamentoRoutes);

module.exports = app;