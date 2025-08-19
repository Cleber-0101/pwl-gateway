import axios, { AxiosInstance } from 'axios';
import {
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  PaymentMethod,
  TransactionStatus,
  MercadoPagoConfig
} from '../interfaces/payment.interface';

/**
 * Serviço para integração com o Mercado Pago
 */
export class MercadoPagoService {
  private client: AxiosInstance;
  private config: MercadoPagoConfig;

  constructor(config: MercadoPagoConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.apiUrl || 'https://api.mercadopago.com/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${config.accessToken}`
      }
    });
  }

  /**
   * Mapeia uma requisição de pagamento para o formato do Mercado Pago
   */
  private mapPaymentRequest(request: PaymentRequest): any {
    // Dados básicos da transação
    const mpRequest: any = {
      transaction_amount: request.amount,
      description: request.description || 'Compra online',
      external_reference: request.orderId,
      notification_url: this.config.webhookUrl,
      payer: {
        email: request.customer.email,
        identification: {
          type: request.customer.document.length > 11 ? 'CNPJ' : 'CPF',
          number: request.customer.document
        },
        first_name: request.customer.name.split(' ')[0],
        last_name: request.customer.name.split(' ').slice(1).join(' ') || ' '
      }
    };

    // Adiciona endereço de cobrança se existir
    if (request.billingAddress) {
      mpRequest.payer.address = {
        street_name: request.billingAddress.street,
        street_number: request.billingAddress.number,
        zip_code: request.billingAddress.zipCode,
        neighborhood: request.billingAddress.neighborhood || '',
        city: request.billingAddress.city,
        federal_unit: request.billingAddress.state
      };
    }

    // Configura o método de pagamento específico
    switch (request.paymentMethod) {
      case PaymentMethod.CREDIT_CARD:
        mpRequest.payment_method_id = 'credit_card';
        mpRequest.token = request.creditCard!.token || ''; // Normalmente o token é gerado pelo frontend do MP
        mpRequest.installments = request.creditCard!.installments || 1;
        
        // Se não tiver token (que é o caso mais comum quando vem de outro gateway)
        // precisamos criar um token com os dados do cartão
        if (!mpRequest.token && request.creditCard) {
          // Nota: Na prática, seria necessário usar o SDK do Mercado Pago no frontend
          // para gerar o token do cartão, pois a API direta não aceita dados do cartão
          // por questões de segurança PCI DSS
          console.warn('Mercado Pago requer token de cartão gerado pelo frontend');
        }
        break;

      case PaymentMethod.PIX:
        mpRequest.payment_method_id = 'pix';
        mpRequest.payment_type_id = 'bank_transfer';
        break;

      case PaymentMethod.BOLETO:
        mpRequest.payment_method_id = 'bolbradesco';
        mpRequest.payment_type_id = 'ticket';
        break;

      default:
        throw new Error(`Método de pagamento não suportado no Mercado Pago: ${request.paymentMethod}`);
    }

    return mpRequest;
  }

  /**
   * Mapeia uma resposta do Mercado Pago para o formato padrão da aplicação
   */
  private mapPaymentResponse(mpResponse: any): PaymentResponse {
    let status: TransactionStatus;
    
    // Mapeia o status do Mercado Pago para o status interno
    switch (mpResponse.status) {
      case 'approved':
        status = TransactionStatus.APPROVED;
        break;
      case 'pending':
      case 'in_process':
      case 'in_mediation':
        status = TransactionStatus.PENDING;
        break;
      case 'rejected':
        status = TransactionStatus.REJECTED;
        break;
      case 'cancelled':
      case 'refunded':
      case 'charged_back':
        status = TransactionStatus.CANCELLED;
        break;
      default:
        status = TransactionStatus.PENDING;
    }

    // Constrói a resposta padrão
    const response: PaymentResponse = {
      transactionId: mpResponse.id.toString(),
      orderId: mpResponse.external_reference,
      status,
      amount: mpResponse.transaction_amount,
      currency: mpResponse.currency_id || 'BRL',
      paymentMethod: this.mapMercadoPagoPaymentMethodToInternal(mpResponse.payment_method_id),
      acquirer: 'mercadopago',
      acquirerTransactionId: mpResponse.id.toString(),
      createdAt: new Date(mpResponse.date_created),
      updatedAt: new Date(mpResponse.date_last_updated)
    };

    // Adiciona detalhes específicos por método de pagamento
    if (mpResponse.payment_method_id === 'credit_card') {
      response.cardBrand = mpResponse.card?.card_brand_name || mpResponse.payment_method_id;
      response.cardFirstDigits = mpResponse.card?.first_six_digits || '';
      response.cardLastDigits = mpResponse.card?.last_four_digits || '';
      response.authorizationCode = mpResponse.authorization_code;
    } else if (mpResponse.payment_method_id === 'pix') {
      if (mpResponse.point_of_interaction && mpResponse.point_of_interaction.transaction_data) {
        response.qrCodeBase64 = mpResponse.point_of_interaction.transaction_data.qr_code_base64;
        response.qrCodeUrl = mpResponse.point_of_interaction.transaction_data.qr_code;
      }
    } else if (mpResponse.payment_type_id === 'ticket') {
      response.boletoUrl = mpResponse.transaction_details?.external_resource_url;
      response.boletoBarCode = mpResponse.barcode?.content;
      response.expirationDate = mpResponse.date_of_expiration ? new Date(mpResponse.date_of_expiration) : undefined;
    }

    return response;
  }

  /**
   * Mapeia o método de pagamento do Mercado Pago para o formato interno
   */
  private mapMercadoPagoPaymentMethodToInternal(mpMethod: string): PaymentMethod {
    switch (mpMethod) {
      case 'credit_card':
        return PaymentMethod.CREDIT_CARD;
      case 'pix':
        return PaymentMethod.PIX;
      case 'bolbradesco':
      case 'ticket':
        return PaymentMethod.BOLETO;
      default:
        return PaymentMethod.OTHER;
    }
  }

  /**
   * Processa um pagamento através do Mercado Pago
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Mapeia a requisição para o formato do Mercado Pago
      const mpRequest = this.mapPaymentRequest(request);

      // Envia a requisição para o Mercado Pago
      const response = await this.client.post('/payments', mpRequest);

      // Mapeia a resposta para o formato padrão
      return this.mapPaymentResponse(response.data);
    } catch (error: any) {
      console.error('Erro ao processar pagamento no Mercado Pago:', error.response?.data || error.message);
      
      // Trata erros específicos do Mercado Pago
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        throw new Error(errorData.message || 'Erro ao processar pagamento no Mercado Pago');
      }
      
      throw new Error('Erro ao processar pagamento no Mercado Pago');
    }
  }

  /**
   * Consulta o status de uma transação no Mercado Pago
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    try {
      // Consulta o status no Mercado Pago
      const response = await this.client.get(`/payments/${transactionId}`);

      // Mapeia a resposta para o formato padrão
      return this.mapPaymentResponse(response.data);
    } catch (error: any) {
      console.error('Erro ao consultar status no Mercado Pago:', error.response?.data || error.message);
      
      // Trata erros específicos do Mercado Pago
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error(`Transação ${transactionId} não encontrada no Mercado Pago`);
        }
        
        if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      
      throw new Error('Erro ao consultar status no Mercado Pago');
    }
  }

  /**
   * Processa um reembolso através do Mercado Pago
   */
  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      // Prepara a requisição de reembolso
      const refundRequest: any = {};
      
      // Adiciona o valor se for um reembolso parcial
      if (request.amount) {
        refundRequest.amount = request.amount;
      }

      // Envia a requisição para o Mercado Pago
      const response = await this.client.post(`/payments/${request.transactionId}/refunds`, refundRequest);

      // Mapeia a resposta
      return {
        refundId: response.data.id.toString(),
        transactionId: request.transactionId,
        amount: response.data.amount,
        status: response.data.status === 'approved' ? 'approved' : 'pending',
        createdAt: new Date(response.data.date_created)
      };
    } catch (error: any) {
      console.error('Erro ao processar reembolso no Mercado Pago:', error.response?.data || error.message);
      
      // Trata erros específicos do Mercado Pago
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        throw new Error(errorData.message || 'Erro ao processar reembolso no Mercado Pago');
      }
      
      throw new Error('Erro ao processar reembolso no Mercado Pago');
    }
  }

  /**
   * Processa uma notificação de webhook do Mercado Pago
   */
  async processWebhook(webhookData: any): Promise<any> {
    try {
      // O Mercado Pago envia apenas o ID da transação no webhook
      // Precisamos consultar os detalhes da transação
      if (webhookData.action === 'payment.updated' || webhookData.action === 'payment.created') {
        const paymentId = webhookData.data.id;
        const paymentDetails = await this.getPaymentStatus(paymentId);
        
        return {
          transactionId: paymentDetails.transactionId,
          status: paymentDetails.status,
          acquirerTransactionId: paymentDetails.acquirerTransactionId,
          eventType: webhookData.action,
          eventData: paymentDetails
        };
      }
      
      return webhookData;
    } catch (error: any) {
      console.error('Erro ao processar webhook do Mercado Pago:', error);
      throw new Error('Erro ao processar webhook do Mercado Pago');
    }
  }
}