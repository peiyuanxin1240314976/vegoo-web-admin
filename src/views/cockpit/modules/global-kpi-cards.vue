<template>
  <ElRow v-if="kpiList.length" :gutter="16" class="cockpit-kpi-row">
    <ElCol v-for="(item, index) in kpiList" :key="index" :xs="24" :sm="12" :md="8" :lg="4">
      <div
        class="cockpit-kpi-card cockpit-kpi-card--theme"
        :class="[`cockpit-kpi-card--${item.type}`, { 'is-hovered': hoveredIndex === index }]"
        :style="getCardTransitionStyle(index)"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
      >
        <div class="kpi-card-corner-circle" aria-hidden="true" />
        <div class="kpi-label">{{ item.label }}</div>
        <div class="kpi-value-row">
          <div class="kpi-value">{{ item.value }}</div>
          <div
            v-if="item.type !== 'adSpend' && Array.isArray(item.subItems) && item.subItems.length"
            class="kpi-sub-items"
          >
            <span
              v-for="(sub, i) in item.subItems"
              :key="i"
              class="kpi-sub-badge"
              :class="sub.tone ? `is-${sub.tone}` : ''"
            >
              <span class="kpi-sub-badge__label">{{ sub.label }}</span>
              <span class="kpi-sub-badge__value">{{ sub.value }}</span>
            </span>
          </div>
          <div v-else-if="item.sub" class="kpi-sub">{{ item.sub }}</div>
        </div>
        <div
          v-if="item.type === 'adSpend' && Array.isArray(item.subItems) && item.subItems.length"
          class="kpi-detail kpi-detail--badges"
        >
          <span
            v-for="(sub, i) in item.subItems"
            :key="i"
            class="kpi-detail-badge"
            :class="sub.label === '代投' ? 'is-proxy' : 'is-self'"
          >
            {{ sub.label }} {{ sub.value }}
          </span>
        </div>
        <div v-else-if="item.detail" class="kpi-detail">
          <span>{{ item.detail }}</span>
          <span
            v-if="item.type === 'dau' && item.detailChange"
            class="kpi-detail-change"
            :class="item.detailTrend === 'down' ? 'down' : 'up'"
          >
            {{ item.detailChange }}
          </span>
        </div>
        <div class="kpi-mini-chart">
          <svg viewBox="0 0 100 40" class="mini-chart-svg" preserveAspectRatio="none">
            <defs>
              <linearGradient :id="`kpi-grad-${index}`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--kpi-chart-color)" stop-opacity="0.35" />
                <stop offset="100%" stop-color="var(--kpi-chart-color)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path
              :d="getChartAreaPath(item, index)"
              class="mini-chart-area"
              :style="{ fill: `url(#kpi-grad-${index})` }"
            />
            <path :d="getChartLinePath(item, index)" class="mini-chart-line" />
          </svg>
        </div>
        <ElProgress
          v-if="item.progressPercent != null"
          :percentage="item.progressPercent"
          :show-text="false"
          :stroke-width="6"
          class="kpi-progress"
        />
        <div v-if="item.compare" class="kpi-compare" :class="item.compareUp ? 'up' : 'down'">{{
          item.compare
        }}</div>
      </div>
    </ElCol>
  </ElRow>
  <div v-else class="cockpit-kpi-empty">暂无数据</div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useTransition, TransitionPresets } from '@vueuse/core'
  import type { CockpitKpiCard } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitGlobalKpiCards' })

  const props = withDefaults(defineProps<{ kpiList?: CockpitKpiCard[] }>(), { kpiList: () => [] })

  const kpiList = computed(() =>
    Array.isArray(props.kpiList) ? props.kpiList : MOCK_COCKPIT_OVERVIEW.kpi
  )

  const hoveredIndex = ref<number | null>(null)
  const MAX_KPI_CARDS = 12
  const transitionOptions = {
    duration: 220,
    transition: TransitionPresets.easeOutCubic
  }
  const hoverProgress = Array.from({ length: MAX_KPI_CARDS }, (_, i) =>
    useTransition(
      computed(() => (hoveredIndex.value === i ? 1 : 0)),
      transitionOptions
    )
  )

  function getCardTransitionStyle(index: number) {
    const t = hoverProgress[index]?.value ?? 0
    const y = -8 * t
    return { transform: `translateY(${y}px)` }
  }

  /** 有 chartData 时归一化到 0~1 作为趋势点；否则用 compareUp 生成模拟点 */
  function getTrendPoints(item: CockpitKpiCard, index: number): number[] {
    if (Array.isArray(item.chartData) && item.chartData.length > 0) {
      const arr = item.chartData
      const min = Math.min(...arr)
      const max = Math.max(...arr)
      const range = max - min || 1
      return arr.map((v) => Math.max(0.05, Math.min(0.95, (v - min) / range)))
    }
    const n = 10
    const up = item.compareUp !== false
    const seed = index * 7 + (item.type?.length ?? 0)
    const wobble = (i: number) => ((i * 3 + seed) % 5) / 80 - 0.025
    const points: number[] = []
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1)
      const base = up ? 0.35 + t * 0.45 : 0.75 - t * 0.45
      points.push(Math.max(0.1, Math.min(0.95, base + wobble(i))))
    }
    return points
  }

  function getChartLinePath(item: CockpitKpiCard, index: number): string {
    const points = getTrendPoints(item, index)
    const w = 100
    const h = 36
    const pad = 2
    const coords = points.map((p, i) => {
      const x = points.length > 1 ? (i / (points.length - 1)) * w : 0
      const y = pad + (1 - p) * h
      return `${x},${y}`
    })
    return coords.length ? `M ${coords.join(' L ')}` : ''
  }

  function getChartAreaPath(item: CockpitKpiCard, index: number): string {
    const linePath = getChartLinePath(item, index)
    return `${linePath} L 100,40 L 0,40 Z`
  }
