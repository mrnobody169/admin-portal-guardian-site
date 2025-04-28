
import "reflect-metadata";
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createConnection } from './database/connection';
import { setupRoutes } from './routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('API Server is running');
});

// Initialize DB connection and start server
const startServer = async () => {
  try {
    // Connect to PostgreSQL with TypeORM
    const connection = await createConnection();
    console.log('Connected to PostgreSQL database');
    
    // Setup API routes
    setupRoutes(app);

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Handle errors and graceful shutdown
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// Start server
startServer();
