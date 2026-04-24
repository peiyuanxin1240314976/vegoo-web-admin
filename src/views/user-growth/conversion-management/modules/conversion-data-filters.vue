<template>
  <div class="conversion-data-filters">
    <div class="conversion-data-filters__inner">
      <div class="conversion-data-filters__row">
        <div class="conversion-data-filter-chip conversion-data-filter-chip--static">
          <ElIcon class="conversion-data-filter-chip__icon"><Calendar /></ElIcon>
          <span class="conversion-data-filter-chip__label">
            {{ $t('conversionManagement.dataFilterDateLabel') }}
          </span>
          <span class="conversion-data-filter-chip__value">{{ dateRangeChipText }}</span>
        </div>

        <AppDatePicker
          v-model="form.dateRange"
          type="daterange"
          :shortcuts="dateRangeShortcuts"
          unlink-panels
          range-separator="-"
          value-format="YYYY-MM-DD"
          :start-placeholder="$t('conversionManagement.dataFilterStart')"
          :end-placeholder="$t('conversionManagement.dataFilterEnd')"
          class="conversion-data-filters__date"
          @change="doSearch"
        />
        <AppPlatformSearchSelect
          v-model="form.appId"
          mode="app"
          :placeholder="$t('conversionManagement.filterApp')"
          :search-placeholder="$t('conversionManagement.filterApp')"
          class="conversion-data-filter-select conversion-data-filter-select--app"
          input-class="conversion-data-filter-select__input"
          :setting-apps="settingAppsForSelect"
          :height="36"
          :min-width="134"
          :max-width="220"
          @change="doSearch"
        />
        <ElSelect
          v-model="form.conversionType"
          :placeholder="$t('conversionManagement.filterConversionType')"
          clearable
          class="conversion-data-filter-select"
          :prefix-icon="TrendCharts"
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
          type="primary"
          class="conversion-data-filter-action-btn"
          @click="doSearch"
          v-ripple
        >
          {{ $t('conversionManagement.dataFilterSearch') }}
        </ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Calendar, TrendCharts } from '@element-plus/icons-vue'
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import { useCockpitMetaFilterOptions } from '@/composables/use-cockpit-meta-filter'
  import type { CockpitSettingAppItem } from '@/types/cockpit-meta-filter'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { useConversionMetaConversionTypeOptions } from '@/composables/use-conversion-meta-conversion-type'
  import type { ConversionDataFilterParams } from '../types'
  import { MOCK_DATA_TAB_APP_OPTIONS } from '../mock/data'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'

  defineOptions({ name: 'ConversionDataFilters' })

  const { cockpitMeta, ensureCockpitMetaLoaded } = useCockpitMetaFilterOptions()
  const { filterConversionTypeOptions, ensureLoaded: ensureConversionMetaConversionTypeLoaded } =
    useConversionMetaConversionTypeOptions()

  const props = defineProps<{
    filter: ConversionDataFilterParams
    platformOptions?: { label: string; value: string }[]
    appOptions?: { label: string; value: string }[]
    conversionTypeOptions?: { label: string; value: string }[]
  }>()

  const emit = defineEmits<{
    (e: 'search', payload: ConversionDataFilterParams): void
  }>()

  const settingAppsForSelect = computed<CockpitSettingAppItem[]>(() => {
    const fromCockpit = cockpitMeta.value?.settingApps ?? []
    if (fromCockpit.length) return fromCockpit

    const fallback = props.appOptions ?? MOCK_DATA_TAB_APP_OPTIONS
    return fallback
      .filter((opt) => opt.value !== '')
      .map((opt, index) => ({
        sAppId: String(opt.value ?? ''),
        nPlatform: '',
        platformName: '',
        sAppName: String(opt.label ?? ''),
        sAppShortName: String(opt.label ?? ''),
        nCategory: `fallback-${index}`,
        categoryName: '应用'
      }))
  })
  const conversionTypeOptions = computed(
    () => props.conversionTypeOptions ?? filterConversionTypeOptions.value
  )

  const form = reactive<{
    dateRange: [string, string]
    platform: string
    appId: string | string[]
    conversionType: string
  }>({
    dateRange: [props.filter?.startDate ?? '', props.filter?.endDate ?? ''] as [string, string],
    platform: String(props.filter?.platform ?? ''),
    appId: props.filter?.appId ?? [],
    conversionType: String(props.filter?.conversionType ?? '')
  })

  const dateRangeChipText = computed(() => {
    const r = form.dateRange
    if (r?.[0] && r?.[1]) return `${r[0]} — ${r[1]}`
    return '—'
  })

  onMounted(() => {
    void ensureCockpitMetaLoaded()
    void ensureConversionMetaConversionTypeLoaded()
  })

  watch(
    () => props.filter,
    (v) => {
      if (!v) return
      form.dateRange = [v.startDate ?? '', v.endDate ?? ''] as [string, string]
      form.platform = v.platform ?? ''
      form.appId = v.appId ?? []
      form.conversionType = v.conversionType ?? ''
    },
    { deep: true }
  )

  function doSearch() {
    const hasRange = Boolean(form.dateRange?.[0] && form.dateRange?.[1])
    emit('search', {
      ...(hasRange ? { startDate: form.dateRange![0], endDate: form.dateRange![1] } : {}),
      platform: form.platform,
      appId: form.appId,
      conversionType: form.conversionType
    })
  }
