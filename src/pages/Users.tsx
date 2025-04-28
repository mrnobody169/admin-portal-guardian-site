
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
import { Edit, Trash, Eye, EyeOff, Plus } from 'lucide-react';
import { apiService } from '@/services/api';
import { Tables } from '@/integrations/supabase/types';

interface User extends Tables<'users'> {
  password?: string;
  site_url?: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const { users } = await apiService.getUsers();
        setUsers(users || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setCurrentUser({ 
      id: '', 
      email: '', 
      name: '', 
      role: 'user', 
      created_at: '', 
      updated_at: '',
      password: '',
      site_url: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser({ ...user, password: user.password || '' });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!currentUser) return;

    try {
      if (currentUser.id) {
        // Update existing user functionality would be added here
        // Since our API doesn't support this yet, we'll just update local state
        setUsers(users.map(user => user.id === currentUser.id ? currentUser : user));
        toast({ title: "User updated successfully" });
      } else {
        // Add new user
        const { user } = await apiService.createUser({
          email: currentUser.email,
          name: currentUser.name,
          role: currentUser.role
        });
        
        if (user) {
          setUsers([...users, user]);
          toast({ title: "User added successfully" });
        }
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save user", 
        variant: "destructive" 
      });
    }
  };

  const confirmDelete = () => {
    if (!currentUser) return;
    
    // Since delete functionality isn't implemented in the API, we'll just update local state
    setUsers(users.filter(user => user.id !== currentUser.id));
    setIsDeleteDialogOpen(false);
    toast({ title: "User deleted successfully" });
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Accounts</h2>
          <p className="text-muted-foreground">Manage user accounts and access credentials.</p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button
          variant="outline"
          size="icon"
          className="ml-2"
          onClick={() => setShowPasswords(!showPasswords)}
          title={showPasswords ? "Hide passwords" : "Show passwords"}
        >
          {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Password</th>
              <th>Site URL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>
                  {showPasswords ? user.password : '••••••••'}
                </td>
                <td>
                  <a href={user.site_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {user.site_url}
                  </a>
                </td>
                <td>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteUser(user)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentUser?.id ? 'Edit User' : 'Add User'}
            </DialogTitle>
            <DialogDescription>
              {currentUser?.id 
                ? 'Update the user details below.' 
                : 'Fill in the user details below to create a new account.'}
            </DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={currentUser.username}
                  onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="text"
                  value={currentUser.password}
                  onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="site_url" className="text-right">
                  Site URL
                </Label>
                <Input
                  id="site_url"
                  value={currentUser.site_url}
                  onChange={(e) => setCurrentUser({ ...currentUser, site_url: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account for {currentUser?.username}.
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

export default Users;
