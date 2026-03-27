---
name: module-api-contract-audit
description: >-
  Audits and organizes per-module HTTP API contracts, mock/backend-api JSON, README inventories, config data-source switches, fetch* in src/api, and UI coverage across routes. Enforces full sampleResponse, POST-only JSON APIs, and URL shape route+module+feature. Use when the user asks to 整理/梳理/校验/补全 项目或某业务模块的 接口契约、mock 契约、backend-api、或检查某模块是否少接口；或提到「模块接口与页面对齐」「契约与 fetch 对照」 「返回示例」「sampleResponse」「全部 POST」「接口路径命名」、大模块多页面契约目录聚合、 数据源开关统一、data-source 注释、多 enum 多 isMock、交互说明、初始化加载、默认选中。
---

# 模块接口契约整理（工作流）

执行前须同时遵守仓库规则：`api-contract-and-mock-conventions.mdc`、`module-api-mock-config.mdc`、`project-conventions.mdc` 中与 Mock、config、`fetch*` 相关的条款。

## 0. 契约硬性要求（本项目必须满足）

整理或新增契约时 **逐条验收**，不满足则视为未完工：

### 0.1 完整的接口返回示例

- 每个 `mock/backend-api/*.json` 必须包含 **`sampleResponse`**，且与 `fieldDescription` 中 **`response` / 嵌套类型** 语义一致：字段齐全、嵌套对象/数组至少有一项 **贴近真实结构** 的示例，禁止用空对象、`...` 或未解释的大字段糊弄联调。
- 若网关统一包裹 `{ code, message, data }`：在 `fieldDescription` 或 `_comment` / `apiSuggestion` 中写明；`sampleResponse` 须写清 **业务体**（即 `data` 内形态），或与 README 约定「本文件 `sampleResponse` 表示 unwrap 后的 `data`」并保持全模块一致。

### 0.2 请求 URL：路由 + 模块名 + 功能

- 路径须 **可从前端路由反推业务归属**，层级为：**父级路径（与用户可见的路由模块一致）** + **子分组（如 meta / overview / table / export）** + **`endpoint`（kebab-case，体现单一功能）**。
- 示例（逻辑形态，非写死网关前缀）：列表模块 `.../user-growth/ad-performance/overview`；子页 `.../user-growth/ad-performance/campaign-detail/ad-edit/save-draft`。具体前缀以 **`src/api` 中常量 + `request` 实际 URL** 为联调准绳，契约 `api.url` / README 与之一致或在文中标注差异。
- **禁止** 含糊的聚合路径（如单一 `getData`）承载多个 UI 形态；功能名须在路径或末段 endpoint 上可读。

### 0.3 一律 POST

- **所有** 契约接口 **`api.method` 为 `POST`**，请求体为 **JSON**（`sampleRequest` 给出的结构）；前端对应使用 `request.post`（或项目统一封装中等价写法）。
- 新模块、新契约 **不得** 再用 GET + query 作为主约定；历史 GET 若存在，整理时可在交付物中单列「待迁移为 POST」项，不扩大 GET 面。

## 1. 划定模块边界

- 从 **Vue Router**（如 `src/router/modules/*.ts`）列出该模块下所有 **path/component**，含子路由（详情页、编辑页、抽屉跳转页等）。
- 模块根目录一般为 `src/views/<大模块>/<页面>/`，子页面可能有独立 `index.vue`（如 `campaign-detail/ad-edit`）。

## 2. 盘点页面实际调用的 API

- 在对应 `views/...` 下 `grep`：`fetch`、`request.post`、`from '@/api`。
- 列出每个 **路由/页面** → **fetch\* 或请求函数**；注意 composable 间接调用。

## 3. 盘点契约与文档

