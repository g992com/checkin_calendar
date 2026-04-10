@echo off
REM 设置编码为 UTF-8
chcp 65001 >nul

REM 启用延迟变量扩展
setlocal EnableDelayedExpansion

echo === 关闭打卡日历服务 ===

echo.
echo 停止后端服务 (端口 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    set "ProcID=%%a"
    if not "!ProcID!"=="" (
        echo 停止进程 ID: !ProcID!
        taskkill /F /PID !ProcID! >nul 2>&1
    )
)
echo 后端服务已停止

echo.
echo 停止前端服务 (端口 5175)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5175') do (
    set "ProcID=%%a"
    if not "!ProcID!"=="" (
        echo 停止进程 ID: !ProcID!
        taskkill /F /PID !ProcID! >nul 2>&1
    )
)
echo 前端服务已停止

echo.
echo === 服务关闭完成 ===
echo 按任意键退出
pause >nul
endlocal
