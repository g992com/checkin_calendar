import { Router } from 'express';
import { randomBytes } from 'crypto';
import prisma from '../db/index.js';

const router = Router();

// 生成邀请码
function generateInviteCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}

// GET /api/groups - 获取组列表
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少userId参数',
      });
    }

    // 获取用户所属的所有组
    const groupMembers = await prisma.groupMember.findMany({
      where: { userId: userId as string },
      include: {
        group: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    const groups = groupMembers.map((gm) => gm.group);

    res.json({
      success: true,
      data: groups,
    });
  } catch (error: any) {
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      message: '获取组列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST /api/groups - 创建组
router.post('/', async (req, res) => {
  try {
    const { name, description, userId } = req.body;

    if (!name || !userId) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：name, userId',
      });
    }

    // 创建组
    const group = await prisma.group.create({
      data: {
        name,
        description: description || null,
        inviteCode: generateInviteCode(),
        members: {
          create: {
            userId,
            role: '创建者',
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: group,
      message: '组创建成功',
    });
  } catch (error: any) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: '创建组失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/groups/:id - 获取组详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: '组不存在',
      });
    }

    res.json({
      success: true,
      data: group,
    });
  } catch (error: any) {
    console.error('Get group error:', error);
    res.status(500).json({
      success: false,
      message: '获取组详情失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST /api/groups/:id/join - 加入组
router.post('/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, inviteCode } = req.body;

    if (!userId || !inviteCode) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：userId, inviteCode',
      });
    }

    // 检查组是否存在
    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: '组不存在',
      });
    }

    // 验证邀请码
    if (group.inviteCode !== inviteCode.toUpperCase()) {
      return res.status(400).json({
        success: false,
        message: '邀请码不正确',
      });
    }

    // 检查是否已经是成员
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId,
      },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: '您已经是该组的成员',
      });
    }

    // 加入组
    const member = await prisma.groupMember.create({
      data: {
        groupId: id,
        userId,
        role: '成员',
      },
      include: {
        group: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: member.group,
      message: '加入组成功',
    });
  } catch (error: any) {
    console.error('Join group error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: '您已经是该组的成员',
      });
    }
    res.status(500).json({
      success: false,
      message: '加入组失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/groups/:id/calendar - 获取组共享日历数据
router.get('/:id/calendar', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // 获取组的所有任务
    const tasks = await prisma.task.findMany({
      where: { groupId: id },
      include: {
        user: true,
      },
    });

    // 获取组的所有打卡记录
    const where: any = {
      taskId: {
        in: tasks.map((t) => t.id),
      },
    };

    if (startDate && endDate) {
      where.checkInDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const checkIns = await prisma.checkIn.findMany({
      where,
      include: {
        task: {
          include: {
            user: true,
          },
        },
        user: true,
      },
      orderBy: {
        checkInDate: 'desc',
      },
    });

    // 获取组成员
    const members = await prisma.groupMember.findMany({
      where: { groupId: id },
      include: {
        user: true,
      },
    });

    // 计算每个成员的打卡进度
    const memberProgress = members.map((member) => {
      const memberTasks = tasks.filter((t) => t.userId === member.userId);
      const memberCheckIns = checkIns.filter((ci) => ci.userId === member.userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 计算今天的打卡进度
      const todayCheckIns = memberCheckIns.filter((ci) => {
        const ciDate = new Date(ci.checkInDate);
        ciDate.setHours(0, 0, 0, 0);
        return ciDate.getTime() === today.getTime();
      });

      return {
        userId: member.userId,
        username: member.user.username,
        avatar: member.user.avatar,
        totalTasks: memberTasks.length,
        todayCheckIns: todayCheckIns.length,
        progress: memberTasks.length > 0 ? `${todayCheckIns.length}/${memberTasks.length}` : '0/0',
      };
    });

    res.json({
      success: true,
      data: {
        tasks,
        checkIns,
        members: memberProgress,
      },
    });
  } catch (error: any) {
    console.error('Get group calendar error:', error);
    res.status(500).json({
      success: false,
      message: '获取组日历数据失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

