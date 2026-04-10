@echo off
REM 简单版服务启动脚本

echo 检查 Node.js 环境...
node -v >nul 2>&1
if errorlevel 1 (
    echo 错误: Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
)

node -v
npm -v

echo.
echo 启动后端服务...
start "后端服务" cmd /c "cd backend && npm run dev"

echo 等待后端服务启动...
timeout /t 3 >nul

echo.
echo 启动前端服务...
start "前端服务" cmd /c "cd frontend && npm run dev"

echo 等待前端服务启动...
timeout /t 3 >nul

echo.
echo 服务启动完成
 echo 后端服务运行在: http://localhost:3001
echo 前端服务运行在: http://localhost:5175
echo.
pause
