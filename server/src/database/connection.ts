
import dotenv from "dotenv";
dotenv.config();
import { DataSource, ObjectLiteral } from "typeorm";
import { User } from "../entities/User";
import { BankAccount } from "../entities/BankAccount";
import { Log } from "../entities/Log";
import { Site } from "../entities/Site";
import { AccountLogin } from "../entities/AccountLogin";
import { Schedule } from "../entities/Schedule";

// Create and export TypeORM data source for PostgreSQL
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_NAME || "crawl",
  synchronize: false, // Set to false in production
  logging: false,
  entities: [User, BankAccount, Log, Site, AccountLogin, Schedule],
});

// Initialize connection
export const createConnection = async () => {
  try {
    console.log("Using local PostgreSQL database");

    await AppDataSource.initialize();
    console.log("Database connection established");

    return AppDataSource;
  } catch (error) {
    console.error("Error connecting to database:", error);
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
  async find(obj?: any): Promise<any[]> {
    const repository = AppDataSource.getRepository(this.entityName);
    return repository.find(obj);
  }

  async findAll(): Promise<any[]> {
    const repository = AppDataSource.getRepository(this.entityName);
    return repository.find({
      order: {
        created_at: "DESC",
      },
    });
  }

  async findOne(conditions: any): Promise<any> {
    const repository = AppDataSource.getRepository(this.entityName);
    return repository.findOne({ where: conditions });
  }

  async create(data: any): Promise<any> {
    const repository = AppDataSource.getRepository(this.entityName);
    const entity = repository.create(data);
    return repository.save(entity);
  }

  async update(id: string, data: any): Promise<any> {
    const repository = AppDataSource.getRepository(this.entityName);
    await repository.update(id, data);
    return repository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    const repository = AppDataSource.getRepository(this.entityName);
    await repository.delete(id);
  }
}
