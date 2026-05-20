const express    = require('express');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const helmet     = require('helmet');
const app        = express();

const clienteRoutes     = require('./routes/clienteRoutes');
const veiculoRoutes     = require('./routes/veiculoRoutes');
const servicoRoutes     = require('./routes/servicoRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const authRoutes        = require('./routes/authRoutes');
const usuarioRoutes     = require('./routes/usuarioRoutes');
const relatorioRoutes   = require('./routes/relatorioRoutes');
const clienteAreaRoutes = require('./routes/clienteAreaRoutes');
const funcionarioRoutes = require('./routes/funcionarioRoutes');
const agendaRoutes = require('./routes/agendaRoutes')


app.use(helmet());

// Necessário para rate limit funcionar corretamente atrás de proxy reverso (Render, Railway, etc.)
app.set('trust proxy', 1);

//
const allowedOrigins = (process.env.FRONT_URL || 'http://127.0.0.1:5500')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin apenas em dv
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Origem não permitida pelo CORS'));
  },
  credentials: true,
}));

// Rate limiting global (proteção contra DDoS)
const limiterGlobal = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas requisições. Tente novamente em 15 minutos.' },
});
app.use(limiterGlobal);

// Rate limiting agressivo para auth
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.' },
});

app.use(express.json({ limit: '10kb' })); 

// Rotas 
app.use('/clientes',     clienteRoutes);
app.use('/veiculos',     veiculoRoutes);
app.use('/servicos',     servicoRoutes);
app.use('/agendamentos', agendamentoRoutes);
app.use('/auth',         limiterAuth, authRoutes);
app.use('/usuarios',     usuarioRoutes);
app.use('/relatorios',   relatorioRoutes);
app.use('/cliente',      clienteAreaRoutes);
app.use('/funcionarios', funcionarioRoutes);
app.use('/agenda', agendaRoutes);

// ─── Handler de erro global ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERRO]', err.message);
  if (err.message === 'Origem não permitida pelo CORS') {
    return res.status(403).json({ erro: 'Origem não permitida.' });
  }
  res.status(500).json({ erro: 'Erro interno no servidor.' });
});

module.exports = app;