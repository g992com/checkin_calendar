# 测试结果：Kimi-K2.5

## 基线与执行信息
- 代码对比基线：`main...HEAD`（默认基线，未改用其他基线）。
- 执行配置：`npx playwright test --config .cursor/qa_tests/playwright.config.ts --workers=1`
- 执行时间：2026-04-14 18:02（本地）
- 服务收尾：测试后执行停止脚本并复核，`5175/3001` 均为 `DOWN`。

## 测试范围
- 组日历切换组员：创建者过滤。
- 主流程：登录 -> 创建组 -> 添加虚拟组员 -> 进入组日历 -> 跳转任务页 -> 选择组员。
- 主流程补充：为组员创建打卡任务 -> 返回组日历切换组员 -> 执行打卡。

## 用例调整（本轮）
- 更新 `.cursor/qa_tests/e2e/group-calendar.spec.ts` 中两条旧断言：任务页组员列表从“应包含创建者”改为“应过滤创建者”，与修复后行为一致。
- 保留并执行“任务页组员口径补充”与“主流程补充”两条回归用例。

## 执行结果
- 总计：6
- 通过：5
- 失败：1

通过用例：
- `.cursor/qa_tests/e2e/group-calendar.spec.ts` - 主流程串联（纯 UI）
- `.cursor/qa_tests/e2e/group-calendar.spec.ts` - 组日历顶部切换组员下拉：不应包含组创建者
- `.cursor/qa_tests/e2e/group-calendar.spec.ts` - 任务页「选择组员」：仅应包含同组虚拟组员，不应包含创建者账号
- `.cursor/qa_tests/e2e/group-calendar.spec.ts` - 任务页组员口径补充：应与组日历一致并过滤创建者
- `.cursor/qa_tests/e2e/main-flow.spec.ts` - 业务主流程（UI）

失败用例：
- `.cursor/qa_tests/e2e/group-calendar.spec.ts` - 主流程补充：为虚拟组员创建任务后，可在组日历切换组员并进行打卡

## 失败现象
- 失败断言：`expect(page.getByText(taskName)).toBeVisible({ timeout: 10000 })`
- 页面快照显示：表单内已选虚拟组员并点击“创建”，但页面仍提示“还没有任务，创建一个吧！”，任务未落地展示。
- 归因判定：该问题属于 `main` 分支已存在的能力缺口（虚拟组员不可建立任务），本轮主要是复现确认，非本次修复新增回归。
- 错误证据：`.cursor/qa_tests/results/test-results/group-calendar-组日历与组员相关-主流程补充：为虚拟组员创建任务后，可在组日历切换组员并进行打卡-chromium/error-context.md`

## 与 `main...HEAD` 对比分析
- `main...HEAD` 明确修复了 `GroupCalendar` 入口：可选组员改为仅虚拟组员，创建者过滤生效（对应测试通过）。
- `main...HEAD` 未包含 `Tasks` 页“虚拟组员任务创建策略”相关改动；因此从基线视角，主流程“为虚拟组员创建任务并打卡”仍无闭环保证。
- 运行时代码可见 `Tasks` 新增了前端阻断（虚拟组员直接 `alert` 并 `return`），该策略解释了主流程失败：任务不会创建，自然无法在后续日历中看到并打卡。

## 可执行修复建议
1. **若目标是支持虚拟组员任务（推荐）**：后端引入虚拟组员实体与任务归属关系，避免依赖 `Task.userId -> User.id` 真实用户外键。
2. **若短期不支持虚拟组员任务**：将该限制写入产品规则，并在 UI 上明确引导（禁用创建按钮/显式提示），同时调整“主流程验收标准”为可执行范围。
3. **回归补齐**：
   - 新增“真实组员任务创建与打卡成功”用例（可成功路径）；
   - 保留“虚拟组员创建任务受限”用例（受限路径）；
   - 持续校验组日历与任务页组员口径一致性，防止入口规则漂移。
