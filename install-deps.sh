#!/bin/bash

echo "📦 Installing Hugamara Dependencies"
echo "===================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js is installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

echo "✅ All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure environment variables:"
echo "   - Backend: cp backend/.env.example backend/.env"
echo "   - Frontend: cp client/.env.example client/.env"
echo "2. Setup database: npm run db:setup"
echo "3. Start development: npm run dev"
