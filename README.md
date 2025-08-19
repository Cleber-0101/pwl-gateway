# PWL Gateway - Sistema de Pagamentos

Sistema completo de gateway de pagamentos com frontend React e backend Node.js/Express.

## 🚀 Funcionalidades

- ✅ Sistema de autenticação JWT
- ✅ Tela de login moderna e responsiva
- ✅ Dashboard administrativo
- ✅ Gateway de pagamentos
- ✅ Processamento de transações
- ✅ Sistema de reembolsos
- ✅ Arquitetura modular

## 🛠️ Tecnologias

### Frontend
- React 18
- TypeScript
- Material-UI
- Axios
- React Router
- Formik + Yup

### Backend
- Node.js
- Express
- TypeScript
- JWT (jsonwebtoken)
- CORS
- Helmet (segurança)
- Morgan (logs)
- Rate Limiting

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd PWL
```

### 2. Instale as dependências do backend
```bash
cd backend
npm install
```

### 3. Instale as dependências do frontend
```bash
cd ../frontend
npm install
```

## 🚀 Executando o projeto

### Opção 1: Executar manualmente

#### Backend (Terminal 1)
```bash
cd backend
npm run dev
```
O backend rodará na porta 3002.

#### Frontend (Terminal 2)
```bash
cd frontend
npm start
```
O frontend rodará na porta 3000 com proxy configurado.

### Opção 2: Usar scripts batch (Windows)

#### Backend
```bash
cd backend
.\start-dev.bat
```

#### Frontend
```bash
cd frontend
.\setup.bat
```

## 🌐 Acesso ao Sistema

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3002

### 🔐 Credenciais de Teste

**Administrador:**
- Username: `admin`
- Password: `admin`

**Usuário:**
- Username: `user`
- Password: `user`

## 📁 Estrutura do Projeto

```
PWL/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   └── payments/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── routes.tsx
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Backend (.env)
```env
PORT=3002
JWT_SECRET=pwl-gateway-secret-key
WEBHOOK_SECRET=secret
NODE_ENV=development
```

#### Frontend (.env.development)
```env
REACT_APP_API_URL=http://localhost:3002/api
REACT_APP_ENV=development
```

## 🏗️ Arquitetura

### Backend
- **Modular:** Cada funcionalidade em módulos separados
- **Middleware:** CORS, Helmet, Rate Limiting
- **Autenticação:** JWT com refresh tokens
- **Validação:** Validação de entrada em todas as rotas

### Frontend
- **Proxy:** Configurado para redirecionar chamadas da API
- **Interceptadores:** Axios configurado com interceptadores para tokens
- **Roteamento:** React Router com proteção de rotas
- **Estado:** Context API para gerenciamento de estado

## 🔒 Segurança

- ✅ Rate limiting
- ✅ Helmet para headers de segurança
- ✅ CORS configurado
- ✅ JWT para autenticação
- ✅ Validação de entrada
- ✅ Sanitização de dados

## 📝 API Endpoints

### Autenticação
- `POST /auth/login` - Login do usuário
- `GET /auth/verify` - Verificar token
- `POST /auth/logout` - Logout

### Pagamentos
- `POST /api/payments/process` - Processar pagamento
- `GET /api/payments/status/:id` - Status do pagamento
- `POST /api/payments/refund` - Processar reembolso

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma issue no GitHub.

---

**Desenvolvido com ❤️ para facilitar integrações de pagamento**