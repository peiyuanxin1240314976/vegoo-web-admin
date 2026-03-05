<template>
  <div class="channel-attribution-with-insights">
    <div class="chart-section">
      <AttributionChannelAttributionChart :channels="channels" :series="series" />
    </div>
    <div class="insights-section">
      <AttributionKeyInsightsWarning :insight="insight" :suggestion="suggestion" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import AttributionChannelAttributionChart from './channel-attribution-chart.vue'
  import AttributionKeyInsightsWarning from './key-insights-warning.vue'

  defineOptions({ name: 'ChannelAttributionWithInsights' })

  defineProps<{
    channels?: string[]
    series?: Array<{ name: string; data: number[]; color?: string }>
    insight?: string
    suggestion?: string
  }>()
</script>

<style scoped lang="scss">
  .channel-attribution-with-insights {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    min-height: 0;
  }

  .chart-section {
    display: flex;
    flex: 0 0 80%;
    flex-direction: column;
    min-height: 0;
  }

  .insights-section {
    flex: 0 0 auto;
  }
</style>