</script>

<style scoped lang="scss">
  .conversion-data-filters__inner {
    display: flex;
    flex-wrap: wrap;
    gap: 14px 16px;
    align-items: center;
    justify-content: space-between;
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

  .conversion-data-filters__row {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    min-width: 0;
  }

  .conversion-data-filter-chip {
    --cm-filter-accent: var(--theme-color, var(--art-primary, #3b82f6));

    display: inline-flex;
    gap: 7px;
    align-items: center;
    min-height: 36px;
    padding: 0 14px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: 0 0 16px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 10%, transparent);
  }

  .conversion-data-filter-chip__icon {
    font-size: 16px;
    color: var(--cm-filter-accent);
  }

  .conversion-data-filter-chip__label {
    max-width: 200px;
    overflow: hidden;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
  }

  .conversion-data-filter-chip__value {
    font-size: 13px;
    font-weight: 600;
    color: var(--cm-filter-accent);
  }

  .conversion-data-filters__date {
    flex: 0 1 200px;
    width: 200px;
    min-width: 170px;
    max-width: 100%;
  }

  /* Element Plus daterange root node also carries el-input__wrapper; force width to avoid being stretched */
  :deep(.conversion-data-filters__date.el-date-editor--daterange) {
    flex: 0 0 200px;
    width: 200px !important;
    min-width: 170px !important;
    max-width: 200px !important;
  }

  :deep(.conversion-data-filters__date .el-input__wrapper) {
    min-height: 36px;
    padding: 0 12px;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: none;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.conversion-data-filters__date .el-input__wrapper.is-focus) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  :deep(.conversion-data-filters__date .el-range-separator) {
    color: var(--el-text-color-secondary);
  }

  :deep(.conversion-data-filters__date .el-range-input) {
    font-size: 13px;
    color: var(--el-text-color-primary);
  }

  .conversion-data-filter-select {
    width: 134px;
    min-width: 110px;
    max-width: 100%;
  }

  :deep(.conversion-data-filter-select) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
  }

  :deep(.conversion-data-filter-select .el-select__wrapper),
  :deep(.conversion-data-filter-select .el-input__wrapper) {
    padding: 0 12px;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: none;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.conversion-data-filter-select .el-input__inner) {
    font-size: 14px;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
  }

  :deep(.conversion-data-filter-select .el-input__prefix-inner) {
    margin-right: 4px;
  }

  :deep(.conversion-data-filter-select .el-input__prefix-inner svg) {
    width: 16px;
    height: 16px;
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.conversion-data-filter-select .el-select__caret) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.conversion-data-filter-select .el-select__wrapper.is-focused),
  :deep(.conversion-data-filter-select .el-input__wrapper.is-focus) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  :deep(.conversion-data-filter-select .el-select__wrapper:hover),
  :deep(.conversion-data-filter-select .el-input__wrapper:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  .conversion-data-filter-action-btn {
    --el-button-size: 36px;

    height: 36px;
    padding: 0 20px;
    font-size: 14px;
    color: var(--theme-color, var(--art-primary, #3b82f6));
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: 0 0 18px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 20%, transparent);
    transition:
      box-shadow 0.22s ease,
      transform 0.18s ease;

    &:hover {
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 8%,
        transparent
      );
      box-shadow: 0 0 26px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 28%, transparent);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  @media (width <= 768px) {
    .conversion-data-filters__inner {
      padding: 14px 16px;
    }

    .conversion-data-filter-chip {
      flex-wrap: wrap;
      width: 100%;
      white-space: normal;
    }
  }
</style>
