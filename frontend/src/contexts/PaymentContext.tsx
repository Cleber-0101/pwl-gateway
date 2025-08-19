import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PaymentMethod, PaymentRequest, PaymentResponse, Customer, OrderItem } from '../types/payment.types';

interface PaymentContextType {
  paymentData: PaymentRequest;
  paymentResponse: PaymentResponse | null;
  loading: boolean;
  error: string | null;
  setPaymentData: (data: Partial<PaymentRequest>) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCustomer: (customer: Customer) => void;
  setItems: (items: OrderItem[]) => void;
  setAmount: (amount: number) => void;
  setCreditCardData: (data: any) => void;
  setPixData: (data: any) => void;
  setBoletoData: (data: any) => void;
  setPaymentResponse: (response: PaymentResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetPaymentData: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  // Estado inicial do pagamento
  const initialPaymentData: PaymentRequest = {
    amount: 0,
    currency: 'BRL',
    paymentMethod: PaymentMethod.CREDIT_CARD,
    customer: {
      name: '',
      email: '',
      document: '',
      phone: '',
      address: {
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'BR',
      },
    },
    items: [],
  };

  const [paymentData, setPaymentData] = useState<PaymentRequest>(initialPaymentData);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Funções para atualizar o estado do pagamento
  const setPaymentMethod = (method: PaymentMethod) => {
    setPaymentData({ ...paymentData, paymentMethod: method });
  };

  const setCustomer = (customer: Customer) => {
    setPaymentData({ ...paymentData, customer });
  };

  const setItems = (items: OrderItem[]) => {
    setPaymentData({ ...paymentData, items });
  };

  const setAmount = (amount: number) => {
    setPaymentData({ ...paymentData, amount });
  };

  const setCreditCardData = (data: any) => {
    setPaymentData({ ...paymentData, creditCardData: data });
  };

  const setPixData = (data: any) => {
    setPaymentData({ ...paymentData, pixData: data });
  };

  const setBoletoData = (data: any) => {
    setPaymentData({ ...paymentData, boletoData: data });
  };

  const resetPaymentData = () => {
    setPaymentData(initialPaymentData);
    setPaymentResponse(null);
    setError(null);
  };

  // Função para atualizar os dados de pagamento diretamente
  const updatePaymentData = (data: Partial<PaymentRequest>) => {
    setPaymentData({ ...paymentData, ...data });
  };

  return (
    <PaymentContext.Provider
      value={{
        paymentData,
        paymentResponse,
        loading,
        error,
        setPaymentData: updatePaymentData,
        setPaymentMethod,
        setCustomer,
        setItems,
        setAmount,
        setCreditCardData,
        setPixData,
        setBoletoData,
        setPaymentResponse,
        setLoading,
        setError,
        resetPaymentData,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

// Hook personalizado para usar o contexto de pagamento
export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};