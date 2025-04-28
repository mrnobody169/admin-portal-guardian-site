
import { DataSource, ObjectLiteral } from 'typeorm';
import { User } from '../entities/User';
import { BankAccount } from '../entities/BankAccount';
import { Log } from '../entities/Log';
import { Site } from '../entities/Site';
import { AccountLogin } from '../entities/AccountLogin';
import { AccountUser } from '../entities/AccountUser';

// Create and export the TypeORM data source
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'mydb',
  synchronize: false, // Set to false in production
  logging: process.env.NODE_ENV !== 'production',
  entities: [User, BankAccount, Log, Site, AccountLogin, AccountUser],
});

// Import migrations
import { runMigrations } from './migration';

// Initialize connection
export const createConnection = async () => {
  try {
    await AppDataSource.initialize();
    
    // Run migrations to ensure database schema
    await runMigrations();
    
    return AppDataSource;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};

// Get repository function helper
export const getRepository = <T extends ObjectLiteral>(entity: any) => {
  return AppDataSource.getRepository<T>(entity);
};
