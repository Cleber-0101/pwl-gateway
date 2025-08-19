import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { PaymentRequest, RefundRequest, GatewayConfig } from '../interfaces/payment.interface';
import { validatePaymentRequest, validateRefundRequest } from '../utils/validators';

/**
 * Controlador para as rotas de pagamento
 */
export class PaymentController {
  private paymentService: PaymentService;

  constructor(config: GatewayConfig) {
    this.paymentService = new PaymentService(config);
  }

  /**
   * Processa uma nova transação de pagamento
   */
  async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentRequest: PaymentRequest = req.body;

      // Valida a requisição
      const validationError = validatePaymentRequest(paymentRequest);
      if (validationError) {
        res.status(400).json({ error: true, message: validationError });
        return;
      }

      // Processa o pagamento
      const result = await this.paymentService.processPayment(paymentRequest);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      res.status(500).json({
        error: true,
        message: error.message || 'Erro interno ao processar pagamento'
      });
    }
  }

  /**
   * Consulta o status de uma transação
   */
  async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: true, message: 'ID da transação é obrigatório' });
        return;
      }

      const result = await this.paymentService.getPaymentStatus(id);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erro ao consultar status do pagamento:', error);
      res.status(error.message.includes('não encontrada') ? 404 : 500).json({
        error: true,
        message: error.message || 'Erro interno ao consultar status do pagamento'
      });
    }
  }

  /**
   * Processa um reembolso
   */
  async processRefund(req: Request, res: Response): Promise<void> {
    try {
      const refundRequest: RefundRequest = req.body;

      // Valida a requisição
      const validationError = validateRefundRequest(refundRequest);
      if (validationError) {
        res.status(400).json({ error: true, message: validationError });
        return;
      }

      // Processa o reembolso
      const result = await this.paymentService.processRefund(refundRequest);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erro ao processar reembolso:', error);
      res.status(500).json({
        error: true,
        message: error.message || 'Erro interno ao processar reembolso'
      });
    }
  }

  /**
   * Processa notificações de webhook
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { acquirer } = req.params;
      const webhookData = req.body;

      if (!acquirer) {
        res.status(400).json({ error: true, message: 'Adquirente não especificado' });
        return;
      }

      // Processa o webhook
      await this.paymentService.processWebhook(acquirer, webhookData);

      // Responde com sucesso para o adquirente
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Erro ao processar webhook:', error);
      // Mesmo em caso de erro, respondemos com 200 para evitar retentativas desnecessárias
      res.status(200).json({
        received: true,
        processed: false,
        error: error.message
      });
    }
  }
}