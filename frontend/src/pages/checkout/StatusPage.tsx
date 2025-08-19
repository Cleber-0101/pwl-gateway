import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Button, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { PaymentService } from '../../services/payment.service';
import { PaymentResponse, TransactionStatus } from '../../types/payment.types';

const StatusPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchPaymentStatus = async (transactionId: string) => {
    try {
      const response = await PaymentService.getPaymentStatus(transactionId);
      setPaymentInfo(response);
      
      // Se o pagamento foi aprovado ou recusado, parar de verificar
      if (response.status === TransactionStatus.APPROVED || 
          response.status === TransactionStatus.DECLINED) {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        
        // Redirecionar para a página de sucesso se aprovado
        if (response.status === TransactionStatus.APPROVED) {
          navigate(`/checkout/success?transaction_id=${transactionId}`);
        }
      }
      
      return response;
    } catch (error: any) {
      setError(error.message || 'Erro ao buscar informações do pagamento');
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const transactionId = params.get('transaction_id');

    if (!transactionId) {
      setError('ID da transação não encontrado');
      setLoading(false);
      return;
    }

    // Buscar status inicial
    fetchPaymentStatus(transactionId);

    // Configurar polling para verificar o status a cada 5 segundos
    const interval = setInterval(() => {
      fetchPaymentStatus(transactionId);
    }, 5000);

    setPollingInterval(interval);

    // Limpar intervalo quando o componente for desmontado
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [location.search, navigate]);

  const handleBackToCheckout = () => {
    navigate('/checkout');
  };

  const getStatusMessage = () => {
    if (!paymentInfo) return '';
    
    switch (paymentInfo.status) {
      case TransactionStatus.PENDING:
        return 'Seu pagamento está sendo processado. Por favor, aguarde.';
      case TransactionStatus.APPROVED:
        return 'Seu pagamento foi aprovado com sucesso!';
      case TransactionStatus.DECLINED:
        return 'Seu pagamento foi recusado. Por favor, tente novamente com outro método de pagamento.';
      case TransactionStatus.CANCELED:
        return 'Seu pagamento foi cancelado.';
      case TransactionStatus.REFUNDED:
        return 'Seu pagamento foi reembolsado.';
      default:
        return 'Status do pagamento: ' + paymentInfo.status;
    }
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
            onClick={handleBackToCheckout}
            sx={{ mt: 3 }}
          >
            Voltar para o Checkout
          </Button>
        </Box>
      );
    }

    return (
      <Box textAlign="center">
        <Typography variant="h5" gutterBottom>
          Status do Pagamento
        </Typography>
        
        <Typography variant="body1" paragraph>
          {getStatusMessage()}
        </Typography>
        
        {paymentInfo && (
          <Box sx={{ my: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Detalhes da Transação
            </Typography>
            <Typography variant="body2">
              ID da Transação: {paymentInfo.transactionId}
            </Typography>
            <Typography variant="body2">
              Status: {paymentInfo.status}
            </Typography>
            <Typography variant="body2">
              Valor: R$ {(paymentInfo.amount || 0).toFixed(2)}
            </Typography>
            <Typography variant="body2">
              Método de Pagamento: {paymentInfo.paymentMethod}
            </Typography>
          </Box>
        )}
        
        {paymentInfo?.status === TransactionStatus.PENDING && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="textSecondary">
              Verificando status do pagamento...
            </Typography>
          </Box>
        )}
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleBackToCheckout}
          sx={{ mt: 2 }}
        >
          Voltar para o Checkout
        </Button>
      </Box>
    );
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Status do Pagamento
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          {renderContent()}
        </Paper>
      </Box>
    </Container>
  );
};

export default StatusPage;