
import { Router } from 'express';
import { BankAccountController } from '../controllers/BankAccountController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const bankAccountController = new BankAccountController();

// Routes
router.get('/', authenticateToken, bankAccountController.getBankAccounts);
router.get('/:id', authenticateToken, bankAccountController.getBankAccountById);
router.post('/', authenticateToken, bankAccountController.createBankAccount);
router.put('/:id', authenticateToken, bankAccountController.updateBankAccount);
router.delete('/:id', authenticateToken, bankAccountController.deleteBankAccount);

export default router;
