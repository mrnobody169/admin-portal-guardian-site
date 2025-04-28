import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Shield } from 'lucide-react';
import { apiService } from '@/services/api';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real application with Supabase, we'd use the email/password
      // For now, we'll keep the admin/admin functionality for demo
      if (username === 'admin' && password === 'admin') {
        // Store auth token
        localStorage.setItem('authToken', 'demo-token');
        localStorage.setItem('user', JSON.stringify({ username, role: 'admin' }));
        
        toast({
          title: "Login successful",
          description: "Welcome back to the admin portal",
        });
        
        onLoginSuccess();
        navigate('/dashboard');
      } else {
        // Try to login via API - this would work when we add users to Supabase
        try {
          // Note: username is used as email here
          const response = await apiService.login(username, password);
          
          if (response.session) {
            localStorage.setItem('authToken', response.session.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            toast({
              title: "Login successful",
              description: "Welcome back to the admin portal",
            });
            
            onLoginSuccess();
            navigate('/dashboard');
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (error) {
          toast({
            title: "Authentication failed",
            description: "Invalid username or password",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Authentication failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Admin Portal</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username"
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Default credentials: admin / admin
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm;
