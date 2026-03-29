<template>
  <div class="conversion-data-side">
    <div
      v-loading="loading"
      class="conversion-data-side__loading-root"
      element-loading-background="color-mix(in srgb, var(--default-box-color) 88%, transparent)"
    >
      <ElRow :gutter="16" class="conversion-data-side__row">
        <ElCol :xs="24" :sm="12">
          <ElCard shadow="never" class="conversion-data-side__card">
            <template #header>
              <div class="conversion-data-side__header">
                {{ $t('conversionManagement.panelTypeDistribution') }}
              </div>
            </template>
            <ConversionTypeChart :data="typeDistribution" />
          </ElCard>
        </ElCol>
        <ElCol :xs="24" :sm="12">
          <ConversionTop10List :items="top10" />
        </ElCol>
      </ElRow>

      <ConversionValueTrendChart :data="valueTrend30d" />
      <ConversionAccountShareBar :items="accountShare" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import ConversionTypeChart from './conversion-type-chart.vue'
  import ConversionTop10List from './conversion-top10-list.vue'
  import ConversionValueTrendChart from './conversion-value-trend-chart.vue'
  import ConversionAccountShareBar from './conversion-account-share-bar.vue'
  import type {
    ConversionAccountShareItem,
    ConversionTop10Item,
    ConversionTypeDistributionItem,
    ConversionValueTrendPoint
  } from '../types'

  defineOptions({ name: 'ConversionDataSidePanel' })

  withDefaults(
    defineProps<{
      typeDistribution?: ConversionTypeDistributionItem[]
      top10?: ConversionTop10Item[]
      valueTrend30d?: ConversionValueTrendPoint[]
      accountShare?: ConversionAccountShareItem[]
      loading?: boolean
    }>(),
    {
      typeDistribution: () => [],
      top10: () => [],
      valueTrend30d: () => [],
      accountShare: () => [],
      loading: false
    }
  )
</script>

<style scoped lang="scss">
  .conversion-data-side__loading-root {
    min-height: 120px;
  }

  .conversion-data-side__row {
    margin-bottom: 16px;
  }

  .conversion-data-side__card {
    background: rgb(10 10 14 / 72%);
    border: 1px solid rgb(96 165 250 / 20%);
    border-radius: 14px;
    box-shadow:
      0 8px 28px rgb(0 0 0 / 36%),
      inset 0 1px 0 rgb(186 230 253 / 8%);
  }

  .conversion-data-side__header {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
</style>
