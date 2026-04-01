<template>
  <div class="iaa-tab-content iaa-tab-ad-type">
    <!-- KPI 卡片行（通栏） -->
    <section v-if="loading" class="iaa-kpi-grid">
      <article v-for="i in 4" :key="i" class="iaa-kpi iaa-kpi--sk">
        <ElSkeleton animated :throttle="0">
          <template #template>
            <div class="iaa-kpi-sk">
              <ElSkeletonItem variant="text" class="iaa-kpi-sk__t" />
              <ElSkeletonItem variant="text" class="iaa-kpi-sk__v" />
              <ElSkeletonItem variant="text" class="iaa-kpi-sk__s" />
            </div>
          </template>
        </ElSkeleton>
      </article>
    </section>

    <section v-else-if="kpi" class="iaa-kpi-grid">
      <article class="iaa-kpi" data-accent="teal">
        <div class="iaa-kpi__title">广告总收入</div>
        <div class="iaa-kpi__value">{{ formatUsd(kpi.revenueTotal) }}</div>
        <div class="iaa-kpi__sub warn">
          <el-icon><Warning /></el-icon>
          真实 {{ formatUsd(kpi.revenueReal) }}
        </div>
      </article>

      <article class="iaa-kpi">
        <div class="iaa-kpi__title">广告用户渗透率</div>
        <div class="iaa-kpi__value">{{ kpi.penetrationPct.toFixed(1) }}%</div>
        <div class="iaa-kpi__sub">
          {{ kpi.adUsers.toLocaleString() }}/{{ kpi.dau.toLocaleString() }} DAU
        </div>
      </article>

      <article class="iaa-kpi">
        <div class="iaa-kpi__title">人均展示次数</div>
        <div class="iaa-kpi__value">{{ kpi.impressionsPerUser.toFixed(1) }}次</div>
        <div class="iaa-kpi__sub">广告展示 {{ kpi.impressions.toLocaleString() }}</div>
      </article>

      <article class="iaa-kpi">
        <div class="iaa-kpi__title">ECPM</div>
        <div class="iaa-kpi__value ecpm-value">
          <span class="ecpm-est">{{ kpi.ecpmEst.toFixed(2) }}</span>
          <span class="ecpm-label">（预估）</span>
          <span class="ecpm-sep">/</span>
          <span class="ecpm-real">{{ kpi.ecpmReal.toFixed(2) }}</span>
          <span class="ecpm-label">（真实）</span>
        </div>
        <div class="iaa-kpi__sub" :class="kpi.ecpmVariancePct >= 0 ? 'up' : 'down'">
          <el-icon><Top v-if="kpi.ecpmVariancePct >= 0" /><Bottom v-else /></el-icon>
          偏差 {{ kpi.ecpmVariancePct >= 0 ? '+' : '' }}{{ kpi.ecpmVariancePct.toFixed(1) }}%
        </div>
      </article>
    </section>

    <!-- 主内容区：三列上 + 两列下 -->
    <section class="iaa-main-grid">
      <!-- 左列：广告类型详细对比 -->
      <div class="iaa-col iaa-col--left">
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header>
            <div class="panel-header-row">
              <span>广告类型详细对比</span>
              <div class="radar-tabs">
                <span
                  v-for="t in radarTabs"
                  :key="t.key"
                  class="radar-tab"
                  :class="{ active: activeRadarTab === t.key }"
                  @click="activeRadarTab = t.key"
                  >{{ t.label }}</span
                >
              </div>
            </div>
          </template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--radar"></div>
          <div v-else ref="radarChartRef" class="iaa-chart iaa-chart--radar"></div>
          <table class="ad-type-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>收入</th>
                <th>%</th>
                <th>Users</th>
                <th>ECPM</th>
                <th>Impressions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in adTypeTableData" :key="row.adTypeName">
                <td class="name-cell">{{ row.adTypeName }}</td>
                <td>收入 ${{ row.revenue.toLocaleString() }}</td>
                <td>{{ row.revenueShare }}%</td>
                <td>用户 {{ row.users.toLocaleString() }}</td>
                <td>{{ row.ecpm.toFixed(2) }}</td>
                <td>展示 {{ row.impressions.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </ElCard>
      </div>

      <!-- 中列：广告平台效果排行 -->
      <div class="iaa-col iaa-col--mid">
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header><span>广告平台效果排行</span></template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--bar"></div>
          <div v-else ref="platformBarRef" class="iaa-chart iaa-chart--bar"></div>
          <div v-if="platformInsight" class="iaa-insight-banner">
            <el-icon><Sunny /></el-icon>
            {{ platformInsight }}
          </div>
        </ElCard>
      </div>

      <!-- 右列：广告位 Top10 收入 -->
      <div class="iaa-col iaa-col--right">
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header><span>广告位 Top10收入</span></template>
          <div v-if="loading" class="iaa-list-sk">
            <div v-for="i in 6" :key="i" class="iaa-list-sk__row">
              <ElSkeleton animated :throttle="0">
                <template #template>
                  <ElSkeletonItem variant="text" class="iaa-list-sk__t" />
                </template>
              </ElSkeleton>
            </div>
          </div>
          <div v-else class="iaa-top10-list">
            <div
              v-for="(item, i) in placementTop10View"
              :key="item.placementName"
              class="iaa-top10-item"
            >
              <span class="iaa-top10-rank" :class="getRankClass(i)">{{ i + 1 }}</span>
              <span class="iaa-top10-name">{{ item.placementName }}</span>
              <span class="iaa-top10-dot" :style="{ background: item.dotColor }"></span>
              <span class="iaa-top10-value">${{ item.revenue.toFixed(2) }}</span>
              <div class="iaa-top10-bar">
                <div
                  class="iaa-top10-bar__fill"
                  :style="{ width: item.percent + '%', background: item.barColor }"
                />
              </div>
              <span class="iaa-top10-pct">{{ item.percent.toFixed(1) }}%</span>
            </div>
          </div>
        </ElCard>
      </div>
    </section>

    <!-- 下方两列 -->
    <section class="iaa-bottom-grid">
      <!-- 广告类型趋势 -->
      <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
        <template #header>
          <div class="panel-header-row">
            <span>广告类型趋势(近7天)</span>
            <div class="trend-legend">
              <span v-for="l in trendLegend" :key="l.name" class="legend-item">
                <i :style="{ background: l.color }"></i>{{ l.name }}
              </span>
            </div>
          </div>
        </template>
        <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--line"></div>
        <div v-else ref="trendChartRef" class="iaa-chart iaa-chart--line"></div>
      </ElCard>

      <!-- 用户拆分分析 -->
      <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
        <template #header>
          <div class="panel-header-row">
            <span>用户拆分分析(安装天数)</span>
            <div class="trend-legend">
              <span class="legend-item"><i style="background: #3b82f6"></i>广告收入</span>
              <span class="legend-item hollow"
                ><i style="border: 2px solid #10b981"></i>活动性用户</span
              >
            </div>
          </div>
        </template>
        <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--bar"></div>
        <div v-else ref="userBreakdownRef" class="iaa-chart iaa-chart--bar"></div>
        <div v-if="userBreakdownInsight" class="iaa-insight-banner">
          <el-icon><Sunny /></el-icon>
          {{ userBreakdownInsight }}
        </div>
      </ElCard>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, nextTick } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { IaaFilterState, IaaAdTypeTabData } from '../types'
  import { fetchIaaAdTypeTabData, fetchIaaOverviewUserBreakdown } from '@/api/business-insight'
  import { Warning, Top, Bottom, Sunny } from '@element-plus/icons-vue'

  defineOptions({ name: 'IaaTabAdType' })

  const props = defineProps<{ filter: IaaFilterState }>()

  const tabData = ref<IaaAdTypeTabData | null>(null)
  const loading = ref(false)

  const kpi = computed(() => tabData.value?.kpi ?? null)
  const platformInsight = computed(() => tabData.value?.platformInsight ?? '')
  const userBreakdownInsight = computed(() => tabData.value?.userBreakdown?.insight ?? '')

  const adTypeTableData = computed(() => tabData.value?.compareRows ?? [])

  const TOP10_DOT = '#10B981'
  const TOP10_BAR = '#10B981'

  const placementTop10View = computed(() => {
    const list = tabData.value?.placementTop10 ?? []
    return list.map((row) => ({
      ...row,
      dotColor: TOP10_DOT,
      barColor: TOP10_BAR
    }))
  })

  function emptyIfAll(v: string | undefined, all = 'all') {
    if (v === undefined || v === '' || v === all) return ''
    return v
  }

  function formatUsd(n: number) {
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // ——— Radar Tab ———
  const radarTabs = [
    { key: 'revenue' as const, label: '收入' },
    { key: 'users' as const, label: '用户' },
    { key: 'impressions' as const, label: '展示数' },
    { key: 'avgRevenue' as const, label: '平均收入' }
  ]
  const activeRadarTab = ref<(typeof radarTabs)[number]['key']>('revenue')

  function getRankClass(i: number) {
    if (i === 0) return 'rank-gold'
    if (i === 1) return 'rank-silver'
    if (i === 2) return 'rank-bronze'
    return 'rank-default'
  }

  const trendLegend = computed(() => {
    const series = tabData.value?.trend7d?.series ?? []
    return series.map((s) => ({ name: s.name, color: s.color }))
  })

  // ——— ECharts ———
  const useRadar = useChart()
  const usePlatformBar = useChart()
  const useTrend = useChart()
  const useUserBreakdown = useChart()
  const radarChartRef = useRadar.chartRef
  const platformBarRef = usePlatformBar.chartRef
  const trendChartRef = useTrend.chartRef
  const userBreakdownRef = useUserBreakdown.chartRef

  function radarSeriesValues(): number[] {
    const r = tabData.value?.radar
    const v = r?.values
    if (!v) return []
    const pick = (a: number[] | undefined) => (Array.isArray(a) ? a : [])
    switch (activeRadarTab.value) {
      case 'revenue':
        return pick(v.revenue)
      case 'users':
        return pick(v.users)
      case 'impressions':
        return pick(v.impressions)
      case 'avgRevenue':
        return pick(v.avgRevenue)
      default:
        return pick(v.revenue)
    }
  }

  function radarMetricMax(): number {
    const r = tabData.value?.radar
    const m = r?.maxByMetric
    if (!m) return 1
    const pick = (n: number | undefined) =>
      Number.isFinite(n) && (n as number) > 0 ? (n as number) : 1
    switch (activeRadarTab.value) {
      case 'revenue':
        return pick(m.revenue)
      case 'users':
        return pick(m.users)
      case 'impressions':
        return pick(m.impressions)
      case 'avgRevenue':
        return pick(m.avgRevenue)
      default:
        return pick(m.revenue)
    }
  }

  function radarSeriesName(): string {
    return radarTabs.find((t) => t.key === activeRadarTab.value)?.label ?? ''
  }

  function buildRadarOption(): EChartsOption {
    const names = tabData.value?.radar?.indicatorNames ?? []
    const max = radarMetricMax()
    let vals = radarSeriesValues()

    // 雷达图要求 indicator 数量与 data.value 长度严格一致；空轴 + 非空 value 会触发 ECharts 内部报错
    let indicators = names.map((n) => ({ name: n, max }))
    if (indicators.length === 0) {
      indicators = [{ name: ' ', max }]
      vals = [0]
    } else {
      if (vals.length < indicators.length) {
        vals = [...vals, ...Array(indicators.length - vals.length).fill(0)]
      } else if (vals.length > indicators.length) {
        vals = vals.slice(0, indicators.length)
      }
    }

    return {
      backgroundColor: 'transparent',
      radar: {
        indicator: indicators,
        center: ['50%', '52%'],
        radius: '62%',
        axisName: { color: '#94a3b8', fontSize: 12 },
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } },
        axisLine: { lineStyle: { color: 'rgba(148,163,184,0.2)' } },
        splitArea: { show: false }
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: vals,
              name: radarSeriesName(),
              areaStyle: { color: 'rgba(59,130,246,0.25)', opacity: 1 },
              lineStyle: { color: '#3B82F6', width: 2 },
              itemStyle: { color: '#3B82F6' },
              symbol: 'circle',
              symbolSize: 5
            }
          ]
        }
      ]
    }
  }

  function buildPlatformBarOption(): EChartsOption {
    const rows = tabData.value?.platformRanking ?? []
    const names = rows.map((r) => r.sourceName)
    const revenues = rows.map((r) => r.revenue)
    const ecpms = rows.map((r) => r.ecpm.toFixed(2))
    const n = names.length || 1
    return {
      backgroundColor: 'transparent',
      grid: { left: 40, right: 16, top: 40, bottom: 56 },
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: { color: '#94a3b8', fontSize: 11 },
        axisLine: { lineStyle: { color: '#1e293b' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '${value}' },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
      },
      series: [
        {
          type: 'bar',
          data: revenues,
          itemStyle: { color: '#3B82F6', borderRadius: [3, 3, 0, 0] },
          barMaxWidth: 40,
          label: {
            show: true,
            position: 'top',
            formatter: (p: any) => `$${Number(p.value ?? 0).toFixed(2)}`,
            color: '#f1f5f9',
            fontSize: 11
          }
        }
      ],
      graphic: names.map((_, i) => ({
        type: 'text',
        left: `${8 + i * (100 / n)}%`,
        bottom: 14,
        style: {
          text: `ECPM ${ecpms[i] ?? ''}`,
          fill: '#64748b',
          fontSize: 10
        }
      }))
    }
  }

  const TREND_AREA: Record<string, string> = {
    '#3B82F6': 'rgba(59,130,246,0.35)',
    '#10B981': 'rgba(16,185,129,0.35)',
    '#8B5CF6': 'rgba(139,92,246,0.35)',
    '#F59E0B': 'rgba(245,158,11,0.35)'
  }

  function buildTrendOption(): EChartsOption {
    const dates = tabData.value?.trend7d?.dates ?? []
    const series = tabData.value?.trend7d?.series ?? []
    return {
      backgroundColor: 'transparent',
      grid: { left: 52, right: 24, top: 16, bottom: 28 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { color: '#64748b', fontSize: 10 },
        axisLine: { lineStyle: { color: '#1e293b' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#64748b', fontSize: 10, formatter: '${value}K' },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
      },
      series: series.map((s) => ({
        name: s.name,
        type: 'line' as const,
        stack: 'total',
        data: s.data,
        areaStyle: { color: TREND_AREA[s.color] ?? 'rgba(59,130,246,0.35)' },
        lineStyle: { color: s.color, width: 2 },
        symbol: 'none',
        itemStyle: { color: s.color },
        smooth: true
      }))
    }
  }

  function buildUserBreakdownOption(): EChartsOption {
    const buckets = tabData.value?.userBreakdown?.buckets ?? []
    const categories = buckets.map((b) => b.installDays)
    const revenue = buckets.map((b) => b.revenue)
    const users = buckets.map((b) => b.activeUsers)
    const lastIdx = Math.max(0, categories.length - 1)
    const highlightPct = tabData.value?.userBreakdown?.highlightRevenueSharePct
    return {
      backgroundColor: 'transparent',
      grid: { left: 56, right: 56, top: 32, bottom: 28 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' },
        formatter: (params: any) => {
          const list = (Array.isArray(params) ? params : []) as {
            dataIndex: number
            marker: string
            seriesName: string
            value: number
          }[]
          const idx = list[0]?.dataIndex ?? 0
          let html = `<div style="font-size:12px;margin-bottom:4px;color:#94a3b8">${categories[idx]}</div>`
          list.forEach((p) => {
            html += `<div>${p.marker}${p.seriesName}: <b>${p.value}</b></div>`
          })
          if (idx === lastIdx && highlightPct != null) {
            html += `<div style="margin-top:6px;padding:6px;background:#1a3a5c;border-radius:4px;font-size:11px;color:#60a5fa">${categories[idx]}老用户贡献<b style="color:#f59e0b">${highlightPct}%</b>广告收入</div>`
          }
          return html
        }
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: '#64748b', fontSize: 10 },
        axisLine: { lineStyle: { color: '#1e293b' } }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Ad Revenue',
          nameTextStyle: { color: '#3B82F6', fontSize: 10 },
          axisLabel: { color: '#64748b', fontSize: 10, formatter: '${value}' },
          splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
        },
        {
          type: 'value',
          name: 'Active Users',
          nameTextStyle: { color: '#10B981', fontSize: 10 },
          axisLabel: { color: '#64748b', fontSize: 10, formatter: '{value}' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '广告收入',
          type: 'bar',
          data: revenue,
          itemStyle: { color: '#3B82F6', borderRadius: [3, 3, 0, 0] },
          barWidth: '35%'
        },
        {
          name: '活动性用户',
          type: 'bar',
          data: users,
          yAxisIndex: 1,
          barWidth: '35%',
          itemStyle: {
            color: 'transparent',
            borderColor: '#10B981',
            borderWidth: 2,
            borderRadius: [3, 3, 0, 0]
          }
        }
      ]
    }
  }

  function refreshCharts() {
    if (!tabData.value) return
    useRadar.updateChart(buildRadarOption())
    usePlatformBar.updateChart(buildPlatformBarOption())
    useTrend.updateChart(buildTrendOption())
    useUserBreakdown.updateChart(buildUserBreakdownOption())
  }

  async function loadTabData() {
    if (!props.filter?.s_app_id) {
      loading.value = false
      tabData.value = null
      return
    }
    loading.value = true
    try {
      const data = await fetchIaaAdTypeTabData(props.filter)
      tabData.value = data ?? null

      // 用户拆分分析改走新接口（其余模块仍沿用原整页接口）
      const userBreakdown = await fetchIaaOverviewUserBreakdown({
        platform: emptyIfAll(props.filter.platform),
        s_app_id: props.filter.s_app_id,
        s_app_version: '',
        s_country_code: emptyIfAll(props.filter.s_country_code),
        t_date: props.filter.t_date ?? ''
      })
      if (tabData.value) {
        tabData.value = {
          ...tabData.value,
          userBreakdown
        }
      }
    } catch {
      tabData.value = null
    } finally {
      loading.value = false
    }
    await nextTick()
    refreshCharts()
  }

  onMounted(() => {
    loadTabData()
  })

  watch(
    () => props.filter,
    () => {
      loadTabData()
    },
    { deep: true }
  )

  watch(activeRadarTab, () => {
    if (tabData.value) {
      useRadar.updateChart(buildRadarOption())
    }
  })
</script>

<style scoped lang="scss">
  @use '../styles/iaa-card-fx.scss' as *;

  .iaa-tab-ad-type {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 100%;
  }

  /* ——— KPI 行 ——— */
  .iaa-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .iaa-kpi {
    min-width: 0;
    padding: 16px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;

    &:not(.iaa-kpi--sk) {
      @include iaa-panel-hover;
    }

    &[data-accent='teal'] .iaa-kpi__value {
      color: var(--art-primary);
    }

    &__title {
      margin-bottom: 8px;
      font-size: 12px;
      color: var(--art-gray-600);
    }

    &__value {
      font-size: 28px;
      font-weight: 700;
      line-height: 1.2;
      color: var(--art-gray-900);
    }

    &__sub {
      display: flex;
      gap: 4px;
      align-items: center;
      margin-top: 6px;
      font-size: 12px;
      color: var(--art-gray-600);

      &.warn {
        color: var(--art-warning);
      }

      &.up {
        color: var(--art-success);
      }

      &.down {
        color: var(--art-danger);
      }
    }
  }

  /* ECPM 特殊值样式 */
  .ecpm-value {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    align-items: baseline;
    font-size: 20px !important;
  }

  .ecpm-est {
    font-size: 26px;
    font-weight: 700;
    color: var(--art-warning);
  }

  .ecpm-real {
    font-size: 26px;
    font-weight: 700;
    color: var(--art-gray-900);
  }

  .ecpm-label {
    font-size: 12px;
    font-weight: 400;
    color: var(--art-gray-600);
  }

  .ecpm-sep {
    font-size: 18px;
    color: var(--art-gray-600);
  }

  /* ——— 主三列 ——— */
  .iaa-main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    align-items: stretch;
  }

  .iaa-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  /* ——— Panel 通用 ——— */
  .iaa-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);

    :deep(.el-card__header) {
      flex-shrink: 0;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 14px;
      overflow: hidden;
    }
  }

  /* Panel header 内部行 */
  .panel-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* ——— Radar Tabs ——— */
  .radar-tabs {
    display: flex;
    gap: 2px;
    padding: 2px;
    background: var(--default-border);
    border-radius: 6px;
  }

  .radar-tab {
    padding: 3px 10px;
    font-size: 12px;
    color: var(--art-gray-600);
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.15s;

    &.active {
      color: #fff;
      background: var(--art-primary);
    }

    &:not(.active):hover {
      color: var(--art-gray-900);
    }
  }

  /* ——— 图表通用：撑满卡片剩余高度 ——— */
  .iaa-chart {
    flex: 1;
    width: 100%;
    min-height: 0;

    &--radar {
      min-height: 160px;
    }

    &--bar {
      min-height: 200px;
    }

    &--line {
      min-height: 160px;
    }
  }

  /* ——— 广告类型表格 ——— */
  .ad-type-table {
    width: 100%;
    margin-top: 4px;
    font-size: 12px;
    border-collapse: collapse;

    th {
      padding: 5px 6px;
      font-weight: 500;
      color: var(--art-gray-600);
      text-align: left;
      border-bottom: 1px solid var(--default-border);
    }

    td {
      padding: 5px 6px;
      color: var(--art-gray-700);
      border-bottom: 1px solid var(--default-border);
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background: rgb(255 255 255 / 3%);
    }

    .name-cell {
      color: var(--art-primary);
      cursor: pointer;
    }
  }

  /* ——— Top10 列表 ——— */
  .iaa-top10-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 7px;
    justify-content: space-between;
    overflow-y: auto;
  }

  .iaa-top10-item {
    display: grid;
    grid-template-columns: 22px 1fr 8px 64px 80px 42px;
    gap: 6px;
    align-items: center;
    font-size: 12px;
  }

  .iaa-top10-rank {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 4px;

    &.rank-gold {
      color: #fbbf24;
      background: #92400e;
    }

    &.rank-silver {
      color: #94a3b8;
      background: #334155;
    }

    &.rank-bronze {
      color: #fb923c;
      background: #431407;
    }

    &.rank-default {
      font-weight: 400;
      color: var(--art-gray-600);
    }
  }

  .iaa-top10-dot {
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  .iaa-top10-name {
    overflow: hidden;
    color: var(--art-gray-800);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .iaa-top10-value {
    font-weight: 500;
    color: var(--art-primary);
    text-align: right;
  }

  .iaa-top10-bar {
    height: 6px;
    overflow: hidden;
    background: var(--default-border);
    border-radius: 3px;
  }

  .iaa-top10-bar__fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.4s ease;
  }

  .iaa-top10-pct {
    font-size: 11px;
    color: var(--art-gray-600);
    text-align: right;
  }

  /* ——— 下方两列 ——— */
  .iaa-bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  /* ——— 趋势图 legend ——— */
  .trend-legend {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .legend-item {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;
    font-weight: 400;
    color: var(--art-gray-600);

    i {
      display: inline-block;
      flex-shrink: 0;
      width: 24px;
      height: 3px;
      border-radius: 2px;
    }

    &.hollow i {
      height: 0;
      background: transparent !important;
      border-top: 2px solid;
    }
  }

  /* ——— 洞察条 ——— */
  .iaa-insight-banner {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 12px;
    margin-top: 10px;
    font-size: 12px;
    color: #67e8f9;
    background: rgb(6 182 212 / 10%);
    border: 1px solid rgb(6 182 212 / 25%);
    border-radius: 6px;

    .el-icon {
      flex-shrink: 0;
      color: #22d3ee;
    }
  }
</style>
