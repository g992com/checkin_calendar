import { test, expect } from '@playwright/test';

/**
 * 测试用例：组日历中创建者不应出现在可选组员列表中
 * 
 * 问题描述：
 * 在组日历页面中，组员下拉选择包含了组创建者账号。
 * 根据业务规则，组日历中的"可选组员"应仅包含创建组时添加的组员，不应包含创建者本人。
 * 
 * 测试步骤：
 * 1. 使用账号 tina 登录
 * 2. 创建小组 Family
 * 3. 在创建小组时添加成员 Alina
 * 4. 进入 Family 小组的组日历页面
 * 5. 查看"可选组员"列表
 * 
 * 预期结果：
 * "可选组员"列表仅显示：Alina
 * 
 * 实际结果（修复前）：
 * "可选组员"列表显示：Alina 和 tina（创建者）
 */

test('组日历中创建者不应出现在可选组员列表中', async ({ page }) => {
  // 步骤1：使用 tina 登录
  await page.goto('http://localhost:5175/');
  await page.fill('input[placeholder="请输入用户名"]', 'tina');
  await page.click('button:has-text("登录")');
  
  // 等待登录完成并跳转到个人日历页面
  await page.waitForURL('http://localhost:5175/calendar');
  
  // 步骤2：导航到组管理页面
  await page.click('a:has-text("组/家庭")');
  await page.waitForURL('http://localhost:5175/groups');
  
  // 步骤3：创建小组 Family，并添加成员 Alina
  // 点击创建组按钮
  await page.click('button:has-text("创建组")');
  
  // 填写组名
  await page.fill('input[placeholder="请输入组名称"]', 'Family');
  
  // 添加成员 Alina
  await page.fill('input[placeholder="输入虚拟成员名称"]', 'Alina');
  await page.click('button:has-text("添加")');
  
  // 提交创建
  await page.click('button:has-text("创建")');
  
  // 等待组创建成功并出现在列表中
  await expect(page.locator('text=Family')).toBeVisible();
  
  // 步骤4：进入 Family 小组的组日历页面
  await page.click('a:has-text("查看日历")');
  await page.waitForURL(/\/groups\/.*\/calendar/);
  
  // 步骤5：验证"可选组员"列表
  const userSelect = page.locator('select');
  await expect(userSelect).toBeVisible();
  
  // 获取下拉列表中的所有选项文本
  const options = await userSelect.locator('option').allTextContents();
  
  // 验证选项中包含 Alina
  expect(options.some(opt => opt.includes('Alina'))).toBeTruthy();
  
  // 验证选项中不包含创建者 tina
  expect(options.some(opt => opt.includes('tina'))).toBeFalsy();
  
  // 验证选项数量（应该只有 Alina 一个选项）
  expect(options.length).toBe(1);
});

test('组日历可选组员列表应排除创建者（多成员场景）', async ({ page }) => {
  // 使用另一个创建者账号测试
  await page.goto('http://localhost:5175/');
  await page.fill('input[placeholder="请输入用户名"]', 'testcreator');
  await page.click('button:has-text("登录")');
  
  await page.waitForURL('http://localhost:5175/calendar');
  await page.click('a:has-text("组/家庭")');
  await page.waitForURL('http://localhost:5175/groups');
  
  // 创建小组并添加多个成员
  await page.click('button:has-text("创建组")');
  await page.fill('input[placeholder="请输入组名称"]', 'TestGroup');
  
  // 添加多个成员
  await page.fill('input[placeholder="输入虚拟成员名称"]', 'Member1');
  await page.click('button:has-text("添加")');
  await page.fill('input[placeholder="输入虚拟成员名称"]', 'Member2');
  await page.click('button:has-text("添加")');
  
  await page.click('button:has-text("创建")');
  await expect(page.locator('text=TestGroup')).toBeVisible();
  
  // 进入组日历
  await page.click('a:has-text("查看日历")');
  await page.waitForURL(/\/groups\/.*\/calendar/);
  
  // 验证可选组员列表
  const userSelect = page.locator('select');
  const options = await userSelect.locator('option').allTextContents();
  
  // 应该只有 Member1 和 Member2
  expect(options.length).toBe(2);
  expect(options.some(opt => opt.includes('Member1'))).toBeTruthy();
  expect(options.some(opt => opt.includes('Member2'))).toBeTruthy();
  expect(options.some(opt => opt.includes('testcreator'))).toBeFalsy();
});

