import React, { useState } from 'react';
import { Fab, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate } from 'react-router-dom';

interface AdminLoginShortcutProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const AdminLoginShortcut: React.FC<AdminLoginShortcutProps> = ({ 
  position = 'bottom-right' 
}) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogin = () => {
    // Preencher automaticamente as credenciais de administrador
    localStorage.setItem('user', JSON.stringify({
      email: 'admin@pwl.com',
      role: 'admin',
      name: 'Administrador'
    }));
    navigate('/admin/dashboard');
    handleClose();
  };

  const handleGoToLogin = () => {
    navigate('/login');
    handleClose();
  };

  // Definir posição do botão flutuante
  const getPosition = () => {
    switch (position) {
      case 'bottom-right':
        return { bottom: 16, right: 16 };
      case 'bottom-left':
        return { bottom: 16, left: 16 };
      case 'top-right':
        return { top: 16, right: 16 };
      case 'top-left':
        return { top: 16, left: 16 };
      default:
        return { bottom: 16, right: 16 };
    }
  };

  return (
    <>
      <Tooltip title="Acesso Administrativo" placement="left">
        <Fab
          color="primary"
          aria-label="admin"
          sx={{
            position: 'fixed',
            ...getPosition(),
            zIndex: 1000
          }}
          onClick={handleOpen}
        >
          <AdminPanelSettingsIcon />
        </Fab>
      </Tooltip>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Acesso Administrativo</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 1 }}>
            <Typography variant="body1" gutterBottom>
              Escolha uma opção de acesso administrativo:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Login rápido: Acessa diretamente com credenciais de teste<br />
              • Página de login: Vai para a tela de login
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleGoToLogin} color="primary">
            Ir para Login
          </Button>
          <Button onClick={handleLogin} variant="contained" color="primary">
            Login Rápido (Admin)
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminLoginShortcut;