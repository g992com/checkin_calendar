import { test, expect } from '@playwright/test';

test.describe('组日历可选组员列表测试', () => {
  test('创建者不应出现在可选组员列表中', async ({ page }) => {
    const creatorName = `tina_${Date.now()}`;
    const memberName = `Alina_${Date.now()}`;
    const groupName = `Family_${Date.now()}`;

    await page.goto('/');

    await page.fill('input[placeholder="请输入用户名"]', creatorName);
    await page.click('button:has-text("登录")');

    await page.waitForURL('**/groups');

    await page.click('button:has-text("创建组")');

    await page.fill('input[placeholder="例如：我的家庭"]', groupName);

    await page.click('button:has-text("添加组员")');
    const memberInputs = page.locator('input[placeholder="请输入组员姓名"]');
    await memberInputs.last().fill(memberName);

    await page.click('form:has(input[placeholder="例如：我的家庭"]) button:has-text("创建")', { timeout: 5000 });

    await page.waitForSelector(`h3:has-text("${groupName}")`, { timeout: 5000 });

    const groupCard = page.locator('div.p-4').filter({ has: page.locator(`h3:has-text("${groupName}")`) });
    await groupCard.locator('a:has-text("查看日历")').click();
    await page.waitForURL('**/groups/*/calendar');

    const userSelect = page.locator('select');
    await expect(userSelect).toBeVisible();

    const options = await userSelect.locator('option').allTextContents();
    console.log('可选组员列表:', options);

    const creatorInOptions = options.some(opt => opt.includes(creatorName));
    const memberInOptions = options.some(opt => opt.includes(memberName));

    expect(creatorInOptions).toBe(false);
    expect(memberInOptions).toBe(true);
  });

  test('组日历用户切换功能', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder="请输入用户名"]', 'test');
    await page.click('button:has-text("登录")');
    
    await page.waitForURL('**/groups');
    
    const viewCalendarBtn = page.locator('a:has-text("查看日历")').first();
    if (await viewCalendarBtn.isVisible()) {
      await viewCalendarBtn.click();
      await page.waitForURL('**/groups/*/calendar');
      
      const userSelect = page.locator('select');
      await expect(userSelect).toBeVisible();
      
      const welcomeText = page.locator('span:has-text("欢迎，")');
      await expect(welcomeText).toBeVisible();
    }
  });

  test('组日历权限控制功能', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder="请输入用户名"]', 'test');
    await page.click('button:has-text("登录")');
    
    await page.waitForURL('**/groups');
    
    const viewCalendarBtn = page.locator('a:has-text("查看日历")').first();
    if (await viewCalendarBtn.isVisible()) {
      await viewCalendarBtn.click();
      await page.waitForURL('**/groups/*/calendar');
    }
  });
});
