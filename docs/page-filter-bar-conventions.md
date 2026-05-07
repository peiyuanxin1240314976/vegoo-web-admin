# 页面顶栏筛选规则

Cursor 规则 **`.cursor/rules/page-filter-bar-conventions.mdc`** 为 **`alwaysApply: true`**：凡任务涉及顶栏/筛选相关实现，Agent 应自动按本文执行，**无需**在对话中 `@` 该规则文件。

本文档沉淀业务页 **顶栏 / 筛选条** 与驾驶舱 **同构维度**（应用、日期、广告平台、国家、终端平台等）的一致写法，供新页面与重构照抄。**不重复**字段字典与契约全文：维度键名、camelCase、「全部」传空串等仍以 [`backend-fields.mdc`](../.cursor/rules/backend-fields.mdc) 为准；公用 cockpit **`GET`** `meta-filter-options`、禁止模块内重复契约 JSON 仍以 [`api-contract-and-mock-conventions.mdc`](../.cursor/rules/api-contract-and-mock-conventions.mdc) 为准。

---

## 1. 适用范围

- 适用于顶栏或筛选区包含：**应用**、**日期**（单日或区间）、**广告平台**、**国家**、**终端平台**、以及与本页业务无关且与驾驶舱 **选项形态一致** 的其他维度。
- 若页面有 **独有** 维度（如转化类型、商品类型），在契约与本页内单独维护；**不得**把 cockpit 四类通用选项再复制进模块 `mock/backend-api`。

---

## 2. 强制：应用与日期必须用现有公共组件

| 能力 | 必须使用 | 路径 |
| --- | --- | --- |
| 应用（单选/多选，与 `settingApps` 对齐） | `AppPlatformSearchSelect` | `src/components/filter/app-platform-search-select.vue` |
| 日期（单日或区间、快捷选项等） | `AppDatePicker` | `src/components/core/forms/AppDatePicker.vue` |

- **禁止**用裸 `ElSelect` + 手写应用列表替代 `AppPlatformSearchSelect`（除非经评审明确不适用）。
- **禁止**用裸 `ElDatePicker` 零散拼装，导致与全局 shortcuts、权限或「应用当前时间」口径脱节；日期语义须遵守 [`app-now-date.mdc`](../.cursor/rules/app-now-date.mdc)（业务「今天」用 `@/utils/app-now`，勿裸 `new Date()`）。

与 [`project-conventions.mdc`](../.cursor/rules/project-conventions.mdc)「先查公共组件再写模块」一致。

---

## 3. 强制：广告平台 / 国家 / 终端平台选项来自 Pinia（cockpit meta）

- **数据源**：`useCockpitMetaFilterStore()`（或 `storeToRefs` 的 `data`），字段与 [`src/types/cockpit-meta-filter.ts`](../src/types/cockpit-meta-filter.ts) 对齐，典型包括：
  - **广告平台**：`sourceOptions` → 请求体维度键名常为 **`source`**（string 枚举）。
  - **终端平台**：`platformOptions` → **`platform`**。
  - **国家**：`countryOptions` → **`countryCode`**（与契约一致；见下文存量例外）。
  - **应用列表**：优先把 **`settingApps`** 作为 `AppPlatformSearchSelect` 的 `:setting-apps`（或与组件文档一致的 prop）。
- **禁止**：为上述维度单独新建「整页 meta」HTTP，或在页面内长期写死选项代替 Pinia。仅在 meta 未就绪时可保留 **降级** 占位，且选项项形态仍与 `CockpitMetaOptionItem`（`label` / `value`）一致。
- **路由与初始化**：meta 由路由守卫预加载 + `sessionStorage`；页面仅在必要时调用 **`ensureLoaded()`** 兜底，勿把「再拉一遍 meta」当作常规入口（见 `api-contract-and-mock-conventions`）。

封装读取可优先使用项目已有 composable（如 `useCockpitMetaFilterOptions`），与直接读 Store 等价语义即可。

---

## 4. 统一：`ElSelect` 展示「全部」、`clearable`、列表去重

与同构维度下拉保持一致时，推荐 checklist：

1. **首项「全部」**：例如 `<ElOption :label="tr('adPerformance.filterAll', '全部')" value="" />`（使用项目统一的单一 i18n key，避免各页中文硬编码分叉）。
2. **列表数据**：用 **computed** 在 meta 返回的数组上 **过滤** 掉 `value` 为 **`''`** 或 **`'all'`**（大小写不敏感）的项，避免与首项出现两条「全部」。
3. **清除**：`clearable`；使用 `:model-value` + `@update:model-value`，在回调内 **`v ?? ''`**，避免清除得到 `undefined` 与空串语义不一致。
4. **请求体**：不限定该维度时统一为 **`""`**，与 `backend-fields`「筛选『全部』」一致；可与项目内 **`emptyIfAll` / `toUnlimitedDimension`** 等 helper 对齐。UI 层可用 `value: 'all'` 表示选中态，**提交前**须映射为 **`""`**（见 `backend-fields`「与 meta-filter-options 联动」）。

参考实现（任选其一跟进）：`src/views/user-growth/overall-recovery/index.vue`、`src/views/business-insight/profit-analysis/BusinessInsight.vue`、`src/views/business-insight/ecpm-analysis/EcpmDashboard.vue`。

---

## 5. 默认选中行为（产品口径）

- **维度默认「全部」**：`ref` / 状态初始为 **`''`**；meta 加载后 **不要**自动改为第一项真实枚举，除非产品明确要求「默认选中某一广告平台」等。
- **默认应用**：若由 `AppPlatformSearchSelect` 或页面逻辑在首次加载时同步到首个应用，沿用各页现有 **`watch` + 首次查询** 模式即可。

---

## 6. 存量契约键名与 `countryCode` 共存

- **新建 / 修订契约与 POST body**：国家筛选键名应为 **`countryCode`**（小写 ISO 3166-1 alpha-2），见 `backend-fields`。
- **个别存量页面**若仍使用历史字段名（如文档或代码中出现的 **`s_country_code`**），以 **该页契约与 `fetch*` 实际入参** 为准；**选项来源仍为 cockpit Pinia** 的 `countryOptions`，仅在组装请求时映射键名。重构时应迁移到 `countryCode`，与字典一致。

---

## 7. 自检清单（开发 / Code Review）

- [ ] 应用：`AppPlatformSearchSelect`；日期：`AppDatePicker`
- [ ] 广告平台 / 国家 / 终端平台选项来自 **cockpit Pinia**，未单独封装重复 meta 请求
- [ ] 「全部」仅 **`value=""`**，下拉列表已过滤空串 / `all` 占位
- [ ] `clearable` + `update` 回调内归一为 **`''`**
- [ ] POST 入参与 **`backend-fields`**、模块 **`mock/backend-api`** 一致；日期范围为 **`startDate` / `endDate`**

---

## 相关文件索引

| 说明                   | 路径                                                   |
| ---------------------- | ------------------------------------------------------ |
| Cockpit meta Store     | `src/store/modules/cockpit-meta-filter.ts`             |
| Meta 类型              | `src/types/cockpit-meta-filter.ts`                     |
| 应用筛选组件           | `src/components/filter/app-platform-search-select.vue` |
| 日期组件               | `src/components/core/forms/AppDatePicker.vue`          |
| Meta HTTP（GET，无参） | `src/api/cockpit-meta-filter.ts`                       |
