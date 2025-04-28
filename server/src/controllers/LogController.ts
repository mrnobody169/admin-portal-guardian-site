
import { Request, Response } from 'express';
import { LogService } from '../services/LogService';

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Log management endpoints
 */
export class LogController {
  private logService = new LogService();

  /**
   * @swagger
   * /api/logs:
   *   get:
   *     summary: Get all logs
   *     tags: [Logs]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of logs
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 logs:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Log'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  getLogs = async (req: Request, res: Response) => {
    try {
      const logs = await this.logService.findAll();
      res.json({ logs });
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  }

  /**
   * @swagger
   * /api/logs:
   *   post:
   *     summary: Create a new log entry
   *     tags: [Logs]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - action
   *               - entity
   *             properties:
   *               action:
   *                 type: string
   *               entity:
   *                 type: string
   *               entity_id:
   *                 type: string
   *               user_id:
   *                 type: string
   *               details:
   *                 type: object
   *     responses:
   *       201:
   *         description: Log created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 log:
   *                   $ref: '#/components/schemas/Log'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  createLog = async (req: Request, res: Response) => {
    const { action, entity, entity_id, user_id, details } = req.body;
    
    try {
      const log = await this.logService.create({
        action,
        entity,
        entity_id,
        user_id: user_id || req.user?.id,
        details
      });
      
      res.status(201).json({ log });
    } catch (error) {
      console.error('Error creating log entry:', error);
      res.status(500).json({ error: 'Failed to create log entry' });
    }
  }
}
