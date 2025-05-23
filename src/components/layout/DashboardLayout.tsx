
import { ReactNode, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  List, 
  LogOut,
  Shield,
  Building,
  User,
  Calendar
} from 'lucide-react';
import { authService } from '@/services/authService';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

const SidebarItem = ({ to, icon: Icon, label }: SidebarItemProps) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-2 rounded-md transition-colors
      ${isActive 
        ? 'bg-primary text-primary-foreground' 
        : 'hover:bg-secondary text-foreground'
      }
    `}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </NavLink>
);

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    return authService.getCurrentUser() || { username: 'Admin', role: 'admin' };
  });

  useEffect(() => {
    // Update user if it changes in localStorage
    const handleStorageChange = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    authService.logout(navigate);
  };

  return (
    <div className="min-h-screen flex w-full">
      <div className="w-64 border-r border-border">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Admin Portal</h1>
        </div>
        
        <div className="px-2 py-4">
          <nav className="space-y-1">
            <SidebarItem to="/dashboard" icon={Database} label="Dashboard" />
            <SidebarItem to="/sites" icon={Building} label="Sites" />
            <SidebarItem to="/account-logins" icon={User} label="Account Logins" />
            <SidebarItem to="/bank-accounts" icon={Database} label="Bank Accounts" />
            <SidebarItem to="/schedule-runner" icon={Calendar} label="Schedule Runner" />
            <SidebarItem to="/logs" icon={List} label="System Logs" />
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 w-64 px-4 py-4 border-t border-border">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="font-medium text-sm">{user.username?.charAt(0).toUpperCase() || 'A'}</span>
            </div>
            <div>
              <p className="text-sm font-medium">{user.username || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">{user.role || 'admin'}</p>
            </div>
          </div>
          <Separator className="my-2" />
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="border-b border-border h-16 flex items-center px-4">
          <button className="lg:hidden mr-2">
            <List className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        <footer className="border-t border-border p-4 text-center text-sm text-muted-foreground">
          Admin Portal v1.0.0 © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
