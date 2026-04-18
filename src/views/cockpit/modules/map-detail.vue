<template>
  <div class="map-detail-page flex flex-col">
    <div class="map-detail-page-fx" aria-hidden="true"></div>
    <div class="map-detail-page__section map-detail-entry-1">
      <div class="map-detail-top-shell">
        <MapDetailHeader :country-code="countryCode" :country-name="countryName">
          <template #right>
            <div class="detail-filters">
              <AppDatePicker
                v-model="filterDateRange"
                type="daterange"
                range-separator="~"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="detail-date-picker"
              />
              <div class="detail-range-box">
                <div
                  class="detail-range-slider"
                  :style="{ transform: `translateX(${rangeIndex * 100}%)` }"
                />
                <button
                  v-for="opt in rangeOptions"
                  :key="opt.value"
                  type="button"
                  class="detail-range-btn"
                  :class="{ active: rangeType === opt.value }"
                  @click="selectRange(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </template>
        </MapDetailHeader>
      </div>
    </div>

    <div class="map-detail-entry-2">
      <!-- <div class="detail-date-display">区间, {{ currentDateLabel }}</div> -->

      <MapDetailStatsCards :cards="statCards" />
    </div>

    <div class="map-detail-entry-3 main-row-wrap">
      <div class="main-row">
        <div class="main-content">
          <div class="section-row two-cols">
            <MapDetailSpendPanel
              :channel-data="channelTableData"
              :campaign-data="campaignTableData"
              :channel-loading="channelLoading"
              :campaign-loading="campaignLoading"
            />
            <MapDetailRevenuePanel
              :metrics="revenueMetrics"
              :composition-data="revenueCompositionData"
              :app-table-data="appPerformanceData"
              :region-label="countryName"
              :app-loading="appPerformanceLoading"
            />
          </div>

          <div v-if="showThirdRow" class="section-row third-row--single">
            <MapDetailRetentionChart
              :local-data="retentionLocalData"
              :global-data="retentionGlobalData"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { useRoute } from 'vue-router'
  import { formatYYYYMMDD, getAppNow, cloneAppDate } from '@/utils/app-now'
  import {
    MapDetailHeader,
    MapDetailStatsCards,
    MapDetailSpendPanel,
    MapDetailRevenuePanel,
    MapDetailRetentionChart
  } from './map-detail-component'
  import type { StatCardItem } from './map-detail-component'
  import type { ChannelRow, CampaignRow } from './map-detail-component'
  import type { RevenueCompositionItem, AppPerformanceRow } from './map-detail-component'
  import {
    fetchCountryInfoOverall,
    fetchCountryInfoTop5Campaign,
    fetchCountryInfoAppLaunch,
    fetchCountryInfoChannelLaunch,
    fetchCountryInfoRemain,
    mapCountryInfoOverallToStatCards,
    mapChannelLaunchToChannelRows,
    mapRemainDataToSeries
  } from '../api/cockpit'
  import type { CountryInfoOverallData } from '../types'

  defineOptions({ name: 'CockpitMapDetail' })

  const route = useRoute()

  type RangeType = 'yesterday' | 'past7' | 'month'

  type DateRange = [string, string]

  function getDateRangeByQuick(type: RangeType): DateRange {
    const end = getAppNow()
    const start = cloneAppDate(end)

    if (type === 'yesterday') {
      start.setDate(start.getDate() - 1)
      end.setDate(end.getDate() - 1)
    } else if (type === 'past7') {
      start.setDate(start.getDate() - 6)
    } else {
      start.setDate(1)
    }

    return [formatYYYYMMDD(start), formatYYYYMMDD(end)]
  }

  const rangeOptions: { value: RangeType; label: string }[] = [
    { value: 'yesterday', label: '昨天' },
    { value: 'past7', label: '过去7天' }
    // { value: 'month', label: '本月' }
  ]

  const rangeType = ref<RangeType>('yesterday')
  const filterDateRange = ref<DateRange>(getDateRangeByQuick('yesterday'))

  const rangeIndex = computed(() => rangeOptions.findIndex((o) => o.value === rangeType.value))

  function selectRange(value: RangeType) {
    rangeType.value = value
    filterDateRange.value = getDateRangeByQuick(value)
  }

  const countryCodeParam = computed(() => String(route.params.country || '').toUpperCase())
  const countryCode = computed(() => countryCodeParam.value || '—')

  /** 路由里多为小写 ISO（与地图 data-country-code 一致），须规范化后再查名 */
  function getCountryNameZhFromIso(iso: string): string {
    const raw = String(iso || '').trim()
    if (!raw) return '—'
    const upper = raw.toUpperCase()
    if (!/^[A-Z]{2}$/.test(upper)) return raw
    try {
      const dn = new Intl.DisplayNames(['zh-CN'], { type: 'region' })
      return dn.of(upper) ?? upper
    } catch {
      return upper
    }
  }

  const countryName = computed(() => getCountryNameZhFromIso(String(route.params.country || '')))

  function buildCountryDateParams(): { countryCode: string; startDate: string; endDate: string } {
    const code = countryCodeParam.value
    const [startDate, endDate] = filterDateRange.value || ['', '']
    return {
      countryCode: code || '',
      startDate: startDate || '',
      endDate: endDate || ''
    }
  }

  // 第一排：5 个统计卡片（来自接口 /api/v1/datacenter/analysis/countryInfo/overall）
  const statCards = ref<StatCardItem[]>([
    {
      label: '广告收入 (Ad Revenue)',
      value: '—',
      compare: '—',
      compareUp: true,
      bgClass: 'bg-green'
    },
    {
      label: '广告支出 (Ad Spend)',
      value: '—',
      compare: '—',
      compareUp: true,
      bgClass: 'bg-orange'
    },
    { label: 'ROI', value: '—', compare: '—', compareUp: true, bgClass: 'bg-blue' },
    {
      label: '活跃用户 DAU',
      value: '—',
      compare: '—',
      compareUp: true,
      bgClass: 'bg-purple'
    },
    { label: '新增用户', value: '—', compare: '—', compareUp: true, bgClass: 'bg-green' }
  ])

  /** 缓存最近一次国家详情 overall 接口数据，用于切换范围时只更新对比文案（vs昨天/vs过去7天/vs本月） */
  const lastCountryOverallData = ref<CountryInfoOverallData | null>(null)

  /** 切换范围按钮时，用当前周期文案重新生成卡片对比文案 */
  watch(rangeType, () => {
    const data = lastCountryOverallData.value
    if (data && typeof data === 'object' && 'now' in data && 'last' in data) {
      const periodLabel = rangeOptions.find((o) => o.value === rangeType.value)?.label
      statCards.value = mapCountryInfoOverallToStatCards(data, periodLabel) as StatCardItem[]
    }
  })

  /** 第三排（用户留存曲线）延后渲染；LTV / 用户分层接口暂不可用已下线 */
  const showThirdRow = ref(false)

  async function reloadAll() {
    if (route.name !== 'CockpitMapDetail') return
    const params = buildCountryDateParams()
    const hasDateRange = Boolean(params.startDate && params.endDate)
    if (!params.countryCode || !hasDateRange) return

    // 刷新时重置 loading
    channelLoading.value = true
    campaignLoading.value = true
    appPerformanceLoading.value = true

    // 刷新时：第三排延后展示（避免一次性渲染太多图表）
    showThirdRow.value = false
    if (thirdRowTimer != null) clearTimeout(thirdRowTimer)

    // 优先加载顶部卡片数据（与投放分析、变现分析同屏，先请求）
    try {
      const res = await fetchCountryInfoOverall(params)
      // 注意：http 层成功时返回的是接口的 data 字段，故 res 即为 { last, now, *Change }，无 code
      if (res && typeof res === 'object' && 'now' in res && 'last' in res) {
        lastCountryOverallData.value = res
        const periodLabel = rangeOptions.find((o) => o.value === rangeType.value)?.label
        statCards.value = mapCountryInfoOverallToStatCards(res, periodLabel) as StatCardItem[]
        // 变现分析（收入构成 + 指标）复用 overall 的 now：dAdRevenue, dIapRevenue, eCpm, adExpansionRate, arpu
        const now = res.now
        const adRev = Number(now.dAdRevenue) || 0
        const iapRev = Number(now.dIapRevenue) || 0
        const totalRev = adRev + iapRev
        const adPct = totalRev > 0 ? Math.round((adRev / totalRev) * 100) : 0
        const iapPct = totalRev > 0 ? 100 - adPct : 0
        revenueCompositionData.value = [
          {
            label: '广告收入',
            value: `$${(adRev / 1000).toFixed(0)}K`,
            percent: adPct,
            color: '#3984F1'
          },
          {
            label: '内购收入',
            value: `$${(iapRev / 1000).toFixed(0)}K`,
            percent: iapPct,
            color: '#f59e0b'
          }
        ]
        const eCpmVal = now.eCpm != null ? Number(now.eCpm) : null
        const eCpmChangeVal = res.eCpmChange != null ? Number(res.eCpmChange) : null
        revenueMetrics.value = {
          ecpm: eCpmVal != null ? `$${eCpmVal.toFixed(2)}` : '—',
          ecpmTrend:
            eCpmChangeVal != null
              ? eCpmChangeVal >= 0
                ? `↑+${(eCpmChangeVal * 100).toFixed(2)}%`
                : `↓${(Math.abs(eCpmChangeVal) * 100).toFixed(2)}%`
              : '—',
          fillRate:
            now.adExpansionRate != null ? `${Number(now.adExpansionRate).toFixed(2)}%` : '—',
          arpu: now.arpu != null ? `$${Number(now.arpu).toFixed(2)}` : '—'
        }
      }
    } catch {
      // 接口失败时保留默认占位
    }
    // 广告平台投放效果对比：/api/v1/datacenter/analysis/countryInfo/channelLaunch
    try {
      const channelList = await fetchCountryInfoChannelLaunch(params)
      if (Array.isArray(channelList)) {
        channelTableData.value = mapChannelLaunchToChannelRows(channelList)
      }
    } catch {
      // 接口失败时保持空列表
    } finally {
      channelLoading.value = false
    }
    // 当前投放中 Campaign (Top 5)：/api/v1/datacenter/analysis/countryInfo/top5Campaign
    try {
      const list = await fetchCountryInfoTop5Campaign(params)
      if (Array.isArray(list)) {
        campaignTableData.value = list.map((item) => ({
          name: item.campaign ?? '—',
          amount: item.cost ?? 0,
          count: item.install ?? 0,
          roi: item.roi ?? 0,
          status: item.status ?? '投放中'
        }))
      }
    } catch {
      // 接口失败时保持空列表
    } finally {
      campaignLoading.value = false
    }

    // 各 APP 在区域表现：/api/v1/datacenter/analysis/countryInfo/appLaunch
    try {
      const list = await fetchCountryInfoAppLaunch(params)
      if (Array.isArray(list)) {
        appPerformanceData.value = list.map((item) => ({
          app: item.app ?? '—',
          arpu: item.arpu ?? 0,
          dAdRevenue: item.dAdRevenue ?? 0,
          dIapRevenue: item.dIapRevenue ?? 0,
          remainDay1: item.remainDay1 ?? 0
        }))
      }
    } catch {
      // 接口失败时保持空列表
    } finally {
      appPerformanceLoading.value = false
    }
    // 用户留存曲线：/api/v1/datacenter/analysis/countryInfo/remain（currentCountry + globalAvg）
    try {
      const remain = await fetchCountryInfoRemain(params)
      if (remain?.currentCountry && remain?.globalAvg) {
        const { local, global } = mapRemainDataToSeries(remain)
        retentionLocalData.value = local
        retentionGlobalData.value = global
      }
    } catch {
      // 接口失败时保持空数组
    }
    // 下一帧再展示第三排，避免首屏同时渲染图表，提升首屏渲染与用户体感
    await nextTick()
    thirdRowTimer = window.setTimeout(() => {
      showThirdRow.value = true
    }, 120)
  }

  // 日期 / 国家变更后自动刷新（防抖，避免频繁请求）
  let reloadTimer: number | undefined
  function scheduleReload() {
    if (reloadTimer != null) window.clearTimeout(reloadTimer)
    reloadTimer = window.setTimeout(() => {
      void reloadAll()
    }, 300)
  }

  watch([filterDateRange, countryCodeParam], scheduleReload, { deep: true })

  onMounted(() => {
    void reloadAll()
  })

  let thirdRowTimer: number | undefined
  onUnmounted(() => {
    if (thirdRowTimer != null) clearTimeout(thirdRowTimer)
    if (reloadTimer != null) window.clearTimeout(reloadTimer)
  })

  /** 广告平台投放效果对比来自 /api/v1/datacenter/analysis/countryInfo/channelLaunch（仅展示 now） */
  const channelTableData = ref<ChannelRow[]>([])
  const channelLoading = ref(true)

  const campaignTableData = ref<CampaignRow[]>([])
  const campaignLoading = ref(true)

  /** 变现分析指标与收入构成来自 countryInfo/overall 的 now（与第一排共用一次请求） */
  const revenueMetrics = ref({
    ecpm: '—',
    ecpmTrend: '—',
    fillRate: '—',
    arpu: '—'
  })
  const revenueCompositionData = ref<RevenueCompositionItem[]>([
    { label: '广告收入', value: '—', percent: 0, color: '#3984F1' },
    { label: '内购收入', value: '—', percent: 0, color: '#f59e0b' }
  ])
  const appPerformanceData = ref<AppPerformanceRow[]>([])
  const appPerformanceLoading = ref(true)

  /** 用户留存曲线：本地区 + 全局平均均来自 /api/v1/datacenter/analysis/countryInfo/remain */
  const retentionLocalData = ref<number[]>([])
  const retentionGlobalData = ref<number[]>([])
