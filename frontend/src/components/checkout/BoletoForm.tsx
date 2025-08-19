import React, { useState } from 'react';
import { Formik, Form, Field, FormikHelpers, useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Grid, Typography, CircularProgress, Alert, Paper, Box } from '@mui/material';
import InputMask from 'react-input-mask';
import { usePayment } from '../../contexts/PaymentContext';
import { PaymentService } from '../../services/payment.service';
import { PaymentMethod } from '../../types/payment.types';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Validação do formulário de boleto
const validationSchema = Yup.object({
  buyerName: Yup.string()
    .required('Nome completo é obrigatório')
    .min(3, 'Nome muito curto'),
  buyerDocument: Yup.string()
    .required('CPF/CNPJ é obrigatório')
    .test('valid-document', 'CPF/CNPJ inválido', (value) => {
      // Validação simplificada, em produção usar biblioteca específica
      if (!value) return false;
      const digits = value.replace(/\D/g, '');
      return digits.length === 11 || digits.length === 14;
    }),
});

const BoletoForm: React.FC = () => {
  const { paymentData, setBoletoData, setPaymentResponse, loading, setLoading, error, setError } = usePayment();
  const [boletoUrl, setBoletoUrl] = useState<string>('');
  const [boletoBarCode, setBoletoBarCode] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formik = useFormik({
    initialValues: {
      buyerName: paymentData.customer?.name || '',
      buyerDocument: paymentData.customer?.document || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setLocalError(null);
        setError(null);

        // Configurar dados do boleto
        const boletoData = {
          buyerName: values.buyerName,
          buyerDocument: values.buyerDocument.replace(/\D/g, ''),
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias a partir de hoje
        };
        setBoletoData(boletoData);

        // Preparar dados do pagamento
        const paymentRequest = {
          ...paymentData,
          paymentMethod: PaymentMethod.BOLETO,
          boletoData
        };

        // Enviar requisição para a API
        const response = await PaymentService.processPayment(paymentRequest);
        setPaymentResponse(response);

        // Extrair dados do boleto
        if (response.paymentUrl) {
          setBoletoUrl(response.paymentUrl);
        }
        if (response.paymentCode) {
          setBoletoBarCode(response.paymentCode);
        }
      } catch (error: any) {
        setLocalError(error.message || 'Erro ao gerar boleto');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Função para copiar o código de barras para a área de transferência
  const handleCopyBarCode = () => {
    if (boletoBarCode) {
      navigator.clipboard.writeText(boletoBarCode)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000); // Reset após 3 segundos
        })
        .catch(err => {
          setLocalError('Erro ao copiar código de barras: ' + err.message);
        });
    }
  };

  // Renderização do formulário
  if (boletoUrl || boletoBarCode) {
    return (
      <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
        {(localError || error) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {localError || error}
          </Alert>
        )}
        
        <Typography variant="h6" gutterBottom>
          Boleto Gerado com Sucesso
        </Typography>
        
        {boletoUrl && (
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            href={boletoUrl} 
            target="_blank" 
            sx={{ mb: 2 }}
          >
            Visualizar Boleto
          </Button>
        )}
        
        {boletoBarCode && (
          <>
            <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
              Código de Barras:
            </Typography>
            
            <Grid container spacing={1} alignItems="center">
              <Grid item xs>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    wordBreak: 'break-all',
                    bgcolor: 'background.paper'
                  }}
                >
                  <Typography variant="body2">
                    {boletoBarCode}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyBarCode}
                  color={copied ? "success" : "primary"}
                >
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </Grid>
            </Grid>
          </>
        )}
        
        <Alert severity="info" sx={{ mt: 2 }}>
          O boleto vence em 3 dias. Após o pagamento, a confirmação pode levar até 3 dias úteis.
        </Alert>
      </Paper>
    );
  }

  return (
    <Box>
      {!boletoUrl ? (
        <>
          {(localError || error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError || error}
            </Alert>
          )}
          
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Pagamento via Boleto
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Preencha os dados abaixo para gerar o boleto bancário.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="buyerName"
                  name="buyerName"
                  label="Nome Completo"
                  variant="outlined"
                  value={formik.values.buyerName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.buyerName && Boolean(formik.errors.buyerName)}
                  helperText={formik.touched.buyerName && formik.errors.buyerName}
                  disabled={submitting || loading}
                />
              </Grid>

              <Grid item xs={12}>
                <InputMask
                  mask="999.999.999-99"
                  value={formik.values.buyerDocument}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={submitting || loading}
                >
                  {(inputProps: any) => (
                    <TextField
                      {...inputProps}
                      fullWidth
                      id="buyerDocument"
                      name="buyerDocument"
                      label="CPF"
                      variant="outlined"
                      error={formik.touched.buyerDocument && Boolean(formik.errors.buyerDocument)}
                      helperText={formik.touched.buyerDocument && formik.errors.buyerDocument}
                    />
                  )}
                </InputMask>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={submitting || loading}
                >
                  {submitting || loading ? (
                    <>
                      <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                      Processando...
                    </>
                  ) : (
                    'Gerar Boleto'
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </>
      ) : (
        <Box textAlign="center">
          <Typography variant="h6" gutterBottom>
            Boleto Gerado com Sucesso
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            href={boletoUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mb: 2 }}
          >
            Visualizar/Imprimir Boleto
          </Button>
          
          <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
            Linha Digitável:
          </Typography>
          
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
              {boletoBarCode}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={handleCopyBarCode}
            fullWidth
          >
            Copiar Linha Digitável
          </Button>
          
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            O boleto vence em 3 dias úteis. Após o pagamento, a compensação pode levar até 3 dias úteis.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BoletoForm;