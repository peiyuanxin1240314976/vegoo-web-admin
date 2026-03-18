# 转化管理（Conversion Management）接口 Mock 规范

本目录为「用户增长 / 转化管理」页面的接口定义，供后端实现与前端联调使用。

## 一、URL 与请求规范

- **规则**：采用 **模块 + 功能名称** 的路径，**全部使用 POST**，请求体为 JSON。
- **父级路径**：与前端路由一致，为 `/api/user-growth/conversion-management`（对应路由 `/user-growth/conversion-management`）。
- **功能路径**：kebab-case，见下表。

| 优先级 | 功能说明 | URL（POST） | 对应文件 |
| --- | --- | --- | --- |
| **P0** | 筛选下拉选项 | `/api/user-growth/conversion-management/meta-filter-options` | 08 |
| **P0** | 映射列表（分页） | `/api/user-growth/conversion-management/mappings-list` | 01 |
| **P0** | 映射统计 | `/api/user-growth/conversion-management/mappings-stats` | 02 |
| **P0** | 弹窗级联选项 | `/api/user-growth/conversion-management/meta-dialog-options` | 09 |
| **P0** | 映射详情（编辑回显） | `/api/user-growth/conversion-management/mappings-detail` | 12 |
| **P0** | Data Tab 总数据 | `/api/user-growth/conversion-management/data-tab` | 10 |
| **P1** | 转化展示分类选项 | `/api/user-growth/conversion-management/meta-conversion-display-type-options` | 13 |
| **P2** | 新增映射 | `/api/user-growth/conversion-management/mappings-create` | 03 |
| **P2** | 编辑映射 | `/api/user-growth/conversion-management/mappings-update` | 04 |
| **P2** | 删除映射 | `/api/user-growth/conversion-management/mappings-delete` | 05 |
| **P2** | 批量启用/禁用 | `/api/user-growth/conversion-management/mappings-batch-update-status` | 06 |
| **P2** | 导出映射表 | `/api/user-growth/conversion-management/mappings-export` | 07 |
| **P2** | Data Tab 导出 | `/api/user-growth/conversion-management/data-export` | 11 |

**优先级规则**：**先获取数据为主（P0/P1），后操作数据为辅助（P2）**。

- **P0**：页面首屏或 Tab 切换必须的查询（列表、统计、筛选选项、详情、Data 总接口）。
- **P1**：非首屏必需但常用的配置类获取（如展示分类选项）。
- **P2**：增删改、批量操作、导出等写操作。

---

## 二、各接口入参与出参概要

### P0 - 获取数据（主）

#### 1. 筛选下拉选项 `POST /api/user-growth/conversion-management/meta-filter-options`

- **入参**：无（或空 body `{}`）。
- **出参**：
  - `platformOptions`: `{ label: string, value: string }[]` — 终端平台
  - `appOptions`: `{ label: string, value: string }[]` — 应用
  - `conversionTypeOptions`: `{ label: string, value: string }[]` — 转化类型
  - `statusOptions`: `{ label: string, value: string }[]` — 映射状态（可选）

---

#### 2. 映射列表 `POST /api/user-growth/conversion-management/mappings-list`

- **入参**：
  - `current?: number` — 页码，默认 1
  - `size?: number` — 每页条数，默认 20
  - `platform?: string` — `''` | `android` | `ios`
  - `appPackage?: string`、`app?: string` — 应用（空为全部，后端优先取 appPackage）
  - `conversionType?: string` — 转化类型，空为全部
  - `status?: string` — `''` | `enabled` | `duplicate` | `unmapped`
  - `keyword?: string` — 关键字搜索
- **出参**：
  - `records`: 列表项数组（见 01 的 ConversionMappingItem）
  - `current`, `size`, `total`: 分页信息

---

#### 3. 映射统计 `POST /api/user-growth/conversion-management/mappings-stats`

- **入参**：与列表筛选一致（无分页）：`platform`、`appPackage`/`app`、`conversionType`、`status`、`keyword`。
- **出参**：
  - `typeDistribution`: `{ name: string, value: number, count?: number }[]` — 类型分布（value 0–100）
  - `mappingStats`: `{ mapped: number, duplicate: number, unmapped: number }`
  - `platformStats`: `{ android: number, ios: number }`

---

#### 4. 弹窗级联选项 `POST /api/user-growth/conversion-management/meta-dialog-options`

- **入参**：
  - `source?: string`（或 `adPlatform`）— `google` | `meta` | `tiktok` | `mintegral`
  - `mccAccount?: string`、`appPackage?: string` — 级联筛选
