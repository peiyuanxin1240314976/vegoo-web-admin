<template>
  <ElCard class="adk" shadow="never">
    <template #header>
      <span class="adk__title">核心指标</span>
    </template>
    <div class="adk__grid">
      <div v-for="card in cards" :key="card.key" class="adk__card">
        <div class="adk__card-top">
          <span class="adk__label">{{ card.label }}</span>
          <span
            v-if="card.trendDir !== 'flat'"
            class="adk__trend"
            :class="`adk__trend--${card.trendColor}`"
          >
            <el-icon v-if="card.trendDir === 'up'"><Top /></el-icon>
            <el-icon v-else><Bottom /></el-icon>
          </span>
        </div>
        <span class="adk__value">{{ card.value }}</span>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Top, Bottom } from '@element-plus/icons-vue'
  import type { AdKpiMetrics, AdKpiTrends, KpiTrendDir } from '../types'

  defineOptions({ name: 'AdDetailKpiCards' })

  const props = defineProps<{
    metrics: AdKpiMetrics
    trends?: AdKpiTrends
  }>()

  function fmtK(v: number): string {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
    return String(v)
  }

  /** CPI/消耗 升高 = 变差(danger)；安装/ROI 升高 = 变好(success) */
  function trendColor(key: string, dir: KpiTrendDir | undefined): 'success' | 'danger' | 'flat' {
    if (!dir || dir === 'flat') return 'flat'
    const goodWhenUp = key === 'installs' || key === 'roi'
    return (dir === 'up') === goodWhenUp ? 'success' : 'danger'
  }

  const cards = computed(() => {
    const m = props.metrics
    const t = props.trends ?? {}
    return [
      {
        key: 'spend',
        label: '消耗',
        value: `$${fmtK(m.spend)}`,
        trendDir: t.spend ?? 'flat',
        trendColor: trendColor('spend', t.spend)
      },
      {
        key: 'installs',
        label: '安装',
        value: fmtK(m.installs),
        trendDir: t.installs ?? 'flat',
        trendColor: trendColor('installs', t.installs)
      },
      {
        key: 'cpi',
        label: 'CPI',
        value: `$${m.cpi.toFixed(2)}`,
        trendDir: t.cpi ?? 'flat',
        trendColor: trendColor('cpi', t.cpi)
      },
      {
        key: 'roi',
        label: 'ROI',
        value: `${m.roi}%`,
        trendDir: t.roi ?? 'flat',
        trendColor: trendColor('roi', t.roi)
      }
    ]
  })
</script>

<style scoped lang="scss">
  @import '../../../styles/ap-card-fx';

  .adk {
    @include ap-neon-bg;
    @include ap-panel-hover;

    position: relative;
    overflow: hidden;
    border-radius: 14px;

    &::before {
      position: absolute;
      top: 0;
      left: 6%;
      z-index: 0;
      width: 88%;
      height: 1.5px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        rgb(249 115 22 / 72%),
        rgb(251 191 36 / 80%),
        rgb(16 185 129 / 65%),
        transparent
      );
      filter: blur(0.4px);
    }

    :deep(.el-card__header) {
      position: relative;
      z-index: 1;
      padding: 14px 18px 12px;
      background: transparent;
      border-bottom: 1px solid rgb(249 115 22 / 15%);
    }

    :deep(.el-card__body) {
      position: relative;
      z-index: 1;
      padding: 14px 18px 16px;
      background: transparent;
    }
  }

  .adk__title {
    @include ap-title-gradient;

    font-size: 13px;
  }

  .adk__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .adk__card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 16px;
    background: rgb(8 8 12 / 95%);
    border: 1px solid rgb(59 130 246 / 28%);
    border-radius: 10px;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      transform 0.22s ease;

    &:hover {
      border-color: rgb(96 165 250 / 55%);
      box-shadow: 0 0 20px rgb(59 130 246 / 18%);
      transform: translateY(-2px);
    }
  }

  .adk__card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .adk__label {
    font-size: 12px;
    color: #94a3b8;
  }

  .adk__trend {
    display: inline-flex;
    align-items: center;
    font-size: 14px;

    &--success {
      color: #10b981;
      filter: drop-shadow(0 0 4px rgb(16 185 129 / 50%));
    }

    &--danger {
      color: #ef4444;
      filter: drop-shadow(0 0 4px rgb(239 68 68 / 50%));
    }

    &--flat {
      display: none;
    }
  }

  .adk__value {
    display: inline-block;
    font-size: 26px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
    background-color: transparent;
    background-image: linear-gradient(92deg, #f0f9ff 0%, #7dd3fc 45%, #22d3ee 100%);
    -webkit-background-clip: text;
    background-clip: text;
    background-size: 100%;
    -webkit-text-fill-color: transparent;
  }
</style>
