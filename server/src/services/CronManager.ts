
import cron from "node-cron";
import { Schedule } from "../entities/Schedule";
import { LogService } from "./LogService";

export class CronManager {
  private activeCronJobs: Map<string, cron.ScheduledTask>;
  private logService: LogService;

  constructor() {
    this.activeCronJobs = new Map();
    this.logService = new LogService();
  }

  startCronJob(schedule: Schedule, taskCallback: () => Promise<void>): void {
    // Don't start if not active
    if (schedule.status !== "active") return;

    try {
      // Stop any existing job for this schedule
      this.stopCronJob(schedule.id);

      // Create a new cron job
      const job = cron.schedule(schedule.cron_expression, async () => {
        // Log start of execution
        console.log(`Executing scheduled task ${schedule.id} (${schedule.description || 'No description'})`);
        
        // Run the task
        try {
          await taskCallback();
          
          // Log successful execution
          console.log(`Successfully completed task ${schedule.id}`);
        } catch (error: any) {
          console.error(
            `Error executing scheduled task ${schedule.id}:`,
            error
          );
          // Log the error but don't stop the schedule
          await this.logService.create({
            action: "error",
            entity: "schedules",
            entity_id: schedule.id,
            details: { error: error?.message || "Unknown error" },
          });
        }
      });

      // Store the job in the map
      this.activeCronJobs.set(schedule.id, job);

      // Log that the job has been scheduled
      console.log(
        `Scheduled job ${schedule.id} with cron expression ${schedule.cron_expression}`
      );
    } catch (error) {
      console.error(`Error scheduling job ${schedule.id}:`, error);
    }
  }

  stopCronJob(scheduleId: string): void {
    const job = this.activeCronJobs.get(scheduleId);
    if (job) {
      job.stop();
      this.activeCronJobs.delete(scheduleId);
      console.log(`Stopped job ${scheduleId}`);
    }
  }

  stopAllJobs(): void {
    for (const [scheduleId, job] of this.activeCronJobs.entries()) {
      job.stop();
      console.log(`Stopped job ${scheduleId}`);
    }
    this.activeCronJobs.clear();
  }

  getActiveJobsCount(): number {
    return this.activeCronJobs.size;
  }
  
  getActiveJobsInfo(): { id: string; expression: string }[] {
    const jobsInfo: { id: string; expression: string }[] = [];
    // this.activeCronJobs.forEach((job, scheduleId) => {
    //   jobsInfo.push({
    //     id: scheduleId,
    //     expression: job.getExpression()
    //   });
    // });
    return jobsInfo;
  }
}
