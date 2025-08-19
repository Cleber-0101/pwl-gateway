import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Typography, 
  Grid,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import CreditCardForm from './CreditCardForm';
import PixForm from './PixForm';
import BoletoForm from './BoletoForm';
import { usePayment } from '../../contexts/PaymentContext';
import { PaymentMethod, TransactionStatus } from '../../types/payment.types';
import PaymentMethodSelection from './PaymentMethodSelection';

const steps = ['Informações de Pagamento', 'Revisão', 'Confirmação'];

const CheckoutForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CREDIT_CARD);
  const { paymentResponse, setPaymentData, loading, error, setError } = usePayment();
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Função para lidar com a mudança do método de pagamento
  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPaymentMethod(event.target.value as PaymentMethod);
    // Limpar erros anteriores ao mudar o método de pagamento
    setError(null);
  };

  // Função para avançar para o próximo passo
  const handleNext = () => {
    // Se estamos na etapa de revisão e temos uma resposta de pagamento, verificar o status
    if (activeStep === 1 && paymentResponse) {
      if (paymentResponse.status === TransactionStatus.APPROVED || 
          paymentResponse.status === TransactionStatus.PENDING) {
        setPaymentSuccess(true);
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } else {
        // Se o pagamento falhou, mostrar erro e não avançar
        setError('O pagamento não foi aprovado. Por favor, tente novamente.');
      }
    } else {
      // Avançar normalmente para outras etapas
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  // Função para voltar ao passo anterior
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    // Limpar erros ao voltar
    setError(null);
  };

  // Função para reiniciar o processo de checkout
  const handleReset = () => {
    setActiveStep(0);
    setSelectedPaymentMethod(PaymentMethod.CREDIT_CARD);
    // Resetar os dados de pagamento
    setPaymentData({
      amount: 0,
      currency: 'BRL',
      description: '',
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
          country: 'BR',
          zipCode: ''
        }
      },
      items: [],
      metadata: {}
    });
  };

  // Renderiza o formulário de pagamento com base no método selecionado
  const renderPaymentForm = () => {
    switch (selectedPaymentMethod) {
      case PaymentMethod.CREDIT_CARD:
        return <CreditCardForm />;
      case PaymentMethod.PIX:
        return <PixForm />;
      case PaymentMethod.BOLETO:
        return <BoletoForm />;
      default:
        return <Typography>Método de pagamento não suportado</Typography>;
    }
  };

  // Renderiza o conteúdo com base no passo atual
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <PaymentMethodSelection 
              selectedMethod={selectedPaymentMethod}
              onMethodChange={handlePaymentMethodChange}
            />
            
            <Divider sx={{ my: 3 }} />
            
            {renderPaymentForm()}
          </Box>
        );
      case 1:
        return (
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Typography variant="h6" gutterBottom>
              Revisão do Pedido
            </Typography>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Método de Pagamento</Typography>
                  <Typography variant="body2">
                    {selectedPaymentMethod === PaymentMethod.CREDIT_CARD && 'Cartão de Crédito'}
                    {selectedPaymentMethod === PaymentMethod.PIX && 'PIX'}
                    {selectedPaymentMethod === PaymentMethod.BOLETO && 'Boleto Bancário'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Status</Typography>
                  <Typography variant="body2">
                    {paymentResponse?.status === TransactionStatus.APPROVED ? 'Aprovado' : 
                     paymentResponse?.status === TransactionStatus.PENDING ? 'Pendente' : 
                     paymentResponse?.status === TransactionStatus.DECLINED ? 'Rejeitado' : 
                     'Aguardando processamento'}
                  </Typography>
                </Grid>
                {paymentResponse?.transactionId && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">ID da Transação</Typography>
                    <Typography variant="body2">{paymentResponse.transactionId}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Voltar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Confirmar
              </Button>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            {paymentSuccess ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                Seu pagamento foi processado com sucesso!
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Ocorreu um problema com seu pagamento. Por favor, tente novamente.
              </Alert>
            )}
            <Typography variant="h5" gutterBottom>
              Pagamento {paymentResponse?.status === TransactionStatus.APPROVED ? 'Aprovado' : 'Processado'}
            </Typography>
            <Typography variant="subtitle1">
              {selectedPaymentMethod === PaymentMethod.CREDIT_CARD && 
                'Seu pagamento com cartão de crédito foi processado com sucesso.'}
              {selectedPaymentMethod === PaymentMethod.PIX && 
                'Aguardando confirmação do pagamento via PIX.'}
              {selectedPaymentMethod === PaymentMethod.BOLETO && 
                'Boleto gerado com sucesso. Após o pagamento, a compensação pode levar até 3 dias úteis.'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleReset}
              sx={{ mt: 3 }}
            >
              Realizar Novo Pagamento
            </Button>
          </Box>
        );
      default:
        return <Typography>Passo desconhecido</Typography>;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Checkout Transparente
      </Typography>
      <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box>
        {getStepContent(activeStep)}
        {activeStep === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <div></div> {/* Espaço vazio para manter o alinhamento */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={loading || !paymentResponse}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Processando...
                </>
              ) : (
                'Próximo'
              )}
            </Button>
          </Box>
        )}
        {activeStep === steps.length - 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              href="/"
            >
              Voltar para a Loja
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default CheckoutForm;