<template>
  <div class="conversion-filters">
    <div class="conversion-filters__inner">
      <div class="conversion-filters__row">
        <ElSelect
          v-model="form.platform"
          :placeholder="$t('conversionManagement.filterPlatform')"
          clearable
          class="conversion-name-filter-select"
          :prefix-icon="Monitor"
        >
          <ElOption
            v-for="opt in platformOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
        <ElSelect
          v-model="form.appId"
          :placeholder="$t('conversionManagement.filterApp')"
          clearable
          class="conversion-name-filter-select"
          :prefix-icon="Grid"
        >
          <ElOption
            v-for="opt in appOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
        <ElSelect
          v-model="form.conversionType"
          :placeholder="$t('conversionManagement.filterConversionType')"
          clearable
          class="conversion-name-filter-select"
          :prefix-icon="CollectionTag"
        >
          <ElOption
            v-for="opt in conversionTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
        <ElSelect
          v-model="form.status"
          :placeholder="$t('conversionManagement.filterStatus')"
          clearable
          class="conversion-name-filter-select"
          :prefix-icon="CircleCheck"
        >
          <ElOption
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
        <ElInput
          v-model="form.keyword"
          :placeholder="$t('conversionManagement.searchPlaceholder')"
          clearable
          class="conversion-filters__search conversion-name-filter-input"
        >
          <template #prefix>
            <ElIcon><Search /></ElIcon>
          </template>
        </ElInput>
        <ElButton
          type="primary"
          round
          class="conversion-name-filter-action-btn"
          @click="doSearch"
          v-ripple
        >
          {{ $t('conversionManagement.dataFilterSearch') }}
        </ElButton>
        <ElButton
          type="primary"
          round
          class="conversion-filters__add-btn"
          @click="$emit('add-mapping')"
          v-ripple
        >
          <ElIcon class="mr-1"><Plus /></ElIcon>
          {{ $t('conversionManagement.addMapping') }}
        </ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { CircleCheck, CollectionTag, Grid, Monitor, Plus, Search } from '@element-plus/icons-vue'
  import type { ConversionFilterParams } from '../types'
  import {
    MOCK_PLATFORM_OPTIONS,
    MOCK_DATA_TAB_APP_OPTIONS,
    MOCK_CONVERSION_TYPE_OPTIONS,
    MOCK_STATUS_OPTIONS
  } from '../mock/data'

  defineOptions({ name: 'ConversionFilters' })

  const props = defineProps<{
    filter: ConversionFilterParams
    platformOptions?: { label: string; value: string }[]
    appOptions?: { label: string; value: string }[]
    conversionTypeOptions?: { label: string; value: string }[]
    statusOptions?: { label: string; value: string }[]
  }>()

  const emit = defineEmits<{
    (e: 'search', payload: ConversionFilterParams): void
    (e: 'add-mapping'): void
  }>()

  const platformOptions = computed(() => props.platformOptions ?? MOCK_PLATFORM_OPTIONS)
  const appOptions = computed(() => props.appOptions ?? MOCK_DATA_TAB_APP_OPTIONS)
  const conversionTypeOptions = computed(
    () => props.conversionTypeOptions ?? MOCK_CONVERSION_TYPE_OPTIONS
  )
  const statusOptions = computed(() => props.statusOptions ?? MOCK_STATUS_OPTIONS)

  const form = reactive<Record<string, string>>({
    platform: String(props.filter?.platform ?? ''),
    appId: String(props.filter?.appId ?? ''),
    conversionType: String(props.filter?.conversionType ?? ''),
    status: String(props.filter?.status ?? ''),
    keyword: String(props.filter?.keyword ?? '')
  })

  watch(
    () => props.filter,
    (v) => {
      if (v) {
        form.platform = v.platform ?? ''
        form.appId = v.appId ?? ''
        form.conversionType = v.conversionType ?? ''
        form.status = v.status ?? ''
        form.keyword = v.keyword ?? ''
      }
    },
    { deep: true }
  )

  function doSearch() {
    emit('search', {
      platform: form.platform,
      appId: form.appId,
      conversionType: form.conversionType,
      status: form.status,
      keyword: form.keyword
    })
  }
</script>

