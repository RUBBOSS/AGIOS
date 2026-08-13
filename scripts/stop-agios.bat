@echo off
setlocal
cd /d "%~dp0.."

for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r ":9120.*LISTENING"') do (
  echo [agios] stopping process %%p
  taskkill /f /pid %%p >nul 2>&1
)
echo [agios] command center stopped
exit /b 0
