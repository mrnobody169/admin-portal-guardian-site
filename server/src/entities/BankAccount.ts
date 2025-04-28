
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Site } from './Site';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  account_no: string;

  @Column({ type: 'text' })
  account_holder: string;

  @Column({ type: 'text' })
  bank_name: string;

  @Column({ type: 'text' })
  site_id: string;

  @Column({ type: 'text', default: 'active' })
  status: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @ManyToOne(() => User, user => user.bankAccounts)
  user: User;

  @ManyToOne(() => Site, site => site.bankAccounts)
  @JoinColumn({ name: 'site_id', referencedColumnName: 'site_id' })
  site: Site;
}
