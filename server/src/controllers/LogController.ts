
import { Request, Response } from 'express';
import { LogService } from '../services/LogService';

export class LogController {
  private logService = new LogService();

  getLogs = async (req: Request, res: Response) => {
    try {
      const logs = await this.logService.findAll();
      res.json({ logs });
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  }

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
