import { baseApi } from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    role: string;
  };
  message?: string;
}

export class AuthService {
  /**
   * Realiza login do usuário
   * @param credentials Credenciais de login
   * @returns Resposta do login
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await baseApi.post('/auth/login', credentials);
      
      if (response.data.success && response.data.token) {
        // Salva o token no localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Erro ao fazer login'
        };
      }
      return {
        success: false,
        message: 'Erro ao conectar com o servidor'
      };
    }
  }

  /**
   * Realiza logout do usuário
   */
  static logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns true se autenticado
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  /**
   * Obtém o usuário atual
   * @returns Dados do usuário ou null
   */
  static getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Login rápido para desenvolvimento (bypass)
   * @returns Resposta simulada de login
   */
  static async quickLogin(): Promise<LoginResponse> {
    const mockUser = {
      id: '1',
      username: 'admin',
      role: 'admin'
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    // Salva no localStorage
    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    return {
      success: true,
      token: mockToken,
      user: mockUser,
      message: 'Login realizado com sucesso (modo desenvolvimento)'
    };
  }
}