/**
 * 连续打卡计算相关工具函数
 */

/**
 * 计算任务的连续打卡天数
 * @param checkInDates 已打卡的日期数组（按日期排序，从早到晚）
 * @returns 连续打卡天数
 */
export function calculateStreak(checkInDates: Date[]): number {
  if (checkInDates.length === 0) return 0;

  // 按日期排序（从新到旧）
  const sortedDates = [...checkInDates]
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  let expectedDate = new Date();
  expectedDate.setHours(0, 0, 0, 0);

  // 检查今天或昨天是否有打卡
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // 如果最新打卡不是今天或昨天，连续打卡已中断
  const latestCheckIn = sortedDates[0];
  const latestDate = new Date(latestCheckIn);
  latestDate.setHours(0, 0, 0, 0);

  if (latestDate.getTime() !== today.getTime() && latestDate.getTime() !== yesterday.getTime()) {
    return 0;
  }

  // 从最新日期开始向前检查连续天数
  let checkIndex = 0;
  expectedDate = new Date(latestDate);

  while (checkIndex < sortedDates.length) {
    const checkInDate = new Date(sortedDates[checkIndex]);
    checkInDate.setHours(0, 0, 0, 0);

    if (checkInDate.getTime() === expectedDate.getTime()) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
      checkIndex++;
    } else if (checkInDate.getTime() < expectedDate.getTime()) {
      // 跳过比期望日期更早的打卡记录
      checkIndex++;
    } else {
      // 如果找到的日期比期望日期晚，说明连续中断了
      break;
    }
  }

  return streak;
}

/**
 * 计算任务的最长连续打卡天数
 * @param checkInDates 已打卡的日期数组
 * @returns 最长连续打卡天数
 */
export function calculateLongestStreak(checkInDates: Date[]): number {
  if (checkInDates.length === 0) return 0;

  // 按日期排序（从早到晚）
  const sortedDates = [...checkInDates]
    .map((d) => new Date(d))
    .map((d) => {
      d.setHours(0, 0, 0, 0);
      return d;
    })
    .sort((a, b) => a.getTime() - b.getTime());

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);

    const diffDays = Math.floor(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      // 连续
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      // 中断
      currentStreak = 1;
    }
  }

  return longestStreak;
}

/**
 * 检查是否应该触发连续打卡激励
 * @param streak 当前连续打卡天数
 * @returns 是否应该触发激励
 */
export function shouldTriggerCelebration(streak: number): boolean {
  return streak > 2;
}

/**
 * 检查是否是里程碑天数
 * @param streak 当前连续打卡天数
 * @returns 是否是里程碑
 */
export function isMilestone(streak: number): boolean {
  const milestones = [3, 7, 14, 30, 60, 100];
  return milestones.includes(streak);
}




