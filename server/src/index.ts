
import "reflect-metadata";
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { createConnection } from './database/connection';
import { setupRoutes } from './routes';
import fs from 'fs';
import path from 'path';
import { runMigrations } from './database/migration';
import http from 'http';
import { WebSocketService } from './services/WebSocketService';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Admin Portal API',
      version: '1.0.0',
      description: 'API documentation for the Admin Portal',
      contact: {
        name: 'Admin Portal API Support',
        email: 'support@example.com',
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    './src/controllers/*.ts',
    './src/entities/*.ts',
    './src/routes/*.ts'
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Generate and save swagger.json file
const exportSwaggerJson = () => {
  const swaggerOutputPath = path.resolve(__dirname, '../swagger.json');
  fs.writeFileSync(swaggerOutputPath, JSON.stringify(swaggerSpec, null, 2));
  console.log(`Swagger JSON file written to: ${swaggerOutputPath}`);
};

// Export swagger.json when server starts
exportSwaggerJson();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve as any, swaggerUi.setup(swaggerSpec) as any);

// Export Swagger JSON route
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Root route
app.get('/', (req, res) => {
  res.send('API Server is running. Visit <a href="/api-docs">API Documentation</a> or <a href="/api-docs.json">Download Swagger JSON</a>');
});

// Create HTTP server
const server = http.createServer(app);

// Initialize DB connection and start server
const startServer = async () => {
  try {
    // Connect to PostgreSQL with TypeORM
    const connection = await createConnection();
    console.log('Connected to PostgreSQL database');

    // Setup API routes
    setupRoutes(app);

    // Initialize WebSocket service if enabled
    if (process.env.WS_ENABLED === 'true') {
      const wsService = new WebSocketService();
      wsService.initialize(server);
      console.log('WebSocket server initialized');
    }

    // Start the server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger API documentation available at http://localhost:${PORT}/api-docs`);
      console.log(`Swagger JSON available at http://localhost:${PORT}/api-docs.json`);
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
