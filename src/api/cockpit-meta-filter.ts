/**
 * 网关路径 `.../cockpit/meta-filter-options`：公用顶栏筛选项（应用 / 终端平台 / 广告平台 / 国家等）。
 * 说明文档：`src/views/user-growth/paid-analysis/mock/backend-api/README.md` 附录 A（不单独维护 JSON 契约）
 * 若业务页顶栏与此同构，请使用本 `fetch*`，勿再新增第二份同结构契约。
 */
import request from '@/utils/http'
import { ANALYSIS_API_BASE } from '@/api/analysis-api-base'
import type { CockpitMetaFilterOptionsData } from '@/types/cockpit-meta-filter'

const COCKPIT_API_BASE = `${ANALYSIS_API_BASE}/cockpit`

export function fetchCockpitMetaFilterOptions(data: Record<string, never> = {}) {
  return request.post<CockpitMetaFilterOptionsData>({
    url: `${COCKPIT_API_BASE}/meta-filter-options`,
    data
  })
}
