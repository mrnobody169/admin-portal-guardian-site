
import cron from "node-cron";
import { parse, parseExpression } from "cron-parser";

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
        try {
          // Use cron-parser to calculate next run time
          const interval = parseExpression(cronExpression);
          return interval.next().toDate();
        } catch (parseError) {
          console.error("Error parsing cron expression:", parseError);
          
          // Fallback to simple estimation
          // Add a small offset to ensure we get the next occurrence
          const date = new Date();
          date.setSeconds(date.getSeconds() + 60);
          return date;
        }
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
        const timeMatch = cronExpression.match(/(\d+) (\d+) \* \* \*/);
        if (timeMatch) {
          const hour = parseInt(timeMatch[2]);
          const minute = parseInt(timeMatch[1]);
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          description = `Run daily at ${timeStr}`;
        } else {
          description = 'Run daily at specified time';
        }
        break;
      case 'weekly':
        const dayOfWeek = cronExpression.split(' ')[4];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[parseInt(dayOfWeek)] || 'specified day';
        description = `Run weekly on ${dayName}`;
        break;
      case 'monthly':
        const dayOfMonth = cronExpression.split(' ')[2];
        description = `Run monthly on day ${dayOfMonth}`;
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
