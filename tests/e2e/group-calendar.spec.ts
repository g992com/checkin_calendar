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

test('创建者不应出现在可选组员列表中', async ({ page }) => {
  const testUsername = `testuser_${Date.now()}`;
  
  // 登录系统（使用新用户确保是创建者）
  await page.goto('http://localhost:5175/');
  await page.fill('input[placeholder="请输入用户名"]', testUsername);
  await page.click('button:has-text("登录")');
  
  // 等待登录完成
  await page.waitForURL('http://localhost:5175/calendar');
  
  // 导航到组管理页面
  await page.click('a:has-text("组/家庭")');
  await page.waitForURL('http://localhost:5175/groups');
  
  // 创建新组
  await page.click('button:has-text("创建组")');
  await page.fill('input[placeholder="例如：我的家庭"]', '测试家庭');
  
  // 添加至少一个虚拟组员
  await page.click('button:has-text("添加组员")');
  const memberInputs = await page.locator('input[placeholder="请输入组员姓名"]').all();
  await memberInputs[memberInputs.length - 1].fill('孩子');
  
  // 提交创建
  await page.click('button[type="submit"]:has-text("创建")');
  
  // 等待组创建完成并点击查看日历
  await page.waitForSelector('a:has-text("查看日历")');
  await page.click('a:has-text("查看日历")');
  
  // 等待组日历页面加载
  await page.waitForURL('http://localhost:5175/groups/*/calendar');
  
  // 点击设置任务按钮
  await page.click('button:has-text("设置任务")');
  
  // 等待跳转到任务页面并自动选择了组
  await page.waitForURL('**/tasks**');
  
  // 检查组员下拉列表
  const memberSelect = page.locator('select[label="选择组员"]');
  await memberSelect.click();
  
  // 获取所有选项的文本
  const options = memberSelect.locator('option');
  const optionCount = await options.count();
  
  // 验证创建者（当前登录用户）的名字不在可选组员列表中
  let foundCreator = false;
  for (let i = 0; i < optionCount; i++) {
    const optionText = await options.nth(i).textContent();
    if (optionText?.includes(testUsername)) {
      foundCreator = true;
      break;
    }
  }
  
  // 创建者不应该出现在可选组员列表中
  expect(foundCreator).toBe(false);
  
  // 验证虚拟组员应该在列表中
  let foundVirtualMember = false;
  for (let i = 0; i < optionCount; i++) {
    const optionText = await options.nth(i).textContent();
    if (optionText?.includes('孩子')) {
      foundVirtualMember = true;
      break;
    }
  }
  
  // 虚拟组员应该在列表中
  expect(foundVirtualMember).toBe(true);
});