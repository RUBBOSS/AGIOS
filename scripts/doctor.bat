@echo off
setlocal
cd /d "%~dp0.."

if not exist ".venv\Scripts\python.exe" (
  echo [agios] virtual environment missing; run scripts\start-agios.bat first
  exit /b 1
)

set "AGIOS_JOURNAL=%LOCALAPPDATA%\hermes\agios\events.sqlite3"

".venv\Scripts\python.exe" -m agios --config configs\agios.json doctor --journal "%AGIOS_JOURNAL%"
exit /b %errorlevel%
