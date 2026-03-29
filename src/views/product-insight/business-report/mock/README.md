# 经营报告 - Mock 说明

## 用途

本目录为「产品洞察 > 报告管理（经营报告）」模块提供 Mock 数据与后端接口契约，用于：

- 开发阶段按日报 / 周报 / 月报独立联调
- 与 `types.ts`、页面组件、`reportService.ts` 保持数据结构一致
- 接口就绪后通过 `config/data-source.ts` 逐接口平滑切换为真实请求

## 目录结构

```
mock/
├── README.md             # 本文件：模块总览
└── backend-api/
    ├── README.md         # 接口契约清单（交付后端开发的参考文档）
    ├── 01-summary.json
    ├── 02-ad-platform.json
    ├── 03-by-country.json
    ├── 04-platform-country.json
    ├── 05-campaigns.json
    ├── 06-lark-config-get.json
    ├── 07-lark-config-save.json
    └── 08-lark-push-now.json
```

## 与页面的对应关系

| 页面 / Tab | 主要数据来源（契约） |
| --- | --- |
| 日报 / 周报 / 月报 — 汇总 | `01-summary` |
| 日报 / 周报 / 月报 — 广告平台 | `02-ad-platform` |
| 日报 / 周报 / 月报 — 分国家 | `03-by-country` |
| 日报 / 周报 / 月报 — 广告平台分国家 | `04-platform-country` |
| 日报 / 周报 / 月报 — 在投广告系列 | `05-campaigns` |
| 飞书推送配置弹窗 | `06-lark-config-get`、`07-lark-config-save`、`08-lark-push-now` |

## Mock 开关

在 `config/data-source.ts` 中可逐接口切换 Mock / 真实：

```ts
import { BUSINESS_REPORT_USE_MOCK, BusinessReportEndpoint } from './config/data-source'

// 将某接口改为 false 即可接入真实后端
BUSINESS_REPORT_USE_MOCK[BusinessReportEndpoint.Summary] = false
```

## 数据来源

- Mock 数据实现位于 `mockData.ts`，由 `reportService.ts` 按开关调用
- `backend-api/*.json` 为后端接口契约文档，`sampleResponse` 与 `mockData.ts` 数据结构一致
- 字段类型定义位于 `types.ts`
