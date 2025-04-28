
# Backend Server

This server provides the backend API for the application with PostgreSQL integration.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- PostgreSQL (v13 or later)

### Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:

```bash
npm install
```

4. Create a PostgreSQL database
5. Copy `.env.example` to `.env` and update the credentials:

```bash
cp .env.example .env
```

6. Initialize the database schema:

```bash
psql -U your_username -d your_database_name -f db/schema.sql
```

### Running the Server

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Authentication

- POST `/api/auth/login`: Login with email and password

### Users

- GET `/api/users`: Get all users
- GET `/api/users/:id`: Get user by ID
- POST `/api/users`: Create a new user
- PUT `/api/users/:id`: Update user
- DELETE `/api/users/:id`: Delete user

### Bank Accounts

- GET `/api/bank-accounts`: Get all bank accounts
- GET `/api/bank-accounts/:id`: Get bank account by ID
- POST `/api/bank-accounts`: Create a new bank account
- PUT `/api/bank-accounts/:id`: Update bank account
- DELETE `/api/bank-accounts/:id`: Delete bank account

### Logs

- GET `/api/logs`: Get all logs
- POST `/api/logs`: Create a new log entry
