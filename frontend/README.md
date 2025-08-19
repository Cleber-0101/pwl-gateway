# PWL - Gateway de Pagamento White Label - Frontend

## Visão Geral

Este é o frontend do Gateway de Pagamento White Label (PWL), uma solução completa para processamento de pagamentos online. O frontend implementa um checkout transparente que permite aos usuários realizarem pagamentos via cartão de crédito, PIX e boleto bancário.

## Tecnologias Utilizadas

- React
- TypeScript
- Material UI
- React Router
- Formik (para gerenciamento de formulários)
- Yup (para validação de formulários)
- Axios (para requisições HTTP)

## Estrutura do Projeto

```
/frontend
  /src
    /components
      /checkout
        - CheckoutForm.tsx (Formulário principal de checkout)
        - CreditCardForm.tsx (Formulário de pagamento com cartão)
        - PixForm.tsx (Formulário de pagamento via PIX)
        - BoletoForm.tsx (Formulário de pagamento via boleto)
    /contexts
      - PaymentContext.tsx (Contexto para gerenciamento do estado de pagamento)
    /hooks
      - usePayment.ts (Hook para acessar o contexto de pagamento)
    /pages
      /checkout
        - CheckoutPage.tsx (Página principal de checkout)
        - SuccessPage.tsx (Página de sucesso após pagamento)
        - ErrorPage.tsx (Página de erro no pagamento)
        - StatusPage.tsx (Página de status do pagamento)
    /services
      - payment.service.ts (Serviço para comunicação com a API de pagamentos)
    /types
      - payment.types.ts (Tipos e interfaces para pagamentos)
    - App.tsx (Componente principal da aplicação)
    - index.tsx (Ponto de entrada da aplicação)
    - routes.tsx (Configuração de rotas)
```

## Funcionalidades

- Checkout transparente com múltiplos métodos de pagamento
- Validação de formulários em tempo real
- Integração com o backend para processamento de pagamentos
- Acompanhamento de status de pagamento em tempo real
- Interface responsiva e amigável ao usuário

## Como Executar

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm start
```

3. Acesse a aplicação em `http://localhost:3000`

## Integração com o Backend

O frontend se comunica com o backend através da API RESTful implementada no módulo de pagamentos. As principais rotas utilizadas são:

- `POST /api/payments/process` - Processar um novo pagamento
- `GET /api/payments/status/:id` - Verificar o status de um pagamento
- `POST /api/payments/refund` - Solicitar reembolso de um pagamento

## Fluxo de Pagamento

1. O usuário seleciona o método de pagamento desejado
2. Preenche os dados necessários para o método escolhido
3. Submete o formulário para processamento
4. O sistema exibe o status do pagamento e redireciona conforme o resultado

## Próximos Passos

- Implementação de testes unitários e de integração
- Melhorias na experiência do usuário
- Adição de novos métodos de pagamento
- Implementação de análise de fraude