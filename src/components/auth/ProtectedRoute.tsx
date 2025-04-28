
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
    
    if (!token && location.pathname !== '/login') {
      toast({
        title: "Authentication required",
        description: "Please login to access this page",
        variant: "destructive",
      });
    }
  }, [location.pathname]);

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
