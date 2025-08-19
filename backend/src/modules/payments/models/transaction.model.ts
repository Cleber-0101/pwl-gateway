import mongoose, { Schema, Document } from 'mongoose';
import { PaymentMethod, TransactionStatus } from '../interfaces/payment.interface';

/**
 * Interface para o documento de transação no MongoDB
 */
export interface ITransaction extends Document {
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  customer: {
    name: string;
    email: string;
    document: string;
    phone?: string;
  };
  billingAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentDetails: {
    acquirer: string;
    acquirerTransactionId?: string;
    authorizationCode?: string;
    nsu?: string;
    tid?: string;
    paymentUrl?: string;
    qrCodeUrl?: string;
    qrCodeBase64?: string;
    boletoUrl?: string;
    boletoBarCode?: string;
    boletoExpirationDate?: Date;
    cardBrand?: string;
    cardFirstDigits?: string;
    cardLastDigits?: string;
  };
  items?: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    sku?: string;
  }>;
  metadata?: Record<string, any>;
  attempts?: Array<{
    acquirer: string;
    timestamp: Date;
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
  }>;
  refunds?: Array<{
    refundId: string;
    amount: number;
    status: string;
    reason?: string;
    createdAt: Date;
  }>;
  webhookEvents?: Array<{
    acquirer: string;
    eventType: string;
    timestamp: Date;
    data: Record<string, any>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema para o modelo de transação
 */
const TransactionSchema: Schema = new Schema(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'BRL' },
    paymentMethod: { 
      type: String, 
      required: true, 
      enum: Object.values(PaymentMethod) 
    },
    status: { 
      type: String, 
      required: true, 
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      document: { type: String, required: true },
      phone: { type: String }
    },
    billingAddress: {
      street: { type: String },
      number: { type: String },
      complement: { type: String },
      neighborhood: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String, default: 'BR' }
    },
    paymentDetails: {
      acquirer: { type: String, required: true },
      acquirerTransactionId: { type: String },
      authorizationCode: { type: String },
      nsu: { type: String },
      tid: { type: String },
      paymentUrl: { type: String },
      qrCodeUrl: { type: String },
      qrCodeBase64: { type: String },
      boletoUrl: { type: String },
      boletoBarCode: { type: String },
      boletoExpirationDate: { type: Date },
      cardBrand: { type: String },
      cardFirstDigits: { type: String },
      cardLastDigits: { type: String }
    },
    items: [
      {
        name: { type: String, required: true },
        description: { type: String },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        sku: { type: String }
      }
    ],
    metadata: { type: Schema.Types.Mixed },
    attempts: [
      {
        acquirer: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        success: { type: Boolean, required: true },
        errorCode: { type: String },
        errorMessage: { type: String }
      }
    ],
    refunds: [
      {
        refundId: { type: String, required: true },
        amount: { type: Number, required: true },
        status: { type: String, required: true },
        reason: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    webhookEvents: [
      {
        acquirer: { type: String, required: true },
        eventType: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        data: { type: Schema.Types.Mixed }
      }
    ]
  },
  { timestamps: true }
);

// Índices para melhorar a performance das consultas
TransactionSchema.index({ 'customer.email': 1 });
TransactionSchema.index({ 'customer.document': 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ status: 1, createdAt: -1 });
TransactionSchema.index({ 'paymentDetails.acquirer': 1, 'paymentDetails.acquirerTransactionId': 1 });

/**
 * Modelo de transação
 */
export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);