<template>
  <ElRow :gutter="16" class="conversion-data-kpi">
    <ElCol v-for="card in cards" :key="card.key" :xs="24" :sm="12" :lg="6" :xl="6">
      <ElCard
        shadow="never"
        class="conversion-data-kpi__card"
        :style="{ borderColor: card.accentColor }"
      >
        <div class="conversion-data-kpi__label">{{ card.label }}</div>
        <div class="conversion-data-kpi__value-row">
          <div class="conversion-data-kpi__value" :style="{ color: card.accentColor }">
            {{ card.valueText }}
          </div>
          <div class="conversion-data-kpi__delta" :class="card.deltaClass">
            <span class="conversion-data-kpi__delta-arrow">{{ card.deltaArrow }}</span>
            <span>{{ card.deltaText }}</span>
          </div>
        </div>
      </ElCard>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import type { ConversionKpi } from '../types'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'ConversionDataKpiCards' })

  const props = withDefaults(
    defineProps<{
      kpi?: ConversionKpi | null
    }>(),
    { kpi: null }
  )

  const { t, n } = useI18n()

  function toDeltaMeta(deltaPercent: number) {
    const d = Number(deltaPercent || 0)
    const isUp = d >= 0
    const abs = Math.abs(d)
    return {
      deltaClass: isUp ? 'is-up' : 'is-down',
      deltaArrow: isUp ? '↑' : '↓',
      deltaText: `${abs}%`
    }
  }

  const cards = computed(() => {
    const kpi = props.kpi
    const numberOrDash = (v: number | undefined) => (Number.isFinite(v) ? n(v as number) : '-')
    const currencyOrDash = (v: number | undefined) =>
      Number.isFinite(v) ? `$${n(v as number)}` : '-'

    const conversionCount = kpi?.conversionCount
    const conversionValue = kpi?.conversionValue
    const averageValue = kpi?.averageValue
    const activeTypeCount = kpi?.activeTypeCount

    const ACCENT: Record<string, string> = {
      conversionCount: '#22c1c3',
      conversionValue: '#3b82f6',
      averageValue: '#22c55e',
      activeTypeCount: '#f59e0b'
    }

    return [
      {
        key: 'conversionCount',
        label: t('conversionManagement.kpiConversionCount'),
        valueText: numberOrDash(conversionCount?.value),
        accentColor: ACCENT.conversionCount,
        ...toDeltaMeta(conversionCount?.deltaPercent ?? 0)
      },
      {
        key: 'conversionValue',
        label: t('conversionManagement.kpiConversionValue'),
        valueText: currencyOrDash(conversionValue?.value),
        accentColor: ACCENT.conversionValue,
        ...toDeltaMeta(conversionValue?.deltaPercent ?? 0)
      },
      {
        key: 'averageValue',
        label: t('conversionManagement.kpiAverageValue'),
        valueText: currencyOrDash(averageValue?.value),
        accentColor: ACCENT.averageValue,
        ...toDeltaMeta(averageValue?.deltaPercent ?? 0)
      },
      {
        key: 'activeTypeCount',
        label: t('conversionManagement.kpiActiveTypeCount'),
        valueText: numberOrDash(activeTypeCount?.value),
        accentColor: ACCENT.activeTypeCount,
        ...toDeltaMeta(activeTypeCount?.deltaPercent ?? 0)
      }
    ]
  })
</script>

<style scoped lang="scss">
  .conversion-data-kpi {
    margin-bottom: 16px;
  }

  .conversion-data-kpi__card {
    background: color-mix(in srgb, var(--default-box-color) 92%, transparent);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
    box-shadow: 0 0 0 1px color-mix(in srgb, currentcolor 0%, transparent);
  }

  .conversion-data-kpi__label {
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .conversion-data-kpi__value-row {
    display: flex;
    gap: 10px;
    align-items: baseline;
    justify-content: space-between;
  }

  .conversion-data-kpi__value {
    font-size: 22px;
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  .conversion-data-kpi__delta {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 9999px;

    &.is-up {
      color: var(--el-color-success);
      background: color-mix(in srgb, var(--el-color-success) 16%, transparent);
    }

    &.is-down {
      color: var(--el-color-danger);
      background: color-mix(in srgb, var(--el-color-danger) 16%, transparent);
    }
  }

  .conversion-data-kpi__delta-arrow {
    font-size: 12px;
    line-height: 1;
  }
</style>
