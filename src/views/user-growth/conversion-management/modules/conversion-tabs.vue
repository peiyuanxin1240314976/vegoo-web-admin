<template>
  <div class="conversion-tabs">
    <ElTabs v-model="activeTab" @tab-change="handleTabChange">
      <ElTabPane :name="'name'" :label="$t('conversionManagement.tabName')" />
      <ElTabPane :name="'data'" :label="$t('conversionManagement.tabData')" />
    </ElTabs>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ConversionTabs' })

  type TabValue = 'name' | 'data'

  const props = withDefaults(
    defineProps<{
      modelValue?: TabValue
    }>(),
    { modelValue: 'name' }
  )

  const emit = defineEmits<{
    (e: 'update:modelValue', value: TabValue): void
  }>()

  const activeTab = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v as TabValue)
  })

  function handleTabChange(name: string | number) {
    emit('update:modelValue', name as TabValue)
  }
</script>

<style scoped lang="scss">
  .conversion-tabs {
    margin-bottom: 16px;

    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;

      &.is-active {
        color: var(--el-color-success);
      }
    }

    :deep(.el-tabs__active-bar) {
      background-color: var(--el-color-success);
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }
  }
</style>
