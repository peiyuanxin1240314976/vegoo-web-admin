<template>
  <ElRow v-if="kpiList.length" :gutter="16" class="cockpit-kpi-row">
    <ElCol v-for="(item, index) in kpiList" :key="index" :xs="24" :sm="12" :md="8" :lg="4">
      <div
        class="cockpit-kpi-card cockpit-kpi-card--theme"
        :class="`cockpit-kpi-card--${item.type}`"
      >
        <div class="kpi-label">{{ item.label }}</div>
        <div class="kpi-value-row">
          <div class="kpi-value">{{ item.value }}</div>
          <div v-if="item.sub" class="kpi-sub">{{ item.sub }}</div>
        </div>
        <div v-if="item.detail" class="kpi-detail">{{ item.detail }}</div>
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
  import { computed } from 'vue'
  import type { CockpitKpiCard } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitGlobalKpiCards' })

  const props = withDefaults(defineProps<{ kpiList?: CockpitKpiCard[] }>(), { kpiList: () => [] })

  const kpiList = computed(() =>
    Array.isArray(props.kpiList) ? props.kpiList : MOCK_COCKPIT_OVERVIEW.kpi
  )

  /** 根据卡片数据生成迷你图趋势点（0~1），上升/下降 + 轻微波动 */
  function getTrendPoints(item: CockpitKpiCard, index: number): number[] {
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
      const x = (i / (points.length - 1)) * w
      const y = pad + (1 - p) * h
      return `${x},${y}`
    })
    return `M ${coords.join(' L ')}`
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
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 188px;
    min-height: 188px;
    padding: 16px;
    border: 1px solid transparent;
    border-radius: 10px;

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

    .kpi-detail {
      margin-bottom: 2px;
      font-size: 12px;
      opacity: 0.85;
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

    /* 六个颜色主题：总收入-绿、付费收入-橙、广告支出-蓝、有效订阅-橙蓝、DAU-蓝、预估利润-紫 */
    &--theme.cockpit-kpi-card--income {
      background: linear-gradient(135deg, rgb(103 194 58 / 12%) 0%, rgb(103 194 58 / 4%) 100%);
      border-color: rgb(103 194 58 / 25%);

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
      background: linear-gradient(135deg, rgb(230 162 60 / 14%) 0%, rgb(230 162 60 / 4%) 100%);
      border-color: rgb(230 162 60 / 30%);

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
      background: linear-gradient(135deg, rgb(64 158 255 / 14%) 0%, rgb(64 158 255 / 4%) 100%);
      border-color: rgb(64 158 255 / 28%);

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
      background: linear-gradient(135deg, rgb(230 162 60 / 12%) 0%, rgb(64 158 255 / 6%) 100%);
      border-color: rgb(230 162 60 / 25%);

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
      background: linear-gradient(135deg, rgb(64 158 255 / 12%) 0%, rgb(64 158 255 / 4%) 100%);
      border-color: rgb(64 158 255 / 28%);

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
      background: linear-gradient(135deg, rgb(114 46 209 / 12%) 0%, rgb(114 46 209 / 4%) 100%);
      border-color: rgb(114 46 209 / 28%);

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
