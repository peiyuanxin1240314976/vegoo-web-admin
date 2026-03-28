import type { ProfitMapDataItem, ProfitMapScatterItem } from './types'

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
  Denmark: [9.5, 56.3],
  Egypt: [30.8, 26.8],
  Finland: [25.7, 61.9],
  France: [2.2, 46.2],
  Germany: [10.5, 51.2],
  India: [78.9, 20.6],
  Indonesia: [113.9, -0.8],
  Iran: [53.7, 32.4],
  Iraq: [43.7, 33.2],
  Ireland: [-8.2, 53.4],
  Israel: [34.9, 31.5],
  Italy: [12.6, 42.6],
  Japan: [138.3, 36.2],
  Malaysia: [101.7, 3.1],
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
  Switzerland: [8.2, 46.8],
  Taiwan: [121, 23.7],
  Thailand: [100.6, 15.9],
  Turkey: [35.2, 39.1],
  'United Arab Emirates': [53.8, 23.4],
  'United Kingdom': [-2.4, 54.5],
  'United States': [-98.5, 39.8],
  Vietnam: [108.3, 14.1]
}

function normName(s: string) {
  return s.trim().replace(/\s+/g, ' ')
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
    const name = (row.name ?? '').trim()
    if (!name) continue
    const ll = getCountryProfitMapCentroidLngLat(name)
    if (!ll) continue
    const n = Number(row.value)
    out.push({ name, value: [ll[0], ll[1], Number.isFinite(n) ? n : 0] })
  }
  return out
}
