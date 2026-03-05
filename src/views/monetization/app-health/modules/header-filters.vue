<template>
  <div class="app-health-header">
    <h1 class="app-health-title">App应用健康分析</h1>
    <div class="app-health-controls">
      <span class="control-label">App选择:</span>
      <ElSelect v-model="appModel" size="default" class="control-select" placeholder="全部">
        <ElOption label="全部" value="" />
        <ElOption label="Weather8" value="weather8" />
      </ElSelect>
      <ElSelect v-model="dateModel" size="default" class="control-select" placeholder="最近30天">
        <ElOption label="今日" value="today" />
        <ElOption label="昨日" value="yesterday" />
        <ElOption label="本周" value="week" />
        <ElOption label="最近30天" value="month" />
      </ElSelect>
      <span class="control-label">vs 上期对比</span>
      <ElSwitch v-model="compareModel" size="default" />
      <ElButton type="primary" :icon="Download" @click="onExport">导出报表</ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Download } from '@element-plus/icons-vue'

  defineOptions({ name: 'AppHealthHeaderFilters' })

  const props = withDefaults(
    defineProps<{
      app?: string
      dateRange?: string
      compare?: boolean
    }>(),
    { app: '', dateRange: 'month', compare: true }
  )

  const emit = defineEmits<{
    (e: 'update:app', v: string): void
    (e: 'update:dateRange', v: string): void
    (e: 'update:compare', v: boolean): void
    (e: 'export'): void
  }>()

  const appModel = computed({
    get: () => props.app,
    set: (v) => emit('update:app', v)
  })
  const dateModel = computed({
    get: () => props.dateRange,
    set: (v) => emit('update:dateRange', v)
  })
  const compareModel = computed({
    get: () => props.compare,
    set: (v) => emit('update:compare', v)
  })

  function onExport() {
    emit('export')
  }
</script>

<style scoped lang="scss">
  .app-health-header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 24px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .app-health-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .app-health-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    align-items: center;
  }

  .control-label {
    font-size: 14px;
    color: var(--el-text-color-regular);
  }

  .control-select {
    width: 120px;
  }
</style>