<style scoped lang="scss">
  .conversion-filters__inner {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
    padding: 18px 20px;
    background: rgb(10 10 14 / 82%);
    backdrop-filter: blur(12px);
    border: 1px solid rgb(96 165 250 / 20%);
    border-radius: 16px;
    box-shadow:
      0 8px 32px rgb(0 0 0 / 40%),
      inset 0 1px 0 rgb(186 230 253 / 10%),
      0 0 40px rgb(59 130 246 / 8%);
  }

  .conversion-filters__header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
  }

  .conversion-filters__title-wrap {
    flex: 1;
    min-width: 0;
  }

  .conversion-filters__title {
    margin: 0 0 6px;
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    text-shadow: 0 0 24px rgb(16 185 129 / 18%);
  }

  .conversion-filters__desc {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-secondary);
  }

  .conversion-filters__row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
  }

  .conversion-name-filter-select {
    width: 140px;
    min-width: 110px;
    max-width: 100%;
  }

  :deep(.conversion-name-filter-select) {
    --el-input-focus-border-color: #10b981;
    --el-border-color-hover: rgb(16 185 129 / 75%);
    --el-color-primary: #10b981;
    --el-border-color-focus: #10b981;
    --el-component-size: 40px;
  }

  :deep(.conversion-name-filter-select .el-input__wrapper) {
    padding: 0 12px;
    background: rgb(16 185 129 / 6%);
    border: 1px solid rgb(16 185 129 / 28%);
    border-radius: 9999px;
    box-shadow: none;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.conversion-name-filter-select .el-input__inner) {
    font-size: 14px;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
  }

  :deep(.conversion-name-filter-select .el-input__prefix-inner) {
    margin-right: 4px;
  }

  :deep(.conversion-name-filter-select .el-input__prefix-inner svg) {
    width: 16px;
    height: 16px;
    color: #10b981;
    filter: drop-shadow(0 0 5px rgb(16 185 129 / 50%));
  }

  :deep(.conversion-name-filter-select .el-select__caret) {
    color: #10b981;
  }

  :deep(.conversion-name-filter-select .el-input__wrapper.is-focus) {
    background: rgb(16 185 129 / 10%) !important;
    border-color: #10b981 !important;
    box-shadow: 0 0 0 2px rgb(16 185 129 / 20%) !important;
  }

  :deep(.conversion-name-filter-select .el-input__wrapper:hover) {
    border-color: rgb(16 185 129 / 60%);
    box-shadow: 0 0 12px rgb(16 185 129 / 18%);
  }

  .conversion-filters__search {
    flex: 0 1 180px;
    width: 180px;
    min-width: 140px;
    max-width: 100%;
  }

  :deep(.conversion-name-filter-input .el-input__wrapper) {
    min-height: 40px;
    padding: 0 12px;
    background: rgb(16 185 129 / 6%);
    border: 1px solid rgb(16 185 129 / 28%);
    border-radius: 9999px;
    box-shadow: none;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.conversion-name-filter-input .el-input__wrapper.is-focus) {
    background: rgb(16 185 129 / 10%) !important;
    border-color: #10b981 !important;
    box-shadow: 0 0 0 2px rgb(16 185 129 / 20%) !important;
  }

  :deep(.conversion-name-filter-input .el-input__wrapper:hover) {
    border-color: rgb(16 185 129 / 60%);
    box-shadow: 0 0 12px rgb(16 185 129 / 18%);
  }

  :deep(.conversion-name-filter-input .el-input__inner) {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  :deep(.conversion-name-filter-input .el-input__prefix-inner) {
    margin-right: 6px;
    color: #10b981;
  }

  .conversion-filters__add-btn {
    --el-button-size: 40px;

    flex-shrink: 0;
    height: 40px;
    padding: 0 20px;
    font-size: 14px;
    background: linear-gradient(135deg, rgb(16 185 129 / 92%), rgb(5 150 105 / 88%));
    border: 1px solid rgb(16 185 129 / 55%);
    box-shadow:
      0 0 18px rgb(16 185 129 / 28%),
      inset 0 1px 0 rgb(255 255 255 / 12%);
    transition:
      box-shadow 0.22s ease,
      transform 0.18s ease;

    &:hover {
      box-shadow:
        0 0 26px rgb(16 185 129 / 42%),
        inset 0 1px 0 rgb(255 255 255 / 18%);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .conversion-name-filter-action-btn {
    --el-button-size: 40px;

    height: 40px;
    padding: 0 20px;
    font-size: 14px;
    background: linear-gradient(135deg, rgb(16 185 129 / 92%), rgb(5 150 105 / 88%));
    border: 1px solid rgb(16 185 129 / 55%);
    box-shadow:
      0 0 18px rgb(16 185 129 / 28%),
      inset 0 1px 0 rgb(255 255 255 / 12%);
    transition:
      box-shadow 0.22s ease,
      transform 0.18s ease;

    &:hover {
      box-shadow:
        0 0 26px rgb(16 185 129 / 42%),
        inset 0 1px 0 rgb(255 255 255 / 18%);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  @media (width <= 768px) {
    .conversion-filters__inner {
      padding: 14px 16px;
    }

    .conversion-name-filter-select {
      flex: 1 1 calc(50% - 6px);
    }
  }
</style>
