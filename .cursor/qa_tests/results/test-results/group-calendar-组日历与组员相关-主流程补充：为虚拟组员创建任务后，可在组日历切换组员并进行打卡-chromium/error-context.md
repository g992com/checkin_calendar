# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: group-calendar.spec.ts >> 组日历与组员相关 >> 主流程补充：为虚拟组员创建任务后，可在组日历切换组员并进行打卡
- Location: .cursor\qa_tests\e2e\group-calendar.spec.ts:157:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('task_1776160894673')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('task_1776160894673')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - button "返回打卡页面" [ref=e6] [cursor=pointer]
      - heading "任务管理" [level=1] [ref=e7]
    - button "新建任务" [ref=e8] [cursor=pointer]
  - generic [ref=e9]:
    - heading "新建任务" [level=2] [ref=e10]
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: 任务名称 *
        - textbox [ref=e14]: task_1776160894673
      - generic [ref=e15]:
        - generic [ref=e16]:
          - generic [ref=e17]: 选择组
          - combobox [ref=e18]:
            - option "选择组"
            - option "G_UI_1776160894673" [selected]
        - generic [ref=e19]:
          - generic [ref=e20]: 选择组员
          - combobox [ref=e21]:
            - option "选择组员"
            - option "kidA_1776160894673 (虚拟)" [selected]
            - option "kidB_1776160894673 (虚拟)"
      - generic [ref=e22]:
        - generic [ref=e23]: 描述
        - textbox [ref=e24]
      - generic [ref=e25]:
        - generic [ref=e26]:
          - generic [ref=e27]: 任务类型 *
          - combobox [ref=e28]:
            - option "循环" [selected]
            - option "一次性"
        - generic [ref=e29]:
          - generic [ref=e30]: 周期类型 *
          - combobox [ref=e31]:
            - option "每日" [selected]
            - option "每周"
            - option "每月"
            - option "自定义"
      - generic [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]: 开始日期
          - textbox [ref=e35]
        - generic [ref=e36]:
          - generic [ref=e37]: 结束日期
          - textbox [ref=e38]
      - generic [ref=e39]:
        - generic [ref=e40]: 目标时间 * (HH:mm)
        - textbox [ref=e41]: 21:00
      - generic [ref=e42]:
        - generic [ref=e43]: 颜色
        - textbox [ref=e44]: "#3b82f6"
      - generic [ref=e45]:
        - button "创建" [active] [ref=e46] [cursor=pointer]
        - button "取消" [ref=e47] [cursor=pointer]
  - paragraph [ref=e49]: 还没有任务，创建一个吧！
