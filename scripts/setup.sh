#!/bin/bash

echo "📦 安装依赖..."

# 安装根目录依赖
echo "安装根目录依赖..."
npm install

# 安装前端依赖
echo "安装前端依赖..."
cd frontend
npm install
cd ..

# 安装后端依赖
echo "安装后端依赖..."
cd backend
npm install

# 生成 Prisma 客户端
echo "生成 Prisma 客户端..."
npm run prisma:generate

# 运行数据库迁移
echo "运行数据库迁移..."
npm run prisma:migrate

cd ..

echo "✅ 安装完成！"
echo ""
echo "运行 'npm run dev' 启动开发服务器"




