
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

/**
 * @swagger
 * components:
 *   schemas:
 *     Log:
 *       type: object
 *       required:
 *         - action
 *         - entity
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the log
 *         action:
 *           type: string
 *           description: The action performed (e.g., create, update, delete)
 *         entity:
 *           type: string
 *           description: The entity type the action was performed on
 *         entity_id:
 *           type: string
 *           description: The ID of the entity
 *         user_id:
 *           type: string
 *           description: The ID of the user who performed the action
 *         details:
 *           type: object
 *           description: Additional details about the action
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the log was created
 */
@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  action: string;

  @Column({ type: 'text' })
  entity: string;

  @Column({ type: 'text', nullable: true })
  entity_id: string;

  @Column({ type: 'text', nullable: true })
  user_id: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @ManyToOne(() => User, user => user.logs)
  user: User;
}
