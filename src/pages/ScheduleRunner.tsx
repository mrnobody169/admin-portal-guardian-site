
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, PlayIcon, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

import { schedulesApi } from '@/services/api/schedulesApi';

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

const formSchema = z.object({
  site_id: z.string().nullable(),
  schedule_type: z.enum(['once', 'interval', 'daily', 'weekly', 'monthly', 'custom']),
  run_date: z.date().optional(),
  run_time: z.string().optional(),
  interval_minutes: z.string().optional(),
  custom_cron: z.string().optional(),
});

const ScheduleRunner = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      site_id: null,
      schedule_type: 'once',
    },
  });

  const scheduleType = form.watch('schedule_type');

  // Load sites and existing schedules
  useEffect(() => {
    const fetchData = async () => {
      if (dataFetched) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch sites first
        const sitesData = await schedulesApi.getSites();
        setSites(sitesData || []);
        
        // Then fetch schedules
        const schedulesData = await schedulesApi.getAllSchedules();
        setSchedules(schedulesData || []);
        
        // Mark data as fetched to prevent re-fetching
        setDataFetched(true);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error?.message || "Failed to load data");
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "Failed to load sites or schedules. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, dataFetched]);

  // Safe function to handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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

      const scheduleData = {
        site_id: values.site_id,
        schedule_type: values.schedule_type,
        cron_expression: cronExpression,
        status: 'active'
      };

      const result = await schedulesApi.createSchedule(scheduleData);
      
      if (result) {
        toast({
          title: "Schedule created",
          description: "Your schedule has been created successfully.",
        });
        
        // Refresh schedules list
        const updatedSchedules = await schedulesApi.getAllSchedules();
        if (updatedSchedules) {
          setSchedules(updatedSchedules);
        }
        
        // Reset form
        form.reset({
          site_id: null,
          schedule_type: 'once',
        });
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

  // Show loading state
  if (loading && !dataFetched) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Loading Schedule Runner...</h2>
            <p className="text-muted-foreground">Please wait while we fetch your data.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !dataFetched) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => {
            setError(null);
            setDataFetched(false);
          }}>
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
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Run crawlers immediately without scheduling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => runNow(null)}
              disabled={loading}
            >
              <PlayIcon className="mr-2 h-4 w-4" />
              Run All Sites Now
            </Button>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Run Specific Site:</label>
              <div className="flex gap-2">
                <Select 
                  disabled={loading} 
                  onValueChange={(value) => form.setValue('site_id', value)}
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
                  onClick={() => runNow(form.getValues('site_id'))}
                  disabled={!form.getValues('site_id') || loading}
                >
                  Run
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Schedule Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Schedule</CardTitle>
            <CardDescription>Set up automated crawler schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="site_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site</FormLabel>
                      <Select 
                        disabled={loading} 
                        onValueChange={field.onChange} 
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a site (optional, runs all if empty)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">All Sites</SelectItem>
                          {sites.map((site) => (
                            <SelectItem key={site.id} value={site.id}>
                              {site.site_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Leave empty to schedule all sites
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schedule_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-3 gap-2"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="once" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Once
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="interval" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Interval
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="daily" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Daily
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="weekly" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Weekly
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="monthly" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Monthly
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="custom" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Custom
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Conditional fields based on schedule type */}
                {scheduleType === 'once' && (
                  <>
                    <FormField
                      control={form.control}
                      name="run_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className="w-full pl-3 text-left font-normal"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="run_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {scheduleType === 'interval' && (
                  <FormField
                    control={form.control}
                    name="interval_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interval (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={1}
                          />
                        </FormControl>
                        <FormDescription>
                          Run every X minutes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {scheduleType === 'daily' && (
                  <FormField
                    control={form.control}
                    name="run_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {scheduleType === 'weekly' && (
                  <>
                    <FormField
                      control={form.control}
                      name="run_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Day of Week</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              const date = new Date();
                              date.setDate(date.getDate() + ((parseInt(value) - date.getDay() + 7) % 7));
                              field.onChange(date);
                            }}
                            value={field.value ? String(field.value.getDay()) : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select day" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">Sunday</SelectItem>
                              <SelectItem value="1">Monday</SelectItem>
                              <SelectItem value="2">Tuesday</SelectItem>
                              <SelectItem value="3">Wednesday</SelectItem>
                              <SelectItem value="4">Thursday</SelectItem>
                              <SelectItem value="5">Friday</SelectItem>
                              <SelectItem value="6">Saturday</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="run_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {scheduleType === 'monthly' && (
                  <>
                    <FormField
                      control={form.control}
                      name="run_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Day of Month</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              const date = new Date();
                              date.setDate(parseInt(value));
                              field.onChange(date);
                            }}
                            value={field.value ? String(field.value.getDate()) : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select day" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 31 }, (_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>
                                  {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="run_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {scheduleType === 'custom' && (
                  <FormField
                    control={form.control}
                    name="custom_cron"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cron Expression</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="* * * * *"
                          />
                        </FormControl>
                        <FormDescription>
                          Format: minute hour day month day_of_week
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" disabled={loading}>
                  Create Schedule
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Existing Schedules */}
      <Card className="mt-8">
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
                            onClick={() => runNow(schedule.site_id)}
                            disabled={loading}
                          >
                            <PlayIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteSchedule(schedule.id)}
                            disabled={loading}
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
    </div>
  );
};

export default ScheduleRunner;
