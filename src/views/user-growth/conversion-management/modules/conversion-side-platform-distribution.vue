<template>
  <section class="conversion-side-module">
    <h3 class="conversion-side-module__title">
      {{ $t('conversionManagement.platformDistribution') }}
    </h3>
    <div class="conversion-side-module__platforms">
      <div class="conversion-side-module__platform-item">
        <span class="conversion-side-module__platform-label">
          {{ $t('conversionManagement.android') }}
        </span>
        <div class="conversion-side-module__progress-wrap">
          <ElProgress
            :percentage="androidPercent"
            :stroke-width="8"
            :show-text="false"
            class="conversion-side-module__progress"
          />
        </div>
        <span class="conversion-side-module__platform-num">{{ stats.android }}</span>
      </div>
      <div class="conversion-side-module__platform-item">
        <span class="conversion-side-module__platform-label">
          {{ $t('conversionManagement.ios') }}
        </span>
        <div class="conversion-side-module__progress-wrap">
          <ElProgress
            :percentage="iosPercent"
            :stroke-width="8"
            :show-text="false"
            class="conversion-side-module__progress"
          />
        </div>
        <span class="conversion-side-module__platform-num">{{ stats.ios }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { PlatformStats } from '../types'

  defineOptions({ name: 'ConversionSidePlatformDistribution' })

  const props = withDefaults(
    defineProps<{
      stats?: PlatformStats
    }>(),
    { stats: () => ({ android: 0, ios: 0 }) }
  )

  const total = computed(() => props.stats.android + props.stats.ios)

  const androidPercent = computed(() =>
    total.value > 0 ? Math.round((props.stats.android / total.value) * 100) : 0
  )

  const iosPercent = computed(() =>
    total.value > 0 ? Math.round((props.stats.ios / total.value) * 100) : 0
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

  .conversion-side-module__platforms {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .conversion-side-module__platform-item {
    display: flex;
    gap: 10px;
    align-items: center;
    color: var(--el-text-color-regular);
  }

  .conversion-side-module__platform-label {
    flex-shrink: 0;
    min-width: 48px;
    font-size: 15px;
  }

  .conversion-side-module__progress-wrap {
    flex: 1;
    min-width: 0;
  }

  .conversion-side-module__platform-num {
    flex-shrink: 0;
    min-width: 24px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-align: right;
  }

  .conversion-side-module__progress {
    :deep(.el-progress-bar__outer) {
      background-color: var(--el-fill-color-light);
    }
  }

  .conversion-side-module__platform-item:last-child
    .conversion-side-module__progress
    :deep(.el-progress-bar__inner) {
    background-color: var(--el-text-color-placeholder);
  }
</style>
