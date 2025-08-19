import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface User {
  email: string;
  role: string;
  name: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      if (userData.role !== 'admin') {
        navigate('/login');
        return;
      }
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return null; // Ou um componente de carregamento
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Painel Administrativo
          </Typography>
          <Button variant="outlined" color="primary" onClick={handleLogout}>
            Sair
          </Button>
        </Box>

        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Bem-vindo, {user.name}!
          </Typography>
          <Typography variant="body1">
            Você está logado como administrador. Aqui você pode gerenciar todas as configurações do sistema.
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pedidos
                </Typography>
                <Typography variant="h4">24</Typography>
                <Typography variant="body2" color="text.secondary">
                  Pedidos realizados hoje
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Ver Detalhes</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Faturamento
                </Typography>
                <Typography variant="h4">R$ 4.500,00</Typography>
                <Typography variant="body2" color="text.secondary">
                  Faturamento do dia
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Ver Relatório</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Usuários
                </Typography>
                <Typography variant="h4">152</Typography>
                <Typography variant="body2" color="text.secondary">
                  Usuários ativos
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Gerenciar</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/checkout')}
          >
            Ir para Checkout
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default DashboardPage;