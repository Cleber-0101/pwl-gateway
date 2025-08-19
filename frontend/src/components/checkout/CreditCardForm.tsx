import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Grid, MenuItem, FormControl, InputLabel, Select, FormHelperText, CircularProgress, Alert } from '@mui/material';
import InputMask from 'react-input-mask';
import { usePayment } from '../../contexts/PaymentContext';
import { PaymentService } from '../../services/payment.service';
import { PaymentMethod } from '../../types/payment.types';

// Validação do formulário de cartão de crédito
const validationSchema = Yup.object({
  cardNumber: Yup.string()
    .required('Número do cartão é obrigatório')
    .matches(/^[0-9]{16}$/, 'Número do cartão inválido'),
  holderName: Yup.string()
    .required('Nome do titular é obrigatório')
    .min(3, 'Nome muito curto'),
  expirationMonth: Yup.string()
    .required('Mês de expiração é obrigatório'),
  expirationYear: Yup.string()
    .required('Ano de expiração é obrigatório'),
  cvv: Yup.string()
    .required('CVV é obrigatório')
    .matches(/^[0-9]{3,4}$/, 'CVV inválido'),
  installments: Yup.number()
    .required('Número de parcelas é obrigatório')
    .min(1, 'Mínimo de 1 parcela'),
});

const CreditCardForm: React.FC = () => {
  const { paymentData, setCreditCardData, setPaymentResponse, loading, setLoading, error, setError } = usePayment();
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [cardBrand, setCardBrand] = useState<string>('');

  // Gerar opções de meses
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString().padStart(2, '0'), label: month.toString().padStart(2, '0') };
  });

  // Gerar opções de anos (atual + 20 anos)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => {
    const year = currentYear + i;
    return { value: year.toString(), label: year.toString() };
  });

  // Gerar opções de parcelas (1 a 12)
  const installmentsOptions = Array.from({ length: 12 }, (_, i) => {
    const installment = i + 1;
    const value = installment === 1 ? 'À vista' : `${installment}x de R$ ${(paymentData.amount / installment).toFixed(2)}`;
    return { value: installment, label: value };
  });
  
  // Detectar bandeira do cartão
  const detectCardBrand = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    if (cleanNumber.startsWith('4')) {
      setCardBrand('Visa');
    } else if (/^5[1-5]/.test(cleanNumber)) {
      setCardBrand('Mastercard');
    } else if (/^3[47]/.test(cleanNumber)) {
      setCardBrand('American Express');
    } else if (/^6(?:011|5)/.test(cleanNumber)) {
      setCardBrand('Discover');
    } else {
      setCardBrand('');
    }
  };

  // Processar pagamento com cartão de crédito
  const handleProcessPayment = async (values: any) => {
    try {
      setSubmitting(true);
      setLocalError(null);
      setError(null);

      // Configurar dados do cartão
      const creditCardData = {
        cardNumber: values.cardNumber.replace(/\D/g, ''),
        holderName: values.holderName,
        expirationMonth: values.expirationMonth,
        expirationYear: values.expirationYear,
        cvv: values.cvv,
        installments: values.installments
      };
      setCreditCardData(creditCardData);

      // Preparar dados do pagamento
      const paymentRequest = {
        ...paymentData,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        creditCardData
      };

      // Enviar requisição para a API
      const response = await PaymentService.processPayment(paymentRequest);
      setPaymentResponse(response);
    } catch (error: any) {
      setLocalError(error.message || 'Erro ao processar pagamento com cartão');
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      cardNumber: '',
      holderName: '',
      expirationMonth: '',
      expirationYear: '',
      cvv: '',
      installments: 1,
    },
    validationSchema,
    onSubmit: (values) => {
      handleProcessPayment(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      {localError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {localError}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <InputMask
            mask="9999 9999 9999 9999"
            value={formik.values.cardNumber}
              onChange={(e) => {
                formik.handleChange(e);
                detectCardBrand(e.target.value);
              }}
            onBlur={formik.handleBlur}
          >
            {(inputProps: any) => (
              <TextField
                {...inputProps}
                fullWidth
                id="cardNumber"
                name="cardNumber"
                label="Número do Cartão"
                variant="outlined"
                error={formik.touched.cardNumber && Boolean(formik.errors.cardNumber)}
                helperText={formik.touched.cardNumber && formik.errors.cardNumber}
              />
            )}
          </InputMask>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="holderName"
            name="holderName"
            label="Nome do Titular"
            variant="outlined"
            value={formik.values.holderName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.holderName && Boolean(formik.errors.holderName)}
            helperText={formik.touched.holderName && formik.errors.holderName}
          />
        </Grid>

        <Grid item xs={4}>
          <FormControl 
            fullWidth 
            variant="outlined"
            error={formik.touched.expirationMonth && Boolean(formik.errors.expirationMonth)}
          >
            <InputLabel id="expiration-month-label">Mês</InputLabel>
            <Select
              labelId="expiration-month-label"
              id="expirationMonth"
              name="expirationMonth"
              value={formik.values.expirationMonth}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Mês"
            >
              {months.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.expirationMonth && formik.errors.expirationMonth && (
              <FormHelperText>{formik.errors.expirationMonth}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={4}>
          <FormControl 
            fullWidth 
            variant="outlined"
            error={formik.touched.expirationYear && Boolean(formik.errors.expirationYear)}
          >
            <InputLabel id="expiration-year-label">Ano</InputLabel>
            <Select
              labelId="expiration-year-label"
              id="expirationYear"
              name="expirationYear"
              value={formik.values.expirationYear}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Ano"
            >
              {years.map((year) => (
                <MenuItem key={year.value} value={year.value}>
                  {year.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.expirationYear && formik.errors.expirationYear && (
              <FormHelperText>{formik.errors.expirationYear}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={4}>
          <InputMask
            mask="999"
            value={formik.values.cvv}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            {(inputProps: any) => (
              <TextField
                {...inputProps}
                fullWidth
                id="cvv"
                name="cvv"
                label="CVV"
                variant="outlined"
                error={formik.touched.cvv && Boolean(formik.errors.cvv)}
                helperText={formik.touched.cvv && formik.errors.cvv}
              />
            )}
          </InputMask>
        </Grid>

        <Grid item xs={12}>
          <FormControl 
            fullWidth 
            variant="outlined"
            error={formik.touched.installments && Boolean(formik.errors.installments)}
          >
            <InputLabel id="installments-label">Parcelas</InputLabel>
            <Select
              labelId="installments-label"
              id="installments"
              name="installments"
              value={formik.values.installments}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Parcelas"
            >
              {installmentsOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.installments && formik.errors.installments && (
              <FormHelperText>{formik.errors.installments}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
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
              <>Pagar com Cartão de Crédito {cardBrand && `(${cardBrand})`}</>
            )}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default CreditCardForm;