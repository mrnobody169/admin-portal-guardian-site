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
import { User, Edit, Trash2, Plus, Loader2, Eye, EyeOff } from 'lucide-react';
import { apiService } from '@/services/api';
import { websocketService } from '@/services/websocket/websocketService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select } from '@/components/ui/select';
import { format } from "date-fns";

interface AccountLogin {
  id: string;
  username: string;
  password: string;
  token: string | null;
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

const AccountLogins = () => {
  const [accountLogins, setAccountLogins] = useState<AccountLogin[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAccountLogin, setCurrentAccountLogin] = useState<Partial<AccountLogin> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [accountLoginsRes, sitesRes] = await Promise.all([
          apiService.getAccountLogins(),
          apiService.getSites()
        ]);
        
        setAccountLogins(accountLoginsRes.accountLogins || []);
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
    
    // Connect to WebSocket
    websocketService.connect();
    
    // Subscribe to account login events
    const createUnsubscribe = websocketService.subscribe('account_login_created', (data) => {
      const loginWithMaskedPassword = { 
        ...data.accountLogin, 
        password: '********'
      };
      setAccountLogins(prev => [...prev, loginWithMaskedPassword]);
      toast({ 
        title: "New account login added", 
        description: `${loginWithMaskedPassword.username} was added` 
      });
    });
    
    const updateUnsubscribe = websocketService.subscribe('account_login_updated', (data) => {
      const loginWithMaskedPassword = { 
        ...data.accountLogin, 
        password: '********'
      };
      setAccountLogins(prev => 
        prev.map(login => login.id === loginWithMaskedPassword.id ? loginWithMaskedPassword : login)
      );
      toast({ 
        title: "Account login updated", 
        description: `${loginWithMaskedPassword.username} was updated` 
      });
    });
    
    const deleteUnsubscribe = websocketService.subscribe('account_login_deleted', (data) => {
      setAccountLogins(prev => prev.filter(login => login.id !== data.id));
      toast({ title: "Account login removed", description: "An account login was removed" });
    });
    
    // Connection established event
    const connectionUnsubscribe = websocketService.subscribe('connection_established', (data) => {
      console.log('WebSocket connection established:', data);
    });
    
    // Cleanup function
    return () => {
      createUnsubscribe();
      updateUnsubscribe();
      deleteUnsubscribe();
      connectionUnsubscribe();
      websocketService.disconnect();
    };
  }, []);

  const handleAddAccountLogin = () => {
    setCurrentAccountLogin({
      username: '',
      password: '',
      token: '',
      site_id: sites[0]?.site_id || '',
      status: 'active'
    });
    setIsDialogOpen(true);
    setShowPassword(true);
  };

  const handleEditAccountLogin = (accountLogin: AccountLogin) => {
    setCurrentAccountLogin({ ...accountLogin, password: '********' });
    setIsDialogOpen(true);
    setShowPassword(false);
  };

  const handleDeleteAccountLogin = (accountLogin: AccountLogin) => {
    setCurrentAccountLogin(accountLogin);
    setIsDeleteDialogOpen(true);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getSiteNameById = (siteId: string) => {
    const site = sites.find(s => s.site_id === siteId);
    return site ? site.site_name : siteId;
  };

  const handleSaveAccountLogin = async () => {
    if (!currentAccountLogin || !currentAccountLogin.username || !currentAccountLogin.site_id) {
      toast({ 
        title: "Error", 
        description: "Username and Site are required", 
        variant: "destructive" 
      });
      return;
    }

    try {
      if (currentAccountLogin.id) {
        // Update existing account login
        const updateData: any = {
          username: currentAccountLogin.username,
          site_id: currentAccountLogin.site_id,
          status: currentAccountLogin.status
        };
        
        // Only update password if it was changed (not still masked)
        if (currentAccountLogin.password && currentAccountLogin.password !== '********') {
          updateData.password = currentAccountLogin.password;
        }
        
        if (currentAccountLogin.token) {
          updateData.token = currentAccountLogin.token;
        }
        
        await apiService.updateAccountLogin(currentAccountLogin.id, updateData);
        // WebSocket will handle UI update
        toast({ title: "Account login updated successfully" });
      } else {
        // Add new account login
        await apiService.createAccountLogin({
          username: currentAccountLogin.username,
          password: currentAccountLogin.password || '',
          token: currentAccountLogin.token || '',
          site_id: currentAccountLogin.site_id,
          status: currentAccountLogin.status
        });
        
        // WebSocket will handle UI update
        toast({ title: "Account login added successfully" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving account login:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save account login", 
        variant: "destructive" 
      });
    }
  };

  const confirmDelete = async () => {
    if (!currentAccountLogin?.id) return;
    
    try {
      await apiService.deleteAccountLogin(currentAccountLogin.id);
      // WebSocket will handle UI update
      setIsDeleteDialogOpen(false);
      toast({ title: "Account login deleted successfully" });
    } catch (error) {
      console.error('Error deleting account login:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete account login", 
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

  const filteredAccountLogins = accountLogins.filter(login => 
    login.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSiteNameById(login.site_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Account Logins</h2>
          <p className="text-muted-foreground">Manage login credentials for your sites.</p>
        </div>
        <Button onClick={handleAddAccountLogin}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account Login
        </Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Search account logins..."
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
              <TableHead>Username</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccountLogins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No account logins found
                </TableCell>
              </TableRow>
            ) : (
              filteredAccountLogins.map((login) => (
                <TableRow key={login.id}>
                  <TableCell className="font-medium">{login.username}</TableCell>
                  <TableCell>{getSiteNameById(login.site_id)}</TableCell>
                  <TableCell>{login.token ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      login.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {login.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(login.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAccountLogin(login)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteAccountLogin(login)}
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
              {currentAccountLogin?.id ? 'Edit Account Login' : 'Add Account Login'}
            </DialogTitle>
            <DialogDescription>
              {currentAccountLogin?.id 
                ? 'Update the account login details below.' 
                : 'Fill in the account login details below to create a new credential.'}
            </DialogDescription>
          </DialogHeader>
          {currentAccountLogin && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={currentAccountLogin.username || ''}
                  onChange={(e) => setCurrentAccountLogin({ ...currentAccountLogin, username: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={currentAccountLogin.password || ''}
                    onChange={(e) => setCurrentAccountLogin({ ...currentAccountLogin, password: e.target.value })}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={handleTogglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="token" className="text-right">
                  Token
                </Label>
                <Input
                  id="token"
                  value={currentAccountLogin.token || ''}
                  onChange={(e) => setCurrentAccountLogin({ ...currentAccountLogin, token: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="site_id" className="text-right">
                  Site
                </Label>
                <select
                  id="site_id"
                  value={currentAccountLogin.site_id || ''}
                  onChange={(e) => setCurrentAccountLogin({ ...currentAccountLogin, site_id: e.target.value })}
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
                  value={currentAccountLogin.status || 'active'}
                  onChange={(e) => setCurrentAccountLogin({ ...currentAccountLogin, status: e.target.value })}
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
            <Button onClick={handleSaveAccountLogin}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the login credentials
              for "{currentAccountLogin?.username}".
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

export default AccountLogins;
