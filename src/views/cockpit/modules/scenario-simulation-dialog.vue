<template>
  <ElDialog
    :model-value="modelValue"
    title="情景模拟分析"
    width="1000px"
    class="scenario-simulation-dialog"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    :z-index="SIMULATION_DIALOG_Z_INDEX"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="simulation-content">
      <!-- 左侧：调整变量 -->
      <div class="panel-left">
        <div class="panel-title">调整变量</div>
        <div class="slider-list">
          <div class="slider-item">
            <div class="slider-label">
              <span>Google Ads CPI 变化</span>
              <span
                >CPI: {{ formatNum(baseValues.googleCpi) }}→{{
                  formatNum(derivedValues.googleCpi)
                }}</span
              >
            </div>
            <ElSlider
              v-model="sliders.googleCpi"
              :min="-20"
              :max="20"
              :step="1"
              :marks="sliderMarks"
              @input="onSliderChange"
            />
          </div>
          <div class="slider-item">
            <div class="slider-label">
              <span>Meta Ads 预算调整</span>
              <span
                >预算: {{ formatBudget(baseValues.metaBudget) }}→{{
                  formatBudget(derivedValues.metaBudget)
                }}</span
              >
            </div>
            <ElSlider
              v-model="sliders.metaBudget"
              :min="-20"
              :max="20"
              :step="1"
              :marks="sliderMarks"
              @input="onSliderChange"
            />
          </div>
          <div class="slider-item">
            <div class="slider-label">
              <span>Admob eCPM 预测</span>
              <span
                >eCPM: {{ formatNum(baseValues.admobEcpm) }}→{{
                  formatNum(derivedValues.admobEcpm)
                }}</span
              >
            </div>
            <ElSlider
              v-model="sliders.admobEcpm"
              :min="-20"
              :max="20"
              :step="1"
              :marks="sliderMarks"
              @input="onSliderChange"
            />
          </div>
          <div class="slider-item">
            <div class="slider-label"
              ><span>用户留存率变化</span
              ><span>留存率: {{ baseValues.retention }}%→{{ derivedValues.retention }}%</span></div
            >
            <ElSlider
              v-model="sliders.retention"
              :min="-20"
              :max="20"
              :step="1"
              :marks="sliderMarks"
              @input="onSliderChange"
            />
          </div>
        </div>
        <div class="panel-actions">
          <ElButton @click="handleReset">重置</ElButton>
          <ElButton type="primary" @click="handleApply">应用模拟</ElButton>
        </div>
      </div>

      <!-- 右侧：预测影响（固定四项：月末总收入/总成本/ROI/利润，数据来自接口 predictInfluence） -->
      <div class="panel-right">
        <div class="panel-title">预测影响</div>
        <div class="impact-list-wrap" v-loading="simulationLoading">
          <template v-if="impactRows.length">
            <div class="impact-list-header">
              <span class="impact-col-metric">指标</span>
              <span class="impact-col-value">当前预测</span>
              <span class="impact-col-value">模拟结果</span>
              <span class="impact-col-change">变化</span>
            </div>
            <div v-for="row in impactRows" :key="row.metric" class="impact-row">
              <span class="impact-col-metric">{{ row.metric }}</span>
              <span class="impact-col-value">{{ row.current }}</span>
              <span class="impact-col-value">{{ row.simulated }}</span>
              <span :class="['impact-col-change', row.changeClass]">
                {{ row.changeText }} {{ row.change }}
              </span>
            </div>
          </template>
          <div v-else class="impact-empty">暂无数据，请点击「应用模拟」获取结果</div>
        </div>
        <div class="chart-title">收入与成本趋势对比</div>
        <div ref="chartRef" class="trend-chart" />
        <ElAlert
          v-if="simulationWarning"
          type="warning"
          :closable="false"
          show-icon
          class="simulation-warning"
        >
          {{ simulationWarning }}
        </ElAlert>
      </div>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from 'echarts'
  import { fetchAppSimulation } from '../api/cockpit'
  import type {
    CockpitAppSimulationData,
    CockpitAppSimulationPredictInfluence,
    CockpitAppSimulationInfluenceItem
  } from '../types'

  defineOptions({ name: 'ScenarioSimulationDialog' })

  /** 高于 `.el-full-screen`（2300），否则驾驶舱全屏时弹窗在页面下层不可见 */
  const SIMULATION_DIALOG_Z_INDEX = 2410

  const props = defineProps<{ modelValue: boolean }>()
  const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

  const sliderMarks = { 0: '0', '-20': '-20%', 20: '+20%' }

  const baseValues = {
    googleCpi: 2.38,
    metaBudget: 45,
    admobEcpm: 1.2,
    retention: 35
  }

  const sliders = ref({
    googleCpi: 0,
    metaBudget: 0,
    admobEcpm: 0,
    retention: 0
  })

  const simulationData = ref<CockpitAppSimulationData | null>(null)
  const simulationLoading = ref(false)

  const applyPercent = (val: number, pct: number) => val * (1 + pct / 100)

  const derivedValues = computed(() => ({
    googleCpi: applyPercent(baseValues.googleCpi, sliders.value.googleCpi),
    metaBudget: applyPercent(baseValues.metaBudget, sliders.value.metaBudget),
    admobEcpm: applyPercent(baseValues.admobEcpm, sliders.value.admobEcpm),
    retention: Math.round(applyPercent(baseValues.retention, sliders.value.retention))
  }))

  function formatNum(n: number) {
    return n.toFixed(2)
  }

  function formatBudget(k: number) {
    return formatNum(k) + 'K'
  }

  /** 金额格式：大于等于 1e6 显示 $X.XM，否则 $X.XK */
  function formatMoney(v: number): string {
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M'
    return '$' + (v / 1e3).toFixed(1) + 'K'
  }

  /** ROI 格式：X.XXx */
  function formatRoi(v: number): string {
    return Number(v).toFixed(2) + 'x'
  }

  /** 根据 predict/result 计算变化百分比并返回展示用箭头与样式（成本：正为负面；收入/利润/ROI：正为正面） */
  function getChangeDisplay(
    item: CockpitAppSimulationInfluenceItem,
    isCost: boolean
  ): { change: string; changeText: string; changeClass: string } {
    const { predict, result } = item
    const pct = predict !== 0 ? ((result - predict) / Math.abs(predict)) * 100 : 0
    const sign = pct >= 0 ? '+' : ''
    const change = `${sign}${pct.toFixed(1)}%`
    const changeText = pct >= 0 ? '▲' : '▼'
    const positiveGood = !isCost
    const isGood = (pct > 0 && positiveGood) || (pct < 0 && !positiveGood)
    const changeClass = isGood ? 'change-up' : 'change-down'
    return { change, changeText, changeClass }
  }

  function onSliderChange() {
    // 仅前端滑块联动，需点击「应用模拟」才请求接口
  }

  function handleReset() {
    sliders.value = { googleCpi: 0, metaBudget: 0, admobEcpm: 0, retention: 0 }
  }

  async function handleApply() {
    simulationLoading.value = true
    try {
      // request 层已返回接口的 data 字段，直接使用
      const data = await fetchAppSimulation({
        adsChange: sliders.value.metaBudget,
        cplChange: sliders.value.googleCpi,
        eCpmChange: sliders.value.admobEcpm,
        retentionChange: sliders.value.retention
      })
      if (data?.predictInfluence != null) {
        simulationData.value = data
      }
    } finally {
      simulationLoading.value = false
    }
  }

  // 固定四项：月末总收入、月末总成本、月末ROI、月末利润（顺序与接口 predictInfluence 一致）
  const METRIC_KEYS: {
    key: keyof CockpitAppSimulationPredictInfluence
    label: string
    formatValue: (v: number) => string
    isCost: boolean
  }[] = [
    { key: 'endMouthRevenue', label: '月末总收入', formatValue: formatMoney, isCost: false },
    { key: 'endMouthCost', label: '月末总成本', formatValue: formatMoney, isCost: true },
    { key: 'endMouthRoi', label: '月末ROI', formatValue: formatRoi, isCost: false },
    { key: 'endMouthProfit', label: '月末利润', formatValue: formatMoney, isCost: false }
  ]

  interface ImpactRowDisplay {
    metric: string
    current: string
    simulated: string
    change: string
    changeText: string
    changeClass: string
  }

  const impactRows = computed<ImpactRowDisplay[]>(() => {
    const data = simulationData.value?.predictInfluence
    if (!data) return []
    return METRIC_KEYS.map(({ key, label, formatValue, isCost }) => {
      const item = data[key]
      if (!item)
        return {
          metric: label,
          current: '-',
          simulated: '-',
          change: '-',
          changeText: '',
          changeClass: ''
        }
      const { change, changeText, changeClass } = getChangeDisplay(item, isCost)
      return {
        metric: label,
        current: formatValue(item.predict),
        simulated: formatValue(item.result),
        change,
        changeText,
        changeClass
      }
    })
  })

  /** 当 ROI 下降时显示警示文案 */
  const simulationWarning = computed(() => {
    const pi = simulationData.value?.predictInfluence
    if (!pi?.endMouthRoi) return ''
    const { predict, result } = pi.endMouthRoi
    if (result < predict) return '注意：模拟结果显示ROI下降，建议谨慎调整预算分配'
    return ''
  })

  // 趋势图
  const { chartRef, initChart, handleResize, destroyChart } = useChart()

  const trendOption = computed<EChartsOption>(() => {
    const rc = simulationData.value?.revenueComparisonCost
    const costData = rc?.cost ?? []
    const revenueData = rc?.revenue ?? []
    const len = Math.max(costData.length, revenueData.length, 1)
    const xData = Array.from({ length: len }, (_, i) => `${i}天`)
    const cost = costData.length ? costData : [0]
    const revenue = revenueData.length ? revenueData : [0]
    const allValues = [...cost, ...revenue].filter(Number.isFinite)
    const minVal = allValues.length ? Math.min(...allValues) : 0
    const maxVal = allValues.length ? Math.max(...allValues) : 10
    const padding = (maxVal - minVal) * 0.1 || 1
    return {
      grid: { top: 24, right: 24, bottom: 28, left: 48, containLabel: true },
      xAxis: {
        type: 'category',
        data: xData,
        axisLabel: { fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        min: minVal - padding,
        max: maxVal + padding,
        axisLabel: {
          fontSize: 11,
          formatter: (value: number) =>
            value >= 1e6
              ? '$' + (value / 1e6).toFixed(1) + 'M'
              : '$' + (value / 1e3).toFixed(0) + 'K'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['收入', '成本'],
        bottom: 0,
        textStyle: { fontSize: 11 }
      },
      series: [
        {
          name: '成本',
          type: 'line',
          smooth: true,
          data: cost,
          lineStyle: { color: '#4ABEFF' },
          areaStyle: { color: 'rgba(74, 190, 255, 0.25)' }
        },
        {
          name: '收入',
          type: 'line',
          smooth: true,
          data: revenue,
          lineStyle: { color: '#FFAF20' },
          areaStyle: { color: 'rgba(255, 175, 32, 0.25)' }
        }
      ]
    }
  })

  function initTrendChart() {
    if (chartRef.value && props.modelValue) {
      initChart(trendOption.value)
    }
  }

  watch(
    () => props.modelValue,
    (visible) => {
      if (visible) {
        // 打开窗口即用当前滑块值（默认 0,0,0,0）调用接口拉取预测影响与趋势数据
        handleApply()
        nextTick(() => {
          setTimeout(initTrendChart, 80)
        })
      }
    }
  )

  watch(
    () => simulationData.value,
    () => {
      nextTick(() => {
        if (chartRef.value && props.modelValue) initTrendChart()
      })
    },
    { deep: true }
  )

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    destroyChart()
  })
