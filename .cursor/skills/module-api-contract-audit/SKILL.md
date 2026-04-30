---
name: module-api-contract-audit
description: >-
  Audits and organizes per-module HTTP API contracts, mock/backend-api JSON, README inventories, config data-source switches, fetch* in src/api, and UI coverage across routes. Enforces full sampleResponse, POST-only JSON APIs (except documented GET exceptions e.g. cockpit meta), and URL shape route+module+feature. Enforces reuse of GET /api/v1/datacenter/analysis/cockpit/meta-filter-options (no params): no duplicate meta-filter-options JSON; pages read useCockpitMetaFilterStore().data; document in README only per §0.6. Maps each contract to reachable UI; flags orphaned or unreachable surfaces for human/product confirmation before deleting or changing. Use when the user asks to 整理/梳理/校验/补全 项目或某业务模块的 接口契约、mock 契约、backend-api、或检查某模块是否少接口；或提到「模块接口与页面对齐」「契约与 fetch 对照」 「返回示例」「sampleResponse」「表列枚举写全」「全部 POST」「接口路径命名」、大模块多页面契约目录聚合、 数据源开关统一、data-source 注释、多 enum 多 isMock、交互说明、初始化加载、默认选中、契约与页面可达/入口、字段字典、backend-fields、startDate、endDate、返回体统一、sampleResponse 形态、cockpit meta-filter-options、公用下拉。
---

# 模块接口契约整理（工作流）

执行前须同时遵守仓库规则：`.cursor/rules/backend-fields.mdc`（**整理前须用工具 Read 全文或由用户 `@` 该文件**）、`api-contract-and-mock-conventions.mdc`、`module-api-mock-config.mdc`、`project-conventions.mdc` 中与 Mock、config、`fetch*` 相关的条款。

## 0. 契约硬性要求（本项目必须满足）

整理或新增契约时 **逐条验收**，不满足则视为未完工：

### 0.1 完整的接口返回示例

- 每个 `mock/backend-api/*.json` 必须包含 **`sampleResponse`**，且与 `fieldDescription` 中 **`response` / 嵌套类型** 语义一致：字段齐全、嵌套对象/数组至少有一项 **贴近真实结构** 的示例，禁止用空对象、`...` 或未解释的大字段糊弄联调。
- 若网关统一包裹 `{ code, message, data }`：在 `fieldDescription` 或 `_comment` / `apiSuggestion` 中写明；`sampleResponse` 须写清 **业务体**（即 `data` 内形态），或与 README 约定「本文件 `sampleResponse` 表示 unwrap 后的 `data`」并保持全模块一致。
- **表格类响应**：凡 **`sampleResponse` 含页面主表格数据数组**（如 `records` / `items` / `rows` / `list` 等），该数组 **至少 3 条完整示例**；树表则完整展示节点 **合计不少于 3 个**。细则与例外见 **`api-contract-and-mock-conventions.mdc`**「表格类 sampleResponse 示例条数」。
- **表格/列表中的闭合 `enum`**：主表、树表行或 meta `options` 凡在 `fieldDescription` 中带 **`enum` 列表**，**`sampleResponse` 须在示例中写全各取值**（按字段分列覆盖即可，无需全组合）。细则与例外见 **`api-contract-and-mock-conventions.mdc`**「表格/列表示例中的枚举须写全」。

### 0.2 请求 URL：路由 + 模块名 + 功能

- 路径须 **可从前端路由反推业务归属**，层级为：**父级路径（与用户可见的路由模块一致）** + **子分组（如 meta / overview / table / export）** + **`endpoint`（kebab-case，体现单一功能）**。
- 示例（逻辑形态，非写死网关前缀）：列表模块 `.../user-growth/ad-performance/overview`；子页 `.../user-growth/ad-performance/campaign-detail/ad-edit/save-draft`。具体前缀以 **`src/api` 中常量 + `request` 实际 URL** 为联调准绳，契约 `api.url` / README 与之一致或在文中标注差异。
- **禁止** 含糊的聚合路径（如单一 `getData`）承载多个 UI 形态；功能名须在路径或末段 endpoint 上可读。

### 0.3 一律 POST

