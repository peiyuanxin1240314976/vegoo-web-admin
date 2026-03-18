<template>
  <div>
    <ConversionSideTypeDistribution :data="typeDistribution" />
    <ConversionSideMappingStats :stats="mappingStats" />
    <ConversionSidePlatformDistribution :stats="platformStats" />
    <ConversionSideQuickActions
      @batch-enable="$emit('batch-enable')"
      @batch-disable="$emit('batch-disable')"
      @export="$emit('export')"
    />
  </div>
</template>

<script setup lang="ts">
  import ConversionSideTypeDistribution from './conversion-side-type-distribution.vue'
  import ConversionSideMappingStats from './conversion-side-mapping-stats.vue'
  import ConversionSidePlatformDistribution from './conversion-side-platform-distribution.vue'
  import ConversionSideQuickActions from './conversion-side-quick-actions.vue'
  import type { ConversionTypeDistributionItem, MappingStats, PlatformStats } from '../types'

  defineOptions({ name: 'ConversionSidePanel' })

  withDefaults(
    defineProps<{
      typeDistribution?: ConversionTypeDistributionItem[]
      mappingStats?: MappingStats
      platformStats?: PlatformStats
    }>(),
    {
      typeDistribution: () => [],
      mappingStats: () => ({ mapped: 0, duplicate: 0, unmapped: 0 }),
      platformStats: () => ({ android: 0, ios: 0 })
    }
  )

  defineEmits<{
    (e: 'batch-enable'): void
    (e: 'batch-disable'): void
    (e: 'export'): void
  }>()
</script>
