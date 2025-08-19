import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';

// Rotas
import { setupPaymentRoutes } from './modules/payments/routes';
import { setupAuthRoutes } from './modules/auth/routes';
// Módulos ainda não implementados
// import memberRoutes from './modules/members/routes';
// import productRoutes from './modules/products/routes';
// import reportRoutes from './modules/reports/routes';

// Configuração
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Configuração do gateway
const gatewayConfig = {
  acquirers: [],
  retryAttempts: 3,
  retryDelay: 1000,
  defaultCurrency: 'BRL',
  webhookSecret: process.env.WEBHOOK_SECRET || 'secret'
};

// Rotas
app.use('/auth', setupAuthRoutes());
app.use('/api/payments', setupPaymentRoutes(gatewayConfig));
// Módulos ainda não implementados
// app.use('/api/members', memberRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/reports', reportRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'PWL Gateway API', 
    version: '1.0.0',
    endpoints: {
      health: '/health',
      payments: '/api/payments'
    }
  });
});

// Rota de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Middleware de erro
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;