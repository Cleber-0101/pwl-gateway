import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  AccountCircle,
  Payment,
  Analytics,
  Settings,
  ExitToApp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se está autenticado
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Carrega dados do usuário
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, [navigate]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    AuthService.logout();
  };

  const handleNavigateToCheckout = () => {
    navigate('/checkout');
  };

  if (!user) {
    return null; // ou um loading spinner
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PWL Gateway - Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Olá, {user.username}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} />
                Sair
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Bem-vindo ao PWL Gateway
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sistema de gateway de pagamentos integrado
          </Typography>
        </Box>

        {/* Cards Grid */}
        <Grid container spacing={3}>
          {/* Checkout Card */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Payment sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Sistema de Checkout
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Acesse o sistema de checkout transparente com múltiplos métodos de pagamento.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleNavigateToCheckout}
                >
                  Acessar Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Analytics Card */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Analytics sx={{ mr: 2, color: 'success.main' }} />
                  <Typography variant="h6">
                    Relatórios
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Visualize relatórios e estatísticas das transações processadas.
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  disabled
                >
                  Em Breve
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Settings Card */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Settings sx={{ mr: 2, color: 'warning.main' }} />
                  <Typography variant="h6">
                    Configurações
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Configure adquirentes, webhooks e outras opções do gateway.
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  disabled
                >
                  Em Breve
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Status Section */}
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status do Sistema
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: 'success.main',
                        mr: 1
                      }}
                    />
                    <Typography variant="body2">
                      Frontend: Online
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: 'success.main',
                        mr: 1
                      }}
                    />
                    <Typography variant="body2">
                      Backend API: Online
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardPage;