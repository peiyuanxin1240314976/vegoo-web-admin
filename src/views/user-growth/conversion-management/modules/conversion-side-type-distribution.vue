<template>
  <section class="conversion-side-module">
    <h3 class="conversion-side-module__title">{{ $t('conversionManagement.typeDistribution') }}</h3>
    <ConversionTypeChart :data="data" />
  </section>
</template>

<script setup lang="ts">
  import ConversionTypeChart from './conversion-type-chart.vue'
  import type { ConversionTypeDistributionItem } from '../types'

  defineOptions({ name: 'ConversionSideTypeDistribution' })

  withDefaults(
    defineProps<{
      data?: ConversionTypeDistributionItem[]
    }>(),
    { data: () => [] }
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
</style>
