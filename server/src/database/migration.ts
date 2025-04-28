
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
    
    // Create sites table if it doesn't exist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_name TEXT NOT NULL,
        site_id TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Update bank_accounts table
    await queryRunner.query(`
      DROP TABLE IF EXISTS bank_accounts CASCADE;
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_no TEXT NOT NULL,
        account_holder TEXT NOT NULL,
        bank_name TEXT NOT NULL,
        site_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        FOREIGN KEY (site_id) REFERENCES sites(site_id) ON DELETE CASCADE
      );
    `);
    
    // Create account_logins table if it doesn't exist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS account_logins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        token TEXT,
        site_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        FOREIGN KEY (site_id) REFERENCES sites(site_id) ON DELETE CASCADE
      );
    `);
    
    // Create account_users table if it doesn't exist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS account_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
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
      CREATE INDEX IF NOT EXISTS idx_bank_accounts_site_id ON bank_accounts(site_id);
      CREATE INDEX IF NOT EXISTS idx_account_logins_site_id ON account_logins(site_id);
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