```

# Test source

```ts
  80  | 
  81  |     await selectMemberByName(calendarMemberSelect, virtualMembers[1]);
  82  |     await page.getByRole('button', { name: '设置任务' }).click();
  83  |     await page.waitForURL('**/tasks**');
  84  | 
  85  |     const taskFormSelects = page.locator('form').first().locator('select');
  86  |     await taskFormSelects.nth(0).selectOption(groupId);
  87  |     const taskMemberOptions = await taskFormSelects.nth(1).locator('option').allInnerTexts();
  88  |     expect(taskMemberOptions.some((t) => t.includes(creatorName))).toBe(false);
  89  |     expect(taskMemberOptions.some((t) => t.includes(virtualMembers[0]))).toBe(true);
  90  |     expect(taskMemberOptions.some((t) => t.includes(virtualMembers[1]))).toBe(true);
  91  |   });
  92  | 
  93  |   test('组日历顶部切换组员下拉：不应包含组创建者', async ({ page }) => {
  94  |     const suffix = `${Date.now()}`;
  95  |     const creatorName = `creator_ui_${suffix}`;
  96  |     const groupName = `G_UI_${suffix}`;
  97  |     const virtualMembers = [`kidA_${suffix}`, `kidB_${suffix}`];
  98  | 
  99  |     await loginAs(page, creatorName);
  100 |     await createGroupWithVirtualMembers(page, groupName, virtualMembers);
  101 | 
  102 |     const calendarMemberSelect = page.locator('nav').locator('select').first();
  103 |     await expect(calendarMemberSelect).toBeVisible();
  104 | 
  105 |     const optionTexts = await calendarMemberSelect.locator('option').allInnerTexts();
  106 |     expect(optionTexts.some((t) => t.includes(creatorName))).toBe(false);
  107 |     expect(optionTexts.some((t) => t.includes(virtualMembers[0]))).toBe(true);
  108 |     expect(optionTexts.some((t) => t.includes(virtualMembers[1]))).toBe(true);
  109 |   });
  110 | 
  111 |   test('任务页「选择组员」：仅应包含同组虚拟组员，不应包含创建者账号', async ({
  112 |     page,
  113 |   }) => {
  114 |     const suffix = `${Date.now()}`;
  115 |     const creatorName = `creator_ui_${suffix}`;
  116 |     const groupName = `G_UI_${suffix}`;
  117 |     const virtualMembers = [`kidA_${suffix}`, `kidB_${suffix}`];
  118 | 
  119 |     await loginAs(page, creatorName);
  120 |     const { groupId } = await createGroupWithVirtualMembers(page, groupName, virtualMembers);
  121 | 
  122 |     await page.getByRole('button', { name: '设置任务' }).click();
  123 |     await page.waitForURL('**/tasks**');
  124 | 
  125 |     const taskFormSelects = page.locator('form').first().locator('select');
  126 |     await taskFormSelects.nth(0).selectOption(groupId);
  127 |     const memberSelect = page.locator('form').locator('select').nth(1);
  128 |     await expect(memberSelect).toBeVisible();
  129 | 
  130 |     const taskMemberOptions = await memberSelect.locator('option').allInnerTexts();
  131 |     expect(taskMemberOptions.some((t) => t.includes(creatorName))).toBe(false);
  132 |     expect(taskMemberOptions.some((t) => t.includes(virtualMembers[0]))).toBe(true);
  133 |     expect(taskMemberOptions.some((t) => t.includes(virtualMembers[1]))).toBe(true);
  134 |   });
  135 | 
  136 |   test('任务页组员口径补充：应与组日历一致并过滤创建者', async ({ page }) => {
  137 |     const suffix = `${Date.now()}`;
  138 |     const creatorName = `creator_ui_${suffix}`;
  139 |     const groupName = `G_UI_${suffix}`;
  140 |     const virtualMembers = [`kidA_${suffix}`, `kidB_${suffix}`];
  141 | 
  142 |     await loginAs(page, creatorName);
  143 |     const { groupId } = await createGroupWithVirtualMembers(page, groupName, virtualMembers);
  144 | 
  145 |     await page.getByRole('button', { name: '设置任务' }).click();
  146 |     await page.waitForURL('**/tasks**');
  147 | 
  148 |     const taskFormSelects = page.locator('form').first().locator('select');
  149 |     await taskFormSelects.nth(0).selectOption(groupId);
  150 |     const options = await taskFormSelects.nth(1).locator('option').allInnerTexts();
  151 | 
  152 |     expect(options.some((t) => t.includes(creatorName))).toBe(false);
  153 |     expect(options.some((t) => t.includes(virtualMembers[0]))).toBe(true);
  154 |     expect(options.some((t) => t.includes(virtualMembers[1]))).toBe(true);
  155 |   });
  156 | 
  157 |   test('主流程补充：为虚拟组员创建任务后，可在组日历切换组员并进行打卡', async ({ page }) => {
  158 |     const suffix = `${Date.now()}`;
  159 |     const creatorName = `creator_ui_${suffix}`;
  160 |     const groupName = `G_UI_${suffix}`;
  161 |     const virtualMembers = [`kidA_${suffix}`, `kidB_${suffix}`];
  162 |     const taskName = `task_${suffix}`;
  163 | 
  164 |     await loginAs(page, creatorName);
  165 |     const { groupId } = await createGroupWithVirtualMembers(page, groupName, virtualMembers);
  166 | 
  167 |     const calendarMemberSelect = page.locator('nav').locator('select').first();
  168 |     await selectMemberByName(calendarMemberSelect, virtualMembers[0]);
  169 | 
  170 |     await page.getByRole('button', { name: '设置任务' }).click();
  171 |     await page.waitForURL('**/tasks**');
  172 | 
  173 |     const taskForm = page.locator('form').first();
  174 |     await taskForm.locator('input[type="text"]').first().fill(taskName);
  175 |     const selects = taskForm.locator('select');
  176 |     await selects.nth(0).selectOption(groupId);
  177 |     await selectMemberByName(selects.nth(1), virtualMembers[0]);
  178 |     await taskForm.getByRole('button', { name: '创建', exact: true }).click();
  179 | 
> 180 |     await expect(page.getByText(taskName)).toBeVisible({ timeout: 10000 });
      |                                            ^ Error: expect(locator).toBeVisible() failed
  181 | 
  182 |     await page.goto(`/groups/${groupId}/calendar`);
  183 |     await page.waitForURL('**/groups/*/calendar');
  184 |     const memberSelectAgain = page.locator('nav').locator('select').first();
  185 |     await selectMemberByName(memberSelectAgain, virtualMembers[0]);
  186 | 
  187 |     const taskLabel = page.locator('[class*="truncate"]').filter({ hasText: taskName }).first();
  188 |     await expect(taskLabel).toBeVisible({ timeout: 10000 });
  189 |     await taskLabel.click();
  190 |   });
  191 | });
  192 | 
```