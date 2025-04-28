
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Site } from './Site';

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
