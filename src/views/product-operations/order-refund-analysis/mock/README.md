# 商品运营 / 订单退款分析 - Mock 说明

本目录用于「订单退款分析」在接口未就绪或联调阶段的展示与开发，并作为 **接口契约** 与 **前端类型** 的对照来源。

## 规范依据

须同时遵循：

- `.cursor/rules/api-contract-and-mock-conventions.mdc`
- `.cursor/rules/module-api-mock-config.mdc`
- `.cursor/rules/backend-fields.mdc`（契约键名 camelCase；国家 `countryCode`、支付平台 `paymentPlatform` 等）

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `README.md` | 本说明 |
| `backend-api/README.md` | 父级 API、接口清单 |
| `backend-api/01-*.json` | 各接口字段解释、`sampleRequest` / `sampleResponse`、`interaction` |
| `api-mock/*.json` | 与对应契约 `sampleResponse` 中 **业务体（常为 `data`）** 同构的示例 JSON |
| `order-refund-analysis-api-mock.ts` | Mock 实现（`mockFetch*`），命名与 `reviews-ratings-monitor` 下 `*-api-mock.ts` 一致 |

## 与代码的对应关系

- 类型：`../types.ts`
- 数据源开关：`../config/data-source.ts`（与 `backend-api` 接口一一对应）
- HTTP 封装：`@/api/product-operations/order-refund-analysis.ts`（按 config 分支 mock 或 `request`）
