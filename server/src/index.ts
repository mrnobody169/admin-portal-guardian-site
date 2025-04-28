
import "reflect-metadata";
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { createConnection } from './database/connection';
import { setupRoutes } from './routes';

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
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/entities/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root route
app.get('/', (req, res) => {
  res.send('API Server is running. Visit <a href="/api-docs">API Documentation</a>');
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
      console.log(`Swagger API documentation available at http://localhost:${PORT}/api-docs`);
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
