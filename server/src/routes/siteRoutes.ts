
import { Router } from 'express';
import { SiteController } from '../controllers/SiteController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const siteController = new SiteController();

// Routes
router.get('/', authenticateToken, siteController.getSites);
router.get('/:id', authenticateToken, siteController.getSiteById);
router.post('/', authenticateToken, siteController.createSite);
router.put('/:id', authenticateToken, siteController.updateSite);
router.delete('/:id', authenticateToken, siteController.deleteSite);

export default router;
