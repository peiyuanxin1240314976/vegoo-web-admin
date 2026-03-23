<template>
  <div class="esb">
    <!-- 预算消耗预测 -->
    <ElCard class="esb__card" shadow="never">
      <template #header>
        <span class="esb__card-title">预算消耗预测</span>
      </template>
      <div ref="chartEl" class="esb__chart"></div>
    </ElCard>

    <!-- 相似 Campaign 参考 -->
    <ElCard class="esb__card" shadow="never">
      <template #header>
        <span class="esb__card-title">相似 Campaign 参考</span>
      </template>
      <div class="esb__ref-list">
        <div v-for="item in sidebar.refItems" :key="item.id" class="esb__ref-item">
          <div class="esb__ref-left">
            <span class="esb__ref-name">{{ item.name }}</span>
            <div class="esb__ref-stats">
              <span class="esb__ref-stat">ROI {{ item.roi }}</span>
              <span class="esb__ref-stat">CPI ${{ item.cpi }}</span>
              <span class="esb__ref-stat">Spend ${{ item.spend }}</span>
            </div>
          </div>
          <ElButton size="small" round @click="copyRef(item)">复制</ElButton>
        </div>
      </div>
    </ElCard>

    <!-- 创建提示 -->
    <ElCard class="esb__card" shadow="never">
      <template #header>
        <span class="esb__card-title">创建提示</span>
      </template>
      <ul class="esb__tips">
        <li v-for="tip in sidebar.tips" :key="tip" class="esb__tip">
          <span class="esb__tip-dot"></span>
          <span>{{ tip }}</span>
        </li>
      </ul>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import * as echarts from 'echarts/core'
  import { LineChart } from 'echarts/charts'
  import { GridComponent, TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { ElMessage } from 'element-plus'
  import type { AdEditSidebar, AdEditSidebarRefItem } from '../types'

  echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

  defineOptions({ name: 'EditSidebar' })

  const sidebar = defineModel<AdEditSidebar>({ required: true })

  const chartEl = ref<HTMLElement | null>(null)
  let chart: echarts.ECharts | null = null

  const DEFAULT_FORECAST = [480, 510, 495, 520, 505, 530, 515, 540, 525, 550, 535, 560, 545, 580]

  function cv(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }

  function buildOption() {
    const borderColor = cv('--default-border') || '#27272a'
    const boxColor = cv('--default-box-color') || '#18181b'
    const textColor = cv('--el-text-color-primary') || '#f4f4f5'
    const labelColor = cv('--el-text-color-secondary') || '#94a3b8'
    const days = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']
    const src = sidebar.value.budgetForecastValues
    const budget = src && src.length > 0 ? src : DEFAULT_FORECAST
    return {
      backgroundColor: 'transparent',
      grid: { top: 12, right: 8, bottom: 24, left: 42, containLabel: false },
      tooltip: {
        trigger: 'axis',
        backgroundColor: boxColor,
        borderColor,
        textStyle: { color: textColor, fontSize: 12 }
      },
      xAxis: {
        type: 'category',
        data: days,
        boundaryGap: false,
        axisLine: { lineStyle: { color: borderColor } },
        axisLabel: { color: labelColor, fontSize: 10 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: borderColor, type: 'dashed' } },
        axisLabel: {
          color: labelColor,
          fontSize: 10,
          formatter: (v: number) => `$${v}`
        }
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: '#3B82F6' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3B82F633' },
              { offset: 1, color: '#3B82F600' }
            ])
          },
          data: budget
        }
      ]
    }
  }

  const ro = new ResizeObserver(() => chart?.resize())

  onMounted(async () => {
    await nextTick()
    if (!chartEl.value) return
    chart = echarts.init(chartEl.value)
    chart.setOption(buildOption())
    ro.observe(chartEl.value)
  })

  onBeforeUnmount(() => {
    ro.disconnect()
    chart?.dispose()
  })

  watch(
    sidebar,
    () => {
      chart?.setOption(buildOption())
    },
    { deep: true }
  )

  function copyRef(item: AdEditSidebarRefItem) {
    ElMessage.success(`已复制 ${item.name} 的配置`)
  }
</script>

<style scoped lang="scss">
  .esb {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .esb__card {
    background: var(--default-box-color);

    :deep(.el-card__header) {
      padding: 12px 16px 10px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 14px 16px;
    }
  }

  .esb__card-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .esb__chart {
    width: 100%;
    height: 160px;
  }

  .esb__ref-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .esb__ref-item {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: var(--default-bg-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;
  }

  .esb__ref-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .esb__ref-name {
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .esb__ref-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .esb__ref-stat {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .esb__tips {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .esb__tip {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }

  .esb__tip-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    margin-top: 6px;
    background: var(--art-primary);
    border-radius: 50%;
  }
</style>
