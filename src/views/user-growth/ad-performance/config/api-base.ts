/**
 * 广告成效模块专用 API 路径前缀（仅本模块 `src/api/user-growth/ad-performance.ts` 使用）。
 * 与全局 `analysis-api-base` 解耦，改网关层级时只改此处，不影响其它分析页。
 */
export const AD_PERFORMANCE_BASE = '/api/v1/datacenter/analysis/ad-performance'

/** 独立路由「广告系列详情」页分片接口前缀 */
export const AD_PERFORMANCE_CAMPAIGN_DETAIL_BASE = `${AD_PERFORMANCE_BASE}/campaign-detail`
