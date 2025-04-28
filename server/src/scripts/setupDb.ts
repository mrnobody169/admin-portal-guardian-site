
import { AppDataSource } from '../database/connection';
import { User } from '../entities/User';
import { BankAccount } from '../entities/BankAccount';
import { Log } from '../entities/Log';
import { Site } from '../entities/Site';
import { AccountLogin } from '../entities/AccountLogin';
import { AccountUser } from '../entities/AccountUser';
import * as bcrypt from 'bcrypt';

// This script will create a test user and some sample data
const setupInitialData = async () => {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    const userRepo = AppDataSource.getRepository(User);
    const siteRepo = AppDataSource.getRepository(Site);
    const accountRepo = AppDataSource.getRepository(BankAccount);
    const accountLoginRepo = AppDataSource.getRepository(AccountLogin);
    const accountUserRepo = AppDataSource.getRepository(AccountUser);
    const logRepo = AppDataSource.getRepository(Log);
    
    // Create a test user
    console.log('Creating test user...');
    const testUser = userRepo.create({
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin'
    });
    
    const savedUser = await userRepo.save(testUser);
    console.log(`Created user with ID: ${savedUser.id}`);
    
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
    
    // Create a test account user (admin)
    console.log('Creating admin account user...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    
    const testAccountUser = accountUserRepo.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    
    const savedAccountUser = await accountUserRepo.save(testAccountUser);
    console.log(`Created account user with ID: ${savedAccountUser.id}`);
    
    // Create a test log entry
    console.log('Creating test log entry...');
    const testLog = logRepo.create({
      action: 'setup',
      entity: 'system',
      user_id: savedAccountUser.id,
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
