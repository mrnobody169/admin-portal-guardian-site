
#!/bin/bash

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo ".env file created from .env.example"
  echo "Please update the SUPABASE_KEY in the .env file with your Supabase service key"
fi

# Install dependencies
echo "Installing dependencies..."
npm install
npm install swagger-jsdoc swagger-ui-express @types/swagger-jsdoc @types/swagger-ui-express --save
npm install @supabase/supabase-js --save

# Check if using Supabase or local database
read -p "Do you want to use Supabase instead of local database? (y/n): " use_supabase

if [ "$use_supabase" = "y" ] || [ "$use_supabase" = "Y" ]; then
  echo "You've chosen to use Supabase!"
  echo "Updating your .env file to use Supabase..."
  
  # Update DB_MODE in .env file
  sed -i 's/DB_MODE=local/DB_MODE=supabase/g' .env
  
  echo "Make sure you've updated the SUPABASE_URL and SUPABASE_KEY in your .env file."
  
  # Build the project
  echo "Building the project..."
  npm run build
  
  # Setup Supabase
  echo "Setting up Supabase tables and initial data..."
  npm run setup-supabase
else
  # Update DB_MODE in .env file
  sed -i 's/DB_MODE=supabase/DB_MODE=local/g' .env
  
  # Start the database
  echo "Starting local database with Docker..."
  docker-compose up -d

  # Wait for database to be ready
  echo "Waiting for database to be ready..."
  sleep 5

  # Build the project
  echo "Building the project..."
  npm run build

  # Run database migrations
  echo "Running database migrations..."
  npm run migrate

  # Setup initial data
  echo "Setting up initial data..."
  npm run setup-db
fi

echo "Setup complete! You can now run the server with: npm run dev"
echo "API documentation will be available at: http://localhost:4000/api-docs"
