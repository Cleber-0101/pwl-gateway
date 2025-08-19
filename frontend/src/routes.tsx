import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CheckoutPage from './pages/checkout/CheckoutPage';
import SuccessPage from './pages/checkout/SuccessPage';
import ErrorPage from './pages/checkout/ErrorPage';
import StatusPage from './pages/checkout/StatusPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { AuthService } from './services/auth.service';

// Componente para verificar autenticação
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <RequireAuth>
          <DashboardPage />
        </RequireAuth>
      } />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/checkout/success" element={<SuccessPage />} />
      <Route path="/checkout/error" element={<ErrorPage />} />
      <Route path="/checkout/status" element={<StatusPage />} />
    </Routes>
  );
};

export default AppRoutes;