/**
 * 转化管理 - Mock 数据
 * 表格 list、筛选 options、右侧统计数据；fetchConversionMappingListMock 供 useTable 对接
 */
import type {
  ConversionMappingItem,
  ConversionFilterParams,
  ConversionTypeDistributionItem,
  MappingStats,
  PlatformStats
} from '../types'

const PLATFORM_TYPES = [
  'PHONE_CALL_LEAD',
  'DOWNLOAD',
  'PURCHASE',
  'ADD_TO_CART',
  'PAGE_VIEW',
  'BEGIN_CHECKOUT'
] as const
const SYSTEM_NAMES = ['订阅转化', '首次安装', 'IAP购买', '加购', '页面浏览', '发起结账']
const BILLING = ['CPA', 'CPI', 'CPE', ''] as const

/** 表格 Mock 列表（约 18 条，与设计稿一致） */
const _MOCK_ROWS: ConversionMappingItem[] = [
  {
    id: '1',
    platform: 'android',
    mccAccount: '560-369-9741',
    appId: '10001',
    conversionName: 'Phone Tracker: Family Locator (Android) app_store_subscription_convert',
    conversionId: '7217482984',
    platformConversionType: 'PHONE_CALL_LEAD',
    systemDisplayName: '订阅转化',
    billingType: 'CPA',
    status: 'enabled'
  },
  {
    id: '2',
    platform: 'android',
    mccAccount: '560-369-9741',
    appId: '10001',
    conversionName: 'Phone Tracker install',
    conversionId: '7217482985',
    platformConversionType: 'DOWNLOAD',
    systemDisplayName: '首次安装',
    billingType: 'CPI',
    status: 'enabled'
  },
  {
    id: '3',
    platform: 'android',
    mccAccount: '560-369-9741',
    appId: '10001',
    conversionName: 'IAP purchase complete',
    conversionId: '7217482986',
    platformConversionType: 'PURCHASE',
    systemDisplayName: 'IAP购买',
    billingType: 'CPA',
    status: 'enabled'
  },
  {
    id: '4',
    platform: 'android',
    mccAccount: '560-369-9742',
    appId: '10002',
    conversionName: 'add_to_cart_event',
    conversionId: '7217482987',
    platformConversionType: 'ADD_TO_CART',
    systemDisplayName: '加购',
    billingType: 'CPE',
    status: 'enabled'
  },
  {
    id: '5',
    platform: 'android',
    mccAccount: '560-369-9742',
    appId: '10002',
    conversionName: 'page_view_landing',
    conversionId: '7217482988',
    platformConversionType: 'PAGE_VIEW',
    systemDisplayName: '页面浏览',
    billingType: '',
    status: 'enabled'
  },
  {
    id: '6',
    platform: 'android',
    mccAccount: '560-369-9742',
    appId: '10002',
    conversionName: 'begin_checkout',
    conversionId: '7217482989',
    platformConversionType: 'BEGIN_CHECKOUT',
    systemDisplayName: '发起结账',
    billingType: 'CPA',
    status: 'enabled'
  },
  {
    id: '7',
    platform: 'android',
    mccAccount: '560-369-9743',
    appId: '10001',
    conversionName: 'lead_form_submit',
    conversionId: '7217482990',
    platformConversionType: 'PHONE_CALL_LEAD',
    systemDisplayName: '订阅转化',
    billingType: 'CPA',
    status: 'duplicate'
  },
  {
    id: '8',
    platform: 'android',
    mccAccount: '560-369-9743',
    appId: '10003',
    conversionName: 'unknown_conversion',
    conversionId: '7217482991',
    platformConversionType: 'PAGE_VIEW',
    systemDisplayName: '',
    billingType: '',
    status: 'unmapped'
  }
]
for (let i = 9; i <= 18; i++) {
  const typeIndex = (i - 1) % PLATFORM_TYPES.length
  const billingIndex = (i - 1) % BILLING.length
  _MOCK_ROWS.push({
    id: String(i),
    platform: 'android',
    mccAccount: `560-369-97${40 + (i % 10)}`,
    appId: i % 2 ? '10001' : '10002',
    conversionName: `Conversion Event ${i}`,
    conversionId: String(7217482990 + i),
    platformConversionType: PLATFORM_TYPES[typeIndex],
    systemDisplayName: SYSTEM_NAMES[typeIndex] ?? SYSTEM_NAMES[0],
    billingType: BILLING[billingIndex],
    status: i === 10 || i === 11 ? 'duplicate' : i === 12 ? 'unmapped' : 'enabled'
  })
}
export const MOCK_CONVERSION_LIST = _MOCK_ROWS

/** 筛选 - 平台选项 */
export const MOCK_PLATFORM_OPTIONS = [
  { label: '全部终端平台', value: '' },
  { label: '安卓', value: 'android' },
  { label: 'iOS', value: 'ios' }
]

