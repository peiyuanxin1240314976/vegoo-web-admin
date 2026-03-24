export interface CountryItem {
  code: string // ISO alpha-2, e.g. "US"
  code3: string // ISO alpha-3 numeric, e.g. "840"
  criteriaId: string // e.g. "2840"
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
