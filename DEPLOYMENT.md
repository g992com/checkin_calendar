# 部署指南

本文档提供了打卡日历应用的部署指南。

## 环境配置

### 前端环境变量

创建 `frontend/.env.production`：

```env
VITE_API_BASE_URL=https://your-domain.com/api
```

### 后端环境变量

创建 `backend/.env`：

```env
DATABASE_URL="file:./production.db"
PORT=3001
NODE_ENV=production
```

## 服务启动

### 构建项目

```bash
npm run build
```

构建后的文件：
- 前端：`frontend/dist`
- 后端：`backend/dist`

### 启动后端服务

```bash
cd backend
npm start
```

### 启动前端服务

前端需要配置静态文件服务器，推荐使用 Nginx（见下文）。

或者使用 Vite 的预览服务器：

```bash
cd frontend
npm run preview
```

### 使用进程管理工具（推荐）

使用 PM2 管理后端进程，确保服务稳定运行：

```bash
# 安装 PM2
npm install -g pm2

# 启动后端服务
cd backend
pm2 start npm --name "checkin-calendar-backend" -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs checkin-calendar-backend

# 设置开机自启
pm2 startup
pm2 save
```

## Nginx 配置

### 基础配置

创建 Nginx 配置文件 `/etc/nginx/sites-available/checkin-calendar`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/checkin_calendar/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 配置步骤

#### 1. 安装 Nginx

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nginx
```

**CentOS/RHEL:**
```bash
sudo yum install nginx
```

#### 2. 复制配置文件

```bash
sudo cp /path/to/your-nginx-config.conf /etc/nginx/sites-available/checkin-calendar
sudo ln -s /etc/nginx/sites-available/checkin-calendar /etc/nginx/sites-enabled/
```

#### 3. 测试配置并重启 Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. 配置防火墙（如果需要）

```bash
sudo ufw allow 'Nginx Full'
```
