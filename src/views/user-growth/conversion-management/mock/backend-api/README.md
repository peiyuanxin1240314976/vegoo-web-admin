## 转化管理（Conversion Management）接口 Mock 规范（给后端/联调用）

本目录为「用户增长 / 转化管理」页面整理的接口样例与字段说明，目标是：

- 每个接口 1 个 JSON 文件，统一结构：`fieldDescription` + `sampleRequest` + `sampleResponse` + `apiSuggestion`
- **字段解释尽量细**：说明类型、枚举、是否必填、业务含义与展示用途
- 前端可直接用 `sampleResponse` 作为联调对照；后端可按该结构实现真实接口

### 目录结构

- `01-mappings-list.json`：转化映射列表（分页+筛选）
- `02-mappings-stats.json`：右侧统计（类型分布/映射状态/平台分布）
- `03-mappings-create.json`：新增映射
- `04-mappings-update.json`：编辑映射
- `05-mappings-delete.json`：删除映射
- `06-mappings-batch-update-status.json`：批量启用/禁用
- `07-mappings-export.json`：导出映射表
- `08-meta-filter-options.json`：筛选下拉选项（平台/应用/转化类型/状态）
- `09-meta-dialog-options.json`：弹窗级联（广告平台→MCC→App→Conversion）
- `10-data-tab.json`：Data Tab 总接口（KPI+树表+右侧面板）
- `11-data-export.json`：Data Tab 导出（可选）

### 统一约定（非常重要）

#### 1) ID/数字字段类型

- **`conversionId` 必须用字符串**：广告平台侧 ID 可能是长整型，前端/Excel 会有精度问题，统一用 string。
- 列表行 `id` 用 string。

#### 2) 空值/全选的表达

前端筛选项目前采用“空字符串表示全部”：

- `platform: ''` 表示全部终端平台
- `appPackage: ''` 表示全部应用
- `conversionType: ''` 表示全部转化类型
- `status: ''` 表示全部状态

如果后端更倾向于用 `null/undefined`，也可以兼容；但请在接口实现中统一处理。

#### 3) 字段兼容（历史字段）

前端类型定义里保留了兼容字段（避免接口切换时页面崩）：

- `appPackage`（推荐）与 `app`（历史兼容）语义相同
- `source`（推荐，广告平台）与 `adPlatform`（历史兼容）语义相同

后端建议：

- 优先读取 `appPackage/source`
- 若缺失则回退读取 `app/adPlatform`

#### 4) 枚举值口径

- **终端平台 `platform`**：`android` | `ios`
- **广告平台 `source`**：`google` | `meta` | `tiktok` | `mintegral`
- **映射状态 `status`**：
  - `enabled`：启用（可参与统计/上报）
  - `unmapped`：未映射（UI 开关关闭时对应）
  - `duplicate`：重复（通常由后端规则判定；建议前端只展示不可手动改）
- **计费类型 `billingType`**：`CPA` | `CPI` | `CPE` | `''`（空表示未知/不适用）
- **转化展示分类 `conversionDisplayType`**：`paid` | `activation` | `behavior` | `revenue`

#### 5) 百分比与占比

本模块中存在两类占比字段：

- `typeDistribution[].value`：类型占比（0-100），可整数或小数；前端会格式化展示
- `ConversionDataRow.share`：树表行占比（0-100），当前 mock 以 `conversionCount` 口径计算（后端如要改为 value 口径需明确字段名或补充字段）

#### 6) 时间格式

- 统一 `YYYY-MM-DD`（例如 `2026-03-17`）
- `dateRange` 为 `[start,end]`（含起止日）

### 返回包裹（是否需要通用 Code/Msg）

当前 JSON 使用“业务数据直出”便于阅读；若你们网关统一包裹为：

```json
{ "code": 0, "message": "ok", "data": {...} }
```

请在实现时将 `sampleResponse` 放到 `data` 内即可，字段结构不变。
