import axios, { AxiosInstance } from 'axios';
import {
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  TransactionStatus,
  AcquirerConfig,
  GatewayConfig
} from '../interfaces/payment.interface';

/**
 * Serviço de pagamento que gerencia transações através de múltiplos adquirentes
 */
export class PaymentService {
  private acquirers: Map<string, AcquirerInstance>;
  private config: GatewayConfig;

  constructor(config: GatewayConfig) {
    this.config = config;
    this.acquirers = new Map();

    // Inicializa os adquirentes configurados
    config.acquirers
      .filter(acquirer => acquirer.enabled)
      .sort((a, b) => a.priority - b.priority)
      .forEach(acquirer => {
        this.acquirers.set(acquirer.name, this.createAcquirerInstance(acquirer));
      });
  }

  /**
   * Processa um pagamento utilizando o adquirente principal e retentativas se necessário
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const acquirers = Array.from(this.acquirers.entries());
    let lastError: Error | null = null;

    // Tenta processar o pagamento com cada adquirente, em ordem de prioridade
    for (const [name, acquirer] of acquirers) {
      try {
        console.log(`Tentando processar pagamento com adquirente: ${name}`);
        const response = await acquirer.processPayment(request);
        console.log(`Pagamento processado com sucesso pelo adquirente: ${name}`);
        return {
          ...response,
          acquirer: name
        };
      } catch (error) {
        console.error(`Erro ao processar pagamento com adquirente ${name}:`, error);
        lastError = error as Error;
        
        // Continua para o próximo adquirente
        continue;
      }
    }

    // Se chegou aqui, todos os adquirentes falharam
    throw new Error(
      lastError ? 
      `Falha ao processar pagamento após tentar todos os adquirentes: ${lastError.message}` : 
      'Falha ao processar pagamento após tentar todos os adquirentes'
    );
  }

  /**
   * Consulta o status de uma transação
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    // Tenta encontrar a transação em todos os adquirentes
    for (const [name, acquirer] of this.acquirers.entries()) {
      try {
        const response = await acquirer.getPaymentStatus(transactionId);
        return {
          ...response,
          acquirer: name
        };
      } catch (error) {
        // Ignora erro e tenta o próximo adquirente
        continue;
      }
    }

    throw new Error(`Transação não encontrada: ${transactionId}`);
  }

  /**
   * Processa um reembolso
   */
  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    // Primeiro, precisamos descobrir qual adquirente processou a transação original
    const paymentStatus = await this.getPaymentStatus(request.transactionId);
    const acquirerName = paymentStatus.acquirer;
    const acquirer = this.acquirers.get(acquirerName);

    if (!acquirer) {
      throw new Error(`Adquirente não encontrado: ${acquirerName}`);
    }

    return acquirer.processRefund(request);
  }

  /**
   * Processa uma notificação de webhook
   */
  async processWebhook(acquirerName: string, data: any): Promise<void> {
    const acquirer = this.acquirers.get(acquirerName);

    if (!acquirer) {
      throw new Error(`Adquirente não encontrado: ${acquirerName}`);
    }

    await acquirer.processWebhook(data);
  }

  /**
   * Cria uma instância de adquirente baseada na configuração
   */
  private createAcquirerInstance(config: AcquirerConfig): AcquirerInstance {
    switch (config.name.toLowerCase()) {
      case 'inovpay':
        return new InovpayAcquirer(config);
      case 'mercadopago':
        return new MercadoPagoAcquirer(config);
      default:
        throw new Error(`Adquirente não suportado: ${config.name}`);
    }
  }
}

/**
 * Interface para implementações de adquirentes
 */
interface AcquirerInstance {
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;
  getPaymentStatus(transactionId: string): Promise<PaymentResponse>;
  processRefund(request: RefundRequest): Promise<RefundResponse>;
  processWebhook(data: any): Promise<void>;
}

/**
 * Implementação do adquirente Inovpay
 */
class InovpayAcquirer implements AcquirerInstance {
  private client: AxiosInstance;
  private config: AcquirerConfig;
  private token: string | null = null;
  private tokenExpiration: Date | null = null;