- **出参**：
  - `adPlatforms`: `{ label, value }[]`
  - `mccAccounts`、`apps`: `{ label, value }[]`
  - `conversions`: `{ conversionName, conversionId, billingType?, platformConversionType?, extra? }[]`（conversionId 必须为 string）

---

#### 5. 映射详情 `POST /api/user-growth/conversion-management/mappings-detail`

- **入参**：`{ id: string }` — 映射记录 ID。
- **出参**：单条映射完整字段（id、platform、source、mccAccount、appPackage、conversionName、conversionId、platformConversionType、systemDisplayName、conversionDisplayType、billingType、status、remarks、createdAt、updatedAt 等），用于编辑回显。conversionId 为 string。

---

#### 6. Data Tab 总数据 `POST /api/user-growth/conversion-management/data-tab`

- **入参**：
  - `dateRange?: [string, string]` — 日期范围 YYYY-MM-DD
  - `platform`、`appPackage`/`app`、`source`/`adPlatform`、`conversionType` — 筛选，空为全部
- **出参**：
  - `kpi`: `{ conversionCount, conversionValue, averageValue, activeTypeCount }`，每项 `{ value, deltaPercent }`
  - `tableRows`: 三层树表 `ConversionDataRow[]`（level: group | account | conversion，含 conversionCount、conversionValue、share、trendPoints、children）
  - `sidePanels`: `{ typeDistribution, top10, valueTrend30d, accountShare }`

---

### P1 - 获取数据（辅）

#### 7. 转化展示分类选项 `POST /api/user-growth/conversion-management/meta-conversion-display-type-options`

- **入参**：无或 `{}`。
- **出参**：`options`: `{ label: string, value: 'paid'|'activation'|'behavior'|'revenue' }[]`。
- 若不提供，前端可写死枚举。

---

### P2 - 操作数据（辅助）

#### 8. 新增映射 `POST /api/user-growth/conversion-management/mappings-create`

- **入参**：source、adPlatform、mccAccount、appPackage、conversionName、conversionId?、platformConversionType?、conversionDisplayType?、systemDisplayName、billingType?、status?、remarks?。
- **出参**：`{ success: boolean, id: string, message?: string }`。

---

#### 9. 编辑映射 `POST /api/user-growth/conversion-management/mappings-update`

- **入参**：`{ id: string, systemDisplayName: string, conversionDisplayType?: string, status?: string, remarks?: string }`。
- **出参**：`{ success: boolean, message?: string }`。

---

#### 10. 删除映射 `POST /api/user-growth/conversion-management/mappings-delete`

- **入参**：`{ id: string }`。
- **出参**：`{ success: boolean, message?: string }`。

---

#### 11. 批量启用/禁用 `POST /api/user-growth/conversion-management/mappings-batch-update-status`

- **入参**：`mode: 'byFilter'|'byIds'`；`byFilter` 时传 `filters`（与列表一致），`byIds` 时传 `ids: string[]`；`targetStatus: 'enabled'|'unmapped'`。
- **出参**：`{ success: boolean, affectedCount: number, skippedCount?, skippedReason?, skippedIds?, message? }`。

---

#### 12. 导出映射表 `POST /api/user-growth/conversion-management/mappings-export`

- **入参**：与列表筛选一致 + `format?: 'xlsx'|'csv'`。
- **出参**：方案 A 文件流；或方案 B `{ downloadUrl: string, expireAt?: string }`。

---

#### 13. Data Tab 导出 `POST /api/user-growth/conversion-management/data-export`

- **入参**：与 data-tab 筛选一致 + `dateRange` + `format?: 'xlsx'|'csv'`。
- **出参**：同 mappings-export（文件流或 downloadUrl）。

---

## 三、统一约定（与各 JSON 一致）

- **conversionId** 一律使用 **string**，避免长整型精度问题。
- **空/全选**：筛选字段用空字符串 `''` 表示全部；若后端用 null/undefined 需在实现中统一兼容。
- **兼容字段**：`appPackage`（推荐）与 `app`、`source`（推荐）与 `adPlatform` 语义相同，后端优先取推荐字段。
- **枚举**：platform `android`|`ios`；source `google`|`meta`|`tiktok`|`mintegral`；status `enabled`|`unmapped`|`duplicate`；conversionDisplayType `paid`|`activation`|`behavior`|`revenue`。
- **日期**：YYYY-MM-DD；dateRange 为 `[start, end]` 含起止。
- 若网关统一包裹为 `{ code, message, data }`，将上述出参放入 `data` 即可。

每个接口的字段详解与示例见对应编号的 JSON 文件（`fieldDescription`、`sampleRequest`、`sampleResponse`）。
