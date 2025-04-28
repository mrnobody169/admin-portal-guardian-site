
import { Router } from 'express';
import { LogController } from '../controllers/LogController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const logController = new LogController();

// Routes
router.get('/', authenticateToken, logController.getLogs);
router.post('/', authenticateToken, logController.createLog);

export default router;
