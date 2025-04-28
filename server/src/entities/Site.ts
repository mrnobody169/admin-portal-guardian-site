
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BankAccount } from './BankAccount';
import { AccountLogin } from './AccountLogin';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  site_name: string;

  @Column({ type: 'text', unique: true })
  site_id: string;

  @Column({ type: 'text', default: 'active' })
  status: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @OneToMany(() => BankAccount, bankAccount => bankAccount.site)
  bankAccounts: BankAccount[];

  @OneToMany(() => AccountLogin, accountLogin => accountLogin.site)
  accountLogins: AccountLogin[];
}