- 查找 `src/views/<模块>/.../mock/backend-api/**/*.json` 与 **`README.md` 接口清单**。
- **大模块多页面** 时目录须符合 **章节 9**（契约与开关聚合在模块根）；存量若在子目录分散，整理交付物中须标 **待迁移路径**。
- **每个** 承担「接口契约集合」的 `backend-api` 目录须有 **`README.md`**；纯索引说明可合并进根目录 README。
- 核对：**一接口一独立 JSON**（含 `fieldDescription`、`sampleRequest`、**完整** `sampleResponse`、`api`、**章节 10 `interaction`**）；复杂表格/详情应按 UI 拆分；并符合 **章节 0**。

## 4. 与实现对齐

- `src/api/**/*.ts`：每个契约是否有 **同名/同路径语义** 的 `fetch*`，且使用 `@/utils/http`。
- **`config/data-source.ts`**：**大模块多页面** 时仅 **一份** 放在 **该业务聚合根目录** `config/`，枚举覆盖 **所有子页面** 用到的接口开关（章节 9）；`src/api` 分支统一读该文件。
- 本地 Mock 实现（如 `*-api-mock.ts`）：每个走 Mock 的 `fetch*` 是否有对应 mock 函数。

## 5. 契约与类型一致

- 页面/共享 `types.ts` 与契约 `sampleResponse`、`fieldDescription` 字段名与必填语义一致；发现不一致时 **优先修契约与 types**，再修 Mock。

## 6. UI 与写操作

- 凡是页面上 **可点击且非纯路由跳转** 的操作（保存、提交、暂停、导出等），若尚无请求：应补 **契约 + 类型 + fetch\* + config 项 + Mock**，或将按钮标为占位并在 README 标 **P2**，避免「无契约的假成功」长期存在。

## 7. 输出交付物（每次整理必须给出）

用 Markdown 输出：

1. **「页面/路由 ↔ 契约文件」** 对照表（多级子路由分行）。
2. **「用户操作 / 场景 → 接口 → 触发时机」** 表（与各 JSON 内 `interaction` 一致，可对 README 摘要）。
3. **已对齐**的读/写接口；**缺契约 / 缺 fetch / 缺开关 / 缺 interaction / 仅有前端占位** 的项（逐条）。
4. 网关路径与 JSON 示例 URL 不一致时的 **以前端 `src/api` 实际 URL 为准** 说明。
5. 若仍存在 **子目录分散的 backend-api 或多份 config**：列出 **建议合并后的目标路径**（章节 9）。

## 8. 参考示例（本仓库）

**广告成效** 覆盖列表、系列详情、编辑、单广告详情、抽屉、操作类 POST，可参考：

- `src/views/user-growth/ad-performance`
- `src/api/ad-performance.ts`
- `src/views/user-growth/ad-performance/config/data-source.ts`

**注意**：**广告成效** 已按 **章节 9** 将契约收拢至 `ad-performance/mock/backend-api`，子路由静态数据在 `ad-performance/mock/*-data.ts`，**不再**在 `campaign-detail/...` 下建 `mock/`。其他大模块若仍分散，整理时应同样收敛。

---

## 9. 大模块多页面：契约目录与开关聚合

适用于：**同一组业务**、**多个路由页面**（列表 + 详情 + 编辑 + 弹层等），共用同一产品边界或同一 `src/api/*` 聚合文件。

### 9.1 契约 JSON 放在哪

- **所有** 接口契约 **独立 JSON** 文件，放在 **大模块（业务聚合单元）根目录** 下：
  - `src/views/<领域>/<模块根>/mock/backend-api/*.json`
- **不要** 为每个子页面再建一套 `子页面/mock/backend-api/`（小页面、纯路由页 **无单独契约目录**）；子功能用 **文件名** 区分即可，例如：
  - `03-a-table-campaign.json`、`campaign-detail-01-overview.json`、`ad-edit-01-form.json`（命名风格在模块内统一，建议在模块 README 中约定前缀表）。
- **例外**：仅存说明、索引、不含单接口 `sampleRequest`/`sampleResponse` 的文件，须在模块 README 标明为 **索引**，避免与 data-source 1:1 混淆。

