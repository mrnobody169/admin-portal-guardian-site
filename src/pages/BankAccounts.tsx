
import { useState, useEffect } from 'react';
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
import { Banknote, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface BankAccount {
  id: string;
  account_no: string;
  account_holder: string;
  bank_name: string;
  site_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Site {
  id: string;
  site_name: string;
  site_id: string;
}

const BankAccounts = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Partial<BankAccount> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Function to fetch accounts that we'll call after operations
  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const accountsRes = await apiService.getBankAccounts();
      setAccounts(accountsRes.accounts || []);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load bank accounts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [accountsRes, sitesRes] = await Promise.all([
          apiService.getBankAccounts(),
          apiService.getSites()
        ]);
        
        setAccounts(accountsRes.accounts || []);
        setSites(sitesRes.sites || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddAccount = () => {
    setCurrentAccount({
      account_no: '',
      account_holder: '',
      bank_name: '',
      site_id: sites[0]?.site_id || '',
      status: 'active'
    });
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

  const getSiteNameById = (siteId: string) => {
    const site = sites.find(s => s.site_id === siteId);
    return site ? site.site_name : siteId;
  };

  const handleSaveAccount = async () => {
    if (!currentAccount || !currentAccount.account_no || !currentAccount.account_holder || !currentAccount.bank_name || !currentAccount.site_id) {
      toast({ 
        title: "Error", 
        description: "All fields are required", 
        variant: "destructive" 
      });
      return;
    }

    try {
      if (currentAccount.id) {
        // Update existing account
        await apiService.updateBankAccount(currentAccount.id, {
          account_no: currentAccount.account_no,
          account_holder: currentAccount.account_holder,
          bank_name: currentAccount.bank_name,
          site_id: currentAccount.site_id,
          status: currentAccount.status
        });
        
        toast({ title: "Bank account updated successfully" });
      } else {
        // Add new account
        await apiService.createBankAccount({
          account_no: currentAccount.account_no,
          account_holder: currentAccount.account_holder,
          bank_name: currentAccount.bank_name,
          site_id: currentAccount.site_id,
        });
        
        toast({ title: "Bank account added successfully" });
      }
      
      setIsDialogOpen(false);
      fetchAccounts(); // Refresh the accounts list
    } catch (error) {
      console.error('Error saving bank account:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save bank account", 
        variant: "destructive" 
      });
    }
  };

  const confirmDelete = async () => {
    if (!currentAccount?.id) return;
    
    try {
      await apiService.deleteBankAccount(currentAccount.id);
      setIsDeleteDialogOpen(false);
      toast({ title: "Bank account deleted successfully" });
      fetchAccounts(); // Refresh the accounts list
    } catch (error) {
      console.error('Error deleting bank account:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete bank account", 
        variant: "destructive" 
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const filteredAccounts = accounts.filter(account => 
    (account.account_holder.toLowerCase()).includes(searchTerm.toLowerCase()) ||
    (account.bank_name.toLowerCase()).includes(searchTerm.toLowerCase()) ||
    account.account_no.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bank Accounts</h2>
          <p className="text-muted-foreground">Manage bank accounts for your sites.</p>
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

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Number</TableHead>
              <TableHead>Account Holder</TableHead>
              <TableHead>Bank Name</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No bank accounts found
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.account_no}</TableCell>
                  <TableCell>{account.account_holder}</TableCell>
                  <TableCell>{account.bank_name}</TableCell>
                  <TableCell>{getSiteNameById(account.site_id)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {account.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(account.created_at)}</TableCell>
                  <TableCell>
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
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

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
                  value={currentAccount.account_no || ''}
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
                  value={currentAccount.account_holder || ''}
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
                  value={currentAccount.bank_name || ''}
                  onChange={(e) => setCurrentAccount({ ...currentAccount, bank_name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="site_id" className="text-right">
                  Site
                </Label>
                <select
                  id="site_id"
                  value={currentAccount.site_id || ''}
                  onChange={(e) => setCurrentAccount({ ...currentAccount, site_id: e.target.value })}
                  className="col-span-3 px-3 py-2 bg-background border border-input rounded-md"
                >
                  {sites.map((site) => (
                    <option key={site.id} value={site.site_id}>
                      {site.site_name} ({site.site_id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <select
                  id="status"
                  value={currentAccount.status || 'active'}
                  onChange={(e) => setCurrentAccount({ ...currentAccount, status: e.target.value })}
                  className="col-span-3 px-3 py-2 bg-background border border-input rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
