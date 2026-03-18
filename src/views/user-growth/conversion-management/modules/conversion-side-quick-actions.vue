<template>
  <section class="conversion-side-module">
    <h3 class="conversion-side-module__title">{{ $t('conversionManagement.quickActions') }}</h3>
    <div class="conversion-side-module__actions">
      <div class="conversion-side-module__actions-row">
        <ElButton class="conversion-side-module__btn" @click="$emit('batch-enable')">
          {{ $t('conversionManagement.batchEnable') }}
        </ElButton>
        <ElButton class="conversion-side-module__btn" @click="$emit('batch-disable')">
          {{ $t('conversionManagement.batchDisable') }}
        </ElButton>
      </div>
      <ElButton
        class="conversion-side-module__btn conversion-side-module__btn--full"
        @click="$emit('export')"
      >
        {{ $t('conversionManagement.exportMapping') }}
      </ElButton>
    </div>
  </section>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ConversionSideQuickActions' })

  defineEmits<{
    (e: 'batch-enable'): void
    (e: 'batch-disable'): void
    (e: 'export'): void
  }>()
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

  .conversion-side-module__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .conversion-side-module__actions-row {
    display: flex;
    gap: 8px;
  }

  .conversion-side-module__btn {
    flex: 1;
  }

  .conversion-side-module__btn--full {
    width: 100%;
  }
</style>
