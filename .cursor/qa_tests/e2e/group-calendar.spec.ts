import { test, expect, request } from '@playwright/test';

test.describe('组日历可选组员列表测试', () => {
  test('创建者不应出现在可选组员列表中', async ({ page }) => {
    const apiContext = await request.newContext({
      baseURL: 'http://localhost:3001',
    });

    const tinaResponse = await apiContext.post('/api/users', {
      data: { username: 'tina' },
    });
    const tinaData = await tinaResponse.json();
    const tinaId = tinaData.data.id;

    const alinaResponse = await apiContext.post('/api/users', {
      data: { username: 'Alina' },
    });
    const alinaData = await alinaResponse.json();
    const alinaId = alinaData.data.id;

    const groupResponse = await apiContext.post('/api/groups', {
      data: { name: 'Family', userId: tinaId },
    });
    const groupData = await groupResponse.json();
    const groupId = groupData.data.id;
    const inviteCode = groupData.data.inviteCode;

    await apiContext.post(`/api/groups/${groupId}/join`, {
      data: { userId: alinaId, inviteCode },
    });

    await page.goto('/');
    await page.fill('input[placeholder="请输入用户名"]', 'tina');
    await page.click('button:has-text("登录")');
    // 与 Login.tsx 一致：登录成功后进入组管理页
    await page.waitForURL('**/groups');

    await page.click(`a[href="/groups/${groupId}/calendar"]`);
    await page.waitForURL('**/groups/*/calendar');

    const userSelect = page.locator('select');
    await expect(userSelect).toBeVisible();

    const options = await userSelect.locator('option').allInnerTexts();
    
    expect(options).not.toContain('tina');
    expect(options).toContain('Alina');

    await apiContext.dispose();
  });
});
