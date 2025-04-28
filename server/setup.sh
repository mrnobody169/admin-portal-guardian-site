
#!/bin/bash

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo ".env file created from .env.example"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Start the database
echo "Starting database with Docker..."
docker-compose up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Run database migrations
echo "Running database migrations..."
npm run migrate

# Setup initial data
echo "Setting up initial data..."
npm run setup-db

echo "Setup complete! You can now run the server with: npm start"
