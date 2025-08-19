/**
 * Tipos para o checkout transparente
 */

// Métodos de pagamento suportados
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
  cardNumber: string;
  holderName: string;
  expirationMonth: string;
  expirationYear: string;
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
  currency: string;
  createdAt: Date;
  reason?: string;
}