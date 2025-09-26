#!/bin/bash

# SiteMind Local Development Setup Script
# This script sets up the project for local development with LMStudio

echo "🚀 Setting up SiteMind for local development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Install agent dependencies
echo "📦 Installing AI agent dependencies..."
cd api-agent
npm install --legacy-peer-deps
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created. Please update the DATABASE_URL with your PostgreSQL connection string."
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Check if PostgreSQL is running (optional)
echo "🔍 Checking database connection..."
if command -v psql &> /dev/null; then
    echo "💡 PostgreSQL client found. Make sure your database is running and accessible."
    echo "💡 Run 'npx prisma db push' to create the database schema."
else
    echo "💡 PostgreSQL client not found. Make sure PostgreSQL is installed and running."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start LMStudio and load your Llama 3.2 8x3B MoE model"
echo "2. Make sure LMStudio is running on http://localhost:1234"
echo "3. Update your .env file with the correct DATABASE_URL"
echo "4. Run 'npx prisma db push' to create the database schema"
echo "5. Start the development servers:"
echo "   - Main app: npm run dev"
echo "   - AI agent: cd api-agent && npm run dev"
echo ""
echo "🌐 Your app will be available at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Admin: http://localhost:3000/admin"
echo "   - AI Agent: http://localhost:3001"
echo ""
echo "🤖 AI Agent Console: http://localhost:3000/admin/agent/console"
