# 广告平台分析详情 — Mock 说明

本页由「综合分析」等入口钻取进入，类型见 `../types.ts`。

## 数据源

- **开关**：`../config/data-source.ts`，按接口粒度：`Summary`、`CpiTrend`、`EcpmTrend`、`MatrixTable`、`AlertBar`。
- **封装**：`src/api/user-growth/platform-analysis-detail.ts`
  - 分片：`fetchPlatformAnalysisDetailSummary`、`fetchPlatformAnalysisDetailCpiTrend`、`fetchPlatformAnalysisDetailEcpm`、`fetchPlatformAnalysisDetailMatrixTable`、`fetchPlatformAnalysisDetailAlertBar`
  - 首屏组装：`loadPlatformAnalysisDetailPage`（内部 **Promise.all** 并行五请求）

## 契约

见 `mock/backend-api/README.md` 与 `01-summary.json`～`05-alert-bar.json`。
