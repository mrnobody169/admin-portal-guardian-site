import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Log } from './Log';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  username: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ type: 'text', nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ type: 'text', default: 'admin' })
  role: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @OneToMany(() => Log, log => log.user)
  logs: Log[];
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the user
 *         username:
 *           type: string
 *           description: The username of the user
 *         password:
 *           type: string
 *           description: The password of the user (not returned in responses)
 *         email:
 *           type: string
 *           description: The email of the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         role:
 *           type: string
 *           description: The role of the user
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user was last updated
 */
