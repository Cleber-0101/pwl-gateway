import { Router } from 'express';
import { PaymentController } from './controllers/payment.controller';
import { GatewayConfig } from './interfaces/payment.interface';

/**
 * Configura as rotas para o módulo de pagamentos
 * @param config Configuração do gateway de pagamento
 * @returns Router do Express configurado
 */
export function setupPaymentRoutes(config: GatewayConfig): Router {
  const router = Router();
  const paymentController = new PaymentController(config);

  // Rota para processar pagamentos
  router.post('/process', (req, res) => paymentController.processPayment(req, res));

  // Rota para consultar status de pagamento
  router.get('/status/:id', (req, res) => paymentController.getPaymentStatus(req, res));

  // Rota para processar reembolsos
  router.post('/refund', (req, res) => paymentController.processRefund(req, res));

  // Rota para receber webhooks
  router.post('/webhook/:acquirer', (req, res) => paymentController.handleWebhook(req, res));

  return router;
}