# 🏨 Hugamara Hospitality Management System

A comprehensive hospitality management dashboard designed specifically for Hugamara's 6 outlets in Uganda, featuring real-time operations management, inventory tracking, and financial reporting with native Ugandan Shilling (UGX) support.

## 🌟 Features

### 🎯 **Core Management**
- **Multi-Outlet Support**: Manage 6 different Hugamara locations
- **Real-time Dashboard**: Live updates on operations, revenue, and inventory
- **User Management**: Role-based access control (Admin, Manager, Supervisor, Staff)
- **Authentication**: Secure JWT-based login system

### 📊 **Operations Dashboard**
- **Reservation Management**: Table booking, guest tracking, and scheduling
- **Order Processing**: Real-time order management and payment processing
- **Inventory Control**: Stock tracking, low-stock alerts, and expiry management
- **Financial Reporting**: Revenue analytics with UGX currency support
- **Staff Management**: Shift tracking and performance monitoring

### 🏪 **Outlet-Specific Features**
- **Table Management**: Real-time table status and availability
- **Menu Management**: Item availability, pricing, and performance tracking
- **Guest Services**: Customer relationship management and feedback
- **Support Tickets**: Issue tracking and resolution management

### 🇺🇬 **Uganda Localization**
- **Currency**: Native Ugandan Shilling (UGX) support
- **Timezone**: Africa/Kampala (UTC +03:00)
- **Regional Settings**: Optimized for Ugandan hospitality industry

## 🚀 Technology Stack

### **Frontend**
- **React 18** with functional components and hooks
- **Redux Toolkit** for state management
- **Tailwind CSS** for modern, responsive design
- **Lucide React** for beautiful icons
- **React Router** for navigation

### **Backend**
- **Node.js** with Express.js framework
- **MySQL** database with Sequelize ORM
- **JWT** authentication and authorization
- **Socket.io** for real-time updates
- **bcryptjs** for password security

### **Development Tools**
- **Nodemon** for backend auto-reload
- **Concurrently** for running frontend and backend simultaneously
- **ES6 Modules** throughout the codebase

## 📋 Prerequisites

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **MySQL** >= 8.0
- **Git** for version control

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Dlu6/hugamara-hospitality-app.git
cd hugamara-hospitality-app
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd .. && npm install
```

### 3. Database Setup
```bash
# Start MySQL service
brew services start mysql

# Create database
mysql -u root -p
CREATE DATABASE hugamara_dev;
CREATE DATABASE hugamara_test;
```

### 4. Environment Configuration
Create `.env` files in both root and backend directories:

**Root `.env`:**
```env
NODE_ENV=development
DB_USER=root
DB_PASSWORD=
DB_NAME=hugamara_dev
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=your-secret-key-here
```

**Backend `.env`:**
```env
NODE_ENV=development
DB_USER=root
DB_PASSWORD=
DB_NAME=hugamara_dev
DB_HOST=127.0.0.1
DB_PORT=3306
JWT_SECRET=your-secret-key-here
PORT=8000
```

### 5. Database Synchronization
```bash
# From the root directory
npm run db:setup
```

### 6. Seed Data (Optional)
```bash
# Insert sample data
cd backend
node insert-seed-data.js
```

## 🚀 Running the Application

### Development Mode (Both Frontend & Backend)
```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000/api
- **Health Check**: http://localhost:8000/health

### Individual Services
```bash
# Backend only
npm run server

# Frontend only
npm run start

# Backend development
npm run backend:dev
```

## 🔐 Default Login Credentials

After running the seed data:
- **Email**: `admin@hugamara.com`
- **Password**: `password123`
- **Outlet**: CS (Server Room)

## 📁 Project Structure

```
hugamara-hospitality-app/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Main application pages
│   ├── store/             # Redux store and slices
│   ├── services/          # API service functions
│   └── utils/             # Utility functions (including currency)
├── backend/               # Node.js backend application
│   ├── config/            # Database and server configuration
│   ├── controllers/       # Route controllers
│   ├── models/            # Sequelize data models
│   ├── routes/            # API route definitions
│   ├── middleware/        # Custom middleware
│   └── database/          # Migrations and seeders
├── public/                # Static assets
└── package.json           # Project configuration
```

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `` |
| `DB_NAME` | Database name | `hugamara_dev` |
| `DB_HOST` | Database host | `127.0.0.1` |
| `DB_PORT` | Database port | `3306` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key-here` |
| `PORT` | Backend port | `8000` |

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run server` | Start backend only |
| `npm run start` | Start frontend only |
| `npm run build` | Build production frontend |
| `npm run db:setup` | Reset and setup database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Core Operations
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/inventory` - Inventory management
- `GET /api/orders` - Order management
- `GET /api/reservations` - Reservation management
- `GET /api/guests` - Guest management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mydhe Dlu6** - [GitHub Profile](https://github.com/Dlu6)
- **Location**: Kampala, Uganda
- **Company**: MM-iCT
- **Website**: [https://mmict.it/](https://mmict.it/)

## 🙏 Acknowledgments

- Built specifically for Hugamara's hospitality operations in Uganda
- Designed with local business requirements and currency (UGX) in mind
- Optimized for the African hospitality industry

## 📞 Support

For support and questions:
- **Email**: admin@hugamara.com
- **GitHub Issues**: [Create an issue](https://github.com/Dlu6/hugamara-hospitality-app/issues)

---

**Built with ❤️ in Uganda for the African hospitality industry**