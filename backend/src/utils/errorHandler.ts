import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  // Prisma 错误处理
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: '数据已存在',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: '记录不存在',
    });
  }

  // 默认错误处理
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器错误',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}




