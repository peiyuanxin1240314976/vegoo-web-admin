<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { fetchMyAdsCampaign, fetchMyAdsMetaFilterOptions } from '@/api/user-growth'

  defineOptions({ name: 'CampaignTab' })

  const router = useRouter()

  const props = defineProps<{
    staffId: string
    dateRange: [string, string]
  }>()

  type CampaignRow = Api.UserGrowth.MyAdsCampaignRowDto

  const loading = ref(false)
  const campaignData = ref<Api.UserGrowth.MyAdsCampaignTableDto | null>(null)
  const filterScope = ref<string | undefined>(undefined)
  const filterApp = ref<string | undefined>(undefined)
  const filterPlatform = ref<string | undefined>(undefined)
  const filterCountry = ref<string | undefined>(undefined)
  const filterStatus = ref<string | undefined>(undefined)
  const filterType = ref<'with_agency' | 'pure' | undefined>(undefined)
  const searchText = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)

  const campaigns = computed(() => campaignData.value?.list ?? [])
  const total = computed(() => campaignData.value?.total ?? 0)

  /** 廣告平台名稱 → n_source（backend-fields：1-Google 2-Facebook 3-Unity 4-AppLovin 5-IronSource 6-AdColony 7-Pangle） */
  const PLATFORM_TO_SOURCE: Record<string, number> = {
    Google: 1,
    谷歌: 1,
    Facebook: 2,
    Meta: 2,
    Unity: 3,
    AppLovin: 4,
    IronSource: 5,
    AdColony: 6,
    Pangle: 7,
    TikTok: 8,
    Mintegral: 9,
    Kwai: 10
  }

  function resolveSourceFromPlatformFilter(platform: string | undefined | null): number | null {
    if (platform == null || platform === '') return null
    const p = String(platform).trim()
    if (/^\d+$/.test(p)) {
      const n = Number(p)
      return Number.isFinite(n) ? n : null
    }
    return PLATFORM_TO_SOURCE[p] != null ? PLATFORM_TO_SOURCE[p] : null
  }

  function buildParams() {
    const [startDate = '', endDate = ''] = props.dateRange
    const app = (filterApp.value ?? '').trim()
    const country = (filterCountry.value ?? '').trim()
    const kw = searchText.value.trim()
    const staff = (props.staffId ?? '').trim()
    const scope = filterScope.value
    const platform = filterPlatform.value
    const statusVal = filterStatus.value
    const agencyVal = filterType.value
    const sourceNum = resolveSourceFromPlatformFilter(platform)
    const staffIdVal = scope === '全部' ? '' : staff
    return {
      appId: app || '',
      countryCode: country || '',
      currentPage: Math.max(1, currentPage.value),
      endDate: endDate.trim() || '',
      groupBy: 'app' as const,
      keyword: kw || '',
      pageSize: Math.max(1, pageSize.value),
      source: sourceNum,
      staffId: staffIdVal || '',
      startDate: startDate.trim() || '',
      status: statusVal ?? null,
      agencyType: agencyVal ?? null
    }
  }

  async function loadCampaigns() {
    loading.value = true
    try {
      const data = await fetchMyAdsCampaign(buildParams())
      campaignData.value = data ?? null
    } catch {
      campaignData.value = null
    } finally {
      loading.value = false
    }
  }

  const appOptions = ref<Api.UserGrowth.MyAdsFilterOptionDto[]>([])
  const platformOptions = ref<Api.UserGrowth.MyAdsFilterOptionDto[]>([])
  const countryOptions = ref<Api.UserGrowth.MyAdsFilterOptionDto[]>([])

  async function loadMetaFilterOptions() {
    try {
      const data = await fetchMyAdsMetaFilterOptions()
      appOptions.value = data?.appOptions ?? []
      platformOptions.value = data?.adPlatformOptions ?? []
      countryOptions.value = data?.countryOptions ?? []
    } catch {
      appOptions.value = []
      platformOptions.value = []
      countryOptions.value = []
    }
  }

  onMounted(() => {
    loadMetaFilterOptions()
    loadCampaigns()
  })

  watch(
    () => [
      props.staffId,
      props.dateRange,
      filterScope.value,
      filterApp.value,
      filterPlatform.value,
      filterCountry.value,
      filterStatus.value,
      filterType.value,
      searchText.value
    ],
    () => {
      currentPage.value = 1
      loadCampaigns()
    }
  )

  watch([currentPage, pageSize], () => {
    loadCampaigns()
  })

  /* ── 筛选 ── */
  const scopeOptions = [
    { value: '全部', label: '全部' },
    { value: '我负责的', label: '我负责的' }
  ]

  const statusOptions = [
    { value: 'active' as const, label: '激活' },
    { value: 'warn' as const, label: '超预算' },
    { value: 'inactive' as const, label: '未启动' }
  ]

  const typeOptions = [
    { value: 'with_agency' as const, label: '含代投' },
    { value: 'pure' as const, label: '仅直投' }
  ]

  /** 接口返回當前頁列表 */
  const pagedCampaigns = computed(() => campaigns.value)

  const filteredTotal = computed(() => total.value)

  watch([filteredTotal, pageSize], () => {
    const maxPage = Math.max(1, Math.ceil(filteredTotal.value / pageSize.value) || 1)
    if (currentPage.value > maxPage) currentPage.value = maxPage
  })

  function goToCampaignDetail(id: string, name: string) {
    router.push({
      path: '/user-growth/ad-performance/campaign-detail',
      query: { id, name }
    })
  }

  function resetFilters() {
    filterScope.value = undefined
    filterApp.value = undefined
    filterPlatform.value = undefined
    filterCountry.value = undefined
    filterStatus.value = undefined
    filterType.value = undefined
    searchText.value = ''
    currentPage.value = 1
  }

  /* ── 格式化 ── */
  function fmtNum(v: number | null | undefined): string {
    if (v == null) return '--'
    if (v === 0) return '$0.00'
    const s = Math.abs(v).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    return v < 0 ? `-$${s}` : `$${s}`
  }
  function fmtRoi(v: number | null | undefined): string {
    if (v == null) return '--'
    return v + '%'
  }

  function fmtCpi(v: number | null | undefined): string {
    if (v == null) return '--'
    return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  /* ── 颜色逻辑 ── */
  function statusStyle(s: string) {
    if (s === 'active') return { color: '#10b981' }
    if (s === 'warn') return { color: '#f59e0b' }
    return { color: '#4b5563' }
  }
  function roiStyle(v: number | null | undefined) {
    if (v == null) return { color: '#4b5563' }
    if (v >= 35) return { color: '#f59e0b' }
    return { color: '#f97316' }
  }
  function profitStyle(v: number | null | undefined) {
    if (v == null) return { color: '#4b5563' }
    if (v < 0) return { color: '#ef4444' }
    return { color: '#10b981' }
  }
  function minProfitStyle(v: number | null | undefined) {
    if (v == null) return { color: '#4b5563' }
    if (v < 0) return { color: '#ef4444' }
    return { color: '#a78bfa' }
  }

  function platformColor(p: string) {
    if (p === 'Google') return '#4285f4'
    if (p === 'Facebook') return '#1877f2'
    if (p === 'TikTok') return '#000'
    return '#6b7280'
  }

  function progressColor(c: CampaignRow) {
    if (c.status === 'warn') return '#f59e0b'
    if (c.status === 'inactive') return '#374151'
    const pct = c.budget > 0 ? c.spend / c.budget : 0
    if (pct >= 0.9) return '#f59e0b'
    return '#10b981'
  }

  function progressPct(c: CampaignRow) {
    if (c.budget === 0) return 0
    return Math.round((c.spend / c.budget) * 100)
  }

  function trendSvg(trend: string | null | undefined) {
    if (trend === 'up') return '↗'
    if (trend === 'down') return '↘'
    if (trend === 'flat') return '→'
    return '—'
  }
  function trendColor(trend: string | null | undefined) {
    if (trend === 'up') return '#10b981'
    if (trend === 'down') return '#ef4444'
    if (trend === 'flat') return '#f59e0b'
    return '#4b5563'
  }

  /** flag-icons 的 `fi-xx` 后缀（小写）；非 ISO 两位码返回空不展示旗 */
  function countryFlagCode(code: string | undefined): string {
    const raw = (code || '').trim().toUpperCase()
    if (raw === 'UK') return 'gb'
    if (/^[A-Z]{2}$/.test(raw)) return raw.toLowerCase()
    return ''
  }

  /** 与业务页一致：`class="fi fi-xx"`（见 iaa-analysis tab-country） */
  function countryFlagFiClass(code: string | undefined): string {
    const suffix = countryFlagCode(code)
    return suffix ? `fi fi-${suffix}` : ''
  }

  /** 國家：規範字段 `s_country_code` 與後端 camelCase `countryCode` 兼容 */
  function rowCountryCode(c: CampaignRow): string {
    const raw = c.s_country_code ?? c.countryCode
    if (raw == null || String(raw).trim() === '') return ''
    return String(raw).trim()
  }

  function appIconDisplay(c: CampaignRow): string {
    if (c.appIcon != null && String(c.appIcon).trim() !== '') return String(c.appIcon)
    const name = (c.appName || '').trim()
    return name ? name.slice(0, 2) : '—'
  }

  function platformBadgeDisplay(c: CampaignRow): string {
    if (c.platformIcon != null && String(c.platformIcon).trim() !== '') {
      return String(c.platformIcon)
    }
    const p = (c.platform || '').trim()
    return p ? p.slice(0, 1).toUpperCase() : '—'
  }

  /** 底部 bar 本頁彙總（接口無單獨 summary，從當前頁 list 計算） */
  const barTotals = computed(() => {
    const list = pagedCampaigns.value
    const spend = list.reduce((s, c) => s + (c.spend ?? 0), 0)
    const budget = list.reduce((s, c) => s + (c.budget ?? 0), 0)
    const agencySpend = list.reduce((s, c) => s + (c.agencySpend ?? 0), 0)
    const directSpend = spend - agencySpend
    const agencyRatio = spend > 0 ? (agencySpend / spend) * 100 : 0
    const estProfit = list.reduce((s, c) => s + (c.estProfit ?? 0), 0)
    const minTotal = list.reduce((s, c) => s + (c.minSpend ?? 0), 0)
    return {
      spend,
      budget,
      diff: budget - spend,
      agencySpend,
      directSpend,
      agencyRatio,
      estProfit,
      minTotal
    }
  })
</script>

<template>
  <div class="campaign-tab">
    <!-- ── 筛选栏 ── -->
    <div class="filter-bar">
      <div class="filter-selects">
        <div class="filter-select-wrap">
          <ElSelect
            v-model="filterScope"
            class="filter-el"
            placeholder="请选择数据范围"
            clearable
            popper-class="campaign-tab-filter-popper"
            :teleported="true"
          >
            <ElOption v-for="o in scopeOptions" :key="o.value" :label="o.label" :value="o.value" />
          </ElSelect>
        </div>
        <div class="filter-select-wrap">
          <ElSelect
            v-model="filterApp"
            class="filter-el filter-el--app"
            placeholder="请选择应用"
            clearable
            popper-class="campaign-tab-filter-popper"
            :teleported="true"
          >
            <ElOption v-for="o in appOptions" :key="o.value" :label="o.label" :value="o.value" />
          </ElSelect>
        </div>
        <div class="filter-select-wrap">
          <ElSelect
            v-model="filterPlatform"
            class="filter-el"
            placeholder="请选择广告平台"
            clearable
            popper-class="campaign-tab-filter-popper"
            :teleported="true"
          >
            <ElOption
              v-for="o in platformOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </ElSelect>
        </div>
        <div class="filter-select-wrap">
          <ElSelect
            v-model="filterCountry"
            class="filter-el"
            placeholder="请选择国家或地区"
            clearable
            popper-class="campaign-tab-filter-popper"
            :teleported="true"
          >
            <ElOption
              v-for="o in countryOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </ElSelect>
        </div>
        <div class="filter-select-wrap">
          <ElSelect
            v-model="filterStatus"
            class="filter-el"
            placeholder="请选择状态"
            clearable
            popper-class="campaign-tab-filter-popper"
            :teleported="true"
          >
            <ElOption v-for="o in statusOptions" :key="o.value" :label="o.label" :value="o.value" />
          </ElSelect>
        </div>
        <div class="filter-select-wrap">
          <ElSelect
            v-model="filterType"
            class="filter-el"
            placeholder="请选择投放类型"
            clearable
            popper-class="campaign-tab-filter-popper"
            :teleported="true"
          >
            <ElOption v-for="o in typeOptions" :key="o.value" :label="o.label" :value="o.value" />
          </ElSelect>
        </div>
      </div>
      <div class="filter-right">
        <input v-model="searchText" class="search-input" placeholder="输入广告系列名称搜索" />
        <button type="button" class="reset-btn" @click="resetFilters">重置</button>
      </div>
    </div>

    <!-- ── 数据表格 ── -->
    <div class="table-wrap">
      <template v-if="loading">
        <div class="table-skeleton">
          <ElSkeleton :rows="6" animated />
        </div>
      </template>
      <ElEmpty v-else-if="pagedCampaigns.length === 0" description="暂无数据" />
      <table v-else class="data-table">
        <thead>
          <tr>
            <th class="th-app">应用</th>
            <th class="th-name">广告系列名称</th>
            <th>广告平台</th>
            <th>国家</th>
            <th>状态</th>
            <th class="th-budget">广告支出/预算</th>
            <th>预算</th>
            <th>代投消耗</th>
            <th>首日ROI</th>
            <th>预估利润</th>
            <th>最低消耗</th>
            <th>CPI</th>
            <th>趋势</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="c in pagedCampaigns"
            :key="c.id"
            :class="[
              'data-row',
              c.status === 'warn' ? 'row-warn' : c.status === 'inactive' ? 'row-inactive' : ''
            ]"
          >
            <!-- 应用图标 -->
            <td
              ><span class="app-icon-sm">{{ appIconDisplay(c) }}</span></td
            >

            <!-- 广告系列名称 -->
            <td class="name-cell">{{ c.name }}</td>

            <!-- 广告平台 -->
            <td>
              <span
                class="plat-badge"
                :style="{ background: platformColor(c.platform), color: '#fff' }"
                >{{ platformBadgeDisplay(c) }}</span
              >
            </td>

            <!-- 国家 -->
            <td>
              <span class="country-cell">
                <span
                  v-if="countryFlagFiClass(rowCountryCode(c))"
                  class="campaign-tab-flag"
                  :class="countryFlagFiClass(rowCountryCode(c))"
                  :title="rowCountryCode(c)"
                ></span>
                <span class="country-code">{{ rowCountryCode(c) || '—' }}</span>
              </span>
            </td>

            <!-- 状态 -->
            <td>
              <span class="status-cell" :style="statusStyle(c.status)">
                <i class="dot" :style="{ background: statusStyle(c.status).color }"></i>
                <span v-if="c.status === 'active'">激活</span>
                <span v-else-if="c.status === 'warn'">⚠ 超预算</span>
                <span v-else>○ 未启动</span>
              </span>
            </td>

            <!-- 广告支出/预算 -->
            <td class="budget-cell">
              <div class="budget-nums">
                <span :style="{ color: c.status === 'inactive' ? '#4b5563' : '#e2e8f0' }">
                  {{ fmtNum(c.spend) }}
                </span>
                <span class="budget-sep">/</span>
                <span class="text-dim">{{ fmtNum(c.budget) }}</span>
              </div>
              <div class="mini-prog-wrap">
                <div class="mini-prog-track">
                  <div
                    class="mini-prog-fill"
                    :style="{ width: progressPct(c) + '%', background: progressColor(c) }"
                  ></div>
                </div>
                <span class="mini-pct" :style="{ color: progressColor(c) }"
                  >{{ progressPct(c) }}%</span
                >
              </div>
            </td>

            <!-- 预算 -->
            <td :style="{ color: c.status === 'inactive' ? '#4b5563' : '#94a3b8' }">
              {{ (c.calcSpend ?? 0) > 0 ? fmtNum(c.calcSpend) : '--' }}
            </td>

            <!-- 代投消耗 -->
            <td :style="{ color: c.status === 'inactive' ? '#4b5563' : '#94a3b8' }">
              {{ (c.agencySpend ?? 0) > 0 ? fmtNum(c.agencySpend) : '--' }}
            </td>

            <!-- 首日ROI -->
            <td>
              <span :style="roiStyle(c.roi)" style="font-weight: 600">{{ fmtRoi(c.roi) }}</span>
            </td>

            <!-- 预估利润 -->
            <td>
              <span :style="profitStyle(c.estProfit)" style="font-weight: 600">
                {{ fmtNum(c.estProfit) }}
              </span>
            </td>

            <!-- 最低消耗（API: minSpend） -->
            <td>
              <span :style="minProfitStyle(c.minSpend)">{{ fmtNum(c.minSpend) }}</span>
            </td>

            <!-- CPI（API 可選） -->
            <td :style="{ color: c.cpi == null ? '#4b5563' : '#94a3b8' }">
              {{ fmtCpi(c.cpi) }}
            </td>

            <!-- 趋势 -->
            <td>
              <span class="trend-cell" :style="{ color: trendColor(c.trend ?? undefined) }">{{
                trendSvg(c.trend ?? undefined)
              }}</span>
            </td>

            <!-- 操作 -->
            <td>
              <button class="detail-btn" @click="goToCampaignDetail(c.id, c.name)"> 详情 </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── 分页：Mock 下为前端切片；接接口后 total/page/page_size 与后端一致即可 -->
    <div class="pagination-bar">
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filteredTotal"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        small
        background
        class="campaign-tab-pagination"
      />
    </div>

    <!-- ── 底部汇总栏（本页小计） ── -->
    <div v-if="!loading && pagedCampaigns.length > 0" class="bottom-bar">
      <div class="bar-group">
        <div class="bar-item">
          <span class="bar-label">广告支出小计</span>
          <span class="bar-val" style="color: #10b981">{{ fmtNum(barTotals.spend) }}</span>
        </div>
        <div class="bar-item">
          <span class="bar-label">预算</span>
          <span class="bar-val" style="color: #e2e8f0">{{ fmtNum(barTotals.budget) }}</span>
        </div>
        <div class="bar-item">
          <span class="bar-label">差异</span>
          <span class="bar-val" :style="{ color: barTotals.diff >= 0 ? '#10b981' : '#f97316' }">
            {{ fmtNum(barTotals.diff) }}
          </span>
        </div>
      </div>
      <div class="bar-divider"></div>
      <div class="bar-group">
        <div class="bar-item">
          <span class="bar-label">代投消耗小计</span>
          <span class="bar-val" style="color: #f59e0b">{{ fmtNum(barTotals.agencySpend) }}</span>
        </div>
        <div class="bar-item">
          <span class="bar-label">直投消耗</span>
          <span class="bar-val" style="color: #e2e8f0">{{ fmtNum(barTotals.directSpend) }}</span>
        </div>
        <div class="bar-item">
          <span class="bar-label">代投占比</span>
          <span class="bar-val" style="color: #60a5fa">
            {{ barTotals.spend > 0 ? barTotals.agencyRatio.toFixed(2) + '%' : '--' }}
          </span>
        </div>
      </div>
      <div class="bar-divider"></div>
      <div class="bar-group">
        <div class="bar-item">
          <span class="bar-label">利润小计预估</span>
          <span
            class="bar-val"
            :style="{ color: barTotals.estProfit >= 0 ? '#10b981' : '#ef4444' }"
          >
            {{ fmtNum(barTotals.estProfit) }}
          </span>
        </div>
        <div class="bar-item">
          <span class="bar-label">最低消耗</span>
          <span class="bar-val" style="color: #a78bfa">{{ fmtNum(barTotals.minTotal) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .campaign-tab {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* ── 筛选栏 ── */
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .filter-selects {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-select-wrap {
    display: inline-flex;
  }

  .filter-el {
    min-width: 154px;
  }

  .filter-el--app {
    min-width: 120px;
  }

  .filter-select-wrap :deep(.el-select__wrapper) {
    gap: 6px;
    min-height: 30px;
    padding: 5px 28px 5px 12px;
    font-size: 12px;
    color: var(--text-secondary);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
    box-shadow: none;
    transition: border-color 0.2s;
  }

  .filter-select-wrap :deep(.el-select__wrapper.is-hovering) {
    border-color: #2a4060;
  }

  .filter-select-wrap :deep(.el-select__wrapper.is-focused) {
    border-color: var(--teal);
    box-shadow: none;
  }

  .filter-select-wrap :deep(.el-select__selected-item) {
    font-size: 12px;
    font-weight: 400;
    color: var(--text-secondary);
  }

  .filter-select-wrap :deep(.el-select__placeholder) {
    font-size: 12px;
    color: var(--text-dim);
  }

  .filter-select-wrap :deep(.el-select__caret) {
    font-size: 10px;
    color: var(--text-dim);
  }

  .filter-right {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .search-input {
    width: 180px;
    padding: 5px 12px;
    font-size: 12px;
    color: var(--text-primary);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
    outline: none;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    border-color: var(--teal);
  }

  .search-input::placeholder {
    color: var(--text-dim);
  }

  .reset-btn {
    padding: 5px 12px;
    font-size: 12px;
    color: var(--teal);
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    background: var(--teal-dim);
  }

  /* ── 表格 ── */
  .table-wrap {
    padding: 16px;
    overflow: auto;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .table-skeleton {
    min-height: 200px;
  }

  .data-table {
    width: 100%;
    min-width: 1200px;
    font-size: 12px;
    border-collapse: collapse;
  }

  .data-table th {
    position: sticky;
    top: 0;
    padding: 10px;
    font-weight: 500;
    color: var(--text-dim);
    text-align: left;
    white-space: nowrap;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border);
  }

  .th-name {
    min-width: 200px;
  }

  .th-budget {
    min-width: 140px;
  }

  .data-row td {
    padding: 10px;
    vertical-align: middle;
    border-bottom: 1px solid rgb(30 47 69 / 40%);
  }

  .data-row:last-child td {
    border-bottom: none;
  }

  .data-row:hover td {
    background: rgb(15 25 41 / 60%);
  }

  .row-warn {
    border-left: 2px solid #f59e0b;
  }

  .row-warn td {
    background: rgb(146 64 14 / 5%);
  }

  .row-inactive {
    opacity: 0.55;
  }

  .app-icon-sm {
    font-size: 16px;
  }

  .name-cell {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .plat-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 4px;
  }

  .country-cell {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  /* 勿覆盖 .fi 的宽高/line-height，否则 flag-icons 背景图不可见 */
  .campaign-tab-flag {
    flex-shrink: 0;
    margin-right: 2px;
    border-radius: 1px;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 12%);
  }

  .country-code {
    font-size: 11px;
    color: var(--text-secondary, #94a3b8);
  }

  .status-cell {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 11px;
    white-space: nowrap;
  }

  .dot {
    display: inline-block;
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  /* ── 预算进度 ── */
  .budget-cell {
    min-width: 130px;
  }

  .budget-nums {
    display: flex;
    gap: 2px;
    align-items: center;
    font-size: 12px;
  }

  .budget-sep {
    color: var(--text-dim);
  }

  .text-dim {
    color: var(--text-dim);
  }

  .mini-prog-wrap {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-top: 4px;
  }

  .mini-prog-track {
    flex: 1;
    height: 4px;
    overflow: hidden;
    background: var(--bg-card2);
    border-radius: 2px;
  }

  .mini-prog-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s;
  }

  .mini-pct {
    min-width: 28px;
    font-size: 11px;
    font-weight: 500;
  }

  /* ── 趋势 ── */
  .trend-cell {
    font-size: 16px;
    font-weight: 700;
  }

  /* ── 详情按钮 ── */
  .detail-btn {
    padding: 3px 10px;
    font-size: 11px;
    color: var(--teal);
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 4px;
    transition: all 0.2s;
  }

  .detail-btn:hover {
    background: var(--teal-dim);
    border-color: var(--teal);
  }

  /* ── 分页（对齐原自定义 .page-info / .page-btn / .page-size-select 视觉） ── */
  .pagination-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
    font-size: 12px;
  }

  .campaign-tab-pagination {
    justify-content: flex-end;
    width: 100%;

    :deep(.el-pagination) {
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
    }

    :deep(.el-pagination__total) {
      margin-right: 8px;
      font-size: 12px;
      color: var(--text-dim);
    }

    :deep(.el-pagination__sizes) {
      margin-right: 0;
    }

    :deep(.el-pagination__jump) {
      margin-left: 0;
      font-size: 12px;
      color: var(--text-dim);
    }

    :deep(.el-pagination__goto),
    :deep(.el-pagination__classifier) {
      color: var(--text-dim);
    }

    :deep(.el-pagination__editor.el-input) {
      width: 48px;
    }

    :deep(.el-pagination__editor .el-input__wrapper) {
      min-height: 28px;
      padding: 0 8px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 4px;
      box-shadow: none;
    }

    :deep(.el-pagination__editor .el-input__inner) {
      font-size: 12px;
      color: var(--text-secondary);
      text-align: center;
    }

    :deep(.el-select .el-select__wrapper) {
      gap: 4px;
      min-height: 28px;
      padding: 4px 28px 4px 8px;
      font-size: 12px;
      color: var(--text-secondary);
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 4px;
      box-shadow: none;
    }

    :deep(.el-select:hover .el-select__wrapper) {
      border-color: #2a4060;
    }

    :deep(.el-select .el-select__caret) {
      font-size: 10px;
      color: var(--text-dim);
    }

    :deep(.el-pagination.is-background .btn-prev),
    :deep(.el-pagination.is-background .btn-next),
    :deep(.el-pagination.is-background .el-pager li) {
      min-width: 28px;
      height: 28px;
      margin: 0 2px;
      font-size: 12px;
      font-weight: 400;
      color: var(--text-secondary);
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 4px;
      box-shadow: none;
    }

    :deep(.el-pagination.is-background .btn-prev:not(:disabled):hover),
    :deep(.el-pagination.is-background .btn-next:not(:disabled):hover),
    :deep(.el-pagination.is-background .el-pager li:not(.is-active):hover) {
      color: #00d4aa;
      border-color: #00d4aa;
    }

    :deep(.el-pagination.is-background .el-pager li.is-active) {
      font-weight: 600;
      color: #000;
      background: var(--teal);
      border-color: var(--teal);
    }

    :deep(.el-pagination.is-background .btn-prev.is-disabled),
    :deep(.el-pagination.is-background .btn-next.is-disabled) {
      color: var(--text-dim);
      background: var(--bg-card);
      border-color: var(--border);
      opacity: 0.55;
    }
  }

  /* ── 底部汇总栏 ── */
  .bottom-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    align-items: center;
    padding: 12px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .bar-group {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 0 20px;
  }

  .bar-group:first-child {
    padding-left: 0;
  }

  .bar-divider {
    width: 1px;
    height: 40px;
    margin: 0 4px;
    background: var(--border);
  }

  .bar-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .bar-label {
    font-size: 11px;
    color: var(--text-dim);
  }

  .bar-val {
    font-size: 18px;
    font-weight: 700;
  }
</style>

<style lang="scss">
  .campaign-tab-filter-popper.el-popper {
    background: #0f1929;
    border: 1px solid #1e2f45;
  }

  .campaign-tab-filter-popper .el-select-dropdown__item {
    font-size: 12px;
    color: #e2e8f0;
  }

  .campaign-tab-filter-popper .el-select-dropdown__item.is-hovering {
    background: rgb(0 212 170 / 12%);
  }

  .campaign-tab-filter-popper .el-select-dropdown__item.is-selected {
    font-weight: 600;
    color: #00d4aa;
  }
</style>
