#!/bin/bash

echo "🚀 Starting Hugamara Development Environment"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd client
    npm install
    cd ..
fi

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Please copy env.example to .env and configure your database."
    echo "   cd backend && cp env.example .env"
    echo "   Then edit .env with your database credentials."
    exit 1
fi

echo "✅ Dependencies are installed"
echo "✅ Environment files are configured"

echo ""
echo "🌐 Starting servers..."
echo "   Backend: http://localhost:8000"
echo "   Frontend: http://localhost:3000"
echo "   Health Check: http://localhost:8000/health"
echo "   Auth Test: http://localhost:3000/auth-test"
echo ""

# Start both servers using concurrently
npm run dev
