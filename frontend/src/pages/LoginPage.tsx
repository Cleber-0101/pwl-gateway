import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthService, LoginRequest } from '../services/auth.service';

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginRequest>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (field: keyof LoginRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Limpa mensagens de erro ao digitar
    if (error) setError(null);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        setSuccess(response.message || 'Login realizado com sucesso!');
        // Redireciona após 1 segundo
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setError(response.message || 'Credenciais inválidas');
      }
    } catch (err: any) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await AuthService.quickLogin();
      setSuccess(response.message || 'Acesso rápido realizado!');
      // Redireciona após 1 segundo
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError('Erro no acesso rápido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            boxShadow: 3,
            borderRadius: 2
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                PWL Gateway
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistema de Pagamentos
              </Typography>
            </Box>

            {/* Alerts */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Usuário"
                variant="outlined"
                value={credentials.username}
                onChange={handleInputChange('username')}
                disabled={loading}
                sx={{ mb: 2 }}
                autoComplete="username"
              />
              
              <TextField
                fullWidth
                label="Senha"
                type="password"
                variant="outlined"
                value={credentials.password}
                onChange={handleInputChange('password')}
                disabled={loading}
                sx={{ mb: 3 }}
                autoComplete="current-password"
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !credentials.username || !credentials.password}
                sx={{ mb: 2, py: 1.5 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Entrar'
                )}
              </Button>
            </Box>

            {/* Divider */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                ou
              </Typography>
            </Divider>

            {/* Quick Access */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleQuickLogin}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Acesso Rápido (Demo)'
              )}
            </Button>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Credenciais padrão: admin / admin
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;