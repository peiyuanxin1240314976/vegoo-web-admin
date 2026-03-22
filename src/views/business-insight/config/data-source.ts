/**
 * 商业洞察 - IAA / IAP 分析数据源开关
 * - mock：本地 Mock（与 views/business-insight/mocks 一致）
 * - remote：真实接口（经 Vite 代理到 VITE_API_PROXY_URL）
 *
 * 默认模式在下方常量中维护；勿在根目录 .env* 中为该模块单独配置 VITE_* 数据源开关。
 * 开发环境可用 localStorage 覆盖（见 STORAGE_KEY、setBusinessInsightIaaIapDataSource）。
 */
export type BusinessInsightIaaIapDataSource = 'mock' | 'remote'

/** 未命中 localStorage 覆盖时的默认数据源（团队默认连真接口可改为 'remote'） */
const DEFAULT_IAA_IAP_DATA_SOURCE: BusinessInsightIaaIapDataSource = 'mock'

const STORAGE_KEY = 'vegoo:business-insight:iaa-iap:data-source'

function getResolvedSource(): BusinessInsightIaaIapDataSource {
  if (import.meta.env.DEV && typeof localStorage !== 'undefined') {
    const s = localStorage.getItem(STORAGE_KEY) as BusinessInsightIaaIapDataSource | null
    if (s === 'mock' || s === 'remote') {
      return s
    }
  }
  return DEFAULT_IAA_IAP_DATA_SOURCE
}

/** 是否使用 Mock（未使用远程接口） */
export function isBusinessInsightIaaIapUsingMock(): boolean {
  return getResolvedSource() === 'mock'
}

/** 开发环境下可切换并刷新页面生效 */
export function setBusinessInsightIaaIapDataSource(mode: BusinessInsightIaaIapDataSource) {
  if (!import.meta.env.DEV) return
  localStorage.setItem(STORAGE_KEY, mode)
}

export function getBusinessInsightIaaIapDataSource(): BusinessInsightIaaIapDataSource {
  return getResolvedSource()
}
