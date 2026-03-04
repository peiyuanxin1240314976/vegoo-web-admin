<template>
  <div ref="rootRef" class="big-screen-root art-full-height">
    <div
      class="big-screen-wrap"
      :style="{
        width: `${designWidth}px`,
        minHeight: `${designHeight}px`,
        height: 'auto',
        transform: `scale(${scale})`,
        transformOrigin: '0 0'
      }"
    >
      <!-- 顶部标题 -->
      <header class="big-screen-header">
        <h1 class="big-screen-title">投放分析</h1>
        <span class="big-screen-time">{{ overview.dataTime || '--' }}</span>
      </header>

      <!-- KPI 卡片：今日已花费 / 今日预估ROI / 今日预估利润 / 异常广告系列 -->
      <section class="big-screen-kpi">
        <template v-for="(card, index) in kpiCards" :key="index">
          <!-- 1. 今日已花费 -->
          <div v-if="card.type === 'spend'" class="kpi-card kpi-card--spend">
            <div class="kpi-card-head">
              <span class="kpi-card-title">{{ card.title }}</span>
              <span class="kpi-card-status kpi-card-status--normal">
                <span class="kpi-card-status-dot"></span>
                {{ card.statusText }}
              </span>
            </div>
            <div class="kpi-card-value kpi-card-value--green">{{ formatCurrency(card.value) }}</div>
            <div class="kpi-card-progress">
              <div
                class="kpi-card-progress-bar"
                :style="{ width: card.budgetPercent * 100 + '%' }"
              ></div>
            </div>
            <div class="kpi-card-budget">
              <span class="kpi-card-budget-percent"
                >{{ Math.round(card.budgetPercent * 100) }}%</span
              >
              {{ card.budgetText }}
            </div>
            <div class="kpi-card-foot">
              <span class="kpi-card-trend kpi-card-trend--up"
                >↑ {{ card.trendPercent > 0 ? '+' : '' }}{{ card.trendPercent }}% VS
                {{ card.trendVs }}</span
              >
            </div>
          </div>
          <!-- 2. 今日预估ROI -->
          <div v-else-if="card.type === 'roi'" class="kpi-card kpi-card--roi">
            <div class="kpi-card-head">
              <span class="kpi-card-title">{{ card.title }}</span>
              <span class="kpi-card-status kpi-card-status--met">
                <span class="kpi-card-status-dot"></span>
                {{ card.statusText }}
              </span>
            </div>
            <div class="kpi-card-value kpi-card-value--orange">{{ card.value }}%</div>
            <div class="kpi-card-target">
              <div class="kpi-card-target-line">
                <span
                  class="kpi-card-target-dot"
                  :style="{
                    left: Math.min((card.value / 100 / (card.target || 1)) * 100, 100) + '%'
                  }"
                ></span>
              </div>
              <span class="kpi-card-target-text">{{ card.targetText }}</span>
            </div>
            <div class="kpi-card-asof">截止到 {{ overview.dataTime || '--' }}</div>
            <div class="kpi-card-foot">
              <span class="kpi-card-trend kpi-card-trend--up"
                >↑ {{ card.trendPercent > 0 ? '+' : '' }}{{ card.trendPercent }}% VS
                {{ card.trendVs }}</span
              >
            </div>
          </div>
          <!-- 3. 今日预估利润 -->
          <div v-else-if="card.type === 'profit'" class="kpi-card kpi-card--profit">
            <div class="kpi-card-head">
              <span class="kpi-card-title">{{ card.title }}</span>
              <span class="kpi-card-trend-label kpi-card-trend-label--up"
                >↑ {{ card.trendLabel }}</span
              >
            </div>
            <div
              class="kpi-card-value"
              :class="card.value >= 0 ? 'kpi-card-value--green' : 'kpi-card-value--red'"
              >{{ formatCurrency(card.value) }}</div
            >
            <div class="kpi-card-asof">截止到 {{ overview.dataTime || '--' }}</div>
            <div class="kpi-card-foot">
              <span
                class="kpi-card-trend"
                :class="card.trendPercent >= 0 ? 'kpi-card-trend--up' : 'kpi-card-trend--down'"
              >
                {{ card.trendPercent >= 0 ? '↑' : '↓' }} {{ card.trendPercent >= 0 ? '+' : ''
                }}{{ card.trendPercent }}% VS {{ card.trendVs }}
              </span>
            </div>
          </div>
          <!-- 4. 异常广告系列 -->
          <div v-else-if="card.type === 'abnormal'" class="kpi-card kpi-card--abnormal">
            <div class="kpi-card-head">
              <span class="kpi-card-title">{{ card.title }}</span>
              <button type="button" class="kpi-card-view-btn">
                <span class="kpi-card-view-icon">🔍</span>
                {{ card.viewButtonText }}
              </button>
            </div>
            <div class="kpi-card-value kpi-card-value--red">{{ card.value }}</div>
            <div class="kpi-card-asof">截止到 {{ overview.dataTime || '--' }}</div>
            <div class="kpi-card-foot">
              <span class="kpi-card-trend kpi-card-trend--up"
                >↑ +{{ card.trendPercent }}% VS {{ card.trendVs }}</span
              >
            </div>
          </div>
        </template>
      </section>

      <!-- 上期总结、近7天ROI趋势、我负责的广告表现(上期) -->
      <section class="big-screen-three-panels">
        <!-- 左：上期总结 -->
        <div class="three-panel three-panel--summary">
          <div class="three-panel-head">
            <span class="three-panel-title">上期总结</span>
            <button type="button" class="three-panel-more">查看更多</button>
          </div>
          <div class="summary-list">
            <div class="summary-row">
              <span class="summary-label">上期花费</span>
              <span class="summary-value">{{ formatCurrency(lastPeriodSummary.spend) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">上期ROI</span>
              <span class="summary-value">{{ lastPeriodSummary.roi }}%</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">上期预估利润</span>
              <span class="summary-value">{{ formatCurrency(lastPeriodSummary.profit) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">正常广告系列</span>
              <span class="summary-value">{{ lastPeriodSummary.normalCampaigns }}</span>
            </div>
          </div>
        </div>
        <!-- 中：近7天ROI趋势 -->
        <div class="three-panel three-panel--roi-trend">
          <div class="three-panel-title">近7天ROI趋势</div>
          <div ref="roiTrendRef" class="three-panel-chart"></div>
        </div>
        <!-- 右：我负责的广告表现(上期) -->
        <div class="three-panel three-panel--ad-performance">
          <div class="three-panel-head">
            <span class="three-panel-title">我负责的广告表现(上期)</span>
            <span class="three-panel-target-label">目标/Target</span>
          </div>
          <div class="ad-performance-list">
            <div v-for="(row, idx) in myAdPerformance" :key="idx" class="ad-performance-row">
              <span class="ad-performance-label">{{ row.label }}</span>
              <div class="ad-performance-bar-wrap">
                <div
                  class="ad-performance-bar"
                  :style="{ width: Math.min(row.percent, 120) + '%' }"
                >
                  <span class="ad-performance-value">{{ formatCurrency(row.value) }}</span>
                </div>
                <div
                  class="ad-performance-target-line"
                  :style="{ left: (100 / 120) * 100 + '%' }"
                  title="100%"
                ></div>
              </div>
              <span class="ad-performance-percent">{{ row.percent }}%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 我负责的广告系列列表 -->
      <section class="big-screen-campaigns">
        <div class="campaigns-head">
          <div class="campaigns-head-left">
            <h2 class="campaigns-title">我负责的广告系列 ({{ campaignTotal }}个)</h2>
            <ElSelect
              v-model="filterApp"
              class="campaigns-filter-app"
              placeholder="所有应用"
              clearable
            >
              <ElOption label="所有应用" value="" />
              <ElOption v-for="app in appOptions" :key="app" :label="app" :value="app" />
            </ElSelect>
            <div class="campaigns-filter-tabs">
              <span class="filter-tabs-label">渠道</span>
              <button
                v-for="ch in channelOptions"
                :key="ch.value"
                type="button"
                class="filter-tab"
                :class="{ 'is-active': filterChannel === ch.value }"
                @click="filterChannel = ch.value"
              >
                {{ ch.label }}
              </button>
            </div>
            <div class="campaigns-filter-tabs">
              <span class="filter-tabs-label">状态</span>
              <button
                v-for="st in statusOptions"
                :key="st.value"
                type="button"
                class="filter-tab"
                :class="{ 'is-active': filterStatus === st.value }"
                @click="filterStatus = st.value"
              >
                {{ st.label }}
              </button>
            </div>
          </div>
          <ElInput
            v-model="searchKeyword"
            class="campaigns-search"
            placeholder="搜索广告系列..."
            clearable
            :prefix-icon="Search"
          />
        </div>
        <ElTable
          :data="paginatedCampaigns"
          class="campaigns-table"
          stripe
          :header-cell-style="tableHeaderStyle"
        >
          <ElTableColumn label="应用名称/App" min-width="120">
            <template #default="{ row }">
              <div class="cell-app">
                <span class="cell-app-icon">{{ row.appName.charAt(0) }}</span>
                <span>{{ row.appName }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            prop="campaignName"
            label="广告系列"
            min-width="200"
            show-overflow-tooltip
          />
          <ElTableColumn prop="region" label="区域/国家" width="100" />
          <ElTableColumn prop="channel" label="渠道/Channel" width="120" />
          <ElTableColumn label="当前支出/Cost" width="120" sortable prop="cost">
            <template #default="{ row }">
              <span :class="{ 'cost-highlight': row.costHighlight }">{{
                formatCurrency(row.cost)
              }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="安装数量/Installs" width="120">
            <template #default="{ row }">{{ row.installs.toLocaleString() }}</template>
          </ElTableColumn>
          <ElTableColumn label="CPI" width="90">
            <template #default="{ row }">{{ formatCurrency(row.cpi) }}</template>
          </ElTableColumn>
          <ElTableColumn label="当前ROI" width="100">
            <template #default="{ row }">
              <span class="roi-cell" :class="row.roiUp ? 'roi-up' : 'roi-down'">
                {{ row.roiUp ? '↗' : '↓' }} {{ row.roi.toFixed(2) }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="状态/Status" width="120">
            <template #default="{ row }">
              <span class="status-cell" :class="`status--${row.statusType}`">
                <span class="status-dot"></span>
                {{ row.status }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作/Actions" width="160" fixed="right">
            <template #default="{ row }">
              <ElButton
                :type="row.statusType === 'lowRoi' ? 'danger' : 'primary'"
                size="small"
                @click="onPause(row)"
              >
                暂停
              </ElButton>
              <ElButton type="danger" size="small" @click="onDetail(row)">详情</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <div class="campaigns-pagination">
          <ElPagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="filteredCampaigns.length"
            layout="prev, pager, next, jumper, sizes"
            small
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import { type EChartsOption } from '@/plugins/echarts'
  import {
    MOCK_OVERVIEW,
    MOCK_LAST_PERIOD_SUMMARY,
    MOCK_ROI_TREND_7_DAYS,
    MOCK_MY_AD_PERFORMANCE,
    MOCK_CAMPAIGN_LIST
  } from './mock'
  import type { KpiCardItem } from '@/types/bigScreen'
  import type { CampaignRow } from './mock'
  import { Search } from '@element-plus/icons-vue'
  import { storeToRefs } from 'pinia'
  import { useSettingStore } from '@/store/modules/setting'

  defineOptions({ name: 'BigScreen' })

  const designWidth = 1920
  const designHeight = 1080

  const rootRef = ref<HTMLElement>()
  const scale = ref(1)

  const updateScale = () => {
    const el = rootRef.value
    if (!el) return
    const w = el.clientWidth
    if (w <= 0) return
    // 以宽度撑满 main 主体，高度超出时由 big-screen-root 的 overflow:auto 滚动
    scale.value = w / designWidth
  }

  const overview = ref(MOCK_OVERVIEW)

  const kpiCards = computed<KpiCardItem[]>(() => overview.value.kpiCards ?? [])

  const lastPeriodSummary = ref(MOCK_LAST_PERIOD_SUMMARY)
  const roiTrend7Days = ref(MOCK_ROI_TREND_7_DAYS)
  const myAdPerformance = ref(MOCK_MY_AD_PERFORMANCE)

  const formatCurrency = (n: number) => {
    const sign = n >= 0 ? '' : '-'
    return (
      sign +
      '$' +
      Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    )
  }

  const roiTrendRef = ref<HTMLElement>()
  const chartRoiTrend = useChart()

  const { isDark } = storeToRefs(useSettingStore())

  const filterApp = ref('')
  const filterChannel = ref('')
  const filterStatus = ref('')
  const searchKeyword = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)

  const channelOptions = [
    { label: '全部', value: '' },
    { label: 'Google', value: 'Google' },
    { label: 'Facebook', value: 'Facebook' },
    { label: 'TikTok', value: 'TikTok' }
  ]
  const statusOptions = [
    { label: '全部', value: '' },
    { label: '正常', value: 'active' },
    { label: '暂停', value: 'paused' },
    { label: '完成', value: 'done' }
  ]

  const campaignList = ref<CampaignRow[]>(MOCK_CAMPAIGN_LIST)
  const appOptions = computed(() => {
    const set = new Set(campaignList.value.map((r) => r.appName))
    return Array.from(set)
  })

  const filteredCampaigns = computed(() => {
    let list = campaignList.value
    if (filterApp.value) list = list.filter((r) => r.appName === filterApp.value)
    if (filterChannel.value) list = list.filter((r) => r.channel.includes(filterChannel.value))
    if (filterStatus.value) list = list.filter((r) => r.statusType === filterStatus.value)
    if (searchKeyword.value) {
      const kw = searchKeyword.value.trim().toLowerCase()
      list = list.filter(
        (r) => r.campaignName.toLowerCase().includes(kw) || r.appName.toLowerCase().includes(kw)
      )
    }
    return list
  })

  const campaignTotal = computed(() => filteredCampaigns.value.length)

  const paginatedCampaigns = computed(() => {
    const list = filteredCampaigns.value
    const start = (currentPage.value - 1) * pageSize.value
    return list.slice(start, start + pageSize.value)
  })

  const tableHeaderStyle = () => ({
    background: 'var(--big-screen-table-header-bg)',
    color: 'var(--big-screen-table-header-color)'
  })

  function onPause(row: CampaignRow) {
    console.log('Pause', row.id)
  }
  function onDetail(row: CampaignRow) {
    console.log('Detail', row.id)
  }

  function buildRoiTrendOption(): EChartsOption {
    const data = roiTrend7Days.value
    const dark = isDark.value
    const axisColor = dark ? '#8b9dc3' : '#606266'
    const lineColor = '#409eff'
    return {
      grid: { left: 48, right: 24, top: 24, bottom: 28 },
      xAxis: {
        type: 'category',
        data: [1, 2, 3, 4, 5, 6, 7],
        axisLine: { lineStyle: { color: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' } },
        axisLabel: { color: axisColor, fontSize: 12 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        interval: 20,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' } },
        axisLabel: { color: axisColor, formatter: '{value}%' }
      },
      series: [
        {
          type: 'line',
          data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: lineColor, width: 2 },
          itemStyle: { color: lineColor },
          areaStyle: { color: 'rgba(64, 158, 255, 0.15)' },
          label: { show: true, position: 'top', color: axisColor, formatter: '{c}%' }
        }
      ]
    }
  }

  watch(isDark, () => {
    if (chartRoiTrend.chartRef?.value) {
      chartRoiTrend.updateChart?.(buildRoiTrendOption())
    }
  })

  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    updateScale()
    if (rootRef.value) {
      resizeObserver = new ResizeObserver(() => updateScale())
      resizeObserver.observe(rootRef.value)
    }
    window.addEventListener('resize', updateScale)

    nextTick(() => {
      if (roiTrendRef.value) {
        chartRoiTrend.chartRef!.value = roiTrendRef.value
        chartRoiTrend.initChart(buildRoiTrendOption())
      }
    })
  })

  onUnmounted(() => {
    if (resizeObserver && rootRef.value) {
      resizeObserver.unobserve(rootRef.value)
      resizeObserver = null
    }
    window.removeEventListener('resize', updateScale)
    chartRoiTrend.destroyChart?.()
  })
</script>

<style lang="scss" scoped>
  /* 浅色模式变量（默认） */
  .big-screen-root {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: var(--art-full-height, calc(100vh - 120px));
    overflow: auto;
    background: var(--big-screen-bg);

    --big-screen-bg: #f0f2f5;
    --big-screen-wrap-bg: #fff;
    --big-screen-border: rgb(0 0 0 / 8%);
    --big-screen-text-primary: #1d1e1f;
    --big-screen-text-secondary: #606266;
    --big-screen-panel-bg: #fff;
    --big-screen-table-header-bg: #409eff;
    --big-screen-table-header-color: #fff;
  }

  /* 深色模式变量（跟随系统 html.dark） */
  html.dark .big-screen-root {
    --big-screen-bg: #0a1628;
    --big-screen-wrap-bg: linear-gradient(180deg, #0d1b2a 0%, #0a1628 100%);
    --big-screen-border: rgb(255 255 255 / 8%);
    --big-screen-text-primary: #e8edf5;
    --big-screen-text-secondary: #8b9dc3;
    --big-screen-panel-bg: rgb(255 255 255 / 3%);
    --big-screen-table-header-bg: #1e3a5f;
    --big-screen-table-header-color: #e8edf5;
  }

  .big-screen-wrap {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    padding: 24px 32px;
    background: var(--big-screen-wrap-bg);
  }

  .big-screen-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    margin-bottom: 28px;
    border-bottom: 1px solid var(--big-screen-border);
  }

  .big-screen-title {
    margin: 0;
    font-size: 32px;
    font-weight: 600;
    color: var(--big-screen-text-primary);
    letter-spacing: 2px;
  }

  .big-screen-time {
    font-size: 16px;
    color: var(--big-screen-text-secondary);
  }

  .big-screen-kpi {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 28px;
  }

  .kpi-card {
    display: flex;
    flex-direction: column;
    min-height: 160px;
    padding: 20px 24px;
    border-radius: 12px;
  }

  .kpi-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .kpi-card-title {
    font-size: 14px;
    color: var(--big-screen-text-primary);
  }

  .kpi-card-status {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    color: rgb(255 255 255 / 90%);

    .kpi-card-status-dot {
      width: 8px;
      height: 8px;
      background: currentcolor;
      border-radius: 50%;
    }

    &.kpi-card-status--normal {
      color: #67c23a;
    }

    &.kpi-card-status--met {
      color: #e6a23c;
    }
  }

  .kpi-card-value {
    margin-bottom: 8px;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;

    &.kpi-card-value--green {
      color: #67c23a;
    }

    &.kpi-card-value--orange {
      color: #e6a23c;
    }

    &.kpi-card-value--red {
      color: #f56c6c;
    }
  }

  .kpi-card-progress {
    height: 8px;
    margin-bottom: 6px;
    overflow: hidden;
    background: rgb(255 255 255 / 15%);
    border-radius: 4px;
  }

  .kpi-card-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #67c23a 0%, #e6a23c 100%);
    border-radius: 4px;
    transition: width 0.3s;
  }

  .kpi-card-budget {
    margin-bottom: 8px;
    font-size: 12px;
    color: rgb(255 255 255 / 75%);

    .kpi-card-budget-percent {
      font-weight: 600;
      color: #409eff;
    }
  }

  .kpi-card-target {
    margin-bottom: 6px;
  }

  .kpi-card-target-line {
    position: relative;
    height: 4px;
    margin-bottom: 6px;
    border-bottom: 2px dashed rgb(255 255 255 / 40%);
  }

  .kpi-card-target-dot {
    position: absolute;
    top: 50%;
    width: 12px;
    height: 12px;
    background: #e6a23c;
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgb(0 0 0 / 20%);
    transform: translate(-50%, -50%);
  }

  .kpi-card-target-text {
    font-size: 12px;
    color: rgb(255 255 255 / 75%);
  }

  .kpi-card-asof {
    margin-bottom: 8px;
    font-size: 12px;
    color: rgb(255 255 255 / 55%);
  }

  .kpi-card-trend-label {
    font-size: 13px;
    font-weight: 500;

    &.kpi-card-trend-label--up {
      color: #409eff;
    }
  }

  .kpi-card-view-btn {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 6px 14px;
    font-size: 13px;
    color: #fff;
    cursor: pointer;
    background: rgb(245 108 108 / 90%);
    border: none;
    border-radius: 20px;

    .kpi-card-view-icon {
      font-size: 12px;
    }

    &:hover {
      background: #f56c6c;
    }
  }

  .kpi-card-foot {
    padding-top: 8px;
    margin-top: auto;
  }

  .kpi-card-trend {
    font-size: 12px;

    &.kpi-card-trend--up {
      color: #67c23a;
    }

    &.kpi-card-trend--down {
      color: #f56c6c;
    }
  }

  /* 卡片主题：绿 / 橙 / 蓝 / 红 */
  .kpi-card--spend {
    background: linear-gradient(135deg, rgb(30 80 60 / 60%) 0%, rgb(20 50 40 / 80%) 100%);
    border: 1px solid rgb(103 194 58 / 30%);
  }

  .kpi-card--roi {
    background: linear-gradient(135deg, rgb(80 55 30 / 60%) 0%, rgb(50 35 20 / 80%) 100%);
    border: 1px solid rgb(230 162 60 / 35%);
  }

  .kpi-card--profit {
    background: linear-gradient(135deg, rgb(30 50 80 / 60%) 0%, rgb(20 35 55 / 80%) 100%);
    border: 1px solid rgb(64 158 255 / 30%);
  }

  .kpi-card--abnormal {
    background: linear-gradient(135deg, rgb(80 35 35 / 60%) 0%, rgb(50 25 25 / 80%) 100%);
    border: 1px solid rgb(245 108 108 / 40%);
  }

  /* 三块：上期总结、近7天ROI趋势、我负责的广告表现 */
  .big-screen-three-panels {
    display: grid;
    grid-template-columns: 1fr 1.2fr 1.2fr;
    gap: 20px;
    min-height: 280px;
    margin-bottom: 28px;
  }

  .three-panel {
    display: flex;
    flex-direction: column;
    padding: 20px 24px;
    overflow: hidden;
    background: var(--big-screen-panel-bg);
    border: 1px solid var(--big-screen-border);
    border-radius: 12px;
  }

  .three-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .three-panel-title {
    flex-shrink: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--big-screen-text-primary);
  }

  .three-panel-more {
    padding: 4px 12px;
    font-size: 12px;
    color: #409eff;
    cursor: pointer;
    background: transparent;
    border: 1px solid rgb(64 158 255 / 50%);
    border-radius: 6px;

    &:hover {
      background: rgb(64 158 255 / 15%);
    }
  }

  .three-panel-target-label {
    font-size: 12px;
    color: var(--big-screen-text-secondary);
  }

  .three-panel-chart {
    flex: 1;
    min-height: 200px;
  }

  .summary-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .summary-label {
      font-size: 14px;
      color: var(--big-screen-text-secondary);
    }

    .summary-value {
      font-size: 15px;
      font-weight: 600;
      color: var(--big-screen-text-primary);
    }
  }

  .ad-performance-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ad-performance-row {
    display: flex;
    gap: 12px;
    align-items: center;
    font-size: 13px;
  }

  .ad-performance-label {
    flex: 0 0 180px;
    overflow: hidden;
    color: var(--big-screen-text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ad-performance-bar-wrap {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 28px;
    overflow: hidden;
    background: rgb(255 255 255 / 6%);
    border-radius: 6px;
  }

  .ad-performance-bar {
    display: flex;
    align-items: center;
    min-width: 0;
    height: 100%;
    padding-left: 10px;
    background: linear-gradient(90deg, #67c23a 0%, #e6a23c 100%);
    border-radius: 6px;
    transition: width 0.3s;
  }

  .ad-performance-value {
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 0 1px rgb(0 0 0 / 50%);
  }

  .ad-performance-target-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0;
    pointer-events: none;
    border-left: 2px dashed rgb(255 255 255 / 50%);
    transform: translateX(-1px);
  }

  .ad-performance-percent {
    flex: 0 0 44px;
    font-weight: 600;
    color: var(--big-screen-text-primary);
    text-align: right;
  }

  /* 我负责的广告系列列表 */
  .big-screen-campaigns {
    padding: 20px 24px;
    margin-bottom: 24px;
    background: var(--big-screen-panel-bg);
    border: 1px solid var(--big-screen-border);
    border-radius: 12px;
  }

  .campaigns-head {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .campaigns-head-left {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
  }

  .campaigns-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--big-screen-text-primary);
  }

  .campaigns-filter-app {
    width: 140px;
  }

  .campaigns-filter-tabs {
    display: inline-flex;
    gap: 8px;
    align-items: center;

    .filter-tabs-label {
      font-size: 13px;
      color: var(--big-screen-text-secondary);
    }
  }

  .filter-tab {
    padding: 6px 14px;
    font-size: 13px;
    color: var(--big-screen-text-secondary);
    cursor: pointer;
    background: var(--big-screen-panel-bg);
    border: 1px solid var(--big-screen-border);
    border-radius: 6px;

    &.is-active {
      color: #fff;
      background: var(--el-color-primary);
      border-color: var(--el-color-primary);
    }
  }

  .campaigns-search {
    width: 220px;
  }

  .campaigns-table {
    margin-bottom: 16px;

    :deep(.el-table__header th) {
      color: var(--big-screen-table-header-color) !important;
      background: var(--big-screen-table-header-bg) !important;
    }

    :deep(.cost-highlight) {
      padding: 2px 6px;
      background: rgb(230 162 60 / 25%);
      border-radius: 4px;
    }

    :deep(.roi-up) {
      color: var(--el-color-success);
    }

    :deep(.roi-down) {
      color: var(--el-color-danger);
    }
  }

  .cell-app {
    display: flex;
    gap: 8px;
    align-items: center;

    .cell-app-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      background: var(--el-color-primary);
      border-radius: 6px;
    }
  }

  .status-cell {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;

    .status-dot {
      width: 8px;
      height: 8px;
      background: currentcolor;
      border-radius: 50%;
    }

    &.status--active {
      color: var(--el-color-success);
    }

    &.status--lowRoi {
      color: var(--el-color-danger);
    }

    &.status--overBudget {
      color: var(--el-color-warning);
    }
  }

  .campaigns-pagination {
    display: flex;
    justify-content: flex-end;
  }
</style>
