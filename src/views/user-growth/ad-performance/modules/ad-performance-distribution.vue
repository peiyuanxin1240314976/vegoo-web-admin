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
        <template #header>
          <span class="ad-performance-distribution__card-title">
            {{ tr('adPerformance.channelDistribution', '广告平台分布') }}
          </span>
        </template>
        <!-- 骨架：环形图占位 -->
        <div v-if="loading" class="ad-performance-distribution__donut-wrap">
          <div class="donut-sk">
            <div class="donut-sk__ring"></div>
            <div class="donut-sk__center">
              <ElSkeletonItem variant="text" style="width: 60px; height: 14px" />
            </div>
          </div>
        </div>
        <div v-else class="ad-performance-distribution__donut-wrap">
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

        <!-- 骨架：列表占位 -->
        <div v-if="loading" class="ad-performance-distribution__list">
          <div v-for="i in 4" :key="i" class="dist-sk-row">
            <ElSkeletonItem variant="circle" class="dist-sk-row__avatar" />
            <div class="dist-sk-row__info">
              <ElSkeletonItem variant="text" class="dist-sk-row__name" />
              <ElSkeletonItem variant="text" class="dist-sk-row__bar" />
            </div>
            <ElSkeletonItem variant="text" class="dist-sk-row__val" />
          </div>
        </div>

        <div v-else class="ad-performance-distribution__list" role="tabpanel">
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
  import { watch, onMounted, computed, ref, nextTick } from 'vue'
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
      loading?: boolean
      /** vertical：右侧栏纵向排列；horizontal：左右并排 */
      layout?: 'vertical' | 'horizontal'
    }>(),
    {
      channelDistribution: () => [],
      appDistribution: () => [],
      ownerShareDistribution: () => [],
      loading: false,
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

  let renderRafId: number | null = null
  function scheduleRenderAll() {
    if (props.loading) return
    if (renderRafId != null) return
    renderRafId = window.requestAnimationFrame(async () => {
      renderRafId = null
      await nextTick()
      renderAll()
    })
  }

  onMounted(() => {
    if (!props.loading) scheduleRenderAll()
  })

  watch(
    () => props.loading,
    async (ld) => {
      if (ld) {
        channelChart.destroyChart()
        return
      }
      scheduleRenderAll()
    }
  )

  watch(
    () => [
      channelChart.isDark.value,
      props.channelDistribution,
      props.appDistribution,
      props.ownerShareDistribution
    ],
    () => {
      scheduleRenderAll()
    },
    { deep: false }
  )
</script>

<style scoped lang="scss">
  @import '../styles/ap-card-fx';

  .ad-performance-distribution {
    margin-bottom: 16px;
  }

  .ad-performance-distribution__card-title {
    @include ap-title-gradient;

    font-size: 15px;
  }

  /* 环形图骨架 */
  .donut-sk {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    &__ring {
      width: 120px;
      height: 120px;
      border: 14px solid rgb(63 63 70 / 60%);
      border-top-color: rgb(59 130 246 / 40%);
      border-radius: 50%;
      animation: donut-sk-spin 1.4s linear infinite;
    }

    &__center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  @keyframes donut-sk-spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* 列表骨架 */
  .dist-sk-row {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 8px 6px;
  }

  .dist-sk-row__avatar {
    flex-shrink: 0;
    width: 28px !important;
    height: 28px !important;
    border-radius: 50% !important;
  }

  .dist-sk-row__info {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .dist-sk-row__name {
    width: 60% !important;
    height: 12px !important;
    border-radius: 6px !important;
  }

  .dist-sk-row__bar {
    width: 90% !important;
    height: 8px !important;
    border-radius: 9999px !important;
  }

  .dist-sk-row__val {
    flex-shrink: 0;
    width: 48px !important;
    height: 12px !important;
    border-radius: 6px !important;
  }

  .ad-performance-distribution__card {
    @include ap-neon-bg;
    @include ap-panel-hover;

    position: relative;
    margin-bottom: 0;
    overflow: hidden;
    border-radius: 12px;

    :deep(.el-card__header) {
      font-size: 15px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      letter-spacing: 0.03em;
      background: transparent;
      border-bottom: 1px solid rgb(63 63 70 / 35%);
    }

    :deep(.el-card__body) {
      background: transparent;
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
    background: linear-gradient(135deg, rgb(16 185 129 / 8%) 0%, rgb(24 24 27 / 55%) 100%);
    border: 1px solid rgb(16 185 129 / 28%);
    border-radius: 10px;
    box-shadow: inset 0 1px 0 rgb(244 244 245 / 6%);
  }

  .ad-performance-distribution__tab {
    flex: 1;
    padding: 8px 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    text-align: center;
    touch-action: manipulation;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 8px;
    outline: none;
    transition:
      background-color 0.2s var(--ease-out),
      color 0.2s var(--ease-out),
      box-shadow 0.2s var(--ease-out);

    &.is-active {
      color: var(--el-text-color-primary);
      background: linear-gradient(135deg, rgb(16 185 129 / 22%) 0%, rgb(16 185 129 / 12%) 100%);
      box-shadow:
        0 0 0 1px rgb(16 185 129 / 40%) inset,
        0 0 12px rgb(16 185 129 / 12%);
    }

    &:not(.is-active):hover {
      color: var(--text-primary);
      background: rgb(244 244 245 / 5%);
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
    padding: 8px 6px;
    border: 1px solid transparent;
    border-radius: 10px;
    transition:
      background-color 0.22s var(--ease-out),
      border-color 0.22s var(--ease-default);

    &:hover {
      background: rgb(59 130 246 / 6%);
      border-color: rgb(59 130 246 / 18%);
    }
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
    padding: 8px 6px;
    border: 1px solid transparent;
    border-radius: 10px;
    transition:
      background-color 0.22s var(--ease-out),
      border-color 0.22s var(--ease-default),
      box-shadow 0.26s var(--ease-out);

    &:hover {
      background: linear-gradient(135deg, rgb(16 185 129 / 8%) 0%, rgb(59 130 246 / 5%) 100%);
      border-color: rgb(16 185 129 / 22%);
      box-shadow:
        0 4px 16px rgb(0 0 0 / 18%),
        0 0 0 1px rgb(16 185 129 / 10%);
    }
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

  @media (prefers-reduced-motion: reduce) {
    .ad-performance-distribution__card {
      transition: none;

      &:hover {
        transform: none;
      }
    }

    .ad-performance-distribution__owner-row,
    .ad-performance-distribution__list-row,
    .ad-performance-distribution__tab {
      transition: none;
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
