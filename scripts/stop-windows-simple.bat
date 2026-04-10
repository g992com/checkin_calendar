@echo off
REM 简单版服务关闭脚本

echo 停止后端服务 (端口 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /F /PID %%a >nul 2>&1
    echo 停止进程 ID: %%a
)
echo 后端服务已停止

echo.
echo 停止前端服务 (端口 5175)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5175') do (
    taskkill /F /PID %%a >nul 2>&1
    echo 停止进程 ID: %%a
)
echo 前端服务已停止

echo.
echo 服务关闭完成
pause
