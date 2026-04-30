# 经营报告 - Mock 说明

## 用途

本目录为「产品洞察 > 报告管理（经营报告）」模块提供 Mock 数据与后端接口契约，用于：

- 开发阶段按日报 / 周报 / 月报独立联调
- 与 `types.ts`、页面组件、`reportService.ts` 保持数据结构一致
- 接口就绪后通过 `config/data-source.ts` 逐接口平滑切换为真实请求

**页面操作与「何时调哪些接口」的说明**：见 [`docs/经营报告-操作与接口说明.md`](../docs/经营报告-操作与接口说明.md)。

**与后端真实联调前的字段/路径核对**：见 [`docs/后端联调核对清单.md`](../docs/后端联调核对清单.md)。

## 目录结构

```
mock/
├── README.md             # 本文件：模块总览
└── backend-api/
    ├── README.md         # 接口契约清单（交付后端）；含「侧栏 app-list 接口设计说明（给后端）」
    ├── daily-00-app-list.json + daily-01~08.json
    ├── weekly-00-app-list.json + weekly-01~08.json
    ├── monthly-00-app-list.json + monthly-01~08.json
    ├── 06-lark-config-get.json
    ├── 07-lark-config-save.json
    ├── 08-lark-push-now.json
    └── rollout-checklist.md
```

## 与页面的对应关系

| 页面 / Tab | 主要数据来源（契约） |
| --- | --- | --- | --- |
| 侧栏应用列表（三周期） | `daily | weekly | monthly-00-app-list` |
| 日报 — 汇总/广告平台/分国家/平台分国家/在投系列 | `daily-01~05` |
| 周报 — 汇总/广告平台/分国家/平台分国家/在投系列 | `weekly-01~05` |
| 月报 — 汇总/广告平台/分国家/平台分国家/在投系列 | `monthly-01~05` |
| 对比模式（日报/周报/月报） | `daily | weekly | monthly-06~08` |
| 飞书推送配置弹窗 | `06-lark-config-get`、`07-lark-config-save`、`08-lark-push-now` |

## Mock 开关

在 `config/data-source.ts` 中可逐接口切换 Mock / 真实：

```ts
import { BUSINESS_REPORT_USE_MOCK, BusinessReportReadEndpoint } from './config/data-source'

// 将某接口改为 false 即可接入真实后端
BUSINESS_REPORT_USE_MOCK[BusinessReportReadEndpoint.DailyOverview] = false
```

## 契约与实现口径

- 仅维护 **`daily-* / weekly-* / monthly-*`** 契约与对应 `fetch*`；前端**不再**做旧路径或旧响应字段（如详情里嵌套 `appList`）的兼容。

## 数据来源

- Mock 数据实现位于 `mockData.ts`，由 `reportService.ts` 按开关调用
- `backend-api/*.json` 为后端接口契约文档，`sampleResponse` 与 `mockData.ts` 数据结构一致
- 字段类型定义位于 `types.ts`