/** name Tab / Data Tab 筛选与弹窗应用下拉 — `value` 为自有应用 ID（契约 `appId`） */
export const MOCK_DATA_TAB_APP_OPTIONS = [
  { label: '全部应用', value: '' },
  { label: 'com.locate.phone.track', value: '10001' },
  { label: 'com.example.shop', value: '10002' },
  { label: 'com.other.app', value: '10003' }
]

/** mock：自有应用 ID → 包名（keyword 展示名匹配；列表行主键字段为 `appId`） */
export const MOCK_APP_ID_TO_PACKAGE: Record<string, string> = {
  '10001': 'com.locate.phone.track',
  '10002': 'com.example.shop',
  '10003': 'com.other.app'
}

/** 弹窗 - 广告平台选项 */
export const MOCK_AD_PLATFORM_OPTIONS = [
  { label: 'Google Ads', value: 'google' },
  { label: 'Meta', value: 'meta' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Mintegral', value: 'mintegral' }
]

/** 弹窗 - MCC 账户（按广告平台加载，mock 写死一条） */
export const MOCK_MCC_BY_PLATFORM: Record<string, { label: string; value: string }[]> = {
  google: [{ label: '560-369-9741', value: '560-369-9741' }],
  meta: [{ label: '560-369-9742', value: '560-369-9742' }],
  tiktok: [{ label: '560-369-9743', value: '560-369-9743' }],
  mintegral: [{ label: '560-369-9744', value: '560-369-9744' }]
}

/** 弹窗 - 应用下拉（无「全部」；与 `mappings-create` 的 `appId` 一致） */
export const MOCK_APP_OPTIONS_FOR_DIALOG = MOCK_DATA_TAB_APP_OPTIONS.filter((o) => o.value !== '')

/** 弹窗 - 转化类型展示选项（付费/激活/行为/收入） */
export const MOCK_CONVERSION_DISPLAY_TYPE_OPTIONS = [
  { label: '付费转化', value: 'paid' },
  { label: '激活转化', value: 'activation' },
  { label: '行为转化', value: 'behavior' },
  { label: '收入转化', value: 'revenue' }
]

/** 筛选 - 转化类型选项 */
export const MOCK_CONVERSION_TYPE_OPTIONS = [
  { label: '全部转化类型', value: '' },
  ...PLATFORM_TYPES.map((t) => ({ label: t, value: t }))
]

/** 筛选 - 状态选项 */
export const MOCK_STATUS_OPTIONS = [
  { label: '全部状态', value: '' },
  { label: '启用', value: 'enabled' },
  { label: '重复', value: 'duplicate' },
  { label: '未映射', value: 'unmapped' }
]

/** 右侧 - 转化类型分布（与设计稿比例接近） */
export const MOCK_TYPE_DISTRIBUTION: ConversionTypeDistributionItem[] = [
  { name: 'PHONE_CALL_LEAD', value: 44, count: 8 },
  { name: 'DOWNLOAD', value: 11, count: 2 },
  { name: 'PURCHASE', value: 11, count: 2 },
  { name: 'ADD_TO_CART', value: 11, count: 2 },
  { name: 'PAGE_VIEW', value: 17, count: 3 },
  { name: 'BEGIN_CHECKOUT', value: 6, count: 1 }
]

/** 右侧 - 映射状态统计 */
export const MOCK_MAPPING_STATS: MappingStats = {
  mapped: 15,
  duplicate: 2,
  unmapped: 1
}

/** 右侧 - 平台分布 */
export const MOCK_PLATFORM_STATS: PlatformStats = {
  android: 18,
  ios: 0
}

/** Mock 列表接口：分页 + 筛选，供 useTable apiFn 使用 */
export function fetchConversionMappingListMock(
  params: ConversionFilterParams
): Promise<Api.Common.PaginatedResponse<ConversionMappingItem>> {
  const { current = 1, size = 20, platform, appId, conversionType, status, keyword } = params
  let list = [...MOCK_CONVERSION_LIST]
  if (platform) list = list.filter((r) => r.platform === platform)
  if (appId) list = list.filter((r) => r.appId === appId)
  if (conversionType) list = list.filter((r) => r.platformConversionType === conversionType)
  if (status) list = list.filter((r) => r.status === status)
  if (keyword) {
    const k = keyword.toLowerCase()
    list = list.filter((r) => {
      const pkg = (MOCK_APP_ID_TO_PACKAGE[r.appId] ?? '').toLowerCase()
      return (
        r.conversionName.toLowerCase().includes(k) ||
        r.appId.toLowerCase().includes(k) ||
        pkg.includes(k) ||
        r.systemDisplayName.toLowerCase().includes(k)
      )
    })
  }
  const total = list.length
  const start = (current - 1) * size
  const records = list.slice(start, start + size)
  return Promise.resolve({
    records,
    current,
    size,
    total
  })
}
