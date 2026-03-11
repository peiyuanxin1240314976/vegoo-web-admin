<template>
  <ElDialog
    :model-value="modelValue"
    title="情景模拟分析"
    width="1000px"
    class="scenario-simulation-dialog"
    :close-on-click-modal="false"
    destroy-on-close
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

      <!-- 右侧：预测影响 -->
      <div class="panel-right">
        <div class="panel-title">预测影响</div>
        <div class="impact-table-wrap">
          <ArtTable :data="impactTableData" :columns="impactColumns" size="small" height="160">
            <template #change="{ row }">
              <span :class="row.changeClass"> {{ row.changeText }} {{ row.change }} </span>
            </template>
          </ArtTable>
        </div>
        <div class="chart-title">收入与成本趋势对比</div>
        <div ref="chartRef" class="trend-chart" />
        <ElAlert type="warning" :closable="false" show-icon class="simulation-warning">
          注意：模拟结果显示ROI下降，建议谨慎调整预算分配
        </ElAlert>
      </div>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from 'echarts'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import type { ColumnOption } from '@/types'

  defineOptions({ name: 'ScenarioSimulationDialog' })

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
    googleCpi: 15,
    metaBudget: 15,
    admobEcpm: 15,
    retention: 15
  })

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

  function onSliderChange() {
    // 可在此触发模拟结果更新
  }

  function handleReset() {
    sliders.value = { googleCpi: 0, metaBudget: 0, admobEcpm: 0, retention: 0 }
  }

  function handleApply() {
    // 应用当前滑块值，表格与图表已通过 computed 响应
  }

  // 预测影响表格
  interface ImpactRow {
    metric: string
    current: string
    simulated: string
    change: string
    changeText: string
    changeClass: string
  }

  const impactColumns: ColumnOption<ImpactRow>[] = [
    { prop: 'metric', label: '指标', minWidth: 100 },
    { prop: 'current', label: '当前预测', minWidth: 90, align: 'right' },
    { prop: 'simulated', label: '模拟结果', minWidth: 90, align: 'right' },
    { prop: 'change', label: '变化', width: 100, align: 'right', useSlot: true, slotName: 'change' }
  ]

  const impactTableData = computed<ImpactRow[]>(() => {
    // const pct = sliders.value.googleCpi
    return [
      {
        metric: '月末总收入',
        current: '$8.5M',
        simulated: '$9.2M',
        change: '+8.2%',
        changeText: '▲',
        changeClass: 'change-up'
      },
      {
        metric: '月末总成本',
        current: '$4.2M',
        simulated: '$4.8M',
        change: '+14.3%',
        changeText: '▲',
        changeClass: 'change-down'
      },
      {
        metric: '月末ROI',
        current: '2.02x',
        simulated: '1.92x',
        change: '-5.0%',
        changeText: '▼',
        changeClass: 'change-down'
      },
      {
        metric: '月末利润',
        current: '$4.3M',
        simulated: '$4.4M',
        change: '+2.3%',
        changeText: '▲',
        changeClass: 'change-up'
      }
    ]
  })

  // 趋势图
  const { chartRef, initChart, handleResize, destroyChart } = useChart()

  const trendOption = computed<EChartsOption>(() => ({
    grid: { top: 24, right: 24, bottom: 28, left: 48, containLabel: true },
    xAxis: {
      type: 'category',
      data: [0, 6, 10, 15, 22, 27, 30].map((d) => `${d}天`),
      axisLabel: { fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      min: 2.3,
      max: 10,
      axisLabel: {
        fontSize: 11,
        formatter: (value: number) => '$' + Number(value).toFixed(2) + 'M'
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
        data: [2.5, 3.2, 3.8, 4.2, 4.5, 4.7, 4.8],
        lineStyle: { color: '#4ABEFF' },
        areaStyle: { color: 'rgba(74, 190, 255, 0.25)' }
      },
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: [3.2, 4.5, 5.8, 6.8, 7.8, 8.8, 9.2],
        lineStyle: { color: '#FFAF20' },
        areaStyle: { color: 'rgba(255, 175, 32, 0.25)' }
      }
    ]
  }))

  function initTrendChart() {
    if (chartRef.value && props.modelValue) {
      initChart(trendOption.value)
    }
  }

  watch(
    () => props.modelValue,
    (visible) => {
      if (visible) {
        nextTick(() => {
          setTimeout(initTrendChart, 80)
        })
      }
    }
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

    .impact-table-wrap {
      flex-shrink: 0;
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
