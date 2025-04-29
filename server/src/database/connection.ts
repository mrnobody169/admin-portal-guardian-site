
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
const DB_MODE = process.env.DB_MODE || 'postgres';
const useSupabase = DB_MODE === 'supabase';

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
    console.log(`Database Mode: ${DB_MODE}`);
    
    if (useSupabase && supabase) {
      console.log('Supabase client initialized for repository layer');
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

// Repository layer for database abstraction
export class Repository<T> {
  entityName: string;
  
  constructor(entityName: string) {
    this.entityName = entityName;
  }
  
  async findAll(): Promise<any[]> {
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from(this.entityName).select();
      if (error) throw error;
      return data;
    } else {
      const repository = AppDataSource.getRepository(this.entityName);
      return repository.find();
    }
  }
  
  async findOne(conditions: any): Promise<any> {
    if (useSupabase && supabase) {
      // Convert conditions to Supabase filter format
      let query = supabase.from(this.entityName).select().single();
      
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } else {
      const repository = AppDataSource.getRepository(this.entityName);
      return repository.findOne({ where: conditions });
    }
  }
  
  async create(data: any): Promise<any> {
    if (useSupabase && supabase) {
      const { data: result, error } = await supabase.from(this.entityName).insert(data).select().single();
      if (error) throw error;
      return result;
    } else {
      const repository = AppDataSource.getRepository(this.entityName);
      const entity = repository.create(data);
      return repository.save(entity);
    }
  }
  
  async update(id: string, data: any): Promise<any> {
    if (useSupabase && supabase) {
      const { data: result, error } = await supabase.from(this.entityName).update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    } else {
      const repository = AppDataSource.getRepository(this.entityName);
      await repository.update(id, data);
      return repository.findOne({ where: { id } });
    }
  }
  
  async delete(id: string): Promise<void> {
    if (useSupabase && supabase) {
      const { error } = await supabase.from(this.entityName).delete().eq('id', id);
      if (error) throw error;
    } else {
      const repository = AppDataSource.getRepository(this.entityName);
      await repository.delete(id);
    }
  }
}
