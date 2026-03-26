# 代投分析 - Mock 说明

## 用途

本目录为 `business-insight/agency-analysis` 提供 mock 数据和后端接口契约，用于：

- 前端先行开发页面与交互
- 与 `types.ts`、组件渲染字段保持一致
- 通过 `config/data-source.ts` 逐接口切换到真实接口

## 目录结构

```txt
mock/
├── README.md
├── mock-data.ts
└── backend-api/
    ├── README.md
    ├── 01-overview.json
    ├── 02-agency-summary.json
    ├── 03-campaign-table.json
    ├── 04-daily-comparison.json
    ├── 05-donut-spend-share.json
    ├── 06-channel-distribution.json
    ├── 07-country-top8.json
    └── 08-spend-trend30d.json
```

## 数据源开关

- 开关文件：`../config/data-source.ts`
- 粒度：每个 `fetch` 能力一个开关
- 默认：全部 `true`（走 mock）
