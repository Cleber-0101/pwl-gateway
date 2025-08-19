import React, { useState } from 'react';
import { Button, Typography, Box, CircularProgress, Alert, Paper, Grid } from '@mui/material';
import { usePayment } from '../../contexts/PaymentContext';
import { PaymentService } from '../../services/payment.service';
import { PaymentMethod, TransactionStatus } from '../../types/payment.types';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const PixForm: React.FC = () => {
  const { paymentData, setPixData, setPaymentResponse, loading, setLoading, error, setError } = usePayment();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [pixCode, setPixCode] = useState<string>('');
  const [expirationTime, setExpirationTime] = useState<number>(15); // 15 minutos por padrão
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Função para processar o pagamento via Pix
  const handleProcessPayment = async () => {
    try {
      setSubmitting(true);
      setLocalError(null);
      setError(null);

      // Configurar dados do Pix
      const pixData = {
        expirationTime: expirationTime
      };
      setPixData(pixData);

      // Preparar dados do pagamento
      const paymentRequest = {
        ...paymentData,
        paymentMethod: PaymentMethod.PIX,
        pixData
      };

      // Enviar requisição para a API
      const response = await PaymentService.processPayment(paymentRequest);
      setPaymentResponse(response);

      // Extrair dados do QR Code e código Pix
      if (response.paymentUrl) {
        setQrCodeUrl(response.paymentUrl);
      }
      if (response.paymentCode) {
        setPixCode(response.paymentCode);
      }
    } catch (error: any) {
      setLocalError(error.message || 'Erro ao processar pagamento via Pix');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Função para copiar o código Pix para a área de transferência
  const handleCopyPixCode = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000); // Reset após 3 segundos
        })
        .catch(err => {
          setLocalError('Erro ao copiar código PIX: ' + err.message);
        });
    }
  };

  return (
    <Box>
      {(localError || error) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {localError || error}
        </Alert>
      )}
      
      {!qrCodeUrl ? (
        <Box textAlign="center">
          <Typography variant="h6" gutterBottom>
            Pagamento via Pix
          </Typography>
          <Typography variant="body1" gutterBottom>
            Ao clicar em "Gerar QR Code", você receberá um QR Code para pagamento via Pix.
            O pagamento deve ser realizado em até {expirationTime} minutos.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleProcessPayment}
            disabled={submitting || loading}
            sx={{ mt: 2 }}
          >
            {submitting || loading ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                Processando...
              </>
            ) : 'Gerar QR Code'}
          </Button>
        </Box>
      ) : (
        <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Escaneie o QR Code
          </Typography>
          
          <Box 
            component="img" 
            src={qrCodeUrl} 
            alt="QR Code Pix" 
            sx={{ 
              width: '100%', 
              maxWidth: 250, 
              height: 'auto', 
              margin: '20px auto',
              display: 'block'
            }} 
          />
          
          <Typography variant="body1" gutterBottom>
            Ou copie o código Pix abaixo:
          </Typography>
          
          <Grid container spacing={1} alignItems="center">
            <Grid item xs>
              <Box 
                sx={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: 2, 
                  borderRadius: 1, 
                  marginBottom: 2,
                  wordBreak: 'break-all'
                }}
              >
                <Typography variant="body2">
                  {pixCode}
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyPixCode}
                color={copied ? "success" : "primary"}
              >
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            O QR Code expira em {expirationTime} minutos.
            Após o pagamento, você será redirecionado automaticamente.
          </Alert>
        </Paper>
      )}
    </Box>
  );
};

export default PixForm;