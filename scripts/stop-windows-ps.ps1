# Service stop script (Windows PowerShell)

Write-Host "=== Stopping Checkin Calendar Service ==="

# Stop process using port 3001 (backend service)
Write-Host "\nStopping backend service (port 3001)..."
try {
    $processes = netstat -ano | Select-String ":3001"
    if ($processes) {
        $processIds = $processes | ForEach-Object { $_.ToString().Split(' ')[-1].Trim() }
        $uniqueProcessIds = $processIds | Select-Object -Unique
        
        foreach ($processId in $uniqueProcessIds) {
            if ($processId -match '\d+') {
                Write-Host "Stopping process ID: $processId"
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Host "Backend service stopped"
    } else {
        Write-Host "Backend service not running"
    }
} catch {
    Write-Host "Error: Failed to stop backend service: $_"
}

# Stop process using port 5175 (frontend service)
Write-Host "\nStopping frontend service (port 5175)..."
try {
    $processes = netstat -ano | Select-String ":5175"
    if ($processes) {
        $processIds = $processes | ForEach-Object { $_.ToString().Split(' ')[-1].Trim() }
        $uniqueProcessIds = $processIds | Select-Object -Unique
        
        foreach ($processId in $uniqueProcessIds) {
            if ($processId -match '\d+') {
                Write-Host "Stopping process ID: $processId"
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Host "Frontend service stopped"
    } else {
        Write-Host "Frontend service not running"
    }
} catch {
    Write-Host "Error: Failed to stop frontend service: $_"
}

Write-Host "\n=== Service Stop Complete ==="
Write-Host "Press Enter to exit"
Read-Host
