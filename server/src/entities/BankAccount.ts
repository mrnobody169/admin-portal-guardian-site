
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Site } from './Site';

/**
 * @swagger
 * components:
 *   schemas:
 *     BankAccount:
 *       type: object
 *       required:
 *         - account_no
 *         - account_holder
 *         - bank_name
 *         - site_id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the bank account
 *         account_no:
 *           type: string
 *           description: The account number
 *         account_holder:
 *           type: string
 *           description: The name of the account holder
 *         bank_name:
 *           type: string
 *           description: The name of the bank
 *         site_id:
 *           type: string
 *           description: The ID of the site this account belongs to
 *         status:
 *           type: string
 *           description: The status of the bank account (active, inactive)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the bank account was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the bank account was last updated
 */
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

  @ManyToOne(() => Site, site => site.bankAccounts)
  @JoinColumn({ name: 'site_id', referencedColumnName: 'site_id' })
  site: Site;
}
