<template>
  <ElCard shadow="never" class="conversion-account-share">
    <template #header>
      <div class="conversion-account-share__header">
        {{ $t('conversionManagement.panelAccountShare') }}
      </div>
    </template>

    <div v-if="!items.length" class="conversion-account-share__empty">
      {{ $t('conversionManagement.panelEmpty') }}
    </div>

    <div v-else class="conversion-account-share__list">
      <div v-for="it in items" :key="it.accountName" class="conversion-account-share__item">
        <div class="conversion-account-share__name" :title="it.accountName">
          {{ it.accountName }}
        </div>
        <div class="conversion-account-share__bar">
          <div
            v-for="seg in it.segments"
            :key="seg.type"
            class="conversion-account-share__seg"
            :style="{ width: `${seg.percent}%`, backgroundColor: getColor(seg.type) }"
            :title="`${seg.type}: ${seg.percent}%`"
          />
        </div>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import type { ConversionAccountShareItem } from '../types'

  defineOptions({ name: 'ConversionAccountShareBar' })

  withDefaults(
    defineProps<{
      items?: ConversionAccountShareItem[]
    }>(),
    { items: () => [] }
  )

  const TYPE_TAG_COLOR: Record<string, string> = {
    PHONE_CALL_LEAD: '#4ABEFF',
    DOWNLOAD: '#67c23a',
    PURCHASE: '#e6a23c',
    ADD_TO_CART: '#722ed1',
    PAGE_VIEW: '#909399',
    BEGIN_CHECKOUT: '#f56c6c'
  }

  function getColor(type: string) {
    return TYPE_TAG_COLOR[type] ?? 'var(--el-color-primary)'
  }
</script>

<style scoped lang="scss">
  .conversion-account-share {
    margin-bottom: 16px;
    border-radius: 10px;
  }

  .conversion-account-share__header {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .conversion-account-share__empty {
    padding: 10px 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .conversion-account-share__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .conversion-account-share__item {
    display: grid;
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .conversion-account-share__name {
    overflow: hidden;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .conversion-account-share__bar {
    display: flex;
    gap: 2px;
    height: 16px !important;
    min-height: 16px;
    overflow: hidden;
    background: color-mix(in srgb, var(--el-fill-color-light) 60%, transparent);
    border-radius: 9999px;
  }

  .conversion-account-share__seg {
    height: 100% !important;
    border-radius: 9999px;
    opacity: 0.9;
  }
</style>
