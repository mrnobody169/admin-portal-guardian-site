
import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';

export interface TaskProgressProps {
  siteId: string | null;
  status: 'idle' | 'running' | 'completed' | 'error';
  startTime?: Date;
  onComplete?: () => void;
  className?: string;
}

export function TaskProgress({
  siteId,
  status,
  startTime,
  onComplete,
  className
}: TaskProgressProps) {
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Simulate progress based on status
  useEffect(() => {
    if (status === 'idle') {
      setProgress(0);
      setElapsedTime(0);
      return;
    }
    
    if (status === 'completed') {
      setProgress(100);
      if (onComplete) onComplete();
      return;
    }
    
    if (status === 'error') {
      return;
    }
    
    // For running status, simulate progress
    let interval: number | undefined;
    let timeInterval: number | undefined;
    
    if (status === 'running') {
      // Progress simulation - gradually increase but never quite reach 100%
      interval = window.setInterval(() => {
        setProgress(prev => {
          // Slow down progress as it gets closer to 90%
          const increment = Math.max(0.5, (95 - prev) / 20);
          const newProgress = prev + increment;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 1000);
      
      // Track elapsed time
      timeInterval = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (timeInterval) clearInterval(timeInterval);
    };
  }, [status, onComplete]);
  
  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  if (status === 'idle') {
    return null;
  }
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-medium">
          {status === 'running' && (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Task in progress...
            </>
          )}
          {status === 'completed' && 'Task completed'}
          {status === 'error' && 'Task failed'}
        </div>
        {status === 'running' && (
          <div className="text-muted-foreground">
            {formatElapsedTime()}
          </div>
        )}
      </div>
      
      {status === 'running' ? (
        <Progress value={progress} className="h-2" />
      ) : status === 'completed' ? (
        <Progress value={100} className="h-2 bg-green-500/20" />
      ) : (
        <Progress value={100} className="h-2 bg-destructive/20" />
      )}
      
      <div className="text-xs text-muted-foreground">
        {siteId ? 'Processing specific site' : 'Processing all sites'}
      </div>
    </div>
  );
}
