<template>
  <div
    class="or-tab-content or-tab-overall"
    v-loading="loading && !!tabData"
    element-loading-background="color-mix(in srgb, var(--default-box-color) 88%, transparent)"
  >
    <!-- KPI 卡片行 -->
    <section v-if="loading && !tabData" class="or-kpi-grid or-kpi-grid--skeleton" aria-busy="true">
      <div v-for="n in 6" :key="n" class="or-kpi-skel">
        <ElSkeleton animated :rows="2" />
      </div>
    </section>
    <section v-else class="or-kpi-grid">
      <article v-for="card in tabData?.kpis ?? []" :key="card.id" class="or-kpi">
        <div class="or-kpi__title">{{ card.title }}</div>
        <div class="or-kpi__value">{{ card.primaryValue }}</div>
        <div class="or-kpi__sub">
          <span v-if="card.subLabel" class="sub-label"
            >{{ card.subLabel }} {{ card.subValue }}</span
          >
        </div>
        <div
          v-if="card.trendText"
          class="or-kpi__trend"
          :class="card.trendUp === undefined ? '' : card.trendUp ? 'trend-up' : 'trend-down'"
        >
          <el-icon v-if="card.trendUp !== undefined">
            <Top v-if="card.trendUp" />
            <Bottom v-else />
          </el-icon>
          {{ card.trendText }}
        </div>
      </article>
    </section>

    <!-- 中部：曲线图 + 右侧面板 -->
    <section v-if="tabData" class="or-mid-grid">
      <!-- 左：整体回收曲线 -->
      <ElCard class="or-panel or-panel--curve" shadow="never">
        <template #header>
          <div class="panel-header-row">
            <span>整体回收曲线（按广告平台）</span>
            <span class="panel-hint"
              >该数据为整合用户，含自然量用户。自然量数据来源：BigQuery 归因计算。
              回收天数截至今日。</span
            >
          </div>
        </template>
        <!-- 图例 -->
        <div class="curve-legend">
          <span
            v-for="s in tabData?.recoveryCurve.series ?? []"
            :key="s.name"
            class="curve-legend__item"
          >
            <span
              class="legend-dot"
              :style="{ background: s.color, borderStyle: s.dashed ? 'dashed' : 'solid' }"
            ></span>
            {{ s.name }}
          </span>
        </div>
        <div ref="curveChartRef" class="or-chart or-chart--curve"></div>
      </ElCard>

      <!-- 右：日均量构成 + ROI 对比 -->
      <div class="or-panel-right">
        <!-- 日均量构成 -->
        <ElCard class="or-panel or-panel--volume" shadow="never">
          <template #header><span class="or-panel-title">日均量构成（近30天）</span></template>
          <div ref="volumeChartRef" class="or-chart or-chart--volume"></div>
        </ElCard>

        <!-- ROI 对比 -->
        <ElCard class="or-panel or-panel--roi" shadow="never">
          <template #header><span class="or-panel-title">ROI 对比（付费 vs 整体）</span></template>
          <table class="roi-table">
            <thead>
              <tr>
                <th></th>
                <th>Day1</th>
                <th>Day14</th>
                <th>Day30</th>
                <th>Day60</th>
                <th>Day90</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in tabData?.roiCompare ?? []"
                :key="row.label"
                :class="{ 'row-highlight': row.isHighlight }"
              >
                <td class="row-label">{{ row.label }}</td>
                <td>{{ row.day1 }}</td>
                <td>{{ row.day14 }}</td>
                <td>{{ row.day30 }}</td>
                <td>{{ row.day60 }}</td>
                <td>{{ row.day90 }}</td>
              </tr>
            </tbody>
          </table>
        </ElCard>
      </div>
    </section>

    <!-- 底部：明细数据表 -->
    <ElCard v-if="tabData" class="or-panel or-panel--detail" shadow="never">
      <template #header>
        <div class="panel-header-row">
          <span>整体回收明细数据</span>
          <div class="detail-filters">
            <ElSelect v-model="detailApp" size="small" style="width: 100px">
              <ElOption label="全部" value="all" />
              <ElOption label="Weather5" value="weather5" />
            </ElSelect>
            <ElSelect v-model="detailChannel" size="small" style="width: 90px">
              <ElOption label="全部" value="all" />
              <ElOption label="Google" value="google" />
              <ElOption label="Facebook" value="facebook" />
            </ElSelect>
            <ElButton size="small" type="primary" plain>导出</ElButton>
          </div>
        </div>
      </template>
      <ElTable
        :data="tabData?.detailRows ?? []"
        size="small"
        class="detail-table"
        stripe
        style="width: 100%"
        :max-height="360"
      >
        <ElTableColumn prop="date" label="日期" width="62" fixed />
        <ElTableColumn prop="adSpend" label="广告支出" min-width="80">
          <template #default="{ row }"> ${{ row.adSpend.toLocaleString() }} </template>
        </ElTableColumn>
        <ElTableColumn prop="cpi" label="CPI" min-width="58">
          <template #default="{ row }"> ${{ row.cpi.toFixed(2) }} </template>
        </ElTableColumn>
        <ElTableColumn prop="paidUsers" label="付费用户" min-width="72" />
        <ElTableColumn prop="totalUsers" label="新用户（含自然）" min-width="106" />
        <ElTableColumn prop="organicUsers" label="自然量" min-width="64" />
        <ElTableColumn label="回收 ROI" align="center">
          <ElTableColumn prop="roiDay0" label="首日" min-width="54">
            <template #default="{ row }">
              <span class="roi-cell" :style="roiColor(row.roiDay0)">{{ row.roiDay0 }}%</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="roiDay1" label="1日" min-width="54">
            <template #default="{ row }">
              <span class="roi-cell" :style="roiColor(row.roiDay1)">{{ row.roiDay1 }}%</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="roiDay2" label="2日" min-width="54">
            <template #default="{ row }">
              <span class="roi-cell" :style="roiColor(row.roiDay2)">{{ row.roiDay2 }}%</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="roiDay3" label="3日" min-width="54">
            <template #default="{ row }">
              <span class="roi-cell" :style="roiColor(row.roiDay3)">{{ row.roiDay3 }}%</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="roiDay5" label="5日" min-width="54">
            <template #default="{ row }">
              <span class="roi-cell" :style="roiColor(row.roiDay5)">{{ row.roiDay5 }}%</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="roiDay7" label="7日" min-width="54">
            <template #default="{ row }">
              <span class="roi-cell" :style="roiColor(row.roiDay7)">{{ row.roiDay7 }}%</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="rush" label="冲量" min-width="54">
            <template #default="{ row }">
              <span class="roi-cell" :style="roiColor(row.rush)">{{ row.rush }}%</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="threeStar" label="三星" min-width="54">
            <template #default="{ row }">
              <span class="roi-cell" :style="roiColor(row.threeStar)">{{ row.threeStar }}%</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="sevenStar" label="七星" min-width="54">
            <template #default="{ row }">
              <span class="roi-cell" :style="roiColor(row.sevenStar)">{{ row.sevenStar }}%</span>
            </template>
          </ElTableColumn>
        </ElTableColumn>
        <ElTableColumn label="留存率" align="center">
          <ElTableColumn prop="retDay1" label="次留" min-width="58">
            <template #default="{ row }">
              <span class="ret-cell">{{ row.retDay1 }}%</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="retDay3" label="三留" min-width="58">
            <template #default="{ row }">
              <span class="ret-cell">{{ row.retDay3 }}%</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="retDay7" label="七留" min-width="58">
            <template #default="{ row }">
              <span class="ret-cell">{{ row.retDay7 }}%</span>
            </template>
          </ElTableColumn>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, nextTick } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { OverallRecoveryFilterState, OverallTabData } from '../types'
  import { fetchOverallTabData } from '@/api/user-growth'
  import { Top, Bottom } from '@element-plus/icons-vue'

  defineOptions({ name: 'OrTabOverall' })

  const props = defineProps<{ filter: OverallRecoveryFilterState }>()

  const tabData = ref<OverallTabData | null>(null)
  const loading = ref(false)
  let loadSeq = 0
  const detailApp = ref('all')
  const detailChannel = ref('all')

  const curveChart = useChart()
  const volumeChart = useChart()
  const curveChartRef = curveChart.chartRef
  const volumeChartRef = volumeChart.chartRef

  function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  function roiColor(val: number): { color: string; fontWeight: string } {
    if (val >= 60) return { color: '#14B8A6', fontWeight: '600' }
    if (val >= 40) return { color: '#34D399', fontWeight: '500' }
    if (val >= 20) return { color: '#6EE7B7', fontWeight: '400' }
    return { color: 'var(--art-gray-600)', fontWeight: '400' }
  }

  function buildCurveOption(): EChartsOption {
    const data = tabData.value?.recoveryCurve
    if (!data) return {}
    const { getAxisLineStyle, getSplitLineStyle, getAxisLabelStyle, getTooltipStyle } = curveChart
    return {
      tooltip: {
        ...getTooltipStyle('axis'),
        formatter: (params: any) => {
          const day = params[0]?.axisValue ?? ''
          const lines = params
            .map((p: any) => `<span style="color:${p.color}">●</span> ${p.seriesName}: ${p.value}%`)
            .join('<br/>')
          return `${day}<br/>${lines}`
        }
      },
      legend: { show: false },
      grid: { top: 20, right: 20, bottom: 30, left: 0, containLabel: true },
      xAxis: {
        type: 'category',
        data: data.days,
        axisLine: getAxisLineStyle(),
        axisTick: { show: false },
        axisLabel: getAxisLabelStyle()
      },
      yAxis: {
        type: 'value',
        axisLabel: { ...getAxisLabelStyle(), formatter: '{value}%' },
        splitLine: getSplitLineStyle()
      },
      series: data.series.map((s) => ({
        name: s.name,
        type: 'line',
        smooth: true,
        data: s.data,
        lineStyle: {
          color: s.color,
          width: 2,
          type: s.dashed ? 'dashed' : 'solid'
        },
        itemStyle: { color: s.color },
        symbol: 'circle',
        symbolSize: 4,
        areaStyle: s.dashed ? undefined : { color: hexToRgba(s.color, 0.12) }
      }))
    }
  }

  function buildVolumeOption(): EChartsOption {
    const data = tabData.value?.dailyVolume ?? []
    const { getAxisLineStyle, getSplitLineStyle, getAxisLabelStyle, getTooltipStyle } = volumeChart
    return {
      tooltip: getTooltipStyle('axis'),
      legend: {
        data: ['付费', '自然'],
        bottom: 0,
        textStyle: { color: 'var(--art-gray-600)', fontSize: 11 }
      },
      grid: { top: 10, right: 10, bottom: 30, left: 0, containLabel: true },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.date),
        axisLine: getAxisLineStyle(),
        axisTick: { show: false },
        axisLabel: { ...getAxisLabelStyle(), interval: 4 }
      },
      yAxis: {
        type: 'value',
        splitLine: getSplitLineStyle(),
        axisLabel: getAxisLabelStyle()
      },
      series: [
        {
          name: '付费',
          type: 'bar',
          stack: 'total',
          data: data.map((d) => d.paid),
          itemStyle: { color: '#4B8EF1' },
          barMaxWidth: 14
        },
        {
          name: '自然',
          type: 'bar',
          stack: 'total',
          data: data.map((d) => d.organic),
          itemStyle: { color: '#14B8A6' },
          barMaxWidth: 14
        }
      ]
    }
  }

  async function loadData() {
    const seq = ++loadSeq
    loading.value = true
    try {
      const res = await fetchOverallTabData({
        dateRange: props.filter.dateRange,
        s_app_id: props.filter.s_app_id,
        source: props.filter.source,
        s_country_code: props.filter.s_country_code
      })
      if (seq !== loadSeq) return
      tabData.value = res
      await nextTick()
      if (seq !== loadSeq) return
      curveChart.initChart(buildCurveOption())
      volumeChart.initChart(buildVolumeOption())
    } finally {
      if (seq === loadSeq) loading.value = false
    }
  }

  onMounted(loadData)
  watch(() => props.filter, loadData, { deep: true })
