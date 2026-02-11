/**
 * 计算任务周期相关的日期
 */

export interface CycleConfig {
  daysOfWeek?: number[]; // 0-6, 0 = Sunday
  daysOfMonth?: number[]; // 1-31
  interval?: number; // 每N天
  intervalUnit?: 'day' | 'week'; // 间隔单位
}

/**
 * 根据周期类型和配置，计算指定日期范围内需要打卡的日期
 */
export function calculateTaskDates(
  cycleType: string,
  cycleConfig: CycleConfig | string,
  startDate: Date,
  endDate?: Date
): Date[] {
  const config: CycleConfig =
    typeof cycleConfig === 'string' ? JSON.parse(cycleConfig) : cycleConfig;
  const dates: Date[] = [];
  const current = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  // 确保不超出结束日期
  if (endDate && current > end) {
    return dates;
  }

  switch (cycleType) {
    case '每日':
      // 每天都需要打卡
      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      break;

    case '每周':
      // 根据配置的星期几
      if (config.daysOfWeek && config.daysOfWeek.length > 0) {
        while (current <= end) {
          const dayOfWeek = current.getDay();
          if (config.daysOfWeek.includes(dayOfWeek)) {
            dates.push(new Date(current));
          }
          current.setDate(current.getDate() + 1);
        }
      }
      break;

    case '每月':
      // 根据配置的日期
      if (config.daysOfMonth && config.daysOfMonth.length > 0) {
        while (current <= end) {
          const dayOfMonth = current.getDate();
          if (config.daysOfMonth.includes(dayOfMonth)) {
            dates.push(new Date(current));
          }
          current.setDate(current.getDate() + 1);
        }
      }
      break;

    case '自定义':
      // 根据间隔配置
      if (config.interval && config.interval > 0) {
        const unit = config.intervalUnit || 'day';
        while (current <= end) {
          dates.push(new Date(current));
          if (unit === 'day') {
            current.setDate(current.getDate() + config.interval);
          } else if (unit === 'week') {
            current.setDate(current.getDate() + config.interval * 7);
          }
        }
      }
      break;
  }

  return dates;
}

/**
 * 检查指定日期是否需要打卡
 */
export function shouldCheckInOnDate(
  cycleType: string,
  cycleConfig: CycleConfig | string,
  date: Date,
  taskStartDate?: Date,
  taskEndDate?: Date
): boolean {
  // 检查是否在任务时间范围内
  if (taskStartDate && date < taskStartDate) {
    return false;
  }
  if (taskEndDate && date > taskEndDate) {
    return false;
  }

  const config: CycleConfig =
    typeof cycleConfig === 'string' ? JSON.parse(cycleConfig) : cycleConfig;

  switch (cycleType) {
    case '每日':
      return true;

    case '每周':
      if (config.daysOfWeek && config.daysOfWeek.length > 0) {
        return config.daysOfWeek.includes(date.getDay());
      }
      return false;

    case '每月':
      if (config.daysOfMonth && config.daysOfMonth.length > 0) {
        return config.daysOfMonth.includes(date.getDate());
      }
      return false;

    case '自定义':
      if (config.interval && taskStartDate) {
        const diffTime = date.getTime() - taskStartDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (config.intervalUnit === 'week') {
          const diffWeeks = Math.floor(diffDays / 7);
          return diffWeeks % config.interval === 0;
        } else {
          return diffDays % config.interval === 0;
        }
      }
      return false;

    default:
      return false;
  }
}




