import { Router } from 'express';
import prisma from '../db/index.js';

const router = Router();

// POST /api/users - 创建用户（登录）
router.post('/', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '用户名不能为空',
      });
    }

    // 检查用户是否已存在
    let user = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    // 如果用户不存在，创建新用户
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: username.trim(),
        },
      });
    }

    res.json({
      success: true,
      data: user,
      message: '登录成功',
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: '创建用户失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/users/:username - 获取用户信息
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        tasks: true,
        checkIns: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;




