import { api } from './api';
import { PaymentRequest, PaymentResponse, RefundRequest, RefundResponse } from '../types/payment.types';

export class PaymentService {
  /**
   * Processa um novo pagamento
   * @param paymentRequest Dados do pagamento
   * @returns Resposta do processamento do pagamento
   */
  static async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await api.post('/payments/process', paymentRequest);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Erro ao processar pagamento');
      }
      throw new Error('Erro ao conectar com o servidor de pagamentos');
    }
  }

  /**
   * Obtém o status de um pagamento
   * @param transactionId ID da transação
   * @returns Status do pagamento
   */
  static async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    try {
      const response = await api.get(`/payments/status/${transactionId}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Erro ao obter status do pagamento');
      }
      throw new Error('Erro ao conectar com o servidor de pagamentos');
    }
  }

  /**
   * Processa um reembolso
   * @param refundRequest Dados do reembolso
   * @returns Resposta do processamento do reembolso
   */
  static async processRefund(refundRequest: RefundRequest): Promise<RefundResponse> {
    try {
      const response = await api.post('/payments/refund', refundRequest);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Erro ao processar reembolso');
      }
      throw new Error('Erro ao conectar com o servidor de pagamentos');
    }
  }
}