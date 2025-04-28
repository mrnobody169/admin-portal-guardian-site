
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { Edit, Trash, Plus } from 'lucide-react';

interface BankAccount {
  id: string;
  account_no: string;
  account_holder: string;
  bank_name: string;
  bank_code: string;
}

const BankAccounts = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([
    { id: '1', account_no: '1234567890', account_holder: 'John Doe', bank_name: 'Chase Bank', bank_code: 'CHASEUS33' },
    { id: '2', account_no: '0987654321', account_holder: 'Jane Smith', bank_name: 'Bank of America', bank_code: 'BOFAUS3N' },
    { id: '3', account_no: '5678901234', account_holder: 'Alex Johnson', bank_name: 'Wells Fargo', bank_code: 'WFBIUS6S' },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<BankAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddAccount = () => {
    setCurrentAccount({ id: '', account_no: '', account_holder: '', bank_name: '', bank_code: '' });
    setIsDialogOpen(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setCurrentAccount({ ...account });
    setIsDialogOpen(true);
  };

  const handleDeleteAccount = (account: BankAccount) => {
    setCurrentAccount(account);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveAccount = () => {
    if (!currentAccount) return;

    if (currentAccount.id) {
      // Update existing account
      setAccounts(accounts.map(account => 
        account.id === currentAccount.id ? currentAccount : account
      ));
      toast({ title: "Bank account updated successfully" });
    } else {
      // Add new account
      const newAccount = {
        ...currentAccount,
        id: Date.now().toString(),
      };
      setAccounts([...accounts, newAccount]);
      toast({ title: "Bank account added successfully" });
    }
    setIsDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!currentAccount) return;
    
    setAccounts(accounts.filter(account => account.id !== currentAccount.id));
    setIsDeleteDialogOpen(false);
    toast({ title: "Bank account deleted successfully" });
  };

  const filteredAccounts = accounts.filter(account => 
    account.account_holder.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.account_no.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bank Accounts</h2>
          <p className="text-muted-foreground">Manage banking information and credentials.</p>
        </div>
        <Button onClick={handleAddAccount}>
          <Plus className="mr-2 h-4 w-4" />
          Add Bank Account
        </Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Search bank accounts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Account Number</th>
              <th>Account Holder</th>
              <th>Bank Name</th>
              <th>Bank Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account) => (
              <tr key={account.id}>
                <td>{account.account_no}</td>
                <td>{account.account_holder}</td>
                <td>{account.bank_name}</td>
                <td>{account.bank_code}</td>
                <td>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAccount(account)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteAccount(account)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAccounts.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8">No bank accounts found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentAccount?.id ? 'Edit Bank Account' : 'Add Bank Account'}
            </DialogTitle>
            <DialogDescription>
              {currentAccount?.id 
                ? 'Update the bank account details below.' 
                : 'Fill in the bank account details below to create a new record.'}
            </DialogDescription>
          </DialogHeader>
          {currentAccount && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="account_no" className="text-right">
                  Account Number
                </Label>
                <Input
                  id="account_no"
                  value={currentAccount.account_no}
                  onChange={(e) => setCurrentAccount({ ...currentAccount, account_no: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="account_holder" className="text-right">
                  Account Holder
                </Label>
                <Input
                  id="account_holder"
                  value={currentAccount.account_holder}
                  onChange={(e) => setCurrentAccount({ ...currentAccount, account_holder: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bank_name" className="text-right">
                  Bank Name
                </Label>
                <Input
                  id="bank_name"
                  value={currentAccount.bank_name}
                  onChange={(e) => setCurrentAccount({ ...currentAccount, bank_name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bank_code" className="text-right">
                  Bank Code
                </Label>
                <Input
                  id="bank_code"
                  value={currentAccount.bank_code}
                  onChange={(e) => setCurrentAccount({ ...currentAccount, bank_code: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAccount}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bank account
              for {currentAccount?.account_holder}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BankAccounts;
