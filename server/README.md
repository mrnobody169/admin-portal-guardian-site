
# Backend Server

This server provides the backend API for the application with PostgreSQL integration using TypeORM.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- PostgreSQL (v13 or later)
- TypeScript

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

### Running the Server

Development mode with auto-reload:

```bash
npm run dev
```

Build and run in production mode:

```bash
npm run build
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

## Architecture

The server is built with a clean architecture pattern:

- **Entities**: TypeORM entity classes representing database tables
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and interact with repositories
- **Routes**: Define API endpoints and link them to controllers
- **Middleware**: Implement authentication and other cross-cutting concerns

## Future Extensions

The architecture is designed to be easily extended for additional features such as:

- Cron jobs for data crawling
- Additional entity types
- Complex business logic
- Authentication strategies

