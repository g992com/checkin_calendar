import { Router } from 'express';
import prisma from '../db/index.js';
import { calculateStreak, calculateLongestStreak } from '../utils/streak.js';

const router = Router();

// GET /api/checkins - 获取打卡记录
router.get('/', async (req, res) => {
  try {
    const { taskId, userId, dateRange } = req.query;

    const where: any = {};
    if (taskId) {
      where.taskId = taskId as string;
    }
    if (userId) {
      where.userId = userId as string;
    }
    if (dateRange) {
      const range = JSON.parse(dateRange as string);
      where.checkInDate = {
        gte: new Date(range.start),
        lte: new Date(range.end),
      };
    }

    const checkIns = await prisma.checkIn.findMany({
      where,
      include: {
        task: true,
      },
      orderBy: {
        checkInDate: 'desc',
      },
    });

    res.json({
      success: true,
      data: checkIns,
    });
  } catch (error: any) {
    console.error('Get checkins error:', error);
    res.status(500).json({
      success: false,
      message: '获取打卡记录失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST /api/checkins - 打卡
router.post('/', async (req, res) => {
  try {
    const { taskId, userId, checkInDate } = req.body;

    if (!taskId || !userId || !checkInDate) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：taskId, userId, checkInDate',
      });
    }

    // 检查任务是否存在
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在',
      });
    }

    // 检查是否已经打卡
    const date = new Date(checkInDate);
    date.setHours(0, 0, 0, 0);

    const existingCheckIn = await prisma.checkIn.findFirst({
      where: {
        taskId,
        userId,
        checkInDate: date,
      },
    });

    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: '该日期已打卡',
      });
    }

    // 创建打卡记录
    const checkIn = await prisma.checkIn.create({
      data: {
        taskId,
        userId,
        checkInDate: date,
        checkInDateTime: new Date(),
      },
      include: {
        task: true,
      },
    });

    // 计算连续打卡天数
    const allCheckIns = await prisma.checkIn.findMany({
      where: {
        taskId,
        userId,
      },
      orderBy: {
        checkInDate: 'desc',
      },
    });

    const checkInDates = allCheckIns.map((ci) => ci.checkInDate);
    const streak = calculateStreak(checkInDates);
    const longestStreak = calculateLongestStreak(checkInDates);

    res.json({
      success: true,
      data: {
        checkIn,
        streak,
        longestStreak,
      },
      message: '打卡成功',
    });
  } catch (error: any) {
    console.error('Create checkin error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: '该日期已打卡',
      });
    }
    res.status(500).json({
      success: false,
      message: '打卡失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// DELETE /api/checkins/:id - 取消打卡
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const checkIn = await prisma.checkIn.findUnique({
      where: { id },
    });

    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: '打卡记录不存在',
      });
    }

    await prisma.checkIn.delete({
      where: { id },
    });

    // 重新计算连续打卡天数
    const allCheckIns = await prisma.checkIn.findMany({
      where: {
        taskId: checkIn.taskId,
        userId: checkIn.userId,
      },
      orderBy: {
        checkInDate: 'desc',
      },
    });

    const checkInDates = allCheckIns.map((ci) => ci.checkInDate);
    const streak = calculateStreak(checkInDates);
    const longestStreak = calculateLongestStreak(checkInDates);

    res.json({
      success: true,
      data: {
        streak,
        longestStreak,
      },
      message: '取消打卡成功',
    });
  } catch (error: any) {
    console.error('Delete checkin error:', error);
    res.status(500).json({
      success: false,
      message: '取消打卡失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

