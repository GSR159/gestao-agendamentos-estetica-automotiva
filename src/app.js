const express = require('express');
const cors = require('cors');
const app = express();
const clienteRoutes = require('./routes/ClienteRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
const clienteAreaRoutes = require('./routes/clienteAreaRoutes');


app.use(cors());
app.use(express.json());

app.use('/clientes', clienteRoutes);
app.use('/veiculos', veiculoRoutes);
app.use('/servicos', servicoRoutes);
app.use('/agendamentos', agendamentoRoutes);
app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/relatorios',relatorioRoutes);
app.use('/cliente', clienteAreaRoutes);

module.exports = app;