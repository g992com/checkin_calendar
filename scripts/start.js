#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动打卡日历应用...\n');

// 启动后端
console.log('📦 启动后端服务...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '../backend'),
  stdio: 'inherit',
  shell: true,
});

// 启动前端
console.log('🎨 启动前端服务...');
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '../frontend'),
  stdio: 'inherit',
  shell: true,
});

// 处理退出
process.on('SIGINT', () => {
  console.log('\n\n🛑 正在关闭服务...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});




