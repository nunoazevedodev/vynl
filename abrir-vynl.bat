@echo off
title vynl
cd /d "%~dp0"

echo.
echo  Fechando o vynl antigo (se estiver aberto)...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /PID %%p /F >nul 2>&1

echo  Baixando a versao mais nova do GitHub...
git pull

echo  Instalando o que for necessario...
call npm install --no-audit --no-fund

echo.
echo  Abrindo o vynl no navegador. Deixe esta janela aberta enquanto usa.
echo.
start "" http://localhost:5173
call npm run dev
pause
