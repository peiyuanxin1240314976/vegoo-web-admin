<template>
  <div class="account-performance-page">
    <!-- 顶部：筛选 + 日期 + 导出 -->
    <div class="ap-header">
      <div class="ap-filters">
        <ElSelect v-model="source" placeholder="广告平台" class="ap-filter-select">
          <ElOption label="全部" value="" />
          <ElOption label="TikTok" value="tiktok" />
          <ElOption label="Facebook" value="facebook" />
          <ElOption label="Google" value="google" />
        </ElSelect>
        <ElSelect v-model="platform" placeholder="应用" class="ap-filter-select">
          <ElOption label="全部" value="" />
          <ElOption v-for="app in appOptions" :key="app" :label="app" :value="app" />
        </ElSelect>
        <ElSelect v-model="filterOwner" placeholder="负责人" class="ap-filter-select">
          <ElOption label="全部" value="" />
        </ElSelect>
        <ElDatePicker
          v-model="dateRange"
          type="daterange"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="ap-date-picker"
          style="width: 100px"
        />
        <ElButton type="primary" @click="onExport">导出</ElButton>
      </div>
    </div>

    <!-- 6 个 KPI 卡片 -->
    <ElRow :gutter="16" class="ap-kpi-row">
      <ElCol
        v-for="(item, index) in mock.kpi"
        :key="index"
        :xs="24"
        :sm="12"
        :md="4"
        :lg="4"
        :xl="4"
      >
        <div class="ap-kpi-card" :class="{ 'ap-kpi-card--alert': item.alert }">
          <div class="ap-kpi-label">{{ item.label }}</div>
          <div class="ap-kpi-value">{{ item.value }}</div>
          <div v-if="item.sub" class="ap-kpi-sub">{{ item.sub }}</div>
          <div v-if="item.detail" class="ap-kpi-detail">{{ item.detail }}</div>
          <div v-if="item.compare" class="ap-kpi-compare" :class="item.compareUp ? 'up' : 'down'">
            {{ item.compare }}
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- 主体：左侧表格 + 右侧图表 -->
    <ElRow :gutter="16" class="ap-body">
      <!-- 左侧：应用×平台×账户明细表（min-width:0 让列可收缩，表格内部横向滚动） -->
      <ElCol :xs="24" :md="16" :lg="17" :xl="17" class="ap-table-col">
        <ElCard class="ap-table-card" shadow="never">
          <template #header>
            <span class="ap-table-title">应用 × 平台 × 账户明细</span>
            <div class="ap-table-actions">
              <ElButton
                size="default"
                color="#13deb9"
                plain
                :dark="isDark"
                @click="toggleExpandAll"
              >
                {{ expandAll ? '收起全部' : '展开全部' }}
              </ElButton>
              <ElButton size="default" color="#13deb9" plain :dark="isDark">自定义列</ElButton>
              <ElInput
                v-model="tableSearch"
                placeholder="Q 搜索账户..."
                clearable
                class="ap-table-search"
              />
            </div>
          </template>
          <div class="ap-table-scroll">
            <ElTable
              ref="tableRef"
              :data="tableData"
              row-key="id"
              :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
              :expand-row-keys="expandedRowKeys"
              :row-style="getRowStyle"
              :cell-style="getCellStyle"
              stripe
              size="default"
              class="ap-detail-table"
            >
              <ElTableColumn label="应用 / 平台 / 账户" min-width="200">
                <template #default="{ row }">
                  <span class="ap-cell-name">
                    <ElIcon v-if="row.type === 'app'" class="ap-row-icon ap-row-icon--app">
                      <Monitor />
                    </ElIcon>
                    <ElIcon
                      v-else-if="row.type === 'platform'"
                      class="ap-row-icon ap-row-icon--platform"
                    >
                      <Iphone />
                    </ElIcon>
                    <span
                      :class="row.type === 'account' ? 'ap-cell-account' : ''"
                      :style="getNameStyle(row)"
                    >
                      {{ row.name }}
                    </span>
                  </span>
                </template>
              </ElTableColumn>
              <ElTableColumn label="广告支出" width="100" align="center">
                <template #default="{ row }">{{ formatMoney(row.spend) }}</template>
              </ElTableColumn>
              <ElTableColumn label="预算" width="90" align="center">
                <template #default="{ row }">{{ formatMoney(row.budget) }}</template>
              </ElTableColumn>
              <ElTableColumn label="使用率" width="115" align="center">
                <template #default="{ row }">
                  <div class="ap-usage-cell">
                    <ElProgress
                      :percentage="Math.min(100, row.usageRate)"
                      :color="getUsageRateColor(row.usageRate)"
                      :show-text="false"
                      :stroke-width="6"
                      class="ap-usage-bar"
                    />
                    <span class="ap-usage-value">{{ row.usageRate }}%</span>
                  </div>
                </template>
              </ElTableColumn>
              <ElTableColumn label="CPI" width="70" align="center">
                <template #default="{ row }">{{ row.cpi.toFixed(2) }}</template>
              </ElTableColumn>
              <ElTableColumn label="安装数" width="95" align="center">
                <template #default="{ row }">{{ formatNumber(row.installs) }}</template>
              </ElTableColumn>
              <ElTableColumn label="首日ROI" width="90" align="center">
                <template #default="{ row }">
                  <span :class="getRoiClass(row.roi1)">{{ row.roi1 }}%</span>
                </template>
              </ElTableColumn>
              <ElTableColumn label="3日ROI" width="80" align="center">
                <template #default="{ row }">
                  <span :class="getRoiClass(row.roi3)">{{ row.roi3 }}%</span>
                </template>
              </ElTableColumn>
              <ElTableColumn label="7日ROI" width="80" align="center">
                <template #default="{ row }">
                  <span :class="getRoiClass(row.roi7)">{{ row.roi7 }}%</span>
                </template>
              </ElTableColumn>
              <ElTableColumn label="状态" width="100" align="center">
                <template #default="{ row }">
                  <span v-if="row.status === 'normal'" class="ap-status ap-status--normal"
                    >正常</span
                  >
                  <span v-else class="ap-status ap-status--warning">{{
                    row.statusText || 'ROI偏低'
                  }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn label="操作" width="100" align="center" fixed="right">
                <template #default="{ row }">
                  <template v-if="row.type === 'account'">
                    <ElButton link type="primary" size="small">系列</ElButton>
                    <ElButton link type="primary" size="small">详情</ElButton>
                  </template>
                  <template v-else-if="row.type === 'platform'">
                    <ElButton link type="primary" size="small">系列</ElButton>
                    <ElButton link type="primary" size="small">详情</ElButton>
                  </template>
                  <template v-else>
                    <ElButton link type="primary" size="small">详情</ElButton>
                  </template>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
          <div class="ap-table-footer">{{ mock.summaryText }}</div>
        </ElCard>
      </ElCol>

      <!-- 右侧：图表与预警（宽度缩小约 1/3 与原型一致） -->
      <ElCol :xs="24" :md="8" :lg="7" :xl="7" class="ap-charts-col">
        <div class="ap-charts">
          <!-- 广告平台消耗分布 -->
          <ElCard class="ap-chart-card" shadow="never">
            <template #header>广告平台消耗分布</template>
            <div ref="channelChartRef" class="ap-chart-wrap ap-chart-donut"></div>
            <div class="ap-donut-center">{{ donutCenterText }}</div>
          </ElCard>

          <!-- 账户预算使用率分布 -->
          <ElCard class="ap-chart-card" shadow="never">
            <template #header>账户预算使用率分布</template>
            <div ref="usageChartRef" class="ap-chart-wrap ap-chart-bar"></div>
          </ElCard>

          <!-- 首日ROI趋势(7天) -->
          <ElCard class="ap-chart-card" shadow="never">
            <template #header>首日ROI趋势 (7天)</template>
            <div ref="roiTrendChartRef" class="ap-chart-wrap ap-chart-line"></div>
          </ElCard>

          <!-- 预警事项 -->
          <ElCard class="ap-chart-card ap-alert-card" shadow="never">
            <template #header>预警事项 ({{ mock.alerts.length }}项)</template>
            <ul class="ap-alert-list">
              <li v-for="a in mock.alerts" :key="a.id" class="ap-alert-item">
                <span class="ap-alert-title">{{ a.title }}</span>
                <span class="ap-alert-desc">{{ a.desc }}</span>
                <ElButton link type="primary" size="small">查看</ElButton>
              </li>
            </ul>
          </ElCard>

          <!-- 今日消耗节奏 -->
          <ElCard class="ap-chart-card" shadow="never">
            <template #header>今日消耗节奏</template>
            <div ref="paceChartRef" class="ap-chart-wrap ap-chart-pace"></div>
          </ElCard>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, watchEffect } from 'vue'
  import { storeToRefs } from 'pinia'
  import { Monitor, Iphone } from '@element-plus/icons-vue'
  import { useChart } from '@/hooks/core/useChart'
  import { useSettingStore } from '@/store/modules/setting'
  import type { AccountDetailRow } from './types'
  import { MOCK_ACCOUNT_PERFORMANCE } from './mock/data'

  defineOptions({ name: 'AccountPerformance' })

  const settingStore = useSettingStore()
  const { isDark } = storeToRefs(settingStore)

  const mock = ref(MOCK_ACCOUNT_PERFORMANCE)
  const source = ref('')
  const platform = ref('')
  const filterOwner = ref('')
  const dateRange = ref<[string, string]>([...MOCK_ACCOUNT_PERFORMANCE.dateRange])
  const tableSearch = ref('')
  const expandAll = ref(true)
  const expandedRowKeys = ref<string[]>([])
  const tableRef = ref()

  const appOptions = computed(() => {
    const rows = mock.value.tableTree
    return rows.map((r) => r.name)
  })

  const tableData = computed(() => {
    let list = mock.value.tableTree
    const kw = tableSearch.value?.trim()
    if (kw) {
      list = filterTreeByName(list, kw)
    }
    return attachAppMeta(list)
  })

  type TableRowWithMeta = AccountDetailRow & { __appId?: string }

  function attachAppMeta(rows: AccountDetailRow[], currentAppId?: string): TableRowWithMeta[] {
    return rows.map((row) => {
      const appId = row.type === 'app' ? row.id : currentAppId
      const next: TableRowWithMeta = { ...(row as TableRowWithMeta), __appId: appId }
      if (row.children?.length) {
        next.children = attachAppMeta(row.children, appId) as unknown as AccountDetailRow[]
      }
      return next
    })
  }

  /**
   * 基色调色板：背景/字体都用同一 RGB，只靠透明度区分（plain 风格且稳定）
   * 你想换色或减少到 5 个颜色，改这里即可。
   */
  const BASE_RGB_COLORS = [
    { r: 64, g: 158, b: 255 }, // 蓝
    { r: 103, g: 194, b: 58 }, // 绿
    { r: 230, g: 162, b: 60 }, // 橙
    { r: 245, g: 108, b: 108 }, // 红
    { r: 144, g: 147, b: 153 } // 灰
  ]

  /** 背景透明度（plain） */
  const ROW_BG_ALPHA_LIGHT = 0.14
  const ROW_BG_ALPHA_DARK = 0.22
  /** “应用/平台”名称字体透明度（强调） */
  const NAME_TEXT_ALPHA_LIGHT = 0.95
  const NAME_TEXT_ALPHA_DARK = 0.92

  function getRowBgAlpha() {
    return isDark.value ? ROW_BG_ALPHA_DARK : ROW_BG_ALPHA_LIGHT
  }

  function getNameTextAlpha() {
    return isDark.value ? NAME_TEXT_ALPHA_DARK : NAME_TEXT_ALPHA_LIGHT
  }

  const appRowBaseColorMap = ref<Record<string, { r: number; g: number; b: number }>>({})

  function hashStringToIndex(input: string, mod: number) {
    // djb2 hash（确定性），用于稳定分配颜色
    let h = 5381
    for (let i = 0; i < input.length; i++) {
      h = (h * 33) ^ input.charCodeAt(i)
    }
    return Math.abs(h) % mod
  }

  function rgba(c: { r: number; g: number; b: number }, a: number) {
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`
  }

  function ensureAppRowColors() {
    const next = { ...appRowBaseColorMap.value }
    const appIds = (mock.value.tableTree || []).filter((r) => r.type === 'app').map((r) => r.id)
    for (const id of appIds) {
      if (next[id]) continue
      const base = BASE_RGB_COLORS[hashStringToIndex(id, BASE_RGB_COLORS.length)]
      next[id] = base
    }
    appRowBaseColorMap.value = next
  }

  watchEffect(() => {
    ensureAppRowColors()
  })

  function getRowStyle({ row }: { row: TableRowWithMeta }) {
    if (row.type === 'account') return {}
    const appId = row.__appId
    if (!appId) return {}
    const base = appRowBaseColorMap.value[appId]
    if (!base) return {}
    return { backgroundColor: rgba(base, getRowBgAlpha()) }
  }

  const WHITE_VALUE_COLUMNS = new Set(['广告支出', '预算', '使用率', 'CPI', '安装数'])

  function getCellStyle({ row, column }: { row: TableRowWithMeta; column: { label?: string } }) {
    // stripe 的底色在 td 上，使用 cell-style 才能稳定覆盖到二级平台行
    const base = getRowStyle({ row })
    if (row.type === 'account') return base

    const label = column?.label
    if (label && WHITE_VALUE_COLUMNS.has(label)) {
      return { ...base, color: '#ffffff' }
    }
    return base
  }

  function getNameStyle(row: TableRowWithMeta) {
    if (row.type === 'account') return {}
    const appId = row.__appId
    if (!appId) return {}
    const base = appRowBaseColorMap.value[appId]
    if (!base) return {}
    return { color: rgba(base, getNameTextAlpha()), fontWeight: 600 }
  }

  watchEffect(() => {
    if (!expandAll.value) return
    expandedRowKeys.value = collectExpandableRowKeys(tableData.value)
  })

  function filterTreeByName(rows: AccountDetailRow[], keyword: string): AccountDetailRow[] {
    const lower = keyword.toLowerCase()
    return rows
      .map((row) => {
        if (row.name.toLowerCase().includes(lower)) return row
        if (row.children?.length) {
          const filtered = filterTreeByName(row.children, keyword)
          if (filtered.length) return { ...row, children: filtered }
        }
        return null
      })
      .filter(Boolean) as AccountDetailRow[]
  }

  function collectExpandableRowKeys(rows: AccountDetailRow[]): string[] {
    const keys: string[] = []
    const walk = (list: AccountDetailRow[]) => {
      for (const row of list) {
        if (row.children?.length) {
          keys.push(String(row.id))
        }
        if (row.children?.length) walk(row.children)
      }
    }
    walk(rows)
    return keys
  }

  function toggleExpandAll() {
    expandAll.value = !expandAll.value
    expandedRowKeys.value = expandAll.value ? collectExpandableRowKeys(tableData.value) : []
  }

  function formatMoney(n: number) {
    return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  function formatNumber(n: number) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  const ROI_TARGET = 85
  function getRoiClass(roi: number): string {
    if (roi >= ROI_TARGET) return 'ap-roi-green'
    return 'ap-roi-red'
  }

  /** 使用率进度条颜色：0-20 红，20-40 橙，40-60 黄，60+ 绿 */
  function getUsageRateColor(rate: number): string {
    if (rate < 20) return '#f56c6c'
    if (rate < 40) return '#e6a23c'
    if (rate < 60) return '#e6df44'
    return '#67c23a'
  }

  /** 甜甜圈图中心金额，从 KPI 近7天广告支出取 */
  const donutCenterText = computed(() => {
    const k = mock.value.kpi.find((item) => item.type === 'spend')
    return k?.value ?? '$0'
  })

  function onExport() {
    console.log('导出', dateRange.value)
  }

  // --- 广告平台消耗环形图 ---
  const channelChart = useChart()
  const channelChartRef = channelChart.chartRef
  function renderChannelChart() {
    const data = mock.value.channelSpend.map((d) => ({ name: d.name, value: d.value }))
    const isDark = channelChart.isDark.value
    /* 环形图边框需传具体颜色，canvas 不解析 CSS 变量 */
    const pieBorderColor = isDark ? '#1d1e1f' : '#fff'
    channelChart.initChart(
      {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}%',
          backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
          borderColor: isDark ? '#333' : '#ddd',
          textStyle: { color: isDark ? '#e5e7eb' : '#333' }
        },
        legend: {
          orient: 'vertical',
          right: 8,
          top: 'center',
          textStyle: { color: isDark ? '#9ca3af' : '#666', fontSize: 12 }
        },
        series: [
          {
            type: 'pie',
            radius: ['42%', '68%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: { borderColor: pieBorderColor, borderWidth: 2 },
            label: { show: false },
            data,
            color: ['#4ABEFF', '#722ed1', '#13c2c2', '#fa8c16', '#eb2f96', '#a0d911']
          }
        ]
      },
      data.length === 0
    )
  }

  // --- 预算使用率条形图（横向）---
  const usageChart = useChart()
  const usageChartRef = usageChart.chartRef
  function renderUsageChart() {
    const buckets = mock.value.budgetUsageBuckets
    const isDark = usageChart.isDark.value
    const colors = ['#f56c6c', '#e6a23c', '#e6df44', '#67c23a', '#67c23a']
    usageChart.initChart(
      {
        tooltip: { trigger: 'axis' },
        grid: { left: '55px', right: 16, top: 12, bottom: 24, containLabel: false },
        xAxis: {
          type: 'value',
          axisLabel: { color: isDark ? '#999' : '#666', fontSize: 11 },
          splitLine: { lineStyle: { color: isDark ? '#333' : '#eee' } }
        },
        yAxis: {
          type: 'category',
          data: buckets.map((b) => b.range).reverse(),
          axisLabel: { color: isDark ? '#999' : '#666', fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        series: [
          {
            type: 'bar',
            barWidth: '60%',
            data: [...buckets]
              .reverse()
              .map((b, i) => ({ value: b.count, itemStyle: { color: colors[i] } }))
          }
        ]
      },
      buckets.length === 0
    )
  }

  // --- 首日ROI趋势折线 ---
  const roiTrendChart = useChart()
  const roiTrendChartRef = roiTrendChart.chartRef
  function renderRoiTrendChart() {
    const trend = mock.value.day1RoiTrend
    const isDark = roiTrendChart.isDark.value
    roiTrendChart.initChart(
      {
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 16, top: 16, bottom: 28 },
        xAxis: {
          type: 'category',
          data: trend.map((t) => t.date),
          boundaryGap: true,
          axisLabel: { color: isDark ? '#999' : '#666', fontSize: 11 },
          axisLine: { lineStyle: { color: isDark ? '#444' : '#eee' } }
        },
        yAxis: {
          type: 'value',
          min: (v: { min: number }) => Math.max(0, v.min - 20),
          axisLabel: { color: isDark ? '#999' : '#666', fontSize: 11, formatter: '{value}%' },
          splitLine: { lineStyle: { color: isDark ? '#333' : '#eee', type: 'dashed' } }
        },
        series: [
          {
            type: 'line',
            data: trend.map((t) => t.roi),
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 2 },
            itemStyle: { color: '#67c23a' },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%',
              fontSize: 11,
              color: isDark ? '#9ca3af' : '#666'
            }
          }
        ],
        markLine: {
          silent: true,
          symbol: 'none',
          label: { show: true, formatter: '团队 ROI 85%' },
          lineStyle: { type: 'dashed', color: isDark ? '#666' : '#999' },
          data: [{ yAxis: 85 }]
        }
      },
      trend.length === 0
    )
  }

  // --- 今日消耗节奏面积图 ---
  const paceChart = useChart()
  const paceChartRef = paceChart.chartRef
  function renderPaceChart() {
    const pace = mock.value.todaySpendPace
    const isDark = paceChart.isDark.value
    paceChart.initChart(
      {
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 16, top: 16, bottom: 28 },
        xAxis: {
          type: 'category',
          data: pace.map((p) => p.time),
          axisLabel: { color: isDark ? '#999' : '#666', fontSize: 11 },
          axisLine: { lineStyle: { color: isDark ? '#444' : '#eee' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: isDark ? '#999' : '#666', fontSize: 11 },
          splitLine: { lineStyle: { color: isDark ? '#333' : '#eee' } }
        },
        series: [
          {
            type: 'line',
            data: pace.map((p) => p.value),
            smooth: true,
            areaStyle: { opacity: 0.35 },
            lineStyle: { width: 2 },
            itemStyle: { color: '#409eff' }
          }
        ]
      },
      pace.length === 0
    )
  }

  function renderAllCharts() {
    renderChannelChart()
    renderUsageChart()
    renderRoiTrendChart()
    renderPaceChart()
  }

  onMounted(() => {
    renderAllCharts()
  })

  /* 深色/浅色切换时重绘图表，保证坐标轴、图例、边框等颜色正确 */
  watch(
    () => channelChart.isDark.value,
    () => {
      renderAllCharts()
    }
  )
</script>

<style scoped lang="scss">
  .account-performance-page {
    min-width: 0; /* 参与 flex 收缩，避免小屏溢出 */
    padding-bottom: 24px;
  }

  .ap-header {
    margin-bottom: 16px;
  }

  .ap-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    max-width: 50%;

    @media (width <= 768px) {
      gap: 8px;
    }
  }

  .ap-filter-select {
    width: 150px;
    min-width: 100px;
    max-width: 100%;

    @media (width <= 768px) {
      flex: 1 1 120px;
      min-width: 0;
    }
  }

  .ap-date-picker {
    width: 200px;
    max-width: 100%;

    @media (width <= 768px) {
      width: 100%;
      min-width: 0;
    }
  }

  .ap-kpi-row {
    margin-bottom: 16px;
  }

  .ap-kpi-card {
    min-height: 100px;
    padding: 16px;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;

    .ap-kpi-label {
      margin-bottom: 6px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    .ap-kpi-value {
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .ap-kpi-sub,
    .ap-kpi-detail {
      margin-top: 4px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .ap-kpi-compare {
      margin-top: 6px;
      font-size: 12px;

      &.up {
        color: var(--el-color-success);
      }

      &.down {
        color: var(--el-color-danger);
      }
    }

    &--alert {
      background: rgb(230 162 60 / 8%);
      border-color: rgb(230 162 60 / 35%);
    }
  }

  /* 深色模式：KPI 卡片与预警卡片 */
  html.dark .ap-kpi-card {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
  }

  html.dark .ap-kpi-card--alert {
    background: rgb(230 162 60 / 12%);
    border-color: rgb(230 162 60 / 400%);
  }

  .ap-body {
    /* 桌面端固定左右布局；小屏仍上下排列 */
    flex-wrap: nowrap;
    margin-bottom: 16px;

    @media (width <= 991px) {
      flex-wrap: wrap;
    }

    /* 左侧列允许被挤压，表格在内部横向滚动，避免把右侧挤掉 */
    .ap-table-col {
      min-width: 0;
      overflow: hidden;
    }

    /* 右侧列允许收缩，避免被内容撑爆导致换行 */
    .ap-charts-col {
      flex-shrink: 1;
      min-width: 0;
    }
  }

  .ap-table-card {
    margin-bottom: 16px;
    background: var(--el-bg-color);

    :deep(.el-card__header) {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
    }

    :deep(.el-card__body) {
      padding: 12px 16px;
    }
  }

  html.dark .ap-table-card {
    border-color: var(--el-border-color);
  }

  .ap-table-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    word-break: break-word;
  }

  .ap-table-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    @media (width <= 576px) {
      width: 100%;
    }
  }

  .ap-table-search {
    width: 160px;
    min-width: 0;
    margin-left: 10px;

    @media (width <= 576px) {
      flex: 1;
      min-width: 120px;
    }
  }

  /* 表格横向滚动，小屏不撑破布局 */
  .ap-table-scroll {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    :deep(.el-table) {
      min-width: 960px;
    }
  }

  .ap-detail-table {
    --el-table-border-color: var(--el-border-color-lighter);
    --el-table-header-bg-color: var(--el-fill-color-light);
  }

  html.dark .ap-detail-table {
    --el-table-border-color: var(--el-border-color);
    --el-table-header-bg-color: var(--el-fill-color-dark);
    --el-table-header-text-color: #fff;

    /* 深色模式：表头文字/排序图标强制纯白（避免被主题变量覆盖） */
    :deep(.el-table__header-wrapper th),
    :deep(.el-table__header-wrapper th .cell),
    :deep(.el-table__header-wrapper th .sort-caret) {
      color: #fff;
    }
  }

  .ap-cell-name {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .ap-row-icon {
    flex-shrink: 0;
    font-size: 16px;
    color: var(--el-text-color-secondary);

    &.ap-row-icon--app {
      color: var(--el-color-primary);
    }

    &.ap-row-icon--platform {
      color: var(--el-text-color-regular);
    }
  }

  .ap-cell-account {
    font-family: ui-monospace, monospace;
    font-size: 12px;
  }

  .ap-usage-cell {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
  }

  .ap-usage-value {
    flex-shrink: 0;
    font-size: 13px;
  }

  .ap-usage-bar {
    flex-shrink: 0;
    width: 48px;

    :deep(.el-progress-bar) {
      width: 100%;
    }
  }

  .ap-status {
    display: inline-flex;
    align-items: center;
    font-size: 12px;

    &--normal {
      color: var(--el-color-success);

      &::before {
        margin-right: 4px;
        font-size: 10px;
        content: '●';
      }
    }

    &--warning {
      color: var(--el-color-warning);

      &::before {
        margin-right: 4px;
        font-size: 10px;
        content: '▲';
      }
    }
  }

  .ap-roi-green {
    color: var(--el-color-success);
  }

  .ap-roi-red {
    color: var(--el-color-danger);
  }

  .ap-table-footer {
    margin-top: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  /* 右侧列整体缩小约 1/3 与原型一致 */
  .ap-charts-col {
    max-width: 100%;
  }

  .ap-charts {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ap-chart-card {
    margin-bottom: 0;
    background: var(--el-bg-color);

    :deep(.el-card__header) {
      padding: 8px 12px;
      font-size: 13px;
      color: var(--el-text-color-primary);
    }

    :deep(.el-card__body) {
      position: relative;
      padding: 8px 12px;
      background: var(--el-bg-color);
    }
  }

  html.dark .ap-chart-card {
    border-color: var(--el-border-color);
  }

  .ap-chart-wrap {
    height: 133px;
    min-height: 107px;

    &.ap-chart-donut {
      height: 147px;
      min-height: 133px;
    }

    &.ap-chart-bar {
      height: 120px;
      min-height: 107px;
    }

    &.ap-chart-line {
      height: 133px;
      min-height: 120px;
    }

    &.ap-chart-pace {
      height: 107px;
      min-height: 93px;
    }

    @media (width <= 768px) {
      height: 200px;
      min-height: 180px;
    }
  }

  .ap-donut-center {
    position: absolute;
    top: 50%;
    left: 35%;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  .ap-alert-card .ap-alert-list {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ap-alert-item {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: flex-start;
    padding: 6px 0;
    font-size: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    .ap-alert-title {
      flex-shrink: 0;
      font-weight: 500;
      color: var(--el-color-warning);
    }

    .ap-alert-desc {
      flex: 1;
      min-width: 0;
      color: var(--el-text-color-regular);
    }
  }

  html.dark .ap-alert-item {
    border-bottom-color: var(--el-border-color);
  }
</style>