</script>

<style scoped lang="scss">
  .cockpit-kpi-row {
    margin-bottom: 16px;
  }

  .cockpit-kpi-empty {
    padding: 32px 16px;
    margin-bottom: 16px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-align: center;
    background: var(--el-fill-color-dark);
    border-radius: 10px;
  }

  .cockpit-kpi-card {
    --kpi-card-accent: var(--el-color-primary);
    --kpi-glass-border: rgb(0 0 0 / 10%);
    --kpi-glass-highlight: rgb(255 255 255 / 28%);

    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 188px;
    min-height: 188px;
    padding: 16px;
    overflow: hidden;
    cursor: default;
    isolation: isolate;
    -webkit-backdrop-filter: blur(14px);
    backdrop-filter: blur(14px);
    border: 1px solid var(--kpi-glass-border);
    border-radius: 12px;
    box-shadow:
      inset 0 1px 0 0 var(--kpi-glass-highlight),
      0 4px 16px -4px rgb(0 0 0 / 8%);
    transition:
      box-shadow 0.22s ease,
      border-color 0.22s ease;

    &.is-hovered {
      box-shadow:
        inset 0 1px 0 0 var(--kpi-glass-highlight),
        0 12px 28px -8px rgb(0 0 0 / 18%),
        0 0 0 1px rgb(0 0 0 / 6%),
        0 0 24px -6px var(--kpi-card-accent);
    }

    /* 右上角装饰：透明圆，仅露出 1/4（3/4 被裁切） */
    .kpi-card-corner-circle {
      position: absolute;
      top: -48px;
      right: -48px;
      width: 96px;
      height: 96px;
      pointer-events: none;
      background: rgb(255 255 255 / 4%);
      border-radius: 50%;
    }

    .kpi-label {
      margin-bottom: 6px;
      font-size: 13px;
      opacity: 0.9;
    }

    .kpi-value-row {
      position: relative;
      min-height: 28px;
      margin-bottom: 4px;
    }

    .kpi-value {
      padding-right: 8px;
      font-size: 20px;
      font-weight: 600;
      line-height: 1.3;
    }

    .kpi-sub {
      position: absolute;
      top: 50%;
      right: 0;
      max-width: 60%;
      overflow: hidden;
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
      opacity: 0.85;
      transform: translateY(-50%);
    }

    .kpi-sub-items {
      position: absolute;
      top: 50%;
      right: 0;
      display: inline-flex;
      gap: 6px;
      align-items: center;
      max-width: 72%;
      transform: translateY(-50%);
    }

    .kpi-sub-badge {
      display: inline-flex;
      gap: 6px;
      align-items: center;
      padding: 4px 8px;
      overflow: hidden;
      font-size: 12px;
      line-height: 1;
      text-overflow: ellipsis;
      white-space: nowrap;
      background: rgb(0 0 0 / 10%);
      border: 1px solid rgb(0 0 0 / 10%);
      border-radius: 999px;

      &__label {
        opacity: 0.9;
      }

      &__value {
        font-weight: 600;
      }

      &.is-info {
        color: #a5b4fc;
        background: rgb(99 102 241 / 18%);
        border-color: rgb(99 102 241 / 22%);
      }

      &.is-warning {
        color: #fbbf24;
        background: rgb(245 158 11 / 16%);
        border-color: rgb(245 158 11 / 22%);
      }

      &.is-success {
        color: #34d399;
        background: rgb(16 185 129 / 14%);
        border-color: rgb(16 185 129 / 20%);
      }
    }

    .kpi-detail {
      margin-bottom: 2px;
      font-size: 12px;
      opacity: 0.85;
    }

    .kpi-detail-change {
      margin-left: 8px;
      font-weight: 600;

      &.up {
        color: #67c23a;
      }

      &.down {
        color: #f56c6c;
      }
    }

    .kpi-detail--badges {
      display: flex;
      gap: 10px;
      align-items: center;
      opacity: 1;
    }

    .kpi-detail-badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 10px;
      font-size: 12px;
      line-height: 1;
      color: rgb(255 255 255 / 88%);
      background: rgb(15 23 42 / 55%);
      -webkit-backdrop-filter: blur(10px);
      backdrop-filter: blur(10px);
      border: 1px solid rgb(148 163 184 / 22%);
      border-radius: 999px;
    }

    .kpi-detail-badge.is-proxy {
      color: rgb(216 180 254 / 95%);
      background: rgb(124 58 237 / 22%);
      border-color: rgb(124 58 237 / 28%);
    }

    .kpi-progress {
      flex-shrink: 0;
      margin: 6px 0;
    }

    .kpi-compare {
      margin-top: auto;
      font-size: 12px;

      &.up {
        color: inherit;
        opacity: 0.9;
      }

      &.down {
        color: inherit;
        opacity: 0.9;
      }
    }

    .kpi-mini-chart {
      flex-shrink: 0;
      width: 100%;
      height: 48px;
      padding: 6px 0;
      margin: 8px 0;
      // background: rgb(0 0 0 / 6%);
      border-radius: 8px;

      --kpi-chart-color: var(--el-color-primary);
    }

    // html.dark & .kpi-mini-chart {
    //   background: rgb(255 255 255 / 8%);
    // }

    .mini-chart-svg {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 6px;
    }

    .mini-chart-area {
      vector-effect: non-scaling-stroke;
    }

    .mini-chart-line {
      opacity: 0.9;
      fill: none;
      stroke: var(--kpi-chart-color);
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.5;
      vector-effect: non-scaling-stroke;
    }

    /* 浅色模式：更实，不透明感强 */
    &--theme.cockpit-kpi-card--income {
      --kpi-card-accent: rgb(103 194 58 / 45%);

      background:
        linear-gradient(135deg, rgb(255 255 255 / 72%) 0%, rgb(255 255 255 / 50%) 100%),
        linear-gradient(135deg, rgb(103 194 58 / 18%) 0%, rgb(103 194 58 / 8%) 100%);
      border-color: rgb(0 0 0 / 10%);

      .kpi-label,
      .kpi-detail,
      .kpi-sub {
        color: rgb(0 0 0 / 70%);
      }

      .kpi-value {
        color: #67c23a;
      }

      .kpi-compare.up {
        color: #67c23a;
      }

      .kpi-compare.down {
        color: #f56c6c;
      }

      .kpi-mini-chart {
        --kpi-chart-color: #67c23a;
      }
    }

    &--theme.cockpit-kpi-card--paidRevenue {
      --kpi-card-accent: rgb(230 162 60 / 45%);

      background:
        linear-gradient(135deg, rgb(255 255 255 / 70%) 0%, rgb(255 255 255 / 48%) 100%),
        linear-gradient(135deg, rgb(230 162 60 / 20%) 0%, rgb(230 162 60 / 8%) 100%);
      border-color: rgb(0 0 0 / 10%);

      .kpi-label,
      .kpi-detail,
      .kpi-sub {
        color: rgb(0 0 0 / 70%);
      }

      .kpi-value {
        color: #e6a23c;
      }

      .kpi-compare.up {
        color: #67c23a;
      }

      .kpi-compare.down {
        color: #f56c6c;
      }

      .kpi-mini-chart {
        --kpi-chart-color: #e6a23c;
      }
    }

    &--theme.cockpit-kpi-card--adSpend {
      --kpi-card-accent: rgb(64 158 255 / 45%);

      background:
        linear-gradient(135deg, rgb(255 255 255 / 70%) 0%, rgb(255 255 255 / 48%) 100%),
        linear-gradient(135deg, rgb(64 158 255 / 18%) 0%, rgb(64 158 255 / 8%) 100%);
      border-color: rgb(0 0 0 / 10%);

      .kpi-label,
      .kpi-detail,
      .kpi-sub {
        color: rgb(0 0 0 / 70%);
      }

      .kpi-value {
        color: #409eff;
      }

      .kpi-compare.up {
        color: #67c23a;
      }

      .kpi-compare.down {
        color: #f56c6c;
      }

      .kpi-mini-chart {
        --kpi-chart-color: #409eff;
      }
    }

    &--theme.cockpit-kpi-card--subscriptions {
      --kpi-card-accent: rgb(230 162 60 / 45%);

      background:
        linear-gradient(135deg, rgb(255 255 255 / 70%) 0%, rgb(255 255 255 / 48%) 100%),
        linear-gradient(135deg, rgb(230 162 60 / 18%) 0%, rgb(64 158 255 / 8%) 100%);
      border-color: rgb(0 0 0 / 10%);

      .kpi-label,
      .kpi-detail,
      .kpi-sub {
        color: rgb(0 0 0 / 70%);
      }

      .kpi-value {
        color: #e6a23c;
      }

      .kpi-compare.up {
        color: #67c23a;
      }

      .kpi-compare.down {
        color: #f56c6c;
      }

      .kpi-mini-chart {
        --kpi-chart-color: #e6a23c;
      }
    }

    &--theme.cockpit-kpi-card--dau {
      --kpi-card-accent: rgb(64 158 255 / 45%);

      background:
        linear-gradient(135deg, rgb(255 255 255 / 70%) 0%, rgb(255 255 255 / 48%) 100%),
        linear-gradient(135deg, rgb(64 158 255 / 18%) 0%, rgb(64 158 255 / 8%) 100%);
      border-color: rgb(0 0 0 / 10%);

      .kpi-label,
      .kpi-detail,
      .kpi-sub {
        color: rgb(0 0 0 / 70%);
      }

      .kpi-value {
        color: #409eff;
      }

      .kpi-compare.up {
        color: #67c23a;
      }

      .kpi-compare.down {
        color: #f56c6c;
      }

      .kpi-mini-chart {
        --kpi-chart-color: #409eff;
      }
    }

    &--theme.cockpit-kpi-card--profit {
      --kpi-card-accent: rgb(114 46 209 / 45%);

      background:
        linear-gradient(135deg, rgb(255 255 255 / 68%) 0%, rgb(255 255 255 / 45%) 100%),
        linear-gradient(135deg, rgb(114 46 209 / 18%) 0%, rgb(114 46 209 / 8%) 100%);
      border-color: rgb(0 0 0 / 10%);

      .kpi-label,
      .kpi-detail,
      .kpi-sub {
        color: rgb(0 0 0 / 70%);
      }

      .kpi-value {
        color: #722ed1;
      }

      .kpi-compare.up {
        color: #67c23a;
      }

      .kpi-compare.down {
        color: #f56c6c;
      }

      .kpi-mini-chart {
        --kpi-chart-color: #722ed1;
      }
    }
  }

  html.dark .cockpit-kpi-card .kpi-card-corner-circle {
    background: rgb(255 255 255 / 2%);
  }

  /* 深色主题：更透 + 渐变玻璃质感 */
  html.dark .cockpit-kpi-card {
    --kpi-glass-border: rgb(255 255 255 / 6%);
    --kpi-glass-highlight: rgb(255 255 255 / 3%);

    -webkit-backdrop-filter: blur(24px);
    backdrop-filter: blur(24px);
    box-shadow:
      inset 0 1px 0 0 var(--kpi-glass-highlight),
      0 4px 20px -4px rgb(0 0 0 / 15%);
  }

  /* 玻璃层：左上高光 → 右下透明，更透 */
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--income {
    background:
      linear-gradient(
        145deg,
        rgb(255 255 255 / 4%) 0%,
        rgb(255 255 255 / 1%) 30%,
        transparent 60%,
        rgb(103 194 58 / 1.5%) 100%
      ),
      linear-gradient(135deg, rgb(103 194 58 / 7%) 0%, rgb(103 194 58 / 1%) 100%);
  }

  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--paidRevenue {
    background:
      linear-gradient(
        145deg,
        rgb(255 255 255 / 4%) 0%,
        rgb(255 255 255 / 1%) 30%,
        transparent 60%,
        rgb(230 162 60 / 1.5%) 100%
      ),
      linear-gradient(135deg, rgb(230 162 60 / 7%) 0%, rgb(230 162 60 / 1%) 100%);
  }

  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--adSpend {
    background:
      linear-gradient(
        145deg,
        rgb(255 255 255 / 4%) 0%,
        rgb(255 255 255 / 1%) 30%,
        transparent 60%,
        rgb(64 158 255 / 1.5%) 100%
      ),
      linear-gradient(135deg, rgb(64 158 255 / 7%) 0%, rgb(64 158 255 / 1%) 100%);
  }

  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--subscriptions {
    background:
      linear-gradient(
        145deg,
        rgb(255 255 255 / 4%) 0%,
        rgb(255 255 255 / 1%) 30%,
        transparent 60%,
        rgb(230 162 60 / 1.5%) 100%
      ),
      linear-gradient(135deg, rgb(230 162 60 / 6%) 0%, rgb(64 158 255 / 1.5%) 100%);
  }

  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--dau {
    background:
      linear-gradient(
        145deg,
        rgb(255 255 255 / 4%) 0%,
        rgb(255 255 255 / 1%) 30%,
        transparent 60%,
        rgb(64 158 255 / 1.5%) 100%
      ),
      linear-gradient(135deg, rgb(64 158 255 / 7%) 0%, rgb(64 158 255 / 1%) 100%);
  }

  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--profit {
    background:
      linear-gradient(
        145deg,
        rgb(255 255 255 / 4%) 0%,
        rgb(255 255 255 / 1%) 30%,
        transparent 60%,
        rgb(114 46 209 / 1.5%) 100%
      ),
      linear-gradient(135deg, rgb(114 46 209 / 7%) 0%, rgb(114 46 209 / 1%) 100%);
  }

  html.dark .cockpit-kpi-card.is-hovered {
    box-shadow:
      inset 0 1px 0 0 var(--kpi-glass-highlight),
      0 12px 28px -8px rgb(0 0 0 / 35%),
      0 0 0 1px rgb(255 255 255 / 8%),
      0 0 24px -6px var(--kpi-card-accent);
  }

  /* 深色主题下 KPI 卡片次要文字颜色（与项目 html.dark 一致） */
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--income .kpi-label,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--income .kpi-detail,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--income .kpi-sub,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--paidRevenue .kpi-label,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--paidRevenue .kpi-detail,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--paidRevenue .kpi-sub,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--adSpend .kpi-label,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--adSpend .kpi-detail,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--adSpend .kpi-sub,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--subscriptions .kpi-label,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--subscriptions .kpi-detail,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--subscriptions .kpi-sub,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--dau .kpi-label,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--dau .kpi-detail,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--dau .kpi-sub,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--profit .kpi-label,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--profit .kpi-detail,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--profit .kpi-sub {
    color: rgb(255 255 255 / 82%);
  }
</style>
