# 测试结果：GLM_5.0（2026-04-14-1535）

## 测试范围
- 测试配置：`.cursor/qa_tests/playwright.config.ts`
- 用例范围：
  - `.cursor/qa_tests/e2e/main-flow.spec.ts`
  - `.cursor/qa_tests/e2e/group-calendar.spec.ts`
- 覆盖点（含主流程）：
  - 组日历切换组员时创建者过滤
  - 创建组、添加组员
  - 为组员创建打卡任务
  - 切换组员并执行打卡交互

## 执行结果
- 执行命令：`npx playwright test --config .cursor/qa_tests/playwright.config.ts`
- 总计 6 条：**6 通过 / 0 失败**
- 关键结果：
  - `任务页「选择组员」：创建者不应出现在列表中` 已通过（上一轮失败点已转绿）
  - 主流程串联用例（建任务 + 切换 + 打卡）通过

## 失败现象
- 本轮无失败用例，未发现可复现失败现象。

## 与 `main...HEAD` 对比分析
- `git diff main...HEAD` 结果：空（当前分支与 `main` 无提交差异）。
- 按质量约束补充声明：由于 `main...HEAD` 无差异，本轮代码证据改为 `main` 与当前工作区关键路径对比（非基线替代，仅补充说明）。
- 补充差异证据（`git diff main -- frontend/src/pages/GroupCalendar.tsx frontend/src/pages/Tasks.tsx`）显示：
  - `GroupCalendar`：真实成员列表排除 `role === '创建者'`
  - `Tasks`：任务页“选择组员”列表同样排除 `role === '创建者'`
- 结论：创建者过滤规则已在“组日历入口 + 任务页入口”保持一致。

## 修复建议
- 当前缺陷已闭环，建议保留现有两类回归：
  - 入口一致性回归（组日历下拉、任务页下拉均排除创建者）
  - 主流程串联回归（建组→加组员→建任务→切换打卡）
- 为降低后续漂移风险，建议后续将“可选组员构建逻辑”抽成共享函数，避免页面间重复实现。
