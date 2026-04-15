export interface CountryItem {
  code: string // ISO alpha-2, e.g. "US"
  code3: string // ISO alpha-3 numeric, e.g. "840"
  criteriaId: string // e.g. "2840"
  /** 国旗图标展示 URL（HTTPS 或网关静态资源路径）；先上传得址后写入；空串表示未配置 */
  flagIconUrl: string
  nameCn: string // 中文名称
  nameEn: string // 国家名称 (English)
  aliases: string[] // 别名列表, max 5
  timezone: string // e.g. "GMT+8"
  phoneCode: string // e.g. "86"
  currency: string // e.g. "CNY - 人民币"
  currencySymbol: string // e.g. "¥"
  region: string // 亚太 | 欧洲 | 北美 | 其他
  isMainMarket: boolean
  createdBy: string
  createdTime: string
  updatedBy: string
  updatedTime: string
}

export interface CountryFormModel {
  code: string
  code3: string
  criteriaId: string
  /** 与 CountryItem.flagIconUrl 一致；表单内由本地上传或上传接口回填 */
  flagIconUrl: string
  nameCn: string
  nameEn: string
  aliases: string[]
  timezone: string
  phoneCode: string
  currency: string
  currencySymbol: string
  region: string
  isMainMarket: boolean
}

export interface CountryTableQuery {
  page: number
  pageSize: number
  region: string
  currency: string
  keyword: string
}

export interface CountryMetaOptionsResponse {
  timezoneOptions: string[]
  regionOptions: string[]
  currencyOptions: string[]
}

export interface CountryOverviewKpi {
  total: number
  currencies: number
  mainMarkets: number
  noCurrency: number
}

export interface CountryRegionDistributionItem {
  region: string
  count: number
  percent: number
}

export interface CountryMainMarketShareItem {
  countryCode: string
  countryName: string
  sharePercent: number
}
