<template>
  <div class="map-detail-page">
    <MapDetailHeader :country-code="countryCode" :country-name="countryName">
      <template #right>
        <div class="detail-filters">
          <ElDatePicker
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
    <div class="detail-date-display">区间, {{ currentDateLabel }}</div>

    <MapDetailStatsCards :cards="statCards" />

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

        <div v-if="showThirdRow" class="section-row">
          <MapDetailRetentionChart
            :local-data="retentionLocalData"
            :global-data="retentionGlobalData"
          />
          <MapDetailLtvChart :data="ltvData" :note="ltvNote" />
          <MapDetailSegmentChart :data="segmentData" :note="segmentNote" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
  import { useRoute } from 'vue-router'
  import { formatYYYYMMDD, getAppNow } from '@/utils/app-now'
  import {
    MapDetailHeader,
    MapDetailStatsCards,
    MapDetailSpendPanel,
    MapDetailRevenuePanel,
    MapDetailRetentionChart,
    MapDetailLtvChart,
    MapDetailSegmentChart
  } from './map-detail-component'
  import type { StatCardItem } from './map-detail-component'
  import type { ChannelRow, CampaignRow } from './map-detail-component'
  import type { RevenueCompositionItem, AppPerformanceRow } from './map-detail-component'
  import type { SegmentItem } from './map-detail-component'
  import {
    fetchCountryInfoOverall,
    fetchCountryInfoTop5Campaign,
    fetchCountryInfoAppLaunch,
    fetchCountryInfoChannelLaunch,
    fetchCountryInfoLtv,
    fetchCountryInfoRemain,
    fetchCountryInfoUserPayLaunch,
    mapCountryInfoOverallToStatCards,
    mapChannelLaunchToChannelRows,
    mapLtvToChart,
    mapRemainDataToSeries,
    mapUserPayLaunchToSegment
  } from '../api/cockpit'
  import type { CountryInfoOverallData } from '../types'

  defineOptions({ name: 'CockpitMapDetail' })

  const route = useRoute()

  type RangeType = 'yesterday' | 'past7' | 'month'

  function todayStr(): string {
    return formatYYYYMMDD(getAppNow())
  }

  type DateRange = [string, string]

  function getDateRangeByQuick(type: RangeType): DateRange {
    const end = getAppNow()
    const start = new Date(end)

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

  function toCnDateLabel(s: string): string {
    const [y, m, d] = String(s || '').split('-')
    if (!y || !m || !d) return '—'
    return `${y}年${m}月${d}日`
  }

  /** 下方展示的当前日期：区间, YYYY年MM月DD日 ~ YYYY年MM月DD日 */
  const currentDateLabel = computed(() => {
    const [start, end] = filterDateRange.value || [todayStr(), todayStr()]
    return `${toCnDateLabel(start)} ~ ${toCnDateLabel(end)}`
  })

  const countryCode = computed(() => String(route.params.country || '').toUpperCase() || '—')
  const countryName = computed(() => {
    const c = String(route.params.country || '')
    return countryNameMap[c] || c || '—'
  })

  function buildCountryDateParams(): { countryCode: string; startDate: string; endDate: string } {
    const code = countryCode.value
    const [startDate, endDate] = filterDateRange.value || ['', '']
    return {
      countryCode: code && code !== '—' ? code : '',
      startDate: startDate || '',
      endDate: endDate || ''
    }
  }

  const countryNameMap: Record<string, string> = {
    US: '美国',
    CN: '中国',
    JP: '日本',
    GB: '英国',
    DE: '德国',
    IN: '印度',
    BR: '巴西',
    FR: '法国'
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

  /** 第三排（用户留存、LTV、用户分层）延后渲染，先让首屏卡片+投放/变现展示，提升首屏效率 */
  const showThirdRow = ref(false)

  async function reloadAll() {
    const params = buildCountryDateParams()
    const hasDateRange = Boolean(params.startDate && params.endDate)
    if (!hasDateRange) return

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
                ? `↑+${eCpmChangeVal}`
                : `↓${eCpmChangeVal}`
              : '—',
          fillRate: now.adExpansionRate != null ? `${Number(now.adExpansionRate)}%` : '—',
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
          remainDay7: item.remainDay7 ?? 0
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
    // LTV 预测：/api/v1/datacenter/analysis/countryInfo/ltv
    try {
      const ltvRes = await fetchCountryInfoLtv(params)
      if (ltvRes && typeof ltvRes === 'object') {
        const { data: ltvArr, note: ltvNoteStr } = mapLtvToChart(ltvRes)
        ltvData.value = ltvArr
        ltvNote.value = ltvNoteStr
      }
    } catch {
      // 接口失败时保持默认
    }
    // 用户分层：/api/v1/datacenter/analysis/countryInfo/userPayLaunch
    try {
      const userPay = await fetchCountryInfoUserPayLaunch(params)
      if (userPay && typeof userPay === 'object') {
        const { segmentData: seg, note } = mapUserPayLaunchToSegment(userPay)
        segmentData.value = seg
        segmentNote.value = note
      }
    } catch {
      // 接口失败时保持默认
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

  watch([filterDateRange, countryCode], scheduleReload, { deep: true })

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

  /** LTV 预测图表与头部文案来自 /api/v1/datacenter/analysis/countryInfo/ltv */
  const ltvData = ref<number[]>([])
  const ltvNote = ref('')

  /** 用户分层饼图数据与底部文案来自 /api/v1/datacenter/analysis/countryInfo/userPayLaunch */
  const segmentData = ref<SegmentItem[]>([])
  const segmentNote = ref('')
</script>

<style scoped lang="scss">
  .map-detail-page {
    padding-bottom: 24px;
  }

  .main-row {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  .main-content {
    flex: 1;
    min-width: 0;

    /* 投放分析、变现分析、用户留存曲线、LTV 预测、用户分层 等模块标题：字体变大并加粗 */
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
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .detail-range-slider {
    position: absolute;
    top: 3px;
    left: 3px;
    width: calc((100% - 6px) / 2);
    height: calc(100% - 6px);
    pointer-events: none;
    background: var(--el-color-primary);
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
      color: var(--el-text-color-primary);
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
  }

  @media (width <= 1200px) {
    .section-row.two-cols,
    .section-row:not(.two-cols) {
      grid-template-columns: 1fr;
    }
  }
</style>
