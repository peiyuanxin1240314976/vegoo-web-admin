# 广告平台分析（大屏）- Mock 与契约说明

本目录归属路由：`/user-growth/ad-platform-analysis`（广告平台分析大屏）。

## 规范依据

- `.cursor/rules/api-contract-and-mock-conventions.mdc`
- `.cursor/skills/module-api-contract-audit/SKILL.md`

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `README.md` | 本文件 |
| `backend-api/README.md` | 基路径、接口清单、场景 → 接口表 |
| `backend-api/01-*.json` … `06-*.json` | 按接口拆分的契约源文件（含 `interaction`、`sampleRequest`、`sampleResponse`） |

## 与代码的对应关系

- 页面入口：`../index.vue`
- API 封装：`src/api/user-growth/ad-platform-analysis.ts`
- 类型：`src/types/api/api.d.ts`（`Api.UserGrowth.*`）
- 本地展示 Mock：`../mock.ts`（仅用于 UI 开发与对照；真实联调以接口返回为准）
