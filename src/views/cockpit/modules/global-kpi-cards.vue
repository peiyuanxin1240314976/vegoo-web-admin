<template>
  <ElRow :gutter="16" class="cockpit-kpi-row">
    <ElCol v-for="(item, index) in kpiList" :key="index" :xs="24" :sm="12" :md="6" :lg="6">
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
        <div class="kpi-mini-chart">
          <div class="mini-trend" />
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { CockpitKpiCard } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitGlobalKpiCards' })

  const props = withDefaults(defineProps<{ kpiList?: CockpitKpiCard[] }>(), { kpiList: () => [] })

  const kpiList = computed(() =>
    props.kpiList?.length ? props.kpiList : MOCK_COCKPIT_OVERVIEW.kpi
  )
</script>

<style scoped lang="scss">
  .cockpit-kpi-row {
    margin-bottom: 16px;
  }

  .cockpit-kpi-card {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 140px;
    min-height: 140px;
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
      position: absolute;
      top: 12px;
      right: 12px;
      width: 48px;
      height: 28px;
    }

    .mini-trend {
      width: 100%;
      height: 100%;
      border-radius: 6px;
      opacity: 0.35;
    }

    /* 四个颜色主题：收入-绿、花费-橙、DAU-蓝、盈亏-紫 */
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

      .mini-trend {
        background: linear-gradient(135deg, #67c23a 0%, transparent 100%);
      }
    }

    &--theme.cockpit-kpi-card--spend {
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

      .mini-trend {
        background: linear-gradient(135deg, #e6a23c 0%, transparent 100%);
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

      .mini-trend {
        background: linear-gradient(135deg, #409eff 0%, transparent 100%);
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

      .mini-trend {
        background: linear-gradient(135deg, #722ed1 0%, transparent 100%);
      }
    }
  }

  /* 深色主题下 KPI 卡片次要文字颜色（与项目 html.dark 一致） */
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--income .kpi-label,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--income .kpi-detail,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--income .kpi-sub,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--spend .kpi-label,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--spend .kpi-detail,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--spend .kpi-sub,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--dau .kpi-label,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--dau .kpi-detail,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--dau .kpi-sub,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--profit .kpi-label,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--profit .kpi-detail,
  html.dark .cockpit-kpi-card--theme.cockpit-kpi-card--profit .kpi-sub {
    color: rgb(255 255 255 / 82%);
  }
</style>
