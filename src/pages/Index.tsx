
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Automatically redirect to login
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Admin Portal</h1>
        <p className="text-xl text-muted-foreground mb-8">Loading application...</p>
      </div>
    </div>
  );
};

export default Index;
