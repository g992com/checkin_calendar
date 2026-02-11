$nodeRoot = "C:\Users\g992c\nodejs"
$npmBin = "C:\Users\g992c\nodejs\node_modules\npm\bin"
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -notlike "*$nodeRoot*") {
    [Environment]::SetEnvironmentVariable('Path', "$userPath;$nodeRoot;$npmBin", 'User')
    Write-Host "PATH updated: added $nodeRoot and $npmBin"
} else {
    Write-Host "Node paths already in User PATH"
}
