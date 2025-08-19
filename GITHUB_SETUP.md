# 📚 Como Subir o Projeto para o GitHub

## 🎯 Passo a Passo Completo

### 1. Criar Repositório no GitHub

1. **Acesse:** https://github.com
2. **Faça login** na sua conta GitHub
3. **Clique em "New"** (botão verde) ou no ícone "+" no canto superior direito
4. **Preencha os dados:**
   - **Repository name:** `pwl-gateway` (ou o nome que preferir)
   - **Description:** `Sistema completo de gateway de pagamentos com React e Node.js`
   - **Visibilidade:** Public (para acesso de qualquer computador) ou Private
   - **NÃO marque:** "Add a README file" (já temos um)
   - **NÃO marque:** "Add .gitignore" (já temos um)
   - **NÃO marque:** "Choose a license"
5. **Clique em "Create repository"**

### 2. Conectar o Repositório Local ao GitHub

Após criar o repositório, o GitHub mostrará instruções. Execute estes comandos no terminal:

```bash
# Adicionar o repositório remoto (substitua SEU_USUARIO pelo seu username)
git remote add origin https://github.com/SEU_USUARIO/pwl-gateway.git

# Renomear a branch principal para 'main' (padrão atual do GitHub)
git branch -M main

# Enviar o código para o GitHub
git push -u origin main
```

### 3. Comandos Completos (Copie e Cole)

**⚠️ IMPORTANTE:** Substitua `SEU_USUARIO` pelo seu username do GitHub!

```bash
cd E:\PWL
git remote add origin https://github.com/SEU_USUARIO/pwl-gateway.git
git branch -M main
git push -u origin main
```

### 4. Verificar se Funcionou

1. **Atualize a página** do seu repositório no GitHub
2. **Você deve ver:** todos os arquivos do projeto
3. **O README.md** será exibido automaticamente na página principal

## 🌐 Acessar de Qualquer Computador

### Clonar o Repositório

```bash
# Clonar o repositório
git clone https://github.com/SEU_USUARIO/pwl-gateway.git
cd pwl-gateway

# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

### Executar o Projeto

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Acesso:** http://localhost:3000

## 🔧 Configurações Adicionais

### Variáveis de Ambiente

Se você usar variáveis de ambiente sensíveis, crie arquivos `.env` localmente (eles não serão enviados ao GitHub devido ao `.gitignore`):

**Backend (.env):**
```env
PORT=3002
JWT_SECRET=pwl-gateway-secret-key
WEBHOOK_SECRET=secret
NODE_ENV=development
```

**Frontend (.env.development):**
```env
REACT_APP_API_URL=http://localhost:3002/api
REACT_APP_ENV=development
```

### Deploy Automático (Opcional)

Para deploy automático, você pode usar:
- **Vercel** (frontend)
- **Heroku** (backend)
- **Netlify** (frontend)
- **Railway** (backend)

## 🚨 Troubleshooting

### Erro: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/pwl-gateway.git
```

### Erro: "failed to push"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Erro: "Authentication failed"
- Use **Personal Access Token** em vez de senha
- Ou configure **SSH keys**

## 📱 Acesso Mobile

Para acessar de dispositivos móveis na mesma rede:

1. **Descubra seu IP local:**
   ```bash
   ipconfig
   ```

2. **Acesse:** `http://SEU_IP:3000`

## 🎉 Pronto!

Agora você pode:
- ✅ Acessar o código de qualquer computador
- ✅ Colaborar com outros desenvolvedores
- ✅ Ter backup automático do código
- ✅ Controlar versões e mudanças
- ✅ Fazer deploy em serviços de hospedagem

---

**💡 Dica:** Sempre faça `git add .`, `git commit -m "mensagem"` e `git push` após fazer mudanças no código!