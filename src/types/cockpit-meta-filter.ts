/**
 * 公用顶栏筛选项：`GET ${ANALYSIS_API_BASE}/cockpit/meta-filter-options`（无参）
 * 行为说明：`src/views/user-growth/paid-analysis/mock/backend-api/README.md` 附录 A（无单独 JSON 契约）。
 */

/** 公用筛选项下拉项 */
export interface CockpitMetaOptionItem {
  label: string
  value: string
}

export interface CockpitSettingAppItem {
  sAppUUId?: string
  sAppId: string
  sAppStoreId?: string
  nPlatform: number | string
  platformName: string
  sAppName: string
  sAppShortName: string
  nCategory: number | string
  categoryName: string
}

/** 上述接口业务体（网关若包一层则指解包后的 data） */
export interface CockpitMetaFilterOptionsData {
  appOptions: CockpitMetaOptionItem[]
  platformOptions: CockpitMetaOptionItem[]
  sourceOptions: CockpitMetaOptionItem[]
  /** 广告账户等；网关未下发时为空数组 */
  accountOptions: CockpitMetaOptionItem[]
  countryOptions: CockpitMetaOptionItem[]
  settingApps: CockpitSettingAppItem[]
}
