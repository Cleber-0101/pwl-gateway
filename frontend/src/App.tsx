import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import { PaymentProvider } from './contexts/PaymentContext';
import AppRoutes from './routes';
import AdminLoginShortcut from './components/common/AdminLoginShortcut';

// Tema personalizado para o Material UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Verde
    },
    secondary: {
      main: '#1976d2', // Azul
    },
    error: {
      main: '#d32f2f', // Vermelho
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PaymentProvider>
        <Container>
          <AppRoutes />
          <AdminLoginShortcut position="bottom-right" />
        </Container>
      </PaymentProvider>
    </ThemeProvider>
  );
}

export default App;