  constructor(config: AcquirerConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
    });
  }

  /**
   * Autenticação na API da Inovpay
   */
  private async authenticate(): Promise<string> {
    // Verifica se o token ainda é válido
    if (this.token && this.tokenExpiration && this.tokenExpiration > new Date()) {
      return this.token;
    }

    try {
      const response = await this.client.post('/oauth/token', {
        grant_type: 'client_credentials',
        client_id: this.config.credentials.client_id,
        client_secret: this.config.credentials.client_secret,
      });

      this.token = response.data.access_token;
      // Define expiração para 1 hora antes do tempo real para garantir margem de segurança
      const expiresIn = response.data.expires_in || 3600;
      this.tokenExpiration = new Date(Date.now() + (expiresIn - 3600) * 1000);

      return this.token || '';
    } catch (error) {
      console.error('Erro ao autenticar na Inovpay:', error);
      throw new Error('Falha na autenticação com a Inovpay');
    }
  }

  /**
   * Processa um pagamento através da Inovpay
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const token = await this.authenticate();

    try {
      // Monta o payload conforme a documentação da Inovpay
      const payload = this.mapPaymentRequestToInovpay(request);

      const response = await this.client.post('/payments', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Establishment-Id': this.config.credentials.establishment_id
        }
      });

      return this.mapInovpayResponseToPaymentResponse(response.data);
    } catch (error: any) {
      console.error('Erro ao processar pagamento na Inovpay:', error.response?.data || error.message);
      throw new Error(`Falha ao processar pagamento na Inovpay: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Consulta o status de uma transação na Inovpay
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    const token = await this.authenticate();

    try {
      const response = await this.client.get(`/payments/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Establishment-Id': this.config.credentials.establishment_id
        }
      });

      return this.mapInovpayResponseToPaymentResponse(response.data);
    } catch (error: any) {
      console.error('Erro ao consultar status na Inovpay:', error.response?.data || error.message);
      throw new Error(`Falha ao consultar status na Inovpay: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Processa um reembolso através da Inovpay
   */
  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    const token = await this.authenticate();

    try {
      const response = await this.client.post(`/payments/${request.transactionId}/refund`, {
        amount: request.amount,
        reason: request.reason
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Establishment-Id': this.config.credentials.establishment_id
        }
      });

      return {
        refundId: response.data.refund_id,
        transactionId: request.transactionId,
        status: TransactionStatus.REFUNDED,
        amount: response.data.amount,
        createdAt: new Date(response.data.created_at)
      };
    } catch (error: any) {
      console.error('Erro ao processar reembolso na Inovpay:', error.response?.data || error.message);
      throw new Error(`Falha ao processar reembolso na Inovpay: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Processa uma notificação de webhook da Inovpay
   */
  async processWebhook(data: any): Promise<void> {
    // Implementação do processamento de webhook da Inovpay
    console.log('Webhook da Inovpay recebido:', data);
    // Aqui seria implementada a lógica para atualizar o status da transação no banco de dados
  }

  /**
   * Mapeia uma requisição de pagamento para o formato da Inovpay
   */
  private mapPaymentRequestToInovpay(request: PaymentRequest): any {
    // Implementação do mapeamento de acordo com a documentação da Inovpay
    const payload: any = {
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      payment_method: this.mapPaymentMethod(request.paymentMethod),
      customer: {
        name: request.customer.name,
        email: request.customer.email,
        document: request.customer.document,
        phone: request.customer.phone
      },
      metadata: request.metadata || {},
      callback_url: request.callbackUrl
    };

    // Adiciona dados específicos do método de pagamento
    switch (request.paymentMethod) {
      case 'credit_card':
        if (request.creditCardData) {
          payload.credit_card = {
            card_number: request.creditCardData.number,
            holder_name: request.creditCardData.holderName,
            expiration_month: request.creditCardData.expirationMonth,
            expiration_year: request.creditCardData.expirationYear,
            cvv: request.creditCardData.cvv,
            installments: request.creditCardData.installments || 1
          };
        }
        break;
      case 'pix':
        if (request.pixData) {
          payload.pix = {
            expiration_time: request.pixData.expirationTime || 30 // 30 minutos por padrão
          };
        }
        break;
      case 'boleto':
        if (request.boletoData) {
          payload.boleto = {
            buyer_name: request.boletoData.buyerName,
            buyer_document: request.boletoData.buyerDocument,
            due_date: request.boletoData.dueDate ? request.boletoData.dueDate.toISOString().split('T')[0] : undefined
          };
        }
        break;
    }

    // Adiciona itens se disponíveis
    if (request.items && request.items.length > 0) {
      payload.items = request.items.map(item => ({
        id: item.id,
        title: item.title,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        tangible: item.tangible
      }));
    }

    return payload;
  }

  /**
   * Mapeia uma resposta da Inovpay para o formato padrão do gateway
   */
  private mapInovpayResponseToPaymentResponse(data: any): PaymentResponse {
    return {
      transactionId: data.id,
      status: this.mapInovpayStatus(data.status),
      amount: data.amount,
      currency: data.currency,
      paymentMethod: this.mapInovpayPaymentMethod(data.payment_method),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      paymentUrl: data.payment_url,
      paymentCode: data.payment_code,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      errorCode: data.error_code,
      errorMessage: data.error_message,
      acquirer: 'inovpay'
    };
  }

  /**
   * Mapeia o método de pagamento para o formato da Inovpay
   */
  private mapPaymentMethod(method: string): string {
    switch (method) {
      case 'credit_card': return 'credit_card';
      case 'pix': return 'pix';
      case 'boleto': return 'boleto';
      default: return method;
    }
  }

  /**
   * Mapeia o método de pagamento da Inovpay para o formato padrão do gateway
   */
  private mapInovpayPaymentMethod(method: string): any {
    switch (method) {
      case 'credit_card': return 'credit_card';
      case 'pix': return 'pix';
      case 'boleto': return 'boleto';
      default: return method;
    }
  }

  /**
   * Mapeia o status da Inovpay para o formato padrão do gateway
   */
  private mapInovpayStatus(status: string): TransactionStatus {
    switch (status) {
      case 'pending': return TransactionStatus.PENDING;
      case 'processing': return TransactionStatus.PROCESSING;
      case 'approved': return TransactionStatus.APPROVED;
      case 'declined': return TransactionStatus.DECLINED;
      case 'refunded': return TransactionStatus.REFUNDED;
      case 'canceled': return TransactionStatus.CANCELED;
      case 'error': return TransactionStatus.ERROR;
      default: return TransactionStatus.PENDING;
    }
  }
}

/**
 * Implementação do adquirente Mercado Pago
 */
class MercadoPagoAcquirer implements AcquirerInstance {
  private client: AxiosInstance;
  private config: AcquirerConfig;

  constructor(config: AcquirerConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${config.credentials.access_token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Processa um pagamento através do Mercado Pago
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Monta o payload conforme a documentação do Mercado Pago
      const payload = this.mapPaymentRequestToMercadoPago(request);

      const response = await this.client.post('/v1/payments', payload);

      return this.mapMercadoPagoResponseToPaymentResponse(response.data);
    } catch (error: any) {
      console.error('Erro ao processar pagamento no Mercado Pago:', error.response?.data || error.message);
      throw new Error(`Falha ao processar pagamento no Mercado Pago: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Consulta o status de uma transação no Mercado Pago
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    try {
      const response = await this.client.get(`/v1/payments/${transactionId}`);

      return this.mapMercadoPagoResponseToPaymentResponse(response.data);
    } catch (error: any) {
      console.error('Erro ao consultar status no Mercado Pago:', error.response?.data || error.message);
      throw new Error(`Falha ao consultar status no Mercado Pago: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Processa um reembolso através do Mercado Pago
   */
  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      const response = await this.client.post(`/v1/payments/${request.transactionId}/refunds`, {
        amount: request.amount
      });

      return {
        refundId: response.data.id,
        transactionId: request.transactionId,
        status: TransactionStatus.REFUNDED,
        amount: response.data.amount,
        createdAt: new Date(response.data.created_date)
      };
    } catch (error: any) {
      console.error('Erro ao processar reembolso no Mercado Pago:', error.response?.data || error.message);
      throw new Error(`Falha ao processar reembolso no Mercado Pago: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Processa uma notificação de webhook do Mercado Pago
   */
  async processWebhook(data: any): Promise<void> {
    // Implementação do processamento de webhook do Mercado Pago
    console.log('Webhook do Mercado Pago recebido:', data);
    // Aqui seria implementada a lógica para atualizar o status da transação no banco de dados
  }

  /**
   * Mapeia uma requisição de pagamento para o formato do Mercado Pago
   */
  private mapPaymentRequestToMercadoPago(request: PaymentRequest): any {
    // Implementação do mapeamento de acordo com a documentação do Mercado Pago
    const payload: any = {
      transaction_amount: request.amount,
      description: request.description,
      payment_method_id: this.mapPaymentMethod(request.paymentMethod),
      payer: {
        email: request.customer.email,
        identification: {
          type: 'CPF',
          number: request.customer.document
        },
        first_name: request.customer.name.split(' ')[0],
        last_name: request.customer.name.split(' ').slice(1).join(' ')
      },
      metadata: request.metadata || {}
    };

    // Adiciona dados específicos do método de pagamento
    switch (request.paymentMethod) {
      case 'credit_card':
        if (request.creditCardData) {
          payload.token = 'TOKEN_GERADO_PELO_FRONTEND'; // Na implementação real, o token seria gerado pelo frontend
          payload.installments = request.creditCardData.installments || 1;
          payload.payment_method_id = 'master'; // Ou visa, amex, etc.
        }
        break;
      case 'pix':
        payload.payment_method_id = 'pix';
        break;
      case 'boleto':
        payload.payment_method_id = 'bolbradesco'; // Ou outro código de boleto
        if (request.boletoData) {
          payload.date_of_expiration = request.boletoData.dueDate ? 
            request.boletoData.dueDate.toISOString().split('T')[0] : 
            undefined;
        }
        break;
    }

    return payload;
  }

  /**
   * Mapeia uma resposta do Mercado Pago para o formato padrão do gateway
   */
  private mapMercadoPagoResponseToPaymentResponse(data: any): PaymentResponse {
    return {
      transactionId: data.id.toString(),
      status: this.mapMercadoPagoStatus(data.status),
      amount: data.transaction_amount,
      currency: data.currency_id,
      paymentMethod: this.mapMercadoPagoPaymentMethod(data.payment_method_id),
      createdAt: new Date(data.date_created),
      updatedAt: new Date(data.date_last_updated),
      paymentUrl: data.transaction_details?.external_resource_url,
      paymentCode: data.transaction_details?.payment_method_reference_id,
      expiresAt: data.date_of_expiration ? new Date(data.date_of_expiration) : undefined,
      errorCode: data.error_code,
      errorMessage: data.error_message,
      acquirer: 'mercadopago'
    };
  }

  /**
   * Mapeia o método de pagamento para o formato do Mercado Pago
   */
  private mapPaymentMethod(method: string): string {
    switch (method) {
      case 'credit_card': return 'credit_card';
      case 'pix': return 'pix';
      case 'boleto': return 'bolbradesco';
      default: return method;
    }
  }

  /**
   * Mapeia o método de pagamento do Mercado Pago para o formato padrão do gateway
   */
  private mapMercadoPagoPaymentMethod(method: string): any {
    switch (method) {
      case 'credit_card': return 'credit_card';
      case 'visa': return 'credit_card';
      case 'master': return 'credit_card';
      case 'amex': return 'credit_card';
      case 'pix': return 'pix';
      case 'bolbradesco': return 'boleto';
      default: return method;
    }
  }

  /**
   * Mapeia o status do Mercado Pago para o formato padrão do gateway
   */
  private mapMercadoPagoStatus(status: string): TransactionStatus {
    switch (status) {
      case 'pending': return TransactionStatus.PENDING;
      case 'in_process': return TransactionStatus.PROCESSING;
      case 'approved': return TransactionStatus.APPROVED;
      case 'rejected': return TransactionStatus.DECLINED;
      case 'refunded': return TransactionStatus.REFUNDED;
      case 'cancelled': return TransactionStatus.CANCELED;
      case 'in_mediation': return TransactionStatus.PROCESSING;
      case 'charged_back': return TransactionStatus.DECLINED;
      default: return TransactionStatus.PENDING;
    }
  }
}