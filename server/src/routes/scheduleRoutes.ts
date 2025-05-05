
import { Router } from 'express';
import { ScheduleController } from '../controllers/ScheduleController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const scheduleController = new ScheduleController();

// Routes
router.get('/', authenticateToken, scheduleController.getSchedules);
router.get('/:id', authenticateToken, scheduleController.getScheduleById);
router.post('/', authenticateToken, scheduleController.createSchedule);
router.put('/:id', authenticateToken, scheduleController.updateSchedule);
router.delete('/:id', authenticateToken, scheduleController.deleteSchedule);

// Special routes for running tasks
router.post('/run/:siteId', authenticateToken, scheduleController.runSpecificSite);
router.post('/run-all', authenticateToken, scheduleController.runAllSites);

export default router;
