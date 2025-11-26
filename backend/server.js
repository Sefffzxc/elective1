import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createDatabase } from './config/database.js';
import './realtime.js';

// Routes
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import salesRoutes from './routes/sales.js';
import reportsRoutes from './routes/reports.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reports', reportsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await createDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║   Distributed Inventory System Backend                ║
║   Server running on port ${PORT}                         ║
║   Environment: ${process.env.NODE_ENV || 'development'}                      ║
║                                                        ║
║   Endpoints:                                           ║
║   - POST   /api/auth/login                            ║
║   - GET    /api/products                              ║
║   - POST   /api/products                              ║
║   - PUT    /api/products/:id                          ║
║   - DELETE /api/products/:id                          ║
║   - POST   /api/sales                                 ║
║   - GET    /api/sales                                 ║
║   - GET    /api/reports/dashboard                     ║
║   - GET    /api/reports/top-products                  ║
║                                                        ║
║   RethinkDB Cluster Status: Connected                 ║
╚════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});