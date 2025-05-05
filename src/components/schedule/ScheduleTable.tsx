
import { format } from 'date-fns';
import { PlayIcon, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Schedule {
  id: string;
  site_id: string | null;
  site_name?: string;
  schedule_type: string;
  cron_expression: string;
  next_run_time: string;
  last_run_time: string | null;
  status: string;
  created_at: string;
}

interface ScheduleTableProps {
  schedules: Schedule[];
  onRunNow: (siteId: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

export function ScheduleTable({ schedules, onRunNow, onDelete, isLoading }: ScheduleTableProps) {
  const getNextRunText = (schedule: Schedule) => {
    if (!schedule.next_run_time) return 'Not scheduled';
    
    try {
      const nextRun = new Date(schedule.next_run_time);
      return format(nextRun, 'MMM dd, yyyy HH:mm');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getLastRunText = (schedule: Schedule) => {
    if (!schedule.last_run_time) return 'Never run';
    
    try {
      const lastRun = new Date(schedule.last_run_time);
      return format(lastRun, 'MMM dd, yyyy HH:mm');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Schedules</CardTitle>
        <CardDescription>Manage your existing crawler schedules</CardDescription>
      </CardHeader>
      <CardContent>
        {schedules.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{schedule.site_name || 'All Sites'}</TableCell>
                    <TableCell className="capitalize">{schedule.schedule_type}</TableCell>
                    <TableCell>{getNextRunText(schedule)}</TableCell>
                    <TableCell>{getLastRunText(schedule)}</TableCell>
                    <TableCell>
                      <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>
                        {schedule.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onRunNow(schedule.site_id)}
                          disabled={isLoading}
                        >
                          <PlayIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onDelete(schedule.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No schedules found. Create a new schedule to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