</script>

<style scoped lang="scss">
  .simulation-content {
    display: flex;
    gap: 24px;
    min-height: 420px;
  }

  .panel-left {
    display: flex;
    flex: 0 0 400px;
    flex-direction: column;
    padding-right: 24px;
    border-right: 1px solid var(--el-border-color-lighter);

    .panel-title {
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .slider-list {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 20px;
    }

    .slider-item {
      padding: 10px 22px 20px;
      background-color: var(--el-fill-color-light);
      border-radius: 6px;

      .slider-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 13px;
        color: var(--el-text-color-regular);

        span {
          &:last-child {
            font-size: 10px;
            line-height: 1.9;
            color: var(--el-text-color-secondary);
          }
        }
      }

      .slider-value {
        margin-top: 4px;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .panel-actions {
      display: flex;
      gap: 12px;
      justify-content: space-between;
      padding-top: 16px;
      margin-top: 20px;
      border-top: 1px solid var(--el-border-color-lighter);

      button {
        width: 100%;
      }
    }
  }

  .panel-right {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    min-width: 0;

    .panel-title {
      margin-bottom: 4px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .impact-list-wrap {
      flex-shrink: 0;
      min-height: 160px;
    }

    .impact-list-header,
    .impact-row {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 8px 0;
      font-size: 13px;
    }

    .impact-list-header {
      font-weight: 500;
      color: var(--el-text-color-secondary);
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .impact-row {
      color: var(--el-text-color-regular);
    }

    .impact-col-metric {
      flex: 0 0 100px;
    }

    .impact-col-value {
      flex: 0 0 90px;
      text-align: right;
    }

    .impact-col-change {
      flex: 0 0 100px;
      text-align: right;
    }

    .impact-empty {
      padding: 24px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
      text-align: center;
    }

    .chart-title {
      margin-top: 4px;
      font-size: 13px;
      color: var(--el-text-color-regular);
    }

    .trend-chart {
      flex: 1;
      min-height: 180px;
    }

    .simulation-warning {
      flex-shrink: 0;
      margin-top: 8px;
    }
  }

  .change-up {
    color: var(--el-color-success);
  }

  .change-down {
    color: var(--el-color-danger);
  }

  :deep(.el-slider__marks-text) {
    font-size: 11px;
  }
</style>
