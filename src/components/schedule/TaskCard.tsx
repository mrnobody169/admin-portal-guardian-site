
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlayIcon } from 'lucide-react';
import { TaskProgress } from '@/components/progress/TaskProgress';
import { useToast } from '@/hooks/use-toast';

interface TaskCardProps {
  sites: Array<{ id: string; site_name: string; }>;
  onRunTask: (siteId: string | null) => Promise<void>;
}

export function TaskCard({ sites, onRunTask }: TaskCardProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const { toast } = useToast();

  const handleRunTask = async (siteId: string | null) => {
    try {
      setTaskStatus('running');
      await onRunTask(siteId);
      setTaskStatus('completed');
      
      toast({
        title: "Task started",
        description: siteId ? "Site crawl started successfully" : "All sites crawl started successfully",
      });
      
      // Reset status after showing completion for a moment
      setTimeout(() => {
        setTaskStatus('idle');
      }, 3000);
    } catch (error) {
      setTaskStatus('error');
      
      toast({
        variant: "destructive",
        title: "Error running task",
        description: "Failed to start the task. Please try again.",
      });
      
      // Reset error status after a moment
      setTimeout(() => {
        setTaskStatus('idle');
      }, 3000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          className="w-full" 
          onClick={() => handleRunTask(null)}
          disabled={taskStatus === 'running'}
        >
          <PlayIcon className="mr-2 h-4 w-4" />
          Run All Sites Now
        </Button>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Run Specific Site:</label>
          <div className="flex gap-2">
            <Select 
              disabled={taskStatus === 'running'} 
              onValueChange={(value) => setSelectedSiteId(value)}
              value={selectedSiteId || undefined}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.site_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={() => handleRunTask(selectedSiteId)}
              disabled={!selectedSiteId || taskStatus === 'running'}
            >
              Run
            </Button>
          </div>
        </div>
        
        <TaskProgress 
          siteId={selectedSiteId} 
          status={taskStatus}
          startTime={taskStatus === 'running' ? new Date() : undefined}
          className="mt-4"
        />
      </CardContent>
    </Card>
  );
}
