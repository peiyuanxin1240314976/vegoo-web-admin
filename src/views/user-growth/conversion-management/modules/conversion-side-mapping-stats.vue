<template>
  <section class="conversion-side-module">
    <h3 class="conversion-side-module__title">{{ $t('conversionManagement.mappingStats') }}</h3>
    <div class="conversion-side-module__stats">
      <div class="conversion-side-module__stats-row conversion-side-module__stats-row--labels">
        <span class="conversion-side-module__stat-label">
          {{ $t('conversionManagement.mapped') }}
        </span>
        <span class="conversion-side-module__stat-label">
          {{ $t('conversionManagement.duplicateMapping') }}
        </span>
        <span class="conversion-side-module__stat-label">
          {{ $t('conversionManagement.unmapped') }}
        </span>
      </div>
      <div class="conversion-side-module__stats-row conversion-side-module__stats-row--values">
        <span class="conversion-side-module__stat-value conversion-side-module__stat-value--mapped">
          {{ stats.mapped }}{{ $t('conversionManagement.recordUnit') }}
        </span>
        <span
          class="conversion-side-module__stat-value conversion-side-module__stat-value--duplicate"
        >
          {{ stats.duplicate }}{{ $t('conversionManagement.recordUnit') }}
        </span>
        <span
          class="conversion-side-module__stat-value conversion-side-module__stat-value--unmapped"
        >
          {{ stats.unmapped }}{{ $t('conversionManagement.recordUnit') }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { MappingStats } from '../types'

  defineOptions({ name: 'ConversionSideMappingStats' })

  withDefaults(
    defineProps<{
      stats?: MappingStats
    }>(),
    { stats: () => ({ mapped: 0, duplicate: 0, unmapped: 0 }) }
  )
</script>

<style scoped lang="scss">
  .conversion-side-module {
    padding: 12px 14px;
    margin-bottom: 16px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .conversion-side-module__title {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .conversion-side-module__stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .conversion-side-module__stats-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
  }

  .conversion-side-module__stats-row--labels .conversion-side-module__stat-label {
    flex: 1;
    color: var(--el-text-color-regular);
    text-align: center;
  }

  .conversion-side-module__stats-row--values .conversion-side-module__stat-value {
    flex: 1;
    font-size: 22px;
    font-weight: 600;
    text-align: center;
  }

  .conversion-side-module__stat-value--mapped {
    color: var(--el-color-primary);
  }

  .conversion-side-module__stat-value--duplicate {
    color: var(--el-color-warning);
  }

  .conversion-side-module__stat-value--unmapped {
    color: var(--el-text-color-secondary);
  }
</style>
