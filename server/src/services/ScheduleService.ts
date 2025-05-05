
import { AppDataSource, Repository } from "../database/connection";
import { Schedule } from "../entities/Schedule";
import { LogService } from "./LogService";
import { SiteService } from "./SiteService";
import { CronManager } from "./CronManager";
import { TaskRunner } from "./TaskRunner";
import { CronUtils } from "./CronUtils";

export class ScheduleService {
  private scheduleRepository: Repository<Schedule>;
  private logService: LogService;
  private siteService: SiteService;
  private cronManager: CronManager;
  private taskRunner: TaskRunner;

  constructor() {
    this.scheduleRepository = new Repository<Schedule>("schedules");
    this.logService = new LogService();
    this.siteService = new SiteService();
    this.cronManager = new CronManager();
    this.taskRunner = new TaskRunner();
  }

  async findAll(): Promise<Schedule[]> {
    // Initialize Data Source if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const schedules = await this.scheduleRepository.findAll();

    // Get site information for each schedule
    const enrichedSchedules = await Promise.all(
      schedules.map(async (schedule) => {
        if (schedule.site_id) {
          const site = await this.siteService.findBySiteId(schedule.site_id);
          if (site) {
            return { ...schedule, site_name: site.site_name };
          }
        }
        return { ...schedule, site_name: null };
      })
    );

    return enrichedSchedules as Schedule[];
  }

  async findById(id: string): Promise<Schedule | null> {
    // Initialize Data Source if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    return this.scheduleRepository.findOne({ id });
  }

  async create(
    scheduleData: Partial<Schedule>,
    loggedInUserId?: string
  ): Promise<Schedule> {
    // Initialize Data Source if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Calculate next run time based on cron expression
    const nextRunTime = CronUtils.calculateNextRunTime(
      scheduleData.cron_expression!
    );
    scheduleData.next_run_time = nextRunTime;
    
    // Generate description if not provided
    if (!scheduleData.description) {
      scheduleData.description = CronUtils.generateDescription(
        scheduleData.schedule_type!,
        scheduleData.cron_expression!
      );
    }

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

  async update(
    id: string,
    scheduleData: Partial<Schedule>,
    loggedInUserId?: string
  ): Promise<Schedule> {
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
      scheduleData.next_run_time = CronUtils.calculateNextRunTime(
        scheduleData.cron_expression
      );
      
      // Update description if schedule_type or cron_expression changed
      if (scheduleData.schedule_type || scheduleData.cron_expression) {
        const scheduleType = scheduleData.schedule_type || schedule.schedule_type;
        scheduleData.description = CronUtils.generateDescription(
          scheduleType,
          scheduleData.cron_expression
        );
      }
    }

    const updatedSchedule = await this.scheduleRepository.update(
      id,
      scheduleData
    );

    // Update or restart the cron job if necessary
    if (scheduleData.cron_expression || scheduleData.status) {
      // Stop the existing job
      this.cronManager.stopCronJob(id);

      // Start a new one if the schedule is active
      if (updatedSchedule.status === "active") {
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
    this.cronManager.stopCronJob(id);

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

  private async startCronJob(schedule: Schedule): Promise<void> {
    // Create task callback for this specific schedule
    const taskCallback = async () => {
      try {
        // Run the appropriate task based on the schedule
        if (schedule.site_id) {
          await this.taskRunner.runSite(schedule.site_id);
        } else {
          await this.taskRunner.runAllSites();
        }

        // Update the last run time and calculate next run time
        const now = new Date();
        const nextRunTime = CronUtils.calculateNextRunTime(
          schedule.cron_expression
        );

        await this.scheduleRepository.update(schedule.id, {
          last_run_time: now,
          next_run_time: nextRunTime,
        });
      } catch (error) {
        console.error(`Error in task callback for schedule ${schedule.id}:`, error);
      }
    };

    // Start the cron job with the task callback
    this.cronManager.startCronJob(schedule, taskCallback);
  }

  async initializeSchedules(): Promise<void> {
    // Initialize Data Source if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Get all active schedules
    const activeSchedules = await this.scheduleRepository.findAll();
    const schedules = activeSchedules.filter(schedule => schedule.status === "active");

    // Start each schedule
    for (const schedule of schedules) {
      await this.startCronJob(schedule);
    }

    console.log(`Initialized ${schedules.length} cron jobs`);
  }

  async runSite(siteId: string): Promise<void> {
    return this.taskRunner.runSite(siteId);
  }

  async runAllSites(): Promise<void> {
    return this.taskRunner.runAllSites();
  }
}
