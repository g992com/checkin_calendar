# 打卡日历

一款帮助用户培养习惯的Web应用，通过可视化的日历界面展示打卡任务，支持个人任务管理和家庭/组共享打卡。

## 功能特性

- ✅ 个人任务管理（循环任务、一次性任务）
- ✅ 多种周期类型（每日、每周、每月、自定义）
- ✅ 一键打卡功能
- ✅ 连续打卡激励系统
- ✅ 家庭/组共享日历
- ✅ 统计分析和可视化

## 技术栈

### 前端
- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui
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

### 开发模式

```bash
npm run dev
```

前端将运行在 http://localhost:5173
后端将运行在 http://localhost:3001

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
check-in_calendar/
├── frontend/          # 前端项目
├── backend/           # 后端项目
└── scripts/           # 启动脚本
```

## 开发说明

详细的产品方案和实现计划请参考计划文档。

