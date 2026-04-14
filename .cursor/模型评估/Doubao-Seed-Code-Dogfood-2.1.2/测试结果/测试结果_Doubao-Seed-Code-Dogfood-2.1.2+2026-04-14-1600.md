# 测试结果 — Doubao-Seed-Code-Dogfood-2.1.2

## 执行环境

- 仓库根目录：`D:\llm_test_workspace\checkin_calendar`
- 分支：`Doubao-Seed-Code-Dogfood-2.1.2`（相对 `main` 的对比见下文）
- Playwright：`npx playwright test --config .cursor/qa_tests/playwright.config.ts --workers=1`
- 浏览器：首次执行前已运行 `npx playwright install chromium`
- 配置：`.cursor/qa_tests/playwright.config.ts`（`webServer`：`npm run dev`，`reuseExistingServer: true`）

## 用例与结果摘要

| 用例 | 结果 | 说明 |
|------|------|------|
| 组日历顶部切换组员下拉：不应包含组创建者 | **失败** | 组日历页 `nav` 内 `<select>` 的选项仍包含创建者用户名 |
| 任务页「选择组员」：创建者不应出现在列表中（从组日历进入「设置任务」） | **通过** | `Tasks.tsx` 中构建组员列表时排除了当前登录用户 |
| 为组员创建组打卡任务：选择组员后创建成功 | **通过** | 监听 `POST /api/tasks` 成功，且 `GET /api/tasks?userId=<组员>` 能查到任务名 |
| 组员账号在组日历中切换为自己后可完成当日打卡 | **通过** | 组员登录后切换下拉为本人，点击当日任务未出现「权限」类 `alert` |

**合计**：4 例中 3 通过，1 失败。

## 与 main 分支对比（原因分析）

### 1）失败用例：组日历可选组员仍含创建者

- **现象**：`frontend/src/pages/GroupCalendar.tsx` 将 `group.members` 与本地虚拟组员合并后全部渲染到下拉框，未按「创建者」角色或创建者 `userId` 过滤。
- **main 分支**：同一文件逻辑一致，**同样**会列出创建者。
- **当前分支（模型改动）**：`git diff main -- frontend/src/pages/GroupCalendar.tsx` 无功能性差异；问题仍在组日历页。
- **结论**：Issue #1 描述的验收点位于 **组日历顶部组员切换下拉**；当前实现中 **该处未修复**。模型在 `frontend/src/pages/Tasks.tsx` 中为「选择组员」增加了「排除当前用户」的逻辑，与 Issue 中「任务页选组员」部分一致，但 **未覆盖组日历页同一业务规则**。

### 2）通过用例与 main 的差异

- **任务页选择组员**：`main` 的 `Tasks.tsx` 在构建 `allMembers` 时包含所有真实成员（含创建者）；当前分支对真实成员增加 `member.userId !== user.id` 判断，与测试 2、3 通过一致。
- **组员打卡**：与本次需求无直接回归点；用例验证组员对自己任务打卡不出现权限弹窗，行为符合 `CalendarGrid` 中「仅任务所有者可操作」的校验。

## 建议的修复方向（供编程智能体）

1. **组日历**：在 `GroupCalendar.tsx` 中构建 `memberList` 时排除创建者，优先使用后端 `group.members[].role === '创建者'`；或排除与当前登录用户 `user.id` 相同项时需注意：若业务仅排除「组创建者」而非「当前查看者」，应基于 **role** 或 **owner 字段**，避免误伤非创建者管理员（若未来存在）。
2. **一致性**：组日历「可选组员」与任务页「选择组员」应对齐同一业务规则（仅真实组员 / 含虚拟组员等），并在两端共用同一过滤辅助函数，减少分叉。

## 附：自动化命令

```bash
cd <repo-root>
npx playwright test --config .cursor/qa_tests/playwright.config.ts --workers=1
```

失败用例产物路径（若存在）：`.cursor/qa_tests/results/test-results/` 下对应 `error-context.md`。