- **所有** 契约接口 **`api.method` 为 `POST`**，请求体为 **JSON**（`sampleRequest` 给出的结构）；前端对应使用 `request.post`（或项目统一封装中等价写法）。
- 新模块、新契约 **不得** 再用 GET + query 作为主约定；历史 GET 若存在，整理时可在交付物中单列「待迁移为 POST」项，不扩大 GET 面。
- **明确例外（不写进模块 JSON 契约）**：公用 **`GET .../analysis/cockpit/meta-filter-options`**（**无 query/body**，`fetchCockpitMetaFilterOptions`）为全项目顶栏 meta，**不**适用本条 POST 约定；详见 **§0.6** 与 **`api-contract-and-mock-conventions.mdc`** 篇首。

### 0.4 字段与数据字典对齐

- 整理前用工具 **阅读** `.cursor/rules/backend-fields.mdc`（或由用户 `@` 该文件）；**禁止**仅凭记忆命名。
- 核对本模块契约 `fieldDescription` 中请求/响应字段是否与字典一致；存在同义不同名时单列 **合并建议**。
- **入参日期范围**：凡带日期范围的请求，入参键名须为 **`startDate`** / **`endDate`**（见 `backend-fields.mdc`「接口请求 · 日期范围」）；历史别名字段在交付物中列 **「迁移为 startDate/endDate」**。
- 大范围字段改名或契约结构重组时，交付物中单列影响面与迁移计划，并与联调方对齐后再改。

### 0.5 示例返回体结构统一（同模块）

同一业务聚合单元（模块根 `mock/backend-api`）内，**相同 UI 语义**的接口，**`sampleResponse` 所描述的业务体**尽量形态一致：

- **分页列表**：`list` / `items` / `rows` + `total` + `page` / `pageSize` 等与存量契约对齐，避免同模块多套键名。
- **KPI / 卡片**：指标数组元素结构一致。
- **趋势 / 时序**：点元素形状全模块统一（如 `{ t_date, ... }` 与字典一致后沿用）。
- **meta 选项**：选项项结构统一（如 `{ label, value }`）。
- **网关包裹**：`sampleResponse` 表示 `data` 内还是整包与模块 README **单一约定**（见 **§0.1**）。
- **新增接口**：优先对齐本模块已有 JSON；**存量不一致**时交付物单列 **「sampleResponse 结构收敛建议」**。

### 0.6 公用 cockpit `meta-filter-options`（硬性：无独立 JSON）

- **接口**：**`GET`** `/api/v1/datacenter/analysis/cockpit/meta-filter-options`（**无参**；底层 **`fetchCockpitMetaFilterOptions`** → `request.get`，`@/api/cockpit-meta-filter`；类型 **`CockpitMetaFilterOptionsData`**，`@/types/cockpit-meta-filter`）。与响应 **同构** 的顶栏下拉（应用 / 终端平台 / 广告平台 / 国家等）**不得**在本模块 `mock/backend-api` 新增 `*meta-filter-options*.json` 或复制等价契约。
- **页面 / 新 Mock 场景写法（直接取数）**：业务页与联调说明中，顶栏选项 **以读 Pinia 为准**：**`useCockpitMetaFilterStore().data`** 或 **`useCockpitMetaFilterOptions().cockpitMeta`**（`src/composables/use-cockpit-meta-filter.ts`），使用其中的 **`appOptions` / `platformOptions` / `sourceOptions` / `countryOptions`**。**不要**把「页面里再请求一次该 URL」或「每个模块单独 mock 一份 meta JSON」当作默认方案；预取与缓存见 **`api-contract-and-mock-conventions.mdc`**。**`ensureLoaded()`** 仅兜底，**不是**页面常规要调用的入口。
- **文档义务**：在该模块 **`mock/backend-api/README.md` 接口清单** 中单列一行（优先级、说明、完整逻辑 URL、**数据读取：`useCockpitMetaFilterStore().data`**），**契约文件列写「无 JSON」**，并引用 **`src/views/user-growth/paid-analysis/mock/backend-api/README.md` 附录 A**（全项目规范锚点）或在本 README 用简短附录复述要点；**「场景 → 接口」表**写清：顶栏选项来自 **全局 Store 中的公用 meta**（守卫预载 + session），**不要求**为该能力建 JSON 根级 `interaction`。
- **独有维度例外**：仅当顶栏还有 **本页独有** 筛选项时，**单独**为独有能力维护契约 JSON；**禁止**把与 cockpit 同构的四类选项再次写进契约。
- **整理交付物**：对照表与清单中须 **显式标注** 该能力为 **公用 Store 数据、无 JSON**；若发现与同构顶栏重复的 `*meta-filter-options*.json`，交付物中单列 **「应删除或收敛为文档引用」**。

