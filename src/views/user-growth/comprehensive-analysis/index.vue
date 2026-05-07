<template>
  <div
    class="comprehensive-analysis-page ca-page"
    :class="{
      'art-full-height': isPlatformAnalysisDetail,
      'is-platform-analysis-detail': isPlatformAnalysisDetail
    }"
  >
    <router-view v-if="isPlatformAnalysisDetail" />
    <template v-else>
      <header class="ca-header ca-entry-1">
        <div class="ca-filters-bar">
          <div class="ca-filters-left">
            <AppDatePicker
              v-model="dateRangeValue"
              type="daterange"
              value-format="YYYY-MM-DD"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="ca-filter-date-picker"
              popper-class="ca-select-popper"
              :prefix-icon="Calendar"
            />

            <AppPlatformSearchSelect
              v-model="filters.s_app_id"
              mode="app"
              placeholder="应用"
              search-placeholder="应用"
              class="ca-filter-select ca-filter-select--app"
              input-class="ca-filter-select__input"
              :setting-apps="settingAppsForSelect"
              :height="36"
              :min-width="200"
              :max-width="240"
              dropdown-class="ca-select-popper"
            />

            <ElSelect
              :model-value="filters.adPlatform"
              class="ca-filter-select ca-filter-select--source"
              placeholder="广告平台"
              popper-class="ca-select-popper"
              clearable
              @update:model-value="onAdPlatformFilterUpdate"
            >
              <ElOption :label="tr('adPerformance.filterAll', '全部')" value="" />
              <ElOption
                v-for="opt in sourceOptionsForSelect"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
            <ElSelect
              :model-value="filters.s_country_code"
              class="ca-filter-select ca-filter-select--country"
              placeholder="国家"
              popper-class="ca-select-popper"
              filterable
              clearable
              @update:model-value="onCountryFilterUpdate"
            >
              <ElOption :label="tr('adPerformance.filterAll', '全部')" value="" />
              <ElOption
                v-for="opt in countryOptionsForSelect"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>

            <ElButton type="primary" plain round :icon="Search" @click="loadData"> 查询 </ElButton>
          </div>
        </div>
      </header>

      <main class="ca-main ca-entry-2">
        <section class="ca-kpi-grid">
          <template v-if="kpiLoading">
            <article
              v-for="idx in 5"
              :key="`kpi-skeleton-${idx}`"
              class="ca-kpi ca-neon-lift-card ca-entry-3"
            >
              <ElSkeleton animated>
                <template #template>
                  <div class="ca-kpi-skeleton">
                    <ElSkeletonItem variant="text" class="ca-kpi-skeleton__title" />
                    <ElSkeletonItem variant="text" class="ca-kpi-skeleton__value" />
                    <ElSkeletonItem variant="text" class="ca-kpi-skeleton__sub" />
                  </div>
                </template>
              </ElSkeleton>
            </article>
          </template>
          <article
            v-else
            v-for="card in pageData?.kpis ?? []"
            :key="card.id"
            class="ca-kpi ca-neon-lift-card ca-entry-3"
          >
            <div class="ca-kpi__body">
              <div class="ca-kpi__left">
                <div class="ca-kpi__title">{{ card.title }}</div>
                <div class="ca-kpi__value tabular-nums">{{ card.primaryValue }}</div>
                <div class="ca-kpi__sub">{{ card.subTitle }}</div>
              </div>
              <div
                class="ca-kpi__trend-pill"
                :class="card.trendUp ? 'ca-kpi__trend-pill--up' : 'ca-kpi__trend-pill--down'"
              >
                <el-icon class="ca-kpi__trend-icon">
                  <Top v-if="card.trendUp" />
                  <Bottom v-else />
                </el-icon>
                <span class="ca-kpi__trend-pct tabular-nums">{{ card.trendText }}</span>
                <span v-if="card.trendCompareLabel" class="ca-kpi__trend-compare">
                  {{ card.trendCompareLabel }}
                </span>
              </div>
            </div>
          </article>
        </section>

        <ElSkeleton :loading="platformLoading" animated>
          <template #template>
            <div class="ca-section-skeleton">
              <div class="ca-section-skeleton__grid ca-section-skeleton__grid--mid">
                <div v-for="idx in 4" :key="`mid-card-${idx}`" class="ca-section-skeleton-card">
                  <ElSkeletonItem variant="text" class="ca-section-skeleton-card__title" />
                  <ElSkeletonItem
                    variant="text"
                    class="ca-section-skeleton-card__line ca-section-skeleton-card__line--w60"
                  />
                  <ElSkeletonItem
                    variant="text"
                    class="ca-section-skeleton-card__line ca-section-skeleton-card__line--w88"
                  />
                  <ElSkeletonItem
                    variant="text"
                    class="ca-section-skeleton-card__line ca-section-skeleton-card__line--w76"
                  />
                  <ElSkeletonItem
                    variant="text"
                    class="ca-section-skeleton-card__line ca-section-skeleton-card__line--w92"
                  />
                  <ElSkeletonItem
                    variant="text"
                    class="ca-section-skeleton-card__line ca-section-skeleton-card__line--w68"
                  />
                </div>
              </div>

              <div class="ca-section-skeleton__grid ca-section-skeleton__grid--bottom">
                <div v-for="idx in 2" :key="`bottom-card-${idx}`" class="ca-section-skeleton-card">
                  <ElSkeletonItem variant="text" class="ca-section-skeleton-card__title" />
                  <ElSkeletonItem
                    variant="text"
                    class="ca-section-skeleton-card__line ca-section-skeleton-card__line--w80"
                  />
                  <ElSkeletonItem
                    variant="text"
                    class="ca-section-skeleton-card__line ca-section-skeleton-card__line--w92"
                  />
                  <ElSkeletonItem
                    variant="text"
                    class="ca-section-skeleton-card__line ca-section-skeleton-card__line--w74"
                  />
                  <ElSkeletonItem
                    variant="text"
                    class="ca-section-skeleton-card__line ca-section-skeleton-card__line--w86"
                  />
                </div>
              </div>
            </div>
          </template>
          <SectionPlatform :data="pageData" @drill-down="handleDrillDown" />
        </ElSkeleton>
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed, defineAsyncComponent, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter, useRoute } from 'vue-router'
  import { Top, Bottom, Calendar, Search } from '@element-plus/icons-vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import type { CockpitSettingAppItem } from '@/types/cockpit-meta-filter'
  import type {
    ComprehensiveAnalysisFilterState,
    ComprehensiveAnalysisData,
    ComprehensiveAnalysisApiParams
  } from './types'
  import { useComprehensiveAnalysisFilters } from './composables/useComprehensiveAnalysisFilters'
  import {
    fetchComprehensiveAnalysisKpi,
    fetchComprehensiveAnalysisPlatformCpiBar,
    fetchComprehensiveAnalysisAppCpiRank,
    fetchComprehensiveAnalysisCountryDistribution,
    fetchComprehensiveAnalysisAlerts,
    fetchComprehensiveAnalysisPlatformCpiTrend,
    fetchComprehensiveAnalysisEcpmAnalysis
  } from '@/api/user-growth'
  import { resolveDateRangeFromPreset } from './utils/buildApiParams'
  import { buildComprehensiveAnalysisApiParams } from './utils/buildApiParams'

  const SectionPlatform = defineAsyncComponent(() => import('./modules/section-platform.vue'))

  defineOptions({ name: 'ComprehensiveAnalysis' })

  const { t, te } = useI18n()
  const tr = (key: string, fallback: string) => (te(key) ? t(key) : fallback)

  const router = useRouter()
  const route = useRoute()

  const defaultDateRange = resolveDateRangeFromPreset('7d')

  const filters = reactive<ComprehensiveAnalysisFilterState>({
    date_start: defaultDateRange.date_start,
    date_end: defaultDateRange.date_end,
    s_app_id: [],
    adPlatform: '',
    s_country_code: ''
  })

  function onAdPlatformFilterUpdate(v: string | undefined | null) {
    filters.adPlatform = v ?? ''
  }

  function onCountryFilterUpdate(v: string | undefined | null) {
    filters.s_country_code = v ?? ''
  }

  const { appOptions, sourceOptions, countryOptions, settingApps } =
    useComprehensiveAnalysisFilters()

  const sourceOptionsForSelect = computed(() =>
    sourceOptions.value.filter((o) => String(o.value ?? '').trim() !== '')
  )
  const countryOptionsForSelect = computed(() =>
    countryOptions.value.filter((o) => String(o.value ?? '').trim() !== '')
  )

  const settingAppsForSelect = computed<CockpitSettingAppItem[]>(() => {
    if (settingApps.value.length) return settingApps.value as CockpitSettingAppItem[]
    return appOptions.value
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
  const firstAppId = computed(() => String(settingAppsForSelect.value[0]?.sAppId ?? '').trim())

  const pageData = ref<ComprehensiveAnalysisData | null>(null)
  const kpiLoading = ref(false)
  const platformLoading = ref(false)
  const requestSeq = ref(0)
  const hasBootstrappedInitialLoad = ref(false)

  const dateRangeValue = computed<[string, string] | null>({
    get() {
      if (filters.date_start && filters.date_end) return [filters.date_start, filters.date_end]
      return null
    },
    set(v) {
      if (!v) return
      filters.date_start = v[0]
      filters.date_end = v[1]
    }
  })

  const isPlatformAnalysisDetail = computed(() => route.name === 'PlatformAnalysisDetail')

  function handleDrillDown(name: string) {
    router.push({
      path: '/user-growth/comprehensive-analysis/platform-analysis-detail',
      query: { name }
    })
  }

  function buildApiParams(): ComprehensiveAnalysisApiParams {
    return buildComprehensiveAnalysisApiParams({
      date_start: filters.date_start,
      date_end: filters.date_end,
      s_app_id: filters.s_app_id,
      adPlatform: filters.adPlatform,
      s_country_code: filters.s_country_code
    })
  }

  async function loadKpiData(params: ComprehensiveAnalysisApiParams, requestId: number) {
    kpiLoading.value = true
    try {
      const kpis = await fetchComprehensiveAnalysisKpi(params)
      if (requestId !== requestSeq.value) return
      pageData.value = {
        ...(pageData.value ?? ({} as ComprehensiveAnalysisData)),
        kpis
      }
    } catch {
      // http 拦截器统一处理错误提示
    } finally {
      if (requestId === requestSeq.value) kpiLoading.value = false
    }
  }

  async function loadPlatformData(params: ComprehensiveAnalysisApiParams, requestId: number) {
    platformLoading.value = true
    try {
      const [
        platformCpiBar,
        appCpiRank,
        countryDistribution,
        alerts,
        platformCpiTrend,
        ecpmAnalysis
      ] = await Promise.all([
        fetchComprehensiveAnalysisPlatformCpiBar(params),
        fetchComprehensiveAnalysisAppCpiRank(params),
        fetchComprehensiveAnalysisCountryDistribution(params),
        fetchComprehensiveAnalysisAlerts(params),
        fetchComprehensiveAnalysisPlatformCpiTrend(params),
        fetchComprehensiveAnalysisEcpmAnalysis(params)
      ])
      if (requestId !== requestSeq.value) return
      pageData.value = {
        ...(pageData.value ?? ({} as ComprehensiveAnalysisData)),
        platformCpiBar,
        appCpiRank,
        countryCpiMap: countryDistribution?.mapItems ?? [],
        countryTop8: countryDistribution?.top8 ?? [],
        alerts,
        platformCpiTrend,
        ecpmAnalysis
      }
    } catch {
      // http 拦截器统一处理错误提示
    } finally {
      if (requestId === requestSeq.value) platformLoading.value = false
    }
  }

  function loadData() {
    const requestId = requestSeq.value + 1
    requestSeq.value = requestId
    const params = buildApiParams()
    return Promise.allSettled([loadKpiData(params, requestId), loadPlatformData(params, requestId)])
  }

  watch(
    [() => filters.s_app_id, firstAppId],
    async ([appId, fallbackAppId]) => {
      const hasAppId = Array.isArray(appId) ? appId.length > 0 : !!appId
      if (hasAppId) {
        if (hasBootstrappedInitialLoad.value) return
        hasBootstrappedInitialLoad.value = true
        await loadData()
        return
      }
      if (!fallbackAppId) return
      filters.s_app_id = fallbackAppId
    },
    { immediate: true }
  )

  onMounted(() => {
    if (
      (Array.isArray(filters.s_app_id) ? filters.s_app_id.length === 0 : !filters.s_app_id) &&
      firstAppId.value
    ) {
      filters.s_app_id = firstAppId.value
    }
  })
</script>

<style scoped lang="scss">
  @use './styles/ca-card-fx.scss' as *;
  @use '../styles/app-platform-select-ad-theme.scss' as apSelect;
  @use '../styles/filter-bar-theme.scss' as filterTheme;

  .ca-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: var(--art-full-height);
    padding: 16px 24px;
    background: var(--default-bg-color);
  }

  .ca-page.is-platform-analysis-detail {
    height: var(--art-full-height);
    min-height: 0;
    padding: 0;
    overflow: hidden;
  }

  .ca-header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .ca-filters-bar {
    @include filterTheme.filter-panel(14px 16px);
    @include filterTheme.filter-panel-children;

    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    min-width: 0;
    overflow: visible;
  }

  .ca-filters-left {
    @include filterTheme.filter-row;

    flex: 1;
    flex-wrap: wrap;
    align-items: center;
    min-width: 0;
    overflow: visible;
  }

  .ca-filter-date-picker {
    flex: 0 0 250px;
    width: 250px;
    min-width: 250px;
    max-width: 250px;
  }

  :deep(.ca-filter-date-picker) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
    --el-date-editor-width: 250px;
    --el-date-editor-daterange-width: 250px;
  }

  :deep(.ca-filter-date-picker .el-input__wrapper),
  :deep(.ca-filter-date-picker .el-range-editor.el-input__wrapper),
  :deep(.ca-filter-date-picker.el-date-editor) {
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

  :deep(.ca-filter-date-picker.el-date-editor) {
    width: 250px !important;
    min-width: 250px;
    max-width: 250px;
    height: 36px;
    padding: 0 10px;
  }

  :deep(.ca-filter-date-picker.el-date-editor .el-range-input) {
    font-size: 14px;
    color: var(--el-text-color-primary);
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }

  :deep(.ca-filter-date-picker.el-date-editor .el-range-input::placeholder) {
    color: var(--el-text-color-placeholder);
  }

  :deep(.ca-filter-date-picker.el-date-editor .el-range-separator) {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  :deep(.ca-filter-date-picker.el-date-editor .el-range__icon) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.ca-filter-date-picker.el-date-editor .el-range__close-icon) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.ca-filter-date-picker.el-date-editor:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent) !important;
  }

  :deep(.ca-filter-date-picker.el-date-editor.is-active),
  :deep(.ca-filter-date-picker.el-date-editor:focus-within) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  .ca-filter-select {
    @include filterTheme.filter-select-size;
  }

  .ca-filter-select--app {
    @include filterTheme.filter-select-size;
  }

  @include apSelect.apply-app-platform-select-ad-theme(
    '.ca-filters-left',
    'ca-filter-select__input',
    'ca-select-popper',
    240px,
    200px,
    240px
  );
  @include filterTheme.select-popper('ca-select-popper');
  @include filterTheme.app-platform-popper('ca-select-popper');
  @include filterTheme.date-picker-popper('ca-select-popper');

  :global(.ca-select-popper.el-popper),
  :global(.ca-select-popper.el-select__popper),
  :global(.ca-select-popper.el-picker__popper) {
    z-index: 3200 !important;
  }

  :deep(.ca-filter-select),
  :deep(.ca-filter-select__input) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
  }

  :deep(.ca-filter-select .el-select__wrapper),
  :deep(.ca-filter-select .el-input__wrapper),
  :deep(.ca-filter-select__input) {
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

  :deep(.ca-filter-select .el-input__inner) {
    font-size: 14px;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
  }

  :deep(.ca-filter-select .el-select__selected-item),
  :deep(.ca-filter-select .el-select__selected-item .el-select__placeholder) {
    color: var(--el-text-color-primary);
  }

  :deep(.ca-filter-select .el-select__placeholder.is-transparent),
  :deep(.ca-filter-select .el-select__selected-item.is-transparent) {
    color: var(--el-text-color-placeholder);
  }

  :deep(.ca-filter-select .el-input__prefix-inner) {
    margin-right: 4px;
  }

  :deep(.ca-filter-select .el-input__prefix-inner svg) {
    width: 16px;
    height: 16px;
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.ca-filter-select .el-select__caret),
  :deep(.ca-filter-select__input .app-platform-search-select__suffix) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.ca-filter-select .el-select__wrapper.is-focused),
  :deep(.ca-filter-select .el-input__wrapper.is-focus),
  :deep(.ca-filter-select__input.is-open) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  :deep(.ca-filter-select .el-select__wrapper:hover),
  :deep(.ca-filter-select .el-input__wrapper:hover),
  :deep(.ca-filter-select__input:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  @media (width <= 768px) {
    .ca-filters-bar {
      flex-direction: column;
      align-items: stretch;
      padding: 14px 16px;
    }

    .ca-filters-left {
      justify-content: flex-start;
    }

    .ca-filter-date-picker,
    .ca-filter-select,
    .ca-filter-select--app {
      flex: 1 1 100%;
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }

    :deep(.ca-filter-date-picker.el-date-editor) {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }
  }

  .ca-main {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-bottom: 20px;
  }

  .ca-kpi-grid {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
  }

  @media (width <= 1536px) {
    .ca-kpi-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (width <= 1280px) {
    .ca-kpi-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (width <= 980px) {
    .ca-kpi-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (width <= 560px) {
    .ca-kpi-grid {
      grid-template-columns: 1fr;
    }
  }

  .ca-kpi {
    padding: 14px 16px;

    &__body {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      justify-content: space-between;
    }

    &__left {
      flex: 1;
      min-width: 0;
    }

    &__title {
      margin-bottom: 4px;
      font-size: 12px;
      line-height: 1.3;
      color: var(--text-secondary);
    }

    &__value {
      margin-bottom: 4px;
      font-size: 26px;
      font-weight: 700;
      line-height: 1.2;
      color: var(--text-primary);
    }

    &__sub {
      font-size: 11px;
      line-height: 1.3;
      color: var(--text-secondary);
    }

    &__trend-pill {
      display: inline-flex;
      flex-shrink: 0;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
      justify-content: flex-end;
      max-width: 50%;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 9999px;
      transition:
        background-color 0.2s var(--ease-default),
        color 0.2s var(--ease-default);
    }

    &__trend-pill--up {
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 18%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--art-success) 28%, transparent);
    }

    &__trend-pill--down {
      color: var(--art-danger);
      background: color-mix(in srgb, var(--art-danger) 18%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--art-danger) 28%, transparent);
    }

    &__trend-icon {
      font-size: 14px;
    }

    &__trend-pct {
      line-height: 1.2;
      white-space: nowrap;
    }

    &__trend-compare {
      font-size: 11px;
      font-weight: 600;
      line-height: 1.2;
      white-space: nowrap;
      opacity: 0.95;
    }
  }

  .ca-kpi-skeleton {
    display: flex;
    flex-direction: column;
    gap: 10px;

    &__title {
      width: 62%;
      height: 14px;
    }

    &__value {
      width: 48%;
      height: 30px;
    }

    &__sub {
      width: 70%;
      height: 12px;
    }
  }

  .ca-section-skeleton {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .ca-section-skeleton__grid {
    display: grid;
    gap: 14px;
  }

  .ca-section-skeleton__grid--mid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .ca-section-skeleton__grid--bottom {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ca-section-skeleton-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;
  }

  .ca-section-skeleton-card__title {
    width: 42%;
    height: 14px;
    margin-bottom: 4px;
  }

  .ca-section-skeleton-card__line {
    height: 12px;
  }

  .ca-section-skeleton-card__line--w60 {
    width: 60%;
  }

  .ca-section-skeleton-card__line--w68 {
    width: 68%;
  }

  .ca-section-skeleton-card__line--w74 {
    width: 74%;
  }

  .ca-section-skeleton-card__line--w76 {
    width: 76%;
  }

  .ca-section-skeleton-card__line--w80 {
    width: 80%;
  }

  .ca-section-skeleton-card__line--w86 {
    width: 86%;
  }

  .ca-section-skeleton-card__line--w88 {
    width: 88%;
  }

  .ca-section-skeleton-card__line--w92 {
    width: 92%;
  }

  @media (width <= 1536px) {
    .ca-section-skeleton__grid--mid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width <= 980px) {
    .ca-section-skeleton__grid--mid,
    .ca-section-skeleton__grid--bottom {
      grid-template-columns: 1fr;
    }
  }
</style>
