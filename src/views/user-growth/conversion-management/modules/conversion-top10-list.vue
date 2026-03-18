<template>
  <ElCard shadow="never" class="conversion-top10">
    <template #header>
      <div class="conversion-top10__header">{{ $t('conversionManagement.panelTop10') }}</div>
    </template>
    <div v-if="!items.length" class="conversion-top10__empty">
      {{ $t('conversionManagement.panelEmpty') }}
    </div>
    <div v-else class="conversion-top10__list">
      <div v-for="(it, idx) in items" :key="it.name" class="conversion-top10__item">
        <div class="conversion-top10__name">
          <span class="conversion-top10__rank">{{ idx + 1 }}</span>
          <span class="conversion-top10__name-text">{{ it.name }}</span>
        </div>
        <div class="conversion-top10__value">{{ n(it.value) }}</div>
        <div class="conversion-top10__bar">
          <div class="conversion-top10__bar-inner" :style="{ width: `${getPercent(it.value)}%` }" />
        </div>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import type { ConversionTop10Item } from '../types'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'ConversionTop10List' })

  const props = withDefaults(
    defineProps<{
      items?: ConversionTop10Item[]
    }>(),
    { items: () => [] }
  )

  const { n } = useI18n()

  const maxValue = computed(() => Math.max(1, ...(props.items ?? []).map((i) => i.value ?? 0)))
  function getPercent(v: number) {
    return Math.round(((v ?? 0) / maxValue.value) * 100)
  }
</script>

<style scoped lang="scss">
  .conversion-top10 {
    margin-bottom: 16px;
    border-radius: 10px;
  }

  .conversion-top10__header {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .conversion-top10__empty {
    padding: 10px 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .conversion-top10__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .conversion-top10__item {
    display: grid;
    grid-template-rows: auto auto;
    grid-template-columns: 1fr auto;
    gap: 6px 10px;
    align-items: center;
  }

  .conversion-top10__name {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .conversion-top10__rank {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 12px;
    color: var(--el-text-color-primary);
    background: color-mix(in srgb, var(--el-fill-color-light) 70%, transparent);
    border-radius: 9999px;
  }

  .conversion-top10__name-text {
    overflow: hidden;
    font-size: 13px;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .conversion-top10__value {
    font-size: 13px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--el-text-color-primary);
  }

  .conversion-top10__bar {
    grid-column: 1 / -1;
    height: 8px;
    overflow: hidden;
    background: color-mix(in srgb, var(--el-fill-color-light) 60%, transparent);
    border-radius: 9999px;
  }

  .conversion-top10__bar-inner {
    height: 100%;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--el-color-primary) 85%, transparent),
      color-mix(in srgb, var(--el-color-success) 85%, transparent)
    );
    border-radius: 9999px;
  }
</style>
