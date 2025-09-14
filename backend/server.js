import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
// import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";

// Import database connection
import { sequelize } from "./config/database.js";

// Import routes
import authRoutes from "./routes/auth.js";
import outletRoutes from "./routes/outlets.js";
import userRoutes from "./routes/users.js";
import reservationRoutes from "./routes/reservations.js";
import orderRoutes from "./routes/orders.js";
import inventoryRoutes from "./routes/inventory.js";
import guestRoutes from "./routes/guests.js";
import ticketRoutes from "./routes/tickets.js";
import eventRoutes from "./routes/events.js";
import dashboardRoutes from "./routes/dashboard.js";
import tableRoutes from "./routes/tables.js";
import menuRoutes from "./routes/menu.js";
import staffRoutes from "./routes/staff.js";
import shiftRoutes from "./routes/shifts.js";
import settingsRoutes from "./routes/settings.js";
import paymentRoutes from "./routes/payments.js";
import reportRoutes from "./routes/reports.js";
import departmentRoutes from "./routes/departments.js";
import searchRoutes from "./routes/search.js";

// Import middleware
import { authenticateToken } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://192.168.1.8:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const PORT = process.env.PORT || 8002;
const NODE_ENV = process.env.NODE_ENV || "development";

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://192.168.1.8:3000",
    ],
    credentials: true,
  })
);

// Rate limiting - temporarily disabled for development
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/outlets", outletRoutes);
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/reservations", authenticateToken, reservationRoutes);
app.use("/api/orders", authenticateToken, orderRoutes);
app.use("/api/inventory", authenticateToken, inventoryRoutes);
app.use("/api/guests", authenticateToken, guestRoutes);
app.use("/api/tickets", authenticateToken, ticketRoutes);
app.use("/api/events", authenticateToken, eventRoutes);
app.use("/api/dashboard", authenticateToken, dashboardRoutes);
app.use("/api/tables", authenticateToken, tableRoutes);
app.use("/api/menu", authenticateToken, menuRoutes);
app.use("/api/staff", authenticateToken, staffRoutes);
app.use("/api/shifts", authenticateToken, shiftRoutes);
app.use("/api/settings", authenticateToken, settingsRoutes);
app.use("/api/payments", authenticateToken, paymentRoutes);
app.use("/api/reports", authenticateToken, reportRoutes);
app.use("/api/departments", authenticateToken, departmentRoutes);
app.use("/api/search", authenticateToken, searchRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join outlet room
  socket.on("join-outlet", (outletId) => {
    socket.join(`outlet-${outletId}`);
    console.log(`Client ${socket.id} joined outlet ${outletId}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Optional one-time sync for bootstrapping in new environments
    // Enable by setting DB_SYNC=true in env, then disable after first run
    if (process.env.DB_SYNC === "true") {
      await sequelize.sync({ alter: true });
      console.log("✅ Database synchronized via sequelize.sync(alter: true).");
    }

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`📊 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await sequelize.close();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await sequelize.close();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Start the server
startServer();

export { io };
