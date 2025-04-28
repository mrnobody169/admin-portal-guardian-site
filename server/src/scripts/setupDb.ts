
import { AppDataSource } from '../database/connection';
import { User } from '../entities/User';
import { BankAccount } from '../entities/BankAccount';
import { Log } from '../entities/Log';

// This script will create a test user and some sample data
const setupInitialData = async () => {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    const userRepo = AppDataSource.getRepository(User);
    const accountRepo = AppDataSource.getRepository(BankAccount);
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
    
    // Create a test bank account
    console.log('Creating test bank account...');
    const testAccount = accountRepo.create({
      user_id: savedUser.id,
      account_number: '1234567890',
      account_type: 'checking',
      status: 'active',
      balance: 1000,
      account_holder: 'Test User',
      bank_name: 'Test Bank',
      bank_code: 'TST'
    });
    
    const savedAccount = await accountRepo.save(testAccount);
    console.log(`Created bank account with ID: ${savedAccount.id}`);
    
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
