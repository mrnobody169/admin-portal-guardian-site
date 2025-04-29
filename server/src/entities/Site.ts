
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BankAccount } from './BankAccount';
import { AccountLogin } from './AccountLogin';

/**
 * @swagger
 * components:
 *   schemas:
 *     Site:
 *       type: object
 *       required:
 *         - site_name
 *         - site_id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the site
 *         site_name:
 *           type: string
 *           description: The name of the site
 *         site_id:
 *           type: string
 *           description: The unique identifier of the site
 *         status:
 *           type: string
 *           description: The status of the site (active, inactive)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the site was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the site was last updated
 */
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