### 0.7 不阻塞主流程：接口无数据也要可展示（硬性）

整理/对接契约时，必须确保页面在以下场景 **仍可进入并展示 UI**，不得因“接口未返回/无数据/失败”导致白屏或核心功能不可用：

- **接口未就绪/网络异常**：页面可展示骨架/占位与错误提示，并允许用户继续操作（切换 Tab、改筛选、重试请求）。
- **接口返回空数据**：列表/表格/图表应展示空态，但页面结构（筛选栏、Tab、按钮、布局）保持完整。

对契约与实现的验收点：

- **契约必须说明空数据形态**：在 `fieldDescription.response` 或 `apiSuggestion` 写清关键字段的空值策略（数组 `[]`、计数 `0`、对象字段可选/缺失语义），并强调 **shape 稳定**（无数据仍返回同结构）。
- **前端必须有默认结构兜底**：`types` 与页面 state 初始化采用可渲染默认值（如 `records: []`、`total: 0`、`series: []`），避免 `undefined/null` 引发渲染崩溃。
- **交付物必须标注**：在「场景 → 接口 → 触发时机」表中补一列/备注说明该接口的 **空态/错误兜底展示**（写清 UI 呈现，而不是只写“无数据”）。

## 1. 划定模块边界

- 从 **Vue Router**（如 `src/router/modules/*.ts`）列出该模块下所有 **path/component**，含子路由（详情页、编辑页、抽屉跳转页等）。
- 模块根目录一般为 `src/views/<大模块>/<页面>/`，子页面可能有独立 `index.vue`（如 `campaign-detail/ad-edit`）。

## 2. 盘点页面实际调用的 API

- 在对应 `views/...` 下 `grep`：`fetch`、`request.post`、`from '@/api`。
- 列出每个 **路由/页面** → **fetch\* 或请求函数**；注意 composable 间接调用。**公用 cockpit 顶栏 meta**：页面若只读 **`useCockpitMetaFilterStore().data`**，整理时标注 **「数据来自全局 Store，非本页独立 fetch」**，勿误判为缺接口。

### 2.1 契约与页面展示、业务入口（须对齐；不可达须交需求方判断）

审核或整理契约时，**每个接口应能对应到真实 UI**：表格/图表/KPI/弹窗/按钮结果等有展示或触发，而不是仅存在于 JSON 或 `fetch*` 定义中。

- **交付对照**：在输出中写明 **契约文件 / URL → 路由 path 或页面组件 → 用户如何进入**（菜单、Tab、按钮、详情跳链等），与 **`interaction.triggers`**、README「场景 → 接口」一致。
- **以下情况禁止由 Agent 擅自删除契约、改路径或删 `fetch*`**，须在交付物中单列 **「待需求 / 产品确认」**，写清依据（例如：路由未挂载、`index.vue` 未引用该页、菜单无入口、全仓无组件调用该 `fetch*`、仅有历史 Mock 等），**由需求方判断**后再改：
  - 业务上 **从菜单/路由无法进入** 的页面及其契约；
  - 契约或接口 **在现有界面中无任何展示或操作入口**（数据无处可渲染、无初始化/无用户操作触发）。
- 可标注为 **「疑似冗余」** 或 **「待确认是否下线」**，与 **「缺契约 / 缺 fetch」** 区分，避免与验收清单混为一谈。

## 3. 盘点契约与文档

