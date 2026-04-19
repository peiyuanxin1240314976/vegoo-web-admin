<template>
  <div ref="rootRef" class="finance-screen-root">
    <div class="finance-screen-wrap">
      <div class="aps-page-fx" aria-hidden="true"></div>
      <!-- 顶栏：日期 + 筛选 + 导出（常驻，不随数据骨架整页隐藏） -->
      <header class="finance-header aps-entry-1">
        <div class="aps-filter-toolbar">
          <div class="aps-filter-toolbar__row">
            <div class="header-left">
              <AppDatePicker
                v-model="dateRange"
                type="daterange"
                range-separator="~"
                :shortcuts="dateRangeShortcuts"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
                class="aps-date-picker"
                :teleported="true"
                popper-class="aps-filter-popper"
              />
            </div>
            <div class="header-filters">
              <AppPlatformSearchSelect
                v-model="combinedFilterValue"
                mode="combined"
                placeholder="全部 Apps / 平台"
                search-placeholder="搜索类别/应用名称/应用简称"
                :setting-apps="combinedSettingApps"
                :platform-options="combinedPlatformOptions"
                :min-width="200"
                :max-width="220"
                :height="36"
                input-class="aps-filter-select"
                dropdown-class="aps-filter-popper"
                @change="onCombinedFilterChange"
              />

              <!-- <el-select
                v-model="filters.channelKey"
                class="aps-filter-select"
                popper-class="aps-filter-popper"
                :teleported="true"
                :fit-input-width="true"
                :placeholder="filtersPlaceholders.channel"
                filterable
                clearable
              >
                <el-option
                  v-for="opt in channelOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select> -->
            </div>
            <el-button type="primary" plain round @click="runDashboardQuery">查询</el-button>
            <el-button type="primary" plain round @click="runDashboardQuery">导出报表</el-button>
          </div>
        </div>
      </header>

      <!-- 第一排：广告平台 KPI 卡片（筛选 App/终端平台时局部骨架，隐藏真实卡片） -->
      <section v-if="showKpiRowSkeleton" class="row row-1 aps-entry-2">
        <div
          v-for="n in KPI_SKELETON_CARD_COUNT"
          :key="`s-${n}`"
          class="kpi-card kpi-card--skeleton"
        >
          <ElSkeleton animated :rows="5" />
        </div>
      </section>
      <section v-else class="row row-1 aps-entry-2">
        <div v-for="card in filteredChannelKpiCards" :key="card.id" class="kpi-card">
          <div class="kpi-card-head">
            <div class="kpi-card-head-main">
              <div
                class="kpi-card-logo"
                :class="[
                  `kpi-card-logo--${kpiCardClassSuffix(card)}`,
                  { 'is-placeholder': !shouldShowKpiLogoImg(card) }
                ]"
              >
                <img
                  v-if="shouldShowKpiLogoImg(card)"
                  class="kpi-card-logo-img"
                  :src="kpiCardLogoUrl(card)"
                  alt=""
                  @error="onKpiCardLogoError(card.id)"
                />
                <span v-else class="kpi-card-logo-fallback">{{
                  kpiCardLogoFallbackChar(card)
                }}</span>
              </div>
              <span class="kpi-card-name">{{ card.name }}</span>
            </div>
          </div>
          <div class="kpi-card-roi">
            <span class="roi-value">{{ formatKpiRoi(card.roi) }}</span>
            <span class="roi-change" :class="card.roiChangeUp ? 'up' : 'down'">
              {{ card.roiChangeUp ? '+' : '' }}{{ formatNum2(card.roiChange) }}%
            </span>
          </div>
          <div class="kpi-card-metrics">
            <span>花费 {{ card.cost }}</span>
            <span>收入 {{ card.revenue }}</span>
            <span>CPI {{ card.cpi }}</span>
          </div>
          <div :ref="(el) => setCardChartRef(card.id, el)" class="kpi-card-mini-chart"></div>
        </div>
      </section>

      <!-- 第二排：各面板独立骨架，与接口一一对应 -->
      <section class="row row-2 aps-entry-3">
        <div class="panel panel-trend">
          <div class="panel-title">广告平台ROI趋势分析 (最近30天)</div>
          <div class="panel-chart-host">
            <div v-if="roiTrendFetchPending" class="aps-module-skeleton aps-module-skeleton--chart">
              <ElSkeleton animated :rows="10" />
            </div>
            <div v-show="!roiTrendFetchPending" ref="roiTrendRef" class="chart-dom"></div>
          </div>
        </div>
        <!-- <div class="panel panel-heatmap">
          <div class="panel-title">用户质量热力图</div>
          <div class="heatmap-wrap panel-chart-host">
            <div
              v-if="qualityHeatmapFetchPending"
              class="aps-module-skeleton aps-module-skeleton--chart"
            >
              <ElSkeleton animated :rows="10" />
            </div>
            <div
              v-show="!qualityHeatmapFetchPending"
              ref="qualityHeatmapRef"
              class="chart-dom quality-heatmap-dom"
            ></div>
          </div>
        </div> -->

        <ApaTop10Panel
          :pending="topCampaignsFetchPending"
          :rows="filteredTopCampaigns"
          :row-key="topCampaignRowKey"
          :format-top-currency="formatTopCurrency"
          :format-num2="formatNum2"
          :source-badge-short="sourceBadgeShort"
          :roi-tone="topCampaignRoiTone"
          :on-view="onViewTopCampaign"
        />
      </section>

      <!-- 第三排：广告平台指标比较详情表格 -->
      <ApaMetricsTablePanel
        :pending="metricsTableFetchPending"
        :skeleton-rows="metricsTableSkeletonRows"
        :rows="paginatedMetrics"
        :columns="detailColumns"
        :pagination="{ current: currentPage, size: pageSize, total: metricsTotal }"
        :on-current-change="onMetricsCurrentChange"
        :on-size-change="onPageSizeChange"
        :on-sort-change="onSortChange"
        :format-num2="formatNum2"
        :format-usd2="formatUsd2"
        :status-text="statusText"
        :metric-sparkline-bars="metricSparklineBars"
        :user-quality-progress-percent="userQualityProgressPercent"
        :user-quality-progress-color="userQualityProgressColor"
        :on-view-detail="onViewMetricsPlatformDetail"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="AdPlatformAnalysis">
  import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import AppPlatformSearchSelect, {
    type AppPlatformSearchSelectPayload
  } from '@/components/filter/app-platform-search-select.vue'
  import { useChart } from '@/hooks/core/useChart'
  import { graphic, type EChartsOption } from '@/plugins/echarts'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'
  import { toAppIdsRequestBody } from '@/utils/app-id-request'
  import type { ColumnOption } from '@/types'
  import ApaTop10Panel from './modules/top10-panel.vue'
  import ApaMetricsTablePanel from './modules/metrics-table-panel.vue'
  import { getAppNow } from '@/utils/app-now'
  import {
    fetchAdPlatformAnalysisCampaignTop10,
    fetchAdPlatformAnalysisFiltersMeta,
    fetchAdPlatformAnalysisKpiCards,
    fetchAdPlatformAnalysisMetricsTable,
    fetchAdPlatformAnalysisRoiTrend
  } from '@/api/user-growth'
  import {
    type ChannelKpiCard,
    type ChannelMetricRow,
    type ChannelRoiTrend,
    type ChannelStatus,
    type TopCampaignRow
  } from './mock'

  defineOptions({ name: 'FinanceScreen' })
  const router = useRouter()
  const cockpitMetaStore = useCockpitMetaFilterStore()

  const KPI_SKELETON_CARD_COUNT = 5

  const pageSize = ref(10)

  const rootRef = ref<HTMLElement>()

  function getDefaultDateRange(): [string, string] {
    const now = getAppNow()
    const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - 29)
    const start = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`
    return [start, end]
  }

  const dateRange = ref<[string, string]>(getDefaultDateRange())

  const channelKpiCards = ref<ChannelKpiCard[]>([])

  const kpiFetchPending = ref(false)

  /** KPI 行：任意一次拉取中即显示骨架（首屏与筛选刷新一致） */
  const showKpiRowSkeleton = computed(() => kpiFetchPending.value)

  const roiTrendFetchPending = ref(false)
  const topCampaignsFetchPending = ref(false)
  /** 首屏 true，避免在首次请求发出前闪空表 */
  const metricsTableFetchPending = ref(true)

  /** 骨架行数与当前分页条数接近，占位高度贴近真实表格 */
  const metricsTableSkeletonRows = computed(() => Math.min(14, Math.max(8, pageSize.value + 3)))

  /** 有地址但加载失败时回退为占位块 */
  const kpiLogoLoadFailedIds = ref<string[]>([])

  function kpiCardLogoUrl(card: ChannelKpiCard) {
    return (card.logo ?? '').trim()
  }

  function shouldShowKpiLogoImg(card: ChannelKpiCard) {
    const url = kpiCardLogoUrl(card)
    return url.length > 0 && !kpiLogoLoadFailedIds.value.includes(card.id)
  }

  function onKpiCardLogoError(id: string) {
    if (!kpiLogoLoadFailedIds.value.includes(id)) {
      kpiLogoLoadFailedIds.value = [...kpiLogoLoadFailedIds.value, id]
    }
  }

  function kpiCardLogoFallbackChar(card: ChannelKpiCard) {
    const map: Record<string, string> = {
      google: 'G',
      facebook: 'f',
      tiktok: 'T',
      unity: 'U',
      kwai: 'K'
    }
    return (
      map[card.id] ??
      String(card.name ?? '')
        .slice(0, 1)
        .toUpperCase()
    )
  }
  const roiTrendData = ref<ChannelRoiTrend>({ dates: [], series: [] })

  const channelMetrics = ref<ChannelMetricRow[]>([])
  const metricsTotal = ref(0)
  const topCampaigns = ref<TopCampaignRow[]>([])

  type SelectOption<T extends string = string> = { label: string; value: T }

  const filters = ref({
    app: 'all' as string,
    platform: 'all' as string,
    channelKey: 'all' as string
  })
  const combinedFilterValue = ref('')

  // const filtersPlaceholders = {
  //   app: '全部Apps',
  //   platform: 'IOS & Android',
  //   channel: '全部广告平台'
  // } as const

  const ALL_APP_OPTION: SelectOption = { label: '全部Apps', value: 'all' }
  const ALL_PLATFORM_OPTION: SelectOption = { label: 'IOS & Android', value: 'all' }
  const ALL_SOURCE_OPTION: SelectOption = { label: '全部广告平台', value: 'all' }

  /** 接口 /filters/meta 返回的选项（不含「全部」） */
  const metaAppOptions = ref<SelectOption[]>([])
  const metaPlatformOptions = ref<SelectOption[]>([])
  const metaSourceOptions = ref<SelectOption[]>([])

  function normalizeFiltersMetaOptions(
    list: Api.UserGrowth.AdPlatformFiltersMetaOptionDto[] | null | undefined
  ): SelectOption[] {
    if (!Array.isArray(list)) return []
    const out: SelectOption[] = []
    const seen = new Set<string>()
    for (const x of list) {
      const label = String(x?.label ?? '').trim()
      const valueRaw = String(x?.value ?? '').trim()
      if (!label && !valueRaw) continue
      const value = valueRaw || normalizeChannelKey(label)
      if (!value || seen.has(value)) continue
      seen.add(value)
      out.push({ label: label || valueRaw, value })
    }
    return out
  }

  function ensureFilterSelectionsInMeta() {
    const appVals = new Set([ALL_APP_OPTION, ...metaAppOptions.value].map((o) => o.value))
    if (!appVals.has(filters.value.app)) filters.value.app = 'all'

    const platVals = new Set(
      [ALL_PLATFORM_OPTION, ...metaPlatformOptions.value].map((o) => o.value)
    )
    if (!platVals.has(filters.value.platform)) filters.value.platform = 'all'

    const srcVals = new Set([ALL_SOURCE_OPTION, ...metaSourceOptions.value].map((o) => o.value))
    if (!srcVals.has(filters.value.channelKey)) filters.value.channelKey = 'all'

    syncCombinedFilterValue()
  }

  function syncCombinedFilterValue() {
    if (filters.value.app !== 'all' && filters.value.app) {
      const hit = combinedSettingApps.value.find(
        (item) =>
          String(item.sAppId ?? '').trim() === String(filters.value.app).trim() &&
          String(item.platformName ?? '')
            .trim()
            .toLowerCase() === selectedPlatformLabel.value.toLowerCase()
      )
      if (hit) {
        combinedFilterValue.value = `app::${filters.value.app}::${filters.value.platform}`
        return
      }
      combinedFilterValue.value = `app::${filters.value.app}::${filters.value.platform}`
      return
    }
    if (filters.value.platform !== 'all' && filters.value.platform) {
      combinedFilterValue.value = `platform::${filters.value.platform}`
      return
    }
    combinedFilterValue.value = ''
  }

  const selectedPlatformLabel = computed(() => {
    const value = String(filters.value.platform ?? '').trim()
    if (!value || value === 'all') return ''
    return String(
      metaPlatformOptions.value.find((item) => item.value === value)?.label ?? ''
    ).trim()
  })

  function onCombinedFilterChange(payload: AppPlatformSearchSelectPayload | null) {
    if (!payload) {
      filters.value.app = 'all'
      filters.value.platform = 'all'
      combinedFilterValue.value = ''
      return
    }

    if (payload.selectionType === 'platform') {
      filters.value.platform = String(payload.platformCode || payload.value || 'all')
      filters.value.app = 'all'
      syncCombinedFilterValue()
      return
    }

    filters.value.app = payload.appId || 'all'
    filters.value.platform = String(payload.platformCode || '').trim() || 'all'
    syncCombinedFilterValue()
  }

  async function loadFiltersMeta() {
    try {
      await cockpitMetaStore.ensureLoaded()
      const data = await fetchAdPlatformAnalysisFiltersMeta()
      metaAppOptions.value = normalizeFiltersMetaOptions(data?.apps)
      metaPlatformOptions.value = normalizeFiltersMetaOptions(data?.platforms)
      metaSourceOptions.value = normalizeFiltersMetaOptions(data?.sources)
      ensureFilterSelectionsInMeta()
    } catch {
      metaAppOptions.value = []
      metaPlatformOptions.value = []
      metaSourceOptions.value = []
      filters.value.app = 'all'
      filters.value.platform = 'all'
      filters.value.channelKey = 'all'
    }
  }

  const platformOptions = computed<SelectOption[]>(() => [
    ALL_PLATFORM_OPTION,
    ...metaPlatformOptions.value
  ])
  const combinedPlatformOptions = computed<SelectOption[]>(() =>
    platformOptions.value.filter((item) => item.value !== 'all')
  )
  const combinedSettingApps = computed(() => {
    const settingApps = cockpitMetaStore.data?.settingApps ?? []
    const appValueSet = new Set(metaAppOptions.value.map((item) => item.value))
    const platformValueSet = new Set(metaPlatformOptions.value.map((item) => item.value))

    return settingApps.filter((item) => {
      const appId = String(item.sAppId ?? '').trim()
      if (appValueSet.size > 0 && !appValueSet.has(appId)) return false
      if (platformValueSet.size === 0) return true
      const platformName = String(item.platformName ?? '')
        .trim()
        .toLowerCase()
      const platformCode = String(item.nPlatform ?? '')
        .trim()
        .toLowerCase()
      return (
        platformValueSet.has(platformCode) ||
        (platformCode === '0' && platformValueSet.has('android')) ||
        (platformCode === '1' && platformValueSet.has('ios')) ||
        (platformCode === '2' && platformValueSet.has('web')) ||
        [...platformValueSet].some((value) => platformName === value.toLowerCase())
      )
    })
  })

  function normalizeChannelKey(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+ads\b/g, '')
      .replace(/[^\w]+/g, '')
  }

  /** 与后端约定：全页模块共用同一请求体；筛选项映射到 appIds / platform / source */
  function buildAdPlatformAnalysisRequestParams(): Api.UserGrowth.AdPlatformAnalysisRequestParams {
    const f = filters.value
    const selectedAppId = f.app === 'all' ? '' : String(f.app ?? '').trim()
    const platform =
      f.platform === 'all'
        ? ''
        : String(f.platform ?? '')
            .trim()
            .toLowerCase()
    const ck = f.channelKey
    const source = ck == null || String(ck).trim() === '' || ck === 'all' ? '' : String(ck).trim()

    const [dateStart = '', dateEnd = ''] = dateRange.value ?? []

    return {
      appIds: toAppIdsRequestBody(selectedAppId),
      currentPage: 0,
      dateEnd,
      dateStart,
      groupBy: '',
      pageSize: 0,
      platform,
      source,
      userId: ''
    }
  }

  function normalizeAdPlatformRoiTrendDto(
    raw: Api.UserGrowth.AdPlatformRoiTrendDto | null | undefined
  ): ChannelRoiTrend {
    const dates = Array.isArray(raw?.dates) ? raw!.dates.map((x) => String(x ?? '')) : []
    const series = Array.isArray(raw?.series)
      ? raw!.series.map((s) => ({
          name: String(s?.name ?? ''),
          data: Array.isArray(s?.data)
            ? s!.data
                .map((v) => (typeof v === 'number' ? v : Number(v)))
                .filter((n) => Number.isFinite(n))
            : []
        }))
      : []
    return { dates, series }
  }

  function cloneRoiTrend(src: ChannelRoiTrend): ChannelRoiTrend {
    return {
      dates: [...src.dates],
      series: src.series.map((s) => ({ name: s.name, data: [...s.data] }))
    }
  }

  async function loadRoiTrend() {
    roiTrendFetchPending.value = true
    const prev = cloneRoiTrend(roiTrendData.value)
    try {
      const data = await fetchAdPlatformAnalysisRoiTrend(buildAdPlatformAnalysisRequestParams())
      roiTrendData.value = normalizeAdPlatformRoiTrendDto(data)
    } catch {
      roiTrendData.value = prev
    } finally {
      roiTrendFetchPending.value = false
      await tryMountRoiTrendChart()
    }
  }

  function mapCampaignTop10Dto(d: Api.UserGrowth.AdPlatformCampaignTop10RowDto): TopCampaignRow {
    const source = String(d?.source ?? '').trim()
    const cid = String(d?.campaignId ?? '').trim()
    const appId = String(d?.appId ?? '').trim()
    const appName = String(d?.appName ?? '').trim()
    return {
      campaignId: cid || undefined,
      campaign: String(d?.campaignName ?? '').trim() || '—',
      channel: source || '—',
      sourceKey: normalizeChannelKey(source || 'x'),
      ...(appId ? { appId } : {}),
      ...(appName ? { appName } : {}),
      cost:
        typeof d?.cost === 'number' && Number.isFinite(d.cost)
          ? d.cost
          : Number.parseFloat(String(d?.cost ?? '')) || 0,
      cpi:
        typeof d?.cpi === 'number' && Number.isFinite(d.cpi)
          ? d.cpi
          : Number.parseFloat(String(d?.cpi ?? '')) || 0,
      roi:
        typeof d?.roi === 'number' && Number.isFinite(d.roi)
          ? d.roi
          : Number.parseFloat(String(d?.roi ?? '')) || 0
    }
  }

  function normalizeCampaignTop10List(
    raw: Api.UserGrowth.AdPlatformCampaignTop10RowDto[] | null | undefined
  ): TopCampaignRow[] {
    if (!Array.isArray(raw)) return []
    return raw.map(mapCampaignTop10Dto)
  }

  async function loadTopCampaigns() {
    topCampaignsFetchPending.value = true
    const prev = topCampaigns.value.map((r) => ({ ...r }))
    try {
      const list = await fetchAdPlatformAnalysisCampaignTop10(
        buildAdPlatformAnalysisRequestParams()
      )
      topCampaigns.value = normalizeCampaignTop10List(list)
    } catch {
      topCampaigns.value = prev
    } finally {
      topCampaignsFetchPending.value = false
    }
  }

  function mapKpiCardDto(d: Api.UserGrowth.AdPlatformKpiCardDto): ChannelKpiCard {
    const name = String(d.name ?? '').trim()
    const rawId = String(d.id ?? '').trim()
    const id = rawId || normalizeChannelKey(name) || `kpi-${name.slice(0, 8) || 'unknown'}`

    const roiRaw = d.roi
    const roi =
      typeof roiRaw === 'number' && Number.isFinite(roiRaw)
        ? roiRaw
        : Number.parseFloat(String(roiRaw ?? '').replace(/,/g, '')) || 0

    const roiChRaw = d.roiChange
    const roiChange =
      typeof roiChRaw === 'number' && Number.isFinite(roiChRaw)
        ? roiChRaw
        : Number.parseFloat(String(roiChRaw ?? '').replace(/,/g, '')) || 0

    const trend = Array.isArray(d.trendData)
      ? d.trendData.map((v) => Number(v)).filter((n) => Number.isFinite(n))
      : []

    return {
      id,
      name,
      logo: String(d.logo ?? '').trim() || undefined,
      roi,
      roiChange,
      roiChangeUp: Boolean(d.roiChangeUp),
      cost: d.cost ?? '',
      revenue: d.revenue ?? '',
      cpi: d.cpi ?? '',
      trendData: trend.length > 0 ? trend : [roi || 0]
    }
  }

  async function loadKpiCards() {
    kpiFetchPending.value = true
    const prev = [...channelKpiCards.value]
    try {
      const list = await fetchAdPlatformAnalysisKpiCards(buildAdPlatformAnalysisRequestParams())
      const rows = Array.isArray(list) ? list : []
      channelKpiCards.value = rows.map(mapKpiCardDto)
      kpiLogoLoadFailedIds.value = []
    } catch {
      channelKpiCards.value = prev.length ? prev : []
    } finally {
      kpiFetchPending.value = false
      await nextTick()
      applyKpiMiniChartsToDom()
    }
  }

  /** 页面数值统一两位小数（千分位 en-US） */
  function formatNum2(value: unknown): string {
    const n =
      typeof value === 'number' && Number.isFinite(value)
        ? value
        : Number.parseFloat(String(value ?? '').replace(/,/g, ''))
    if (!Number.isFinite(n)) return '—'
    return n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  function formatUsd2(value: unknown): string {
    const n =
      typeof value === 'number' && Number.isFinite(value)
        ? value
        : Number.parseFloat(String(value ?? '').replace(/,/g, ''))
    if (!Number.isFinite(n)) return '—'
    return (
      '$' +
      n.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    )
  }

  function formatKpiRoi(roi: number) {
    return formatNum2(roi)
  }

  /** CSS 类名安全后缀（接口 id 可能与历史 mock 选择器不一致，仅影响品牌占位配色） */
  function kpiCardClassSuffix(card: ChannelKpiCard) {
    const raw = String(card.id ?? '').trim() || normalizeChannelKey(card.name)
    const s = raw.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/^-+|-+$/g, '')
    return s || 'card'
  }

  // const channelOptions = computed<SelectOption[]>(() => [
  //   ALL_SOURCE_OPTION,
  //   ...metaSourceOptions.value
  // ])

  /**
   * 前端本地筛选：接口 sources 的 value 可能与 KPI 名称/id 不完全一致，做多路匹配
   */
  function matchesAdPlatformSourceFilter(
    selected: string,
    displayName: string,
    entityId?: string
  ): boolean {
    if (!selected || selected === 'all') return true
    const s = String(selected).trim()
    const name = String(displayName ?? '').trim()
    const id = String(entityId ?? '').trim()
    if (id && (id === s || normalizeChannelKey(id) === normalizeChannelKey(s))) return true
    if (normalizeChannelKey(name) === normalizeChannelKey(s)) return true
    if (normalizeChannelKey(name) === s) return true
    // 下拉 value 常为 n_source 等编码，与 KPI 卡 id（如 facebook）不一致：用 /filters/meta 的 label 与名称对齐
    const srcOpt = metaSourceOptions.value.find((o) => o.value === s)
    if (srcOpt) {
      const labelNorm = normalizeChannelKey(String(srcOpt.label ?? ''))
      if (labelNorm) {
        if (labelNorm === normalizeChannelKey(name)) return true
        if (labelNorm === normalizeChannelKey(id)) return true
      }
    }
    return name === s
  }

  const selectedChannelKey = computed(() =>
    filters.value.channelKey && filters.value.channelKey !== '' ? filters.value.channelKey : 'all'
  )

  const filteredChannelKpiCards = computed(() => {
    const sel = selectedChannelKey.value
    if (sel === 'all') return channelKpiCards.value
    return channelKpiCards.value.filter((c) => matchesAdPlatformSourceFilter(sel, c.name, c.id))
  })

  const filteredTopCampaigns = computed(() => {
    const sel = selectedChannelKey.value
    if (sel === 'all') return topCampaigns.value
    return topCampaigns.value.filter((r) => matchesAdPlatformSourceFilter(sel, r.channel))
  })

  function formatTopCurrency(n: number) {
    return formatUsd2(n)
  }

  function sourceBadgeShort(key: string) {
    const map: Record<string, string> = {
      google: 'G',
      facebook: 'f',
      tiktok: 'T',
      unity: 'U',
      kwai: 'K',
      bigo: 'B',
      meta: 'M',
      applovin: 'A'
    }
    const k = String(key ?? '').toLowerCase()
    return map[k] ?? String(k).slice(0, 1).toUpperCase()
  }

  /** ROI 配色：高绿 / 中橙 / 低红（与热力图档位语义一致） */
  function topCampaignRoiTone(roi: number) {
    if (roi >= 1.25) return 'is-good'
    if (roi >= 1.0) return 'is-mid'
    return 'is-bad'
  }

  /** 系列详情 query：优先接口行内 appId/appName，否则用大屏 App 筛选 + 元数据补全名称 */
  function topCampaignDetailAppQuery(row: TopCampaignRow): { appId: string; appName: string } {
    let appId = String(row.appId ?? '').trim()
    let appName = String(row.appName ?? '').trim()
    if (!appId && filters.value.app !== 'all' && filters.value.app) {
      appId = String(filters.value.app).trim()
    }
    if (!appName && appId) {
      appName = String(metaAppOptions.value.find((o) => o.value === appId)?.label ?? '').trim()
    }
    return { appId, appName }
  }

  function onViewTopCampaign(row: TopCampaignRow) {
    const id = row.campaignId?.trim()
    if (!id) {
      ElMessage.warning('缺少广告系列 ID，无法打开详情')
      return
    }
    const { appId, appName } = topCampaignDetailAppQuery(row)
    void router.push({
      name: 'CampaignDetail',
      query: {
        id,
        name: String(row.campaign ?? ''),
        appId,
        appName
      }
    })
  }

  /** 指标比较表跳转详情：优先使用行内 sourceCode + source */
  function onViewMetricsPlatformDetail(row: ChannelMetricRow) {
    const id = String(row.sourceCode ?? '').trim()
    if (!id || id === '—') {
      ElMessage.warning('缺少广告平台标识，无法打开详情')
      return
    }
    const source = String(row.source ?? row.channel ?? '').trim() || normalizeChannelKey(id)
    void router.push({
      name: 'AdPlatformInfo',
      query: { id, source }
    })
  }

  function topCampaignRowKey(row: TopCampaignRow) {
    if (row.campaignId) return row.campaignId
    return [row.campaign, row.channel, row.sourceKey, row.cost, row.cpi, row.roi].join('|')
  }

  const METRIC_SPARKLINE_LEN = 5

  function clampSparklineHeight(n: number) {
    return Math.min(1, Math.max(0.08, n))
  }

  /** ROI / CPI 列迷你柱图（5 根）；接口可传 roiSparkline / cpiSparkline，否则按 channel 确定性生成 */
  function metricSparklineBars(row: ChannelMetricRow, kind: 'roi' | 'cpi'): number[] {
    const fromRow = kind === 'roi' ? row.roiSparkline : row.cpiSparkline
    if (fromRow && fromRow.length === METRIC_SPARKLINE_LEN) {
      return fromRow.map((v) => clampSparklineHeight(Number(v)))
    }
    const key = `${row.channel}:${kind}`
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0
    }
    const base = [0.22, 0.52, 0.28, 0.92, 0.48]
    return base.map((b, i) => {
      const jitter = ((hash >> (i * 3)) & 31) / 200
      return clampSparklineHeight(b + jitter - 0.05)
    })
  }

  function userQualityProgressPercent(value: number) {
    return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))
  }

  function userQualityProgressColor(trendUp: boolean) {
    return trendUp ? 'var(--art-success)' : 'var(--art-danger)'
  }

  type SortOrder = 'ascending' | 'descending' | null
  const sortState = ref<{ prop: keyof ChannelMetricRow | null; order: SortOrder }>({
    prop: null,
    order: null
  })

  function parseAbbrNumber(input: unknown) {
    const s = String(input ?? '').trim()
    const m = s.match(/-?\d+(?:\.\d+)?/)
    if (!m) return Number.NaN
    const n = Number(m[0])
    const upper = s.toUpperCase()
    const factor = upper.includes('B')
      ? 1e9
      : upper.includes('M')
        ? 1e6
        : upper.includes('K')
          ? 1e3
          : 1
    return n * factor
  }

  function getSortValue(row: ChannelMetricRow, prop: keyof ChannelMetricRow): string | number {
    switch (prop) {
      case 'cost':
      case 'revenue':
      case 'installs':
        return parseAbbrNumber(row[prop])
      case 'status': {
        const rank: Record<ChannelStatus, number> = { excellent: 3, average: 2, poor: 1 }
        return rank[row.status] ?? 0
      }
      default: {
        const val = row[prop]
        if (typeof val === 'number') return val
        if (typeof val === 'boolean') return val ? 1 : 0
        return String(val ?? '')
      }
    }
  }

  const sortedChannelMetrics = computed(() => {
    const list = [...channelMetrics.value]
    const { prop, order } = sortState.value
    if (!prop || !order) return list

    const dir = order === 'ascending' ? 1 : -1
    return list.sort((a, b) => {
      const av = getSortValue(a, prop)
      const bv = getSortValue(b, prop)

      if (typeof av === 'number' && typeof bv === 'number') {
        const aNum = Number.isNaN(av) ? -Infinity : av
        const bNum = Number.isNaN(bv) ? -Infinity : bv
        return (aNum - bNum) * dir
      }
      return String(av ?? '').localeCompare(String(bv ?? '')) * dir
    })
  })

  const filteredRoiTrend = computed(() => {
    const base = roiTrendData.value
    const sel = selectedChannelKey.value
    if (sel === 'all') return base
    return {
      dates: base.dates,
      series: base.series.filter((s) => matchesAdPlatformSourceFilter(sel, s.name))
    }
  })

  const currentPage = ref(1)
  /** 当前页数据由接口返回；排序仅作用于本页 */
  const paginatedMetrics = computed(() => sortedChannelMetrics.value)

  /** 表格分页：后端 currentPage 为 0 起算，与 ArtTable 的 1 起算对齐 */
  function buildMetricsTableRequestParams(): Api.UserGrowth.AdPlatformAnalysisRequestParams {
    return {
      ...buildAdPlatformAnalysisRequestParams(),
      currentPage: Math.max(0, currentPage.value - 1),
      pageSize: pageSize.value
    }
  }

  function parseMetricNum(v: unknown): number {
    if (typeof v === 'number' && Number.isFinite(v)) return v
    const n = Number.parseFloat(String(v ?? ''))
    return Number.isFinite(n) ? n : 0
  }

  function mapMetricsTableRowDto(d: Api.UserGrowth.AdPlatformMetricsTableRowDto): ChannelMetricRow {
    const st = String(d?.status ?? '').toLowerCase()
    const status: ChannelStatus =
      st === 'excellent' || st === 'average' || st === 'poor' ? st : 'average'
    const sourceName = String(d?.source ?? '').trim()
    const channel = sourceName || '—'
    const sourceCode = String((d as { sourceCode?: string | number })?.sourceCode ?? '').trim()
    const sourceKey = String(d?.sourceKey ?? '').trim()
    const id = sourceCode || sourceKey || (channel !== '—' ? normalizeChannelKey(channel) : '')
    return {
      channel,
      source: sourceName || undefined,
      sourceCode: id || undefined,
      cost: String(d?.cost ?? ''),
      revenue: String(d?.revenue ?? ''),
      roi: parseMetricNum(d?.roi),
      roiTrendUp: Boolean(d?.roiTrendUp),
      roas: parseMetricNum(d?.roas),
      cpi: parseMetricNum(d?.cpi),
      cpiTrendUp: Boolean(d?.cpiTrendUp),
      installs: String(d?.installs ?? ''),
      userQualityD7: parseMetricNum(d?.userQualityD7),
      userQualityD7TrendUp: Boolean(d?.userQualityD7TrendUp),
      userQualityPay: parseMetricNum(d?.userQualityPay),
      userQualityPayTrendUp: Boolean(d?.userQualityPayTrendUp),
      ltv7: parseMetricNum(d?.ltv7),
      ltv30: parseMetricNum(d?.ltv30),
      status
    }
  }

  async function loadMetricsTable() {
    metricsTableFetchPending.value = true
    const prevRows = channelMetrics.value.map((r) => ({ ...r }))
    const prevTotal = metricsTotal.value
    try {
      const res = await fetchAdPlatformAnalysisMetricsTable(buildMetricsTableRequestParams())
      const rows = Array.isArray(res?.rows) ? res!.rows : []
      channelMetrics.value = rows.map(mapMetricsTableRowDto)
      metricsTotal.value =
        typeof res?.total === 'number' && Number.isFinite(res.total)
          ? Math.max(0, Math.floor(res.total))
          : 0
    } catch {
      channelMetrics.value = prevRows
      metricsTotal.value = prevTotal
    } finally {
      metricsTableFetchPending.value = false
    }
  }

  const detailColumns = computed((): ColumnOption<ChannelMetricRow>[] => {
    return [
      { label: '广告平台名称', prop: 'channel', minWidth: 140, sortable: 'custom' },
      { label: '花费', prop: 'cost', minWidth: 90, sortable: 'custom' },
      { label: '收入', prop: 'revenue', minWidth: 90, sortable: 'custom' },
      { label: 'ROI', prop: 'roi', minWidth: 90, useSlot: true, sortable: 'custom' },
      // {
      //   label: 'ROAS',
      //   prop: 'roas',
      //   minWidth: 80,
      //   sortable: 'custom',
      //   formatter: (row: ChannelMetricRow) => formatNum2(row.roas)
      // },
      { label: 'CPI', prop: 'cpi', minWidth: 90, useSlot: true, sortable: 'custom' },
      { label: '安装量', prop: 'installs', minWidth: 80, sortable: 'custom' },
      // {
      //   label: 'User Quality (D7)',
      //   prop: 'userQualityD7',
      //   minWidth: 140,
      //   useSlot: true,
      //   sortable: 'custom'
      // },
      {
        label: 'User Quality(Pay%)',
        prop: 'userQualityPay',
        minWidth: 160,
        useSlot: true,
        sortable: 'custom'
      },
      // {
      //   label: 'LTV_7',
      //   prop: 'ltv7',
      //   minWidth: 90,
      //   sortable: 'custom',
      //   formatter: (row: ChannelMetricRow) => formatUsd2(row.ltv7)
      // },
      // {
      //   label: 'LTV_30',
      //   prop: 'ltv30',
      //   minWidth: 90,
      //   sortable: 'custom',
      //   formatter: (row: ChannelMetricRow) => formatUsd2(row.ltv30)
      // },
      // {
      //   label: '状态/Status',
      //   prop: 'status',
      //   minWidth: 110,
      //   useSlot: true,
      //   sortable: 'custom'
      // },
      {
        label: '操作',
        prop: 'metricsDetailAction',
        width: 72,
        align: 'center',
        fixed: 'right',
        useSlot: true
      }
    ]
  })

  function onPageSizeChange(size: number) {
    pageSize.value = size
    currentPage.value = 1
    void loadMetricsTable()
  }

  function onMetricsCurrentChange(p: number) {
    currentPage.value = p
    void loadMetricsTable()
  }

  function onSortChange(payload: { column: any; prop: string; order: SortOrder }) {
    sortState.value = {
      prop: (payload.prop as keyof ChannelMetricRow) || null,
      order: payload.order ?? null
    }
  }

  function statusText(s: ChannelStatus) {
    const map: Record<ChannelStatus, string> = { excellent: '优秀', average: '一般', poor: '较差' }
    return map[s] ?? s
  }

  // 用户质量热力图模块已按需求注释掉（含接口、状态与图表渲染）

  /* function buildQualityHeatmapOption(): EChartsOption {
    const metrics: { key: HeatmapMetric; label: string; format: (v: number) => string }[] = [
      { key: 'd1', label: 'D1留存', format: (v) => `${formatNum2(v)}%` },
      { key: 'd7', label: 'D7留存', format: (v) => `${formatNum2(v)}%` },
      { key: 'd30', label: 'D30留存', format: (v) => `${formatNum2(v)}%` },
      { key: 'pay', label: '付费率', format: (v) => `${formatNum2(v)}%` },
      { key: 'arpu', label: 'ARPU', format: (v) => formatUsd2(v) }
    ]

    const channels = filteredUserQualityHeatmap.value.map((r) => r.channel)
    // value: [x, y, 展示文本, 颜色档位, 广告平台, 指标名, 原始数值]
    const data: [number, number, string, string, string, string, number][] = []
    filteredUserQualityHeatmap.value.forEach((row, y) => {
      metrics.forEach((m, x) => {
        const raw =
          m.key === 'd1'
            ? row.d1Retention
            : m.key === 'd7'
              ? row.d7Retention
              : m.key === 'd30'
                ? row.d30Retention
                : m.key === 'pay'
                  ? row.payRate
                  : row.arpu
        const level = heatmapCellClass(raw, m.key)
        data.push([x, y, m.format(raw), level, row.channel, m.label, raw])
      })
    })

    return {
      grid: { left: 96, right: 12, top: 34, bottom: 8 },
      tooltip: {
        show: true,
        trigger: 'item',
        confine: true,
        backgroundColor: 'rgba(31, 45, 61, 0.92)',
        borderColor: 'rgba(51, 65, 85, 1)',
        borderWidth: 1,
        textStyle: { color: '#E2E8F0', fontSize: 12 },
        formatter: (p: unknown) => {
          const item = Array.isArray(p) ? p[0] : p
          if (!item || typeof item !== 'object') return ''
          const raw = Reflect.get(item, 'value')
          const v = Array.isArray(raw) ? raw : []
          const channel = String(v[4] ?? '')
          const metric = String(v[5] ?? '')
          const text = String(v[2] ?? '')
          if (!channel || !metric) return text
          return `${channel}<br/>${metric}: ${text}`
        }
      },
      xAxis: {
        type: 'category',
        position: 'top',
        data: metrics.map((m) => m.label),
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: '#94A3B8', fontSize: 14 }
      },
      yAxis: {
        type: 'category',
        data: channels,
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: '#E2E8F0', fontSize: 14 }
      },
      series: [
        {
          type: 'custom',
          data,
          renderItem: (params: any, api: any) => {
            const x = api.value(0) as number
            const y = api.value(1) as number
            const text = api.value(2) as string
            const level = api.value(3) as string
            const p = api.coord([x, y]) as [number, number]
            const size = api.size([1, 1]) as [number, number]
            const cellW = size[0]

            const pillW = Math.max(56, Math.min(110, cellW - 4))
            const pillH = 32

            return {
              type: 'group',
              children: [
                {
                  type: 'rect',
                  shape: {
                    x: p[0] - pillW / 2,
                    y: p[1] - pillH / 2,
                    width: pillW,
                    height: pillH,
                    r: 8
                  },
                  style: {
                    fill: heatmapColorByLevel(level),
                    cursor: 'pointer'
                  },
                  emphasis: {
                    style: {
                      // 悬浮高亮（轻量动画效果）
                      lineWidth: 2,
                      stroke: 'rgba(255, 255, 255, 0.65)',
                      shadowBlur: 10,
                      shadowColor: 'rgba(0, 0, 0, 0.55)',
                      shadowOffsetY: 2
                    }
                  }
                },
                {
                  type: 'text',
                  style: {
                    x: p[0],
                    y: p[1],
                    text,
                    fill: '#FFFEFE',
                    fontSize: 14,
                    fontFamily:
                      "'PingFang SC', Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, 'Microsoft YaHei', sans-serif",
                    align: 'center',
                    verticalAlign: 'middle'
                  }
                }
              ]
            }
          }
        }
      ]
    }
  } */

  const cardChartRefs = ref<Record<string, HTMLElement>>({})
  function setCardChartRef(id: string, el: unknown) {
    if (el instanceof HTMLElement) {
      cardChartRefs.value[id] = el
    } else if (el === null) {
      delete cardChartRefs.value[id]
    }
  }

  const roiTrendRef = ref<HTMLElement>()

  const chartRoiTrend = useChart()
  function getApsCssVar(name: string, fallback: string) {
    const el = rootRef.value ?? document.documentElement
    const v = getComputedStyle(el).getPropertyValue(name).trim()
    return v || fallback
  }

  function getChartTheme() {
    return {
      color1: '#4ABEFF',
      color2: '#14DEBA',
      color3: '#9a60b4',
      color4: '#e6c547',
      color5: '#5b8ff9',
      axis: getApsCssVar('--aps-chart-axis', '#64748b'),
      label: getApsCssVar('--aps-chart-label', '#334155'),
      split: getApsCssVar('--aps-chart-split', 'rgba(15, 23, 42, 0.08)'),
      axisLine: getApsCssVar('--aps-chart-axis-line', 'rgba(15, 23, 42, 0.18)')
    }
  }

  // KPI 卡片迷你趋势图（必须在 setup 同步创建，避免 useChart 生命周期警告）
  // 注意：不要放进 reactive/ref 对象里，否则内部 chartRef 会被 Vue 解包导致 .value 赋值报错
  const kpiMiniCharts = new Map<string, ReturnType<typeof useChart>>()

  function syncKpiMiniChartInstances(cards: ChannelKpiCard[]) {
    const nextIds = new Set(cards.map((c) => c.id))
    for (const [id, chart] of kpiMiniCharts.entries()) {
      if (!nextIds.has(id)) {
        chart.destroyChart?.()
        kpiMiniCharts.delete(id)
      }
    }
    cards.forEach((card) => {
      if (!kpiMiniCharts.has(card.id)) {
        kpiMiniCharts.set(card.id, useChart())
      }
    })
  }

  function applyKpiMiniChartsToDom() {
    syncKpiMiniChartInstances(channelKpiCards.value)
    filteredChannelKpiCards.value.forEach((card) => {
      const el = cardChartRefs.value[card.id]
      const chart = kpiMiniCharts.get(card.id)
      if (!el || !chart) return
      chart.chartRef!.value = el
      const td = card.trendData?.length ? card.trendData : [0]
      const opt = buildMiniTrendOption(td)
      if (chart.isChartInitialized()) {
        chart.updateChart(opt)
      } else {
        chart.initChart(opt)
      }
    })
  }

  function buildMiniTrendOption(data: number[]): EChartsOption {
    const seriesData = data.length > 0 ? data : [0]
    const theme = getChartTheme()
    return {
      grid: { left: 2, right: 2, top: 2, bottom: 2 },
      xAxis: { type: 'category', data: seriesData.map((_, i) => i), show: false },
      yAxis: {
        type: 'value',
        show: false,
        scale: true,
        min: (v: { min: number }) => v.min * 0.9,
        max: (v: { max: number }) => v.max * 1.1
      },
      series: [
        {
          type: 'line',
          data: seriesData,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: theme.color1, width: 1.5 },
          areaStyle: { color: theme.color1, opacity: 0.3 }
        }
      ]
    }
  }

  function buildRoiTrendOption(): EChartsOption {
    const d = filteredRoiTrend.value
    const theme = getChartTheme()
    const colors = [theme.color1, theme.color2, theme.color3, theme.color4, theme.color5]

    const colorWithAlpha = (color: string, alpha: number) => {
      const raw = color.trim()

      // hex: #RGB/#RRGGBB
      if (raw.startsWith('#')) {
        const hex = raw.slice(1)
        const full =
          hex.length === 3
            ? hex
                .split('')
                .map((c) => c + c)
                .join('')
            : hex
        if (full.length === 6) {
          const r = Number.parseInt(full.slice(0, 2), 16)
          const g = Number.parseInt(full.slice(2, 4), 16)
          const b = Number.parseInt(full.slice(4, 6), 16)
          return `rgba(${r}, ${g}, ${b}, ${alpha})`
        }
      }

      // rgb()/rgba()
      const m = raw.match(
        /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+))?\s*\)$/i
      )
      if (m) {
        const r = Math.min(255, Math.max(0, Number(m[1])))
        const g = Math.min(255, Math.max(0, Number(m[2])))
        const b = Math.min(255, Math.max(0, Number(m[3])))
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }

      // 其他格式（变量色/命名色）：用 opacity 控制可能会更稳，但渐变 stop 需要具体颜色
      // 这里兜底直接返回，至少不影响折线本身
      return raw
    }

    return {
      tooltip: {
        trigger: 'axis',
        formatter(params: unknown) {
          const list = Array.isArray(params) ? params : [params]
          if (!list.length) return ''
          const first = list[0] as {
            axisValueLabel?: string
            axisValue?: string
            marker?: string
            seriesName?: string
            value?: unknown
          }
          const header = String(first.axisValueLabel ?? first.axisValue ?? '')
          const lines = list.map((p) => {
            const item = p as {
              marker?: string
              seriesName?: string
              value?: unknown
            }
            const raw = item.value
            const num =
              Array.isArray(raw) && raw.length
                ? Number(raw[raw.length - 1])
                : typeof raw === 'number'
                  ? raw
                  : Number(raw)
            const val = Number.isFinite(num) ? formatNum2(num) : '—'
            return `${item.marker ?? ''}${item.seriesName ?? ''}: ${val}`
          })
          return [header, ...lines].filter(Boolean).join('<br/>')
        }
      },
      legend: { show: false },
      grid: { left: 50, right: 24, top: 24, bottom: 36 },
      xAxis: {
        type: 'category',
        data: d.dates,
        axisLine: { lineStyle: { color: theme.axisLine } },
        axisLabel: { color: theme.axis, fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        scale: true,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: theme.split } },
        axisLabel: {
          color: theme.axis,
          fontSize: 11,
          formatter: (value: string | number) => formatNum2(value)
        }
      },
      series: d.series.map((s, i) => ({
        type: 'line',
        name: s.name,
        data: s.data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: colors[i % colors.length], width: 2 },
        itemStyle: { color: colors[i % colors.length] },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colorWithAlpha(colors[i % colors.length], 0.35) },
            { offset: 1, color: colorWithAlpha(colors[i % colors.length], 0) }
          ])
        }
      }))
    }
  }

  async function tryMountRoiTrendChart() {
    await nextTick()
    if (!roiTrendRef.value) return
    chartRoiTrend.chartRef!.value = roiTrendRef.value
    const opt = buildRoiTrendOption()
    if (chartRoiTrend.isChartInitialized()) {
      const instance = chartRoiTrend.getChartInstance()
      if (instance) {
        instance.setOption(opt, { replaceMerge: ['series'] })
      } else {
        chartRoiTrend.updateChart(opt)
      }
    } else {
      chartRoiTrend.initChart(opt)
    }
  }

  /** 拉取 KPI / 图表 / 表格等业务数据（首次进入与点击「查询」时调用；改筛选/日期不会自动请求） */
  function runDashboardQuery() {
    currentPage.value = 1
    void loadKpiCards()
    void loadRoiTrend()
    void loadTopCampaigns()
    void loadMetricsTable()
  }

  onMounted(() => {
    void (async () => {
      await loadFiltersMeta()
      runDashboardQuery()
    })()
  })

  onUnmounted(() => {
    kpiMiniCharts.forEach((c) => c.destroyChart?.())
    chartRoiTrend.destroyChart?.()
  })
</script>

<style lang="scss" scoped>
  @use '../ad-performance/styles/ap-card-fx.scss' as ap;

  /* ========== 设计变量（与原型/设计图一致，便于统一修改） ========== */

  /**
   * 主题适配说明
   * - 项目通过 `html.dark` 控制暗黑模式
   * - 本页用 CSS 变量承载配色：默认作为深色（与当前页面设计一致）；在明确的 Light 条件下覆盖为浅色
   *   这样可以避免暗黑选择器偶发未命中时，页面退回白底/浅色的情况
   */
  .finance-screen-root {
    /* Dark (default - 与原页面一致) */
    --aps-bg: #0f1419;
    --aps-text-primary: #e2e8f0;
    --aps-text-secondary: #e2e8f0;
    --aps-text-muted: #94a3b8;
    --aps-accent: #4abeff;
    --aps-success: #14deba;
    --aps-danger: #f56c6c;
    --aps-warning: #e6a23c;
    --aps-slate-700: #334155;
    --aps-text-axure: #e2e8f0;
    --aps-border-axure: #334155;
    --aps-border-subtle: rgb(255 255 255 / 6%);
    --aps-border-subtle-10: rgb(255 255 255 / 10%);
    --aps-border-accent: rgb(74 190 255 / 20%);
    --aps-table-divider-strong: rgb(51 65 85 / 60%);
    --aps-table-divider-weak: rgb(51 65 85 / 35%);
    --aps-bg-card: rgb(255 255 255 / 3%);
    --aps-bg-panel: rgb(255 255 255 / 2%);
    --aps-bg-header: rgb(74 190 255 / 4%);
    --aps-bg-btn-export: rgb(74 190 255 / 12%);
    --aps-bg-btn-export-hover: rgb(74 190 255 / 20%);
    --aps-bg-table-header: rgb(0 0 0 / 20%);
    --aps-bg-page-btn: rgb(255 255 255 / 6%);
    --aps-bg-page-btn-active: rgb(74 190 255 / 25%);
    --aps-bg-row-hover: rgb(255 255 255 / 3%);
    --aps-bg-page-btn-hover: rgb(74 190 255 / 15%);
    --aps-border-page-btn-hover: rgb(74 190 255 / 30%);
    --aps-panel-gradient: linear-gradient(135deg, #1f2d3d 0%, #000 100%);
    --aps-table-header-gradient: linear-gradient(
      90deg,
      #204493 0%,
      #374188 12.5%,
      #503f7d 25%,
      #663c73 37.5%,
      #733b6d 50%,
      #7d3a69 62.5%,
      #863964 75%,
      #8c3861 87.5%,
      #8f3860 100%
    );

    /* KPI card gradients (dark - 原始值) */
    --aps-kpi-g1: linear-gradient(135deg, #2356a2 0%, #242641 100%);
    --aps-kpi-g2: linear-gradient(135deg, #25859d 0%, #1c2a43 100%);
    --aps-kpi-g3: linear-gradient(135deg, #8f3860 0%, #242641 100%);
    --aps-kpi-g4: linear-gradient(135deg, #896228 0%, #242641 100%);
    --aps-kpi-g5: linear-gradient(135deg, #893528 0%, #242641 100%);
    --aps-chart-axis: #8b9dc3;
    --aps-chart-label: #b8c5d9;
    --aps-chart-split: rgb(255 255 255 / 6%);
    --aps-chart-axis-line: rgb(255 255 255 / 20%);

    /* 表头文字色：深色模式用白色系 */
    --aps-table-header-text: var(--aps-text-primary);

    /* ========== 根布局（合并，避免重复 selector） ========== */
    position: relative;
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: var(--art-full-height, calc(100vh - 120px));
    overflow: auto;
    background: var(--aps-bg);
  }

  :global(html:not(.dark) .finance-screen-root) {
    /* Light override */
    --aps-bg: #f6f8fb;
    --aps-text-primary: #0f172a;
    --aps-text-secondary: #0f172a;
    --aps-text-muted: #64748b;
    --aps-accent: #2563eb;
    --aps-success: #10b981;
    --aps-danger: #ef4444;
    --aps-warning: #f59e0b;
    --aps-slate-700: #e2e8f0; /* 筛选/按钮底色（浅色用浅灰） */
    --aps-text-axure: #0f172a;
    --aps-border-axure: rgb(15 23 42 / 14%);
    --aps-border-subtle: rgb(15 23 42 / 8%);
    --aps-border-subtle-10: rgb(15 23 42 / 12%);
    --aps-border-accent: rgb(37 99 235 / 22%);
    --aps-table-divider-strong: rgb(15 23 42 / 18%);
    --aps-table-divider-weak: rgb(15 23 42 / 12%);
    --aps-bg-card: rgb(255 255 255 / 92%);
    --aps-bg-panel: rgb(255 255 255 / 95%);
    --aps-bg-header: rgb(37 99 235 / 6%);
    --aps-bg-btn-export: rgb(37 99 235 / 12%);
    --aps-bg-btn-export-hover: rgb(37 99 235 / 18%);
    --aps-bg-table-header: rgb(15 23 42 / 4%);
    --aps-bg-page-btn: rgb(15 23 42 / 6%);
    --aps-bg-page-btn-active: rgb(37 99 235 / 18%);
    --aps-bg-row-hover: rgb(37 99 235 / 6%);
    --aps-bg-page-btn-hover: rgb(37 99 235 / 12%);
    --aps-border-page-btn-hover: rgb(37 99 235 / 22%);
    --aps-panel-gradient: linear-gradient(135deg, #fff 0%, #f3f5f9 100%);
    --aps-table-header-gradient: linear-gradient(90deg, #eef2ff 0%, #f5f3ff 50%, #fff1f2 100%);

    /* KPI card gradients (light) */
    --aps-kpi-g1: linear-gradient(135deg, #e8f0ff 0%, #fff 100%);
    --aps-kpi-g2: linear-gradient(135deg, #e6fffb 0%, #fff 100%);
    --aps-kpi-g3: linear-gradient(135deg, #ffeaf2 0%, #fff 100%);
    --aps-kpi-g4: linear-gradient(135deg, #fff4e5 0%, #fff 100%);
    --aps-kpi-g5: linear-gradient(135deg, #ffe9e5 0%, #fff 100%);
    --aps-chart-axis: #64748b;
    --aps-chart-label: #334155;
    --aps-chart-split: rgb(15 23 42 / 8%);
    --aps-chart-axis-line: rgb(15 23 42 / 18%);

    /* 浅色模式表头文字色保持偏灰 */
    --aps-table-header-text: var(--aps-text-muted);
  }

  /* 原型底色：rgba(15, 20, 25, 1) */
  $color-bg: var(--aps-bg);
  $color-bg-gradient-from: var(--aps-bg);

  /* 原型主文字：#E2E8F0，次级/表头：#94A3B8 */
  $color-text-primary: var(--aps-text-primary);
  $color-text-secondary: var(--aps-text-secondary);
  $color-text-muted: var(--aps-text-muted);
  $color-accent: var(--aps-accent);
  $color-success: var(--aps-success);
  $color-danger: var(--aps-danger);
  $color-warning: var(--aps-warning);
  $color-slate-700: var(--aps-slate-700); /* 原型主按钮/筛选底色 */
  $color-text-axure: var(--aps-text-axure); /* 原型常用文字色 */
  $border-card: var(--aps-border-subtle);
  $border-subtle: var(--aps-border-subtle);
  $border-subtle-10: var(--aps-border-subtle-10);
  $border-accent: var(--aps-border-accent);
  $border-axure: var(--aps-border-axure); /* 原型描边：rgba(51,65,85,1) */
  $bg-card: var(--aps-bg-card);
  $bg-panel: var(--aps-bg-panel);
  $bg-header: var(--aps-bg-header);
  $bg-btn-export: var(--aps-bg-btn-export);
  $bg-btn-export-hover: var(--aps-bg-btn-export-hover);
  $bg-table-header: var(--aps-bg-table-header);
  $bg-page-btn: var(--aps-bg-page-btn);
  $bg-page-btn-active: var(--aps-bg-page-btn-active);
  $radius-card: 8px;
  $radius-btn: 6px;
  $radius-page: 4px;
  $font-size-title: 14px;
  $font-size-body: 12px;
  $font-size-small: 13px;
  $font-size-roi: 26px;

  /* 趋势指示颜色：上升绿、下降红（文字/边框） */
  @mixin trend-colors {
    &.up {
      color: $color-success;
    }

    &.down {
      color: $color-danger;
    }
  }

  /* 趋势指示颜色：背景（mini-bar 等） */
  @mixin trend-colors-bg {
    &.up {
      background: $color-success;
    }

    &.down {
      background: $color-danger;
    }
  }

  /* 区块标题（KPI 卡片名、面板标题） */
  @mixin section-title {
    font-size: $font-size-title;
    font-weight: 600;
    color: $color-text-secondary;
  }

  /* 卡片/面板基类 */
  @mixin data-card-base {
    padding: 14px;
    background: $bg-card;
    border: 2px solid $border-axure;
    border-radius: $radius-card;
  }

  /* 表格基类 */
  @mixin table-base {
    width: 100%;
    font-size: $font-size-body;
    border-collapse: collapse;

    th {
      font-weight: 500;
      color: $color-text-muted;
      background: transparent;
    }
  }

  /* ========== 根布局 ========== */
  .finance-screen-wrap {
    position: relative;
    width: 100%;
    max-width: 1700px;
    padding: 0 10px;
    margin: 0 auto;
    overflow: hidden;
    background: $color-bg;
    border-radius: 10px;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(ellipse 72% 38% at 6% 6%, rgb(59 130 246 / 22%) 0%, transparent 55%),
        radial-gradient(ellipse 54% 34% at 94% 8%, rgb(139 92 246 / 18%) 0%, transparent 50%),
        radial-gradient(ellipse 46% 28% at 50% 0%, rgb(16 185 129 / 12%) 0%, transparent 50%);
      mask-image: linear-gradient(to bottom, black 0%, black 18%, transparent 45%);
      animation: aps-aurora-drift 14s ease-in-out infinite alternate;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(255 255 255 / 3%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(255 255 255 / 3%) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: linear-gradient(to bottom, black 0%, black 14%, transparent 35%);
    }

    > *:not(.aps-page-fx) {
      position: relative;
      z-index: 1;
    }
  }

  /* 第二排各面板内骨架（与 ROI / 热力图 / Top10 请求一一对应） */
  .panel-chart-host {
    position: relative;
    min-height: 260px;
  }

  .aps-module-skeleton {
    box-sizing: border-box;
    padding: 8px 10px 0;

    :deep(.el-skeleton) {
      width: 100%;
    }
  }

  .aps-module-skeleton--chart {
    min-height: 260px;
  }

  .aps-module-skeleton--top10 {
    min-height: 240px;
  }

  /* 与 .panel-table .table-wrap 同高，加载中骨架与成品占位一致，减少跳动 */
  .aps-metrics-table-host {
    position: relative;
  }

  .aps-module-skeleton--metrics-table {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 100%;
    padding: 6px 0 0;

    :deep(.el-skeleton) {
      flex: 1;
      width: 100%;
    }
  }

  .aps-metrics-table-real {
    height: 100%;
    overflow: hidden;
  }

  .kpi-card--skeleton {
    @include data-card-base;

    min-height: 200px;
    border-radius: 12px;

    :deep(.el-skeleton) {
      width: 100%;
    }
  }

  /* ========== 顶栏（对齐广告成效：霓虹工具条 + 控件描边） ========== */
  .finance-header {
    padding: 15px 0 0;
    margin-bottom: 13px;
    background: transparent;
    border: 0;
  }

  .aps-filter-toolbar {
    width: 100%;
    min-width: 0;
    padding: 12px 16px;
    overflow: hidden;
    border-radius: 16px;

    @include ap.ap-neon-bg;
    @include ap.ap-card-mesh;

    transition:
      box-shadow 0.35s cubic-bezier(0, 0, 0.2, 1),
      border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      border-color: rgb(96 165 250 / 48%);
      box-shadow:
        0 12px 40px rgb(0 0 0 / 44%),
        0 0 0 1px rgb(96 165 250 / 22%),
        inset 0 1px 0 rgb(186 230 253 / 16%),
        0 0 48px rgb(59 130 246 / 14%);
    }
  }

  /* 与广告成效一致：日期 + 下拉 + 导出从左起单行排列 */
  .aps-filter-toolbar__row {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    min-width: 0;
  }

  .aps-filter-toolbar .header-left {
    position: relative;
    z-index: 1;
    flex: 0 0 auto;
  }

  :global(html:not(.dark) .finance-screen-root .aps-filter-toolbar) {
    background: linear-gradient(148deg, rgb(255 255 255 / 98%), rgb(248 250 252 / 99%));
    border: 1px solid rgb(15 23 42 / 10%);
    box-shadow: 0 10px 32px rgb(15 23 42 / 7%);

    &:hover {
      border-color: rgb(59 130 246 / 22%);
      box-shadow: 0 12px 36px rgb(15 23 42 / 10%);
    }
  }

  .header-left {
    font-family:
      'PingFang SC',
      Inter,
      system-ui,
      -apple-system,
      'Segoe UI',
      Roboto,
      Arial,
      'Microsoft YaHei',
      sans-serif;
    font-size: 14px;
    color: $color-text-axure;
  }

  /* 广告成效：胶囊日期范围 */
  .aps-filter-toolbar .header-left :deep(.aps-date-picker) {
    --el-input-focus-border-color: var(--theme-color);
    --el-border-color-hover: color-mix(in srgb, var(--theme-color) 75%, transparent);
    --el-color-primary: var(--theme-color);
    --el-border-color: var(--theme-color);

    width: 268px;

    &.el-date-editor,
    &.el-date-editor.el-input__wrapper {
      background: color-mix(in srgb, var(--theme-color) 6%, transparent) !important;
      border: 1px solid color-mix(in srgb, var(--theme-color) 28%, transparent) !important;
      border-radius: var(--el-border-radius-base, 4px) !important;
      box-shadow: none !important;
    }

    .el-range-editor,
    .el-range-editor.el-input__wrapper {
      min-height: 36px;
      padding: 0 14px;
      color: $color-text-axure;
      background: color-mix(in srgb, var(--theme-color) 6%, transparent) !important;
      border: 1px solid color-mix(in srgb, var(--theme-color) 28%, transparent) !important;
      border-radius: var(--el-border-radius-base, 4px) !important;
      box-shadow: none !important;
      transition:
        border-color 0.22s ease,
        box-shadow 0.22s ease,
        background 0.22s ease;
    }

    &.el-date-editor:hover,
    &.el-date-editor.el-input__wrapper:hover,
    .el-range-editor:hover,
    .el-range-editor.el-input__wrapper:hover {
      border-color: color-mix(in srgb, var(--theme-color) 60%, transparent) !important;
      box-shadow: 0 0 12px color-mix(in srgb, var(--theme-color) 18%, transparent) !important;
    }

    &.el-date-editor.is-active,
    &.el-date-editor.el-input__wrapper.is-focus,
    &.el-date-editor:focus-within,
    .el-range-editor.is-active,
    .el-range-editor.el-input__wrapper.is-focus {
      background: color-mix(in srgb, var(--theme-color) 10%, transparent) !important;
      border-color: var(--theme-color) !important;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-color) 20%, transparent) !important;
    }

    .el-range-input,
    .el-range-separator {
      color: $color-text-axure;
    }

    .el-range__icon,
    .el-range__close-icon {
      color: var(--theme-color);
    }
  }

  :global(html:not(.dark) .finance-screen-root)
    .aps-filter-toolbar
    .header-left
    :deep(.aps-date-picker) {
    &.el-date-editor,
    &.el-date-editor.el-input__wrapper {
      color: var(--aps-text-primary);
      background: color-mix(in srgb, var(--theme-color) 8%, transparent) !important;
      border: 1px solid color-mix(in srgb, var(--theme-color) 30%, transparent) !important;
    }

    .el-range-editor,
    .el-range-editor.el-input__wrapper {
      color: var(--aps-text-primary);
      background: color-mix(in srgb, var(--theme-color) 8%, transparent) !important;
      border: 1px solid color-mix(in srgb, var(--theme-color) 30%, transparent) !important;
    }

    &.el-date-editor:hover,
    &.el-date-editor.el-input__wrapper:hover,
    .el-range-editor:hover,
    .el-range-editor.el-input__wrapper:hover {
      border-color: color-mix(in srgb, var(--theme-color) 45%, transparent) !important;
      box-shadow: 0 0 12px color-mix(in srgb, var(--theme-color) 14%, transparent) !important;
    }

    &.el-date-editor.is-active,
    &.el-date-editor.el-input__wrapper.is-focus,
    &.el-date-editor:focus-within,
    .el-range-editor.is-active,
    .el-range-editor.el-input__wrapper.is-focus {
      background: color-mix(in srgb, var(--theme-color) 12%, transparent) !important;
      border-color: var(--theme-color) !important;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-color) 18%, transparent) !important;
    }

    .el-range-input,
    .el-range-separator {
      color: var(--aps-text-primary);
    }
  }

  .header-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    font-size: 14px;
    color: $color-text-axure;

    .filter-divider {
      display: none;
    }

    :deep(.aps-filter-select) {
      width: 220px;
      min-width: 200px;
      max-width: 220px;
    }

    :deep(.aps-filter-select .el-select__selected-item) {
      color: $color-text-axure;
    }

    :deep(.aps-filter-select .el-select__placeholder) {
      color: $color-text-axure;
      opacity: 0.85;
    }
  }

  .aps-filter-toolbar .header-filters {
    position: relative;
    z-index: 1;
    flex: 0 0 auto;
  }

  /* 广告成效：胶囊下拉 */
  .aps-filter-toolbar .header-filters :deep(.aps-filter-select) {
    --el-input-focus-border-color: var(--theme-color);
    --el-border-color-hover: color-mix(in srgb, var(--theme-color) 75%, transparent);
    --el-color-primary: var(--theme-color);
    --el-border-color-focus: var(--theme-color);
    --el-component-size: 36px;
  }

  .aps-filter-toolbar .header-filters :deep(.app-platform-search-select.aps-filter-select) {
    --app-platform-select-height: 36px;
    --app-platform-select-radius: var(--el-border-radius-base, 4px);

    width: 220px;
    min-width: 200px;
    max-width: 220px;
    padding: 0 11px;
    color: $color-text-axure;
    background: color-mix(in srgb, var(--theme-color) 6%, transparent);
    border-color: color-mix(in srgb, var(--theme-color) 28%, transparent);
    box-shadow: none;
  }

  .aps-filter-toolbar .header-filters :deep(.app-platform-search-select.aps-filter-select:hover) {
    border-color: color-mix(in srgb, var(--theme-color) 60%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-color) 18%, transparent);
  }

  .aps-filter-toolbar .header-filters :deep(.app-platform-search-select.aps-filter-select.is-open) {
    background: color-mix(in srgb, var(--theme-color) 10%, transparent);
    border-color: var(--theme-color);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-color) 20%, transparent);
  }

  .aps-filter-toolbar
    .header-filters
    :deep(.app-platform-search-select.aps-filter-select .app-platform-search-select__text) {
    color: $color-text-axure;
  }

  .aps-filter-toolbar
    .header-filters
    :deep(
      .app-platform-search-select.aps-filter-select .app-platform-search-select__text.is-placeholder
    ) {
    color: $color-text-axure;
    opacity: 0.85;
  }

  .aps-filter-toolbar
    .header-filters
    :deep(.app-platform-search-select.aps-filter-select .app-platform-search-select__suffix) {
    color: var(--theme-color);
  }

  .aps-filter-toolbar .header-filters :deep(.aps-filter-select .el-select__wrapper) {
    min-height: 36px;
    padding: 0 12px;
    color: $color-text-axure;
    background: color-mix(in srgb, var(--theme-color) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--theme-color) 28%, transparent);
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: none;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  .aps-filter-toolbar .header-filters :deep(.aps-filter-select .el-select__wrapper:hover) {
    border-color: color-mix(in srgb, var(--theme-color) 60%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-color) 18%, transparent);
  }

  .aps-filter-toolbar .header-filters :deep(.aps-filter-select .el-select__wrapper.is-focused) {
    background: color-mix(in srgb, var(--theme-color) 10%, transparent);
    border-color: var(--theme-color);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-color) 20%, transparent);
  }

  .aps-filter-toolbar .header-filters :deep(.aps-filter-select .el-select__caret) {
    color: var(--theme-color);
  }

  :global(html:not(.dark) .finance-screen-root)
    .aps-filter-toolbar
    .header-filters
    :deep(.app-platform-search-select.aps-filter-select) {
    color: var(--aps-text-primary);
    background: color-mix(in srgb, var(--theme-color) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--theme-color) 30%, transparent);
  }

  :global(html:not(.dark) .finance-screen-root)
    .aps-filter-toolbar
    .header-filters
    :deep(.app-platform-search-select.aps-filter-select:hover) {
    border-color: color-mix(in srgb, var(--theme-color) 45%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-color) 14%, transparent);
  }

  :global(html:not(.dark) .finance-screen-root)
    .aps-filter-toolbar
    .header-filters
    :deep(.app-platform-search-select.aps-filter-select.is-open) {
    background: color-mix(in srgb, var(--theme-color) 12%, transparent);
    border-color: var(--theme-color);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-color) 18%, transparent);
  }

  :global(html:not(.dark) .finance-screen-root)
    .aps-filter-toolbar
    .header-filters
    :deep(.app-platform-search-select.aps-filter-select .app-platform-search-select__text) {
    color: var(--aps-text-primary);
  }

  :global(html:not(.dark) .finance-screen-root)
    .aps-filter-toolbar
    .header-filters
    :deep(
      .app-platform-search-select.aps-filter-select .app-platform-search-select__text.is-placeholder
    ) {
    color: var(--aps-text-primary);
    opacity: 0.78;
  }

  :global(html:not(.dark) .finance-screen-root)
    .aps-filter-toolbar
    .header-filters
    :deep(.app-platform-search-select.aps-filter-select .app-platform-search-select__suffix) {
    color: var(--theme-color);
  }

  :global(html:not(.dark) .finance-screen-root)
    .aps-filter-toolbar
    .header-filters
    :deep(.aps-filter-select .el-select__wrapper) {
    color: var(--aps-text-primary);
    background: color-mix(in srgb, var(--theme-color) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--theme-color) 30%, transparent);
  }

  :global(html:not(.dark) .finance-screen-root)
    .aps-filter-toolbar
    .header-filters
    :deep(.aps-filter-select .el-select__wrapper:hover) {
    border-color: color-mix(in srgb, var(--theme-color) 45%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-color) 14%, transparent);
  }

  :global(html:not(.dark) .finance-screen-root)
    .aps-filter-toolbar
    .header-filters
    :deep(.aps-filter-select .el-select__wrapper.is-focused) {
    background: color-mix(in srgb, var(--theme-color) 12%, transparent);
    border-color: var(--theme-color);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-color) 18%, transparent);
  }

  :global(html:not(.dark) .finance-screen-root)
    .aps-filter-toolbar
    .header-filters
    :deep(.aps-filter-select .el-select__caret) {
    color: var(--theme-color);
  }

  /* 广告成效：实心主按钮 */
  .aps-filter-toolbar .btn-export {
    flex: 0 0 auto;
    height: 40px;
    padding: 0 16px;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    cursor: pointer;
    background: var(--theme-color);
    border: none;
    border-radius: 9999px;
    box-shadow: 0 0 14px color-mix(in srgb, var(--theme-color) 40%, transparent);
    transition:
      box-shadow 0.22s ease,
      background 0.22s ease;

    &:hover {
      background: color-mix(in srgb, var(--theme-color) 85%, #000);
      box-shadow: 0 0 22px color-mix(in srgb, var(--theme-color) 55%, transparent);
    }

    &:active {
      background: color-mix(in srgb, var(--theme-color) 75%, #000);
    }
  }

  :global(html:not(.dark) .finance-screen-root) .aps-filter-toolbar .btn-export {
    color: #fff;
    background: var(--theme-color);

    &:hover {
      background: color-mix(in srgb, var(--theme-color) 80%, #000);
    }

    &:active {
      background: color-mix(in srgb, var(--theme-color) 70%, #000);
    }
  }

  /* ========== 通用区块与数据卡片基类 ========== */
  .row {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  }

  .row-1 {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
  }

  .kpi-card {
    @include data-card-base;

    position: relative;
    min-height: 200px;
    overflow: hidden;
    border: 1px solid rgb(96 165 250 / 28%);
    border-radius: 12px;
    box-shadow:
      0 12px 48px rgb(0 0 0 / 48%),
      inset 0 1px 0 rgb(186 230 253 / 12%);
    transition:
      box-shadow 0.42s cubic-bezier(0, 0, 0.2, 1),
      border-color 0.32s cubic-bezier(0, 0, 0.2, 1);

    &:hover {
      box-shadow:
        0 24px 72px rgb(0 0 0 / 52%),
        0 0 72px rgb(59 130 246 / 22%);
    }

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(255 255 255 / 4%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(255 255 255 / 4%) 1px, transparent 1px);
      background-size: 20px 20px;
    }

    > * {
      position: relative;
      z-index: 1;
    }

    .kpi-card-head {
      margin-bottom: 8px;
    }

    .kpi-card-head-main {
      display: flex;
      gap: 10px;
      align-items: center;
      min-width: 0;
    }

    .kpi-card-logo {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      overflow: hidden;
      border-radius: 8px;

      &:not(.is-placeholder) {
        background: rgb(255 255 255 / 12%);
      }

      &.is-placeholder {
        color: $color-text-primary;
        background: rgb(255 255 255 / 10%);
        border: 1px solid rgb(255 255 255 / 12%);
      }
    }

    .kpi-card-logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .kpi-card-logo-fallback {
      font-size: 17px;
      font-weight: 700;
      line-height: 1;
    }

    .kpi-card-logo--google.is-placeholder {
      color: #4285f4;
      background: #fff;
      border-color: rgb(255 255 255 / 25%);
    }

    .kpi-card-logo--facebook.is-placeholder {
      font-size: 20px;
      color: #fff;
      background: #1877f2;
      border-color: rgb(255 255 255 / 18%);
    }

    .kpi-card-logo--tiktok.is-placeholder {
      font-size: 15px;
      font-weight: 800;
      color: #fff;
      background: #010101;
      border-color: rgb(255 255 255 / 15%);
    }

    .kpi-card-logo--unity.is-placeholder {
      font-size: 14px;
      font-weight: 800;
      color: #1e1e1e;
      background: #fff;
      border-color: rgb(255 255 255 / 25%);
    }

    .kpi-card-logo--kwai.is-placeholder {
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      background: #f97316;
      border-color: rgb(255 255 255 / 18%);
    }

    .kpi-card-name {
      @include section-title;

      flex: 1;
      min-width: 0;
    }

    .kpi-card-roi {
      margin-bottom: 10px;

      .roi-value {
        margin-right: 8px;
        font-size: $font-size-roi;
        font-weight: 700;
        color: $color-text-primary;
      }

      .roi-change {
        font-size: $font-size-small;

        @include trend-colors();
      }
    }

    .kpi-card-metrics {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 12px;
      margin-bottom: 8px;
      font-size: $font-size-body;
      color: $color-text-muted;
    }

    .kpi-card-mini-chart {
      position: absolute;
      right: 14px;
      bottom: 14px;
      left: 14px;
      z-index: 1;
      height: 42px;
    }
  }

  /* KPI card neon gradient backgrounds */
  .row-1 .kpi-card:nth-child(1) {
    background:
      radial-gradient(ellipse 80% 60% at 0% 0%, rgb(35 86 162 / 55%) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 100% 100%, rgb(59 130 246 / 18%) 0%, transparent 50%),
      rgb(8 8 18 / 98%);
    border-color: rgb(35 86 162 / 55%);
  }

  .row-1 .kpi-card:nth-child(2) {
    background:
      radial-gradient(ellipse 80% 60% at 0% 0%, rgb(37 133 157 / 55%) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 100% 100%, rgb(20 222 186 / 16%) 0%, transparent 50%),
      rgb(8 8 18 / 98%);
    border-color: rgb(37 133 157 / 55%);
  }

  .row-1 .kpi-card:nth-child(3) {
    background:
      radial-gradient(ellipse 80% 60% at 0% 0%, rgb(143 56 96 / 55%) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 100% 100%, rgb(244 63 94 / 16%) 0%, transparent 50%),
      rgb(8 8 18 / 98%);
    border-color: rgb(143 56 96 / 55%);
  }

  .row-1 .kpi-card:nth-child(4) {
    background:
      radial-gradient(ellipse 80% 60% at 0% 0%, rgb(137 98 40 / 55%) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 100% 100%, rgb(245 158 11 / 16%) 0%, transparent 50%),
      rgb(8 8 18 / 98%);
    border-color: rgb(137 98 40 / 55%);
  }

  .row-1 .kpi-card:nth-child(5) {
    background:
      radial-gradient(ellipse 80% 60% at 0% 0%, rgb(137 53 40 / 55%) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 100% 100%, rgb(239 68 68 / 16%) 0%, transparent 50%),
      rgb(8 8 18 / 98%);
    border-color: rgb(137 53 40 / 55%);
  }

  .row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 320px;
  }

  /* ========== 响应式断点：不再整体缩放，改用栅格自适应 ========== */
  @media (width <= 1680px) {
    .row-1 {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (width <= 1180px) {
    .row-1 {
      grid-template-columns: repeat(2, 1fr);
    }

    .row-2 {
      grid-template-columns: 1fr;
    }
  }

  @media (width <= 820px) {
    .row-1 {
      grid-template-columns: 1fr;
    }

    .aps-filter-toolbar {
      padding: 10px 12px;
      border-radius: 14px;
    }

    .aps-filter-toolbar__row {
      gap: 10px;
    }

    .aps-filter-toolbar .header-left :deep(.aps-date-picker) {
      width: 100%;
      max-width: 420px;
    }

    .header-filters :deep(.aps-filter-select) {
      width: 100%;
      max-width: 220px;
    }
  }

  .panel {
    @include data-card-base;

    overflow: hidden;
    background-color: rgb(10 10 14 / 98%);
    background-image:
      radial-gradient(ellipse 78% 42% at 0% 0%, rgb(59 130 246 / 14%) 0%, transparent 55%),
      radial-gradient(ellipse 55% 40% at 100% 100%, rgb(139 92 246 / 10%) 0%, transparent 55%);
    border-color: rgb(96 165 250 / 28%);
    border-radius: 12px;
    box-shadow:
      0 12px 48px rgb(0 0 0 / 48%),
      0 0 0 1px rgb(96 165 250 / 10%),
      inset 0 1px 0 rgb(186 230 253 / 12%);
    transition:
      box-shadow 0.42s cubic-bezier(0, 0, 0.2, 1),
      border-color 0.32s cubic-bezier(0, 0, 0.2, 1);

    &:hover {
      border-color: rgb(96 165 250 / 55%);
      box-shadow:
        0 24px 72px rgb(0 0 0 / 52%),
        0 0 72px rgb(59 130 246 / 18%),
        0 0 0 1px rgb(96 165 250 / 30%);
    }

    .panel-title {
      @include section-title;

      margin-bottom: 10px;
      background: linear-gradient(90deg, #93c5fd 0%, #c4b5fd 55%, #6ee7b7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .chart-dom {
      height: 260px;
      min-height: 200px;
    }
  }

  .panel-heatmap .heatmap-wrap {
    max-height: 260px;
    overflow: auto;
  }

  .quality-heatmap-dom {
    height: 260px;
    min-height: 200px;
  }

  .panel-top10 {
    .top10-table-wrap {
      max-height: 260px;
      overflow: hidden;
    }

    :deep(.el-table) {
      margin-top: 6px;
      background: transparent !important;
    }

    :deep(.el-table__inner-wrapper),
    :deep(.el-table__header-wrapper),
    :deep(.el-table__body-wrapper) {
      background: transparent !important;
    }

    :deep(.el-scrollbar__view) {
      background: transparent;
    }

    :deep(.el-table__body tr.el-table__row) {
      background: transparent;
    }

    :deep(.el-table__inner-wrapper::before) {
      height: 0;
    }

    :deep(.el-table__header thead tr) {
      background: var(--aps-table-header-gradient);
    }

    :deep(.el-table th.el-table__cell) {
      padding: 6px 0;
      font-size: 12px;
      color: var(--aps-table-header-text);
      background: transparent !important;
      border-bottom: 1px solid var(--aps-table-divider-strong);
    }

    :deep(.el-table td.el-table__cell) {
      padding: 6px 0;
      font-size: 12px;
      color: $color-text-secondary;
      background: transparent;
      border-bottom: 1px solid var(--aps-table-divider-weak);
    }

    :deep(.el-table__cell .cell) {
      padding: 0 6px;
    }

    :deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
      background: var(--aps-bg-row-hover);
    }

    :deep(.el-button.is-link) {
      padding: 0;
      font-size: 12px;
    }
  }

  .top10-source-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 4px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    border-radius: 4px;

    &--google {
      background: #4285f4;
    }

    &--facebook {
      font-size: 13px;
      font-weight: 700;
      background: #1877f2;
    }

    &--tiktok {
      background: #010101;
    }

    &--unity {
      font-size: 10px;
      font-weight: 700;
      background: #1e1e1e;
    }

    &--kwai {
      background: #f97316;
    }

    &--bigo {
      background: #6366f1;
    }

    &--meta {
      background: #8b5cf6;
    }

    &--applovin {
      background: #ec4899;
    }
  }

  .top10-cpi {
    font-weight: 600;
    color: var(--art-warning);
  }

  .top10-roi {
    font-weight: 600;

    &.is-good {
      color: var(--art-success);
    }

    &.is-mid {
      color: var(--art-warning);
    }

    &.is-bad {
      color: var(--art-danger);
    }
  }

  /* ========== 表格通用（热力图 + 详情表） ========== */
  .heatmap-table {
    @include table-base;

    th,
    td {
      padding: 6px 10px;
      text-align: center;
      border: 0;
    }

    .cell-channel {
      color: $color-text-secondary;
      text-align: left;
    }

    /* 原型热力图为“彩色 pill”而非整格染色 */
    .heatmap-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 75px;
      height: 32px;
      padding: 0 10px;
      font-family:
        'PingFang SC',
        Inter,
        system-ui,
        -apple-system,
        'Segoe UI',
        Roboto,
        Arial,
        'Microsoft YaHei',
        sans-serif;
      font-size: 14px;
      color: #fffefe;
      white-space: nowrap;
      border-radius: 8px;
    }

    /* 对齐原型 styles.css 的 4 档底色 */
    .lv-green {
      background-color: rgb(16 185 129 / 100%);
    }

    .lv-olive {
      background-color: rgb(105 159 18 / 100%);
    }

    .lv-orange {
      background-color: rgb(245 158 11 / 100%);
    }

    .lv-red {
      background-color: rgb(239 68 68 / 100%);
    }
  }

  .row-3 {
    display: block;
  }

  .panel-table .table-wrap {
    height: 320px;
    overflow: hidden;
  }

  /* 详情表（ArtTable）紧凑样式 */
  .detail-cell {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    white-space: nowrap;
  }

  .detail-cell--metric {
    gap: 8px;
  }

  .detail-metric-value {
    min-width: 2.25em;
  }

  .detail-sparkline {
    display: inline-flex;
    flex-shrink: 0;
    gap: 2px;
    align-items: flex-end;
    width: 40px;
    height: 20px;
    margin-left: 2px;
    vertical-align: middle;

    &__bar {
      flex: 1;
      min-width: 0;
      min-height: 2px;
      background: currentcolor;
      border-radius: 1px;
    }

    &.is-good {
      color: var(--art-success);
    }

    &.is-bad {
      color: var(--art-danger);
    }
  }

  .detail-uq-cell {
    display: inline-flex;
    flex-wrap: nowrap;
    gap: 6px;
    align-items: center;
    min-width: 0;
  }

  .detail-uq-value {
    flex-shrink: 0;
    font-size: 12px;
    color: $color-text-secondary;
  }

  .detail-uq-cell .arrow {
    flex-shrink: 0;
    margin-left: 0;
  }

  .detail-uq-progress {
    flex-shrink: 0;
    width: 48px;
    margin: 0;

    :deep(.el-progress-bar__outer) {
      height: 4px;
      background-color: rgb(255 255 255 / 8%);
      border-radius: 9999px;
    }

    :deep(.el-progress-bar__inner) {
      border-radius: 9999px;
    }
  }

  .mini-bar {
    display: inline-block;
    width: 24px;
    height: 6px;
    margin-left: 2px;
    vertical-align: middle;
    border-radius: 2px;

    @include trend-colors-bg();
  }

  .arrow {
    margin-left: 2px;

    @include trend-colors();
  }

  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 4px;
    vertical-align: middle;
    border-radius: 50%;

    &.excellent {
      background: $color-success;
    }

    &.average {
      background: $color-warning;
    }

    &.poor {
      background: $color-danger;
    }
  }

  .panel-table {
    overflow: hidden;
    background-color: rgb(10 10 14 / 98%);
    background-image:
      radial-gradient(ellipse 78% 42% at 0% 0%, rgb(59 130 246 / 14%) 0%, transparent 55%),
      radial-gradient(ellipse 55% 40% at 100% 100%, rgb(139 92 246 / 10%) 0%, transparent 55%);
    border-color: rgb(96 165 250 / 28%);
    border-radius: 12px;
    box-shadow:
      0 12px 48px rgb(0 0 0 / 48%),
      0 0 0 1px rgb(96 165 250 / 10%),
      inset 0 1px 0 rgb(186 230 253 / 12%);
    transition:
      border-color 0.32s cubic-bezier(0, 0, 0.2, 1),
      box-shadow 0.42s cubic-bezier(0, 0, 0.2, 1);

    &:hover {
      border-color: rgb(96 165 250 / 45%);
      box-shadow:
        0 24px 72px rgb(0 0 0 / 52%),
        0 0 72px rgb(59 130 246 / 14%),
        0 0 0 1px rgb(96 165 250 / 25%);
    }

    .panel-title {
      background: linear-gradient(90deg, #93c5fd 0%, #c4b5fd 55%, #6ee7b7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    :deep(.art-table) {
      height: 100%;
      background: transparent;
    }

    :deep(.el-table) {
      margin-top: 6px;
      background: transparent !important;
    }

    :deep(.el-table__inner-wrapper),
    :deep(.el-table__header-wrapper),
    :deep(.el-table__body-wrapper),
    :deep(.el-scrollbar__view) {
      background: transparent !important;
    }

    :deep(.el-table__body tr.el-table__row) {
      background: transparent;
    }

    :deep(.el-table__inner-wrapper::before) {
      height: 0;
    }

    /* 表头整行渐变（从左到右） */
    :deep(.el-table__header thead tr) {
      background: var(--aps-table-header-gradient);
    }

    /* 让每个 th 透出整行渐变 */
    :deep(.el-table th.el-table__cell) {
      padding: 6px 0;
      font-size: 12px;
      color: var(--aps-table-header-text);
      background: transparent !important;
      border-bottom: 1px solid var(--aps-table-divider-strong);
    }

    :deep(.el-table td.el-table__cell) {
      padding: 6px 0;
      font-size: 12px;
      color: $color-text-secondary;
      background: transparent;
      border-bottom: 1px solid var(--aps-table-divider-weak);
    }

    :deep(.el-table__cell .cell) {
      padding: 0 8px;
    }

    :deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
      background: var(--aps-bg-row-hover);
    }

    :deep(.el-button.is-link) {
      padding: 0;
      font-size: 12px;
    }
  }

  /* ========== 分页 ========== */
  .pagination-wrap {
    display: flex;
    gap: 8px;
    align-items: center;
    padding-top: 12px;
    margin-top: 12px;
    font-size: $font-size-body;
    color: $color-text-muted;
    border-top: 1px solid $border-subtle;

    .page-btn {
      min-width: 28px;
      height: 28px;
      padding: 0 6px;
      font-size: $font-size-body;
      color: $color-text-secondary;
      cursor: pointer;
      background: $bg-page-btn;
      border: 1px solid $border-subtle-10;
      border-radius: $radius-page;

      &:hover:not(:disabled) {
        background: var(--aps-bg-page-btn-hover);
        border-color: var(--aps-border-page-btn-hover);
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.4;
      }

      &.active {
        color: $color-text-primary;
        background: $bg-page-btn-active;
        border-color: $color-accent;
      }
    }

    .page-size {
      margin-left: 12px;
    }

    .page-jump {
      margin-left: auto;

      input {
        width: 40px;
        padding: 2px 6px;
        margin: 0 4px;
        font-size: $font-size-body;
        color: $color-text-secondary;
        text-align: center;
        background: $bg-page-btn;
        border: 1px solid $border-subtle-10;
        border-radius: $radius-page;
      }
    }
  }

  /* ========== aps-page-fx 旋转极光 ========== */
  .aps-page-fx {
    position: absolute;
    inset: -12% -12% 40%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      rgb(59 130 246 / 10%) 0deg,
      rgb(139 92 246 / 8%) 72deg,
      rgb(16 185 129 / 6%) 144deg,
      transparent 200deg,
      rgb(59 130 246 / 8%) 288deg,
      rgb(59 130 246 / 10%) 360deg
    );
    filter: blur(48px);
    border-radius: 50%;
    animation: aps-fx-spin 22s linear infinite;
  }

  /* ========== 入场动画 ========== */
  .aps-entry-1 {
    animation: aps-slide-up 0.55s cubic-bezier(0, 0, 0.2, 1) both;
  }

  .aps-entry-2 {
    animation: aps-slide-up 0.65s 0.1s cubic-bezier(0, 0, 0.2, 1) both;
  }

  .aps-entry-3 {
    animation: aps-slide-up 0.7s 0.2s cubic-bezier(0, 0, 0.2, 1) both;
  }

  .aps-entry-4 {
    animation: aps-slide-up 0.75s 0.32s cubic-bezier(0, 0, 0.2, 1) both;
  }

  @keyframes aps-aurora-drift {
    0% {
      opacity: 0.7;
      transform: scale(1) translateX(0%);
    }

    100% {
      opacity: 1;
      transform: scale(1.04) translateX(2%);
    }
  }

  @keyframes aps-fx-spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @keyframes aps-slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 筛选/日期下拉（teleported=false 时仍在画布内，与霓虹条一致） */
  :global(html.dark .aps-filter-popper.el-popper) {
    overflow: hidden;
    background: rgb(24 24 27 / 98%) !important;
    border: 1px solid color-mix(in srgb, var(--theme-color) 32%, transparent) !important;
    border-radius: 12px !important;
    box-shadow:
      0 18px 52px rgb(0 0 0 / 58%),
      0 0 0 1px color-mix(in srgb, var(--theme-color) 12%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--theme-color) 8%, transparent) !important;
  }

  :global(html.dark .aps-filter-popper .app-platform-search-select__panel) {
    color: var(--aps-text-primary);
  }

  :global(html.dark .aps-filter-popper .app-platform-search-select__header) {
    color: rgb(226 232 240 / 72%);
  }

  :global(html.dark .aps-filter-popper .app-platform-search-select__row:hover),
  :global(html.dark .aps-filter-popper .app-platform-search-select__row.is-active) {
    background: color-mix(in srgb, var(--theme-color) 14%, transparent);
  }

  :global(html:not(.dark) .aps-filter-popper.el-popper) {
    border: 1px solid color-mix(in srgb, var(--theme-color) 22%, transparent) !important;
    border-radius: 12px !important;
    box-shadow: 0 14px 40px rgb(15 23 42 / 12%) !important;
  }

  :global(html:not(.dark) .aps-filter-popper .app-platform-search-select__panel) {
    color: var(--aps-text-primary);
  }

  :global(html:not(.dark) .aps-filter-popper .app-platform-search-select__header) {
    color: rgb(15 23 42 / 62%);
  }

  :global(html:not(.dark) .aps-filter-popper .app-platform-search-select__row:hover),
  :global(html:not(.dark) .aps-filter-popper .app-platform-search-select__row.is-active) {
    background: color-mix(in srgb, var(--theme-color) 10%, transparent);
  }

  /* ========== 无障碍：减少动画 ========== */
  @media (prefers-reduced-motion: reduce) {
    .aps-entry-1,
    .aps-entry-2,
    .aps-entry-3,
    .aps-entry-4 {
      animation: none;
    }

    .aps-page-fx {
      animation: none;
    }

    .finance-screen-wrap::before {
      animation: none;
    }

    .panel,
    .kpi-card {
      transition: none;
    }

    .aps-filter-toolbar .btn-export:hover,
    .aps-filter-toolbar .btn-export:active {
      transform: none;
    }
  }
</style>
