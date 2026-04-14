# 测试结果报告（编程智能体可读）

- **评估对象**：需求「组日历中创建者不应出现在可选组员列表」（GitHub Issue：在组日历页面可选组员不应包含组创建者本人；参见仓库 `g992com/checkin_calendar` issue #1 描述）。
- **被测代码归属**：编程智能体基于 **Doubao-Seed-Code-Dogfood-2.1.2** 会话交付（会话归档见同目录 `\会话记录\会话记录_Doubao-Seed-Code-Dogfood-2.1.2_2026-04-14_每轮归档.md`）；用户侧亦提及与 **Doubao-Seed-Code-Dogfood-2.1.2** 相关的代码质量评估，本报告以**当前仓库行为与自动化验证**为准。
- **生成时间**：2026-04-14 18:30（本地时间戳用于文件名区分）。

---

## 1. 应用使用方式（与测试相关）

1. 启动：`npm run dev`（根目录，并发启动前端 `http://localhost:5175`、后端 `http://localhost:3001`）。
2. 登录：首页输入用户名，点击「登录」。
3. 组管理：「组/家庭」→「创建组」→ 填写组名、至少一名虚拟组员 →「创建」。
4. 组日历：在组卡片上点击「查看日历」；导航栏「可选组员」为 `<select>` 下拉框（仅当存在除创建者外的可选组员时展示）。

---

## 2. 功能测试用例设计

| 编号 | 前置条件 | 步骤 | 预期结果 |
|------|----------|------|----------|
| TC-01 | 用户 A 已登录；新建组 G，创建时仅添加虚拟组员「Alina」 | 进入 G 的组日历 | 欢迎语仍显示创建者 A；**可选组员 `<option>` 中不得出现与创建者用户名一致的项**；仅含「Alina」及必要的「(虚拟)」标记 |
| TC-02 | 同 TC-01 | 遍历 `nav` 内组员 `<select>` 全部 `option` 的 `textContent` | 不包含创建者登录名（本例 `test`），且不包含「test (虚拟)」类误标 |
| TC-03 | 与 Issue 一致场景（账号 tina、组员 Alina、组名 Family） | 同上 | 可选列表仅 Alina，不含 tina |
| TC-04（回归） | 组内除创建者外还有**真实**其他用户成员（若环境可造） | 进入组日历 | 可选列表含其他真实成员与虚拟成员，**仍不含创建者** |

---

## 3. 测试执行方式与环境

| 项目 | 说明 |
|------|------|
| 服务 | 已本地启动 `npm run dev`（后端 3001、前端 5175） |
| **Playwright MCP（user-playwright）** | 使用 `browser_navigate` / `browser_type` / `browser_click` / `browser_snapshot` / `browser_evaluate` 按上表 TC-01/TC-02 执行 |
| **CLI `npx playwright test`** | 在本机执行 `tests/e2e/group-calendar.spec.ts` 时 **失败**：报错 `browserType.launch: Executable doesn't exist`，提示需执行 `npx playwright install` 下载浏览器。**未修改任何代码或配置**；该失败属于**本机 Playwright 浏览器未安装**，不能据此否定被测前端逻辑 |

---

## 4. 执行结果（MCP 实测）

**结论：与需求一致的用例通过。**

- **数据准备**：用户 `test`；新建组 `FamilyTest`；虚拟组员 `Alina`。
- **页面**：`http://localhost:5175/groups/<groupId>/calendar`。
- **可访问性快照**：导航栏显示「欢迎，test」；组员下拉为 `combobox`，仅见选项 **「Alina (虚拟)」**，**未见「test」或「test (虚拟)」**。
- **`document.querySelector('nav select')` 选项枚举**（`browser_evaluate`）：
  - 仅一条：`text: "Alina (虚拟)"`，`selected: true`。

---

## 5. 原因分析（结合只读代码；未执行 git diff）

> 说明：评测机 PowerShell 中 `git` 命令不可用，**未能生成 git diff**；下列依据为仓库当前文件只读审查。

- **实现要点**：`frontend/src/pages/GroupCalendar.tsx` 在 `getGroup` 回调中合并 API 返回成员与 `localStorage` 虚拟组员后，使用  
  `memberList.filter(member => member.userId !== user?.id)`  
  得到 `members`，仅用于 `<select>` 的 `option` 列表，从而将**当前登录用户（创建者）排除在可选组员之外**；欢迎语仍使用 `currentUser?.username || user?.username`，创建者名称仍可显示。
- **与 Issue 对齐**：修复后行为与「可选组员仅含创建组时添加的组员、不含创建者本人」一致（虚拟组员场景下仅 Alina）。

---

## 6. 给编程智能体的后续建议（若出现回归）

1. **时序**：`user?.id` 在首次渲染未就绪时，`!== user?.id` 对非 undefined 的 `member.userId` 可能短暂无法过滤创建者；依赖 `useEffect` 依赖项包含 `user` 可再跑一遍逻辑。若线上仍见闪现已选列表，可复核 `user` 就绪后再渲染下拉或二次过滤。
2. **受控下拉与 value**：`<select value={currentUserId}>` 在创建者被移出 `options` 时，部分浏览器会表现为选中第一项；当前快照显示选中「Alina (虚拟)」。若需「默认视角仍为创建者日历且下拉不预选组员」，可单独设计展示策略（产品决策，非本 Issue 必选项）。
3. **E2E 环境**：仓库用例假设已有「查看日历」入口；**空账号需先建组**。CI 应保证 `npx playwright install` 已执行，否则 CLI 用例无法启动浏览器。

---

## 7. 附录：CLI Playwright 失败摘录（环境）

```
Error: browserType.launch: Executable doesn't exist at ...\chrome-headless-shell.exe
Please run: npx playwright install
```

---

*本文件由测试/评测流程生成，供编程智能体读取；评测过程未修改业务代码与测试源码。*
