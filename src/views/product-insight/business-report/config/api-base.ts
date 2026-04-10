import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'

/**
 * 经营报告（报告管理）— 报告数据接口根路径
 *
 * 与数据中心分析网关一致：`${ANALYSIS_API_BASE}/report/*`
 * 例如：`/api/v1/datacenter/analysis/report/daily/overview`
 *
 * 飞书配置类接口仍用 `src/api/business-report.ts` 内 `LARK_BASE`（非本前缀）。
 */
export const BUSINESS_REPORT_DATA_BASE = `${ANALYSIS_API_BASE}/report`
