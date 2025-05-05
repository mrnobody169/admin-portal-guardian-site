
import { AppDataSource, Repository } from "../database/connection";
import { Schedule } from "../entities/Schedule";
import { Site } from "../entities/Site";
import { LogService } from "./LogService";
import { SiteService } from "./SiteService";
import cron from "node-cron";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export class ScheduleService {
  private scheduleRepository: Repository<Schedule>;
  private logService: LogService;
  private siteService: SiteService;
  private activeCronJobs: Map<string, cron.ScheduledTask>;

  constructor() {
    this.scheduleRepository = new Repository<Schedule>('schedules');
    this.logService = new LogService();
    this.siteService = new SiteService();
    this.activeCronJobs = new Map();
  }

  async findAll(): Promise<Schedule[]> {
    // Initialize Data Source if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const schedules = await this.scheduleRepository.findAll();

    // Get site information for each schedule
    const enrichedSchedules = await Promise.all(schedules.map(async (schedule) => {
      if (schedule.site_id) {
        const site = await this.siteService.findBySiteId(schedule.site_id);
        if (site) {
          return { ...schedule, site_name: site.site_name };
        }
      }
      return { ...schedule, site_name: null };
    }));

    return enrichedSchedules as Schedule[];
  }

  async findById(id: string): Promise<Schedule | null> {
    // Initialize Data Source if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    return this.scheduleRepository.findOne({ id });
  }

  async create(scheduleData: Partial<Schedule>, loggedInUserId?: string): Promise<Schedule> {
    // Initialize Data Source if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Calculate next run time based on cron expression
    const nextRunTime = this.calculateNextRunTime(scheduleData.cron_expression!);
    scheduleData.next_run_time = nextRunTime;

    const schedule = await this.scheduleRepository.create(scheduleData);

    // Start the cron job for this schedule
    await this.startCronJob(schedule);

    // Log the action
    await this.logService.create({
      action: "create",
      entity: "schedules",
      entity_id: schedule.id,
      user_id: loggedInUserId,
      details: scheduleData,
    });

    return schedule;
  }

  async update(id: string, scheduleData: Partial<Schedule>, loggedInUserId?: string): Promise<Schedule> {
    // Initialize Data Source if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const schedule = await this.findById(id);
    if (!schedule) {
      throw new Error("Schedule not found");
    }

    // If cron expression is updated, recalculate next run time
    if (scheduleData.cron_expression) {
      scheduleData.next_run_time = this.calculateNextRunTime(scheduleData.cron_expression);
    }

    const updatedSchedule = await this.scheduleRepository.update(id, scheduleData);

    // Update or restart the cron job if necessary
    if (scheduleData.cron_expression || scheduleData.status) {
      // Stop the existing job
      this.stopCronJob(id);

      // Start a new one if the schedule is active
      if (updatedSchedule.status === 'active') {
        await this.startCronJob(updatedSchedule);
      }
    }

    // Log the action
    await this.logService.create({
      action: "update",
      entity: "schedules",
      entity_id: id,
      user_id: loggedInUserId,
      details: scheduleData,
    });

    return updatedSchedule;
  }

  async delete(id: string, loggedInUserId?: string): Promise<void> {
    // Initialize Data Source if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const schedule = await this.findById(id);
    if (!schedule) {
      throw new Error("Schedule not found");
    }

    // Stop the cron job before deleting
    this.stopCronJob(id);

    await this.scheduleRepository.delete(id);

    // Log the action
    await this.logService.create({
      action: "delete",
      entity: "schedules",
      entity_id: id,
      user_id: loggedInUserId,
      details: { deletedSchedule: schedule },
    });
  }

  private calculateNextRunTime(cronExpression: string): Date | null {
    try {
      // Special case for one-time schedules - this is a simplified approach
      if (cronExpression.includes('once')) {
        const parts = cronExpression.split(' ');
        const date = new Date();
        date.setMinutes(parseInt(parts[0]));
        date.setHours(parseInt(parts[1]));
        date.setDate(parseInt(parts[2]));
        date.setMonth(parseInt(parts[3]) - 1); // Month is 0-indexed in JS
        return date;
      }

      // For regular cron expressions
      if (cron.validate(cronExpression)) {
        const interval = cron.schedule(cronExpression, () => {});
        const nextDate = interval.nextDate().toJSDate();
        interval.stop();
        return nextDate;
      }
      
      return null;
    } catch (error) {
      console.error('Error calculating next run time:', error);
      return null;
    }
  }

  private async startCronJob(schedule: Schedule): Promise<void> {
    // Don't start if not active
    if (schedule.status !== 'active') return;

    try {
      // Stop any existing job for this schedule
      this.stopCronJob(schedule.id);

      // Create a new cron job
      const job = cron.schedule(schedule.cron_expression, async () => {
        // Run the task
        try {
          if (schedule.site_id) {
            await this.runSite(schedule.site_id);
          } else {
            await this.runAllSites();
          }

          // Update the last run time and calculate next run time
          const now = new Date();
          const nextRunTime = this.calculateNextRunTime(schedule.cron_expression);
          
          await this.scheduleRepository.update(schedule.id, { 
            last_run_time: now,
            next_run_time: nextRunTime
          });
        } catch (error) {
          console.error(`Error executing scheduled task ${schedule.id}:`, error);
          // Log the error but don't stop the schedule
          await this.logService.create({
            action: "error",
            entity: "schedules",
            entity_id: schedule.id,
            details: { error: error.message },
          });
        }
      });

      // Store the job in the map
      this.activeCronJobs.set(schedule.id, job);
      
      // Log that the job has been scheduled
      console.log(`Scheduled job ${schedule.id} with cron expression ${schedule.cron_expression}`);
    } catch (error) {
      console.error(`Error scheduling job ${schedule.id}:`, error);
    }
  }

  private stopCronJob(scheduleId: string): void {
    const job = this.activeCronJobs.get(scheduleId);
    if (job) {
      job.stop();
      this.activeCronJobs.delete(scheduleId);
      console.log(`Stopped job ${scheduleId}`);
    }
  }

  async initializeSchedules(): Promise<void> {
    // Initialize Data Source if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Get all active schedules
    const schedules = await this.scheduleRepository.find({
      where: { status: 'active' }
    });

    // Start each schedule
    for (const schedule of schedules) {
      await this.startCronJob(schedule);
    }

    console.log(`Initialized ${schedules.length} cron jobs`);
  }

  async runSite(siteId: string): Promise<void> {
    const site = await this.siteService.findBySiteId(siteId);
    if (!site) {
      throw new Error(`Site with ID ${siteId} not found`);
    }

    // Find the corresponding site script
    const scriptsBasePath = path.join(__dirname, '..', 'site');
    let scriptPath = '';
    
    // Find the script based on site_id pattern
    if (siteId === process.env.I_RIK_VIP_ID) {
      scriptPath = path.join(scriptsBasePath, 'i-rik-vip', 'index.ts');
    } else if (siteId === process.env.PLAY_IWIN_BIO_ID) {
      scriptPath = path.join(scriptsBasePath, 'play-iwin-bio', 'index.ts');
    } else if (siteId === process.env.PLAY_B52_CC_ID) {
      scriptPath = path.join(scriptsBasePath, 'play-b52-cc', 'index.ts');
    }

    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Script not found for site ${site.site_name}`);
    }

    console.log(`Running script for site ${site.site_name} at ${scriptPath}`);
    
    // Execute the script with ts-node
    const child = spawn('npx', ['ts-node', scriptPath], {
      cwd: path.join(__dirname, '..', '..'),
      stdio: 'pipe',
      env: process.env
    });
    
    // Log output
    child.stdout.on('data', (data) => {
      console.log(`[${site.site_name}] ${data}`);
    });
    
    child.stderr.on('data', (data) => {
      console.error(`[${site.site_name}] ERROR: ${data}`);
    });
    
    // Handle process exit
    child.on('close', (code) => {
      console.log(`Child process for ${site.site_name} exited with code ${code}`);
    });
    
    // Log the action
    await this.logService.create({
      action: "run",
      entity: "sites",
      entity_id: siteId,
      details: { site_name: site.site_name },
    });
  }

  async runAllSites(): Promise<void> {
    // Get all sites
    const sites = await this.siteService.findAll();
    
    // Run each site
    for (const site of sites) {
      try {
        await this.runSite(site.id);
      } catch (error) {
        console.error(`Error running site ${site.site_name}:`, error);
      }
    }
  }
}
