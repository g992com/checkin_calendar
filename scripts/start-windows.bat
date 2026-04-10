@echo off
REM 设置编码为 UTF-8
chcp 65001 >nul

echo === 启动打卡日历服务 ===

echo 检查 Node.js 环境...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo Node.js 已安装: %NODE_VERSION%
)

echo 检查 npm 是否安装...
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: npm 未安装，请先安装 npm
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo npm 已安装: %NPM_VERSION%
)

echo.
echo === 启动后端服务 ===
cd "%~dp0..\backend"

if not exist "node_modules" (
    echo 后端依赖未安装，正在安装...
    npm install
    if %errorlevel% neq 0 (
        echo 错误: 后端依赖安装失败
        pause
        exit /b 1
    )
    echo 后端依赖安装成功
) else (
    echo 后端依赖已安装
)

echo 启动后端服务...
start "后端服务" cmd /c "npm run dev"

echo 等待后端服务启动...
timeout /t 3 >nul

echo.
echo === 启动前端服务 ===
cd "%~dp0..\frontend"

if not exist "node_modules" (
    echo 前端依赖未安装，正在安装...
    npm install
    if %errorlevel% neq 0 (
        echo 错误: 前端依赖安装失败
        pause
        exit /b 1
    )
    echo 前端依赖安装成功
) else (
    echo 前端依赖已安装
)

echo 启动前端服务...
start "前端服务" cmd /c "npm run dev"

echo 等待前端服务启动...
timeout /t 3 >nul

echo.
echo === 服务启动完成 ===
echo 后端服务运行在: http://localhost:3001
echo 前端服务运行在: http://localhost:5175
echo.
echo 按任意键退出
pause >nul