</script>

<style scoped lang="scss">
  @use '../../user-growth/ad-performance/styles/ap-card-fx.scss' as *;

  .map-detail-page {
    position: relative;
    min-width: 0;
    padding: 20px 24px 28px;
    overflow-x: clip;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 70% 50% at 6% 6%,
          rgb(16 185 129 / 42%) 0%,
          rgb(6 182 212 / 20%) 38%,
          transparent 58%
        ),
        radial-gradient(
          ellipse 55% 42% at 94% 8%,
          rgb(59 130 246 / 38%) 0%,
          rgb(139 92 246 / 18%) 38%,
          transparent 58%
        ),
        radial-gradient(ellipse 40% 35% at 48% 18%, rgb(168 85 247 / 18%) 0%, transparent 55%),
        radial-gradient(
          ellipse 55% 42% at 76% 4%,
          rgb(34 211 238 / 22%) 0%,
          rgb(59 130 246 / 10%) 40%,
          transparent 58%
        );
      mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 58%);
      animation:
        map-detail-aurora 14s ease-in-out infinite alternate,
        map-detail-bg-flow 22s ease-in-out infinite alternate;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(186 230 253 / 5%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 5%) 1px, transparent 1px),
        radial-gradient(circle, rgb(6 182 212 / 8%) 1px, transparent 1px);
      background-size:
        40px 40px,
        40px 40px,
        80px 80px;
      mask-image: linear-gradient(to bottom, black 0%, black 18%, transparent 45%);
    }

    > *:not(.map-detail-page-fx) {
      position: relative;
      z-index: 1;
    }
  }

  .map-detail-page-fx {
    position: absolute;
    inset: -12% -12% 40%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgb(59 130 246 / 14%) 55deg,
      rgb(6 182 212 / 10%) 80deg,
      transparent 130deg,
      rgb(16 185 129 / 12%) 200deg,
      rgb(52 211 153 / 8%) 225deg,
      transparent 285deg,
      rgb(168 85 247 / 10%) 330deg,
      rgb(249 115 22 / 6%) 350deg,
      transparent 360deg
    );
    opacity: 0.85;
    mask-image: linear-gradient(to bottom, black 0%, black 50%, transparent 85%);
    animation: map-detail-fx-spin 52s linear infinite;
    will-change: transform;
  }

  @keyframes map-detail-aurora {
    0% {
      filter: hue-rotate(0deg);
      opacity: 0.72;
      transform: scale(1) translate(0, 0);
    }

    50% {
      filter: hue-rotate(18deg);
      opacity: 1;
      transform: scale(1.06) translate(1.2%, -1.2%);
    }

    100% {
      filter: hue-rotate(-12deg);
      opacity: 0.82;
      transform: scale(1) translate(-1.2%, 1.2%);
    }
  }

  @keyframes map-detail-bg-flow {
    0% {
      opacity: 0.7;
      transform: scaleY(1) skewX(0deg);
    }

    100% {
      opacity: 1;
      transform: scaleY(1.08) skewX(1deg);
    }
  }

  @keyframes map-detail-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .map-detail-entry-1 {
    animation: map-detail-slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.05s;
  }

  .map-detail-entry-2 {
    animation: map-detail-slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.12s;
  }

  .map-detail-entry-3 {
    animation: map-detail-slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.18s;
  }

  @keyframes map-detail-slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .map-detail-page__section {
    margin-bottom: 20px;
  }

  .map-detail-top-shell {
    position: relative;
    padding: 14px 16px;
    overflow: hidden;
    border-radius: 12px;

    @include ap-neon-bg;
    @include ap-card-mesh;
    @include ap-panel-hover;

    &:hover,
    &:active {
      transform: none !important;
    }

    &:active {
      transition-duration: var(--duration-fast);
    }

    :deep(.map-detail-header) {
      position: relative;
      z-index: 1;
      margin-bottom: 0;
    }

    :deep(.detail-filters) {
      position: relative;
      z-index: 1;
    }
  }

  .main-row-wrap {
    flex: 1;
    min-width: 0;
  }

  .main-row {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  .main-content {
    flex: 1;
    min-width: 0;

    /* 投放分析、变现分析、用户留存曲线 等模块标题：字体变大并加粗 */
    :deep(.el-card__header) {
      font-size: 16px;
      font-weight: bold;
    }
  }

  .detail-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .detail-date-picker {
    width: 260px;
  }

  .detail-range-box {
    position: relative;
    display: inline-flex;
    padding: 3px;
    background: rgb(8 12 24 / 55%);
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 10px;
  }

  .detail-range-slider {
    position: absolute;
    top: 3px;
    left: 3px;
    width: calc((100% - 6px) / 2);
    height: calc(100% - 6px);
    pointer-events: none;
    background: linear-gradient(92deg, rgb(59 130 246 / 95%), rgb(6 182 212 / 88%));
    border-radius: 6px;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .detail-range-btn {
    position: relative;
    z-index: 1;
    flex: 1;
    min-width: 80px;
    padding: 6px 14px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 6px;
    transition: color 0.2s ease;

    &:hover {
      color: rgb(125 211 252);
    }

    &.active {
      color: #fff;
    }
  }

  .detail-date-display {
    margin-bottom: 16px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  .section-row {
    display: grid;
    gap: 16px;
    margin-bottom: 16px;

    &.two-cols {
      grid-template-columns: 1fr 1fr;
    }

    &:not(.two-cols) {
      grid-template-columns: repeat(3, 1fr);
    }

    /* 仅用户留存时铺满整行（原 LTV / 用户分层已下线） */
    &.third-row--single {
      grid-template-columns: 1fr;
    }
  }

  @media (width <= 1200px) {
    .section-row.two-cols,
    .section-row:not(.two-cols) {
      grid-template-columns: 1fr;
    }
  }

  @media (width <= 768px) {
    .map-detail-page {
      padding-bottom: 16px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .map-detail-page::before,
    .map-detail-page-fx {
      animation: none;
    }

    .map-detail-entry-1,
    .map-detail-entry-2,
    .map-detail-entry-3 {
      opacity: 1;
      transform: none;
      animation: none;
    }
  }
</style>

<style lang="scss">
  @use '../../user-growth/ad-performance/styles/ap-card-fx.scss' as *;

  html.dark .el-card.map-detail-spend-panel,
  html.dark .el-card.map-detail-revenue-panel,
  html.dark .el-card.map-detail-retention-chart {
    position: relative;
    overflow: hidden;
    border-radius: 12px;

    @include ap-neon-bg;
    @include ap-card-mesh;
    @include ap-panel-hover;

    &:hover,
    &:active {
      transform: none !important;
    }

    &:active {
      transition-duration: var(--duration-fast);
    }
  }

  html.dark .el-card.map-detail-spend-panel .el-card__header,
  html.dark .el-card.map-detail-revenue-panel .el-card__header,
  html.dark .el-card.map-detail-retention-chart .el-card__header {
    position: relative;
    z-index: 1;
    background: transparent;
    border-bottom: 1px solid rgb(96 165 250 / 14%);
  }

  html.dark .el-card.map-detail-spend-panel .el-card__body,
  html.dark .el-card.map-detail-revenue-panel .el-card__body,
  html.dark .el-card.map-detail-retention-chart .el-card__body {
    position: relative;
    z-index: 1;
    background: transparent;
  }
</style>
