#!/bin/bash

# 服务启动脚本 (Linux)
echo "=== 启动打卡日历服务 ==="

# 检查 Node.js 是否安装
echo "检查 Node.js 环境..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "Node.js 已安装: $NODE_VERSION"
else
    echo "错误: Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm 是否安装
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "npm 已安装: $NPM_VERSION"
else
    echo "错误: npm 未安装，请先安装 npm"
    exit 1
fi

# 后端服务
echo "\n=== 启动后端服务 ==="
cd "$(dirname "$0")/../backend"

# 检查后端依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "后端依赖未安装，正在安装..."
    npm install
    if [ $? -ne 0 ]; then
        echo "错误: 后端依赖安装失败"
        exit 1
    fi
    echo "后端依赖安装成功"
else
    echo "后端依赖已安装"
fi

# 启动后端服务
echo "启动后端服务..."
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!

# 等待后端服务启动
echo "等待后端服务启动..."
sleep 3

# 前端服务
echo "\n=== 启动前端服务 ==="
cd "$(dirname "$0")/../frontend"

# 检查前端依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "前端依赖未安装，正在安装..."
    npm install
    if [ $? -ne 0 ]; then
        echo "错误: 前端依赖安装失败"
        exit 1
    fi
    echo "前端依赖安装成功"
else
    echo "前端依赖已安装"
fi

# 启动前端服务
echo "启动前端服务..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# 等待前端服务启动
echo "等待前端服务启动..."
sleep 3

# 保存进程 ID
echo $BACKEND_PID > "$(dirname "$0")/../backend.pid"
echo $FRONTEND_PID > "$(dirname "$0")/../frontend.pid"

echo "\n=== 服务启动完成 ==="
echo "后端服务运行在: http://localhost:3001"
echo "前端服务运行在: http://localhost:5175"
echo "\n服务进程 ID:"
echo "后端: $BACKEND_PID"
echo "前端: $FRONTEND_PID"
echo "\n使用 ./stop-linux.sh 停止服务"
