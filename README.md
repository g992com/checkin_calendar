# 打卡日历

一款帮助用户培养习惯的Web应用，通过可视化的日历界面展示打卡任务，专注于家庭/组共享打卡功能。

## 功能特性

- ✅ **组管理功能**
  - 创建组（必须设置至少一个组员）
  - 管理组员（添加、删除虚拟组员）
  - 组内成员任务查看

- ✅ **任务管理**
  - 为组员创建打卡任务
  - 多种周期类型（每日、每周、每月、自定义）
  - 任务状态管理

- ✅ **组日历功能**
  - 可视化日历界面
  - 切换组员查看不同成员的任务
  - 一键打卡功能
  - 连续打卡激励系统
  - 组内成员任务设置快捷入口

- ✅ **统计分析**
  - 打卡数据统计
  - 可视化图表展示

## 技术栈

### 前端
- Vite + React 18 + TypeScript
- Tailwind CSS
- React Router
- Axios

### 后端
- Node.js + Express + TypeScript
- Prisma + SQLite

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

#### Windows
```powershell
# 安装所有依赖（根目录、前端、后端）
npm run install:all

# 或者分别安装
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

#### Linux/Mac
```bash
# 安装所有依赖（根目录、前端、后端）
npm run install:all

# 或者分别安装
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 初始化数据库

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
cd ..
```

### 启动服务

#### Windows

在命令提示符 (cmd.exe) 中执行：
```cmd
# 使用脚本启动（推荐）
.\scripts\start-windows.bat

# 或者使用简单版脚本
.\scripts\start-windows-simple.bat

# 或者手动启动
npm run dev
```

在 PowerShell 中执行：
```powershell
# 使用脚本启动（推荐）
.\scripts\start-windows-ps.ps1

# 或者使用简单版脚本
.\scripts\start-windows-simple.bat

# 或者手动启动
npm run dev
```

#### Linux/Mac
```bash
# 使用脚本启动（推荐）
chmod +x scripts/start-linux.sh scripts/stop-linux.sh
./scripts/start-linux.sh

# 或者手动启动
npm run dev
```

### 关闭服务

#### Windows

在命令提示符 (cmd.exe) 中执行：
```cmd
# 使用脚本停止（推荐）
.\scripts\stop-windows.bat

# 或者使用简单版脚本
.\scripts\stop-windows-simple.bat
```

在 PowerShell 中执行：
```powershell
# 使用脚本停止（推荐）
.\scripts\stop-windows-ps.ps1

# 或者使用简单版脚本
.\scripts\stop-windows-simple.bat
```

#### Linux/Mac
```bash
./scripts/stop-linux.sh
```

### 访问应用

- 前端：http://localhost:5175
- 后端 API：http://localhost:3001

### 构建

```bash
npm run build
```

构建后的文件：
- 前端：`frontend/dist`
- 后端：`backend/dist`

### 生产环境运行

```bash
# 构建
npm run build

# 启动后端
cd backend && npm start

# 启动前端（需要配置静态文件服务器）
cd frontend && npm run preview
```

## 项目结构

```
checkin_calendar/
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   ├── api/           # API 客户端
│   │   └── context/       # React Context
│   └── package.json
├── backend/               # 后端项目
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   └── server.ts      # 服务器入口
│   ├── prisma/            # 数据库模型
│   └── package.json
├── scripts/               # 启动脚本
│   ├── start-windows.bat  # Windows 启动脚本 (cmd.exe)
│   ├── stop-windows.bat   # Windows 关闭脚本 (cmd.exe)
│   ├── start-windows-ps.ps1  # Windows 启动脚本 (PowerShell)
│   ├── stop-windows-ps.ps1   # Windows 关闭脚本 (PowerShell)
│   ├── start-windows-simple.bat  # Windows 启动脚本 (简单版)
│   ├── stop-windows-simple.bat   # Windows 关闭脚本 (简单版)
│   ├── start-linux.sh     # Linux 启动脚本
│   └── stop-linux.sh      # Linux 关闭脚本
└── package.json
```

## 核心功能说明

### 1. 组管理
- 用户登录后直接进入组管理页面
- 创建组时必须设置至少一个组员
- 组员信息保存在本地存储中

### 2. 组日历
- 选择组员查看其打卡任务
- 为当前选中的组员设置打卡任务
- 一键打卡功能

### 3. 任务管理
- 支持循环任务和一次性任务
- 多种周期类型：每日、每周、每月、自定义
- 可为特定组员创建任务

### 4. 统计分析
- 查看组内成员的打卡统计
- 可视化展示打卡数据

## 开发说明

### 环境变量

前端 `.env`：
```
VITE_API_BASE_URL=http://localhost:3001
```

后端 `.env`：
```
DATABASE_URL="file:./dev.db"
PORT=3001
```

### 数据库模型

主要数据模型：
- **User**: 用户
- **Group**: 组
- **GroupMember**: 组成员关系
- **Task**: 打卡任务
- **CheckIn**: 打卡记录

虚拟组员信息存储在浏览器的 localStorage 中。

### API 接口

主要 API 接口：
- `POST /api/users` - 创建用户
- `GET /api/groups` - 获取组列表
- `POST /api/groups` - 创建组
- `GET /api/groups/:id` - 获取组详情
- `GET /api/groups/:id/calendar` - 获取组日历数据
- `GET /api/groups/:id/statistics` - 获取组统计数据
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务
- `POST /api/checkins` - 创建打卡记录

## 部署

详细的部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)，包括：

- 生产环境部署
- Nginx 配置方案
- Docker 部署
- 数据库配置
- 监控和日志
- 安全配置
- 备份和恢复
- 故障排查
- 性能优化

快速部署命令：

```bash
# 构建项目
npm run build

# 启动后端
cd backend && npm start

# 配置 Nginx（推荐）
# 详见 DEPLOYMENT.md
```

## 更新日志

### 最新版本
- 移除个人打卡功能，专注于组打卡
- 创建组时必须设置至少一个组员
- 在组日历中可直接为组员设置任务
- 添加 Windows 和 Linux 启动脚本

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

MIT License
