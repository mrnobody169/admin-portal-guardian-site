
import { Request, Response } from 'express';
import { ScheduleService } from '../services/ScheduleService';
import { Schedule } from '../entities/Schedule';

export class ScheduleController {
  private scheduleService: ScheduleService;

  constructor() {
    this.scheduleService = new ScheduleService();
  }

  getSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
      const schedules = await this.scheduleService.findAll();
      res.json(schedules);
    } catch (error) {
      console.error('Error getting schedules:', error);
      res.status(500).json({ error: 'Failed to get schedules' });
    }
  };

  getScheduleById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const schedule = await this.scheduleService.findById(id);
      
      if (!schedule) {
        res.status(404).json({ error: 'Schedule not found' });
        return;
      }
      
      res.json(schedule);
    } catch (error) {
      console.error('Error getting schedule:', error);
      res.status(500).json({ error: 'Failed to get schedule' });
    }
  };

  createSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const scheduleData = req.body as Partial<Schedule>;
      const userId = req.user?.id;
      
      // Handle "null" string for site_id
      if (scheduleData.site_id === 'null') {
        scheduleData.site_id = null;
      }
      
      const schedule = await this.scheduleService.create(scheduleData, userId);
      res.status(201).json(schedule);
    } catch (error) {
      console.error('Error creating schedule:', error);
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  };

  updateSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const scheduleData = req.body as Partial<Schedule>;
      const userId = req.user?.id;
      
      const schedule = await this.scheduleService.update(id, scheduleData, userId);
      res.json(schedule);
    } catch (error) {
      console.error('Error updating schedule:', error);
      res.status(500).json({ error: 'Failed to update schedule' });
    }
  };

  deleteSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      await this.scheduleService.delete(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      res.status(500).json({ error: 'Failed to delete schedule' });
    }
  };

  runSpecificSite = async (req: Request, res: Response): Promise<void> => {
    try {
      const { siteId } = req.params;
      const userId = req.user?.id;
      
      // Run the site task
      await this.scheduleService.runSite(siteId);
      
      res.json({ success: true, message: `Task started for site ${siteId}` });
    } catch (error: any) {
      console.error('Error running site task:', error);
      res.status(500).json({ 
        error: `Failed to run task: ${error?.message || 'Unknown error'}` 
      });
    }
  };

  runAllSites = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      // Run all sites
      await this.scheduleService.runAllSites();
      
      res.json({ success: true, message: 'Task started for all sites' });
    } catch (error: any) {
      console.error('Error running all sites:', error);
      res.status(500).json({ 
        error: `Failed to run task: ${error?.message || 'Unknown error'}` 
      });
    }
  };
}
