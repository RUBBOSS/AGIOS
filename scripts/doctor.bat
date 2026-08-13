@echo off
setlocal
cd /d "%~dp0.."

if not exist ".venv\Scripts\python.exe" (
  echo [agios] virtual environment missing; run scripts\start-agios.bat first
  exit /b 1
)

".venv\Scripts\python.exe" -m agios doctor --config configs\agios.json
exit /b %errorlevel%
