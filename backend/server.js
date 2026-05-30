require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/databaseConnection");
const hospitalRoutes = require("./routes/hospitalRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

// ============= DATABASE CONNECTION =============
connectDB();

// ============= MIDDLEWARE =============

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (optional)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============= ROUTES =============

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Hospital API routes
app.use("/api/hospitals", hospitalRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hospital Manager API",
    documentation: "/api/hospitals/docs",
  });
});

// ============= ERROR HANDLING =============

// 404 Not Found Handler
app.use(notFoundHandler);

// Global Error Handler (must be last)
app.use(errorHandler);

// ============= START SERVER =============

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(
    `✓ API Docs available at http://localhost:${PORT}/api/hospitals/docs`,
  );
  console.log(`✓ CORS enabled\n`);
});
