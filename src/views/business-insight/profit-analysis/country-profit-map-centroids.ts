import type { ProfitMapDataItem, ProfitMapScatterItem } from './types'

/**
 * 接口可能下发中文国家名，需映射为 `/geo/world.json` 中 `properties.name`（与 map 系列 data.name 一致）。
 * 「中国台湾」等在标准 world 底图中无独立面，不参与 choropleth，仅走散点 + 中文标签。
 */
const CN_NAME_TO_ECHARTS_REGION: Record<string, string> = {
  美国: 'United States',
  刚果: 'Congo',
  '刚果(布)': 'Congo',
  刚果布: 'Congo',
  德国: 'Germany',
  毛里塔尼亚: 'Mauritania',
  以色列: 'Israel',
  加蓬: 'Gabon',
  关岛: 'Guam',
  约旦: 'Jordan',
  危地马拉: 'Guatemala',
  叙利亚: 'Syria',
  韩国: 'Korea',
  法国: 'France',
  西班牙: 'Spain',
  波兰: 'Poland',
  意大利: 'Italy',
  巴西: 'Brazil',
  英国: 'United Kingdom',
  日本: 'Japan',
  中国: 'China',
  加拿大: 'Canada',
  澳大利亚: 'Australia',
  印度: 'India',
  俄罗斯: 'Russia',
  墨西哥: 'Mexico',
  荷兰: 'Netherlands',
  土耳其: 'Turkey',
  沙特: 'Saudi Arabia',
  沙特阿拉伯: 'Saudi Arabia',
  南非: 'South Africa',
  阿根廷: 'Argentina',
  印尼: 'Indonesia',
  印度尼西亚: 'Indonesia',
  泰国: 'Thailand',
  越南: 'Vietnam',
  埃及: 'Egypt',
  尼日利亚: 'Nigeria'
}

/** 与 world.json 不一致的常见英文别名（历史 mock / 接口） */
const ENGLISH_ALIAS_TO_ECHARTS_REGION: Record<string, string> = {
  'South Korea': 'Korea'
}

/**
 * 无独立多边形的地区：不参与 map 填色，仍可对应用 centroid 做散点。
 */
const MAP_REGION_SKIP_CHOROPLETH = new Set(['中国台湾', '台灣'])

/**
 * 与 ECharts world.json 常见英文国家名对齐，用于 mapScatter 缺失时从 mapData 回退定位点。
 * 坐标为大致中心 [经度, 纬度]。
 */
const ENGLISH_COUNTRY_NAME_TO_LNGLAT: Record<string, [number, number]> = {
  Afghanistan: [67.7, 33.9],
  Argentina: [-64.2, -34.6],
  Australia: [133.8, -25.3],
  Austria: [14.6, 47.5],
  Belgium: [4.5, 50.5],
  Brazil: [-51.9, -14.2],
  Canada: [-106.3, 56.1],
  China: [104.2, 35.9],
  Congo: [15.2, -0.8],
  Denmark: [9.5, 56.3],
  Egypt: [30.8, 26.8],
  Finland: [25.7, 61.9],
  France: [2.2, 46.2],
  Gabon: [11.6, -0.6],
  Germany: [10.5, 51.2],
  Guam: [144.8, 13.5],
  Guatemala: [-90.2, 15.8],
  India: [78.9, 20.6],
  Indonesia: [113.9, -0.8],
  Iran: [53.7, 32.4],
  Iraq: [43.7, 33.2],
  Ireland: [-8.2, 53.4],
  Israel: [34.9, 31.5],
  Italy: [12.6, 42.6],
  Japan: [138.3, 36.2],
  Jordan: [36.2, 31.3],
  Malaysia: [101.7, 3.1],
  Mauritania: [-10.9, 20.3],
  Mexico: [-102.6, 23.6],
  Netherlands: [5.3, 52.1],
  'New Zealand': [174.9, -40.9],
  Nigeria: [8.7, 9.1],
  Norway: [8.5, 60.5],
  Pakistan: [69.3, 30.4],
  Philippines: [121.8, 12.9],
  Poland: [19.1, 51.9],
  Russia: [105.3, 61.5],
  'Saudi Arabia': [45.1, 23.9],
  Singapore: [103.8, 1.35],
  'South Africa': [25.7, -29],
  'South Korea': [127.8, 35.9],
  Spain: [-3.7, 40.4],
  Sweden: [18.6, 60.1],
  Syria: [38.5, 35],
  Switzerland: [8.2, 46.8],
  Taiwan: [121, 23.7],
  Thailand: [100.6, 15.9],
  Turkey: [35.2, 39.1],
  'United Arab Emirates': [53.8, 23.4],
  'United Kingdom': [-2.4, 54.5],
  'United States': [-98.5, 39.8],
  Vietnam: [108.3, 14.1],
  /** 与 world.json 中 Korea 一致；与 South Korea 同坐标 */
  Korea: [127.8, 35.9]
}

