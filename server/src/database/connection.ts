
import dotenv from "dotenv";
dotenv.config();
import { DataSource, ObjectLiteral } from 'typeorm';
import { User } from '../entities/User';
import { BankAccount } from '../entities/BankAccount';
import { Log } from '../entities/Log';
import { Site } from '../entities/Site';
import { AccountLogin } from '../entities/AccountLogin';
import { createClient } from '@supabase/supabase-js';

// Determine which database mode to use based on environment variable
const useSupabase = process.env.DB_MODE === 'supabase';

// Configure Supabase client if credentials are available and if we're using Supabase mode
export const supabase = useSupabase && process.env.SUPABASE_URL && process.env.SUPABASE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
  : null;

// Create and export the TypeORM data source - can fall back to local PostgreSQL
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'crawl',
  synchronize: false, // Set to false in production
  logging: false,
  entities: [User, BankAccount, Log, Site, AccountLogin],
  // If using Supabase, we can set SSL to true
  ssl: useSupabase,
  extra: useSupabase ? {
    ssl: {
      rejectUnauthorized: false
    }
  } : {}
});

// Import migrations
import { runMigrations } from './migration';

// Initialize connection
export const createConnection = async () => {
  try {
    if (supabase) {
      console.log('Supabase client initialized');
    } else {
      console.log('Using local PostgreSQL database');
    }
    
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
