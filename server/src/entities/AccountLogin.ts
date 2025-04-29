
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Site } from './Site';

/**
 * @swagger
 * components:
 *   schemas:
 *     AccountLogin:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - site_id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the account login
 *         username:
 *           type: string
 *           description: The username for the login
 *         password:
 *           type: string
 *           description: The password for the login (redacted in responses)
 *         token:
 *           type: string
 *           description: Optional authentication token
 *         site_id:
 *           type: string
 *           description: The ID of the site this login belongs to
 *         status:
 *           type: string
 *           description: The status of the account login (active, inactive)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the account login was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the account login was last updated
 */
@Entity('account_logins')
export class AccountLogin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  username: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ type: 'text', nullable: true })
  token: string;

  @Column({ type: 'text' })
  site_id: string;

  @Column({ type: 'text', default: 'active' })
  status: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @ManyToOne(() => Site, site => site.accountLogins)
  @JoinColumn({ name: 'site_id', referencedColumnName: 'site_id' })
  site: Site;
}
