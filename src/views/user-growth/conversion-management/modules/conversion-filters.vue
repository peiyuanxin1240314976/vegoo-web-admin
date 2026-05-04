<template>
  <div class="conversion-filters">
    <div class="conversion-filters__inner">
      <div class="conversion-filters__row">
        <AppPlatformSearchSelect
          v-model="form.appId"
          mode="app"
          :placeholder="$t('conversionManagement.filterApp')"
          :search-placeholder="$t('conversionManagement.filterApp')"
          class="conversion-name-filter-select conversion-name-filter-select--app"
          input-class="conversion-name-filter-select__input"
          dropdown-class="conversion-name-filter-popper"
          :setting-apps="settingAppsForSelect"
          :height="36"
          :min-width="140"
          :max-width="220"
        />
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
        <ElButton type="primary" plain round :icon="Search" @click="doSearch" v-ripple>
          {{ $t('conversionManagement.dataFilterSearch') }}
        </ElButton>
        <ElButton type="primary" plain round @click="$emit('add-mapping')" v-ripple>
          <ElIcon class="mr-1"><Plus /></ElIcon>
          {{ $t('conversionManagement.addMapping') }}
        </ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { CircleCheck, CollectionTag, Plus, Search } from '@element-plus/icons-vue'
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import { useCockpitMetaFilterOptions } from '@/composables/use-cockpit-meta-filter'
  import type { CockpitSettingAppItem } from '@/types/cockpit-meta-filter'
  import { useConversionMetaConversionTypeOptions } from '@/composables/use-conversion-meta-conversion-type'
  import type { ConversionFilterParams } from '../types'
  import { MOCK_DATA_TAB_APP_OPTIONS, MOCK_STATUS_OPTIONS } from '../mock/data'

  defineOptions({ name: 'ConversionFilters' })

  const { cockpitMeta, ensureCockpitMetaLoaded } = useCockpitMetaFilterOptions()
  const { filterConversionTypeOptions, ensureLoaded: ensureConversionMetaConversionTypeLoaded } =
    useConversionMetaConversionTypeOptions()

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

  /** 与公用 `cockpit/meta-filter-options` 的 `platformOptions` 一致；无数据时回退 mock，并保证含「全部」`value: ''` */
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
  const statusOptions = computed(() => props.statusOptions ?? MOCK_STATUS_OPTIONS)

  const form = reactive<{
    platform: string
    appId: string | string[]
    conversionType: string
    status: string
    keyword: string
  }>({
    platform: String(props.filter?.platform ?? ''),
    appId: props.filter?.appId ?? [],
    conversionType: String(props.filter?.conversionType ?? ''),
    status: String(props.filter?.status ?? ''),
    keyword: String(props.filter?.keyword ?? '')
  })

  onMounted(() => {
    void ensureCockpitMetaLoaded()
    void ensureConversionMetaConversionTypeLoaded()
  })

  watch(
    () => props.filter,
    (v) => {
      if (v) {
        form.platform = v.platform ?? ''
        form.appId = v.appId ?? []
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
  @use '../../styles/app-platform-select-ad-theme.scss' as apSelect;

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

  @include apSelect.apply-app-platform-select-ad-theme(
    '.conversion-filters__row',
    'conversion-name-filter-select__input',
    'conversion-name-filter-popper',
    220px,
    140px,
    220px
  );

  :deep(.conversion-name-filter-select) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
  }

  :deep(.conversion-name-filter-select .el-select__wrapper),
  :deep(.conversion-name-filter-select .el-input__wrapper) {
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
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.conversion-name-filter-select .el-select__caret) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.conversion-name-filter-select .el-select__wrapper.is-focused),
  :deep(.conversion-name-filter-select .el-input__wrapper.is-focus) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  :deep(.conversion-name-filter-select .el-select__wrapper:hover),
  :deep(.conversion-name-filter-select .el-input__wrapper:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  .conversion-filters__search {
    flex: 0 1 180px;
    width: 180px;
    min-width: 140px;
    max-width: 100%;
  }

  :deep(.conversion-name-filter-input .el-input__wrapper) {
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

  :deep(.conversion-name-filter-input .el-input__wrapper.is-focus) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  :deep(.conversion-name-filter-input .el-input__wrapper:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  :deep(.conversion-name-filter-input .el-input__inner) {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  :deep(.conversion-name-filter-input .el-input__prefix-inner) {
    margin-right: 6px;
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  .conversion-filters__add-btn {
    --el-button-size: 36px;

    flex-shrink: 0;
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

  .conversion-name-filter-action-btn {
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
    .conversion-filters__inner {
      padding: 14px 16px;
    }

    .conversion-name-filter-select {
      flex: 1 1 calc(50% - 6px);
    }
  }
</style>
