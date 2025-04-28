
import { AppDataSource } from './connection';
import { Site } from '../entities/Site';

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
        user_id UUID,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        FOREIGN KEY (site_id) REFERENCES sites(site_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
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
        role TEXT NOT NULL DEFAULT 'user',
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
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    
    // Create indexes for faster lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_bank_accounts_site_id ON bank_accounts(site_id);
      CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
      CREATE INDEX IF NOT EXISTS idx_account_logins_site_id ON account_logins(site_id);
      CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_logs_entity ON logs(entity);
      CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
    `);
    
    await queryRunner.commitTransaction();
    console.log('Database migrations completed successfully');
    
    // After migrations are done, create the three specified sites if they don't exist yet
    await createDefaultSites();
    
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};

// Function to create default sites if they don't exist
async function createDefaultSites() {
  try {
    const siteRepository = AppDataSource.getRepository(Site);
    
    // Define the three required sites
    const defaultSites = [
      { site_name: "play.iwin.bio", site_id: "play-iwin-bio" },
      { site_name: "play.b52.cc", site_id: "play-b52-cc" },
      { site_name: "i.rik.vip", site_id: "i-rik-vip" }
    ];
    
    console.log('Checking and creating default sites...');
    
    for (const siteData of defaultSites) {
      // Check if site already exists
      const existingSite = await siteRepository.findOne({ 
        where: { site_name: siteData.site_name } 
      });
      
      if (!existingSite) {
        // Create the site if it doesn't exist
        const newSite = siteRepository.create({
          site_name: siteData.site_name,
          site_id: siteData.site_id,
          status: 'active'
        });
        
        await siteRepository.save(newSite);
        console.log(`Created site: ${siteData.site_name}`);
      } else {
        console.log(`Site already exists: ${siteData.site_name}`);
      }
    }
    
    console.log('Default sites setup completed');
  } catch (error) {
    console.error('Error creating default sites:', error);
    throw error;
  }
}
