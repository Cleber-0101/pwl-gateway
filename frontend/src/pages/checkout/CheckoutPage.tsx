import React, { useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import CheckoutForm from '../../components/checkout/CheckoutForm';
import { usePayment } from '../../contexts/PaymentContext';
import { PaymentMethod } from '../../types/payment.types';

const CheckoutPage: React.FC = () => {
  const { setPaymentData } = usePayment();

  useEffect(() => {
    // Simulação de dados do pedido que viriam de um carrinho de compras
    // Em um cenário real, esses dados viriam de um estado global ou API
    const mockOrderData = {
      amount: 199.99,
      currency: 'BRL',
      description: 'Compra na Loja PWL',
      paymentMethod: PaymentMethod.CREDIT_CARD,
      customer: {
        name: 'João Silva',
        email: 'joao.silva@example.com',
        document: '12345678909',
        phone: '+5511999999999',
        address: {
          street: 'Av. Paulista',
          number: '1000',
          complement: 'Apto 123',
          district: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          country: 'BR',
          zipCode: '01310100'
        }
      },
      items: [
        {
          id: '1',
          title: 'Produto Premium',
          quantity: 1,
          unitPrice: 199.99,
          tangible: true
        }
      ],
      metadata: {
        source: 'web'
      }
    };

    // Inicializa os dados de pagamento no contexto
    setPaymentData(mockOrderData);
  }, [setPaymentData]);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Finalizar Compra
        </Typography>
        <CheckoutForm />
      </Box>
    </Container>
  );
};

export default CheckoutPage;