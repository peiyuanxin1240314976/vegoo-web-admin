<script setup lang="ts">
  import { ref, onBeforeUnmount, watch, nextTick } from 'vue'
  import * as echarts from 'echarts'
  import type { AppDetailData } from '../types'

  export type { AppDetailData, ChannelData } from '../types'

  defineOptions({ name: 'AppDetailModal' })

  // ===== Props & Emits =====
  const props = defineProps<{
    modelValue: boolean
    appData: AppDetailData | null
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  function close() {
    emit('update:modelValue', false)
  }

  // ===== Chart =====
  const chartRef = ref<HTMLDivElement | null>(null)
  let chartInstance: echarts.ECharts | null = null

  const HOURS = ['0:00', '2:00', '4:00', '6:00', '8:00', '10:00', '12:00', '14:00']

  function initChart() {
    if (!chartRef.value || !props.appData) return
    if (chartInstance) chartInstance.dispose()
    chartInstance = echarts.init(chartRef.value, null, { renderer: 'canvas' })
    chartInstance.setOption({
      backgroundColor: 'transparent',
      animation: false,
      grid: { top: 10, right: 50, bottom: 28, left: 52 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0a0f1e',
        borderColor: '#1e2d42',
        textStyle: { color: '#c8d6e8', fontSize: 12 }
      },
      xAxis: {
        type: 'category',
        data: HOURS,
        axisLine: { lineStyle: { color: '#1e2d42' } },
        axisLabel: { color: '#5a6a82', fontSize: 11 },
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: 1000,
          interval: 250,
          axisLabel: { color: '#5a6a82', fontSize: 11, formatter: (v: number) => `$${v}` },
          splitLine: { lineStyle: { color: '#1a2535', type: 'dashed' } },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        {
          type: 'value',
          min: 0,
          max: 150,
          interval: 50,
          axisLabel: { color: '#5a6a82', fontSize: 11, formatter: (v: number) => `${v}%` },
          splitLine: { show: false },
          axisLine: { show: false },
          axisTick: { show: false }
        }
      ],
      series: [
        {
          name: '消耗',
          type: 'bar',
          data: props.appData.hourlyData,
          itemStyle: { color: '#00cfc0', borderRadius: [2, 2, 0, 0] },
          barMaxWidth: 18
        },
        {
          name: 'ROI',
          type: 'line',
          yAxisIndex: 1,
          data: props.appData.hourlyRoi,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#f0b429', width: 1.5, type: 'dashed' },
          itemStyle: { color: '#f0b429' }
        }
      ]
    })
  }

  watch(
    () => [props.modelValue, props.appData],
    async ([visible]) => {
      if (visible) {
        await nextTick()
        setTimeout(initChart, 50)
      }
    }
  )

  onBeforeUnmount(() => {
    chartInstance?.dispose()
  })

  // ===== Utils =====
  function fmtMoney(v: number): string {
    return v >= 1000 ? `$${Math.round(v).toLocaleString('en-US')}` : `$${v.toFixed(2)}`
  }
</script>

<template>
  <!-- 挂到 body，避免任意祖先 transform/filter（布局缩放、入场动画等）导致 position:fixed 错位 -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="overlay" @click.self="close">
        <div class="panel">
          <!-- Header -->
          <div class="panel-header">
            <div class="header-left">
              <span class="app-icon" :style="{ background: appData?.iconBg }">
                {{ appData?.iconText }}
              </span>
              <span class="header-title">{{ appData?.name }} · 详细数据</span>
            </div>
            <button class="close-btn" @click="close">✕</button>
          </div>

          <!-- Section 1: KPI -->
          <div class="section">
            <div class="sec-label">1. KPI</div>
            <div class="kpi-row">
              <div class="kpi-cell accent-cell">
                <div class="kc-label">今日花费</div>
                <div class="kc-value accent-val">{{ fmtMoney(appData?.spend ?? 0) }}</div>
              </div>
              <div class="kpi-cell">
                <div class="kc-label">今日安装</div>
                <div class="kc-value">{{ (appData?.installs ?? 0).toLocaleString() }}</div>
              </div>
              <div class="kpi-cell">
                <div class="kc-label">实时CPI</div>
                <div class="kc-value">{{ fmtMoney(appData?.cpi ?? 0) }}</div>
              </div>
              <div class="kpi-cell">
                <div class="kc-label">首日ROI</div>
                <div class="kc-value green-val">{{ appData?.roi1d }}%</div>
              </div>
              <div class="kpi-cell">
                <div class="kc-label">3日ROI</div>
                <div class="kc-value green-val">{{ appData?.roi3d }}%</div>
              </div>
              <div class="kpi-cell">
                <div class="kc-label">预估利润</div>
                <div class="kc-value profit-val"
                  >+{{ fmtMoney(appData?.estimatedProfit ?? 0) }}</div
                >
              </div>
            </div>
            <div class="kpi-row kpi-row2">
              <div class="kpi-cell2">
                <div class="kc-label">活跃系列</div>
                <div class="kc-value2">{{ appData?.activeSeries }}个</div>
              </div>
              <div class="kpi-cell2">
                <div class="kc-label">账户余额</div>
                <div class="kc-value2">{{ fmtMoney(appData?.balance ?? 0) }}</div>
              </div>
              <div class="kpi-cell2">
                <div class="kc-label">点击率</div>
                <div class="kc-value2">{{ appData?.ctr }}%</div>
              </div>
              <div class="kpi-cell2">
                <div class="kc-label">转化率</div>
                <div class="kc-value2">{{ appData?.cvr }}%</div>
              </div>
              <div class="kpi-cell2 budget-cell">
                <div class="kc-label">预算进度</div>
                <div class="kc-value2 budget-val">{{ appData?.budgetProgress }}%</div>
              </div>
              <div class="kpi-cell2">
                <div class="kc-label">预算跑完</div>
                <div class="kc-value2">{{ appData?.budgetDaysLeft }}</div>
              </div>
            </div>
          </div>
          <!-- Section 2: Hourly Chart -->
          <div class="section">
            <div class="sec-label-row">
              <span class="sec-label">3. 今日小时消耗趋势</span>
              <span class="chart-legend"> <span class="legend-dash"></span>ROI </span>
            </div>
            <div ref="chartRef" class="detail-chart"></div>
          </div>
          <!-- Section 3: Channels -->
          <div class="section">
            <div class="sec-label">2. 各渠道数据</div>
            <div class="channels">
              <div v-for="ch in appData?.channels" :key="ch.name" class="channel-card">
                <div class="ch-header">
                  <span class="ch-dot" :style="{ background: ch.iconColor }"></span>
                  <span class="ch-name">{{ ch.name }}</span>
                </div>
                <div class="ch-stats">
                  <span class="ch-stat"
                    >花费<b>{{ fmtMoney(ch.spend) }}</b></span
                  >
                  <span class="ch-stat"
                    >CPI<b>{{ fmtMoney(ch.cpi) }}</b></span
                  >
                  <span class="ch-stat"
                    >ROI <b class="roi-green">{{ ch.roi }}%绿</b></span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  /* ===== Overlay ===== */
  .overlay {
    position: fixed;
    inset: 0;
    z-index: var(--z-modal, 1050);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(4 8 18 / 72%);
    backdrop-filter: blur(2px);
  }

  /* ===== Panel ===== */
  .panel {
    width: 580px;
    max-width: 96vw;
    overflow: hidden;
    font-family: 'PingFang SC', 'Segoe UI', system-ui, sans-serif;
    color: #c8d6e8;
    background: #0c1120;
    border: 1.5px solid #00cfc055;
    border-radius: 12px;
    box-shadow:
      0 0 60px rgb(0 207 192 / 12%),
      0 24px 60px rgb(0 0 0 / 70%);
  }

  /* ===== Header ===== */
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    background: #0e1525;
    border-bottom: 1px solid #1a2535;
  }

  .header-left {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .app-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 14px;
    border-radius: 6px;
  }

  .header-title {
    font-size: 15px;
    font-weight: 600;
    color: #e2ebf8;
    letter-spacing: 0.01em;
  }

  .close-btn {
    padding: 4px 8px;
    font-size: 14px;
    line-height: 1;
    color: #5a6a82;
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 4px;
    transition:
      color 0.15s,
      background 0.15s;
  }

  .close-btn:hover {
    color: #e2ebf8;
    background: #1a2535;
  }

  /* ===== Section ===== */
  .section {
    padding: 14px 18px;
    border-bottom: 1px solid #1a2535;
  }

  .section:last-child {
    border-bottom: none;
  }

  .sec-label {
    margin-bottom: 10px;
    font-size: 12px;
    font-weight: 500;
    color: #5a6a82;
  }

  .sec-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .chart-legend {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11px;
    color: #5a6a82;
  }

  .legend-dash {
    display: inline-block;
    width: 20px;
    height: 1.5px;
    vertical-align: middle;
    background: repeating-linear-gradient(
      90deg,
      #f0b429 0,
      #f0b429 4px,
      transparent 4px,
      transparent 7px
    );
  }

  /* ===== KPI Grid ===== */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
    margin-bottom: 6px;
  }

  .kpi-cell {
    padding: 8px 10px;
    text-align: center;
    background: #111827;
    border: 1px solid #1a2535;
    border-radius: 6px;
  }

  .accent-cell {
    background: #003d3a;
    border-color: #00cfc044;
  }

  .kc-label {
    margin-bottom: 4px;
    font-size: 10px;
    color: #5a6a82;
    white-space: nowrap;
  }

  .kc-value {
    font-size: 15px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #c8d6e8;
  }

  .accent-val {
    color: #00cfc0;
  }

  .green-val {
    color: #22c55e;
  }

  .profit-val {
    color: #22c55e;
  }

  /* Second KPI row */
  .kpi-row2 {
    margin-bottom: 0;
  }

  .kpi-cell2 {
    padding: 6px 10px;
    text-align: center;
    background: #111827;
    border: 1px solid #1a2535;
    border-radius: 6px;
  }

  .budget-cell {
    background: #2a1800;
    border-color: #f0b42944;
  }

  .kc-value2 {
    font-size: 14px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: #c8d6e8;
  }

  .budget-val {
    color: #f0b429;
  }

  /* ===== Channels ===== */
  .channels {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .channel-card {
    padding: 10px 12px;
    background: #111827;
    border: 1px solid #1a2535;
    border-radius: 7px;
  }

  .ch-header {
    display: flex;
    gap: 7px;
    align-items: center;
    margin-bottom: 8px;
  }

  .ch-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .ch-name {
    font-size: 12px;
    font-weight: 600;
    color: #a8bdd0;
  }

  .ch-stats {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .ch-stat {
    font-size: 11px;
    color: #5a6a82;
  }

  .ch-stat b {
    margin-left: 4px;
    font-weight: 600;
    color: #c8d6e8;
  }

  .roi-green {
    color: #22c55e !important;
  }

  /* ===== Detail Chart ===== */
  .detail-chart {
    width: 100%;
    height: 140px;
  }

  /* ===== Modal Transition ===== */
  .modal-enter-active,
  .modal-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
    transform: scale(0.96) translateY(-8px);
  }
</style>
