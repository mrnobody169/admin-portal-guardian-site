
import { AppDataSource } from '../database/connection';

const cleanDatabase = async () => {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    console.log('Cleaning database...');
    
    // Drop tables in reverse order to avoid foreign key constraints
    await queryRunner.query(`DROP TABLE IF EXISTS logs;`);
    await queryRunner.query(`DROP TABLE IF EXISTS account_logins;`);
    await queryRunner.query(`DROP TABLE IF EXISTS bank_accounts;`);
    await queryRunner.query(`DROP TABLE IF EXISTS sites;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);

    console.log('Database cleaned successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning database:', error);
    process.exit(1);
  }
};

// Run the clean function
cleanDatabase();
