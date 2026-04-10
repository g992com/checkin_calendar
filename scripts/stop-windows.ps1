# 服务关闭脚本 (Windows)

Write-Host "=== 关闭打卡日历服务 ==="

# 停止占用端口 3001 的进程 (后端服务)
Write-Host "\n停止后端服务 (端口 3001)..."
try {
    $processes = netstat -ano | Select-String ":3001"
    if ($processes) {
        $processIds = $processes | ForEach-Object { $_.ToString().Split(' ')[-1].Trim() }
        $uniqueProcessIds = $processIds | Select-Object -Unique
        
        foreach ($processId in $uniqueProcessIds) {
            if ($processId -match '\d+') {
                Write-Host "停止进程 ID: $processId"
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Host "后端服务已停止"
    } else {
        Write-Host "后端服务未运行"
    }
} catch {
    Write-Host "错误: 停止后端服务失败: $_"
}

# 停止占用端口 5175 的进程 (前端服务)
Write-Host "\n停止前端服务 (端口 5175)..."
try {
    $processes = netstat -ano | Select-String ":5175"
    if ($processes) {
        $processIds = $processes | ForEach-Object { $_.ToString().Split(' ')[-1].Trim() }
        $uniqueProcessIds = $processIds | Select-Object -Unique
        
        foreach ($processId in $uniqueProcessIds) {
            if ($processId -match '\d+') {
                Write-Host "停止进程 ID: $processId"
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Host "前端服务已停止"
    } else {
        Write-Host "前端服务未运行"
    }
} catch {
    Write-Host "错误: 停止前端服务失败: $_"
}

Write-Host "\n=== 服务关闭完成 ==="
