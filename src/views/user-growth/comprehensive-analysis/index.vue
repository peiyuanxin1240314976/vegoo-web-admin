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
      <!-- 顶栏：筛选 + 检索（筛选项外不再套一层卡片容器） -->
      <header class="ca-header ca-entry-1">
        <div class="ca-filters-bar">
          <div class="ca-filters-left">
            <div class="ca-filter-chip ca-filter-chip--static">
              <ElIcon class="ca-filter-chip__icon"><Calendar /></ElIcon>
              <span class="ca-filter-chip__value">{{ dateRangeLabel }}</span>
            </div>

            <ElSelect
              v-model="filters.s_app_id"
              class="ca-filter-select ca-filter-select--app"
              popper-class="ca-select-popper"
            >
              <ElOption
                v-for="opt in appOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>

            <ElSelect
              v-model="filters.adPlatform"
              class="ca-filter-select ca-filter-select--source"
              popper-class="ca-select-popper"
            >
              <ElOption
                v-for="opt in sourceOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>

            <ElSelect
              v-model="filters.s_country_code"
              class="ca-filter-select ca-filter-select--country"
              popper-class="ca-select-popper"
              filterable
            >
              <ElOption
                v-for="opt in countryOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>

            <ElButton round class="ca-filter-search" :icon="Search" @click="loadData"
              >查询</ElButton
            >
          </div>
        </div>
      </header>

      <main v-loading="loading" class="ca-main ca-entry-2">
        <!-- KPI 行 -->
        <section class="ca-kpi-grid">
          <article
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
                <span v-if="card.trendCompareLabel" class="ca-kpi__trend-compare">{{
                  card.trendCompareLabel
                }}</span>
              </div>
            </div>
          </article>
        </section>

        <!-- 主内容区（原「数据」视图：平台 CPI / 排行 / 地图 / 趋势等） -->
        <SectionPlatform :data="pageData" @drill-down="handleDrillDown" />
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed, defineAsyncComponent } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { Top, Bottom, Calendar, Search } from '@element-plus/icons-vue'
  import type { ComprehensiveAnalysisFilterState, ComprehensiveAnalysisData } from './types'
  import { useComprehensiveAnalysisFilters } from './composables/useComprehensiveAnalysisFilters'
  import { fetchComprehensiveAnalysisData } from '@/api/user-growth'
  import { resolveDateRangeFromPreset } from './utils/buildApiParams'
  const SectionPlatform = defineAsyncComponent(() => import('./modules/section-platform.vue'))

  defineOptions({ name: 'ComprehensiveAnalysis' })

  const router = useRouter()
  const route = useRoute()

  const filters = reactive<ComprehensiveAnalysisFilterState>({
    dateRange: '7d',
    s_app_id: '',
    adPlatform: '',
    s_country_code: ''
  })

  const { appOptions, sourceOptions, countryOptions } = useComprehensiveAnalysisFilters()
  const pageData = ref<ComprehensiveAnalysisData | null>(null)
  const loading = ref(false)

  const dateRangeLabel = computed(() => {
    const { date_start, date_end } = resolveDateRangeFromPreset(filters.dateRange)
    if (filters.dateRange === '7d') {
      return `近7天 ${date_start} ~ ${date_end}`
    }
    return `${date_start} ~ ${date_end}`
  })

  const isPlatformAnalysisDetail = computed(() => route.name === 'PlatformAnalysisDetail')

  function handleDrillDown(name: string) {
    router.push({
      path: '/user-growth/comprehensive-analysis/platform-analysis-detail',
      query: { name, from: 'comprehensive-analysis' }
    })
  }

  async function loadData() {
    loading.value = true
    try {
      pageData.value = await fetchComprehensiveAnalysisData({
        dateRange: filters.dateRange,
        s_app_id: filters.s_app_id,
        adPlatform: filters.adPlatform,
        s_country_code: filters.s_country_code
      })
    } catch {
      // 错误提示由 http 拦截器统一处理；保留上一次成功数据，避免整块空白
    } finally {
      loading.value = false
    }
  }

  onMounted(loadData)
</script>

