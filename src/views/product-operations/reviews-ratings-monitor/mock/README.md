# 商品运营 / 评论与评分监控 - Mock 说明

本目录用于「评论与评分监控」页面在接口未就绪或联调阶段的展示与开发，并作为 **接口契约** 与 **前端类型** 的对照来源。

## 规范依据

须同时遵循：

- `.cursor/rules/api-contract-and-mock-conventions.mdc`（Mock 目录、`backend-api` 契约格式、按 UI 拆接口）
- `.cursor/rules/module-api-mock-config.mdc`（config 必放模块下、按接口 mock/remote 开关）
- `.cursor/rules/backend-fields.mdc`（业务字段语义：如 `s_app_id`、`s_country_code`、`platform` 等）

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `README.md` | 本说明 |
| `backend-api/README.md` | 父级 API、接口清单、优先级 |
| `backend-api/01-*.json` … | 各接口字段解释 + `sampleRequest` / `sampleResponse` |
| `api-mock/*.json` | 与对应 `backend-api/*.json` 的 `sampleResponse` 对齐的示例响应 |
| `api-mock/*.json` | 与 backend-api sampleResponse 对齐的示例 JSON |
| `../mocks/review-monitor-api-mock.ts` | Mock 实现，引用 api 中的 mockSummaryData、mockReviewList、mockTemplates |

## 与代码的对应关系

- 页面类型：`../api/reviewMonitor.ts`（`SummaryData`、`ReviewListData`、`ReplyTemplate` 等）
- 数据源开关：`../config/data-source.ts`，与 `backend-api` 接口一一对应
- API 层：`../api/reviewMonitor.ts`，根据 config 分支走 mock 或 `request`
