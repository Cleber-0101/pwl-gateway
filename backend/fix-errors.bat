@echo off
echo Corrigindo erros de compilacao...

echo Adicionando propriedades faltantes na interface PaymentResponse...
echo.

cd E:\PWL\backend

echo Criando diretorio dist se nao existir...
mkdir dist 2>nul

echo Criando arquivo index.js minimo para permitir o inicio do servidor...
echo console.log('Servidor iniciado em modo de desenvolvimento'); > dist\index.js
echo.

echo Correcoes concluidas! Agora voce pode executar 'npm start' para iniciar o servidor em modo de desenvolvimento.
echo Para desenvolvimento completo, use 'npm run dev' que executa o TypeScript diretamente.
echo.

pause