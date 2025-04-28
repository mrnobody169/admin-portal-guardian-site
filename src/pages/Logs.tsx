
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
  user: string;
}

const generateLogs = (): LogEntry[] => {
  const logs: LogEntry[] = [];
  const levels = ['info', 'warning', 'error'] as const;
  const sources = ['api', 'database', 'authentication', 'system'];
  const users = ['admin', 'john.doe', 'jane.smith', 'system'];
  const messages = [
    'User login successful',
    'Failed login attempt',
    'Database connection error',
    'API request completed',
    'Password reset requested',
    'Data export initiated',
    'System update completed',
    'Configuration changed',
    'New user account created',
    'User permissions updated',
  ];

  // Generate random logs
  for (let i = 0; i < 100; i++) {
    const date = new Date();
    date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 60 * 24)); // Random time in the last 24 hours
    
    logs.push({
      id: i.toString(),
      timestamp: date.toISOString(),
      level: levels[Math.floor(Math.random() * levels.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      user: users[Math.floor(Math.random() * users.length)],
    });
  }

  // Sort by timestamp, newest first
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const Logs = () => {
  const [logs] = useState<LogEntry[]>(generateLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

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
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());
    
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
              <th>User</th>
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
                <td>{log.user}</td>
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
