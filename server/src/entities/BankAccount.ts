
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'text' })
  account_number: string;

  @Column({ type: 'text' })
  account_type: string;

  @Column({ type: 'text', default: 'active' })
  status: string;

  @Column({ type: 'numeric', default: 0 })
  balance: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @Column({ type: 'text', nullable: true })
  account_holder: string;

  @Column({ type: 'text', nullable: true })
  bank_name: string;

  @Column({ type: 'text', nullable: true })
  bank_code: string;

  @ManyToOne(() => User, user => user.bankAccounts)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
