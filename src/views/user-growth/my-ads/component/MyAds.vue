<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import SummaryTab from './SummaryTab.vue'
  import PlatformTab from './PlatformTab.vue'
  import CampaignTab from './CampaignTab.vue'
  import { fetchMyAdsPageHeader, fetchMyAdsSummary, fetchMyAdsPlatform } from '@/api/user-growth'
  import { formatNumberWithWan } from '@/utils'
  import { cloneAppDate, formatYYYYMMDD, getAppNow, getAppTodayYYYYMMDD } from '@/utils/app-now'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'
  import { Search } from '@element-plus/icons-vue'
  import type { MyAdsStaffOption, MyAdsUserCardMock, MyAdsMetricStripItem } from '../types'

  defineOptions({ name: 'MyAdsPageContent' })

  function getDefaultDateRange(): [string, string] {
    const today = getAppTodayYYYYMMDD()
    const d = cloneAppDate(getAppNow())
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - 7)
    const start = formatYYYYMMDD(d)
    return [start, today]
  }

  const staffList = ref<MyAdsStaffOption[]>([])
  /** 顶部控件绑定：改人员/日期不会自动请求，需点「查询」 */
  const selectedStaffId = ref('')
  const dateRange = ref<[string, string]>(getDefaultDateRange())
  /** 已提交筛选：接口与广告系列 Tab 仅用此快照 */
  const appliedStaffId = ref('')
  const appliedDateRange = ref<[string, string]>(getDefaultDateRange())

  const hasMounted = ref(false)
  const pageHeaderLoading = ref(false)
  const pageHeaderData = ref<{
    userCard: MyAdsUserCardMock
    metrics: MyAdsMetricStripItem[]
    isEmpty: boolean
  } | null>(null)
  const summaryLoading = ref(false)
  const summaryData = ref<Api.UserGrowth.MyAdsSummaryResponseDto | null>(null)
  const platformLoading = ref(false)
  const platformData = ref<Api.UserGrowth.MyAdsPlatformResponseDto | null>(null)
  /** 應用+廣告平台 Tab：按應用 / 按廣告平台，僅影響 platform 接口的 groupBy */
  const platformGroupByApp = ref(true)
  const activeTab = ref<string>('summary')

  /** 构建与顶部筛选联动的通用请求参数（除 currentPage、pageSize 外，未填一律 null） */
  function buildPageHeaderParams(): Api.UserGrowth.MyAdsPageHeaderRequestParams {
    const [startDate = '', endDate = ''] = appliedDateRange.value
    const staff = (appliedStaffId.value ?? '').trim()
    return {
      appId: null,
      countryCode: null,
      currentPage: 0,
      endDate: endDate.trim() || null,
      groupBy: 'app',
      keyword: null,
      pageSize: 0,
      source: null,
      staffId: staff || null,
      startDate: startDate.trim() || null
    }
  }

  async function loadPageHeader() {
    pageHeaderLoading.value = true
    try {
      const params = buildPageHeaderParams()
      const data = await fetchMyAdsPageHeader(params)
      if (!data) {
        pageHeaderData.value = null
        return
      }
      if (Array.isArray(data.staffList)) {
        staffList.value = data.staffList
      }
      if (data.defaultStaffId && !hasMounted.value) {
        selectedStaffId.value = data.defaultStaffId
        appliedStaffId.value = data.defaultStaffId
      }
      if (data.dateRange?.length === 2) {
        const nextStart = data.dateRange[0]!.trim()
        const nextEnd = data.dateRange[1]!.trim()
        const [curStart = '', curEnd = ''] = dateRange.value
        if (curStart !== nextStart || curEnd !== nextEnd) {
          dateRange.value = [nextStart, nextEnd]
          appliedDateRange.value = [nextStart, nextEnd]
        }
      }
      if (data.userCard && Array.isArray(data.metrics)) {
        pageHeaderData.value = {
          userCard: data.userCard as MyAdsUserCardMock,
          metrics: data.metrics as MyAdsMetricStripItem[],
          isEmpty: data.metrics.length === 0
        }
      } else {
        pageHeaderData.value = null
      }
    } catch {
      pageHeaderData.value = null
    } finally {
      pageHeaderLoading.value = false
    }
  }

  async function loadSummary() {
    summaryLoading.value = true
    try {
      const params = buildPageHeaderParams()
      const data = await fetchMyAdsSummary(params)
      summaryData.value = data ?? null
    } catch {
      summaryData.value = null
    } finally {
      summaryLoading.value = false
    }
  }

  function buildPlatformParams(): Api.UserGrowth.MyAdsPageHeaderRequestParams {
    const base = buildPageHeaderParams()
    return {
      ...base,
      groupBy: platformGroupByApp.value ? 'app' : 'source'
    }
  }

  async function loadPlatform() {
    platformLoading.value = true
    try {
      const params = buildPlatformParams()
      const data = await fetchMyAdsPlatform(params)
      platformData.value = data ?? null
    } catch {
      platformData.value = null
    } finally {
      platformLoading.value = false
    }
  }

  /** 将当前顶部人员、日期写入已提交快照并拉取页头 + 当前 Tab 数据（广告系列 Tab 随 props 变化自行请求） */
  function commitFiltersAndRefresh() {
    appliedStaffId.value = (selectedStaffId.value ?? '').trim()
    const dr = dateRange.value ?? ['', '']
    appliedDateRange.value = [String(dr[0] ?? '').trim(), String(dr[1] ?? '').trim()] as [
      string,
      string
    ]
    void loadPageHeader()
    if (activeTab.value === 'summary') {
      void loadSummary()
    } else if (activeTab.value === 'platform') {
      void loadPlatform()
    }
  }

  onMounted(async () => {
    appliedStaffId.value = (selectedStaffId.value ?? '').trim()
    appliedDateRange.value = [...dateRange.value] as [string, string]
    await loadPageHeader()
    if (activeTab.value === 'summary') {
      await loadSummary()
    } else if (activeTab.value === 'platform') {
      await loadPlatform()
    }
    hasMounted.value = true
  })

  watch(activeTab, (tab) => {
    if (tab === 'summary') {
      loadSummary()
    } else if (tab === 'platform') {
      loadPlatform()
    }
  })

  watch(platformGroupByApp, () => {
    if (hasMounted.value && activeTab.value === 'platform') {
      loadPlatform()
    }
  })

  // const staffAvatarLetter = computed(() => {
  //   const name = staffList.value.find((s) => s.id === selectedStaffId.value)?.name ?? ''
  //   return name ? name[0]! : '—'
  // })

  const tabs = [
    { key: 'summary', label: '汇总' },
    { key: 'platform', label: '应用+广告平台' },
    { key: 'campaign', label: '广告系列明细' }
  ] as const

  /** 頁頭區塊：初始化或無數據時顯示骨架屏，不展示 mock */
  const showPageHeaderSkeleton = computed(() => pageHeaderLoading.value || !pageHeaderData.value)

  const handleTabClick = (key: 'summary' | 'platform' | 'campaign') => {
    activeTab.value = key
  }
