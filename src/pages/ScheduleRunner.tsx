
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskCard } from '@/components/schedule/TaskCard';
import { ScheduleForm } from '@/components/schedule/ScheduleForm';
import { ScheduleTable } from '@/components/schedule/ScheduleTable';
import { schedulesApi } from '@/services/api/schedulesApi';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

// Define main schema for form data
const formSchema = z.object({
  site_id: z.string().nullable(),
  schedule_type: z.enum(['once', 'interval', 'daily', 'weekly', 'monthly', 'custom']),
  run_date: z.date().optional(),
  run_time: z.string().optional(),
  interval_minutes: z.string().optional(),
  custom_cron: z.string().optional(),
});

interface Site {
  id: string;
  site_name: string;
  site_id: string;
}

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

const ScheduleRunner = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load sites and existing schedules
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching sites data...');
        // Fetch sites first
        const sitesData = await schedulesApi.getSites();
        console.log('Sites data received:', sitesData);
        
        if (isMounted) {
          setSites(sitesData || []);
        }
        
        console.log('Fetching schedules data...');
        // Then fetch schedules
        const schedulesData = await schedulesApi.getAllSchedules();
        console.log('Schedules data received:', schedulesData);
        
        if (isMounted) {
          // Enhance schedule data with site names for better display
          const enhancedSchedules = (schedulesData || []).map(schedule => {
            if (!schedule.site_id) {
              return { ...schedule, site_name: undefined };
            }
            
            const matchingSite = sitesData?.find(site => site.id === schedule.site_id);
            return { 
              ...schedule, 
              site_name: matchingSite?.site_name || 'Unknown Site' 
            };
          });
          
          setSchedules(enhancedSchedules);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        if (isMounted) {
          setError(error?.message || "Failed to load data");
          toast({
            variant: "destructive",
            title: "Error loading data",
            description: "Failed to load sites or schedules. Please try again.",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, [toast]);

  // Handle schedule creation
  const handleCreateSchedule = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      // Convert form values to the format expected by the API
      let cronExpression = '';
      
      switch (values.schedule_type) {
        case 'once':
          if (values.run_date && values.run_time) {
            const date = new Date(values.run_date);
            const [hours, minutes] = values.run_time.split(':').map(Number);
            date.setHours(hours || 0, minutes || 0);
            
            // Format date as cron expression for one-time run
            cronExpression = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
          }
          break;
        case 'interval':
          if (values.interval_minutes) {
            cronExpression = `*/${values.interval_minutes} * * * *`;
          }
          break;
        case 'daily':
          if (values.run_time) {
            const [hours, minutes] = values.run_time.split(':').map(Number);
            cronExpression = `${minutes || 0} ${hours || 0} * * *`;
          }
          break;
        case 'weekly':
          if (values.run_date && values.run_time) {
            const [hours, minutes] = values.run_time.split(':').map(Number);
            cronExpression = `${minutes || 0} ${hours || 0} * * ${values.run_date.getDay()}`;
          }
          break;
        case 'monthly':
          if (values.run_date && values.run_time) {
            const [hours, minutes] = values.run_time.split(':').map(Number);
            cronExpression = `${minutes || 0} ${hours || 0} ${values.run_date.getDate()} * *`;
          }
          break;
        case 'custom':
          cronExpression = values.custom_cron || '';
          break;
      }

      // Fix null site_id handling for "All Sites" option
      let siteId = values.site_id;
      if (siteId === 'null') siteId = null;
      
      const scheduleData = {
        site_id: siteId,
        schedule_type: values.schedule_type,
        cron_expression: cronExpression,
        status: 'active'
      };

      console.log('Creating schedule with data:', scheduleData);
      const result = await schedulesApi.createSchedule(scheduleData);
      console.log('Schedule creation result:', result);
      
      if (result) {
        toast({
          title: "Schedule created",
          description: "Your schedule has been created successfully.",
        });
        
        // Refresh schedules list
        const updatedSchedules = await schedulesApi.getAllSchedules();
        console.log('Updated schedules:', updatedSchedules);
        
        if (updatedSchedules) {
          // Enhance schedule data with site names
          const enhancedSchedules = updatedSchedules.map(schedule => {
            if (!schedule.site_id) return { ...schedule, site_name: undefined };
            
            const matchingSite = sites.find(site => site.id === schedule.site_id);
            return { 
              ...schedule, 
              site_name: matchingSite?.site_name || 'Unknown Site' 
            };
          });
          
          setSchedules(enhancedSchedules);
        }
      }
    } catch (error: any) {
      console.error("Error creating schedule:", error);
      toast({
        variant: "destructive",
        title: "Error creating schedule",
        description: error?.message || "Failed to create schedule. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const runNow = async (siteId: string | null) => {
    try {
      setLoading(true);
      console.log(`Running task for site: ${siteId || 'all sites'}`);
      await schedulesApi.runTask(siteId);
      
      toast({
        title: "Task started",
        description: siteId ? "Site crawl started successfully" : "All sites crawl started successfully",
      });
    } catch (error: any) {
      console.error("Error running task:", error);
      toast({
        variant: "destructive",
        title: "Error running task",
        description: error?.message || "Failed to start the task. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      setLoading(true);
      console.log(`Deleting schedule: ${id}`);
      await schedulesApi.deleteSchedule(id);
      
      toast({
        title: "Schedule deleted",
        description: "The schedule has been deleted successfully.",
      });
      
      // Remove the deleted schedule from state without refetching
      setSchedules(prevSchedules => prevSchedules.filter(schedule => schedule.id !== id));
    } catch (error: any) {
      console.error("Error deleting schedule:", error);
      toast({
        variant: "destructive",
        title: "Error deleting schedule",
        description: error?.message || "Failed to delete the schedule. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to retry data loading
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // This will trigger the useEffect again
  };

  // Show loading state
  if (loading && schedules.length === 0 && sites.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="h-[300px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
          
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={handleRetry} 
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Schedule Runner</h1>
        <p className="text-muted-foreground">
          Schedule and manage crawler tasks for bank data collection
        </p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Quick Actions */}
        <TaskCard 
          sites={sites}
          onRunTask={runNow}
        />

        {/* Create Schedule Form */}
        <ScheduleForm 
          sites={sites}
          onSubmit={handleCreateSchedule}
          isLoading={loading}
        />
      </div>

      {/* Existing Schedules */}
      <div className="mt-8">
        <ScheduleTable 
          schedules={schedules}
          onRunNow={runNow}
          onDelete={deleteSchedule}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default ScheduleRunner;
