
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BankAccount } from './BankAccount';
import { Log } from './Log';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', default: 'user' })
  role: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @OneToMany(() => BankAccount, bankAccount => bankAccount.user)
  bankAccounts: BankAccount[];

  @OneToMany(() => Log, log => log.user)
  logs: Log[];
}
