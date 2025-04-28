
import { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('authToken');
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
};

export default Login;
