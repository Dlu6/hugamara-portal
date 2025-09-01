#!/bin/bash

echo "🚀 Setting up Hugamara Development Environment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "🔧 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please update with your database credentials."
else
    echo "✅ .env file already exists."
fi

# Go back to root
cd ..

echo ""
echo "🎯 Next Steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Start your MySQL database"
echo "3. Run: npm run db:setup (to create and seed database)"
echo "4. Run: npm run dev (to start both frontend and backend)"
echo ""
echo "🔑 Default login credentials:"
echo "   Email: admin@hugamara.com"
echo "   Password: password123"
echo ""
echo "📚 Development URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:8000"
echo "   Health Check: http://localhost:8000/health"
echo ""
echo "✨ Setup complete! Happy coding!"
