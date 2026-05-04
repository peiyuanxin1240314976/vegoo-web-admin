<template>
  <div class="ad-performance-filters">
    <div class="ad-performance-filters__left">
      <AppDatePicker
        v-model="dateRangeValue"
        type="daterange"
        value-format="YYYY-MM-DD"
        range-separator="~"
        :start-placeholder="tr('adPerformance.startDate', '开始日期')"
        :end-placeholder="tr('adPerformance.endDate', '结束日期')"
        class="ad-performance-date-picker"
        :prefix-icon="Calendar"
      />

      <AppPlatformSearchSelect
        :model-value="draft.appId"
        mode="app"
        :placeholder="tr('adPerformance.filterApp', '应用')"
        :search-placeholder="tr('adPerformance.filterApp', '应用')"
        class="ad-performance-filter-select ad-performance-filter-select--app"
        input-class="ad-performance-filter-select__input"
        dropdown-class="ad-performance-filter-popper"
        :setting-apps="settingAppsForSelect"
        :height="36"
        :min-width="200"
        :max-width="240"
        @update:model-value="onAppChange"
      />

      <ElSelect
        :model-value="draft.adPlatform"
        :placeholder="tr('adPerformance.filterAdPlatform', '广告平台')"
        class="ad-performance-filter-select"
        popper-class="ad-performance-filter-popper"
        @update:model-value="onAdPlatformChange"
      >
        <ElOption :label="tr('adPerformance.filterAll', '全部')" value="" />
        <ElOption
          v-for="opt in adPlatformOptionsForSelect"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </ElSelect>

      <ElSelect
        :model-value="draft.account"
        :placeholder="tr('adPerformance.filterAccount', '账户')"
        class="ad-performance-filter-select"
        popper-class="ad-performance-filter-popper"
        @update:model-value="onAccountChange"
      >
        <ElOption :label="tr('adPerformance.filterAll', '全部')" value="" />
        <ElOption
          v-for="opt in accountOptionsForSelect"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </ElSelect>

      <ElSelect
        :model-value="draft.country"
        :placeholder="tr('adPerformance.filterCountry', '国家')"
        class="ad-performance-filter-select"
        popper-class="ad-performance-filter-popper"
        @update:model-value="onCountryChange"
      >
        <ElOption :label="tr('adPerformance.filterAll', '全部')" value="" />
        <ElOption
          v-for="opt in countryOptionsForSelect"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </ElSelect>

      <ElButton type="primary" plain round :icon="Search" @click="onQuery">
        {{ tr('adPerformance.query', '查询') }}
      </ElButton>
      <!-- <ElButton type="primary" plain round @click="$emit('export')">
        {{ tr('adPerformance.exportReport', '导出报表') }}
      </ElButton> -->
      <ElButton
        aria-label="刷新数据"
        type="primary"
        plain
        round
        :icon="RefreshRight"
        @click="$emit('refresh')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Calendar, RefreshRight, Search } from '@element-plus/icons-vue'
  import { computed, ref, watch } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { useI18n } from 'vue-i18n'
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import { useCockpitMetaFilterOptions } from '@/composables/use-cockpit-meta-filter'
  import type { CockpitSettingAppItem } from '@/types/cockpit-meta-filter'
  import type { AdPerformanceFilter, AdPerformanceMetaFilterResponse } from '../types'

  defineOptions({ name: 'AdPerformanceFilters' })

  const { t, te } = useI18n()
  const tr = (key: string, fallback: string) => (te(key) ? t(key) : fallback)
  const { cockpitMeta, ensureCockpitMetaLoaded } = useCockpitMetaFilterOptions()

  const props = withDefaults(
    defineProps<{
      filter: AdPerformanceFilter
      appCount?: number
      metaOptions?: AdPerformanceMetaFilterResponse | null
    }>(),
    { appCount: 0, metaOptions: null }
  )

  const emit = defineEmits<{
    (e: 'search', filter: AdPerformanceFilter): void
    (e: 'export'): void
    (e: 'refresh'): void
  }>()

  const draft = ref<AdPerformanceFilter>({ ...props.filter })

  void ensureCockpitMetaLoaded()

  function onQuery() {
    emit('search', { ...draft.value })
  }

  function patchDraft(partial: Partial<AdPerformanceFilter>) {
    draft.value = { ...draft.value, ...partial }
  }

  function onAppChange(v: string | string[]) {
    patchDraft({ appId: v })
  }

  function onAdPlatformChange(v: string) {
    patchDraft({ adPlatform: v ?? '' })
  }

  function onAccountChange(v: string) {
    patchDraft({ account: v ?? '' })
  }

  function onCountryChange(v: string) {
    patchDraft({ country: v ?? '' })
  }

  const dateRangeValue = computed<[string, string] | null>({
    get() {
      const start = draft.value.startDate?.trim()
      const end = draft.value.endDate?.trim()
      if (start && end) return [start, end]
      return null
    },
    set(v) {
      if (v) patchDraft({ startDate: v[0], endDate: v[1] })
    }
  })

  const defaultAppOptions = [
    { value: 'Weather5', label: 'Weather5' },
    { value: 'BloodSugar2', label: 'BloodSugar2' },
    { value: 'PhoneTracker', label: 'PhoneTracker' },
    { value: 'FaceMe', label: 'FaceMe' },
    { value: 'HealthTracker', label: 'HealthTracker' }
  ]

  const defaultAdPlatformOptions = [
    { value: 'google', label: 'Google' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'meta', label: 'Meta' },
    { value: 'kwai', label: 'Kwai' },
    { value: 'mintegral', label: 'Mintegral' }
  ]

  const appOptionsForSelect = computed(() => {
    const m = props.metaOptions?.appOptions?.filter((o) => o.value !== '')
    if (m?.length) return m
    return defaultAppOptions
  })

  const settingAppsForSelect = computed<CockpitSettingAppItem[]>(() => {
    const fromCockpit = cockpitMeta.value?.settingApps ?? []
    if (fromCockpit.length) return fromCockpit

    return appOptionsForSelect.value.map((opt, index) => ({
      sAppId: String(opt.value ?? ''),
      nPlatform: '',
      platformName: '',
      sAppName: String(opt.label ?? ''),
      sAppShortName: String(opt.label ?? ''),
      nCategory: `fallback-${index}`,
      categoryName: '应用'
    }))
  })

  const adPlatformOptionsForSelect = computed(() => {
    const m = props.metaOptions?.adPlatformOptions?.filter((o) => o.value !== '')
    if (m?.length) return m
    return defaultAdPlatformOptions
  })

  const accountOptionsForSelect = computed(() => {
    const m = props.metaOptions?.accountOptions?.filter((o) => o.value !== '')
    return m ?? []
  })

  const countryOptionsForSelect = computed(() => {
    const m = props.metaOptions?.countryOptions?.filter((o) => o.value !== '')
    if (m?.length) return m
    return [
      { label: 'US', value: 'US' },
      { label: 'UK', value: 'UK' },
      { label: 'CA', value: 'CA' },
      { label: 'JP', value: 'JP' },
      { label: 'BR', value: 'BR' }
    ]
  })

  const firstAppId = computed(() => {
    const firstSettingAppId = String(settingAppsForSelect.value[0]?.sAppId ?? '').trim()
    if (firstSettingAppId) return firstSettingAppId
    return String(appOptionsForSelect.value[0]?.value ?? '').trim()
  })

  watch(
    () => props.filter,
    (v) => {
      draft.value = { ...v }
    },
    { deep: true, immediate: true }
  )

  watch(
    [() => draft.value.appId, firstAppId],
    ([appId, fallbackAppId]) => {
      if ((Array.isArray(appId) ? appId.length > 0 : !!appId) || !fallbackAppId) return
      patchDraft({ appId: fallbackAppId })
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  @use '../../styles/app-platform-select-ad-theme.scss' as apSelect;
  @use '../../styles/filter-bar-theme.scss' as filterTheme;

  .ad-performance-filters {
    @include filterTheme.filter-panel(14px 16px);
    @include filterTheme.filter-panel-children;

    min-width: 0;
  }

  .ad-performance-filters__left {
    @include filterTheme.filter-row;

    flex: 1;
    min-width: 0;
  }

  .ad-performance-date-picker {
    flex: 0 0 250px;
    width: 250px;
    min-width: 250px;
    max-width: 250px;
  }

  :deep(.ad-performance-date-picker) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
    --el-date-editor-width: 250px;
    --el-date-editor-daterange-width: 250px;
  }

  :deep(.ad-performance-date-picker .el-input__wrapper),
  :deep(.ad-performance-date-picker .el-range-editor.el-input__wrapper),
  :deep(.ad-performance-date-picker.el-date-editor) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
    border-radius: var(--el-border-radius-base, 4px) !important;
    box-shadow: none !important;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.ad-performance-date-picker.el-date-editor) {
    width: 250px !important;
    min-width: 250px;
    max-width: 250px;
    height: 36px;
    padding: 0 10px;
  }

  :deep(.ad-performance-date-picker.el-date-editor .el-range-input) {
    font-size: 14px;
    color: var(--el-text-color-primary);
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }

  :deep(.ad-performance-date-picker.el-date-editor .el-range-input::placeholder) {
    color: var(--el-text-color-placeholder);
  }

  :deep(.ad-performance-date-picker.el-date-editor .el-range-separator) {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  :deep(.ad-performance-date-picker.el-date-editor .el-range__icon) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.ad-performance-date-picker.el-date-editor .el-range__close-icon) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.ad-performance-date-picker.el-date-editor:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent) !important;
  }

  :deep(.ad-performance-date-picker.el-date-editor.is-active),
  :deep(.ad-performance-date-picker.el-date-editor:focus-within) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  .ad-performance-filter-select {
    @include filterTheme.filter-select-size;
  }

  .ad-performance-filter-select--app {
    @include filterTheme.filter-select-size;
  }

  @include apSelect.apply-app-platform-select-ad-theme(
    '.ad-performance-filters__left',
    'ad-performance-filter-select__input',
    'ad-performance-filter-popper',
    240px,
    200px,
    240px
  );
  @include filterTheme.select-popper('ad-performance-filter-popper');
  @include filterTheme.app-platform-popper('ad-performance-filter-popper');

  :deep(.ad-performance-filter-select),
  :deep(.ad-performance-filter-select__input) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
  }

  :deep(.ad-performance-filter-select .el-select__wrapper),
  :deep(.ad-performance-filter-select .el-input__wrapper),
  :deep(.ad-performance-filter-select__input) {
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

  :deep(.ad-performance-filter-select .el-input__inner) {
    font-size: 14px;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
  }

  :deep(.ad-performance-filter-select .el-select__selected-item),
  :deep(.ad-performance-filter-select .el-select__selected-item .el-select__placeholder) {
    color: var(--el-text-color-primary);
  }

  :deep(.ad-performance-filter-select .el-select__placeholder.is-transparent),
  :deep(.ad-performance-filter-select .el-select__selected-item.is-transparent) {
    color: var(--el-text-color-placeholder);
  }

  :deep(.ad-performance-filter-select .el-input__prefix-inner) {
    margin-right: 4px;
  }

  :deep(.ad-performance-filter-select .el-input__prefix-inner svg) {
    width: 16px;
    height: 16px;
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.ad-performance-filter-select .el-select__caret),
  :deep(.ad-performance-filter-select__input .app-platform-search-select__suffix) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.ad-performance-filter-select .el-select__wrapper.is-focused),
  :deep(.ad-performance-filter-select .el-input__wrapper.is-focus),
  :deep(.ad-performance-filter-select__input.is-open) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  :deep(.ad-performance-filter-select .el-select__wrapper:hover),
  :deep(.ad-performance-filter-select .el-input__wrapper:hover),
  :deep(.ad-performance-filter-select__input:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  .ad-performance-filter-action-btn {
    --el-button-size: 36px;
    --el-button-bg-color: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    );
    --el-button-text-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-button-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-button-hover-text-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-button-hover-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-button-hover-bg-color: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 8%,
      transparent
    );
    --el-button-active-text-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-button-active-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-button-active-bg-color: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 10%,
      transparent
    );

    font-size: 14px;
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: 0 0 14px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 12%, transparent);
    transition: box-shadow 0.22s ease;

    &:hover {
      box-shadow: 0 0 22px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 28%, transparent);
    }
  }

  :deep(.ad-performance-filter-action-btn .el-icon) {
    font-size: 16px;
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  .ad-performance-filter-action-btn:focus-visible {
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 40%, transparent);
  }

  @media (width <= 768px) {
    .ad-performance-filters {
      flex-direction: column;
      align-items: stretch;
      padding: 14px 16px;
    }

    .ad-performance-filters__left {
      justify-content: flex-start;
    }

    .ad-performance-date-picker,
    .ad-performance-filter-select,
    .ad-performance-filter-select--app {
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }
  }
</style>
