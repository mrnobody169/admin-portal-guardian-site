
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  action: string;

  @Column({ type: 'text' })
  entity: string;

  @Column({ type: 'uuid', nullable: true })
  entity_id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @ManyToOne(() => User, user => user.logs)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
