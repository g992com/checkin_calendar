"""将 Node.js 目录加入当前用户 PATH"""
import winreg
import sys

node_root = r"C:\Users\g992c\nodejs"
npm_bin = r"C:\Users\g992c\nodejs\node_modules\npm\bin"
add = f"{node_root};{npm_bin}"

key = winreg.OpenKey(
    winreg.HKEY_CURRENT_USER,
    r"Environment",
    0,
    winreg.KEY_READ | winreg.KEY_WRITE,
)
try:
    path, _ = winreg.QueryValueEx(key, "Path")
except OSError:
    path = ""

if node_root not in path:
    new_path = f"{path};{add}" if path else add
    winreg.SetValueEx(key, "Path", 0, winreg.REG_EXPAND_SZ, new_path)
    winreg.CloseKey(key)
    print("已添加 Node 到用户 PATH")
    sys.exit(0)
else:
    winreg.CloseKey(key)
    print("Node 已在用户 PATH 中")
    sys.exit(0)