function normName(s: string) {
  return s.trim().replace(/\s+/g, ' ')
}

/**
 * 将接口下发的国家名（中文或英文）解析为 world.json 的 region `name`，无对应面则返回 null（仅散点）。
 */
export function resolveEchartsWorldMapRegionName(rawName: string): string | null {
  const key = normName(rawName)
  if (!key) return null
  if (MAP_REGION_SKIP_CHOROPLETH.has(key)) return null
  if (CN_NAME_TO_ECHARTS_REGION[key]) return CN_NAME_TO_ECHARTS_REGION[key]
  if (ENGLISH_ALIAS_TO_ECHARTS_REGION[key]) return ENGLISH_ALIAS_TO_ECHARTS_REGION[key]
  return key
}

/**
 * 中文/别名 → 与 ENGLISH_COUNTRY_NAME_TO_LNGLAT 键一致，用于回退散点坐标。
 */
function resolveCentroidLookupEnglishName(rawName: string): string {
  const key = normName(rawName)
  if (!key) return key
  if (key === '中国台湾' || key === '台灣') return 'Taiwan'
  const region = CN_NAME_TO_ECHARTS_REGION[key]
  if (region === 'Korea') return 'South Korea'
  if (region) return region
  if (ENGLISH_ALIAS_TO_ECHARTS_REGION[key]) {
    const r = ENGLISH_ALIAS_TO_ECHARTS_REGION[key]
    return r === 'Korea' ? 'South Korea' : r
  }
  return key
}

/** map 系列用：中文名 → ECharts 英文名；无法着色的条目已过滤 */
export function normalizeProfitMapDataForEchartsMapSeries(
  items: ProfitMapDataItem[]
): ProfitMapDataItem[] {
  const out: ProfitMapDataItem[] = []
  for (const row of items) {
    const region = resolveEchartsWorldMapRegionName(row.name ?? '')
    if (region === null) continue
    out.push({ name: region, value: row.value })
  }
  return out
}

/** 英文国家名 → [lng, lat]，未收录时返回 null */
export function getCountryProfitMapCentroidLngLat(englishName: string): [number, number] | null {
  const key = normName(englishName)
  const direct = ENGLISH_COUNTRY_NAME_TO_LNGLAT[key]
  if (direct) return direct
  const lower = Object.keys(ENGLISH_COUNTRY_NAME_TO_LNGLAT).find(
    (k) => k.toLowerCase() === key.toLowerCase()
  )
  return lower ? ENGLISH_COUNTRY_NAME_TO_LNGLAT[lower]! : null
}

function toTripletLngLatValue(
  raw: ProfitMapScatterItem
): { name: string; value: [number, number, number] } | null {
  const v = raw.value
  if (!Array.isArray(v) || v.length < 3) return null
  const lng = Number(v[0])
  const lat = Number(v[1])
  const num = Number(v[2])
  if (!Number.isFinite(lng) || !Number.isFinite(lat) || !Number.isFinite(num)) return null
  if (Math.abs(lng) > 180 || Math.abs(lat) > 90) return null
  return { name: raw.name ?? '', value: [lng, lat, num] }
}

/**
 * effectScatter 用数据：优先接口 mapScatter；无效或为空时按 mapData 国家名回退经纬度。
 */
export function buildProfitMapScatterChartData(
  scatter: ProfitMapScatterItem[],
  mapData: ProfitMapDataItem[]
): { name: string; value: [number, number, number] }[] {
  const fromApi = scatter.map(toTripletLngLatValue).filter(Boolean) as {
    name: string
    value: [number, number, number]
  }[]
  if (fromApi.length > 0) return fromApi

  const out: { name: string; value: [number, number, number] }[] = []
  for (const row of mapData) {
    const displayName = (row.name ?? '').trim()
    if (!displayName) continue
    const centroidKey = resolveCentroidLookupEnglishName(displayName)
    const ll = getCountryProfitMapCentroidLngLat(centroidKey)
    if (!ll) continue
    const n = Number(row.value)
    /** 保留接口原名（多为中文），供涟漪旁标签展示 */
    out.push({ name: displayName, value: [ll[0], ll[1], Number.isFinite(n) ? n : 0] })
  }
  return out
}
