@echo off
REM SiteMind Local Development Setup Script for Windows
REM This script sets up the project for local development with LMStudio

echo 🚀 Setting up SiteMind for local development...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install --legacy-peer-deps

REM Install agent dependencies
echo 📦 Installing AI agent dependencies...
cd api-agent
npm install --legacy-peer-deps
cd ..

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy env.example .env
    echo ✅ .env file created. Please update the DATABASE_URL with your PostgreSQL connection string.
) else (
    echo ✅ .env file already exists
)

REM Generate Prisma client
echo 🗄️ Generating Prisma client...
npx prisma generate

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Start LMStudio and load your Llama 3.2 8x3B MoE model
echo 2. Make sure LMStudio is running on http://localhost:1234
echo 3. Update your .env file with the correct DATABASE_URL
echo 4. Run 'npx prisma db push' to create the database schema
echo 5. Start the development servers:
echo    - Main app: npm run dev
echo    - AI agent: cd api-agent ^&^& npm run dev
echo.
echo 🌐 Your app will be available at:
echo    - Frontend: http://localhost:3000
echo    - Admin: http://localhost:3000/admin
echo    - AI Agent: http://localhost:3001
echo.
echo 🤖 AI Agent Console: http://localhost:3000/admin/agent/console

pause
