<template>
  <div class="conversion-data-filters">
    <div class="conversion-data-filters__row">
      <ElDatePicker
        v-model="form.dateRange"
        type="daterange"
        unlink-panels
        range-separator="-"
        value-format="YYYY-MM-DD"
        :start-placeholder="$t('conversionManagement.dataFilterStart')"
        :end-placeholder="$t('conversionManagement.dataFilterEnd')"
        class="conversion-data-filters__date"
        @change="doSearch"
      />
      <ElSelect
        v-model="form.platform"
        :placeholder="$t('conversionManagement.filterPlatform')"
        clearable
        class="conversion-data-filters__select"
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
        class="conversion-data-filters__select"
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
        class="conversion-data-filters__select"
        @change="doSearch"
      >
        <ElOption
          v-for="opt in conversionTypeOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </ElSelect>
      <ElButton
        type="success"
        round
        class="conversion-data-filters__search-btn"
        @click="doSearch"
        v-ripple
      >
        {{ $t('conversionManagement.dataFilterSearch') }}
      </ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ConversionDataFilterParams } from '../types'
  import {
    MOCK_APP_OPTIONS,
    MOCK_CONVERSION_TYPE_OPTIONS,
    MOCK_PLATFORM_OPTIONS
  } from '../mock/data'

  defineOptions({ name: 'ConversionDataFilters' })

  const props = defineProps<{
    filter: ConversionDataFilterParams
    platformOptions?: { label: string; value: string }[]
    appOptions?: { label: string; value: string }[]
    conversionTypeOptions?: { label: string; value: string }[]
  }>()

  const emit = defineEmits<{
    (e: 'search', payload: ConversionDataFilterParams): void
  }>()

  const platformOptions = computed(() => props.platformOptions ?? MOCK_PLATFORM_OPTIONS)
  const appOptions = computed(() => props.appOptions ?? MOCK_APP_OPTIONS)
  const conversionTypeOptions = computed(
    () => props.conversionTypeOptions ?? MOCK_CONVERSION_TYPE_OPTIONS
  )

  const form = reactive({
    dateRange: props.filter?.dateRange ?? ['', ''],
    platform: String(props.filter?.platform ?? ''),
    app: String(props.filter?.app ?? ''),
    conversionType: String(props.filter?.conversionType ?? '')
  })

  watch(
    () => props.filter,
    (v) => {
      if (!v) return
      form.dateRange = v.dateRange ?? ['', '']
      form.platform = v.platform ?? ''
      form.app = v.app ?? ''
      form.conversionType = v.conversionType ?? ''
    },
    { deep: true }
  )

  function doSearch() {
    const dateRange =
      form.dateRange?.[0] && form.dateRange?.[1] ? (form.dateRange as [string, string]) : undefined
    emit('search', {
      dateRange,
      platform: form.platform,
      appPackage: form.app,
      app: form.app,
      conversionType: form.conversionType
    })
  }
</script>

<style scoped lang="scss">
  .conversion-data-filters__row {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: flex-start;
  }

  .conversion-data-filters__date {
    width: 200px;
    min-width: 200px;
  }

  .conversion-data-filters__select {
    width: 120px;
  }

  .conversion-data-filters__search-btn {
    height: 32px;
    padding: 0 18px;
    background-color: color-mix(in srgb, var(--el-color-success) 82%, black);
    border-color: color-mix(in srgb, var(--el-color-success) 82%, black);

    &:hover,
    &:focus {
      background-color: color-mix(in srgb, var(--el-color-success) 72%, black);
      border-color: color-mix(in srgb, var(--el-color-success) 72%, black);
    }
  }

  @media (width >= 1200px) {
    .conversion-data-filters__row {
      flex-wrap: nowrap;
      gap: 10px;
      justify-content: flex-start;
    }

    .conversion-data-filters__date {
      flex: 0 0 auto;
      width: 200px;
      min-width: 200px;
    }

    .conversion-data-filters__select {
      flex: 0 0 auto;
      width: 130px;
    }

    .conversion-data-filters__search-btn {
      flex: 0 0 auto;
      padding: 0 16px;
    }
  }
</style>
