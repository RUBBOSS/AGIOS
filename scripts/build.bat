@echo off
setlocal
cd /d "%~dp0.."

if not exist "node_modules\esbuild" (
  echo [agios] installing frontend build tool...
  call npm install --no-audit --no-fund -q || goto :fail
)

call npm run build || goto :fail
echo [agios] frontend built
exit /b 0

:fail
echo [agios] build failed
exit /b 1
