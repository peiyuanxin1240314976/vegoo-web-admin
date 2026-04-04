<template>
  <div class="performance-analysis-page comp-page">
    <div class="pa-page-fx" aria-hidden="true"></div>
    <!-- ─── Header ────────────────────────────────── -->
    <div class="comp-header pa-entry-1">
      <div class="header-left">
        <div class="breadcrumb">
          <span class="bc-parent">用户增长</span>
          <span class="bc-sep">›</span>
          <span class="bc-parent" @click="goBack">人员绩效</span>
          <span class="bc-sep">›</span>
          <span class="bc-current">对比分析</span>
        </div>
        <div class="subtitle">实时数据截止 14:40</div>
      </div>
      <div class="header-right">
        <button class="btn-back" @click="goBack">← 返回列表</button>
        <ElDatePicker
          v-model="selectedDateRange"
          class="date-range-picker"
          type="daterange"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          popper-class="pa-or-filter-popper"
        />
        <button class="btn-export">↑ 导出</button>
      </div>
    </div>

    <!-- ─── Selected Tags ────────────────────────── -->
    <div class="selected-row pa-entry-2">
      <span class="selected-label">已选择：</span>
      <span
        v-for="(p, i) in selectedStaff"
        :key="p.id"
        class="person-tag"
        :style="{ borderColor: COLORS[i], color: COLORS[i], background: COLORS[i] + '18' }"
      >
        {{ p.name }}
        <span class="tag-remove" @click="removeStaff(p.id)">×</span>
      </span>
      <button class="add-btn" @click="showAddModal = true">＋ 添加对比</button>
    </div>

    <!-- ─── KPI Row ───────────────────────────────── -->
    <div class="kpi-row pa-entry-2">
      <div class="kpi-card pa-neon-lift-card">
        <div class="kpi-title">广告支出合计</div>
        <div class="kpi-value">${{ fmt(kpis.totalAd) }}</div>
        <div class="kpi-sub pos-text">周环比 +8%</div>
      </div>
      <div class="kpi-card pa-neon-lift-card">
        <div class="kpi-title">首日ROI均值</div>
        <div class="kpi-value gold-text">{{ kpis.avgRoi }}%</div>
        <div class="kpi-row-inline">
          <span class="kpi-hint">达标线 85%</span>
          <span class="badge-pass">达标</span>
        </div>
      </div>
      <div class="kpi-card pa-neon-lift-card">
        <div class="kpi-title">预估利润合计</div>
        <div class="kpi-value pos-text">+${{ fmt(kpis.totalProfit) }}</div>
        <div class="kpi-sub pos-text">周环比 +12%</div>
      </div>
      <div class="kpi-card pa-neon-lift-card kpi-alert">
        <div class="kpi-title">未达标人员</div>
        <div class="kpi-value red-text">{{ kpis.failCount }} 人</div>
        <div class="kpi-fail-name red-text">{{ kpis.failName }}</div>
      </div>
    </div>

    <!-- ─── Main Charts + Right Panel ───────────── -->
    <div class="content-area pa-entry-3">
      <!-- Left: charts 2×2 -->
      <div class="charts-grid">
        <!-- ROI 趋势 -->
        <div class="chart-card pa-neon-panel">
          <div class="chart-title">首日ROI 趋势对比</div>
          <div ref="roiChartRef" class="chart-body"></div>
        </div>

        <!-- Radar -->
        <div class="chart-card pa-neon-panel">
          <div class="chart-title">综合效能雷达图</div>
          <div ref="radarChartRef" class="chart-body"></div>
        </div>

        <!-- 广告支出趋势 -->
        <div class="chart-card pa-neon-panel">
          <div class="chart-title">广告支出 趋势对比</div>
          <div ref="adChartRef" class="chart-body"></div>
        </div>

        <!-- 利润对比 -->
        <div class="chart-card pa-neon-panel">
          <div class="chart-title">预估利润对比</div>
          <div ref="profitChartRef" class="chart-body"></div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="right-panel">
        <!-- 指标排名 -->
        <div class="panel-card pa-neon-panel">
          <div class="panel-title">指标排名</div>
          <table class="rank-table">
            <thead>
              <tr>
                <th>指标</th>
                <th class="rank-1">🏆 第1</th>
                <th class="rank-2">🥈 第2</th>
                <th class="rank-3">🥉 第3</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in rankData" :key="r.metric">
                <td class="metric-name">{{ r.metric }}</td>
                <td class="rank-1">{{ r.r1 }}</td>
                <td class="rank-2">{{ r.r2 }}</td>
                <td class="rank-3">{{ r.r3 }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 绩效得分明细 -->
        <div class="panel-card pa-neon-panel">
          <div class="panel-title">绩效得分明细</div>
          <table class="score-table">
            <thead>
              <tr>
                <th>人员</th>
                <th>花费分</th>
                <th>ROI分</th>
                <th>CPI分</th>
                <th>利润分</th>
                <th>综合得分</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in scoreDetail" :key="s.name">
                <td :style="{ color: s.color }" class="score-name">{{ s.name }}</td>
                <td>{{ s.spend }}</td>
                <td>{{ s.roi }}</td>
                <td>{{ s.cpi }}</td>
                <td>{{ s.profit }}</td>
                <td :style="{ color: s.color }" class="total-score">{{ s.total }}分</td>
                <td>
                  <span :class="['s-badge', `sb-${s.statusClass}`]">{{ s.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 异常预警 -->
        <div class="panel-card pa-neon-panel alert-panel">
          <div class="panel-title warning-title">⚠ 异常预警</div>
          <div class="alert-item" v-for="a in alerts" :key="a.id">
            <span :class="['alert-icon', a.level]">{{ a.level === 'warn' ? '△' : '▲' }}</span>
            <span class="alert-text">{{ a.text }}</span>
            <button class="alert-link" @click="viewAlertDetail(a.id)">查看详情</button>
          </div>
        </div>
      </div>
    </div>

    <ElDialog v-model="showAddModal" title="添加对比人员" width="560px" append-to-body>
      <div class="add-compare-body">
        <div class="add-compare-toolbar">
          <ElButton size="small" :loading="compareCandidatesLoading" @click="loadCompareCandidates">
            刷新候选
          </ElButton>
          <span class="candidate-tip">按当前筛选条件拉取，已选人员会自动排除</span>
        </div>
        <ElCheckboxGroup v-model="pendingAddIds" class="candidate-list">
          <ElCheckbox v-for="item in compareCandidates" :key="item.id" :value="item.id">
            {{ item.name }}（{{ item.level }}｜{{ item.score }}分｜{{ item.status }}）
          </ElCheckbox>
        </ElCheckboxGroup>
        <div
          v-if="!compareCandidatesLoading && compareCandidates.length === 0"
          class="candidate-empty"
        >
          当前筛选下没有可添加人员
        </div>
      </div>
      <template #footer>
        <ElButton round @click="closeAddCompareModal">取消</ElButton>
        <ElButton round type="primary" @click="confirmAddCompare">确定添加</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import * as echarts from 'echarts'
  import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
  import {
    fetchPerformanceCompareCandidates,
    type PerformanceCompareCandidatesItem
  } from '@/api/user-growth/performance-analysis'

  defineOptions({ name: 'PerformanceComparison' })

  // ─── Types ────────────────────────────────────────────────
  interface StaffSummary {
    id: string
    name: string
  }

  // ─── Constants ────────────────────────────────────────────
  const COLORS = ['#f59e0b', '#22d3ee', '#60a5fa', '#a78bfa']
  const DATES = ['2/26', '2/27', '2/28', '3/1', '3/2', '3/3', '3/4']

  // Mock ROI trend data per person
  const ROI_TRENDS: Record<string, number[]> = {
    zhao6: [98, 99, 97, 95, 94, 98, 98],
    zhang3: [93, 96, 97, 95, 90, 94, 98],
    li4: [90, 91, 89, 90, 81, 93, 93],
    wang5: [85, 79, 81, 76, 80, 81, 82],
    liu7: [90, 91, 90, 88, 89, 91, 90],
    chen8: [84, 85, 83, 82, 83, 85, 84],
    zhou9: [81, 82, 80, 79, 80, 81, 81],
    wu10: [83, 84, 82, 81, 82, 83, 83]
  }

  // Mock Ad spend trend data
  const AD_TRENDS: Record<string, number[]> = {
    zhao6: [6800, 7200, 7600, 7100, 7400, 7800, 8100],
    zhang3: [6400, 6900, 7100, 6800, 7000, 7200, 7500],
    li4: [3800, 4100, 3900, 4200, 4000, 4400, 4500],
    wang5: [3500, 3800, 3600, 3900, 4000, 3700, 4200],
    liu7: [4200, 4600, 4400, 4800, 4600, 5000, 4900],
    chen8: [3900, 4100, 3800, 4000, 4200, 4100, 4300],
    zhou9: [3000, 3200, 3100, 3300, 3200, 3400, 3500],
    wu10: [2300, 2500, 2400, 2600, 2400, 2700, 2600]
  }

  const ALL_STAFF: Record<
    string,
    {
      name: string
      adSpend: number
      estProfit: number
      score: number
      status: string
      statusClass: string
      color: string
    }
  > = {
    zhao6: {
      name: '赵六',
      adSpend: 52100,
      estProfit: 15600,
      score: 96,
      status: '超标',
      statusClass: 'over',
      color: '#f59e0b'
    },
    zhang3: {
      name: '张三',
      adSpend: 49279,
      estProfit: 12400,
      score: 94,
      status: '达标',
      statusClass: 'pass',
      color: '#22d3ee'
    },
    li4: {
      name: '李四',
      adSpend: 37838,
      estProfit: 6800,
      score: 88,
      status: '达标',
      statusClass: 'pass',
      color: '#60a5fa'
    },
    wang5: {
      name: '王五',
      adSpend: 28450,
      estProfit: -1200,
      score: 72,
      status: '未达标',
      statusClass: 'fail',
      color: '#a78bfa'
    },
    liu7: {
      name: '刘七',
      adSpend: 33500,
      estProfit: 8900,
      score: 90,
      status: '达标',
      statusClass: 'pass',
      color: '#34d399'
    },
    chen8: {
      name: '陈八',
      adSpend: 29600,
      estProfit: 3200,
      score: 83,
      status: '达标',
      statusClass: 'pass',
      color: '#fb7185'
    },
    zhou9: {
      name: '周九',
      adSpend: 24100,
      estProfit: 1600,
      score: 80,
      status: '达标',
      statusClass: 'pass',
      color: '#e879f9'
    },
    wu10: {
      name: '吴十',
      adSpend: 18200,
      estProfit: 900,
      score: 78,
      status: '接近达标',
      statusClass: 'near',
      color: '#94a3b8'
    }
  }

  const SCORE_DETAIL_DATA: Record<
    string,
    { spend: number; roi: number; cpi: number; profit: number; total: number }
  > = {
    zhao6: { spend: 28, roi: 30, cpi: 20, profit: 18, total: 96 },
    zhang3: { spend: 25, roi: 30, cpi: 20, profit: 19, total: 94 },
    li4: { spend: 22, roi: 28, cpi: 20, profit: 18, total: 88 },
    wang5: { spend: 15, roi: 18, cpi: 16, profit: 23, total: 72 },
    liu7: { spend: 23, roi: 29, cpi: 20, profit: 18, total: 90 },
    chen8: { spend: 21, roi: 26, cpi: 19, profit: 17, total: 83 },
    zhou9: { spend: 20, roi: 25, cpi: 18, profit: 17, total: 80 },
    wu10: { spend: 19, roi: 24, cpi: 18, profit: 17, total: 78 }
  }

  // ─── Router ───────────────────────────────────────────────
  const router = useRouter()
  const route = useRoute()

  // ─── State ────────────────────────────────────────────────
  const showAddModal = ref(false)
  const selectedDateRange = ref<[string, string]>(buildDefaultDateRange())
  const compareCandidatesLoading = ref(false)
  const compareCandidates = ref<PerformanceCompareCandidatesItem[]>([])
  const pendingAddIds = ref<string[]>([])

  // Parse IDs from route query
  const selectedStaff = ref<StaffSummary[]>([])

  function initFromRoute() {
    const ids = (route.query.ids as string) || 'zhang3,li4,wang5,zhao6'
    selectedStaff.value = ids.split(',').map((id) => ({
      id,
      name: ALL_STAFF[id]?.name ?? id
    }))
    const startDate = route.query.startDate as string | undefined
    const endDate = route.query.endDate as string | undefined
    if (startDate && endDate) {
      selectedDateRange.value = [startDate, endDate]
    }
  }
  initFromRoute()

  function buildDefaultDateRange(): [string, string] {
    const endDate = getAppNow()
    const startDate = cloneAppDate(endDate)
    startDate.setDate(startDate.getDate() - 6)
    return [formatYYYYMMDD(startDate), formatYYYYMMDD(endDate)]
  }

  // ─── Computed KPIs ────────────────────────────────────────
  const kpis = computed(() => {
    const ids = selectedStaff.value.map((s) => s.id)
    const totalAd = ids.reduce((acc, id) => acc + (ALL_STAFF[id]?.adSpend ?? 0), 0)
    const avgRoi = 89
    const totalProfit = ids.reduce((acc, id) => acc + (ALL_STAFF[id]?.estProfit ?? 0), 0)
    const failList = ids.filter((id) => ALL_STAFF[id]?.statusClass === 'fail')
    return {
      totalAd,
      avgRoi,
      totalProfit,
      failCount: failList.length,
      failName: failList.map((id) => ALL_STAFF[id]?.name).join('、')
    }
  })

  const rankData = computed(() => [
    {
      metric: '广告支出',
      r1: `赵六 $52,100`,
      r2: `张三 $49,279`,
      r3: `李四 $37,838`
    },
    {
      metric: '首日ROI',
      r1: `赵六 96%`,
      r2: `张三 93%`,
      r3: `李四 88%`
    },
    {
      metric: '预估利润',
      r1: `赵六 +$15,600`,
      r2: `张三 +$12,400`,
      r3: `李四 +$6,800`
    },
    {
      metric: '最低利润',
      r1: `赵六 +$9,800`,
      r2: `张三 +$8,200`,
      r3: `李四 +$3,200`
    },
    {
      metric: '绩效得分',
      r1: `赵六 96分`,
      r2: `张三 94分`,
      r3: `李四 88分`
    }
  ])

  function buildScoreDetailById(id: string) {
    const scoreData = SCORE_DETAIL_DATA[id]
    if (scoreData) return scoreData

    const total = ALL_STAFF[id]?.score ?? 80
    const spend = Math.round(total * 0.26)
    const roi = Math.round(total * 0.31)
    const cpi = Math.round(total * 0.21)
    const profit = Math.max(0, total - spend - roi - cpi)
    return { spend, roi, cpi, profit, total }
  }

  const scoreDetail = computed(() =>
    selectedStaff.value.map((s) => ({
      name: s.name,
      color: ALL_STAFF[s.id]?.color ?? '#fff',
      ...buildScoreDetailById(s.id),
      status: ALL_STAFF[s.id]?.status ?? '',
      statusClass: ALL_STAFF[s.id]?.statusClass ?? ''
    }))
  )

  const alerts = ref([
    { id: 1, level: 'warn', text: '王五 连续7日首日ROI低于80%达标线，建议尽快安排读师会议' },
    { id: 2, level: 'error', text: '王五 预估利润连续为负，建议调整投放策略' }
  ])

  // ─── Chart refs ────────────────────────────────────────────
  const roiChartRef = ref<HTMLDivElement | null>(null)
  const radarChartRef = ref<HTMLDivElement | null>(null)
  const adChartRef = ref<HTMLDivElement | null>(null)
  const profitChartRef = ref<HTMLDivElement | null>(null)

  let roiChart: echarts.ECharts | null = null
  let radarChart: echarts.ECharts | null = null
  let adChart: echarts.ECharts | null = null
  let profitChart: echarts.ECharts | null = null

  // ─── Chart options ─────────────────────────────────────────
  function buildRoiOption(): echarts.EChartsOption {
    const ids = selectedStaff.value.map((s) => s.id)
    const series = ids.map((id, i) => ({
      name: ALL_STAFF[id]?.name ?? id,
      type: 'line' as const,
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { width: 2, color: COLORS[i] },
      itemStyle: { color: COLORS[i] },
      data: ROI_TRENDS[id] ?? [],
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: COLORS[i] + '30' },
          { offset: 1, color: COLORS[i] + '00' }
        ])
      }
    }))

    return {
      backgroundColor: 'transparent',
      grid: { left: 36, right: 16, top: 40, bottom: 36 },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: '#94a3b8', fontSize: 11 },
        itemWidth: 12,
        itemHeight: 8
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e2d45',
        borderColor: '#2a3d5c',
        textStyle: { color: '#e2e8f0', fontSize: 12 },
        formatter: (params: any) => {
          let html = `<div style="margin-bottom:4px;color:#94a3b8">${params[0].axisValue}</div>`
          params.forEach((p: any) => {
            html += `<div><span style="color:${p.color}">●</span> ${p.seriesName}: ${p.value}%</div>`
          })
          return html
        }
      },
      xAxis: {
        type: 'category',
        data: DATES,
        axisLine: { lineStyle: { color: '#1f2d47' } },
        axisTick: { show: false },
        axisLabel: { color: '#64748b', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        min: 70,
        max: 105,
        splitLine: { lineStyle: { color: '#1f2d47', type: 'dashed' } },
        axisLabel: { color: '#64748b', fontSize: 11, formatter: '{value}%' }
      },
      series: [
        ...series,
        {
          name: '达标线',
          type: 'line' as const,
          data: Array(7).fill(85),
          lineStyle: { color: '#ef4444', type: 'dashed', width: 1 },
          itemStyle: { color: '#ef4444' },
          symbol: 'none',
          tooltip: { show: false },
          markLine: undefined
        },
        {
          name: '最低要求',
          type: 'line' as const,
          data: Array(7).fill(80),
          lineStyle: { color: '#f97316', type: 'dashed', width: 1 },
          itemStyle: { color: '#f97316' },
          symbol: 'none',
          tooltip: { show: false }
        }
      ]
    }
  }

  function buildRadarOption(): echarts.EChartsOption {
    const ids = selectedStaff.value.map((s) => s.id)
    const radarValues: Record<string, number[]> = {
      zhao6: [28, 30, 20, 18, 96],
      zhang3: [25, 30, 20, 19, 94],
      li4: [22, 28, 20, 18, 88],
      wang5: [15, 18, 16, 23, 72],
      liu7: [24, 28, 19, 17, 90],
      chen8: [21, 26, 18, 16, 83],
      zhou9: [18, 24, 16, 14, 80],
      wu10: [16, 22, 18, 13, 78]
    }

    return {
      backgroundColor: 'transparent',
      legend: {
        bottom: 0,
        textStyle: { color: '#94a3b8', fontSize: 11 },
        itemWidth: 12,
        itemHeight: 8
      },
      tooltip: {
        backgroundColor: '#1e2d45',
        borderColor: '#2a3d5c',
        textStyle: { color: '#e2e8f0', fontSize: 12 }
      },
      radar: {
        center: ['50%', '48%'],
        radius: '58%',
        indicator: [
          { name: '花费达成', max: 30 },
          { name: '首日ROI', max: 30 },
          { name: 'CPI控制', max: 20 },
          { name: '利润达成', max: 25 },
          { name: '绩效得分', max: 100 }
        ],
        axisLine: { lineStyle: { color: '#1f2d47' } },
        splitLine: { lineStyle: { color: '#1f2d47' } },
        splitArea: { areaStyle: { color: ['rgba(31,45,71,0.3)', 'rgba(31,45,71,0.1)'] } },
        axisName: { color: '#64748b', fontSize: 11 }
      },
      series: [
        {
          type: 'radar' as const,
          data: ids.map((id, i) => ({
            name: ALL_STAFF[id]?.name ?? id,
            value: radarValues[id] ?? [0, 0, 0, 0, 0],
            lineStyle: { color: COLORS[i], width: 2 },
            itemStyle: { color: COLORS[i] },
            areaStyle: { color: COLORS[i] + '25' },
            symbol: 'circle',
            symbolSize: 4
          }))
        }
      ]
    }
  }

  function buildAdOption(): echarts.EChartsOption {
    const ids = selectedStaff.value.map((s) => s.id)
    return {
      backgroundColor: 'transparent',
      grid: { left: 40, right: 16, top: 40, bottom: 36 },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: '#94a3b8', fontSize: 11 },
        itemWidth: 12,
        itemHeight: 8
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e2d45',
        borderColor: '#2a3d5c',
        textStyle: { color: '#e2e8f0', fontSize: 12 }
      },
      xAxis: {
        type: 'category',
        data: DATES,
        axisLine: { lineStyle: { color: '#1f2d47' } },
        axisTick: { show: false },
        axisLabel: { color: '#64748b', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#1f2d47', type: 'dashed' } },
        axisLabel: {
          color: '#64748b',
          fontSize: 11,
          formatter: (v: number) => (v >= 1000 ? `$${v / 1000}K` : `$${v}`)
        }
      },
      series: ids.map((id, i) => ({
        name: ALL_STAFF[id]?.name ?? id,
        type: 'bar' as const,
        barMaxWidth: 16,
        barGap: '15%',
        itemStyle: { color: COLORS[i], borderRadius: [3, 3, 0, 0] },
        data: AD_TRENDS[id] ?? []
      }))
    }
  }

  function buildProfitOption(): echarts.EChartsOption {
    const ids = selectedStaff.value.map((s) => s.id)
    const avgProfit = Math.round(
      ids.reduce((a, id) => a + (ALL_STAFF[id]?.estProfit ?? 0), 0) / ids.length
    )

    return {
      backgroundColor: 'transparent',
      grid: { left: 60, right: 100, top: 20, bottom: 20 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'none' },
        backgroundColor: '#1e2d45',
        borderColor: '#2a3d5c',
        textStyle: { color: '#e2e8f0', fontSize: 12 }
      },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#1f2d47', type: 'dashed' } },
        axisLabel: {
          color: '#64748b',
          fontSize: 11,
          formatter: (v: number) => `$${(v / 1000).toFixed(0)}K`
        }
      },
      yAxis: {
        type: 'category',
        data: ids.map((id) => ALL_STAFF[id]?.name ?? id),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 12 }
      },
      series: [
        {
          type: 'bar' as const,
          barMaxWidth: 24,
          label: {
            show: true,
            position: 'right',
            color: '#e2e8f0',
            fontSize: 12,
            formatter: (p: any) => {
              const v = p.value
              return v >= 0 ? `+$${(v / 1000).toFixed(1)}K` : `-$${Math.abs(v / 1000).toFixed(1)}K`
            }
          },
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: (params: any) => {
              const id = ids[params.dataIndex]
              return ALL_STAFF[id]?.estProfit >= 0 ? COLORS[params.dataIndex] : '#ef4444'
            }
          },
          data: ids.map((id) => ALL_STAFF[id]?.estProfit ?? 0),
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: '#64748b', type: 'dashed', width: 1 },
            label: { color: '#64748b', fontSize: 10, position: 'end', formatter: 'Team Avg' },
            data: [{ xAxis: avgProfit }]
          }
        }
      ]
    }
  }

  // ─── Lifecycle ────────────────────────────────────────────
  function initCharts() {
    nextTick(() => {
      if (roiChartRef.value) {
        roiChart = echarts.init(roiChartRef.value, 'dark')
        roiChart.setOption(buildRoiOption())
      }
      if (radarChartRef.value) {
        radarChart = echarts.init(radarChartRef.value, 'dark')
        radarChart.setOption(buildRadarOption())
      }
      if (adChartRef.value) {
        adChart = echarts.init(adChartRef.value, 'dark')
        adChart.setOption(buildAdOption())
      }
      if (profitChartRef.value) {
        profitChart = echarts.init(profitChartRef.value, 'dark')
        profitChart.setOption(buildProfitOption())
      }
    })
  }

  function disposeCharts() {
    roiChart?.dispose()
    radarChart?.dispose()
    adChart?.dispose()
    profitChart?.dispose()
  }

  function resizeCharts() {
    roiChart?.resize()
    radarChart?.resize()
    adChart?.resize()
    profitChart?.resize()
  }

  onMounted(() => {
    initCharts()
    window.addEventListener('resize', resizeCharts)
  })

  onUnmounted(() => {
    disposeCharts()
    window.removeEventListener('resize', resizeCharts)
  })

  // ─── Methods ──────────────────────────────────────────────
  function fmt(n: number) {
    return Math.abs(n).toLocaleString('en-US')
  }

  function goBack() {
    router.push('/user-growth/performance-analysis')
  }

  function resolveCompareRequestFilters() {
    return {
      personFilter: (route.query.personFilter as string) || '',
      appFilter: (route.query.appFilter as string) || '',
      statusFilter: (route.query.statusFilter as string) || '',
      keyword: (route.query.keyword as string) || ''
    }
  }

  async function loadCompareCandidates() {
    const [startDate, endDate] = selectedDateRange.value
    compareCandidatesLoading.value = true
    try {
      const filters = resolveCompareRequestFilters()
      const res = await fetchPerformanceCompareCandidates({
        startDate,
        endDate,
        ...filters,
        excludeIds: selectedStaff.value.map((item) => item.id),
        current: 1,
        size: 50
      })
      compareCandidates.value = res.list
    } finally {
      compareCandidatesLoading.value = false
    }
  }

  function closeAddCompareModal() {
    showAddModal.value = false
    pendingAddIds.value = []
  }

  function refreshAllCharts() {
    nextTick(() => {
      roiChart?.setOption(buildRoiOption(), true)
      radarChart?.setOption(buildRadarOption(), true)
      adChart?.setOption(buildAdOption(), true)
      profitChart?.setOption(buildProfitOption(), true)
    })
  }

  function confirmAddCompare() {
    if (pendingAddIds.value.length === 0) {
      ElMessage.warning('请先选择要添加的人员')
      return
    }
    const exists = new Set(selectedStaff.value.map((item) => item.id))
    const appendList = pendingAddIds.value
      .filter((id) => !exists.has(id))
      .map((id) => ({ id, name: ALL_STAFF[id]?.name ?? id }))
    selectedStaff.value = [...selectedStaff.value, ...appendList]
    closeAddCompareModal()
    refreshAllCharts()
  }

  function removeStaff(id: string) {
    selectedStaff.value = selectedStaff.value.filter((s) => s.id !== id)
    refreshAllCharts()
  }

  function viewAlertDetail(id: number) {
    void id
    // Navigate to alert detail or open modal
  }

  watch(showAddModal, (visible) => {
    if (!visible) return
    pendingAddIds.value = []
    void loadCompareCandidates()
  })
