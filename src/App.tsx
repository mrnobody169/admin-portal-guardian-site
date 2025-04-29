
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/Login';
import Index from '@/pages/Index';
import BankAccounts from '@/pages/BankAccounts';
import Sites from '@/pages/Sites';
import AccountLogins from '@/pages/AccountLogins';
import Logs from '@/pages/Logs';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { websocketService } from '@/services/websocket/websocketService';
import { useEffect } from 'react';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize WebSocket connection
    try {
      websocketService.connect();
      
      // Clean up on unmount
      return () => {
        websocketService.disconnect();
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/bank-accounts" element={<DashboardLayout><BankAccounts /></DashboardLayout>} />
          <Route path="/sites" element={<DashboardLayout><Sites /></DashboardLayout>} />
          <Route path="/account-logins" element={<DashboardLayout><AccountLogins /></DashboardLayout>} />
          <Route path="/logs" element={<DashboardLayout><Logs /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