</script>

<template>
  <div class="my-ads-page flex flex-col art-full-height min-w-0">
    <div class="my-ads-page-fx" aria-hidden="true"></div>
    <!-- ── 顶部标题栏 ── -->
    <div class="top-bar ma-entry-1">
      <!-- <h1 class="page-title">我的广告</h1> -->
      <div class="top-actions filter-bar" aria-label="页面筛选">
        <div class="date-pill date-pill--range">
          <ElSelect
            v-model="selectedStaffId"
            class="filter-staff-select"
            popper-class="my-ads-filter-select-popper"
            :teleported="true"
          >
            <ElOption v-for="s in staffList" :key="s.id" :label="`${s.name}`" :value="s.id" />
          </ElSelect>
          <AppDatePicker
            v-model="dateRange"
            type="daterange"
            range-separator="~"
            :shortcuts="dateRangeShortcuts"
            start-placeholder="开始"
            end-placeholder="结束"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="filter-date-range"
            popper-class="my-ads-filter-date-popper"
            :teleported="true"
            :clearable="false"
          />

          <el-button type="primary" plain round :icon="Search" @click="commitFiltersAndRefresh">
            查询
          </el-button>
          <!-- <el-button type="primary" plain round @click="commitFiltersAndRefresh"
            >导出报表</el-button
          > -->
        </div>
      </div>
    </div>

    <!-- ── 用户信息卡（按模块独立骨架：初始化或無數據時展示骨架屏，不展示 mock）── -->
    <div class="user-card user-card--wrap ma-entry-2">
      <div v-if="showPageHeaderSkeleton" class="user-card-skeleton ma-skeleton-orbit">
        <ElSkeleton animated>
          <template #template>
            <div class="user-card-skeleton__inner">
              <div class="user-card-skeleton__left">
                <ElSkeletonItem variant="circle" style="width: 52px; height: 52px" />
                <div class="user-card-skeleton__info">
                  <ElSkeletonItem
                    variant="h3"
                    style="width: 80px; height: 20px; margin-bottom: 8px"
                  />
                  <ElSkeletonItem variant="text" style="width: 60px; margin-bottom: 6px" />
                  <ElSkeletonItem variant="text" style="width: 180px" />
                </div>
              </div>
              <div class="user-card-skeleton__metrics">
                <ElSkeletonItem
                  v-for="n in 6"
                  :key="n"
                  variant="text"
                  style="width: 70px; height: 40px"
                />
              </div>
            </div>
          </template>
        </ElSkeleton>
      </div>
      <template v-else-if="pageHeaderData">
        <div class="user-left">
          <div class="user-avatar">{{ pageHeaderData.userCard.avatarLetter }}</div>
          <div class="user-info">
            <div class="user-name">{{ pageHeaderData.userCard.name }}</div>
            <div class="user-role">{{ pageHeaderData.userCard.role }}</div>
            <div class="user-apps">{{ pageHeaderData.userCard.appsLine }}</div>
          </div>
        </div>
        <div class="user-metrics">
          <ElEmpty
            v-if="pageHeaderData.isEmpty"
            description="暂无广告数据"
            :image-size="60"
            class="user-metrics-empty"
          />
          <template v-else>
            <div v-for="m in pageHeaderData.metrics" :key="m.label" class="metric-item">
              <div class="metric-label">{{ m.label }}</div>
              <div class="metric-value" :style="{ color: m.valueColor }">
                {{ formatNumberWithWan(m.value, { fallback: '无数据' }) }}
              </div>
              <div class="metric-sub" :style="{ color: m.subColor }">{{ m.sub }}</div>
            </div>
          </template>
        </div>
      </template>
    </div>

    <!-- ── Tabs ── -->
    <div class="tabs-nav ma-entry-3">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-item', activeTab === tab.key ? 'active' : '']"
        @click="handleTabClick(tab.key)"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- ── Tab 内容 ── -->
    <div class="tab-content ma-entry-4 flex-1 min-h-0 min-w-0">
      <SummaryTab v-if="activeTab === 'summary'" :data="summaryData" :loading="summaryLoading" />
      <PlatformTab
        v-else-if="activeTab === 'platform'"
        v-model:group-by-app="platformGroupByApp"
        :data="platformData"
        :loading="platformLoading"
      />
      <CampaignTab
        v-else-if="activeTab === 'campaign'"
        :staff-id="appliedStaffId"
        :date-range="appliedDateRange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '../styles/my-ads-neon.scss' as ma;
  @use '../../styles/filter-bar-theme.scss' as filterTheme;

  /* ── CSS 变量 ── */
  .my-ads-page {
    --bg-root: #080e1a;
    --bg-card: #0f1929;
    --bg-card2: #111c2d;
    --border: #1e2f45;
    --teal: #00d4aa;
    --teal-dim: rgb(0 212 170 / 15%);
    --yellow: #f59e0b;
    --orange: #f97316;
    --purple: #a78bfa;
    --red: #ef4444;
    --green: #10b981;
    --blue: #60a5fa;
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-dim: #64748b;

    position: relative;
    box-sizing: border-box;
    min-height: var(--art-full-height, calc(100vh - 120px));
    padding: 20px 24px 28px;
    overflow-x: clip;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
    font-size: 13px;
    color: var(--text-primary);
    background: var(--bg-root);

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 70% 50% at 6% 6%,
          rgb(16 185 129 / 38%) 0%,
          rgb(6 182 212 / 20%) 38%,
          transparent 58%
        ),
        radial-gradient(
          ellipse 55% 42% at 94% 8%,
          rgb(59 130 246 / 36%) 0%,
          rgb(139 92 246 / 18%) 38%,
          transparent 58%
        ),
        radial-gradient(ellipse 40% 35% at 48% 18%, rgb(168 85 247 / 16%) 0%, transparent 55%);
      mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 58%);
      animation: ma-aurora-drift 14s ease-in-out infinite alternate;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(186 230 253 / 5%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 5%) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: linear-gradient(to bottom, black 0%, black 18%, transparent 45%);
    }

    > *:not(.my-ads-page-fx) {
      position: relative;
      z-index: 1;
    }
  }

  .my-ads-page-fx {
    position: absolute;
    inset: -12% -12% 40%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgb(59 130 246 / 12%) 55deg,
      rgb(6 182 212 / 8%) 80deg,
      transparent 130deg,
      rgb(16 185 129 / 10%) 200deg,
      transparent 285deg,
      rgb(168 85 247 / 8%) 330deg,
      transparent 360deg
    );
    opacity: 0.82;
    mask-image: linear-gradient(to bottom, black 0%, black 50%, transparent 85%);
    animation: ma-fx-spin 48s linear infinite;
    will-change: transform;
  }

  @keyframes ma-aurora-drift {
    0% {
      opacity: 0.75;
      transform: scale(1) translate(0, 0);
    }

    100% {
      opacity: 1;
      transform: scale(1.04) translate(1.2%, -0.8%);
    }
  }

  @keyframes ma-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .ma-entry-1 {
    animation: ma-slide-up 0.55s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.04s;
  }

  .ma-entry-2 {
    animation: ma-slide-up 0.58s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.12s;
  }

  .ma-entry-3 {
    animation: ma-slide-up 0.6s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.2s;
  }

  .ma-entry-4 {
    animation: ma-slide-up 0.62s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.28s;
  }

  @keyframes ma-slide-up {
    from {
      opacity: 0;
      transform: translateY(18px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .ma-skeleton-orbit {
    @include ma.ma-skeleton-orbit;
  }

  /* ── 顶部栏 ── */
  .top-bar {
    margin-bottom: 16px;
  }

  .page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;

    @include ma.ma-title-gradient;
  }

  // .user-pill {
  //   display: flex;
  //   gap: 6px;
  //   align-items: center;
  //   padding: 5px 12px 5px 6px;
  //   font-size: 12px;
  //   font-weight: 600;
  //   color: #000;
  //   cursor: pointer;
  //   background: var(--teal);
  //   border-radius: 20px;
  //   transition:
  //     filter 0.2s ease,
  //     box-shadow 0.22s ease,
  //     transform 0.22s ease;
  // }

  // .user-pill:not(.user-pill--select):hover {
  //   filter: brightness(1.06);
  //   box-shadow: 0 3px 12px rgb(0 212 170 / 30%);
  //   transform: translateY(-1px);
  // }

  // .user-pill--select {
  //   padding: 0;
  //   cursor: default;
  // }

  // .user-pill--select:hover {
  //   filter: brightness(1.04);
  //   box-shadow: 0 2px 12px rgb(0 212 170 / 25%);
  // }

  .filter-staff-select {
    flex: 0 0 auto;
    width: 240px;
    min-width: 200px;
    max-width: 240px;

    @media (width <= 768px) {
      min-width: 0;
      max-width: 100%;
    }
  }

  .filter-staff-select :deep(.el-select__wrapper) {
    min-height: 36px;
    padding: 4px 12px;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  .filter-staff-select :deep(.el-select__wrapper:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  .filter-staff-select :deep(.el-select__wrapper.is-focused) {
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent);
  }

  .filter-staff-select :deep(.el-select__selected-item) {
    color: var(--el-text-color-primary);
  }

  .filter-staff-select :deep(.el-select__selected-item .el-select__placeholder) {
    color: var(--el-text-color-primary);
  }

  .filter-staff-select :deep(.el-select__placeholder.is-transparent),
  .filter-staff-select :deep(.el-select__selected-item.is-transparent) {
    color: var(--el-text-color-placeholder);
  }

  .filter-staff-select :deep(.el-select__caret),
  .filter-staff-select :deep(.el-select__suffix) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  // .user-pill--select :deep(.el-select__wrapper) {
  //   gap: 6px;
  //   min-height: 32px;
  //   padding: 5px 28px 5px 6px;
  //   background: transparent;
  //   border: none;
  //   box-shadow: none;
  // }

  // .user-pill--select :deep(.el-select__wrapper.is-hovering),
  // .user-pill--select :deep(.el-select__wrapper.is-focused) {
  //   box-shadow: none;
  // }

  // .user-pill--select :deep(.el-select__selected-item) {
  //   font-size: 12px;
  //   font-weight: 600;
  //   color: #000;
  // }

  // .user-pill--select :deep(.el-select__placeholder) {
  //   font-size: 12px;
  //   font-weight: 600;
  //   color: rgb(0 0 0 / 55%);
  // }

  // .user-pill--select :deep(.el-select__caret) {
  //   font-size: 10px;
  //   color: #000;
  // }

  .pill-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    background: var(--teal);
    border-radius: 50%;
  }

  .pill-caret {
    font-size: 10px;
  }

  .date-pill {
    @include filterTheme.filter-panel(12px 16px);
    @include filterTheme.filter-panel-children;
    @include filterTheme.filter-row;

    width: 100%;
    font-size: 14px;
    color: var(--el-text-color-primary);
    cursor: pointer;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  .date-pill--range:hover {
    border-color: rgb(96 165 250 / 65%);
    box-shadow:
      0 24px 72px rgb(0 0 0 / 52%),
      0 0 0 1px rgb(96 165 250 / 25%),
      inset 0 1px 0 rgb(186 230 253 / 18%),
      0 0 72px rgb(59 130 246 / 22%),
      0 0 120px rgb(6 182 212 / 12%),
      0 0 160px rgb(16 185 129 / 8%);
  }

  .date-pill--range {
    flex-shrink: 0;
    flex-wrap: nowrap;
    cursor: default;
  }

  .date-pill__prefix {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .filter-date-range {
    flex: 0 0 250px;
    width: 250px;
    min-width: 250px;
    max-width: 250px;

    --el-date-editor-width: 250px;
    --el-date-editor-daterange-width: 250px;
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));

    @media (width <= 768px) {
      flex: 1 1 100%;
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }
  }

  .date-pill--range :deep(.el-date-editor.el-date-editor--daterange) {
    flex: 0 0 250px !important;
    width: 250px !important;
    min-width: 250px !important;
    max-width: 250px !important;
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
    border-radius: var(--el-border-radius-base, 4px) !important;
    box-shadow: none !important;

    --el-date-editor-width: 250px;
    --el-date-editor-daterange-width: 250px;
  }

  .date-pill--range :deep(.el-date-editor),
  .date-pill--range :deep(.el-range-editor),
  .date-pill--range :deep(.el-range-editor.el-input__wrapper),
  .date-pill--range :deep(.el-date-editor .el-input__wrapper) {
    min-height: 36px;
    padding: 2px 10px;
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
    border-radius: var(--el-border-radius-base, 4px) !important;
    box-shadow: none !important;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  .date-pill--range :deep(.el-date-editor:hover),
  .date-pill--range :deep(.el-range-editor:hover),
  .date-pill--range :deep(.el-date-editor .el-input__wrapper:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent) !important;
  }

  .date-pill--range :deep(.el-date-editor.is-active),
  .date-pill--range :deep(.el-range-editor.is-active),
  .date-pill--range :deep(.el-range-editor.is-focus),
  .date-pill--range :deep(.el-date-editor .el-input__wrapper.is-focus) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  .date-pill--range :deep(.el-range-input) {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  .date-pill--range :deep(.el-range-input::placeholder) {
    color: var(--el-text-color-placeholder);
  }

  .date-pill--range :deep(.el-range-separator) {
    flex: 0 0 auto;
    padding: 0 4px;
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  .date-pill--range :deep(.el-range__icon) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  .date-pill--range :deep(.el-range__close-icon) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  .export-btn {
    padding: 7px 18px;
    font-size: 13px;
    font-weight: 600;
    color: var(--theme-color, var(--art-primary, #3b82f6));
    cursor: pointer;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    transition:
      opacity 0.2s ease,
      background 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.22s ease;
  }

  .export-btn:hover {
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 4px 14px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 24%, transparent);
    opacity: 0.95;
  }

  .export-btn:active {
    box-shadow: none;
  }

  /* ── 用户卡 ── */
  .user-card--wrap {
    min-height: 84px;
  }

  .user-card {
    @include ma.ma-neon-surface;
    @include ma.ma-neon-surface-children;

    display: flex;
    gap: 24px;
    align-items: center;
    padding: 16px 20px;
    margin-bottom: 0;
  }

  .user-card-skeleton {
    flex: 1;
    min-width: 0;
    padding: 4px 0;
  }

  .user-card-skeleton :deep(.el-skeleton) {
    padding: 0;
  }

  .user-card-skeleton__inner {
    display: flex;
    gap: 24px;
    align-items: center;
  }

  .user-card-skeleton__left {
    display: flex;
    gap: 14px;
    align-items: center;
    min-width: 240px;
  }

  .user-card-skeleton__info {
    display: flex;
    flex-direction: column;
  }

  .user-card-skeleton__metrics {
    display: flex;
    flex: 1;
    gap: 16px;
    justify-content: space-around;
    padding-left: 24px;
    border-left: 1px solid var(--border);
  }

  .user-metrics-empty {
    flex: 1;
  }

  .user-metrics-empty :deep(.el-empty__description) {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .user-card::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    width: 4px;
    content: '';
    background: var(--teal);
    border-radius: 12px 0 0 12px;
  }

  .user-left {
    display: flex;
    gap: 14px;
    align-items: center;
    min-width: 240px;
    max-width: 423px;
  }

  /* 与「我的绩效」顶部用户卡 avatar 对齐：渐变圆、外发光、静态外圈描边 */
  .user-avatar {
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    font-size: 22px;
    font-weight: 700;
    color: rgb(244 244 245 / 98%);
    background: linear-gradient(135deg, rgb(16 185 129 / 95%), rgb(34 211 238 / 80%));
    border-radius: 9999px;
    box-shadow:
      0 0 20px rgb(16 185 129 / 32%),
      0 0 40px rgb(16 185 129 / 14%),
      0 0 64px rgb(34 211 238 / 8%);
    transition: box-shadow 0.45s var(--ease-out, cubic-bezier(0, 0, 0.2, 1));

    &::after {
      position: absolute;
      inset: -5px;
      pointer-events: none;
      content: '';
      border: 2px solid rgb(16 185 129 / 30%);
      border-radius: 9999px;
      opacity: 0.4;
    }
  }

  .user-card:hover .user-avatar {
    box-shadow:
      0 0 28px rgb(16 185 129 / 42%),
      0 0 48px rgb(16 185 129 / 20%),
      0 0 80px rgb(34 211 238 / 12%);
  }

  .user-name {
    font-size: 18px;
    font-weight: 700;
    color: #f1f5f9;
  }

  .user-role {
    margin-top: 2px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .user-apps {
    margin-top: 2px;
    font-size: 12px;
    color: var(--text-dim);
  }

  .user-metrics {
    display: flex;
    flex: 1;
    justify-content: space-around;
    padding-left: 24px;
    border-left: 1px solid var(--border);
  }

  .metric-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
    padding: 6px 10px;
    border-radius: 8px;
    transition:
      background 0.2s ease,
      box-shadow 0.2s ease;
  }

  .metric-item:hover {
    background: rgb(0 212 170 / 8%);
    box-shadow: 0 8px 18px rgb(0 0 0 / 18%);
  }

  .metric-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .metric-value {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
  }

  .metric-sub {
    font-size: 11px;
  }

  /* ── Tabs ── */
  .tabs-nav {
    display: flex;
    gap: 0;
    padding: 6px 8px 0;
    margin-top: 16px;
    background: rgb(10 10 14 / 55%);
    border: 1px solid rgb(96 165 250 / 18%);
    border-bottom: none;
    border-radius: 12px 12px 0 0;
    box-shadow: inset 0 1px 0 rgb(186 230 253 / 8%);
  }

  .tab-item {
    padding: 10px 20px;
    margin-bottom: 0;
    font-size: 14px;
    color: var(--text-secondary);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      text-shadow 0.2s ease;
  }

  .tab-item:hover {
    color: var(--text-primary);
    text-shadow: 0 0 14px rgb(0 212 170 / 18%);
  }

  .tab-item.active {
    font-weight: 500;
    color: var(--teal);
    border-bottom-color: var(--teal);
    transform: none;
  }

  .tab-item.active:hover {
    transform: none;
  }

  /* ── Tab 内容区域 ── */
  .tab-content {
    padding-top: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    .my-ads-page::before,
    .my-ads-page-fx {
      animation: none;
    }

    .ma-entry-1,
    .ma-entry-2,
    .ma-entry-3,
    .ma-entry-4 {
      opacity: 1;
      transform: none;
      animation: none;
    }

    .ma-skeleton-orbit {
      animation: none;
    }

    .date-pill,
    .export-btn,
    .user-card,
    .user-avatar,
    .metric-item,
    .tab-item {
      transition: none;
    }

    .date-pill--range:hover,
    .export-btn:hover,
    .metric-item:hover,
    .tab-item:hover {
      transform: none;
    }

    .user-card:hover .user-avatar {
      transform: none;
    }

    // .user-pill--select:hover {
    //   filter: none;
    //   box-shadow: none;
    // }
  }
</style>

<style lang="scss">
  @use '../../styles/filter-bar-theme.scss' as filterTheme;

  /* Teleport 到 body 的下拉/面板，与顶部深色条协调 */
  @include filterTheme.select-popper('my-ads-filter-select-popper');

  .my-ads-filter-date-popper.el-popper {
    // --el-datepicker-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-datepicker-text-color: #e2e8f0;
    --el-datepicker-off-text-color: #64748b;
    --el-datepicker-header-text-color: #e2e8f0;
    --el-datepicker-active-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-datepicker-hover-text-color: var(--theme-color, var(--art-primary, #3b82f6));

    background: #0f1929;
    // border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
  }
</style>
