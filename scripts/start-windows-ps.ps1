# Service start script (Windows PowerShell)

Write-Host "=== Starting Checkin Calendar Service ==="

# Check if Node.js is installed
Write-Host "Checking Node.js environment..."
try {
    $nodeVersion = node -v
    Write-Host "Node.js installed: $nodeVersion"
} catch {
    Write-Host "Error: Node.js not installed, please install Node.js first"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm -v
    Write-Host "npm installed: $npmVersion"
} catch {
    Write-Host "Error: npm not installed, please install npm first"
    Read-Host "Press Enter to exit"
    exit 1
}

# Backend service
Write-Host "\n=== Starting Backend Service ==="
Set-Location "$PSScriptRoot\..\backend"

# Check if backend dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "Backend dependencies not installed, installing..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Backend dependencies installation failed"
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "Backend dependencies installed successfully"
} else {
    Write-Host "Backend dependencies already installed"
}

# Start backend service
Write-Host "Starting backend service..."
Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow -PassThru

# Wait for backend service to start
Write-Host "Waiting for backend service to start..."
Start-Sleep -Seconds 3

# Frontend service
Write-Host "\n=== Starting Frontend Service ==="
Set-Location "$PSScriptRoot\..\frontend"

# Check if frontend dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "Frontend dependencies not installed, installing..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Frontend dependencies installation failed"
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "Frontend dependencies installed successfully"
} else {
    Write-Host "Frontend dependencies already installed"
}

# Start frontend service
Write-Host "Starting frontend service..."
Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow -PassThru

# Wait for frontend service to start
Write-Host "Waiting for frontend service to start..."
Start-Sleep -Seconds 3

Write-Host "\n=== Service Start Complete ==="
Write-Host "Backend service running at: http://localhost:3001"
Write-Host "Frontend service running at: http://localhost:5175"
Write-Host "\nPress Enter to exit"
Read-Host
