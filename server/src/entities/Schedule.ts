
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Site } from './Site';

/**
 * @swagger
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       required:
 *         - schedule_type
 *         - cron_expression
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the schedule
 *         site_id:
 *           type: string
 *           format: uuid
 *           description: The UUID of the site (null means all sites)
 *         schedule_type:
 *           type: string
 *           description: Type of schedule (once, interval, daily, weekly, monthly, custom)
 *         cron_expression:
 *           type: string
 *           description: Cron expression for the schedule
 *         description:
 *           type: string
 *           description: Human-readable description of the schedule
 *         next_run_time:
 *           type: string
 *           format: date-time
 *           description: The next time the schedule will run
 *         last_run_time:
 *           type: string
 *           format: date-time
 *           description: The last time the schedule ran
 *         status:
 *           type: string
 *           description: The status of the schedule (active, inactive)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the schedule was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the schedule was last updated
 */
@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  site_id: string | null;

  @Column({ type: 'text' })
  schedule_type: string;

  @Column({ type: 'text' })
  cron_expression: string;
  
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  next_run_time: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_run_time: Date | null;

  @Column({ type: 'text', default: 'active' })
  status: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @ManyToOne(() => Site, { nullable: true })
  @JoinColumn({ name: 'site_id' })
  site: Site | null;
}
