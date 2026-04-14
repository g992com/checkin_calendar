# 测试执行产物（本地）

本目录由 Playwright 在运行 QA 配置时生成，**不提交版本库**（与整个 `.cursor/` 一同被根目录 `.gitignore` 忽略）。

| 子目录/用途 | 说明 |
|-------------|------|
| `playwright-report/` | HTML 测试报告（由 `reporter: html` 写入） |
| `test-results/` | 失败重试附件、trace 等（由 `outputDir` 指定） |

首次运行测试前若目录不存在，Playwright 会创建所需路径。
