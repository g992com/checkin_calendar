#!/bin/bash

# 服务关闭脚本 (Linux)
echo "=== 关闭打卡日历服务 ==="

# 停止后端服务
echo "\n停止后端服务..."
if [ -f "$(dirname "$0")/../backend.pid" ]; then
    BACKEND_PID=$(cat "$(dirname "$0")/../backend.pid")
    if ps -p $BACKEND_PID > /dev/null; then
        echo "停止后端服务进程 ID: $BACKEND_PID"
        kill $BACKEND_PID
        if [ $? -eq 0 ]; then
            echo "后端服务已停止"
            rm "$(dirname "$0")/../backend.pid"
        else
            echo "错误: 停止后端服务失败"
        fi
    else
        echo "后端服务未运行"
        rm "$(dirname "$0")/../backend.pid"
    fi
else
    echo "后端服务未运行"
fi

# 停止前端服务
echo "\n停止前端服务..."
if [ -f "$(dirname "$0")/../frontend.pid" ]; then
    FRONTEND_PID=$(cat "$(dirname "$0")/../frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null; then
        echo "停止前端服务进程 ID: $FRONTEND_PID"
        kill $FRONTEND_PID
        if [ $? -eq 0 ]; then
            echo "前端服务已停止"
            rm "$(dirname "$0")/../frontend.pid"
        else
            echo "错误: 停止前端服务失败"
        fi
    else
        echo "前端服务未运行"
        rm "$(dirname "$0")/../frontend.pid"
    fi
else
    echo "前端服务未运行"
fi

# 清理日志文件
echo "\n清理日志文件..."
if [ -f "$(dirname "$0")/../backend.log" ]; then
    rm "$(dirname "$0")/../backend.log"
    echo "后端日志文件已清理"
fi

if [ -f "$(dirname "$0")/../frontend.log" ]; then
    rm "$(dirname "$0")/../frontend.log"
    echo "前端日志文件已清理"
fi

echo "\n=== 服务关闭完成 ==="
