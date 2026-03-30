# 广告平台信息 - Mock 说明

本目录为 **用户增长 → 广告平台分析 → 广告平台信息详情**（路由：`/user-growth/ad-platform-analysis/ad-platform-info?id=<s_campaign_id>`）提供本地 Mock 与 **接口契约**。

## 规范依据

- `.cursor/rules/api-contract-and-mock-conventions.mdc`
- `.cursor/rules/module-api-mock-config.mdc`（数据源开关见 **`../config/data-source.ts`**，与下方 **每个契约** 一一对应）

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `README.md` | 本文件 |
| `backend-api/README.md` | 父级 API、接口清单、场景 → 接口表 |
| `backend-api/01-platform-summary.json` … `08-campaign-table.json` | 契约源文件（含 `interaction`、`sampleResponse` 等）；**不要求**另建重复 JSON |
| `ad-platform-info-api-mock.ts` | 分接口 Mock，命名对齐 `ad-performance-api-mock.ts`，供 `src/api/user-growth/ad-platform-info.ts` 在开关为 Mock 时调用 |
| `index.ts` | 聚合静态数据（`MOCK_*` + `buildMockAdPlatformInfoPageData`）；`ad-platform-info-api-mock` 按块从中切片 |

## 与代码的对应关系

- 类型：`../types.ts`（`AdPlatformInfoPageData` 为聚合根）
- 加载：`../composables/useAdPlatformInfo.ts`（并行调用 `fetchAdPlatformInfo*`）
