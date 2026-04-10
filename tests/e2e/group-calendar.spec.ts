import { test, expect } from '@playwright/test';

test('组日历用户切换功能', async ({ page }) => {
  // 登录系统
  await page.goto('http://localhost:5175/');
  await page.fill('input[placeholder="请输入用户名"]', 'test');
  await page.click('button:has-text("登录")');
  
  // 等待登录完成并跳转到个人日历页面
  await page.waitForURL('http://localhost:5175/calendar');
  
  // 导航到组管理页面
  await page.click('a:has-text("组/家庭")');
  
  // 等待组管理页面加载
  await page.waitForURL('http://localhost:5175/groups');
  
  // 点击查看日历按钮进入组日历
  await page.click('a:has-text("查看日历")');
  
  // 等待组日历页面加载
  await page.waitForURL('http://localhost:5175/groups/*/calendar');
  
  // 测试用户切换功能
  const userSelect = page.locator('select');
  await expect(userSelect).toBeVisible();
  
  // 测试欢迎语显示
  const welcomeText = page.locator('span:has-text("欢迎，")');
  await expect(welcomeText).toBeVisible();
  
  // 测试权限控制（这里需要模拟多用户场景，暂时跳过）
  // 实际测试时，需要创建多个用户并加入同一组
  
  // 测试任务展示（这里需要有任务数据，暂时跳过）
  // 实际测试时，需要创建任务并打卡
});

test('组日历权限控制功能', async ({ page }) => {
  // 登录系统
  await page.goto('http://localhost:5175/');
  await page.fill('input[placeholder="请输入用户名"]', 'test');
  await page.click('button:has-text("登录")');
  
  // 等待登录完成并跳转到个人日历页面
  await page.waitForURL('http://localhost:5175/calendar');
  
  // 导航到组管理页面
  await page.click('a:has-text("组/家庭")');
  
  // 等待组管理页面加载
  await page.waitForURL('http://localhost:5175/groups');
  
  // 点击查看日历按钮进入组日历
  await page.click('a:has-text("查看日历")');
  
  // 等待组日历页面加载
  await page.waitForURL('http://localhost:5175/groups/*/calendar');
  
  // 测试权限控制逻辑
  // 实际测试时，需要切换到其他用户并尝试操作任务
  // 验证会显示权限不足提示
});