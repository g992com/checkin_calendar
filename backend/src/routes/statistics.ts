import { Router } from 'express';
import prisma from '../db/index.js';
import { calculateStreak, calculateLongestStreak } from '../utils/streak.js';

const router = Router();

// GET /api/statistics/user/:userId - 获取用户统计数据
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 获取用户的所有任务
    const tasks = await prisma.task.findMany({
      where: { userId },
    });

    // 获取用户的所有打卡记录
    const checkIns = await prisma.checkIn.findMany({
      where: { userId },
      include: {
        task: true,
      },
    });

    // 按任务统计
    const taskStats = await Promise.all(
      tasks.map(async (task) => {
        const taskCheckIns = checkIns.filter((ci) => ci.taskId === task.id);
        const checkInDates = taskCheckIns.map((ci) => ci.checkInDate);
        const streak = calculateStreak(checkInDates);
        const longestStreak = calculateLongestStreak(checkInDates);

        return {
          taskId: task.id,
          taskName: task.name,
          totalCheckIns: taskCheckIns.length,
          currentStreak: streak,
          longestStreak,
        };
      })
    );

    // 总体统计
    const totalCheckIns = checkIns.length;
    const totalTasks = tasks.length;
    const activeTasks = tasks.filter((t) => t.status === '进行中').length;

    // 打卡时间分布（24小时）
    const timeDistribution = Array(24).fill(0);
    checkIns.forEach((ci) => {
      const hour = new Date(ci.checkInDateTime).getHours();
      timeDistribution[hour]++;
    });

    res.json({
      success: true,
      data: {
        totalCheckIns,
        totalTasks,
        activeTasks,
        taskStats,
        timeDistribution,
      },
    });
  } catch (error: any) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/statistics/task/:taskId - 获取任务统计数据
router.get('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在',
      });
    }

    const checkIns = await prisma.checkIn.findMany({
      where: { taskId },
      orderBy: {
        checkInDate: 'desc',
      },
    });

    const checkInDates = checkIns.map((ci) => ci.checkInDate);
    const streak = calculateStreak(checkInDates);
    const longestStreak = calculateLongestStreak(checkInDates);

    // 打卡时间分布
    const timeDistribution = Array(24).fill(0);
    checkIns.forEach((ci) => {
      const hour = new Date(ci.checkInDateTime).getHours();
      timeDistribution[hour]++;
    });

    res.json({
      success: true,
      data: {
        taskId: task.id,
        taskName: task.name,
        totalCheckIns: checkIns.length,
        currentStreak: streak,
        longestStreak,
        timeDistribution,
        checkIns: checkIns.slice(0, 30), // 最近30条
      },
    });
  } catch (error: any) {
    console.error('Get task statistics error:', error);
    res.status(500).json({
      success: false,
      message: '获取任务统计数据失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/statistics/group/:groupId - 获取组统计数据
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    // 获取组的所有成员
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: true,
      },
    });

    // 获取组的所有任务（包括个人任务）
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { groupId },
          { userId: {
            in: members.map(m => m.userId)
          }}
        ]
      },
    });

    // 获取组的所有打卡记录
    const checkIns = await prisma.checkIn.findMany({
      where: {
        taskId: {
          in: tasks.map((t) => t.id),
        },
      },
      include: {
        task: true,
        user: true,
      },
    });

    // 按成员统计
    const memberStats = await Promise.all(members.map(async (member) => {
      const memberTasks = tasks.filter(t => t.userId === member.userId);
      const memberCheckIns = checkIns.filter((ci) => ci.userId === member.userId);
      
      // 计算打卡率
      const totalTaskDays = memberTasks.length * 30; // 假设每个任务30天
      const checkInRate = totalTaskDays > 0 ? (memberCheckIns.length / totalTaskDays) * 100 : 0;
      
      // 计算每个任务的连续打卡数
      let maxCurrentStreak = 0;
      let maxLongestStreak = 0;
      
      for (const task of memberTasks) {
        const taskCheckIns = memberCheckIns.filter(ci => ci.taskId === task.id);
        const checkInDates = taskCheckIns.map(ci => ci.checkInDate);
        const currentStreak = calculateStreak(checkInDates);
        const longestStreak = calculateLongestStreak(checkInDates);
        
        maxCurrentStreak = Math.max(maxCurrentStreak, currentStreak);
        maxLongestStreak = Math.max(maxLongestStreak, longestStreak);
      }
      
      return {
        userId: member.userId,
        username: member.user.username,
        totalTasks: memberTasks.length,
        totalCheckIns: memberCheckIns.length,
        checkInRate: parseFloat(checkInRate.toFixed(2)),
        maxCurrentStreak,
        maxLongestStreak,
      };
    }));

    // 总体统计
    const totalCheckIns = checkIns.length;
    const totalMembers = members.length;
    const totalTasks = tasks.length;

    res.json({
      success: true,
      data: {
        totalCheckIns,
        totalMembers,
        totalTasks,
        memberStats: memberStats.sort((a, b) => b.totalCheckIns - a.totalCheckIns),
      },
    });
  } catch (error: any) {
    console.error('Get group statistics error:', error);
    res.status(500).json({
      success: false,
      message: '获取组统计数据失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;




