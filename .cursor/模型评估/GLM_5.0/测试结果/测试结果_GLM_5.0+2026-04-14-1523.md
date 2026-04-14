# 测试结果：GLM_5.0（2026-04-14-1523）

## 1) 测试范围
- 测试资产：`.cursor/qa_tests/playwright.config.ts`、`.cursor/qa_tests/e2e/main-flow.spec.ts`、`.cursor/qa_tests/e2e/group-calendar.spec.ts`
- 执行命令：`npx playwright test --config .cursor/qa_tests/playwright.config.ts`
- 覆盖目标：
  - 组日历切换组员时，创建者应被过滤（Issue #1）
  - 主流程：创建组、添加组员、为组员创建打卡任务、切换组员并执行打卡交互

## 2) 执行结果
- 总计 6 条用例：**5 通过 / 1 失败**
- 通过：
  - `main-flow.spec.ts`：创建组 + 虚拟组员 + 组日历过滤校验
  - `group-calendar.spec.ts`：主流程串联（含创建任务与切换打卡）
  - `group-calendar.spec.ts`：组日历创建者过滤
  - `group-calendar.spec.ts`：为组员创建任务并 API 校验
  - `group-calendar.spec.ts`：组员账号切换为自己并打卡
- 失败：
  - `group-calendar.spec.ts` / 用例：`任务页「选择组员」：创建者不应出现在列表中（从组日历进入「设置任务」）`

## 3) 失败现象
- 断言失败：期望任务页“选择组员”下拉不包含创建者，实际包含创建者。
- Playwright 快照显示：
  - 任务页下拉 `option` 同时出现 `creator_xxx` 和 `member_xxx`。
- 失败定位文件：`.cursor/qa_tests/results/test-results/.../error-context.md`

## 4) 与 `main...HEAD` 对比分析
- `git diff main...HEAD` 结果：**空**（当前 `HEAD` 与 `main` 无提交差异）。
- 因基线无差异，无法仅凭 `main...HEAD` 解释失败；按要求降级为补充口径：对比 `main` 与当前工作区改动。
- 补充 diff 证据（`git diff main -- frontend/src/pages/GroupCalendar.tsx`）：
  - 组日历页面已新增 `member.role !== '创建者'` 过滤逻辑，说明 Issue #1 的主修复点在组日历入口已生效。
- 对应失败页 `frontend/src/pages/Tasks.tsx` 现状：
  - 构建任务页组员列表时，将 `selectedGroup.members` 全量加入，未排除 `role === '创建者'`，因此跨入口规则不一致。

## 5) 可执行修复建议
- 建议 1（前端）：在 `frontend/src/pages/Tasks.tsx` 的组员组装逻辑中，补充与组日历一致的过滤条件（排除 `role === '创建者'`）。
- 建议 2（回归）：新增/保留“跨入口一致性”回归用例（组日历下拉 + 任务页下拉都应排除创建者）。
- 建议 3（稳态）：将“组员可选列表构建”抽到共享函数，避免 `GroupCalendar` 与 `Tasks` 各自实现导致规则漂移。

## 6) 结论
- 该次修复已覆盖并通过“组日历入口”过滤，但“任务页入口”仍存在创建者泄漏，属于同一业务规则的跨入口不一致。
- 当前状态：**待修复后再回归，暂不建议按“已完全修复”关闭相关缺陷。**
