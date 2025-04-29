
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// Routes
router.get('/', authenticateToken, userController.getUsers);
router.get('/:id', authenticateToken, userController.getUserById);
router.post('/', authenticateToken, userController.createUser);
router.put('/:id', authenticateToken, userController.updateUser);
router.delete('/:id', authenticateToken, userController.deleteUser);
router.post('/login', userController.login);

export default router;
