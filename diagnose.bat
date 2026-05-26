@echo off
echo SportsAI Project Diagnostic Tool
echo ===================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    goto :end
) else (
    echo ✅ Node.js is installed
    node --version
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not available
    goto :end
) else (
    echo ✅ npm is available
    npm --version
)

echo.

REM Check if package.json exists
if exist "package.json" (
    echo ✅ package.json found
) else (
    echo ❌ package.json not found - make sure you're in the correct directory
    goto :end
)

REM Check if node_modules exists
if exist "node_modules" (
    echo ✅ node_modules directory exists
) else (
    echo ⚠️  node_modules directory not found
    echo Run 'npm install' to install dependencies
)

REM Check if src directory exists
if exist "src" (
    echo ✅ src directory exists
) else (
    echo ❌ src directory not found
    goto :end
)

REM Check key files
if exist "src\main.tsx" (
    echo ✅ main.tsx found
) else (
    echo ❌ main.tsx not found
)

if exist "src\App.tsx" (
    echo ✅ App.tsx found
) else (
    echo ❌ App.tsx not found
)

if exist "src\index.css" (
    echo ✅ index.css found
) else (
    echo ❌ index.css not found
)

if exist "vite.config.ts" (
    echo ✅ vite.config.ts found
) else (
    echo ❌ vite.config.ts not found
)

if exist "tailwind.config.ts" (
    echo ✅ tailwind.config.ts found
) else (
    echo ❌ tailwind.config.ts not found
)

echo.
echo Diagnostic complete!
echo.
echo If all checks pass, try running: npm run dev
echo If you see issues, try: npm install

:end
pause