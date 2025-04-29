
import { AppDataSource } from '../database/connection';
import { User } from '../entities/User';
import { BankAccount } from '../entities/BankAccount';
import { Log } from '../entities/Log';
import { Site } from '../entities/Site';
import { AccountLogin } from '../entities/AccountLogin';
import * as bcrypt from 'bcrypt';

// This script will create a test user and some sample data
const setupInitialData = async () => {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('Checking if tables exist...');
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    // Check if users table exists
    const tableExists = await queryRunner.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name = 'users'
       )`
    );
    
    if (!tableExists[0].exists) {
      console.error('Error: Users table does not exist. Please run migrations first.');
      process.exit(1);
    }
    
    const userRepo = AppDataSource.getRepository(User);
    const siteRepo = AppDataSource.getRepository(Site);
    const accountRepo = AppDataSource.getRepository(BankAccount);
    const accountLoginRepo = AppDataSource.getRepository(AccountLogin);
    const logRepo = AppDataSource.getRepository(Log);
    
    // Create an admin user
    console.log('Creating admin user...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    
    const adminUser = userRepo.create({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
      name: 'Administrator',
      role: 'admin'
    });
    
    const savedUser = await userRepo.save(adminUser);
    console.log(`Created admin user with ID: ${savedUser.id}`);
    
    // Create a test site
    console.log('Creating test site...');
    const testSite = siteRepo.create({
      site_name: 'Test Site',
      site_id: 'test-site-001',
      status: 'active'
    });
    
    const savedSite = await siteRepo.save(testSite);
    console.log(`Created site with ID: ${savedSite.id}`);
    
    // Create a test bank account
    console.log('Creating test bank account...');
    const testAccount = accountRepo.create({
      account_no: '1234567890',
      account_holder: 'Test User',
      bank_name: 'Test Bank',
      site_id: savedSite.site_id,
      status: 'active'
    });
    
    const savedAccount = await accountRepo.save(testAccount);
    console.log(`Created bank account with ID: ${savedAccount.id}`);
    
    // Create a test account login
    console.log('Creating test account login...');
    const testAccountLogin = accountLoginRepo.create({
      username: 'testlogin',
      password: 'password123',
      token: 'test-token',
      site_id: savedSite.site_id,
      status: 'active'
    });
    
    const savedAccountLogin = await accountLoginRepo.save(testAccountLogin);
    console.log(`Created account login with ID: ${savedAccountLogin.id}`);
    
    // Create a test log entry
    console.log('Creating test log entry...');
    const testLog = logRepo.create({
      action: 'setup',
      entity: 'system',
      user_id: savedUser.id,
      details: { message: 'Initial system setup' }
    });
    
    await logRepo.save(testLog);
    console.log('Created log entry');
    
    console.log('Database setup completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

// Run the setup
setupInitialData();
