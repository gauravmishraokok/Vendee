@echo off
echo Starting Vendee Frontend...
echo.
cd frontend
echo Installing dependencies...
npm install
echo.
echo Starting development server...
npm run dev
pause
