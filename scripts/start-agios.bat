@echo off
setlocal
cd /d "%~dp0.."

if not exist ".venv\Scripts\python.exe" (
  echo [agios] creating virtual environment...
  python -m venv .venv || goto :fail
  ".venv\Scripts\python.exe" -m pip install --upgrade pip -q || goto :fail
  ".venv\Scripts\python.exe" -m pip install -r requirements.txt -q || goto :fail
)

if not exist "apps\agios-command-center\dist\index.html" (
  echo [agios] frontend not built; run scripts\build.bat first
  goto :fail
)

set "AGIOS_JOURNAL=%LOCALAPPDATA%\hermes\agios\events.sqlite3"

echo [agios] starting command center on http://127.0.0.1:9120
start "AGIOS Command Center" /min ".venv\Scripts\python.exe" -m agios serve --host 127.0.0.1 --port 9120 --journal "%AGIOS_JOURNAL%"
exit /b 0

:fail
echo [agios] start failed
exit /b 1