- 查找 `src/views/<模块>/.../mock/backend-api/**/*.json` 与 **`README.md` 接口清单**。
- **大模块多页面** 时目录须符合 **章节 9**（契约与开关聚合在模块根）；存量若在子目录分散，整理交付物中须标 **待迁移路径**。
- **每个** 承担「接口契约集合」的 `backend-api` 目录须有 **`README.md`**；纯索引说明可合并进根目录 README。
- 核对：**一接口一独立 JSON**（含 `fieldDescription`、`sampleRequest`、**完整** `sampleResponse`、`api`、**章节 10 `interaction`**）；复杂表格/详情应按 UI 拆分；并符合 **章节 0**。**例外**：与 **§0.6** 公用 cockpit `meta-filter-options` 同构的顶栏下拉 **不** 使用 JSON，仅在 README 标注（见 **§0.6**）。

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
2. **「用户操作 / 场景 → 接口 → 触发时机」** 表（与各 JSON 内 `interaction` 一致，可对 README 摘要；**§0.6** 公用顶栏 meta 无 JSON 时以 README 描述为准）。
3. **已对齐**的读/写接口；**缺契约 / 缺 fetch / 缺开关 / 缺 interaction / 仅有前端占位** 的项（逐条）。
4. 网关路径与 JSON 示例 URL 不一致时的 **以前端 `src/api` 实际 URL 为准** 说明。
5. 若仍存在 **子目录分散的 backend-api 或多份 config**：列出 **建议合并后的目标路径**（章节 9）。
6. **无 UI 入口或业务不可触达**的契约 / `fetch*`（若有）：逐条列文件、URL、判定理由，标注 **须需求确认**；**不**计入「已对齐」清单，**不**在未获确认前建议删除（见 **§2.1**）。**同条须覆盖**：**公用 cockpit meta** 是否已在 README 按 **§0.6** 标注 **无 JSON**、并写明 **页面读 `useCockpitMetaFilterStore().data`**；若存在与同构顶栏重复的 `*meta-filter-options*.json`，单列收敛建议。
7. **「字段 ↔ 数据字典对齐」**表：列 `契约字段名` | `backend-fields 条目或待定` | `同义/历史名` | `所在契约 JSON` | `备注（是否建议补字典）`；并勾选 **入参日期是否均为 startDate/endDate**（否则在表中注明例外与迁移建议）。**公用 cockpit meta** 字段对齐以 **`cockpit-meta-filter` 类型** + **`backend-fields.mdc`** 为准，**不**要求契约 JSON 行。
8. **（可选）「sampleResponse 结构收敛建议」**：同模块内同类 UI 响应形态冲突、建议标准形态、必要时单列影响评估与迁移顺序。
9. **（验收勾选）表列 / 树节点枚举覆盖**：主表、树表及 meta `options` 中带闭合 **`enum`** 的字段，是否在 **`sampleResponse` 示例中写全各取值**（见 **`api-contract-and-mock-conventions.mdc`**「表格/列表示例中的枚举须写全」）；未覆盖的逐契约列明。

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
- **例外（硬性）**：**§0.6** 公用 cockpit `meta-filter-options` **永不**在本模块 `backend-api` 落独立 JSON；**仅 README 文档标注**（见 **`api-contract-and-mock-conventions.mdc`**）。

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

### 10.1.1（补充规则）UI「切换」是否需要传参

整理契约时，遇到页面上存在 **Tab / 切换按钮 / 下拉切换维度** 等交互，必须先判定该切换属于哪一类，并在契约 `interaction` 与 README 的「场景 → 接口」里写清楚：

- **A. 前端本地切换（不重拉接口）**

  - **表现**：切换只改变前端展示（如切换展示字段、切换从同一份响应里选不同数组），不触发重新请求。
  - **契约形态建议**：接口可一次性返回多套数据（例如 `tab_amount`/`tab_rate` 两套序列），由前端切换选择展示。
  - **文档要求**：`interaction.triggers` 明确写「切换不请求，仅前端渲染切换」，并说明默认选中（`defaultSelection`）。

- **B. 切换即请求（需要传参）**
  - **表现**：切换会改变数据口径/范围/排序/分页，或数据量大不适合一次性返回，切换应触发重新请求。
  - **契约形态建议**：在 `fieldDescription.request` 增加明确字段（例如 `tab`/`metric`/`row_dim`/`col_dim` 等），并在 `sampleRequest`/`api.requestBody` 中体现。
  - **文档要求**：`interaction.triggers` 写清「切换触发请求」以及入参如何映射（例如 Tab 值到 `metric`），必要时补充防抖/取消请求策略（`dedupe`）。

### 10.2 README（`mock/backend-api/README.md`）

模块根目录下 README **必须**包含：

1. **接口清单表**：优先级 / 说明 / 逻辑 URL / **契约文件名**（或与 **§0.6** 一致时 **明确写「无 JSON」** 并引用付费分析 **附录 A**）。
2. **按页面或路由分组的「场景 → 接口」表**：例如「列表页首屏」「详情页进入」「编辑页保存草稿」对应哪些 **POST**、哪些 JSON、`interaction` 摘要（可引用「详见某 JSON 的 `interaction`」）。
3. **目录约定**：本模块 JSON 命名前缀、是否仍存在待迁入根的子目录文件列表。

整理存量模块时，若 JSON 尚无 `interaction`：**补全**后再算契约验收通过。
