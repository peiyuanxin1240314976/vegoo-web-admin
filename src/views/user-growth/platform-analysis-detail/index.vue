<template>
  <div class="pad-page art-full-height">
    <!-- ── 顶栏 KPI ─────────────────────────────────────────── -->
    <section class="pad-kpi-grid">
      <article v-for="card in pageData?.kpis ?? []" :key="card.id" class="pad-kpi">
        <div class="pad-kpi__title">{{ card.title }}</div>
        <div class="pad-kpi__value">{{ card.primaryValue }}</div>
        <div class="pad-kpi__sub">{{ card.subTitle }}</div>
        <div class="pad-kpi__trend" :class="card.trendUp ? 'trend-up' : 'trend-down'">
          <el-icon><Top v-if="card.trendUp" /><Bottom v-else /></el-icon>
          {{ card.trendText }}
        </div>
      </article>
    </section>

    <main class="pad-main">
      <!-- ── 面包屑导航 ──────────────────────────────────────── -->
      <div class="pad-nav-bar">
        <div class="pad-crumbs">
          <span class="pad-crumb-back" @click="router.push('/user-growth/comprehensive-analysis')">
            ← 返回综合分析
          </span>
          <span class="pad-crumb-sep">|</span>
          <span class="pad-crumb" @click="router.push('/user-growth/account-performance')"
            >应用层面</span
          >
          <span class="pad-crumb-sep">›</span>
          <span class="pad-crumb" @click="router.push('/user-growth/ad-platform-analysis')"
            >广告平台层面</span
          >
          <span class="pad-crumb-sep">›</span>
          <span class="pad-crumb pad-crumb--active">国家层面</span>
        </div>
        <div class="pad-current-view">
          当前查看: <strong>{{ sourceName }}</strong> × 全部平台 × 全部国家
        </div>
      </div>

      <!-- ── 左右主体 ──────────────────────────────────────────── -->
      <div class="pad-body">
        <!-- ── 左列 ──────────────────────────────────────────── -->
        <div class="pad-left">
          <!-- 第一行：安卓 / iOS / 合计 三张卡片横排 -->
          <div class="pad-stat-row">
            <div v-for="card in pageData?.statCards ?? []" :key="card.label" class="pad-stat-card">
              <div class="pad-stat-card__header">
                <span class="pad-stat-card__label">{{ card.label }}</span>
                <span v-if="card.platform === 'android'" class="pad-os-badge pad-os-badge--android"
                  >安卓</span
                >
                <span v-else-if="card.platform === 'ios'" class="pad-os-badge pad-os-badge--ios"
                  >iOS</span
                >
              </div>
              <div class="pad-stat-rows">
                <div class="pad-stat-row-item">
                  <span class="pad-stat-label">广告支出</span>
                  <span class="pad-stat-value">{{ card.adSpend }}</span>
                </div>
                <div class="pad-stat-row-item">
                  <span class="pad-stat-label">首日ROI</span>
                  <span class="pad-stat-value pad-stat-value--accent">{{ card.roi }}</span>
                </div>
                <div class="pad-stat-row-item">
                  <span class="pad-stat-label">安装数</span>
                  <span class="pad-stat-value">{{ card.installs }}</span>
                </div>
                <div class="pad-stat-row-item">
                  <span class="pad-stat-label">预估利润</span>
                  <span class="pad-stat-value">{{ card.profit }}</span>
                </div>
                <div class="pad-stat-row-item">
                  <span class="pad-stat-label">活跃平台</span>
                  <span class="pad-stat-value">{{ card.activePlatforms }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 第二行：广告平台 CPI 趋势 -->
          <ElCard class="pad-panel" shadow="never">
            <template #header>广告平台 CPI 趋势</template>
            <div ref="cpiTrendRef" class="pad-chart pad-chart--trend"></div>
          </ElCard>

          <!-- 第三行：ECPM 趋势 -->
          <ElCard class="pad-panel" shadow="never">
            <template #header>ECPM 趋势</template>
            <div ref="ecpmRef" class="pad-chart pad-chart--ecpm"></div>
            <div v-if="pageData?.ecpmMetrics" class="ecpm-metrics">
              <div class="ecpm-metric ecpm-metric--teal">
                <div class="ecpm-metric__label">预估ECPM</div>
                <div class="ecpm-metric__value">{{ pageData.ecpmMetrics.estimatedEcpm }}</div>
              </div>
              <div class="ecpm-metric ecpm-metric--orange">
                <div class="ecpm-metric__label">真实ECPM</div>
                <div class="ecpm-metric__value">{{ pageData.ecpmMetrics.actualEcpm }}</div>
              </div>
              <div class="ecpm-metric ecpm-metric--red">
                <div class="ecpm-metric__label">偏差率</div>
                <div class="ecpm-metric__value">{{ pageData.ecpmMetrics.biasRate }}</div>
              </div>
              <div class="ecpm-metric ecpm-metric--red">
                <div class="ecpm-metric__label">偏差金额</div>
                <div class="ecpm-metric__value">{{ pageData.ecpmMetrics.biasAmount }}</div>
              </div>
            </div>
          </ElCard>
        </div>

        <!-- ── 右列：广告平台 × 国家 明细表 ──────────────────── -->
        <ElCard class="pad-panel pad-panel--matrix" shadow="never">
          <template #header>
            <div class="panel-header-row">
              <span>广告平台 × 国家 明细表</span>
              <div class="matrix-actions">
                <ElButton size="small" plain @click="expandAll">全部展开</ElButton>
                <ElButton size="small" plain @click="collapseAll">全部收起</ElButton>
                <ElButton size="small" plain>自定义列</ElButton>
                <ElButton size="small" type="primary" plain>↓ 导出</ElButton>
              </div>
            </div>
          </template>

          <ElTable
            ref="matrixTableRef"
            :data="pageData?.matrixTable.rows ?? []"
            row-key="id"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            :row-class-name="getRowClassName"
            :row-style="getRowStyle"
            size="small"
            stripe
            style="width: 100%"
            height="100%"
            default-expand-all
          >
            <ElTableColumn prop="platform" label="广告平台" min-width="130" fixed>
              <template #default="{ row }">
                <div v-if="!row.isCountry" class="platform-cell">
                  <span class="platform-name">{{ row.platform }}</span>
                  <span class="country-count">共{{ row.countryCount }}个国家</span>
                </div>
                <div v-else class="country-cell">
                  <span
                    v-if="countryFlagFiClass(row.s_country_code)"
                    class="country-flag fi"
                    :class="'fi-' + countryFlagFiClass(row.s_country_code)"
                    aria-hidden="true"
                  />
                  <span class="country-name">{{ row.country }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="adSpend" label="广告支出" min-width="80" align="right" />
            <ElTableColumn prop="cpi" label="CPI" min-width="68" align="center">
              <template #default="{ row }">
                <span class="cpi-badge" :class="`cpi-badge--${row.cpiLevel}`">{{ row.cpi }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="cpm" label="CPM" min-width="68" align="right" />
            <ElTableColumn prop="cpc" label="CPC" min-width="64" align="right" />
            <ElTableColumn prop="roiD1" label="首日ROI" min-width="72" align="center">
              <template #default="{ row }">
                <span class="roi-badge" :class="`roi-badge--${row.roiD1Level}`">{{
                  row.roiD1
                }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="roiD3" label="3日ROI" min-width="68" align="right" />
            <ElTableColumn prop="roiD7" label="7日ROI" min-width="68" align="right" />
            <ElTableColumn prop="profit" label="预估利润" min-width="80" align="right">
              <template #default="{ row }">
                <span :class="{ 'profit-neg': row.profitNeg }">{{ row.profit }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="走势" min-width="68" align="center">
              <template #default="{ row }">
                <svg class="sparkline" viewBox="0 0 60 24">
                  <polyline
                    :points="sparklinePoints(row.sparkline)"
                    :stroke="row.profitNeg ? '#ef4444' : '#22c55e'"
                    stroke-width="1.5"
                    fill="none"
                  />
                </svg>
              </template>
            </ElTableColumn>
          </ElTable>

          <!-- 合计行 -->
          <div v-if="pageData?.matrixTable.total" class="matrix-total-row">
            <span class="total-label">合计</span>
            <span>{{ pageData.matrixTable.total.adSpend }}</span>
            <span>{{ pageData.matrixTable.total.cpi }}</span>
            <span>{{ pageData.matrixTable.total.cpm }}</span>
            <span>{{ pageData.matrixTable.total.cpc }}</span>
            <span>{{ pageData.matrixTable.total.roiD1 }}</span>
            <span>{{ pageData.matrixTable.total.roiD3 }}</span>
            <span>{{ pageData.matrixTable.total.roiD7 }}</span>
            <span>{{ pageData.matrixTable.total.profit }}</span>
            <span class="matrix-total-spark" aria-hidden="true">—</span>
          </div>
        </ElCard>
      </div>

      <!-- ── 底部智能预警栏 ─────────────────────────────────── -->
      <div class="pad-alert-bar">
        <template v-for="(alert, i) in pageData?.alertBar ?? []" :key="alert.id">
          <span v-if="i > 0" class="alert-sep"></span>
          <span class="alert-item" :class="`alert-item--${alert.level}`">
            <span class="alert-dot" :class="`alert-dot--${alert.level}`"></span>
            {{ alert.text }}
          </span>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import 'flag-icons/css/flag-icons.min.css'
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { Top, Bottom } from '@element-plus/icons-vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { PlatformAnalysisDetailData } from './types'
  import { loadPlatformAnalysisDetailPage } from '@/api/user-growth'

  defineOptions({ name: 'PlatformAnalysisDetail' })

  const router = useRouter()
  const route = useRoute()

  const pageData = ref<PlatformAnalysisDetailData | null>(null)
  const matrixTableRef = ref()

  /** 优先展示接口回传的 sourceName，避免与钻取名不一致 */
  const sourceName = computed(() => {
    const q = (route.query.name as string)?.trim()
    return pageData.value?.sourceName?.trim() || q || '应用'
  })

  const COUNTRY_CODE_ALIASES: Record<string, string> = { UK: 'gb' }

  /** flag-icons 类名后缀（小写 ISO alpha-2）；非法则返回空字符串不渲染国旗 */
  function countryFlagFiClass(code: string | undefined): string {
    if (!code || typeof code !== 'string') return ''
    const t = code.trim()
    if (!/^[A-Za-z]{2}$/.test(t)) return ''
    const u = t.toUpperCase()
    return (COUNTRY_CODE_ALIASES[u] ?? t).toLowerCase()
  }

  // 图表
  const cpiTrendChart = useChart()
  const ecpmChart = useChart()
  const cpiTrendRef = cpiTrendChart.chartRef
  const ecpmRef = ecpmChart.chartRef

  // ─── 树形表行样式（借鉴 ad-performance-table 的 row-accent 模式）──

  const PLATFORM_ACCENT: Record<string, string> = {
    'Google Ads': '#3B82F6',
    TikTok: '#10B981',
    Facebook: '#2563EB',
    Unity: '#8B5CF6',
    Kwai: '#F97316',
    Bigo: '#EC4899'
  }

  function getRowAccent(row: { platform: string }) {
    return PLATFORM_ACCENT[row.platform] ?? 'var(--art-primary)'
  }

  function getRowClassName({ row }: { row: any }) {
    return row.isCountry ? 'is-level-country' : 'is-level-platform'
  }

  function getRowStyle({ row }: { row: any }) {
    return { '--row-accent': getRowAccent(row) } as Record<string, string>
  }

  // 树形表操作
  function expandAll() {
    const rows = pageData.value?.matrixTable.rows ?? []
    rows.forEach((row) => matrixTableRef.value?.toggleRowExpansion(row, true))
  }
  function collapseAll() {
    const rows = pageData.value?.matrixTable.rows ?? []
    rows.forEach((row) => matrixTableRef.value?.toggleRowExpansion(row, false))
  }

  // sparkline svg 点
  function sparklinePoints(data: number[]): string {
    if (!data || data.length === 0) return ''
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    if (data.length === 1) return `30,${12}`
    const step = 60 / (data.length - 1)
    return data.map((v, i) => `${i * step},${24 - ((v - min) / range) * 20}`).join(' ')
  }

  // ─── CPI 趋势图 ────────────────────────────────────────────────

  function buildCpiOption(): EChartsOption {
    const d = pageData.value?.cpiTrend
    if (!d) return {}
    const { getAxisLineStyle, getSplitLineStyle, getAxisLabelStyle, getTooltipStyle } =
      cpiTrendChart
    return {
      tooltip: { ...getTooltipStyle('axis') },
      legend: {
        data: d.series.filter((s) => !s.dashed).map((s) => s.name),
        top: 0,
        left: 0,
        textStyle: { color: 'var(--art-gray-600)', fontSize: 11 },
        itemWidth: 12,
        itemHeight: 8
      },
      grid: { top: 28, right: 10, bottom: 30, left: 0, containLabel: true },
      xAxis: {
        type: 'category',
        data: d.dates,
        axisLine: getAxisLineStyle(),
        axisTick: { show: false },
        axisLabel: getAxisLabelStyle()
      },
      yAxis: {
        type: 'value',
        axisLabel: { ...getAxisLabelStyle(), formatter: '${value}' },
        splitLine: getSplitLineStyle()
      },
      series: d.series.map((s) => ({
        name: s.name,
        type: 'line',
        smooth: !s.dashed,
        data: s.data,
        lineStyle: {
          color: s.color,
          width: s.dashed ? 1 : 2,
          type: s.dashed ? ('dashed' as const) : ('solid' as const)
        },
        itemStyle: { color: s.color },
        symbol: s.dashed ? 'none' : 'circle',
        symbolSize: 3,
        areaStyle: s.dashed ? undefined : { color: s.color, opacity: 0.06 }
      }))
    }
  }

  // ─── ECPM 趋势图 ────────────────────────────────────────────────

  function buildEcpmOption(): EChartsOption {
    const d = pageData.value?.ecpmTrend
    if (!d) return {}
    const { getAxisLineStyle, getSplitLineStyle, getAxisLabelStyle, getTooltipStyle } = ecpmChart
    return {
      tooltip: { ...getTooltipStyle('axis') },
      legend: {
        data: ['预估ECPM', '真实ECPM'],
        top: 0,
        right: 0,
        textStyle: { color: 'var(--art-gray-600)', fontSize: 11 },
        itemWidth: 20,
        itemHeight: 8
      },
      grid: { top: 28, right: 10, bottom: 30, left: 0, containLabel: true },
      xAxis: {
        type: 'category',
        data: d.dates,
        axisLine: getAxisLineStyle(),
        axisTick: { show: false },
        axisLabel: getAxisLabelStyle()
      },
      yAxis: {
        type: 'value',
        min: (v: any) => Math.floor(v.min - 2),
        axisLabel: getAxisLabelStyle(),
        splitLine: getSplitLineStyle()
      },
      series: [
        {
          name: '预估ECPM',
          type: 'line',
          smooth: true,
          data: d.series[0]?.data ?? [],
          lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
          itemStyle: { color: '#f59e0b' },
          symbol: 'none',
          areaStyle: { color: '#f59e0b', opacity: 0.15 }
        },
        {
          name: '真实ECPM',
          type: 'line',
          smooth: true,
          data: d.series[1]?.data ?? [],
          lineStyle: { color: '#14b8a6', width: 2 },
          itemStyle: { color: '#14b8a6' },
          symbol: 'none',
          areaStyle: { color: '#14b8a6', opacity: 0.2 }
        }
      ]
    }
  }

  function renderCharts() {
    cpiTrendChart.initChart(buildCpiOption())
    ecpmChart.initChart(buildEcpmOption())
  }

  watch(pageData, renderCharts, { deep: true })

  onMounted(async () => {
    try {
      pageData.value = await loadPlatformAnalysisDetailPage({
        name: ((route.query.name as string) || '应用').trim(),
        from: (route.query.from as string) ?? ''
      })
    } catch {
      // 错误提示由 http 拦截器处理；避免未捕获 Promise 导致整页白屏
    }
    renderCharts()
  })
</script>

<style scoped lang="scss">
  .pad-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 14px 20px;
    overflow: hidden;
    background: var(--default-bg-color);
  }

  // ── KPI 行 ────────────────────────────────────────────────────
  .pad-kpi-grid {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    min-height: 88px;
    margin-bottom: 12px;
  }

  .pad-kpi {
    padding: 16px 18px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 10px;

    &__title {
      margin-bottom: 2px;
      font-size: 12px;
      color: var(--art-gray-500);
    }

    &__value {
      font-size: 30px;
      font-weight: 700;
      line-height: 1.2;
      color: var(--art-gray-900);
    }

    &__sub {
      margin-bottom: 6px;
      font-size: 11px;
      color: var(--art-gray-500);
    }

    &__trend {
      display: inline-flex;
      gap: 2px;
      align-items: center;
      font-size: 12px;

      &.trend-up {
        color: #22c55e;
      }

      &.trend-down {
        color: #ef4444;
      }
    }
  }

  .pad-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    overflow: hidden;
  }

  // ── 面包屑 ───────────────────────────────────────────────────
  .pad-nav-bar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;
  }

  .pad-crumbs {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
  }

  .pad-crumb-back {
    font-weight: 500;
    color: var(--art-primary);
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .pad-crumb-sep {
    color: var(--art-gray-400);
  }

  .pad-crumb {
    color: var(--art-gray-500);
    cursor: pointer;

    &:hover {
      color: var(--art-primary);
    }

    &--active {
      font-weight: 700;
      color: var(--art-primary);
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }

  .pad-current-view {
    font-size: 12px;
    color: var(--art-gray-500);

    strong {
      color: var(--art-gray-800);
    }
  }

  // ── 左右主体 ─────────────────────────────────────────────────
  .pad-body {
    display: grid;
    flex: 1;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    align-items: stretch;
    min-height: 0;
  }

  // ── 左列 ─────────────────────────────────────────────────────
  .pad-left {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    overflow: hidden;

    // CPI 趋势卡片占更多高度，ECPM 占较少
    > .pad-panel:first-of-type {
      display: flex;
      flex: 3;
      flex-direction: column;
      min-height: 0;

      :deep(.el-card__body) {
        display: flex;
        flex: 1;
        flex-direction: column;
        min-height: 0;
      }
    }

    > .pad-panel:last-of-type {
      display: flex;
      flex: 2;
      flex-direction: column;
      min-height: 0;

      :deep(.el-card__body) {
        display: flex;
        flex: 1;
        flex-direction: column;
        min-height: 0;
      }
    }
  }

  // ── 第一行：三张统计卡片横排 ──────────────────────────────────
  .pad-stat-row {
    display: grid;
    flex: 1;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    align-items: stretch;
    min-height: 0;
  }

  .pad-stat-card {
    display: flex;
    flex-direction: column;
    padding: 12px 14px;
    overflow-y: auto;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 10px;

    &__header {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      margin-bottom: 8px;
    }

    &__label {
      font-size: 12px;
      font-weight: 600;
      color: var(--art-gray-800);
      white-space: nowrap;
    }
  }

  .pad-os-badge {
    padding: 1px 5px;
    font-size: 10px;
    border-radius: 4px;

    &--android {
      color: #22c55e;
      background: rgb(34 197 94 / 15%);
      border: 1px solid rgb(34 197 94 / 30%);
    }

    &--ios {
      color: #3b82f6;
      background: rgb(59 130 246 / 15%);
      border: 1px solid rgb(59 130 246 / 30%);
    }
  }

  .pad-stat-rows {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0;
    justify-content: space-around;
  }

  .pad-stat-row-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
  }

  .pad-stat-label {
    color: var(--art-gray-500);
  }

  .pad-stat-value {
    font-weight: 500;
    color: var(--art-gray-800);

    &--accent {
      font-weight: 700;
      color: #22c55e;
    }
  }

  // ── 图表面板 ─────────────────────────────────────────────────
  .pad-panel {
    :deep(.el-card__header) {
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
      color: var(--art-gray-800);
    }

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .pad-chart {
    flex: 1;
    width: 100%;
    min-height: 80px;
  }

  .ecpm-metrics {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    padding: 8px 12px;
  }

  .ecpm-metric {
    padding: 6px 8px;
    text-align: center;
    border-radius: 6px;

    &__label {
      margin-bottom: 2px;
      font-size: 10px;
      color: #fff;
      opacity: 0.8;
    }

    &__value {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
    }

    &--teal {
      background: #0d9488;
    }

    &--orange {
      background: #ea580c;
    }

    &--red {
      background: #dc2626;
    }
  }

  // ── 右列：明细表 ─────────────────────────────────────────────
  .pad-panel--matrix {
    display: flex;
    flex-direction: column;
    min-height: 0;

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    :deep(.el-table) {
      flex: 1;
      min-height: 0;
    }
  }

  .panel-header-row {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }

  .matrix-actions {
    display: flex;
    gap: 4px;
  }

  .platform-cell {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .platform-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--art-gray-800);
  }

  .country-count {
    font-size: 10px;
    color: var(--art-gray-500);
  }

  .country-cell {
    display: flex;
    gap: 4px;
    align-items: center;
    padding-left: 4px;
  }

  .country-flag {
    flex-shrink: 0;
    width: 1.15em;
    line-height: 1;
    background-size: cover;
  }

  .country-name {
    font-size: 12px;
    color: var(--art-gray-700);
  }

  .cpi-badge {
    display: inline-block;
    padding: 1px 6px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 4px;

    &--good {
      color: #fff;
      background: #22c55e;
    }

    &--near {
      color: #fff;
      background: #f97316;
    }

    &--over {
      color: #fff;
      background: #ef4444;
    }
  }

  .roi-badge {
    display: inline-block;
    padding: 1px 6px;
    font-size: 11px;
    border-radius: 4px;

    &--good {
      color: var(--art-gray-800);
      background: transparent;
    }

    &--warn {
      color: #fff;
      background: #22c55e;
    }

    &--danger {
      color: #fff;
      background: #ef4444;
    }
  }

  .profit-neg {
    color: #ef4444;
  }

  .sparkline {
    display: block;
    width: 60px;
    height: 24px;
    margin: 0 auto;
  }

  // ── 树形表 row-accent 样式（借鉴 ad-performance-table）────────
  :deep(.el-table__row.is-level-platform) {
    background: color-mix(in srgb, var(--default-box-color) 84%, var(--row-accent) 16%);

    td:first-child .cell {
      font-weight: 600;
    }
  }

  :deep(.el-table__row.is-level-country) {
    background: color-mix(in srgb, var(--default-box-color) 94%, var(--row-accent) 6%);

    td:first-child .cell {
      position: relative;
      padding-left: 18px;

      &::before {
        position: absolute;
        top: 6px;
        bottom: 6px;
        left: 6px;
        width: 3px;
        content: '';
        background: var(--row-accent);
        border-radius: 9999px;
      }
    }
  }

  :deep(.el-table__header th) {
    font-size: 12px;
    font-weight: 600;
    color: var(--art-gray-600);
    background: var(--default-bg-color);
  }

  // 合计行
  .matrix-total-row {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: 130px 80px 68px 68px 64px 72px 68px 68px 80px 68px;
    gap: 0;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    color: var(--art-gray-700);
    background: color-mix(in srgb, var(--default-box-color) 60%, var(--default-bg-color));
    border-top: 2px solid var(--default-border);

    > span {
      padding: 0 4px;
      text-align: right;

      &:first-child {
        color: var(--art-gray-800);
        text-align: left;
      }
    }

    .matrix-total-spark {
      text-align: center;
    }
  }

  // ── 预警栏 ───────────────────────────────────────────────────
  .pad-alert-bar {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding: 10px 16px;
    background: color-mix(in srgb, #1c1917 40%, var(--default-box-color));
    border: 1px solid color-mix(in srgb, #f59e0b 20%, transparent);
    border-radius: 8px;
  }

  .alert-sep {
    flex-shrink: 0;
    width: 1px;
    height: 14px;
    background: var(--art-gray-400);
  }

  .alert-item {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;

    &--danger {
      color: #fca5a5;
    }

    &--warning {
      color: #fdba74;
    }

    &--good {
      color: #86efac;
    }

    &--info {
      color: #93c5fd;
    }
  }

  .alert-dot {
    display: inline-block;
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &--danger {
      background: #ef4444;
    }

    &--warning {
      background: #f97316;
    }

    &--good {
      background: #22c55e;
    }

    &--info {
      background: #3b82f6;
    }
  }
</style>
