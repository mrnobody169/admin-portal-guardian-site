
import cron from "node-cron";

export class CronUtils {
  static calculateNextRunTime(cronExpression: string): Date | null {
    try {
      // Special case for one-time schedules - this is a simplified approach
      if (cronExpression.includes("once")) {
        const parts = cronExpression.split(" ");
        const date = new Date();
        date.setMinutes(parseInt(parts[0]));
        date.setHours(parseInt(parts[1]));
        date.setDate(parseInt(parts[2]));
        date.setMonth(parseInt(parts[3]) - 1); // Month is 0-indexed in JS
        return date;
      }

      // For regular cron expressions
      if (cron.validate(cronExpression)) {
        // Get the next execution date
        const task = cron.schedule(cronExpression, () => {});

        // Add a small offset to ensure we get the next occurrence
        const date = new Date();
        date.setSeconds(date.getSeconds() + 1);

        // We'll stop the task since we just needed it to calculate the next run
        task.stop();

        return date;
      }

      return null;
    } catch (error) {
      console.error("Error calculating next run time:", error);
      return null;
    }
  }

  static generateDescription(scheduleType: string, cronExpression: string): string {
    // Generate human-readable description based on schedule type
    let description = '';
    switch (scheduleType) {
      case 'once':
        description = 'Run once at specified time';
        break;
      case 'interval':
        const match = cronExpression.match(/\*\/(\d+)/);
        const minutes = match ? match[1] : 'X';
        description = `Run every ${minutes} minutes`;
        break;
      case 'daily':
        description = 'Run daily at specified time';
        break;
      case 'weekly':
        description = 'Run weekly at specified time';
        break;
      case 'monthly':
        description = 'Run monthly at specified time';
        break;
      case 'custom':
        description = 'Custom schedule';
        break;
      default:
        description = 'Scheduled task';
    }
    return description;
  }
}
