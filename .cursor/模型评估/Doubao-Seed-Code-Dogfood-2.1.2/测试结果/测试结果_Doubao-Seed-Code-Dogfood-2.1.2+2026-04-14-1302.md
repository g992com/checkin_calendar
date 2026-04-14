# 测试结果 — Doubao-Seed-Code-Dogfood-2.1.2

## 执行环境

- 仓库根目录：`d:\llm_test_workspace\checkin_calendar`
- Playwright：`npx playwright test --config .cursor/qa_tests/playwright.config.ts --workers=1`
- 配置：`.cursor/qa_tests/playwright.config.ts`（`webServer`：`npm run dev`，`reuseExistingServer: true`）

## 用例与结果摘要

| 用例 | 结果 | 说明 |
|------|------|------|
| 组日历顶部切换组员下拉：不应包含组创建者 | **通过** | `GroupCalendar.tsx` 对 `role !== '创建者'` 的真实成员过滤后渲染下拉选项 |
| 任务页「选择组员」：创建者不应出现在列表中 | **通过** | 从组日历进入「设置任务」后，任务表单中组员选项不含创建者 |
| 为组员创建组打卡任务（真实组员） | **通过** | `POST /api/tasks` 成功，`GET /api/tasks?userId=<组员>` 可查到任务 |
| 组员账号切换为自己后当日打卡 | **通过** | 真实组员登录后打卡无「权限」类弹窗 |
| 业务主流程（UI）：创建组并添加虚拟组员 | **通过** | 纯 UI 创建组、添加虚拟组员，组日历下拉不含登录名、含虚拟组员姓名 |

**合计**：5 例全部通过。

## 与上一轮报告及 main 分支的对比

### 已修复项（相对 `测试结果_Doubao-Seed-Code-Dogfood-2.1.2+2026-04-14-1600.md`）

- 上一轮失败原因：组日历未排除创建者。
- 当前代码：`frontend/src/pages/GroupCalendar.tsx` 在构建 `memberList` 时对真实成员使用 `member.role !== '创建者'` 判断后再 `push`，与 Issue 及验收一致。

### 相对 main

- **main**：组日历将全体 `group.members` 与虚拟组员一并列入下拉，创建者会出现。
- **当前分支**：创建者被过滤；任务页 `Tasks.tsx` 仍排除当前登录用户，行为与此前评测一致。

## 业务主流程覆盖说明

| 环节 | 覆盖方式 |
|------|----------|
| 创建组、添加组员 | `main-flow.spec.ts`：UI 填写组名与虚拟组员姓名并提交 |
| 组日历切换组员 | 同上进入组日历后断言下拉选项 |
| 为组员创建打卡任务、切换组员打卡 | `group-calendar.spec.ts`：API 造真实用户与入组后，走「设置任务」与组员登录打卡 |

说明：虚拟组员 ID 仅存在于前端 localStorage，后端任务表对用户 ID 有外键约束，无法为纯虚拟 ID 断言「创建任务成功」；真实组员路径已在同套件中覆盖创建任务与打卡。

## 自动化命令

```bash
cd <repo-root>
npx playwright test --config .cursor/qa_tests/playwright.config.ts --workers=1
```

## 若编程智能体需复现失败

- 查看 `.cursor/qa_tests/results/test-results/` 下对应用例的 `error-context.md` 与 trace（若开启）。
