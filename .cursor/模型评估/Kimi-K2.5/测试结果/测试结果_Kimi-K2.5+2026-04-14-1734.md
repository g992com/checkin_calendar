# 测试结果：Kimi-K2.5

## 基线与执行信息
- 代码对比基线：`main...HEAD`（按默认要求执行，未改用其他基线）。
- 执行配置：`npx playwright test --config .cursor/qa_tests/playwright.config.ts --workers=1`
- 执行时间：2026-04-14 17:42（本地，含任务管理页组员口径补测）
- 服务状态：测试后检查 `http://localhost:5175` 与 `http://localhost:3001/api/health` 均为 `DOWN`，本轮自动拉起服务已关闭。

## 测试范围
- 组日历顶部组员切换下拉：创建者过滤（Issue #1 目标）。
- 主流程链路：登录 -> 创建组 -> 添加虚拟组员 -> 进入组日历 -> 设置任务页选择组员。
- 任务管理页组员口径一致性：任务页“选择组员”应与组日历规则一致（过滤创建者）。
- 主流程验证：为虚拟组员创建打卡任务 -> 返回组日历切换组员 -> 尝试打卡。

## 执行结果
- 总计：6
- 通过：4
- 失败：2

通过用例：
- `.cursor/qa_tests/e2e/group-calendar.spec.ts` - 主流程串联（UI）
- `.cursor/qa_tests/e2e/group-calendar.spec.ts` - 组日历顶部切换组员下拉：不应包含组创建者
- `.cursor/qa_tests/e2e/group-calendar.spec.ts` - 任务页选择组员列表（当前实现校验）
- `.cursor/qa_tests/e2e/main-flow.spec.ts` - 业务主流程（UI）

失败用例：
- `.cursor/qa_tests/e2e/group-calendar.spec.ts` - 任务页组员口径补充：应与组日历一致并过滤创建者
- `.cursor/qa_tests/e2e/group-calendar.spec.ts` - 主流程补充：为虚拟组员创建任务后，可在组日历切换组员并进行打卡

## 失败现象
- 用例1（任务页组员口径一致性）：
  - 失败断言：`expect(options.some((t) => t.includes(creatorName))).toBe(false)`
  - 实际结果：断言为 `true`，任务管理页组员下拉仍包含创建者。
  - 关键证据：`.cursor/qa_tests/results/test-results/group-calendar-组日历与组员相关-任务页组员口径补充：应与组日历一致并过滤创建者-chromium/error-context.md`
- 用例2（虚拟组员任务与打卡主流程）：
  - 失败断言：`expect(page.getByText(taskName)).toBeVisible({ timeout: 10000 })`
  - 现象：点击“创建”后，任务列表仍显示“还没有任务，创建一个吧！”，未出现新建任务。
  - 关键证据：`.cursor/qa_tests/results/test-results/group-calendar-组日历与组员相关-主流程补充：为虚拟组员创建任务后，可在组日历切换组员并进行打卡-chromium/error-context.md`

## 与 `main...HEAD` 对比分析
- 在 `frontend/src/pages/GroupCalendar.tsx` 中，`main...HEAD` 的修复仅针对组日历可选组员来源：删除真实成员注入，仅保留 `localStorage` 虚拟组员，能解释“创建者不再出现在组日历下拉”且相关用例通过。
- `main...HEAD` 未修改 `frontend/src/pages/Tasks.tsx` 与 `backend/src/routes/tasks.ts` 的虚拟组员任务落库链路。
- 当前任务创建仍走 `POST /api/tasks`，后端任务 `userId` 受 `Task.userId -> User.id` 外键约束；虚拟组员 ID 来源于前端 `localStorage`（`vm_*`），不是真实 `users.id`，因此“为虚拟组员创建任务”无法形成可见任务记录。

## 可执行修复建议
1. **后端方案（推荐）**：扩展任务归属模型，支持“虚拟组员”实体（如新增 `virtual_member` 表并建立任务归属关系），避免将虚拟 ID 直接写入 `Task.userId`。
2. **前端兜底方案**：在 `Tasks` 提交前检测所选组员类型为 `virtual` 时，明确阻断并提示“当前版本不支持为虚拟组员创建任务”，避免静默失败。
3. **回归用例补充**：
   - 成功路径：真实用户组员创建任务并在组日历打卡成功。
   - 边界路径：虚拟组员创建任务时返回明确错误提示（若仍不支持）。
   - 一致性路径：组日历组员过滤规则与任务页组员来源规则一致性校验（避免入口规则分叉）。