</script>

<style scoped lang="scss">
  @use './styles/pa-performance-fx.scss' as *;
  @use './styles/pa-filters-or-align.scss' as *;

  $bg: #0d1117;
  $bg-card: #161c2d;
  $bg-header: #111827;
  $border: #1f2d47;
  $border-light: #263354;

  $cyan: #22d3ee;
  $gold: #f59e0b;
  $green: #10b981;
  $red: #ef4444;
  $orange: #f97316;

  $text-primary: #e2e8f0;
  $text-secondary: #64748b;
  $text-muted: #475569;

  // ─── Layout ──────────────────────────────────────────────
  .performance-analysis-page.comp-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 20px 24px 28px;
    overflow: hidden;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 13px;
    color: var(--text-primary);
  }

  .breadcrumb {
    font-size: 15px;
    font-weight: 600;

    .bc-parent {
      color: $text-secondary;
      cursor: pointer;

      &:hover {
        color: $text-primary;
      }
    }

    .bc-sep {
      margin: 0 6px;
      color: $text-muted;
    }

    .bc-current {
      color: $text-primary;
    }
  }

  .subtitle {
    margin-top: 2px;
    font-size: 11px;
    color: $text-muted;
  }

  .header-right {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .add-compare-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .add-compare-toolbar {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }

  .candidate-tip {
    font-size: 12px;
    color: $text-secondary;
  }

  .candidate-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 260px;
    padding: 10px;
    overflow: auto;
  }

  .candidate-empty {
    font-size: 12px;
    color: $text-secondary;
    text-align: center;
  }

  .person-tag {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid;
    border-radius: 20px;

    .tag-remove {
      margin-left: 2px;
      font-size: 14px;
      cursor: pointer;
      opacity: 0.7;

      &:hover {
        opacity: 1;
      }
    }
  }

  .add-btn {
    padding: 3px 12px;
    font-size: 12px;
    cursor: pointer;
    background: transparent;
  }

  // ─── KPI Row ─────────────────────────────────────────────
  .kpi-row {
    display: flex;
    flex-shrink: 0;
  }

  .kpi-card {
    flex: 1;
    padding: 14px 18px;

    .kpi-title {
      margin-bottom: 6px;
      font-size: 11px;
      color: $text-secondary;
    }

    .kpi-value {
      font-size: 24px;
      font-weight: 700;
      line-height: 1.2;
    }

    .kpi-sub {
      margin-top: 4px;
      font-size: 11px;
    }

    .kpi-row-inline {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: 4px;
    }

    .kpi-hint {
      font-size: 11px;
      color: $text-secondary;
    }

    .kpi-fail-name {
      margin-top: 2px;
      font-size: 13px;
      font-weight: 600;
    }
  }

  // ─── Content Area ────────────────────────────────────────
  .content-area {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  // ─── Charts Grid ─────────────────────────────────────────
  .charts-grid {
    display: grid;
    flex: 1;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    min-height: 0;
    overflow: hidden;
  }

  .chart-card {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;

    .chart-title {
      position: relative;
      z-index: 1;
      flex-shrink: 0;
      padding: 12px 16px 0;
      font-size: 12px;
      font-weight: 600;
      color: $text-secondary;
    }

    .chart-body {
      position: relative;
      z-index: 1;
      flex: 1;
      width: 100%;
      min-width: 0;
      min-height: 140px;
      padding: 4px;
    }
  }

  // ─── Right Panel ─────────────────────────────────────────
  .right-panel {
    flex-shrink: 0;
    width: 360px;
  }

  .panel-card {
    padding: 14px;

    .panel-title {
      position: relative;
      z-index: 1;
      margin-bottom: 12px;
      font-size: 13px;
      font-weight: 600;
      color: $text-primary;
    }

    table {
      position: relative;
      z-index: 1;
    }
  }

  .warning-title {
    color: $gold;
  }

  // ─── Rank Table ──────────────────────────────────────────
  .rank-table {
    width: 100%;
    font-size: 11.5px;
    border-collapse: collapse;

    th {
      padding: 6px;
      font-weight: 500;
      color: $text-secondary;
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid $border;
    }

    td {
      padding: 7px 6px;
      white-space: nowrap;
      border-bottom: 1px solid rgba($border, 0.5);
    }

    .metric-name {
      color: $text-secondary;
    }

    .rank-1 {
      font-weight: 600;
      color: $gold;
    }

    .rank-2 {
      color: #94a3b8;
    }

    .rank-3 {
      color: #cd7c2f;
    }

    tr:last-child td {
      border-bottom: none;
    }
  }

  // ─── Score Table ─────────────────────────────────────────
  .score-table {
    width: 100%;
    font-size: 11.5px;
    border-collapse: collapse;

    th {
      padding: 6px 5px;
      font-weight: 500;
      color: $text-secondary;
      text-align: center;
      white-space: nowrap;
      border-bottom: 1px solid $border;
    }

    td {
      padding: 7px 5px;
      text-align: center;
      border-bottom: 1px solid rgba($border, 0.5);
    }

    .score-name {
      font-weight: 600;
      text-align: left;
    }

    .total-score {
      font-weight: 700;
    }

    tr:last-child td {
      border-bottom: none;
    }
  }

  .s-badge {
    display: inline-block;
    padding: 1px 6px;
    font-size: 10px;
    font-weight: 600;
    border-radius: 10px;

    &.sb-over {
      color: $green;
      background: rgba($green, 0.15);
    }

    &.sb-near {
      color: $orange;
      background: rgba($orange, 0.12);
    }

    &.sb-fail {
      color: $red;
      background: rgba($red, 0.12);
    }
  }

  .alert-item {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 8px 0;

    &:last-child {
      padding-bottom: 0;
      border-bottom: none;
    }

    .alert-icon {
      flex-shrink: 0;
      margin-top: 1px;
      font-size: 12px;

      &.warn {
        color: $gold;
      }

      &.error {
        color: $red;
      }
    }

    .alert-text {
      flex: 1;
      font-size: 11.5px;
      line-height: 1.5;
      color: $text-secondary;
    }

    .alert-link {
      flex-shrink: 0;
      padding: 0;
      font-size: 11px;
      white-space: nowrap;
      cursor: pointer;
      background: none;
      border: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  // ─── Shared ──────────────────────────────────────────────
  .pos-text {
    color: $green;
  }

  .red-text {
    color: $red;
  }

  .gold-text {
    color: $gold;
  }
</style>

<style lang="scss">
  /* 日期范围挂载在 body；颜色随主题变量 */
  .pa-or-filter-popper.el-popper {
    z-index: var(--z-dropdown) !important;
    background: color-mix(in srgb, var(--default-box-color) 96%, transparent) !important;
    border: 1px solid color-mix(in srgb, var(--art-primary) 28%, transparent) !important;
    border-radius: 12px !important;
    box-shadow:
      var(--shadow-xl),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 14%, transparent),
      0 0 32px color-mix(in srgb, var(--art-primary) 15%, transparent) !important;
  }

  .pa-or-filter-popper .el-popper__arrow::before {
    background: color-mix(in srgb, var(--default-box-color) 96%, transparent) !important;
    border: 1px solid color-mix(in srgb, var(--art-primary) 25%, transparent) !important;
  }
</style>
