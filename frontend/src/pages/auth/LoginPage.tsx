import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Container,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface LoginCredentials {
  email: string;
  password: string;
}

const adminCredentials = {
  email: 'admin@pwl.com',
  password: 'admin123'
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulando uma chamada de API com um timeout
    setTimeout(() => {
      if (
        credentials.email === adminCredentials.email &&
        credentials.password === adminCredentials.password
      ) {
        // Salvar informações do usuário no localStorage
        localStorage.setItem('user', JSON.stringify({
          email: credentials.email,
          role: 'admin',
          name: 'Administrador'
        }));
        navigate('/admin/dashboard');
      } else {
        setError('Email ou senha inválidos');
      }
      setLoading(false);
    }, 1000);
  };

  const handleQuickLogin = () => {
    setCredentials(adminCredentials);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Login Administrativo
        </Typography>
        <Paper elevation={3} sx={{ p: 4, width: '100%', mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <TextField
              label="Senha"
              variant="outlined"
              fullWidth
              margin="normal"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="text"
              color="secondary"
              onClick={handleQuickLogin}
              disabled={loading}
            >
              Preencher com login de teste
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;