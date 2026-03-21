<template>
  <!-- Weekly By Country - same layout as daily but with weekly labels -->
  <DailyByCountry :date-label="weekLabel" :prev-date-label="prevWeekLabel" />
</template>

<script setup lang="ts">
  import DailyByCountry from './DailyByCountry.vue'

  withDefaults(
    defineProps<{
      weekLabel?: string
      prevWeekLabel?: string
    }>(),
    {
      weekLabel: '3/9-3/15',
      prevWeekLabel: '3/2-3/8'
    }
  )
</script>
