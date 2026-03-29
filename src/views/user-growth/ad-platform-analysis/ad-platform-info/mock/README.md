# 广告平台信息 - Mock 说明

本目录为 **用户增长 → 广告平台分析 → 广告平台信息详情**（路由：`/user-growth/ad-platform-analysis/ad-platform-info?id=<s_campaign_id>`）提供本地 Mock 与 **接口契约**。

## 规范依据

- `.cursor/rules/api-contract-and-mock-conventions.mdc`
- `.cursor/rules/module-api-mock-config.mdc`（数据源开关见 **`../config/data-source.ts`**，与下方 **每个契约** 一一对应）

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `README.md` | 本文件 |
| `backend-api/README.md` | 父级 API、接口清单表 |
| `backend-api/01-platform-summary.json` … `08-campaign-table.json` | 按页面模块拆分的契约（各含 `fieldDescription`、`sampleRequest`、`sampleResponse`） |
| `api-mock/01-*.json` … `08-*.json` | 与各契约 `sampleResponse` 对齐的静态示例 |
| `index.ts` | 页面当前使用的 TS 聚合 Mock（`MOCK_*` + `buildMockAdPlatformInfoPageData`）；接入多接口后可在 composable 中并行 `fetch*` 再组装为 `AdPlatformInfoPageData` |

## 与代码的对应关系

- 类型：`../types.ts`（`AdPlatformInfoPageData` 为聚合根）
- 加载：`../composables/useAdPlatformInfo.ts`
