import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Button, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { PaymentService } from '../../services/payment.service';
import { PaymentResponse } from '../../types/payment.types';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        // Extrair o ID da transação da URL
        const params = new URLSearchParams(location.search);
        const transactionId = params.get('transaction_id');

        if (!transactionId) {
          setError('ID da transação não encontrado');
          setLoading(false);
          return;
        }

        // Buscar status do pagamento
        const response = await PaymentService.getPaymentStatus(transactionId);
        setPaymentInfo(response);
      } catch (error: any) {
        setError(error.message || 'Erro ao buscar informações do pagamento');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [location.search]);

  const handleBackToStore = () => {
    navigate('/');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box textAlign="center">
          <Typography variant="h6" color="error" gutterBottom>
            Erro
          </Typography>
          <Typography variant="body1">{error}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBackToStore}
            sx={{ mt: 3 }}
          >
            Voltar para a Loja
          </Button>
        </Box>
      );
    }

    return (
      <Box textAlign="center">
        <Typography variant="h5" color="primary" gutterBottom>
          Pagamento {paymentInfo?.status === 'approved' ? 'Aprovado' : 'Processado'}
        </Typography>
        
        <Typography variant="body1" paragraph>
          Obrigado por sua compra! Seu pedido foi processado com sucesso.
        </Typography>
        
        <Box sx={{ my: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Detalhes da Transação
          </Typography>
          <Typography variant="body2">
            ID da Transação: {paymentInfo?.transactionId}
          </Typography>
          <Typography variant="body2">
            Status: {paymentInfo?.status}
          </Typography>
          <Typography variant="body2">
            Valor: R$ {(paymentInfo?.amount || 0).toFixed(2)}
          </Typography>
          <Typography variant="body2">
            Método de Pagamento: {paymentInfo?.paymentMethod}
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleBackToStore}
        >
          Voltar para a Loja
        </Button>
      </Box>
    );
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Confirmação de Pagamento
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          {renderContent()}
        </Paper>
      </Box>
    </Container>
  );
};

export default SuccessPage;