/**
 * 测试用例：任务页选择组员列表应与组日历一致并过滤创建者
 * 
 * 问题描述：
 * 任务管理页的成员下拉列表包含了创建者，与组日历的过滤规则不一致。
 */
test('任务页选择组员列表应与组日历一致并过滤创建者', async ({ page }) => {
  const creatorName = 'taskpagecreator';
  const memberName = 'TaskMember';
  
  // 登录
  await page.goto('http://localhost:5175/');
  await page.fill('input[placeholder="请输入用户名"]', creatorName);
  await page.click('button:has-text("登录")');
  
  await page.waitForURL('http://localhost:5175/calendar');
  await page.click('a:has-text("组/家庭")');
  await page.waitForURL('http://localhost:5175/groups');
  
  // 创建小组
  await page.click('button:has-text("创建组")');
  await page.fill('input[placeholder="请输入组名称"]', 'TaskTestGroup');
  await page.fill('input[placeholder="输入虚拟成员名称"]', memberName);
  await page.click('button:has-text("添加")');
  await page.click('button:has-text("创建")');
  
  await expect(page.locator('text=TaskTestGroup')).toBeVisible();
  
  // 进入任务页
  await page.click('a:has-text("任务")');
  await page.waitForURL('http://localhost:5175/tasks');
  
  // 点击创建任务
  await page.click('button:has-text("创建任务")');
  
  // 选择组
  await page.selectOption('select[name="groupId"]', { label: 'TaskTestGroup' });
  
  // 等待组员下拉加载
  await page.waitForTimeout(500);
  
  // 获取组员下拉列表的所有选项
  const memberSelect = page.locator('select[name="memberId"]');
  const options = await memberSelect.locator('option').allTextContents();
  
  // 验证包含虚拟组员
  expect(options.some(opt => opt.includes(memberName))).toBeTruthy();
  
  // 验证不包含创建者
  expect(options.some(opt => opt.includes(creatorName))).toBeFalsy();
});

/**
 * 测试用例：虚拟组员创建任务应被阻断并提示
 * 
 * 问题描述：
 * 虚拟组员ID不是真实users.id，创建任务会因外键约束失败。
 * 前端应提前阻断并给出明确提示。
 */
test('虚拟组员创建任务应被阻断并提示', async ({ page }) => {
  const creatorName = 'virtualtestcreator';
  const virtualMemberName = 'VirtualMember';
  
  // 登录
  await page.goto('http://localhost:5175/');
  await page.fill('input[placeholder="请输入用户名"]', creatorName);
  await page.click('button:has-text("登录")');
  
  await page.waitForURL('http://localhost:5175/calendar');
  await page.click('a:has-text("组/家庭")');
  await page.waitForURL('http://localhost:5175/groups');
  
  // 创建小组
  await page.click('button:has-text("创建组")');
  await page.fill('input[placeholder="请输入组名称"]', 'VirtualTestGroup');
  await page.fill('input[placeholder="输入虚拟成员名称"]', virtualMemberName);
  await page.click('button:has-text("添加")');
  await page.click('button:has-text("创建")');
  
  await expect(page.locator('text=VirtualTestGroup')).toBeVisible();
  
  // 进入任务页
  await page.click('a:has-text("任务")');
  await page.waitForURL('http://localhost:5175/tasks');
  
  // 点击创建任务
  await page.click('button:has-text("创建任务")');
  
  // 填写任务信息
  await page.fill('input[name="name"]', 'Test Task for Virtual Member');
  await page.selectOption('select[name="groupId"]', { label: 'VirtualTestGroup' });
  await page.waitForTimeout(500);
  await page.selectOption('select[name="memberId"]', { label: virtualMemberName });
  
  // 设置监听对话框事件（alert）
  const dialogPromise = page.waitForEvent('dialog');
  
  // 提交创建
  await page.click('button[type="submit"]');
  
  // 等待对话框出现
  const dialog = await dialogPromise;
  
  // 验证提示内容
  expect(dialog.message()).toContain('当前版本不支持为虚拟组员创建任务');
  
  // 关闭对话框
  await dialog.accept();
});
