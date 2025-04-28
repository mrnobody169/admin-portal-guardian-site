
import { Request, Response } from 'express';
import { BankAccountService } from '../services/BankAccountService';

export class BankAccountController {
  private bankAccountService = new BankAccountService();

  getBankAccounts = async (req: Request, res: Response) => {
    try {
      const accounts = await this.bankAccountService.findAll();
      res.json({ accounts });
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      res.status(500).json({ error: 'Failed to fetch bank accounts' });
    }
  }

  getBankAccountById = async (req: Request, res: Response) => {
    try {
      const account = await this.bankAccountService.findById(req.params.id);
      
      if (!account) {
        return res.status(404).json({ error: 'Bank account not found' });
      }
      
      res.json({ account });
    } catch (error) {
      console.error('Error fetching bank account:', error);
      res.status(500).json({ error: 'Failed to fetch bank account' });
    }
  }

  createBankAccount = async (req: Request, res: Response) => {
    const { user_id, account_number, account_type, status, account_holder, bank_name, bank_code } = req.body;
    
    try {
      const account = await this.bankAccountService.create(
        { 
          user_id, 
          account_number, 
          account_type, 
          status: status || 'active',
          account_holder,
          bank_name,
          bank_code
        },
        req.user?.id
      );
      
      res.status(201).json({ account });
    } catch (error) {
      console.error('Error creating bank account:', error);
      res.status(500).json({ error: 'Failed to create bank account' });
    }
  }

  updateBankAccount = async (req: Request, res: Response) => {
    const { account_number, account_type, status, account_holder, bank_name, bank_code } = req.body;
    
    try {
      const account = await this.bankAccountService.update(
        req.params.id,
        {
          account_number,
          account_type,
          status,
          account_holder,
          bank_name,
          bank_code
        },
        req.user?.id
      );
      
      res.json({ account });
    } catch (error: any) {
      console.error('Error updating bank account:', error);
      
      if (error.message === 'Bank account not found') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to update bank account' });
    }
  }

  deleteBankAccount = async (req: Request, res: Response) => {
    try {
      await this.bankAccountService.delete(req.params.id, req.user?.id);
      res.json({ message: 'Bank account deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting bank account:', error);
      
      if (error.message === 'Bank account not found') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to delete bank account' });
    }
  }
}