</script>

<style scoped lang="scss">
  @import '../../ad-performance/styles/ap-card-fx';

  .or-tab-overall {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 280px;
    padding-bottom: 16px;
  }

  /* KPI 卡片 */
  .or-kpi-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
  }

  .or-kpi-grid--skeleton {
    margin-bottom: 0;
  }

  .or-kpi-skel {
    padding: 14px 16px;

    @include ap-neon-bg;

    border-radius: 14px;
  }

  .or-kpi {
    position: relative;
    padding: 14px 16px;

    @include ap-neon-bg;

    border-radius: 14px;

    &__title {
      margin-bottom: 6px;
      font-size: 12px;
      color: var(--art-gray-600);
    }

    &__value {
      margin-bottom: 4px;
      font-size: 22px;
      font-weight: 600;
      color: var(--art-gray-900);
      letter-spacing: -0.5px;
    }

    &__sub {
      font-size: 11px;
      color: var(--art-gray-500);
    }

    &__trend {
      display: inline-flex;
      gap: 2px;
      align-items: center;
      margin-top: 4px;
      font-size: 11px;

      &.trend-up {
        color: #14b8a6;
      }

      &.trend-down {
        color: #ef4444;
      }
    }
  }

  /* 中部布局 */
  .or-mid-grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 12px;
    min-height: 0;

    // 左侧曲线卡片撑满
    .or-panel--curve {
      display: flex;
      flex-direction: column;

      :deep(.el-card__body) {
        display: flex;
        flex: 1;
        flex-direction: column;
        min-height: 0;
      }

      .or-chart--curve {
        flex: 1;
        height: auto;
        min-height: 200px;
      }
    }
  }

  .or-panel-right {
    display: flex;
    flex-direction: column;
    gap: 12px;

    // 日均量卡片固定，ROI对比卡片撑满剩余
    .or-panel--volume {
      flex-shrink: 0;
    }

    .or-panel--roi {
      display: flex;
      flex: 1;
      flex-direction: column;

      :deep(.el-card__body) {
        flex: 1;
        min-height: 0;
      }
    }
  }

  /* 面板（卡片标题与广告成效 trend 卡一致：主色字 + 渐变标题 + 底部分割线） */
  .or-panel {
    position: relative;
    overflow: hidden;
    border: none;

    @include ap-neon-bg;

    border-radius: 14px;

    :deep(.el-card__header) {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 12px 14px 8px;
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: 0.03em;
      background: transparent !important;
      border-bottom: 1px solid rgb(63 63 70 / 35%);
      transition: filter 0.32s var(--ease-out);
    }

    :deep(.panel-header-row) {
      color: var(--text-primary);
    }

    &:hover :deep(.el-card__header) {
      filter: drop-shadow(0 0 12px rgb(34 211 238 / 28%));
    }

    :deep(.el-card__header:not(:has(.panel-header-row))) {
      @include ap-title-gradient;

      font-size: 15px;
    }

    :deep(.panel-header-row > span:first-child) {
      @include ap-title-gradient;

      font-size: 15px;
      font-weight: 700;
    }

    :deep(.el-card__body) {
      padding: 12px 14px;
      padding-top: 8px;
      background: transparent;
    }
  }

  .or-panel-title {
    @include ap-title-gradient;

    font-size: 15px;
  }

  .panel-header-row {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }

  .panel-hint {
    font-size: 11px;
    font-weight: 400;
    color: var(--text-secondary);
    background: none;
    -webkit-text-fill-color: var(--text-secondary);
  }

  /* 图例 */
  .curve-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 8px;

    &__item {
      display: flex;
      gap: 5px;
      align-items: center;
      font-size: 11px;
      color: var(--art-gray-600);
    }
  }

  .legend-dot {
    display: inline-block;
    width: 20px;
    height: 3px;
    border-radius: 2px;
  }

  /* 图表容器 */
  .or-chart {
    width: 100%;

    &--curve {
      height: 240px;
    }

    &--volume {
      height: 130px;
    }
  }

  /* ROI 对比表 */
  .roi-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;

    th,
    td {
      padding: 6px 8px;
      text-align: center;
      border: 1px solid var(--default-border);
    }

    th {
      font-weight: 500;
      color: var(--art-gray-600);
      background: var(--default-bg-color);
    }

    .row-label {
      font-weight: 500;
      color: var(--art-gray-800);
      text-align: left;
    }

    .row-highlight td {
      font-weight: 700;
      color: #14b8a6;
      background: rgb(20 184 166 / 8%);
    }
  }

  /* 明细筛选 */
  .detail-filters {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  /* ROI 单元格 */
  .roi-cell {
    display: inline-block;
    padding: 1px 4px;
    font-size: 11px;
    border-radius: 3px;
  }

  /* 留存率单元格 */
  .ret-cell {
    display: inline-block;
    padding: 1px 4px;
    font-size: 11px;
    color: #60a5fa;
    border-radius: 3px;
  }

  /* 明细卡片 */
  .or-panel--detail {
    :deep(.el-card__body) {
      padding: 0;
      overflow: hidden;
    }
  }

  /* 详情表 */
  .detail-table {
    width: 100%;

    :deep(.el-table__header th) {
      font-size: 12px;
      color: var(--art-gray-600);
      background: var(--default-bg-color);
    }

    :deep(.el-table__body td) {
      font-size: 12px;
    }
  }

  @media (width <= 1280px) {
    .or-kpi-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .or-mid-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
