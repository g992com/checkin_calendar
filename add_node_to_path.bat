@echo off
chcp 65001 >nul
echo 正在将 Node.js 加入用户 PATH...
powershell -ExecutionPolicy Bypass -File "%~dp0setup_node_path.ps1"
echo.
echo 请【完全退出 Cursor】后重新打开，再试 Playwright MCP。
pause
