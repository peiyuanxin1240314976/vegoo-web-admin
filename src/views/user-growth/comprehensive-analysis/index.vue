<template>
  <div class="ca-page art-full-height">
    <!-- 顶栏 -->
    <header class="ca-header">
      <div class="ca-header__left">
        <span class="ca-breadcrumb">
          {{ $t('menus.userGrowth.title') }} &gt; {{ $t('menus.userGrowth.comprehensiveAnalysis') }}
        </span>
      </div>
      <div class="ca-header__right">
        <div class="ca-filters">
          <div class="ca-pill">
            <el-icon style="font-size: 12px; color: var(--art-gray-500)"><Calendar /></el-icon>
            <span class="ca-pill__k">{{ dateRangeLabel }}</span>
          </div>
          <div class="ca-pill">
            <span class="ca-pill__k">应用:</span>
            <ElSelect v-model="filters.s_app_id" class="ca-select" :teleported="false">
              <ElOption
                v-for="opt in appOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
          </div>
          <div class="ca-pill">
            <span class="ca-pill__k">广告平台:</span>
            <ElSelect v-model="filters.adPlatform" class="ca-select" :teleported="false">
              <ElOption
                v-for="opt in sourceOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
          </div>
          <div class="ca-pill">
            <span class="ca-pill__k">国家:</span>
            <ElSelect
              v-model="filters.s_country_code"
              class="ca-select"
              :teleported="false"
              filterable
            >
              <ElOption
                v-for="opt in countryOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
          </div>
        </div>
        <div class="ca-view-tabs">
          <button
            v-for="v in viewModes"
            :key="v.key"
            type="button"
            class="ca-view-tab"
            :class="{ 'is-active': filters.viewMode === v.key }"
            @click="filters.viewMode = v.key"
          >
            {{ v.label }}
          </button>
        </div>
      </div>
    </header>

    <main v-loading="loading" class="ca-main">
      <!-- KPI 行 -->
      <section class="ca-kpi-grid">
        <article v-for="card in pageData?.kpis ?? []" :key="card.id" class="ca-kpi">
          <div class="ca-kpi__title">{{ card.title }}</div>
          <div class="ca-kpi__value">{{ card.primaryValue }}</div>
          <div class="ca-kpi__sub">{{ card.subTitle }}</div>
          <div class="ca-kpi__trend" :class="card.trendUp ? 'trend-up' : 'trend-down'">
            <el-icon><Top v-if="card.trendUp" /><Bottom v-else /></el-icon>
            {{ card.trendText }}
          </div>
        </article>
      </section>

      <!-- 主内容区：数据 / 看板 / 图表 / 报表 -->
      <SectionPlatform
        v-if="filters.viewMode === 'data' || filters.viewMode === 'chart'"
        :data="pageData"
        @drill-down="handleDrillDown"
      />
      <SectionApp
        v-else-if="filters.viewMode === 'board'"
        :data="sectionAppData"
        @drill-down="handleDrillDown"
      />
      <ElCard v-else shadow="never" class="ca-view-placeholder">
        <ElEmpty :description="viewModePlaceholderText" />
      </ElCard>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { Top, Bottom, Calendar } from '@element-plus/icons-vue'
  import type { ComprehensiveAnalysisFilterState, ComprehensiveAnalysisData } from './types'
  import { useComprehensiveAnalysisFilters } from './composables/useComprehensiveAnalysisFilters'
  import { fetchComprehensiveAnalysisData } from '@/api/user-growth'
  import {
    buildComprehensiveAnalysisApiParams,
    resolveDateRangeFromPreset
  } from './utils/buildApiParams'
  import { buildMockSectionAppData } from './mock/data'
  import SectionPlatform from './modules/section-platform.vue'
  import SectionApp from './modules/section-app.vue'

  defineOptions({ name: 'ComprehensiveAnalysis' })

  const router = useRouter()

  const filters = reactive<ComprehensiveAnalysisFilterState>({
    dateRange: '7d',
    s_app_id: 'all',
    adPlatform: 'all',
    s_country_code: 'all',
    viewMode: 'data'
  })

  const viewModes: { key: ComprehensiveAnalysisFilterState['viewMode']; label: string }[] = [
    { key: 'data', label: '数据' },
    { key: 'board', label: '看板' },
    { key: 'chart', label: '图表' },
    { key: 'report', label: '报表' }
  ]

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

  const sectionAppData = computed(() =>
    buildMockSectionAppData(buildComprehensiveAnalysisApiParams(filters))
  )

  const viewModePlaceholderText = '报表视图：导出与订阅能力联调后开放'

  function handleDrillDown(name: string) {
    router.push({
      path: '/user-growth/platform-analysis-detail',
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

  watch(
    () => ({
      dateRange: filters.dateRange,
      s_app_id: filters.s_app_id,
      adPlatform: filters.adPlatform,
      s_country_code: filters.s_country_code
    }),
    loadData,
    { deep: true }
  )

  onMounted(loadData)
</script>

<style scoped lang="scss">
  .ca-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 16px 24px;
    overflow: hidden;
    background: var(--default-bg-color);
  }

  .ca-header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .ca-breadcrumb {
    font-size: 14px;
    color: var(--art-gray-600);
  }

  .ca-header__right {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .ca-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .ca-pill {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 3px 10px;
    overflow: visible;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 9999px;

    .ca-pill__k {
      flex-shrink: 0;
      font-size: 12px;
      color: var(--art-gray-700);
      white-space: nowrap;
    }
  }

  .ca-select {
    :deep(.el-select__wrapper) {
      padding-inline: 0;
      background: transparent;
      box-shadow: none !important;
    }

    :deep(.el-select__selection) {
      flex-wrap: nowrap;
      min-width: 0;
    }

    :deep(.el-select__selected-item) {
      overflow: visible;
      white-space: nowrap;
    }

    :deep(.el-select__placeholder) {
      white-space: nowrap;
    }

    :deep(.el-input__wrapper) {
      background: transparent;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      width: 64px;
      min-width: 64px;
    }
  }

  .ca-view-tabs {
    display: flex;
    gap: 2px;
    padding: 3px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;
  }

  .ca-view-tab {
    padding: 4px 12px;
    font-size: 12px;
    color: var(--art-gray-600);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 6px;
    transition:
      color 0.2s,
      background 0.2s;

    &:hover {
      color: var(--art-gray-900);
    }

    &.is-active {
      color: var(--art-primary);
      background: color-mix(in srgb, var(--art-primary) 12%, var(--default-box-color));
    }
  }

  .ca-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 14px;
    min-height: 0;
    padding-bottom: 20px;
    overflow: auto;
  }

  // ── KPI 行 ────────────────────────────────────────────────────
  .ca-kpi-grid {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
  }

  .ca-kpi {
    padding: 14px 16px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 10px;

    &__title {
      margin-bottom: 2px;
      font-size: 12px;
      color: var(--art-gray-500);
    }

    &__value {
      font-size: 26px;
      font-weight: 700;
      line-height: 1.2;
      color: var(--art-gray-900);
    }

    &__sub {
      margin-bottom: 4px;
      font-size: 11px;
      color: var(--art-gray-500);
    }

    &__trend {
      display: inline-flex;
      gap: 2px;
      align-items: center;
      font-size: 12px;

      &.trend-up {
        color: #22c55e;
      }

      &.trend-down {
        color: #ef4444;
      }
    }
  }

  .ca-view-placeholder {
    flex: 1;
    min-height: 240px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 10px;

    :deep(.el-card__body) {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 220px;
    }
  }
</style>
