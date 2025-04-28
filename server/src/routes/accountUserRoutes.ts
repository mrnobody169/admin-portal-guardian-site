
import { Router } from 'express';
import { AccountUserController } from '../controllers/AccountUserController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const accountUserController = new AccountUserController();

// Routes
router.get('/', authenticateToken, accountUserController.getAccountUsers);
router.get('/:id', authenticateToken, accountUserController.getAccountUserById);
router.post('/', authenticateToken, accountUserController.createAccountUser);
router.put('/:id', authenticateToken, accountUserController.updateAccountUser);
router.delete('/:id', authenticateToken, accountUserController.deleteAccountUser);
router.post('/login', accountUserController.login);

export default router;
