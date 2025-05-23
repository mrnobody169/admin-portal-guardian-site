
#!/bin/bash

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo ".env file created from .env.example"
fi

# Install dependencies
echo "Installing dependencies..."
npm install
npm install swagger-jsdoc swagger-ui-express @types/swagger-jsdoc @types/swagger-ui-express --save

# Start the database
echo "Starting local database with Docker..."
docker-compose up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Build the project
echo "Building the project..."
npm run build

# Clean the database before running migrations
echo "Cleaning the database (dropping tables if they exist)..."
npm run clean-db

# Run database migrations
echo "Running database migrations..."
npm run migrate

# Setup initial data
echo "Setting up initial data..."
npm run setup-db

echo "Setup complete! You can now run the server with: npm run dev"
echo "API documentation will be available at: http://localhost:4000/api-docs"
