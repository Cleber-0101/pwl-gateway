/**
 * Interfaces para o módulo de pagamentos
 */

// Tipos de métodos de pagamento suportados
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  PIX = 'pix',
  BOLETO = 'boleto'
}

// Status possíveis de uma transação
export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  DECLINED = 'declined',
  REFUNDED = 'refunded',
  CANCELED = 'canceled',
  ERROR = 'error'
}

// Interface para dados de cartão de crédito
export interface CreditCardData {
  number: string;
  holderName: string;
  expirationMonth: number;
  expirationYear: number;
  cvv: string;
  installments?: number;
  saveCard?: boolean;
}

// Interface para dados de Pix
export interface PixData {
  expirationTime?: number; // Tempo em minutos
}

// Interface para dados de Boleto
export interface BoletoData {
  buyerName: string;
  buyerDocument: string;
  dueDate?: Date;
}

// Interface para endereço
export interface Address {
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Interface para dados do cliente
export interface Customer {
  id?: string;
  name: string;
  email: string;
  document?: string;
  phone?: string;
  address?: Address;
}

// Interface para item de compra
export interface OrderItem {
  id: string;
  title: string;
  unitPrice: number;
  quantity: number;
  tangible: boolean;
}

// Interface para requisição de pagamento
export interface PaymentRequest {
  transactionId?: string;
  amount: number;
  currency: string;
  description?: string;
  paymentMethod: PaymentMethod;
  customer: Customer;
  items?: OrderItem[];
  metadata?: Record<string, any>;
  callbackUrl?: string;
  creditCardData?: CreditCardData;
  pixData?: PixData;
  boletoData?: BoletoData;
}

// Interface para resposta de pagamento
export interface PaymentResponse {
  transactionId: string;
  status: TransactionStatus;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
  paymentUrl?: string; // URL para QR Code do Pix ou PDF do boleto
  paymentCode?: string; // Código do Pix ou linha digitável do boleto
  expiresAt?: Date;
  errorCode?: string;
  errorMessage?: string;
  acquirer: string; // Adquirente que processou o pagamento (Inovpay, Mercado Pago, etc.)
  acquirerTransactionId?: string; // ID da transação no adquirente
}

// Interface para requisição de reembolso
export interface RefundRequest {
  transactionId: string;
  amount?: number; // Se não informado, reembolsa o valor total
  reason?: string;
}

// Interface para resposta de reembolso
export interface RefundResponse {
  refundId: string;
  transactionId: string;
  status: TransactionStatus;
  amount: number;
  createdAt: Date;
  errorCode?: string;
  errorMessage?: string;
}

// Interface para webhook de notificação
export interface WebhookNotification {
  event: string;
  transactionId: string;
  status: TransactionStatus;
  amount: number;
  paymentMethod: PaymentMethod;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Interface para configuração de adquirente
export interface AcquirerConfig {
  name: string;
  priority: number;
  enabled: boolean;
  credentials: Record<string, string>;
  webhookUrl?: string;
  apiUrl: string;
}

// Interface para configuração de gateway
export interface GatewayConfig {
  acquirers: AcquirerConfig[];
  retryAttempts: number;
  retryDelay: number;
  defaultCurrency: string;
  webhookSecret: string;
}

// Interface para configuração da Inovpay
export interface InovpayConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  webhookUrl?: string;
  name: string;
  priority: number;
  enabled: boolean;
}

// Interface para configuração do Mercado Pago
export interface MercadoPagoConfig {
  apiUrl: string;
  accessToken: string;
  webhookUrl?: string;
  name: string;
  priority: number;
  enabled: boolean;
}