/**
 * 驾驶舱数据接口层
 *
 * 当前使用 Mock 数据，对接后端时：
 * 1. 将 COCKPIT_USE_MOCK 改为 false
 * 2. 确认后端接口路径与返回结构（与 types.CockpitOverview 对齐，或在此做一层转换）
 * 3. 若后端字段名不一致，在 fetchCockpitOverview 的 then 中做 normalize 映射
 */
import request from '@/utils/http'
import type { CockpitOverview, CockpitOverviewParams } from '../types'
import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

/** 是否使用 Mock 数据；对接真实接口时改为 false */
const COCKPIT_USE_MOCK = true

/** 驾驶舱概览接口路径（对接时替换为实际地址） */
const COCKPIT_OVERVIEW_URL = '/api/cockpit/overview'

/**
 * 获取驾驶舱全量数据
 * - Mock 模式：直接返回 mock/data 中的数据，可依 params.dateRange 做简单过滤或保持原样
 * - 真实接口：请求 GET /api/cockpit/overview?dateRange=xxx，返回结构需与 CockpitOverview 一致
 */
export async function fetchCockpitOverview(
  params?: CockpitOverviewParams
): Promise<CockpitOverview> {
  if (COCKPIT_USE_MOCK) {
    // 可选：根据 params?.dateRange 返回不同 mock 数据
    return Promise.resolve({ ...MOCK_COCKPIT_OVERVIEW })
  }

  const res = await request.get<CockpitOverview>({
    url: COCKPIT_OVERVIEW_URL,
    params: params ?? {}
  })
  // 若后端字段与前端类型不完全一致，在此做一层转换，例如：
  // return { kpi: res.kpiList.map(...), alertBanners: res.alerts, ... }
  return res
}
