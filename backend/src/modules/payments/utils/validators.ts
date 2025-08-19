import { PaymentRequest, RefundRequest, PaymentMethod } from '../interfaces/payment.interface';

/**
 * Valida uma requisição de pagamento
 * @param request Requisição de pagamento
 * @returns Mensagem de erro ou null se válido
 */
export function validatePaymentRequest(request: PaymentRequest): string | null {
  // Validações básicas
  if (!request) {
    return 'Requisição de pagamento inválida';
  }

  // Validação do método de pagamento
  if (!request.paymentMethod) {
    return 'Método de pagamento é obrigatório';
  }

  // Validação do valor
  if (!request.amount || request.amount <= 0) {
    return 'Valor da transação deve ser maior que zero';
  }

  // Validação do cliente
  if (!request.customer) {
    return 'Dados do cliente são obrigatórios';
  }

  if (!request.customer.name || !request.customer.email) {
    return 'Nome e email do cliente são obrigatórios';
  }

  // Validação do documento (CPF/CNPJ)
  if (!request.customer.document) {
    return 'Documento do cliente (CPF/CNPJ) é obrigatório';
  }

  // Validação específica por método de pagamento
  switch (request.paymentMethod) {
    case PaymentMethod.CREDIT_CARD:
      return validateCreditCardPayment(request);
    case PaymentMethod.PIX:
      return validatePixPayment(request);
    case PaymentMethod.BOLETO:
      return validateBoletoPayment(request);
    default:
      return `Método de pagamento '${request.paymentMethod}' não suportado`;
  }
}

/**
 * Valida uma requisição de pagamento com cartão de crédito
 * @param request Requisição de pagamento
 * @returns Mensagem de erro ou null se válido
 */
function validateCreditCardPayment(request: PaymentRequest): string | null {
  if (!request.creditCardData) {
    return 'Dados do cartão de crédito são obrigatórios';
  }

  const creditCard = request.creditCardData;

  if (!creditCard.number || creditCard.number.length < 13 || creditCard.number.length > 19) {
    return 'Número do cartão inválido';
  }

  if (!creditCard.holderName) {
    return 'Nome do titular do cartão é obrigatório';
  }

  if (!creditCard.expirationMonth || creditCard.expirationMonth < 1 || creditCard.expirationMonth > 12) {
    return 'Mês de expiração do cartão inválido';
  }

  const currentYear = new Date().getFullYear() % 100; // Últimos 2 dígitos do ano
  if (!creditCard.expirationYear || creditCard.expirationYear < currentYear) {
    return 'Ano de expiração do cartão inválido';
  }

  if (!creditCard.cvv || creditCard.cvv.length < 3 || creditCard.cvv.length > 4) {
    return 'Código de segurança (CVV) inválido';
  }

  // Validação do endereço de cobrança
  if (!request.customer.address) {
    return 'Endereço de cobrança é obrigatório para pagamentos com cartão';
  }

  const billingAddress = request.customer.address;

  if (!billingAddress.street || !billingAddress.number || !billingAddress.zipCode || !billingAddress.city || !billingAddress.state) {
    return 'Endereço de cobrança incompleto';
  }

  return null;
}

/**
 * Valida uma requisição de pagamento com PIX
 * @param request Requisição de pagamento
 * @returns Mensagem de erro ou null se válido
 */
function validatePixPayment(request: PaymentRequest): string | null {
  // PIX não requer validações adicionais específicas além das básicas
  return null;
}

/**
 * Valida uma requisição de pagamento com boleto
 * @param request Requisição de pagamento
 * @returns Mensagem de erro ou null se válido
 */
function validateBoletoPayment(request: PaymentRequest): string | null {
  // Validação do endereço de cobrança
  if (!request.customer.address) {
    return 'Endereço de cobrança é obrigatório para pagamentos com boleto';
  }

  const billingAddress = request.customer.address;

  if (!billingAddress.street || !billingAddress.number || !billingAddress.zipCode || !billingAddress.city || !billingAddress.state) {
    return 'Endereço de cobrança incompleto';
  }

  return null;
}

/**
 * Valida uma requisição de reembolso
 * @param request Requisição de reembolso
 * @returns Mensagem de erro ou null se válido
 */
export function validateRefundRequest(request: RefundRequest): string | null {
  // Validações básicas
  if (!request) {
    return 'Requisição de reembolso inválida';
  }

  // Validação do ID da transação
  if (!request.transactionId) {
    return 'ID da transação é obrigatório';
  }

  // Validação do valor (opcional, pode ser reembolso total)
  if (request.amount !== undefined && request.amount <= 0) {
    return 'Valor do reembolso deve ser maior que zero';
  }

  // Validação do motivo (opcional)
  if (request.reason && request.reason.length > 255) {
    return 'Motivo do reembolso deve ter no máximo 255 caracteres';
  }

  return null;
}