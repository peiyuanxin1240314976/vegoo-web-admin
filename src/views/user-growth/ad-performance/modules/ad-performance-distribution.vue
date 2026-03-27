<template>
  <ElRow
    :gutter="16"
    class="ad-performance-distribution"
    :class="`ad-performance-distribution--${layout}`"
  >
    <ElCol :xs="24" :lg="layout === 'vertical' ? 24 : 12">
      <ElCard
        class="ad-performance-distribution__card ad-performance-distribution__card--channel"
        shadow="never"
      >
        <template #header>{{ tr('adPerformance.channelDistribution', '广告平台分布') }}</template>
        <div class="ad-performance-distribution__donut-wrap">
          <div ref="channelChartRef" class="ad-performance-distribution__donut-chart"></div>
          <div class="ad-performance-distribution__donut-center">
            {{ formatCurrency(channelTotal) }}
          </div>
        </div>
      </ElCard>
    </ElCol>
    <ElCol :xs="24" :lg="layout === 'vertical' ? 24 : 12">
      <ElCard
        class="ad-performance-distribution__card ad-performance-distribution__card--app"
        shadow="never"
      >
        <template #header>
          <div class="ad-performance-distribution__tabs" role="tablist">
            <button
              type="button"
              class="ad-performance-distribution__tab"
              :class="{ 'is-active': activeTab === 'app' }"
              role="tab"
              :aria-selected="activeTab === 'app'"
              @click="activeTab = 'app'"
            >
              {{ tr('adPerformance.appDistribution', '应用分布') }}
            </button>
            <button
              type="button"
              class="ad-performance-distribution__tab"
              :class="{ 'is-active': activeTab === 'owner' }"
              role="tab"
              :aria-selected="activeTab === 'owner'"
              @click="activeTab = 'owner'"
            >
              {{ tr('adPerformance.ownerShare', '优化师占比') }}
            </button>
          </div>
        </template>

        <div class="ad-performance-distribution__list" role="tabpanel">
          <template v-if="activeTab === 'owner'">
            <div
              v-for="(row, idx) in ownerRows"
              :key="row.name"
              class="ad-performance-distribution__owner-row"
            >
              <div class="ad-performance-distribution__owner-left">
                <div
                  class="ad-performance-distribution__avatar"
                  :style="{ borderColor: getRowColor(idx) }"
                >
                  <span :style="{ color: getRowColor(idx) }">{{ getAvatarText(row.name) }}</span>
                </div>
                <div class="ad-performance-distribution__owner-name" :title="row.name">
                  {{ row.name }}
                </div>
              </div>

              <div class="ad-performance-distribution__owner-bar">
                <div class="ad-performance-distribution__owner-bar-bg">
                  <div
                    class="ad-performance-distribution__owner-bar-fill"
                    :style="{ width: `${row.percent}%`, background: getRowColor(idx) }"
                  ></div>
                </div>
              </div>

              <div class="ad-performance-distribution__owner-percent">{{ row.percent }}%</div>
              <div class="ad-performance-distribution__owner-value">
                {{ formatCurrency(row.value) }}
              </div>
            </div>
          </template>

          <template v-else>
            <div
              v-for="row in appRows"
              :key="row.name"
              class="ad-performance-distribution__list-row"
            >
              <span class="ad-performance-distribution__app-icon" aria-hidden="true"></span>
              <div class="ad-performance-distribution__app-content">
                <div class="ad-performance-distribution__app-top">
                  <div class="ad-performance-distribution__app-name" :title="row.name">
                    <span class="ad-performance-distribution__app-name-text">{{ row.name }}</span>
                  </div>
                  <div class="ad-performance-distribution__app-metrics">
                    <span class="ad-performance-distribution__app-percent">{{ row.percent }}%</span>
                    <span class="ad-performance-distribution__app-value">
                      {{ formatCurrency(row.value) }}
                    </span>
                  </div>
                </div>

                <div class="ad-performance-distribution__list-bar-bg">
                  <div
                    class="ad-performance-distribution__list-bar-fill"
                    :style="{ width: `${row.percent}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </ElCard>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { watch, onMounted, computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useChart } from '@/hooks/core/useChart'
  import type {
    ChannelDistributionItem,
    AppDistributionItem,
    OwnerShareDistributionItem
  } from '../types'

  defineOptions({ name: 'AdPerformanceDistribution' })

  const { t, te } = useI18n()
  const tr = (key: string, fallback: string) => (te(key) ? t(key) : fallback)

  const props = withDefaults(
    defineProps<{
      channelDistribution?: ChannelDistributionItem[]
      appDistribution?: AppDistributionItem[]
      ownerShareDistribution?: OwnerShareDistributionItem[]
      /** vertical：右侧栏纵向排列；horizontal：左右并排 */
      layout?: 'vertical' | 'horizontal'
    }>(),
    {
      channelDistribution: () => [],
      appDistribution: () => [],
      ownerShareDistribution: () => [],
      layout: 'horizontal'
    }
  )

  const channelTotal = computed(() =>
    props.channelDistribution.reduce((s, d) => {
      const v = Number(d.value)
      return s + (Number.isFinite(v) ? v : 0)
    }, 0)
  )

  const channelChart = useChart()
  const channelChartRef = channelChart.chartRef

  const activeTab = ref<'app' | 'owner'>('app')

  function formatCurrency(n: number | undefined | null) {
    const x = typeof n === 'number' ? n : Number(n)
    const safe = Number.isFinite(x) ? x : 0
    return '$' + safe.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  const appRows = computed(() => {
    const data = props.appDistribution ?? []
    return data.map((d) => {
      const spend = Number(d.spend)
      return {
        name: d.appName,
        percent: Math.max(0, Math.min(100, Math.round(d.percent))),
        value: Number.isFinite(spend) ? spend : 0
      }
    })
  })

  const ownerRows = computed(() => {
    const data = props.ownerShareDistribution ?? []
    return data.map((d) => {
      const spend = Number(d.spend)
      return {
        name: d.ownerName,
        percent: Math.max(0, Math.min(100, Math.round(d.percent))),
        value: Number.isFinite(spend) ? spend : 0
      }
    })
  })

  function getAvatarText(name: string) {
    const t = (name ?? '').trim()
    return t ? t.slice(0, 1) : '?'
  }

  function getRowColor(index: number) {
    const colors = ['#22C55E', '#34D399', '#10B981', '#84CC16', '#A1A1AA']
    return colors[index] ?? '#22C55E'
  }

  function renderChannelChart() {
    const data = props.channelDistribution.map((d) => ({
      name: d.name,
      value: d.percent
    }))
    const isDark = channelChart.isDark.value
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
          orient: 'horizontal',
          left: 'center',
          bottom: 0,
          textStyle: { color: isDark ? '#9ca3af' : '#666', fontSize: 12 }
        },
        series: [
          {
            type: 'pie',
            radius: ['42%', '64%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: false,
            itemStyle: { borderColor: pieBorderColor, borderWidth: 2 },
            label: { show: false },
            data,
            color: ['#3B82F6', '#8B5CF6', '#14B8A6', '#F97316', '#EC4899']
          }
        ]
      },
      data.length === 0
    )
  }

  function renderAll() {
    renderChannelChart()
  }

  onMounted(() => {
    renderAll()
  })

  watch(
    () => [
      channelChart.isDark.value,
      props.channelDistribution,
      props.appDistribution,
      props.ownerShareDistribution
    ],
    () => {
      renderAll()
    },
    { deep: true }
  )
