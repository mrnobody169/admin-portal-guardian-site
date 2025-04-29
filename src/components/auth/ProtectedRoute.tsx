
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem('authToken');
    
    if (!token && location.pathname !== '/login') {
      console.log('No auth token found, redirecting to login');
      toast({
        title: "Authentication required",
        description: "Please login to access this page",
        variant: "destructive",
      });
      setIsAuthenticated(false);
    } else if (token) {
      // Here you could add token validation logic
      // For now, we just assume the token is valid if it exists
      console.log('Auth token found, allowing access');
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    
    setIsLoading(false);
  }, [location.pathname]);

  // Check for token expiration or invalidity
  useEffect(() => {
    const handleAuthError = (event: StorageEvent) => {
      if (event.key === 'authToken' && !event.newValue) {
        console.log('Auth token removed from storage, redirecting to login');
        setIsAuthenticated(false);
        navigate('/login');
      }
    };

    window.addEventListener('storage', handleAuthError);
    
    return () => {
      window.removeEventListener('storage', handleAuthError);
    };
  }, [navigate]);

  if (isLoading) {
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
