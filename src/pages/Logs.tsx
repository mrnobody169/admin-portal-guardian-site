
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/api';
import { Tables } from '@/integrations/supabase/types';
import { Loader2 } from 'lucide-react';

interface LogEntry extends Tables<'logs'> {
  timestamp?: string;
  level?: 'info' | 'warning' | 'error';
  source?: string;
  message?: string;
  user_id?: string; // Changed from 'user' to 'user_id' to match the schema
}

const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const { logs } = await apiService.getLogs();
        
        // Map the logs from the API to match our UI expectations
        const formattedLogs = (logs || []).map((log: LogEntry) => ({
          ...log,
          timestamp: log.created_at,
          level: mapActionToLevel(log.action),
          source: log.entity,
          message: log.details ? JSON.stringify(log.details) : log.action
        }));
        
        setLogs(formattedLogs);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);
  
  // Map action to level for display purposes
  const mapActionToLevel = (action: string): 'info' | 'warning' | 'error' => {
    if (action.includes('error') || action.includes('failed') || action.includes('delete')) {
      return 'error';
    }
    if (action.includes('warning') || action.includes('update')) {
      return 'warning';
    }
    return 'info';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-primary/20 text-primary';
      case 'warning':
        return 'bg-warning/20 text-warning';
      case 'error':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.message?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (log.source?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (log.entity?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Logs</h2>
        <p className="text-muted-foreground">View and filter system event logs.</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        
        <p className="ml-auto text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {logs.length} logs
        </p>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Level</th>
              <th>Source</th>
              <th>User ID</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td className="whitespace-nowrap">{formatDate(log.timestamp)}</td>
                <td>
                  <Badge variant="outline" className={getLevelBadgeClass(log.level)}>
                    {log.level.toUpperCase()}
                  </Badge>
                </td>
                <td>{log.source}</td>
                <td>{log.user_id}</td>
                <td className="max-w-md truncate">{log.message}</td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8">No logs found matching your filters</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-center">
        <Button variant="outline">Export Logs</Button>
      </div>
    </div>
  );
};

export default Logs;
