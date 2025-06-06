
import { AppDataSource } from './connection';
import { Site } from '../entities/Site';
import { User } from '../entities/User';
import * as bcrypt from 'bcrypt';

export const runMigrations = async () => {
  try {
    // Make sure the database is initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      console.log('Running database migrations...');

      // Create users table - FIRST (admin users) - Ensure column names match the entity
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          email TEXT,
          name TEXT,
          role TEXT NOT NULL DEFAULT 'admin',
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);

      // Create sites table - SECOND
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

      // Create bank_accounts table - THIRD (depends on sites)
      await queryRunner.query(`
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

      // Create account_logins table - FOURTH (depends on sites)
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

      // Create logs table - FIFTH (modified to remove user_id foreign key)
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          action TEXT NOT NULL,
          entity TEXT NOT NULL,
          entity_id TEXT,
          details JSONB,
          user_id UUID,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);

      // Create schedules table - SIXTH (updated with description field)
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS schedules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          site_id TEXT,
          schedule_type TEXT NOT NULL,
          cron_expression TEXT NOT NULL,
          description TEXT,
          next_run_time TIMESTAMP WITH TIME ZONE,
          last_run_time TIMESTAMP WITH TIME ZONE,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          FOREIGN KEY (site_id) REFERENCES sites(site_id) ON DELETE CASCADE
        );
      `);

      // Create indexes for faster lookups
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_bank_accounts_site_id ON bank_accounts(site_id);
        CREATE INDEX IF NOT EXISTS idx_account_logins_site_id ON account_logins(site_id);
        CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_logs_entity ON logs(entity);
        CREATE INDEX IF NOT EXISTS idx_schedules_site_id ON schedules(site_id);
        CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);
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
  } catch (error) {
    console.error('Error in migration process:', error);
    throw error;
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
      { site_name: "i.rik.vip", site_id: "i-rik-vip" },
      { site_name: "play.son.club", site_id: "play-son-club" }
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

// Add line to make the function run automatically when this file is imported
runMigrations();
