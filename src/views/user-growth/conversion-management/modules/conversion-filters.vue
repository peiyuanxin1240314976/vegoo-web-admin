<template>
  <div class="conversion-filters">
    <div class="conversion-filters__header">
      <div class="conversion-filters__title-wrap">
        <h1 class="conversion-filters__title">{{ $t('conversionManagement.title') }}</h1>
        <p class="conversion-filters__desc">{{ $t('conversionManagement.description') }}</p>
      </div>
      <ElButton
        type="success"
        class="conversion-filters__add-btn"
        @click="$emit('add-mapping')"
        v-ripple
      >
        <ElIcon class="mr-1"><Plus /></ElIcon>
        {{ $t('conversionManagement.addMapping') }}
      </ElButton>
    </div>
    <div class="conversion-filters__row">
      <ElSelect
        v-model="form.platform"
        :placeholder="$t('conversionManagement.filterPlatform')"
        clearable
        class="conversion-filters__select"
        @change="doSearch"
      >
        <ElOption
          v-for="opt in platformOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </ElSelect>
      <ElSelect
        v-model="form.app"
        :placeholder="$t('conversionManagement.filterApp')"
        clearable
        class="conversion-filters__select"
        @change="doSearch"
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
        class="conversion-filters__select"
        @change="doSearch"
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
        class="conversion-filters__select"
        @change="doSearch"
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
        class="conversion-filters__search"
        @keyup.enter="doSearch"
        @clear="doSearch"
      >
        <template #prefix>
          <ElIcon><Search /></ElIcon>
        </template>
      </ElInput>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Plus, Search } from '@element-plus/icons-vue'
  import type { ConversionFilterParams } from '../types'
  import {
    MOCK_PLATFORM_OPTIONS,
    MOCK_APP_OPTIONS,
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
  const appOptions = computed(() => props.appOptions ?? MOCK_APP_OPTIONS)
  const conversionTypeOptions = computed(
    () => props.conversionTypeOptions ?? MOCK_CONVERSION_TYPE_OPTIONS
  )
  const statusOptions = computed(() => props.statusOptions ?? MOCK_STATUS_OPTIONS)

  const form = reactive<Record<string, string>>({
    platform: String(props.filter?.platform ?? ''),
    app: String(props.filter?.app ?? ''),
    conversionType: String(props.filter?.conversionType ?? ''),
    status: String(props.filter?.status ?? ''),
    keyword: String(props.filter?.keyword ?? '')
  })

  watch(
    () => props.filter,
    (v) => {
      if (v) {
        form.platform = v.platform ?? ''
        form.app = v.app ?? ''
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
      app: form.app,
      conversionType: form.conversionType,
      status: form.status,
      keyword: form.keyword
    })
  }
</script>

<style scoped lang="scss">
  .conversion-filters {
    margin-bottom: 16px;
  }

  .conversion-filters__header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .conversion-filters__title-wrap {
    flex: 1;
    min-width: 0;
  }

  .conversion-filters__title {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .conversion-filters__desc {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .conversion-filters__row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .conversion-filters__select {
    width: 140px;
  }

  .conversion-filters__search {
    width: 260px;
  }

  .conversion-filters__add-btn {
    background-color: color-mix(in srgb, var(--el-color-success) 82%, black);
    border-color: color-mix(in srgb, var(--el-color-success) 82%, black);
    border-radius: 9999px;

    &:hover,
    &:focus {
      background-color: color-mix(in srgb, var(--el-color-success) 72%, black);
      border-color: color-mix(in srgb, var(--el-color-success) 72%, black);
    }
  }
</style>
