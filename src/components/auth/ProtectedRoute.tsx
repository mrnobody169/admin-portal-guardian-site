
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem('authToken');
    
    if (!token && location.pathname !== '/login') {
      toast({
        title: "Authentication required",
        description: "Please login to access this page",
        variant: "destructive",
      });
      setIsAuthenticated(false);
    } else if (token) {
      // Here you could add token validation logic
      // For now, we just assume the token is valid if it exists
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [location.pathname]);

  // Check for token expiration or invalidity
  useEffect(() => {
    const handleAuthError = (event: StorageEvent) => {
      if (event.key === 'authToken' && !event.newValue) {
        setIsAuthenticated(false);
        navigate('/login');
      }
    };

    window.addEventListener('storage', handleAuthError);
    
    return () => {
      window.removeEventListener('storage', handleAuthError);
    };
  }, [navigate]);

  if (isAuthenticated === null) {
    // Still checking authentication status
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
