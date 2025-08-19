import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';

/**
 * Configura as rotas para o módulo de autenticação
 * @returns Router do Express configurado
 */
export function setupAuthRoutes(): Router {
  const router = Router();
  const authController = new AuthController();

  // Rota para login
  router.post('/login', (req, res) => authController.login(req, res));

  // Rota para verificar token
  router.get('/verify', (req, res) => authController.verifyToken(req, res));

  // Rota para logout
  router.post('/logout', (req, res) => authController.logout(req, res));

  return router;
}