### 9.2 数据源开关（须注释；多页面用多组 enum + 多个判断方法）

- **仅一份** `config/data-source.ts`，放在 **模块根** `src/views/<领域>/<模块根>/config/`；子页面 **禁止** 再建独立 `data-source.ts`。
- **代码注释（必须）**：
  - 文件头 **JSDoc**：说明本文件用途、`true`/`false` 含义、Mock 实现所在路径、`src/api` 中谁通过 `is*Mock` 读取。
  - **按页面/路由分块**：用块注释标出「列表页」「系列详情页」等，与路由或 `views` 子目录对应，便于后人改开关不分心。
  - **`Record` 每一项**：对非显而易见项加 **行尾或上一行注释**（例如该接口服务哪个 Tab、抽屉、按钮）。
- **多页面区分（必须采用「多个方法」）**：不要把所有 endpoint 塞进 **一个** enum + **一个** `isXxxMock`。应按 **子业务/子路由** 拆分：
  - **多组 `enum`**（每组对应一类页面或一类 `fetch*` 前缀），如 `ListEndpoints`、`DetailEndpoints`、`AdEditEndpoints`；
  - **多份 `Record<..., boolean>`** 与 enum 一一对应；
  - **多个 `is*EndpointMock()`**（或同职能 small function），`src/api` 中按接口所属页面调用对应判断函数，**禁止** 一个万能方法里用字符串分支兜底。
- 枚举项仍须 **按接口粒度**（每个 `fetch*` 一项），与 `mock/backend-api` 契约 1:1。

### 9.3 与仓库其他 rule 的关系

若 `module-api-mock-config.mdc` 中「每小模块一份 config」与 **9.2** 冲突：**以「同一聚合单元单一 config」为准**；整理时可在 PR 说明中注明，并推动全局文档与之一致。

---

## 10. 交互说明（每个 JSON + README 必写清）

### 10.1 契约 JSON 内：`interaction` 字段

每个 **独立接口 JSON** 根级增加 **`interaction`**（与 `fieldDescription`、`api` 并列），供联调理解 **谁在什么时机用何种参数调此接口**，例如：

```json
"interaction": {
  "triggers": [
    {
      "moment": "页面首屏初始化",
      "detail": "路由 `index.vue` 的 onMounted，与 meta、overview、当前 Tab 表格并行或串行见前端实现。",
      "prerequisite": "无 / 或依赖登录态、依赖 meta 返回后再请求等"
    },
    {
      "moment": "用户操作",
      "detail": "点击「搜索」、切换主表格 Tab、修改页码、打开抽屉并加载详情 等；写明与哪个组件事件对应。"
    }
  ],
  "defaultSelection": "若请求参数受默认筛选项、默认 Tab、路由 query 初始值影响，在此说明默认选中如何映射到 request 字段。",
  "dedupe": "可选：是否需防抖、是否需取消上一次请求、是否依赖前序接口返回的 id。"
}
```

- **`triggers`**：至少一条；**必须**覆盖 **初始化加载**（若有）与 **主要再加载场景**（筛选、Tab、分页、提交后刷新等）。
- 若某接口 **仅** 在单一场景调用（如仅按钮提交），`triggers` 中写清 **操作名 + 组件**。

### 10.2 README（`mock/backend-api/README.md`）

模块根目录下 README **必须**包含：

1. **接口清单表**：优先级 / 说明 / 逻辑 URL / **契约文件名**。
2. **按页面或路由分组的「场景 → 接口」表**：例如「列表页首屏」「详情页进入」「编辑页保存草稿」对应哪些 **POST**、哪些 JSON、`interaction` 摘要（可引用「详见某 JSON 的 `interaction`」）。
3. **目录约定**：本模块 JSON 命名前缀、是否仍存在待迁入根的子目录文件列表。

整理存量模块时，若 JSON 尚无 `interaction`：**补全**后再算契约验收通过。
