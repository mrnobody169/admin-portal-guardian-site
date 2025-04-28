
import { Router } from 'express';
import { AccountLoginController } from '../controllers/AccountLoginController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const accountLoginController = new AccountLoginController();

// Routes
router.get('/', authenticateToken, accountLoginController.getAccountLogins);
router.get('/:id', authenticateToken, accountLoginController.getAccountLoginById);
router.get('/site/:siteId', authenticateToken, accountLoginController.getAccountLoginsBySiteId);
router.post('/', authenticateToken, accountLoginController.createAccountLogin);
router.put('/:id', authenticateToken, accountLoginController.updateAccountLogin);
router.delete('/:id', authenticateToken, accountLoginController.deleteAccountLogin);

export default router;
