# 服务启动脚本 (Windows)

Write-Host "=== 启动打卡日历服务 ==="

# 检查 Node.js 是否安装
Write-Host "检查 Node.js 环境..."
try {
    $nodeVersion = node -v
    Write-Host "Node.js 已安装: $nodeVersion"
} catch {
    Write-Host "错误: Node.js 未安装，请先安装 Node.js"
    exit 1
}

# 检查 npm 是否安装
try {
    $npmVersion = npm -v
    Write-Host "npm 已安装: $npmVersion"
} catch {
    Write-Host "错误: npm 未安装，请先安装 npm"
    exit 1
}

# 后端服务
Write-Host "\n=== 启动后端服务 ==="
Set-Location "$PSScriptRoot\..\backend"

# 检查后端依赖是否已安装
if (!(Test-Path "node_modules")) {
    Write-Host "后端依赖未安装，正在安装..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误: 后端依赖安装失败"
        exit 1
    }
    Write-Host "后端依赖安装成功"
} else {
    Write-Host "后端依赖已安装"
}

# 启动后端服务
Write-Host "启动后端服务..."
Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow -PassThru

# 等待后端服务启动
Write-Host "等待后端服务启动..."
Start-Sleep -Seconds 3

# 前端服务
Write-Host "\n=== 启动前端服务 ==="
Set-Location "$PSScriptRoot\..\frontend"

# 检查前端依赖是否已安装
if (!(Test-Path "node_modules")) {
    Write-Host "前端依赖未安装，正在安装..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误: 前端依赖安装失败"
        exit 1
    }
    Write-Host "前端依赖安装成功"
} else {
    Write-Host "前端依赖已安装"
}

# 启动前端服务
Write-Host "启动前端服务..."
Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow -PassThru

# 等待前端服务启动
Write-Host "等待前端服务启动..."
Start-Sleep -Seconds 3

Write-Host "\n=== 服务启动完成 ==="
Write-Host "后端服务运行在: http://localhost:3001"
Write-Host "前端服务运行在: http://localhost:5175"
Write-Host "\n按 Ctrl+C 停止脚本"

# 保持脚本运行
while ($true) {
    Start-Sleep -Seconds 1
}
