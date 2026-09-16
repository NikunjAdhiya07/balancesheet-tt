@echo off
cd /d "%~dp0"
title Tiranga Club Accounts - Server

if not exist "node_modules" (
  echo It looks like setup has not been run yet.
  echo Please double-click "Setup (Run Once).bat" first.
  pause
  exit /b 1
)

if not exist ".next" (
  echo Building the application for the first time, please wait...
  call npm run build
)

echo Starting Tiranga Club Accounts...
echo Do NOT close this window while you are using the software.
echo Your browser will open automatically in a few seconds.
echo.

start "" cmd /c "timeout /t 3 >nul && start "" http://localhost:4321"
call npm start
