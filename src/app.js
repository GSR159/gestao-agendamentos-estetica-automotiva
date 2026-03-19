const express = require('express');
const cors = require('cors');

const clienteRoutes = require('./routes/ClienteRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API da estética rodando 🚀');
});

app.use('/clientes', clienteRoutes);
app.use('/veiculos', veiculoRoutes);
app.use('/servicos', servicoRoutes);
app.use('/agendamentos', agendamentoRoutes);

module.exports = app;