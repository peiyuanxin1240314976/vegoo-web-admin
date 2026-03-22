# 商品运营 / 文本管理 - Mock 说明

本目录用于「文本管理」页面在接口未就绪或联调阶段的展示与开发，并作为 **接口契约** 与 **前端类型** 的对照来源。

## 规范依据

须同时遵循：

- `.cursor/rules/api-contract-and-mock-conventions.mdc`
- `.cursor/rules/module-api-mock-config.mdc`

## 目录结构

| 路径                                   | 说明                                                |
| -------------------------------------- | --------------------------------------------------- |
| `README.md`                            | 本说明                                              |
| `backend-api/README.md`                | 父级 API、接口清单                                  |
| `backend-api/01-*.json` …              | 各接口字段解释 + `sampleRequest` / `sampleResponse` |
| `api-mock/*.json`                      | 与对应契约 `sampleResponse` 对齐的示例响应          |
| `../mocks/text-management-api-mock.ts` | Mock 实现，与 `../api/text-management.ts` 分支一致  |

## 与代码的对应关系

- 页面类型：`../types.ts`（`AppContent`、`Translation` 等）
- 数据源开关：`../config/data-source.ts`，与 `backend-api` 接口一一对应
- API 层：`../api/text-management.ts`，根据 config 分支走 mock 或 `request`
