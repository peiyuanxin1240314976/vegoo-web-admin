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
              <span
                class="ad-performance-distribution__app-icon"
                aria-hidden="true"
                :style="{
                  background: `${row.color}22`,
                  boxShadow: `0 0 0 1px ${row.color}44 inset`
                }"
              ></span>
              <div class="ad-performance-distribution__app-content">
                <div class="ad-performance-distribution__app-top">
                  <div class="ad-performance-distribution__app-name" :title="row.name">
                    <span class="ad-performance-distribution__app-name-text">{{ row.name }}</span>
                  </div>
                  <div class="ad-performance-distribution__app-metrics">
                    <span
                      class="ad-performance-distribution__app-percent"
                      :style="{ color: row.color }"
                      >{{ row.percent }}%</span
                    >
                    <span class="ad-performance-distribution__app-value">
                      {{ formatCurrency(row.value) }}
                    </span>
                  </div>
                </div>

                <div class="ad-performance-distribution__list-bar-bg">
                  <div
                    class="ad-performance-distribution__list-bar-fill"
                    :style="{ width: `${row.percent}%`, background: row.color }"
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

  const APP_BAR_COLORS = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899', '#14B8A6']

  const appRows = computed(() => {
    const data = props.appDistribution ?? []
    return data.map((d, idx) => {
      const spend = Number(d.spend)
      return {
        name: d.appName,
        percent: Math.max(0, Math.min(100, Math.round(d.percent))),
        value: Number.isFinite(spend) ? spend : 0,
        color: APP_BAR_COLORS[idx % APP_BAR_COLORS.length]
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
    const colors = ['#10B981', '#3B82F6', '#F97316', '#8B5CF6', '#EC4899', '#14B8A6']
    return colors[index] ?? colors[index % colors.length]
  }

  const DONUT_COLORS = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B']

  function renderChannelChart() {
    const data = props.channelDistribution.map((d) => ({
      name: d.name,
      value: d.percent
    }))
    const isDark = channelChart.isDark.value
    const pieBorderColor = isDark ? '#111827' : '#fff'
    channelChart.initChart(
      {
        animation: true,
        animationDuration: 800,
        animationEasing: 'cubicOut',
        tooltip: {
          trigger: 'item',
          formatter: (p: any) => `${p.marker}${p.name}  <b>${p.value}%</b>`,
          backgroundColor: isDark ? 'rgba(15,25,41,0.92)' : 'rgba(255,255,255,0.96)',
          borderColor: isDark ? '#2a3f5f' : '#e5e7eb',
          textStyle: { color: isDark ? '#e2e8f0' : '#374151', fontSize: 12 }
        },
        legend: {
          orient: 'horizontal',
          left: 'center',
          bottom: 2,
          itemWidth: 10,
          itemHeight: 10,
          textStyle: { color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }
        },
        series: [
          {
            type: 'pie',
            radius: ['44%', '66%'],
            center: ['50%', '44%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderColor: pieBorderColor,
              borderWidth: 2,
              borderRadius: 4
            },
            label: { show: false },
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.25)' },
              scaleSize: 5
            },
            data,
            color: DONUT_COLORS
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
    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding: 12px;
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
    flex-shrink: 0;
    align-items: center;
    width: 100%;
    min-width: 0;
    padding: 4px;
    margin-bottom: 10px;
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
    touch-action: manipulation;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 8px;
    outline: none;
    transition:
      background-color 0.15s ease,
      color 0.15s ease,
      box-shadow 0.15s ease;

    &.is-active {
      color: var(--el-text-color-primary);
      background: color-mix(in srgb, var(--art-success) 18%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--art-success) 45%, transparent) inset;
    }

    &:focus-visible {
      box-shadow: 0 0 0 2px rgb(16 185 129 / 40%);
    }
  }

  .ad-performance-distribution__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 300px;
    padding-bottom: 4px;
    overflow: hidden auto;
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
    border-radius: 9999px;
    transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  .ad-performance-distribution__app-percent {
    font-size: 13px;
    font-weight: 600;
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
    transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
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

  @media (width <= 480px) {
    .ad-performance-distribution__owner-row {
      grid-template-columns: minmax(0, 1fr) 42px 58px;
      gap: 8px;
    }

    .ad-performance-distribution__owner-bar {
      display: none;
    }

    .ad-performance-distribution__tabs {
      border-radius: 8px;
    }

    .ad-performance-distribution__donut-wrap {
      height: 190px;
    }
  }
</style>