</script>

<style scoped lang="scss">
  .ad-performance-distribution {
    margin-bottom: 16px;
  }

  .ad-performance-distribution__card {
    margin-bottom: 0;
    background: var(--default-box-color);

    :deep(.el-card__header) {
      color: var(--el-text-color-primary);
    }
  }

  .ad-performance-distribution__card--app {
    :deep(.el-card__header) {
      padding: 0;
      border-bottom: none;
    }

    :deep(.el-card__body) {
      padding-top: 12px;
      overflow: hidden;
    }
  }

  .ad-performance-distribution__card--channel {
    :deep(.el-card__header) {
      padding-bottom: 0;
      font-size: 15px;
      font-weight: 600;
      border-bottom: none;
    }

    :deep(.el-card__body) {
      padding-top: 0;
    }
  }

  .ad-performance-distribution--vertical {
    .ad-performance-distribution__card--channel {
      margin-bottom: 16px;
    }
  }

  .ad-performance-distribution__donut-wrap {
    position: relative;
    height: 220px;
    min-height: 200px;
  }

  .ad-performance-distribution__donut-chart {
    width: 100%;
    height: 100%;
  }

  .ad-performance-distribution__donut-center {
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  .ad-performance-distribution__bar-chart {
    height: 220px;
    min-height: 200px;
  }

  .ad-performance-distribution__tabs {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    padding: 4px;
    margin: 12px 12px 0;
    background: color-mix(in srgb, var(--default-box-color) 75%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-success) 35%, var(--default-border));
    border-radius: 10px;
  }

  .ad-performance-distribution__tab {
    flex: 1;
    padding: 8px 10px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    text-align: center;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 8px;
    transition:
      background-color 0.15s ease,
      color 0.15s ease,
      box-shadow 0.15s ease;

    &.is-active {
      color: var(--el-text-color-primary);
      background: color-mix(in srgb, var(--art-success) 18%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--art-success) 45%, transparent) inset;
    }
  }

  .ad-performance-distribution__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 6px 12px 2px;
    overflow: hidden;
  }

  .ad-performance-distribution__list-row {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr);
    column-gap: 10px;
    align-items: stretch;
    min-width: 0;
  }

  .ad-performance-distribution__app-top {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
  }

  .ad-performance-distribution__app-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .ad-performance-distribution__app-name {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
  }

  .ad-performance-distribution__app-icon {
    flex: 0 0 auto;
    align-self: flex-start;
    width: 18px;
    height: 18px;
    background: color-mix(in srgb, var(--default-border) 70%, transparent);
    border-radius: 6px;
  }

  .ad-performance-distribution__app-name-text {
    overflow: hidden;
    font-size: 13px;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ad-performance-distribution__app-metrics {
    display: flex;
    flex: 0 0 auto;
    gap: 10px;
    align-items: center;
  }

  .ad-performance-distribution__list-bar-bg {
    position: relative;
    height: 8px;
    overflow: hidden;
    background: color-mix(in srgb, var(--default-border) 70%, transparent);
    border-radius: 9999px;
  }

  .ad-performance-distribution__list-bar-fill {
    height: 100%;
    background: var(--art-success);
    border-radius: 9999px;
  }

  .ad-performance-distribution__app-percent {
    font-size: 13px;
    font-weight: 600;
    color: var(--art-success);
  }

  .ad-performance-distribution__app-value {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .ad-performance-distribution__owner-row {
    display: grid;
    grid-template-columns: 80px minmax(0, 1fr) 48px 68px;
    gap: 12px;
    align-items: center;
    min-width: 0;
  }

  .ad-performance-distribution__owner-left {
    display: flex;
    gap: 10px;
    align-items: center;
    min-width: 0;
  }

  .ad-performance-distribution__avatar {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: color-mix(in srgb, var(--default-box-color) 60%, transparent);
    border: 2px solid var(--default-border);
    border-radius: 9999px;

    span {
      font-size: 13px;
      font-weight: 700;
      line-height: 1;
    }
  }

  .ad-performance-distribution__owner-name {
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ad-performance-distribution__owner-bar {
    min-width: 0;
  }

  .ad-performance-distribution__owner-bar-bg {
    max-width: 130px;
    height: 10px;
    overflow: hidden;
    background: color-mix(in srgb, var(--default-border) 70%, transparent);
    border-radius: 9999px;
  }

  .ad-performance-distribution__owner-bar-fill {
    height: 100%;
    border-radius: 9999px;
  }

  .ad-performance-distribution__owner-percent {
    font-size: 13px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    text-align: right;
  }

  .ad-performance-distribution__owner-value {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    text-align: right;
  }

  @media (width <= 1366px) {
    .ad-performance-distribution__owner-row {
      grid-template-columns: 80px minmax(0, 1fr) 48px 68px;
    }
  }

  @media (width <= 1200px) {
    .ad-performance-distribution__owner-row {
      grid-template-columns: 76px minmax(96px, 1fr) 46px 64px;
      gap: 10px;
    }

    .ad-performance-distribution__owner-bar-bg {
      max-width: 120px;
    }
  }
</style>