<style scoped lang="scss">
  @use './styles/ca-card-fx.scss' as *;

  .ca-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: var(--art-full-height);
    padding: 16px 24px;
    background: var(--default-bg-color);
  }

  /* 详情子路由仍占满内容区，由子页自行布局 */
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

  /* 筛选项平铺：无外层卡片边框/阴影，仅横向排列 */
  .ca-filters-bar {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    min-width: 0;
    padding: 18px 20px;
    background: color-mix(in srgb, var(--default-bg-color) 82%, transparent);
    backdrop-filter: blur(12px);
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 20%, transparent);
    border-radius: 16px;
    box-shadow:
      0 8px 32px rgb(0 0 0 / 40%),
      inset 0 1px 0 color-mix(in srgb, var(--el-color-primary) 10%, transparent);
  }

  .ca-filters-left {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    min-width: 0;
  }

  .ca-filter-search {
    --el-button-bg-color: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    --el-button-text-color: var(--el-color-primary);
    --el-button-border-color: color-mix(in srgb, var(--el-color-primary) 40%, transparent);
    --el-button-hover-text-color: color-mix(
      in srgb,
      var(--el-color-primary) 80%,
      var(--text-primary)
    );
    --el-button-hover-border-color: var(--el-color-primary);
    --el-button-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 16%, transparent);
    --el-button-active-text-color: color-mix(
      in srgb,
      var(--el-color-primary) 80%,
      var(--text-primary)
    );
    --el-button-active-border-color: var(--el-color-primary);
    --el-button-active-bg-color: color-mix(in srgb, var(--el-color-primary) 22%, transparent);

    box-shadow: 0 0 14px color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    transition:
      box-shadow 0.22s var(--ease-default),
      transform 0.18s var(--ease-default);

    &:hover {
      box-shadow: 0 0 22px color-mix(in srgb, var(--el-color-primary) 28%, transparent);
      transform: translateY(-1px);
    }
  }

  .ca-filter-chip {
    --ca-filter-accent: var(--el-color-primary);

    box-sizing: border-box;
    display: inline-flex;
    gap: 10px;
    align-items: center;
    min-height: 40px;
    padding: 8px 18px;
    color: var(--text-secondary);
    white-space: nowrap;
    background: color-mix(in srgb, var(--ca-filter-accent) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--ca-filter-accent) 30%, transparent);
    border-radius: 9999px;
    box-shadow: 0 0 16px color-mix(in srgb, var(--ca-filter-accent) 10%, transparent);
  }

  .ca-filter-chip__icon {
    font-size: 16px;
    color: var(--ca-filter-accent);
  }

  .ca-filter-chip__value {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .ca-filter-select {
    width: 134px;
    min-width: 110px;
  }

  :deep(.ca-filter-select) {
    --el-input-focus-border-color: var(--el-color-primary);
    --el-border-color-hover: color-mix(in srgb, var(--el-color-primary) 75%, transparent);
    --el-border-color-focus: var(--el-color-primary);
    --el-component-size: 40px;
  }

  :deep(.ca-filter-select .el-input__wrapper) {
    padding: 0 14px;
    background: color-mix(in srgb, var(--el-color-primary) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 28%, transparent);
    border-radius: 9999px;
    box-shadow: none;
    transition:
      border-color 0.22s var(--ease-default),
      box-shadow 0.22s var(--ease-default),
      background-color 0.22s var(--ease-default);
  }

  :deep(.ca-filter-select .el-input__inner) {
    font-size: 14px;
    color: var(--text-primary);
  }

  :deep(.ca-filter-select .el-select__caret) {
    color: var(--el-color-primary);
  }

  :deep(.ca-filter-select .el-input__wrapper.is-focus) {
    background: color-mix(in srgb, var(--el-color-primary) 10%, transparent) !important;
    border-color: var(--el-color-primary) !important;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--el-color-primary) 20%, transparent) !important;
  }

  :deep(.ca-filter-select .el-input__wrapper:hover) {
    border-color: color-mix(in srgb, var(--el-color-primary) 60%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--el-color-primary) 18%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .ca-filter-search:hover {
      transform: none;
    }
  }

  .ca-main {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-bottom: 20px;
  }

  // ── KPI 行 ────────────────────────────────────────────────────
  .ca-kpi-grid {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
  }

  /* KPI 网格：适配大/中/小屏 */
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
</style>

<style lang="scss">
  .ca-select-popper {
    z-index: 3200 !important;
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 28%, transparent);
    box-shadow:
      0 12px 36px rgb(0 0 0 / 48%),
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 12%, transparent);

    .el-select-dropdown__item.is-selected {
      color: var(--el-color-primary);
      background: color-mix(in srgb, var(--el-color-primary) 12%, var(--default-box-color));
    }
  }
</style>
