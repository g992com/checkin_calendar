/**
 * 前端周期计算工具函数
 */

export interface CycleConfig {
  daysOfWeek?: number[]; // 0-6, 0 = Sunday
  daysOfMonth?: number[]; // 1-31
  interval?: number; // 每N天
  intervalUnit?: 'day' | 'week'; // 间隔单位
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

/**
 * 检查是否是里程碑天数
 */
export function isMilestone(streak: number): boolean {
  const milestones = [3, 7, 14, 30, 60, 100];
  return milestones.includes(streak);
}




