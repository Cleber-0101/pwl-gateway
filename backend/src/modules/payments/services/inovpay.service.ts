import axios, { AxiosInstance } from 'axios';
import {
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  PaymentMethod,
  TransactionStatus,
  InovpayConfig
} from '../interfaces/payment.interface';

/**
 * Serviço para integração com a Inovpay
 */
export class InovpayService {
  private client: AxiosInstance;
  private config: InovpayConfig;
  private token: string | null = null;
  private tokenExpiration: Date | null = null;

  constructor(config: InovpayConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Obtém um token de autenticação da API da Inovpay
   */
  private async authenticate(): Promise<string> {
    // Verifica se já temos um token válido
    if (this.token && this.tokenExpiration && this.tokenExpiration > new Date()) {
      return this.token;
    }

    try {
      const response = await this.client.post('/auth', {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      });

      if (!response.data || !response.data.access_token) {
        throw new Error('Falha na autenticação com a Inovpay');
      }

      this.token = response.data.access_token;
      
      // Define a expiração do token (normalmente 1 hora, mas vamos usar 50 minutos para garantir)
      const expiresIn = response.data.expires_in || 3600;
      this.tokenExpiration = new Date(Date.now() + (expiresIn - 600) * 1000);

      return this.token;
    } catch (error: any) {
      console.error('Erro na autenticação com a Inovpay:', error.response?.data || error.message);
      throw new Error('Falha na autenticação com a Inovpay');
    }
  }

  /**
   * Mapeia uma requisição de pagamento para o formato da Inovpay
   */
  private mapPaymentRequest(request: PaymentRequest): any {
    // Dados básicos da transação
    const inovpayRequest: any = {
      establishment_id: this.config.establishmentId,
      amount: Math.round(request.amount * 100), // Converte para centavos
      currency: request.currency || 'BRL',
      order_id: request.orderId,
      description: request.description || 'Compra online',
      notification_url: this.config.webhookUrl,
      customer: {
        name: request.customer.name,
        email: request.customer.email,
        document: request.customer.document,
        phone: request.customer.phone || ''
      }
    };

    // Adiciona itens se existirem
    if (request.items && request.items.length > 0) {
      inovpayRequest.items = request.items.map(item => ({
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        unit_price: Math.round(item.unitPrice * 100), // Converte para centavos
        sku: item.sku || ''
      }));
    }

    // Adiciona endereço de cobrança se existir
    if (request.billingAddress) {
      inovpayRequest.billing_address = {
        street: request.billingAddress.street,
        number: request.billingAddress.number,
        complement: request.billingAddress.complement || '',
        neighborhood: request.billingAddress.neighborhood || '',
        city: request.billingAddress.city,
        state: request.billingAddress.state,
        zipcode: request.billingAddress.zipCode,
        country: request.billingAddress.country || 'BR'
      };
    }

    // Configura o método de pagamento específico
    switch (request.paymentMethod) {
      case PaymentMethod.CREDIT_CARD:
        inovpayRequest.payment_method = 'credit_card';
        inovpayRequest.credit_card = {
          number: request.creditCard!.number,
          holder_name: request.creditCard!.holderName,
          expiration_month: request.creditCard!.expirationMonth.toString().padStart(2, '0'),
          expiration_year: request.creditCard!.expirationYear.toString().padStart(2, '0'),
          cvv: request.creditCard!.cvv,
          installments: request.creditCard!.installments || 1
        };
        break;

      case PaymentMethod.PIX:
        inovpayRequest.payment_method = 'pix';
        inovpayRequest.pix = {
          expiration_minutes: 30 // Tempo de expiração do QR Code
        };
        break;

      case PaymentMethod.BOLETO:
        inovpayRequest.payment_method = 'boleto';
        inovpayRequest.boleto = {
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias para vencimento
          instructions: 'Não receber após o vencimento'
        };
        break;

      default:
        throw new Error(`Método de pagamento não suportado: ${request.paymentMethod}`);
    }

    return inovpayRequest;
  }

  /**
   * Mapeia uma resposta da Inovpay para o formato padrão da aplicação
   */
  private mapPaymentResponse(inovpayResponse: any): PaymentResponse {
    let status: TransactionStatus;
    
    // Mapeia o status da Inovpay para o status interno
    switch (inovpayResponse.status) {
      case 'approved':
        status = TransactionStatus.APPROVED;
        break;
      case 'pending':
        status = TransactionStatus.PENDING;
        break;
      case 'rejected':
      case 'declined':
        status = TransactionStatus.REJECTED;
        break;
      case 'canceled':
        status = TransactionStatus.CANCELLED;
        break;
      case 'refunded':
        status = TransactionStatus.REFUNDED;
        break;
      default:
        status = TransactionStatus.PENDING;
    }

    // Constrói a resposta padrão
    const response: PaymentResponse = {
      transactionId: inovpayResponse.transaction_id,
      orderId: inovpayResponse.order_id,
      status,
      amount: inovpayResponse.amount / 100, // Converte de centavos para reais
      currency: inovpayResponse.currency,
      paymentMethod: this.mapInovpayPaymentMethodToInternal(inovpayResponse.payment_method),
      acquirer: 'inovpay',
      acquirerTransactionId: inovpayResponse.acquirer_transaction_id || '',
      createdAt: new Date(inovpayResponse.created_at),
      updatedAt: new Date(inovpayResponse.updated_at)
    };

    // Adiciona detalhes específicos por método de pagamento
    if (inovpayResponse.payment_method === 'credit_card' && inovpayResponse.credit_card) {
      response.cardBrand = inovpayResponse.credit_card.brand;
      response.cardFirstDigits = inovpayResponse.credit_card.first_digits;
      response.cardLastDigits = inovpayResponse.credit_card.last_digits;
      response.authorizationCode = inovpayResponse.credit_card.authorization_code;
      response.nsu = inovpayResponse.credit_card.nsu;
      response.tid = inovpayResponse.credit_card.tid;
    } else if (inovpayResponse.payment_method === 'pix' && inovpayResponse.pix) {
      response.paymentUrl = inovpayResponse.pix.payment_url;
      response.qrCodeUrl = inovpayResponse.pix.qrcode_url;
      response.qrCodeBase64 = inovpayResponse.pix.qrcode_base64;
      response.expirationDate = inovpayResponse.pix.expiration_date ? new Date(inovpayResponse.pix.expiration_date) : undefined;
    } else if (inovpayResponse.payment_method === 'boleto' && inovpayResponse.boleto) {
      response.boletoUrl = inovpayResponse.boleto.url;
      response.boletoBarCode = inovpayResponse.boleto.barcode;
      response.expirationDate = inovpayResponse.boleto.due_date ? new Date(inovpayResponse.boleto.due_date) : undefined;
    }

    return response;
  }

  /**
   * Mapeia o método de pagamento da Inovpay para o formato interno
   */
  private mapInovpayPaymentMethodToInternal(inovpayMethod: string): PaymentMethod {
    switch (inovpayMethod) {
      case 'credit_card':
        return PaymentMethod.CREDIT_CARD;
      case 'pix':
        return PaymentMethod.PIX;
      case 'boleto':
        return PaymentMethod.BOLETO;
      default:
        return PaymentMethod.OTHER;
    }
  }

  /**
   * Processa um pagamento através da Inovpay
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Obtém token de autenticação
      const token = await this.authenticate();

      // Mapeia a requisição para o formato da Inovpay
      const inovpayRequest = this.mapPaymentRequest(request);

      // Envia a requisição para a Inovpay
      const response = await this.client.post('/payments', inovpayRequest, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Mapeia a resposta para o formato padrão
      return this.mapPaymentResponse(response.data);
    } catch (error: any) {
      console.error('Erro ao processar pagamento na Inovpay:', error.response?.data || error.message);
      
      // Trata erros específicos da Inovpay
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        throw new Error(errorData.message || 'Erro ao processar pagamento na Inovpay');
      }
      
      throw new Error('Erro ao processar pagamento na Inovpay');
    }
  }

  /**
   * Consulta o status de uma transação na Inovpay
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    try {
      // Obtém token de autenticação
      const token = await this.authenticate();

      // Consulta o status na Inovpay
      const response = await this.client.get(`/payments/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Mapeia a resposta para o formato padrão
      return this.mapPaymentResponse(response.data);
    } catch (error: any) {
      console.error('Erro ao consultar status na Inovpay:', error.response?.data || error.message);
      
      // Trata erros específicos da Inovpay
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error(`Transação ${transactionId} não encontrada na Inovpay`);
        }
        
        if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      
      throw new Error('Erro ao consultar status na Inovpay');
    }
  }

  /**
   * Processa um reembolso através da Inovpay
   */
  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      // Obtém token de autenticação
      const token = await this.authenticate();

      // Prepara a requisição de reembolso
      const refundRequest: any = {
        amount: request.amount ? Math.round(request.amount * 100) : undefined, // Converte para centavos se existir
        reason: request.reason
      };

      // Envia a requisição para a Inovpay
      const response = await this.client.post(`/payments/${request.transactionId}/refund`, refundRequest, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Mapeia a resposta
      return {
        refundId: response.data.refund_id,
        transactionId: request.transactionId,
        amount: response.data.amount / 100, // Converte de centavos para reais
        status: response.data.status === 'approved' ? 'approved' : 'pending',
        createdAt: new Date(response.data.created_at)
      };
    } catch (error: any) {
      console.error('Erro ao processar reembolso na Inovpay:', error.response?.data || error.message);
      
      // Trata erros específicos da Inovpay
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        throw new Error(errorData.message || 'Erro ao processar reembolso na Inovpay');
      }
      
      throw new Error('Erro ao processar reembolso na Inovpay');
    }
  }

  /**
   * Processa uma notificação de webhook da Inovpay
   */
  async processWebhook(webhookData: any): Promise<any> {
    try {
      // Valida a assinatura do webhook se necessário
      // this.validateWebhookSignature(webhookData, signature);

      // Retorna os dados processados do webhook
      return {
        transactionId: webhookData.transaction_id,
        status: this.mapInovpayStatusToInternal(webhookData.status),
        acquirerTransactionId: webhookData.acquirer_transaction_id,
        eventType: webhookData.event_type,
        eventData: webhookData
      };
    } catch (error: any) {
      console.error('Erro ao processar webhook da Inovpay:', error);
      throw new Error('Erro ao processar webhook da Inovpay');
    }
  }

  /**
   * Mapeia o status da Inovpay para o formato interno
   */
  private mapInovpayStatusToInternal(inovpayStatus: string): TransactionStatus {
    switch (inovpayStatus) {
      case 'approved':
        return TransactionStatus.APPROVED;
      case 'pending':
        return TransactionStatus.PENDING;
      case 'rejected':
      case 'declined':
        return TransactionStatus.REJECTED;
      case 'canceled':
        return TransactionStatus.CANCELLED;
      case 'refunded':
        return TransactionStatus.REFUNDED;
      default:
        return TransactionStatus.PENDING;
    }
  }

  /**
   * Valida a assinatura do webhook da Inovpay
   * Implementação depende da documentação específica da Inovpay sobre webhooks
   */
  private validateWebhookSignature(webhookData: any, signature: string): boolean {
    // Implementação da validação da assinatura do webhook
    // Depende da documentação específica da Inovpay
    return true; // Placeholder
  }
}