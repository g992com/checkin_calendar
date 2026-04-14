# 测试工程师专用 Playwright 资产（`.cursor/qa_tests`）

本目录与仓库根目录下的 [`tests/e2e/`](../../tests/e2e)（编程智能体维护的用例）**相互独立**，请勿混用配置与用例路径。

## 版本库策略

- 仓库根目录 [`.gitignore`](../../.gitignore) 忽略整个 `.cursor/`，因此本目录内的用例、配置、执行结果**默认均不进入 Git**。
- 若需在团队内共享用例，请通过 Issue、Wiki、附件等仓库外渠道；克隆仓库后在本机 `.cursor/qa_tests` 下自行维护 QA 资产。

## 目录说明

| 路径 | 说明 |
|------|------|
| `playwright.config.ts` | QA 专用 Playwright 配置（`testDir` / `outputDir` / HTML 报告均指向本树内） |
| `e2e/` | QA 编写的 `*.spec.ts` |
| `results/` | 本地测试产物（HTML 报告、`test-results` 等），见 [`results/README.md`](results/README.md) |

## 运行方式

**必须在仓库根目录执行**（以便配置中的 `process.cwd()` 与路径拼接正确）：

```bash
# 安装依赖（若尚未安装）
npm install
npx playwright install

# 运行 QA E2E（自动拉起 webServer：根目录 npm run dev）
npx playwright test --config .cursor/qa_tests/playwright.config.ts
```

常用参数示例：

```bash
npx playwright test --config .cursor/qa_tests/playwright.config.ts --reporter=list
```

## 查看 HTML 报告

```bash
npx playwright show-report .cursor/qa_tests/results/playwright-report
```

## 环境要求

- Node.js 18+
- 前端开发服务器：`http://localhost:5175`（由 `npm run dev` 启动）
- 后端 API：`http://localhost:3001`（用例中 `request` 上下文直连）

## 与根目录 Playwright 的对比

| 项目 | 根目录（编程智能体） | 本目录（测试工程师） |
|------|----------------------|----------------------|
| 配置文件 | `playwright.config.ts` | `.cursor/qa_tests/playwright.config.ts` |
| 用例目录 | `tests/e2e/` | `.cursor/qa_tests/e2e/` |
| 报告与产物 | 默认在仓库根下 `test-results/`、`playwright-report/` 等 | `.cursor/qa_tests/results/` 下 |

更多用例级说明见 [`e2e/README.md`](e2e/README.md)。
