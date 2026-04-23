<script setup lang="ts">
  import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
  import { echarts } from '@/plugins/echarts'

  defineOptions({ name: 'SummaryTab' })

  const props = defineProps<{
    data: Api.UserGrowth.MyAdsSummaryResponseDto | null
    loading: boolean
  }>()

  const showSkeleton = computed(() => props.loading || !props.data)

  const trendIsEmpty = computed(() => {
    const t = props.data?.trend
    return !t?.days?.length && !t?.spend?.length
  })

  const sourcePieIsEmpty = computed(() => !(props.data?.sourcePie?.length ?? 0))

  const channelData = computed(() => {
    const pie = props.data?.sourcePie ?? []
    return pie.map((d) => ({
      value: d.value,
      name: d.name,
      itemStyle: { color: d.color }
    }))
  })

  const progressList = computed(() => props.data?.progressList ?? [])

  const pieCenterValue = computed(() => {
    const sum = (props.data?.sourcePie ?? []).reduce((s, d) => s + d.value, 0)
    return `$${sum.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  })

  const statCards = computed(() => props.data?.statCards ?? {})

  const spendCard = computed(() => statCards.value.spend)
  const agencyRatioCard = computed(() => statCards.value.agencyRatio)
  const roiCard = computed(() => statCards.value.roi)
  const estProfitCard = computed(() => statCards.value.estProfit)

  function progressDisplayRoi(row: Api.UserGrowth.MyAdsSummaryProgressItemDto): string {
    const pre = row.roi
    if (pre != null && String(pre).trim() !== '') return String(pre)
    const r1 = row.roi1
    if (r1 != null && Number.isFinite(r1)) {
      return `${r1.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}%`
    }
    return '--'
  }

  // function progressDisplayStatus(row: Api.UserGrowth.MyAdsSummaryProgressItemDto): string {
  //   if (row.status) return row.status
  //   const map: Record<string, string> = {
  //     ok: '正常',
  //     warn: '超预算',
  //     inactive: '未启动'
  //   }
  //   return map[row.statusType] ?? row.statusType
  // }

  const lineChartEl = ref<HTMLElement | null>(null)
  const pieChartEl = ref<HTMLElement | null>(null)
  let lineChart: ReturnType<typeof echarts.init> | null = null
  let pieChart: ReturnType<typeof echarts.init> | null = null

  function updateLineChart() {
    if (!lineChartEl.value || !props.data?.trend) return
    const dom = lineChartEl.value
    if (lineChart) {
      const prevDom = lineChart.getDom?.()
      if (prevDom && prevDom !== dom) {
        lineChart.dispose()
        lineChart = null
      }
    }
    if (!lineChart) {
      lineChart = echarts.init(dom, 'dark')
    }
    if (!lineChart) return
    const t = props.data.trend
    lineChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e2f45',
        borderColor: '#2a3f5a',
        textStyle: { color: '#e2e8f0', fontSize: 12 }
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#94a3b8', fontSize: 11 },
        data: ['广告支出', '预估利润', '首日ROI'],
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8
      },
      grid: { left: 50, right: 60, top: 20, bottom: 50 },
      xAxis: {
        type: 'category',
        data: t.days ?? [],
        axisLine: { lineStyle: { color: '#1e2f45' } },
        axisTick: { show: false },
        axisLabel: { color: '#64748b', fontSize: 11 }
      },
      yAxis: [
        {
          type: 'value',
          min: (v: { min: number }) => Math.min(0, v.min),
          axisLabel: {
            color: '#64748b',
            fontSize: 11,
            formatter: (v: number) => {
              if (v === 0) return '$0'
              const sign = v < 0 ? '-' : ''
              const abs = Math.abs(v)
              return abs >= 1000 ? `${sign}$${abs / 1000}k` : `${sign}$${abs}`
            }
          },
          splitLine: { lineStyle: { color: '#1a2a3a', type: 'dashed' } },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        {
          type: 'value',
          min: (v: { min: number }) => Math.min(0, v.min),
          axisLabel: { color: '#64748b', fontSize: 11, formatter: '{value}%' },
          splitLine: { show: false },
          axisLine: { show: false },
          axisTick: { show: false }
        }
      ],
      series: [
        {
          name: '广告支出',
          type: 'line',
          data: t.spend ?? [],
          yAxisIndex: 0,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#00d4aa', width: 2 },
          itemStyle: { color: '#00d4aa' },
          label: { show: true, color: '#cbd5e1', fontSize: 11, position: 'top' }
        },
        {
          name: '预估利润',
          type: 'line',
          data: t.profit ?? [],
          yAxisIndex: 0,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#10b981', width: 2 },
          itemStyle: { color: '#10b981' },
          label: { show: true, color: '#cbd5e1', fontSize: 11, position: 'bottom' }
        },
        {
          name: '首日ROI',
          type: 'line',
          data: t.roiPct ?? [],
          yAxisIndex: 1,
          symbol: 'diamond',
          symbolSize: 7,
          lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
          itemStyle: { color: '#f59e0b' },
          label: {
            show: true,
            color: '#f59e0b',
            fontSize: 11,
            position: 'top',
            formatter: '{c}%'
          }
        }
      ]
    })
  }

  /**
   * 環形洞心垂直位置（相對容器高度 0～1）。調上下居中主要改這個。
   */
  const PIE_CENTER_Y_RATIO = 0.45
  /**
   * 洞心像素 cy 到兩行文字的 top（像素）：rich 多行錨點易偏下，改為兩個 text + 像素定位。
   * 若整體仍偏下：略減小 gap（例如 -15 / 5）；偏上則略增大。
   */
  const PIE_CENTER_LABEL_TOP_OFFSET = -13
  const PIE_CENTER_VALUE_TOP_OFFSET = 7
  /** 略向右修正（洞內文字略偏左時調） */
  const PIE_CENTER_TEXT_X_NUDGE = 2

  function updatePieChart() {
    if (!pieChartEl.value || !props.data) return
    const dom = pieChartEl.value
    if (pieChart) {
      const prevDom = pieChart.getDom?.()
      if (prevDom && prevDom !== dom) {
        pieChart.dispose()
        pieChart = null
      }
    }
    if (!pieChart) {
      pieChart = echarts.init(dom, 'dark')
    }
    if (!pieChart) return
    const cd = channelData.value
    const centerAmount = pieCenterValue.value.replace(/[{}]/g, '')
    const el = pieChartEl.value
    const h = Math.max(el.clientHeight || el.offsetHeight || 220, 1)
    const cy = h * PIE_CENTER_Y_RATIO
    const centerYPercent = `${(cy / h) * 100}%`
    const labelTopPx = cy + PIE_CENTER_LABEL_TOP_OFFSET
    const valueTopPx = cy + PIE_CENTER_VALUE_TOP_OFFSET

    pieChart.setOption(
      {
        backgroundColor: 'transparent',
        title: { show: false },
        tooltip: {
          trigger: 'item',
          backgroundColor: '#1e2f45',
          borderColor: '#2a3f5a',
          textStyle: { color: '#e2e8f0' },
          formatter: '{b}: ${c} ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          bottom: 0,
          textStyle: { color: '#94a3b8', fontSize: 11 },
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8,
          formatter: (name: string) => {
            const item = cd.find((d) => d.name === name)
            return `${name} $${item ? item.value.toLocaleString() : ''}`
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['45%', '68%'],
            center: ['50%', centerYPercent],
            data: cd,
            label: {
              show: true,
              formatter: '{d}%',
              color: '#e2e8f0',
              fontSize: 11
            },
            labelLine: { lineStyle: { color: '#2a3f5a' } },
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' }
            }
          }
        ],
        graphic: [
          {
            type: 'text',
            left: 'center',
            top: labelTopPx,
            x: PIE_CENTER_TEXT_X_NUDGE,
            z: 10,
            style: {
              text: '总支出',
              fill: '#94a3b8',
              fontSize: 11,
              textAlign: 'center',
              textVerticalAlign: 'top'
            }
          },
          {
            type: 'text',
            left: 'center',
            top: valueTopPx,
            x: PIE_CENTER_TEXT_X_NUDGE,
            z: 10,
            style: {
              text: centerAmount,
              fill: '#e2e8f0',
              fontSize: 15,
              fontWeight: 'bold',
              textAlign: 'center',
              textVerticalAlign: 'top'
            }
          }
        ]
      },
      /** 整份覆寫，避免 merge 導致改百分比也不生效 */
      { notMerge: true }
    )
    pieChart.resize()
  }

  watch(
    () => [props.data, showSkeleton.value, trendIsEmpty.value, sourcePieIsEmpty.value],
    async () => {
      // 骨架屏阶段图表节点被 v-if 卸载，必须 dispose，否则实例仍挂在已移除的 DOM 上，恢复后无法重绘
      if (showSkeleton.value) {
        if (lineChart) {
          lineChart.dispose()
          lineChart = null
        }
        if (pieChart) {
          pieChart.dispose()
          pieChart = null
        }
        return
      }

      if (trendIsEmpty.value && lineChart) {
        lineChart.dispose()
        lineChart = null
      } else if (props.data && !trendIsEmpty.value) {
        await nextTick()
        updateLineChart()
      }
      if (sourcePieIsEmpty.value && pieChart) {
        pieChart.dispose()
        pieChart = null
      } else if (props.data && !sourcePieIsEmpty.value) {
        await nextTick()
        updatePieChart()
      }
    },
    { immediate: true }
  )

  function handleResize() {
    lineChart?.resize()
    pieChart?.resize()
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    lineChart?.dispose()
    pieChart?.dispose()
    lineChart = null
    pieChart = null
  })

  function progressColor(p: number, type: string | null | undefined) {
    if (type === 'warn') return '#f59e0b'
    if (type === 'inactive') return '#374151'
    if (p >= 90) return '#f59e0b'
    return '#10b981'
  }
</script>

<template>
  <div class="summary-tab">
    <template v-if="showSkeleton">
      <!-- 統計卡骨架 -->
      <div class="stat-cards">
        <div v-for="n in 4" :key="`sc-${n}`" class="stat-card stat-card--skeleton">
          <ElSkeleton animated :rows="3" />
        </div>
      </div>
      <!-- 圖表行骨架 -->
      <div class="charts-row">
        <div class="chart-card chart-line summary-skeleton-chart">
          <ElSkeleton animated :rows="8" />
        </div>
        <div class="chart-card chart-pie summary-skeleton-chart">
          <ElSkeleton animated :rows="8" />
        </div>
      </div>
      <!-- 進度表骨架 -->
      <div class="chart-card bottom-progress summary-skeleton-table">
        <ElSkeleton animated :rows="10" />
      </div>
    </template>

    <template v-else-if="data">
      <!-- ── 四个统计卡 ── -->
      <div class="stat-cards">
        <div
          class="stat-card"
          :style="spendCard ? { borderColor: spendCard.borderColor } : undefined"
        >
          <div class="stat-title">本期广告支出</div>
          <template v-if="spendCard">
            <div class="stat-main" :style="{ color: spendCard.mainColor }">
              {{ spendCard.main }}
            </div>
            <div class="stat-row">
              <span class="label-dim">预算</span>
              <span style="color: #f1f5f9">{{ spendCard.budget }}</span>
              <span class="sep">|</span>
              <span class="label-dim">差异</span>
              <span :style="{ color: spendCard.diffColor }">{{ spendCard.diff }}</span>
            </div>
            <div class="stat-row mt4">
              <span class="label-dim">{{ spendCard.prevLine }}</span>
              <span class="sep">|</span>
              <span :style="{ color: spendCard.momColor }">{{ spendCard.momLine }}</span>
            </div>
          </template>
          <ElEmpty v-else description="暂无数据" :image-size="60" class="stat-card-empty" />
        </div>
        <div
          class="stat-card"
          :style="agencyRatioCard ? { borderColor: agencyRatioCard.borderColor } : undefined"
        >
          <div class="stat-title">代投消耗占比</div>
          <template v-if="agencyRatioCard">
            <div class="stat-main" :style="{ color: agencyRatioCard.mainColor }">
              {{ agencyRatioCard.main }}
            </div>
            <div class="stat-row">
              <span class="label-dim">代投</span>
              <span style="color: #f1f5f9">{{ agencyRatioCard.agency }}</span>
              <span class="sep">/</span>
              <span class="label-dim">直投</span>
              <span style="color: #f1f5f9">{{ agencyRatioCard.direct }}</span>
            </div>
            <div class="stat-row mt4">
              <span class="label-dim">{{ agencyRatioCard.prevLine }}</span>
              <span class="sep">|</span>
              <span :style="{ color: agencyRatioCard.momColor }">{{
                agencyRatioCard.momLine
              }}</span>
            </div>
          </template>
          <ElEmpty v-else description="暂无数据" :image-size="60" class="stat-card-empty" />
        </div>
        <div class="stat-card" :style="roiCard ? { borderColor: roiCard.borderColor } : undefined">
          <div class="stat-title">平均首日ROI</div>
          <template v-if="roiCard">
            <div class="stat-main" :style="{ color: roiCard.mainColor }">
              {{ roiCard.main }}
            </div>
            <div class="stat-row">
              <span class="label-dim">目标</span>
              <span style="color: #f1f5f9">{{ roiCard.target }}</span>
              <span class="sep">|</span>
              <span class="label-dim">超目标</span>
              <span style="color: #10b981">{{ roiCard.overTarget }}</span>
            </div>
            <div class="stat-row mt4">
              <span class="label-dim">{{ roiCard.prevLine }}</span>
              <span class="sep">|</span>
              <span :style="{ color: roiCard.momColor }">{{ roiCard.momLine }}</span>
            </div>
          </template>
          <ElEmpty v-else description="暂无数据" :image-size="60" class="stat-card-empty" />
        </div>
        <div
          class="stat-card"
          :style="estProfitCard ? { borderColor: estProfitCard.borderColor } : undefined"
        >
          <div class="stat-title">预估利润</div>
          <template v-if="estProfitCard">
            <div class="stat-main" :style="{ color: estProfitCard.mainColor }">
              {{ estProfitCard.main }}
            </div>
            <div class="stat-row">
              <span class="label-dim">最低利润</span>
              <span style="color: #f1f5f9">{{ estProfitCard.minProfit }}</span>
              <span class="sep">|</span>
              <span class="label-dim">利润率</span>
              <span style="color: #f1f5f9">{{ estProfitCard.margin }}</span>
            </div>
          </template>
          <ElEmpty v-else description="暂无数据" :image-size="60" class="stat-card-empty" />
        </div>
      </div>

      <!-- ── 图表行 ── -->
      <div class="charts-row">
        <div class="chart-card chart-line">
          <div class="chart-header">
            <span class="chart-title">广告支出与利润趋势（7天）</span>
            <button class="btn-sm">按日</button>
          </div>
          <div v-if="trendIsEmpty" class="chart-body chart-body--empty">
            <ElEmpty description="暂无数据" :image-size="80" />
          </div>
          <div v-else ref="lineChartEl" class="chart-body"></div>
        </div>
        <div class="chart-card chart-pie">
          <div class="chart-header">
            <span class="chart-title">各广告平台支出占比</span>
          </div>
          <div v-if="sourcePieIsEmpty" class="chart-body chart-body--empty">
            <ElEmpty description="暂无数据" :image-size="80" />
          </div>
          <div v-else ref="pieChartEl" class="chart-body chart-body--pie"></div>
        </div>
      </div>

      <!-- ── 消耗进度监控 ── -->
      <div class="chart-card bottom-progress">
        <div class="chart-header">
          <span class="chart-title">消耗进度监控</span>
        </div>
        <div v-if="!progressList.length" class="progress-table-empty">
          <ElEmpty description="暂无数据" :image-size="80" />
        </div>
        <div v-else class="progress-table-scroll">
          <table class="progress-table">
            <thead>
              <tr>
                <th>广告系列</th>
                <th>广告支出/预算</th>
                <th>进度</th>
                <th>首日ROI</th>
                <!-- <th>状态</th> -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in progressList" :key="row.id || row.name">
                <td class="camp-name">{{ row.name }}</td>
                <td>
                  <span style="color: #e2e8f0">{{ row.spend }}</span>
                  <span class="budget-sep">/</span>
                  <span class="text-dim">{{ row.budget }}</span>
                </td>
                <td>
                  <div class="prog-wrap">
                    <div class="prog-track">
                      <div
                        class="prog-fill"
                        :style="{
                          width: row.progress + '%',
                          background: progressColor(row.progress, row.statusType)
                        }"
                      ></div>
                    </div>
                    <span class="prog-pct">{{ row.progress }}%</span>
                  </div>
                </td>
                <td
                  :style="{
                    color:
                      row.statusType === 'warn'
                        ? '#f97316'
                        : row.statusType === 'inactive'
                          ? '#64748b'
                          : '#f59e0b'
                  }"
                >
                  {{ progressDisplayRoi(row) }}
                </td>
                <!-- <td>
                  <span :class="['status-dot', row.statusType]">
                    <i class="dot"></i>{{ progressDisplayStatus(row) }}
                  </span>
                </td> -->
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
  @use '../styles/my-ads-neon.scss' as ma;

  .summary-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── 统计卡 ── */
  .stat-card-empty {
    min-height: 60px;
  }

  .stat-card-empty :deep(.el-empty__description) {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .stat-card {
    @include ma.ma-neon-surface;
    @include ma.ma-neon-surface-children;

    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 14px 16px;
    border-style: solid;
    border-width: 1px;
    border-top-width: 2px;
  }

  .stat-card--skeleton {
    min-height: 100px;

    @include ma.ma-skeleton-orbit;
  }

  .stat-card--skeleton :deep(.el-skeleton) {
    padding: 0;
  }

  .stat-title {
    font-size: 12px;
    font-weight: 600;

    @include ma.ma-title-gradient;
  }

  .stat-main {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
  }

  .stat-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    font-size: 12px;
  }

  .mt4 {
    margin-top: 4px;
  }

  .label-dim {
    color: var(--text-secondary);
  }

  .sep {
    color: var(--text-dim);
  }

  /* ── 图表行 ── */
  .charts-row {
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 12px;
  }

  .chart-card {
    @include ma.ma-neon-surface;
    @include ma.ma-neon-surface-children;

    padding: 14px 16px;
  }

  .summary-skeleton-chart {
    min-height: 220px;

    @include ma.ma-skeleton-orbit;
  }

  .summary-skeleton-chart :deep(.el-skeleton) {
    padding: 0;
  }

  .summary-skeleton-table {
    min-height: 280px;

    @include ma.ma-skeleton-orbit;
  }

  .summary-skeleton-table :deep(.el-skeleton) {
    padding: 0;
  }

  .chart-header {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }

  .chart-title {
    font-size: 13px;
    font-weight: 600;

    @include ma.ma-title-gradient;
  }

  .btn-sm {
    padding: 2px 8px;
    font-size: 11px;
    color: var(--text-secondary);
    cursor: pointer;
    background: var(--bg-card2);
    border: 1px solid var(--border);
    border-radius: 4px;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background 0.2s ease,
      box-shadow 0.2s ease;
  }

  .btn-sm:hover {
    color: var(--text-primary);
    background: rgb(0 212 170 / 10%);
    border-color: rgb(0 212 170 / 35%);
    box-shadow: 0 8px 18px rgb(0 0 0 / 20%);
  }

  .chart-body {
    height: 220px;
  }

  .chart-body--pie {
    box-sizing: border-box;
  }

  .chart-body--empty {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chart-body--empty :deep(.el-empty__description) {
    color: var(--text-secondary);
  }

  /* ── 下方行 ── */
  .bottom-row {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 12px;
  }

  .progress-table-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 160px;
  }

  .progress-table-empty :deep(.el-empty__description) {
    color: var(--text-secondary);
  }

  /* ── 进度表 ── */
  .progress-table-scroll {
    max-height: 280px;
    overflow: auto;
  }

  .progress-table-scroll .progress-table thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: rgb(10 10 14 / 94%);
    backdrop-filter: blur(6px);
  }

  .progress-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .progress-table th {
    padding: 4px 6px 8px;
    font-weight: 500;
    color: var(--text-dim);
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid var(--border);
  }

  .progress-table td {
    padding: 7px 6px;
    vertical-align: middle;
    border-bottom: 1px solid rgb(30 47 69 / 50%);
    transition: background 0.18s ease;
  }

  .progress-table tbody tr:hover td {
    background: rgb(0 212 170 / 6%);
  }

  .camp-name {
    font-size: 11px;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .budget-sep {
    margin: 0 2px;
    color: var(--text-dim);
  }

  .text-dim {
    color: var(--text-dim);
  }

  .prog-wrap {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .prog-track {
    width: 80px;
    height: 6px;
    overflow: hidden;
    background: var(--bg-card2);
    border-radius: 3px;
  }

  .prog-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s;
  }

  .prog-pct {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .status-dot {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 11px;
  }

  .status-dot .dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .status-dot.ok {
    color: #10b981;
  }

  .status-dot.ok .dot {
    background: #10b981;
  }

  .status-dot.warn {
    color: #f59e0b;
  }

  .status-dot.warn .dot {
    background: #f59e0b;
  }

  .status-dot.inactive {
    color: #4b5563;
  }

  .status-dot.inactive .dot {
    background: #4b5563;
  }

  @media (prefers-reduced-motion: reduce) {
    .stat-card,
    .chart-card,
    .btn-sm,
    .progress-table td {
      transition: none;
    }

    .stat-card--skeleton,
    .summary-skeleton-chart,
    .summary-skeleton-table {
      animation: none;
    }

    .stat-card:hover,
    .chart-card:hover,
    .btn-sm:hover {
      transform: none;
    }
  }
</style>
