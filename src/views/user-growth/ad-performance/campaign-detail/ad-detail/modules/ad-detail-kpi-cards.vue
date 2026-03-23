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
  .adk {
    background: var(--default-box-color);

    :deep(.el-card__header) {
      padding: 10px 16px 8px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 14px 16px;
    }
  }

  .adk__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .adk__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .adk__card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 14px;
    background: var(--default-bg-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;
  }

  .adk__card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .adk__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .adk__trend {
    display: inline-flex;
    align-items: center;
    font-size: 14px;

    &--success {
      color: var(--art-success);
    }

    &--danger {
      color: var(--art-danger);
    }

    &--flat {
      display: none;
    }
  }

  .adk__value {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.1;
    color: var(--el-text-color-primary);
  }
</style>
