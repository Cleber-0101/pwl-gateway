import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const errorMessage = params.get('message') || 'Ocorreu um erro durante o processamento do pagamento.';

  const handleBackToCheckout = () => {
    navigate('/checkout');
  };

  const handleBackToStore = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Erro no Pagamento
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box textAlign="center">
            <Typography variant="h6" color="error" gutterBottom>
              Não foi possível processar seu pagamento
            </Typography>
            
            <Typography variant="body1" paragraph>
              {errorMessage}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleBackToCheckout}
                sx={{ mr: 2 }}
              >
                Tentar Novamente
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleBackToStore}
              >
                Voltar para a Loja
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ErrorPage;