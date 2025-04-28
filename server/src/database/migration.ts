
import { AppDataSource } from './connection';

export const runMigrations = async () => {
  // Make sure the database is initialized
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    console.log('Running database migrations...');

    // Create users table if it doesn't exist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create bank_accounts table if it doesn't exist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        account_number TEXT NOT NULL,
        account_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        balance NUMERIC NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        account_holder TEXT,
        bank_name TEXT,
        bank_code TEXT
      );
    `);
    
    // Create logs table if it doesn't exist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id UUID,
        user_id UUID,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create indexes for faster lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
      CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_logs_entity ON logs(entity);
      CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
    `);
    
    await queryRunner.commitTransaction();
    console.log('Database migrations completed successfully');
    
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};
