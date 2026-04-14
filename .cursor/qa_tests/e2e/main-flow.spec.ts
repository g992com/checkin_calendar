import { test, expect } from '@playwright/test';

/**
 * 业务主流程（纯 UI）：登录 → 创建组并添加虚拟组员 → 组日历验证下拉不含创建者、含虚拟组员。
 *
 * 说明：虚拟组员 ID 仅存在于前端 localStorage，后端 `POST /api/tasks` 要求 `userId` 为真实用户，
 * 故「为虚拟组员创建打卡任务」无法在 E2E 中走通成功路径；真实组员创建任务与打卡见 `group-calendar.spec.ts`。
 */
async function loginAs(page: import('@playwright/test').Page, username: string) {
  await page.goto('/');
  await page.fill('input[placeholder="请输入用户名"]', username);
  await page.click('button:has-text("登录")');
  await page.waitForURL('**/groups');
}

test.describe('业务主流程（UI）', () => {
  test('创建组并添加虚拟组员：组日历切换组员下拉不含创建者且列出虚拟组员', async ({ page }) => {
    const suffix = `${Date.now()}`;
    const username = `ui_flow_${suffix}`;
    const groupName = `家庭_${suffix}`;
    const virtualName = `宝贝_${suffix}`;

    await loginAs(page, username);

    await page.getByRole('button', { name: '创建组' }).click();
    await page.getByPlaceholder('例如：我的家庭').fill(groupName);
    await page.getByRole('button', { name: '添加组员' }).click();
    await page.getByPlaceholder('请输入组员姓名').fill(virtualName);
    await page
      .locator('form')
      .filter({ hasText: '组名称' })
      .getByRole('button', { name: '创建', exact: true })
      .click();

    await expect(page.getByRole('heading', { name: groupName })).toBeVisible({ timeout: 15000 });

    await page
      .locator('div')
      .filter({ has: page.getByRole('heading', { name: groupName }) })
      .getByRole('link', { name: '查看日历' })
      .click();
    await page.waitForURL('**/groups/*/calendar');

    const calendarMemberSelect = page.locator('nav').locator('select').first();
    await expect(calendarMemberSelect).toBeVisible();

    const optionTexts = await calendarMemberSelect.locator('option').allInnerTexts();
    expect(optionTexts.some((t) => t.includes(username))).toBe(false);
    expect(optionTexts.some((t) => t.includes(virtualName))).toBe(true);
  });
});
