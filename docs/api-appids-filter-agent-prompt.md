# 应用筛选请求字段 `appIds`（Agent 执行说明）

本文档供 Cursor Agent 或人工按路径改造页面时使用：**路径 + 本说明**即可执行，无需依赖历史对话。

## 业务约定（必须遵守）

1. **请求体字段名**：**`appIds`**（复数），不要用 `appId` 作为该能力的请求键名。
2. **类型**：**`string[]`**。
3. **语义**：
   - **不限 / 全部应用**：**`[]`**
   - **单选**：**`['应用ID']`**（仍为长度 1 的数组）
   - **多选**（若该页需要）：**`['id1','id2',…]`**
4. **UI 状态**：单选页面仍用 **`ref<string>`** 存当前选中的应用 ID（或 `''` 表示未选）；**仅在组装 POST `data` 时** 转为 `appIds` 数组，不要把整个 `v-model` 改成数组，除非产品要求多选。
5. **与表格列区分**：响应或表格里「广告平台名称」等字段可能仍叫 `platform`，**与筛选入参 `appIds` 无关**，不要混用。

## 推荐工具函数

建议在 [`src/utils/app-id-request.ts`](../src/utils/app-id-request.ts)（或等价路径）中维护：

- **`toAppIdsRequestBody(selectedAppId: string | undefined | null): string[]`**
  - `trim` 后为空 → `[]`
  - 否则 → `[trimmedId]`

请求里写法示例：**`appIds: toAppIdsRequestBody(appliedAppId)`**（`appliedAppId` 表示当前选中的应用 ID 字符串，名称可自定）。

## 与 `AppPlatformSearchSelect` 的配合

- **仅应用、单选**：`mode="app"`，`:setting-apps` 来自 `useCockpitMetaFilterStore().data.settingApps`；`v-model` 仍为单个字符串（appId）；提交时 **`appIds: toAppIdsRequestBody(vModel)`**。
- **应用 + 终端平台合并**：`mode="combined"` + `:platform-options` + `:setting-apps`；除 `appIds` 外，终端平台仍按该页现有 **`platform`**（或与后端约定的键）传递，以页面 `build*Params` 为准。

## 修改范围（按用户给出的路径执行）

1. **页面入口（如 `index.vue`）**

   - 查找所有 **`request.post` / `fetch*`** 的 **`data`**（或入参对象）。
   - 若当前用 **`platform`** 传「应用 ID」或临时使用 **`appId`**：改为 **`appIds`** + `toAppIdsRequestBody(...)`。
   - **`watch` 依赖数组** 若监听旧变量名，同步为 `appliedAppId` 等，避免漏刷新。

2. **同目录 `modules/*.vue`**

   - 子组件接收「当前选中应用 ID」时，props 建议 **`selectedAppId: string`**；内部请求 **`appIds: toAppIdsRequestBody(selectedAppId)`**。
   - 避免用 **`platform`** 表示应用筛选（除非语义真是终端平台且与后端一致）。

3. **`mock/backend-api/*.json`（若该模块有契约）**

   - `fieldDescription.request`：**`appIds`**，`type: "string[]"`\*\*，说明不限为 `[]`、单选为 `["…"]`。
   - `sampleRequest` 与之一致。
   - 响应体列名与筛选键名区分，勿混写。

4. **全局 `backend-fields.mdc` / `Api.*`**
   - 仅当任务明确要求「全项目统一」时再批量修改；**单页任务以该页与契约为准**。

## 自检清单

- [ ] 该路径下无遗漏：请求体仍用旧键名传应用（如单独的 `appId` 或误用 `platform` 表示应用）。
- [ ] 「未选应用」时为 **`appIds: []`**（除非与后端另有约定，如 `['']`）。
- [ ] `pnpm build` / `vue-tsc` 无新增类型错误。

## 复制给 Agent 的一行模板

将 **`[路径]`** 换成实际目录或文件（例如 `src/views/user-growth/account-performance/`）：

```text
请按仓库文档 docs/api-appids-filter-agent-prompt.md 修改应用筛选为 appIds: string[]（不限 []，单选 ['id']）。

路径：[粘贴路径]

要求：引入或复用 toAppIdsRequestBody；所有相关 POST data 使用 appIds；子组件 props 用 selectedAppId；有 mock/backend-api 则同步契约。不要改无关逻辑。
```

## 与项目规则的关系

- 若 [`backend-fields.mdc`](../.cursor/rules/backend-fields.mdc) 中仍写「筛选 `appId` 为 string」，以**后端已发布的 `appIds: string[]` 约定**为准时，应在批量迁移后更新字段表；单页改造以本文档为准。
