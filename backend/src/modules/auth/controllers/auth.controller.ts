import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
}

/**
 * Controlador para as rotas de autenticação
 */
export class AuthController {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'pwl-gateway-secret-key';
  private readonly JWT_EXPIRES_IN = '24h';

  // Usuários mock para desenvolvimento
  private readonly mockUsers: Array<User & { password: string }> = [
    {
      id: '1',
      username: 'admin',
      password: 'admin',
      role: 'admin'
    },
    {
      id: '2',
      username: 'user',
      password: 'user',
      role: 'user'
    }
  ];

  /**
   * Realiza login do usuário
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password }: LoginRequest = req.body;

      // Validação básica
      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'Username e password são obrigatórios'
        });
        return;
      }

      // Busca usuário (mock)
      const user = this.mockUsers.find(
        u => u.username === username && u.password === password
      );

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
        return;
      }

      // Gera token JWT
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      );

      // Remove password da resposta
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        token,
        user: userWithoutPassword
      });
    } catch (error: any) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Verifica se o token é válido
   */
  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Token não fornecido'
        });
        return;
      }

      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, this.JWT_SECRET) as any;
        
        res.status(200).json({
          success: true,
          user: {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
          }
        });
      } catch (jwtError) {
        res.status(401).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }
    } catch (error: any) {
      console.error('Erro na verificação do token:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Realiza logout (invalidação do token seria feita em um sistema real)
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Em um sistema real, aqui invalidaríamos o token
      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}