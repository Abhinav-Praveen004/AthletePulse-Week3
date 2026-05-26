@echo off
echo Starting SportsAI Development Server...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting development server...
echo Open your browser and go to: http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause