/**
 * 数据中心「分析」类接口统一路径前缀（相对站点根，经 axios baseURL 拼接）。
 * 完整 URL 一般为：`ANALYSIS_API_BASE` + `ANALYSIS_API_MIDDLE_PREFIX` + 模块子路径 + endpoint。
 * 中间段以后端网关为准，只改下一处常量即可。
 */
export const ANALYSIS_API_BASE = '/api/v1/datacenter/analysis'

/**
 * 夹在 `ANALYSIS_API_BASE` 与各模块路径之间的可选段（建议以 `/` 开头；无需时 `''`）。
 * 原「user-growth / account-performance」两档合并为此一处，后续网关增删层级时按需填写，例如：
 * - `''` → `.../analysis/ad-performance/...`、`.../analysis/kpi`
 * - `'/user-growth'` → `.../analysis/user-growth/ad-performance/...`
 * - `'/account-performance'` → `.../analysis/account-performance/kpi`
 * - `'/user-growth/account-performance'` → 多段组合时自行拼接
 */
export const ANALYSIS_API_MIDDLE_PREFIX = ''
