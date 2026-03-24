# 商品运营 / 订单退款分析 - Mock 说明

本目录用于「订单退款分析」在接口未就绪或联调阶段的展示与开发，并作为 **接口契约** 与 **前端类型** 的对照来源。

## 规范依据

须同时遵循：

- `.cursor/rules/api-contract-and-mock-conventions.mdc`
- `.cursor/rules/module-api-mock-config.mdc`
- `.cursor/rules/backend-fields.mdc`（如 `payment_platform` 表示支付平台）

## 目录结构

| 路径                                     | 说明                                            |
| ---------------------------------------- | ----------------------------------------------- |
| `README.md`                              | 本说明                                          |
| `backend-api/README.md`                  | 父级 API、接口清单                              |
| `backend-api/01-*.json`                  | 各接口字段解释与 sample                         |
| `api-mock/*.json`                        | 与 `backend-api` 的 `sampleResponse` 对齐的示例 |
| `../mocks/order-refund-analysis-mock.ts` | Mock 实现                                       |

## 与代码的对应关系

- 类型：`../types.ts`、`../api/order-refund-analysis.ts`（再导出）
- 数据源开关：`../config/data-source.ts`
- API：`../api/order-refund-analysis.ts`，按 config 分支 mock 或 `request`
