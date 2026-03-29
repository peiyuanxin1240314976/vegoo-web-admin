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
    flex-shrink: 0;
    padding: 0 24px;
    margin-bottom: 0;

    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s ease;

      &.is-active {
        font-weight: 700;
        color: #10b981;
        text-shadow: 0 0 14px rgb(16 185 129 / 35%);
      }
    }

    :deep(.el-tabs__active-bar) {
      height: 3px;
      background: linear-gradient(90deg, #10b981, #34d399);
      border-radius: 9999px;
      box-shadow: 0 0 12px rgb(16 185 129 / 45%);
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }
  }
</style>
