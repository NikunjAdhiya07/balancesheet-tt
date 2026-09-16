@echo off
cd /d "%~dp0"
echo ============================================
echo   Tiranga Club Accounts - First Time Setup
echo ============================================
echo.
echo Installing required software (this can take a few minutes)...
call npm install
if errorlevel 1 (
  echo.
  echo Setup FAILED. Please make sure Node.js is installed, then try again.
  pause
  exit /b 1
)

echo.
echo Building the application...
call npm run build
if errorlevel 1 (
  echo.
  echo Build FAILED. Please contact support with the message above.
  pause
  exit /b 1
)

echo.
echo ============================================
echo   Setup complete! You can now double-click
echo   "Start Club Accounts.bat" to run the app.
echo ============================================
pause
