import { Router } from 'express';
import prisma from '../db/index.js';

const router = Router();

// GET /api/tasks - 获取任务列表
router.get('/', async (req, res) => {
  try {
    const { userId, groupId } = req.query;

    const where: any = {};
    if (userId) {
      where.userId = userId as string;
    }
    if (groupId) {
      where.groupId = groupId as string;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        checkIns: {
          orderBy: {
            checkInDate: 'desc',
          },
          take: 10, // 只获取最近的10条打卡记录
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: '获取任务列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST /api/tasks - 创建任务
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      groupId,
      name,
      description,
      type,
      cycleType,
      cycleConfig,
      targetTime,
      color,
      startDate,
      endDate,
      status,
    } = req.body;

    // 验证必填字段
    if (!userId || !name || !type || !cycleType || !targetTime) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：userId, name, type, cycleType, targetTime',
      });
    }

    // 验证目标时间格式 (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(targetTime)) {
      return res.status(400).json({
        success: false,
        message: '目标时间格式不正确，应为 HH:mm 格式（如 21:00）',
      });
    }

    const task = await prisma.task.create({
      data: {
        userId,
        groupId: groupId || null,
        name,
        description: description || null,
        type,
        cycleType,
        cycleConfig: cycleConfig ? JSON.stringify(cycleConfig) : '{}',
        targetTime,
        color: color || '#3b82f6',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || '进行中',
      },
    });

    res.json({
      success: true,
      data: task,
      message: '任务创建成功',
    });
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: '创建任务失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// PUT /api/tasks/:id - 更新任务
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      type,
      cycleType,
      cycleConfig,
      targetTime,
      color,
      startDate,
      endDate,
      status,
    } = req.body;

    // 验证目标时间格式（如果提供）
    if (targetTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(targetTime)) {
        return res.status(400).json({
          success: false,
          message: '目标时间格式不正确，应为 HH:mm 格式（如 21:00）',
        });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (cycleType !== undefined) updateData.cycleType = cycleType;
    if (cycleConfig !== undefined)
      updateData.cycleConfig = JSON.stringify(cycleConfig);
    if (targetTime !== undefined) updateData.targetTime = targetTime;
    if (color !== undefined) updateData.color = color;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (status !== undefined) updateData.status = status;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: task,
      message: '任务更新成功',
    });
  } catch (error: any) {
    console.error('Update task error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: '任务不存在',
      });
    }
    res.status(500).json({
      success: false,
      message: '更新任务失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// DELETE /api/tasks/:id - 删除任务
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: '任务删除成功',
    });
  } catch (error: any) {
    console.error('Delete task error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: '任务不存在',
      });
    }
    res.status(500).json({
      success: false,
      message: '删除任务失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;




