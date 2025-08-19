import React from 'react';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Box, Paper, Grid } from '@mui/material';
import { PaymentMethod } from '../../types/payment.types';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ReceiptIcon from '@mui/icons-material/Receipt';

interface PaymentMethodSelectionProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  selectedMethod,
  onMethodChange,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Escolha a forma de pagamento
      </Typography>
      
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          aria-label="payment-method"
          name="payment-method"
          value={selectedMethod}
          onChange={onMethodChange}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={selectedMethod === PaymentMethod.CREDIT_CARD ? 3 : 1}
                sx={{ 
                  p: 2, 
                  border: selectedMethod === PaymentMethod.CREDIT_CARD ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  borderRadius: 1,
                  transition: 'all 0.3s'
                }}
              >
                <FormControlLabel
                  value={PaymentMethod.CREDIT_CARD}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CreditCardIcon sx={{ mr: 1 }} />
                      <Typography>Cartão de Crédito</Typography>
                    </Box>
                  }
                  sx={{ width: '100%' }}
                />
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={selectedMethod === PaymentMethod.PIX ? 3 : 1}
                sx={{ 
                  p: 2, 
                  border: selectedMethod === PaymentMethod.PIX ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  borderRadius: 1,
                  transition: 'all 0.3s'
                }}
              >
                <FormControlLabel
                  value={PaymentMethod.PIX}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <QrCodeIcon sx={{ mr: 1 }} />
                      <Typography>PIX</Typography>
                    </Box>
                  }
                  sx={{ width: '100%' }}
                />
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={selectedMethod === PaymentMethod.BOLETO ? 3 : 1}
                sx={{ 
                  p: 2, 
                  border: selectedMethod === PaymentMethod.BOLETO ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  borderRadius: 1,
                  transition: 'all 0.3s'
                }}
              >
                <FormControlLabel
                  value={PaymentMethod.BOLETO}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ReceiptIcon sx={{ mr: 1 }} />
                      <Typography>Boleto</Typography>
                    </Box>
                  }
                  sx={{ width: '100%' }}
                />
              </Paper>
            </Grid>
          </Grid>
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default PaymentMethodSelection;