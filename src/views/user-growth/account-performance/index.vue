<template>
  <div class="account-performance-page flex flex-col">
    <div class="ac-perf-page-fx" aria-hidden="true"></div>
    <!-- 顶部：筛选 + 日期 + 导出 -->
    <div
      class="account-performance-page__section account-performance-page__section--header ac-perf-entry-1"
    >
      <div class="ac-perf-filter-panel">
        <div class="ap-filters">
          <ElSelect v-model="draftSource" placeholder="广告平台" class="ap-filter-select">
            <ElOption
              v-for="opt in metaAdPlatformOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
          <ElSelect v-model="draftPlatform" placeholder="应用" class="ap-filter-select">
            <ElOption
              v-for="opt in metaAppOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
          <ElSelect v-model="draftFilterOwner" placeholder="广告账户" class="ap-filter-select">
            <ElOption
              v-for="opt in metaAccountOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
          <ElDatePicker
            v-model="draftDateRange"
            type="daterange"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="ap-date-picker"
          />
          <ElButton round type="primary" :disabled="!isFilterDirty" @click="onQuery">查询</ElButton>
          <ElButton round type="primary" @click="onExport">导出</ElButton>
        </div>
      </div>
    </div>

    <!-- 6 个 KPI 卡片 -->
    <ElRow :gutter="16" class="ap-kpi-row ac-perf-entry-2">
      <template v-if="kpiLoading">
        <ElCol v-for="i in KPI_CARD_COUNT" :key="i" :xs="24" :sm="12" :md="4" :lg="4" :xl="4">
          <div class="ap-kpi-card ap-kpi-card--skeleton">
            <ElSkeleton animated :rows="3" />
          </div>
        </ElCol>
      </template>

      <template v-else>
        <ElCol
          v-for="(item, index) in kpiCards"
          :key="item.type || index"
          :xs="24"
          :sm="12"
          :md="4"
          :lg="4"
          :xl="4"
        >
          <div
            class="ap-kpi-card"
            :class="{
              'ap-kpi-card--alert': item.alert,
              'ap-kpi-card--roi1': isRoi1KpiCard(item),
              [`ap-kpi-card--${item.type}`]: true
            }"
          >
            <div class="ap-kpi-label">{{ item.label }}</div>
            <div class="ap-kpi-value">{{ item.value }}</div>
            <div v-if="item.sub && !isRoi1KpiCard(item)" class="ap-kpi-sub">{{ item.sub }}</div>
            <div v-else-if="item.detail" class="ap-kpi-detail">{{ item.detail }}</div>
            <div v-if="item.compare" class="ap-kpi-compare" :class="item.compareUp ? 'up' : 'down'">
              {{ item.compare }}
            </div>
            <div v-else class="ap-kpi-compare ap-kpi-compare--placeholder" />
          </div>
        </ElCol>
      </template>
    </ElRow>

    <!-- 主体：左侧表格 + 右侧图表 -->
    <ElRow :gutter="16" class="ap-body ac-perf-entry-3">
      <!-- 左侧：应用×平台×账户明细表（min-width:0 让列可收缩，表格内部横向滚动） -->
      <ElCol :xs="24" :md="16" :lg="17" :xl="17" class="ap-table-col">
        <ElCard class="ap-table-card" shadow="never">
          <template #header>
            <div class="flex items-center">
              <span class="ap-table-title">应用 × 平台 × 账户明细</span>
              <div class="date-range-box">
                <div
                  class="date-range-slider"
                  :style="{
                    transform: `translateX(${Math.max(0, rangeIndex) * 100}%)`,
                    width: `calc((100% - 6px) / ${rangeOptions.length})`
                  }"
                />
                <button
                  v-for="opt in rangeOptions"
                  :key="opt.value"
                  class="date-range-btn"
                  :class="{ active: modelValue === opt.value }"
                  type="button"
                  @click="selectRange(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div class="ap-table-actions">
              <ElButton
                v-if="modelValue === '应用'"
                round
                size="default"
                type="primary"
                plain
                :dark="isDark"
                @click="toggleExpandAll"
              >
                {{ expandAll ? '收起全部' : '展开全部' }}
              </ElButton>
              <!-- <ElButton size="default" color="#13deb9" plain :dark="isDark">自定义列</ElButton> -->
              <ElInput
                v-model="tableSearch"
                :placeholder="'Q 搜索' + modelValue"
                clearable
                class="ap-table-search"
              />
            </div>
          </template>
          <div>
            <template v-if="modelValue === '应用'">
              <div class="ap-app-table-wrapper">
                <div class="ap-app-table-scroll-area">
                  <AccountDetailTable
                    v-if="!appTableLoading"
                    :table-data="tableData"
                    :expanded-row-keys="expandedRowKeys"
                    :summary-text="tableSummaryText"
                    :get-row-style="getRowStyleAny"
                    :get-cell-style="getCellStyleAny"
                    :get-name-style="getNameStyleAny"
                    :format-money="formatMoney"
                    :format-number="formatNumber"
                    :get-roi-class="getRoiClass"
                    :get-usage-rate-color="getUsageRateColor"
                    @toggle-expand="toggleRowExpand"
                  />
                  <div v-else class="ap-table-loading-block">
                    <ElSkeleton animated :rows="11" />
                  </div>
                </div>
                <ElPagination
                  v-if="!appTableLoading"
                  v-model:current-page="appCurrentPage"
                  v-model:page-size="appPageSize"
                  :total="appTotal"
                  :page-sizes="appPageSizes"
                  layout="prev, pager, next, sizes"
                  small
                  background
                  class="ap-app-pagination"
                />
              </div>
            </template>

            <AppPerformancePlaceholder
              v-else-if="modelValue === '账户'"
              :date-range="appliedDateRange"
              :source="appliedSource"
              :platform="appliedPlatform"
              :filter-owner="appliedFilterOwner"
            />
            <PlatformPerformancePlaceholder
              v-else
              :date-range="appliedDateRange"
              :source="appliedSource"
              :platform="appliedPlatform"
              :filter-owner="appliedFilterOwner"
            />
          </div>
        </ElCard>
      </ElCol>

      <!-- 右侧：图表与预警（宽度缩小约 1/3 与原型一致） -->
      <ElCol :xs="24" :md="8" :lg="7" :xl="7" class="ap-charts-col">
        <div class="ap-charts">
          <!-- 广告平台消耗分布 -->
          <ElCard class="ap-chart-card" shadow="never">
            <template #header>广告平台消耗分布</template>
            <div ref="channelChartRef" class="ap-chart-wrap ap-chart-donut"></div>
            <div class="ap-donut-center">{{ donutCenterText }}</div>
            <div v-if="channelLoading" class="ap-chart-loading-overlay">
              <ElSkeleton animated :rows="2" />
            </div>
          </ElCard>

          <!-- 账户预算使用率分布 -->
          <ElCard class="ap-chart-card" shadow="never">
            <template #header>账户预算使用率分布</template>
            <div ref="usageChartRef" class="ap-chart-wrap ap-chart-bar"></div>
            <div v-if="usageLoading" class="ap-chart-loading-overlay">
              <ElSkeleton animated :rows="2" />
            </div>
          </ElCard>

          <!-- 首日ROI趋势(7天) -->
          <ElCard class="ap-chart-card" shadow="never">
            <template #header>首日ROI趋势 (7天)</template>
            <div ref="roiTrendChartRef" class="ap-chart-wrap ap-chart-line"></div>
            <div v-if="roiTrendLoading" class="ap-chart-loading-overlay">
              <ElSkeleton animated :rows="2" />
            </div>
          </ElCard>

          <!-- 预警事项 -->
          <ElCard class="ap-chart-card ap-alert-card" shadow="never">
            <template #header>
              预警事项 ({{ alertsLoading ? '—' : `${alerts.length}项` }})
            </template>
            <div v-if="alertsLoading" class="ap-alert-skeleton">
              <ElSkeleton animated :rows="3" />
            </div>
            <ul v-else-if="alerts.length" class="ap-alert-list">
              <li v-for="a in alerts" :key="a.id" class="ap-alert-item">
                <span class="ap-alert-title">{{ a.title }}</span>
                <span class="ap-alert-desc">{{ a.desc }}</span>
                <ElButton link type="primary" size="small">查看</ElButton>
              </li>
            </ul>
            <ElEmpty v-else class="ap-alert-empty" description="暂无预警数据" :image-size="80" />
          </ElCard>

          <!-- 近七日消耗节奏 -->
          <ElCard class="ap-chart-card" shadow="never">
            <template #header>近七日消耗节奏</template>
            <div ref="paceChartRef" class="ap-chart-wrap ap-chart-pace"></div>
            <div v-if="paceLoading" class="ap-chart-loading-overlay">
              <ElSkeleton animated :rows="2" />
            </div>
          </ElCard>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, watchEffect } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useChart } from '@/hooks/core/useChart'
  import { useSettingStore } from '@/store/modules/setting'
  import request from '@/utils/http'
  import { AD_PERFORMANCE_BASE } from '@/views/user-growth/ad-performance/config/api-base'
  import type { AdPerformanceMetaFilterResponse } from '@/views/user-growth/ad-performance/types'
  import { ACCOUNT_PERFORMANCE_API_BASE } from '@/views/user-growth/account-performance/config/api-base'
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Vetur 对 <script setup> 的误报：.vue 无 default export
  import AccountDetailTable from './modules/account-detail-table.vue'
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Vetur 对 <script setup> 的误报：.vue 无 default export
  import AppPerformancePlaceholder from './modules/app-performance-placeholder.vue'
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Vetur 对 <script setup> 的误报：.vue 无 default export
  import PlatformPerformancePlaceholder from './modules/platform-performance-placeholder.vue'
  import type {
    AccountDetailRow,
    AccountAlertItem,
    SpendPaceItem,
    AccountPerformanceKpi,
    ChannelSpendItem,
    BudgetUsageBucket,
    Day1RoiTrendItem
  } from './types'
  import { MOCK_ACCOUNT_PERFORMANCE } from './mock/data'

  defineOptions({ name: 'AccountPerformance' })

  const settingStore = useSettingStore()
  const { isDark } = storeToRefs(settingStore)

  const mock = ref(MOCK_ACCOUNT_PERFORMANCE)
  const draftSource = ref('')
  const draftPlatform = ref('')
  /** 顶部第三项：对接 meta accountOptions，请求体仍走 ownerId 字段名 */
  const draftFilterOwner = ref('')
  const draftDateRange = ref<[string, string]>([...MOCK_ACCOUNT_PERFORMANCE.dateRange])

  /** 点击“查询”后才会更新 applied，并触发请求 */
  const appliedSource = ref('')
  const appliedPlatform = ref('')
  const appliedFilterOwner = ref('')
  const appliedDateRange = ref<[string, string]>([...MOCK_ACCOUNT_PERFORMANCE.dateRange])

  const metaAdPlatformOptions = ref<AdPerformanceMetaFilterResponse['adPlatformOptions']>([])
  const metaAppOptions = ref<AdPerformanceMetaFilterResponse['appOptions']>([])
  const metaAccountOptions = ref<NonNullable<AdPerformanceMetaFilterResponse['accountOptions']>>([])
  const tableSearch = ref('')
  const expandAll = ref(false)
  const expandedRowKeys = ref<string[]>([])

  // 模板内禁止写 `as any`，这里预先放宽签名给子组件透传
  const getRowStyleAny = getRowStyle as any
  const getCellStyleAny = getCellStyle as any
  const getNameStyleAny = getNameStyle as any
  const rangeOptions: { value: string; label: string }[] = [
    { value: '应用', label: '应用' },
    { value: '平台', label: '平台' },
    { value: '账户', label: '账户' }
  ]

  // 顶部区间 tab：用于控制 active 状态 + 背景滑块位移
  // 默认展示第一个 Tab：应用
  const modelValue = ref(rangeOptions[0].value)
  const rangeIndex = computed(() => rangeOptions.findIndex((o) => o.value === modelValue.value))

  function selectRange(value: string) {
    modelValue.value = value
  }

  const isFilterDirty = computed(() => {
    const [ds, de] = draftDateRange.value || ['', '']
    const [as, ae] = appliedDateRange.value || ['', '']
    return (
      String(draftSource.value ?? '') !== String(appliedSource.value ?? '') ||
      String(draftPlatform.value ?? '') !== String(appliedPlatform.value ?? '') ||
      String(draftFilterOwner.value ?? '') !== String(appliedFilterOwner.value ?? '') ||
      String(ds ?? '') !== String(as ?? '') ||
      String(de ?? '') !== String(ae ?? '')
    )
  })

  function applyFilters() {
    appliedSource.value = draftSource.value ?? ''
    appliedPlatform.value = draftPlatform.value ?? ''
    appliedFilterOwner.value = draftFilterOwner.value ?? ''
    appliedDateRange.value = [...draftDateRange.value]

    // 筛选提交后统一回到第一页，避免新条件下页码越界
    appCurrentPage.value = 1
  }

  function onQuery() {
    applyFilters()
    void loadKpiCards()
    void loadChannelSpend()
    void loadUsageBuckets()
    void loadDay1RoiTrend()
    void loadTodaySpendPace()
    void loadAlerts()
    if (modelValue.value === '应用') void loadAppTableTree()
  }

  // 应用×平台×账户明细树形表：独立请求 + 局部骨架屏
  const appTableTreeFallback = mock.value.tableTree
  const appTableTree = ref<AccountDetailRow[]>(appTableTreeFallback)
  const appTableLoading = ref(false)
  // 应用列表分页（前端分页：由于 tree-tree 响应结构未包含 total，这里以当前树根数量为分页总数）
  const appCurrentPage = ref(1)
  const appPageSize = ref(10)
  const appPageSizes = [10, 20, 50]
  let appTableRequestSeq = 0

  function countTreeNodes(rows: AccountDetailRow[], type: AccountDetailRow['type']): number {
    let total = 0
    const walk = (list: AccountDetailRow[]) => {
      for (const r of list) {
        if (r.type === type) total += 1
        if (r.children?.length) walk(r.children)
      }
    }
    walk(rows)
    return total
  }

  const tableSummaryText = computed(() => {
    if (appTableLoading.value) return mock.value.summaryText
    const appCount = countTreeNodes(appTableTree.value, 'app')
    const accountCount = countTreeNodes(appTableTree.value, 'account')
    if (!appCount && !accountCount) return mock.value.summaryText
    return `共 ${appCount} 个应用 / ${accountCount} 个广告账户`
  })

  async function loadMetaFilterOptions() {
    try {
      const data = await request.post<AdPerformanceMetaFilterResponse>({
        url: `${AD_PERFORMANCE_BASE}/meta-filter-options`,
        data: {}
      })
      metaAdPlatformOptions.value = Array.isArray(data.adPlatformOptions)
        ? data.adPlatformOptions
        : []
      metaAppOptions.value = Array.isArray(data.appOptions) ? data.appOptions : []
      metaAccountOptions.value = Array.isArray(data.accountOptions) ? data.accountOptions : []
    } catch {
      metaAdPlatformOptions.value = []
      metaAppOptions.value = []
      metaAccountOptions.value = []
    }
  }

  const filteredAppRoots = computed(() => {
    let list = appTableTree.value
    const kw = tableSearch.value?.trim()
    if (kw) list = filterTreeByName(list, kw)
    // 根节点期望是 app，兜底仍按 type=app 过滤，避免接口变化
    return list.filter((r) => r.type === 'app')
  })

  const pagedAppRoots = computed(() => {
    const start = (appCurrentPage.value - 1) * appPageSize.value
    return filteredAppRoots.value.slice(start, start + appPageSize.value)
  })

  const appTotal = computed(() => filteredAppRoots.value.length)

  const tableData = computed(() => {
    return attachAppMeta(pagedAppRoots.value)
  })

  async function loadAppTableTree() {
    const [dateStart, dateEnd] = appliedDateRange.value
    if (!dateStart || !dateEnd) return

    const requestSeq = ++appTableRequestSeq
    appTableLoading.value = true

    try {
      const list = await request.post<AccountDetailRow[]>({
        url: `${ACCOUNT_PERFORMANCE_API_BASE}/table-tree`,
        data: {
          currentPage: 0,
          dateEnd,
          dateStart,
          kw: '',
          ownerId: appliedFilterOwner.value,
          pageSize: 0,
          platform: appliedPlatform.value,
          source: appliedSource.value
        }
      })

      if (requestSeq !== appTableRequestSeq) return
      appTableTree.value = Array.isArray(list) ? (list as AccountDetailRow[]) : appTableTreeFallback
    } catch {
      if (requestSeq !== appTableRequestSeq) return
      appTableTree.value = appTableTreeFallback
    } finally {
      if (requestSeq === appTableRequestSeq) appTableLoading.value = false
    }
  }

  let appTableDebounceTimer: ReturnType<typeof setTimeout> | null = null
  watch(
    [modelValue, appliedDateRange, appliedSource, appliedPlatform, appliedFilterOwner],
    () => {
      if (modelValue.value !== '应用') return

      // 切换到「应用」或筛选条件变化时，立即进入 loading 态
      // 避免 debounce 这段时间内渲染旧 DOM
      appTableLoading.value = true
      appCurrentPage.value = 1

      if (appTableDebounceTimer) clearTimeout(appTableDebounceTimer)
      appTableDebounceTimer = setTimeout(() => {
        void loadAppTableTree()
      }, 300)
    },
    { deep: true }
  )

  watch(tableSearch, () => {
    if (modelValue.value !== '应用') return
    appCurrentPage.value = 1
  })

  // KPI 卡片：独立请求并用局部骨架屏避免整页等待
  type AccountPerformanceKpiApiItem = AccountPerformanceKpi & { status?: string }

  const KPI_CARD_COUNT = 6

  /** 与接口约定 type=roi1 一致；兼容 camelCase / 下划线及按标题兜底，避免丢失绿色主题修饰类 */
  function isRoi1KpiCard(item: Pick<AccountPerformanceKpi, 'type' | 'label'>): boolean {
    const raw = item.type
    const t = (typeof raw === 'string' ? raw : String(raw ?? ''))
      .trim()
      .toLowerCase()
      .replace(/_/g, '')
    if (['roi1', 'day1roi'].includes(t)) return true
    const label = item.label ?? ''
    return label.includes('首日') && /roi/i.test(label)
  }

  const kpiFallbackCards = mock.value.kpi
  const kpiCards = ref<AccountPerformanceKpi[]>(kpiFallbackCards)
  const kpiLoading = ref(true)

  let kpiRequestSeq = 0

  async function loadKpiCards() {
    const [dateStart, dateEnd] = appliedDateRange.value
    if (!dateStart || !dateEnd) return

    const requestSeq = ++kpiRequestSeq
    kpiLoading.value = true

    try {
      const list = await request.post<AccountPerformanceKpiApiItem[]>({
        url: `${ACCOUNT_PERFORMANCE_API_BASE}/kpi`,
        data: {
          currentPage: 0,
          dateEnd,
          dateStart,
          kw: '',
          ownerId: appliedFilterOwner.value,
          pageSize: 0,
          platform: appliedPlatform.value,
          source: appliedSource.value
        }
      })

      // 防止参数快速切换时，后发请求覆盖先发结果
      if (requestSeq !== kpiRequestSeq) return

      kpiCards.value = (Array.isArray(list) ? list : kpiFallbackCards) as AccountPerformanceKpi[]
    } catch {
      if (requestSeq !== kpiRequestSeq) return
      kpiCards.value = kpiFallbackCards
    } finally {
      if (requestSeq === kpiRequestSeq) kpiLoading.value = false
    }
  }

  // 仅 KPI 联动筛选条件，避免其它模块（表格/图表）未联动造成认知不一致
  let kpiDebounceTimer: ReturnType<typeof setTimeout> | null = null
  watch(
    [appliedDateRange, appliedSource, appliedPlatform, appliedFilterOwner],
    () => {
      if (kpiDebounceTimer) clearTimeout(kpiDebounceTimer)
      kpiDebounceTimer = setTimeout(() => {
        void loadKpiCards()
      }, 300)
    },
    { deep: true }
  )

  // 广告平台消耗分布：独立请求 + 局部骨架屏避免整页等待
  const channelSpend = ref<ChannelSpendItem[]>([])
  const channelLoading = ref(true)

  let channelRequestSeq = 0

  async function loadChannelSpend() {
    const [dateStart, dateEnd] = appliedDateRange.value
    if (!dateStart || !dateEnd) return

    const requestSeq = ++channelRequestSeq
    channelLoading.value = true
    channelSpend.value = []

    try {
      const list = await request.post<ChannelSpendItem[]>({
        url: `${ACCOUNT_PERFORMANCE_API_BASE}/channel-spend`,
        data: {
          currentPage: 0,
          dateEnd,
          dateStart,
          kw: '',
          ownerId: appliedFilterOwner.value,
          pageSize: 0,
          platform: appliedPlatform.value,
          source: appliedSource.value
        }
      })

      if (requestSeq !== channelRequestSeq) return
      channelSpend.value = Array.isArray(list) ? list : []
    } catch {
      if (requestSeq !== channelRequestSeq) return
      channelSpend.value = []
    } finally {
      if (requestSeq === channelRequestSeq) {
        channelLoading.value = false
        renderChannelChart()
      }
    }
  }

  // 只联动右侧该张图，避免其它区域（表格/图表）在 KPI 未就绪时来回闪烁
  let channelDebounceTimer: ReturnType<typeof setTimeout> | null = null
  watch(
    [appliedDateRange, appliedSource, appliedPlatform, appliedFilterOwner],
    () => {
      if (channelDebounceTimer) clearTimeout(channelDebounceTimer)
      channelDebounceTimer = setTimeout(() => {
        void loadChannelSpend()
      }, 300)
    },
    { deep: true }
  )

  // 账户预算使用率分布：独立请求 + 局部骨架屏
  const usageBuckets = ref<BudgetUsageBucket[]>([])
  const usageLoading = ref(true)

  let usageRequestSeq = 0

  async function loadUsageBuckets() {
    const [dateStart, dateEnd] = appliedDateRange.value
    if (!dateStart || !dateEnd) return

    const requestSeq = ++usageRequestSeq
    usageLoading.value = true
    usageBuckets.value = []

    try {
      const list = await request.post<BudgetUsageBucket[]>({
        url: `${ACCOUNT_PERFORMANCE_API_BASE}/budget-usage-buckets`,
        data: {
          currentPage: 0,
          dateEnd,
          dateStart,
          kw: '',
          ownerId: appliedFilterOwner.value,
          pageSize: 0,
          platform: appliedPlatform.value,
          source: appliedSource.value
        }
      })

      if (requestSeq !== usageRequestSeq) return
      usageBuckets.value = Array.isArray(list) ? list : []
    } catch {
      if (requestSeq !== usageRequestSeq) return
      usageBuckets.value = []
    } finally {
      if (requestSeq === usageRequestSeq) {
        usageLoading.value = false
        renderUsageChart()
      }
    }
  }

  let usageDebounceTimer: ReturnType<typeof setTimeout> | null = null
  watch(
    [appliedDateRange, appliedSource, appliedPlatform, appliedFilterOwner],
    () => {
      if (usageDebounceTimer) clearTimeout(usageDebounceTimer)
      usageDebounceTimer = setTimeout(() => {
        void loadUsageBuckets()
      }, 300)
    },
    { deep: true }
  )

  // 首日ROI趋势（7天）：独立请求 + 局部骨架屏
  const roiTrend = ref<Day1RoiTrendItem[]>([])
  const roiTrendLoading = ref(true)

  let roiTrendRequestSeq = 0

  async function loadDay1RoiTrend() {
    const [dateStart, dateEnd] = appliedDateRange.value
    if (!dateStart || !dateEnd) return

    const requestSeq = ++roiTrendRequestSeq
    roiTrendLoading.value = true
    roiTrend.value = []

    try {
      const list = await request.post<Day1RoiTrendItem[]>({
        url: `${ACCOUNT_PERFORMANCE_API_BASE}/day1-roi-trend`,
        data: {
          currentPage: 0,
          dateEnd,
          dateStart,
          kw: '',
          ownerId: appliedFilterOwner.value,
          pageSize: 0,
          platform: appliedPlatform.value,
          source: appliedSource.value
        }
      })

      if (requestSeq !== roiTrendRequestSeq) return
      roiTrend.value = Array.isArray(list) ? list : []
    } catch {
      if (requestSeq !== roiTrendRequestSeq) return
      roiTrend.value = []
    } finally {
      if (requestSeq === roiTrendRequestSeq) {
        roiTrendLoading.value = false
        renderRoiTrendChart()
      }
    }
  }

  let roiTrendDebounceTimer: ReturnType<typeof setTimeout> | null = null
  watch(
    [appliedDateRange, appliedSource, appliedPlatform, appliedFilterOwner],
    () => {
      if (roiTrendDebounceTimer) clearTimeout(roiTrendDebounceTimer)
      roiTrendDebounceTimer = setTimeout(() => {
        void loadDay1RoiTrend()
      }, 300)
    },
    { deep: true }
  )

  type TableRowWithMeta = AccountDetailRow & { __appId?: string }

  function attachAppMeta(rows: AccountDetailRow[], currentAppId?: string): TableRowWithMeta[] {
    return rows.map((row) => {
      const appId = row.type === 'app' ? row.id : currentAppId
      const next: TableRowWithMeta = { ...(row as TableRowWithMeta), __appId: appId }
      if (row.children?.length) {
        next.children = attachAppMeta(row.children, appId) as unknown as AccountDetailRow[]
      }
      return next
    })
  }

  /**
   * 基色调色板：背景/字体都用同一 RGB，只靠透明度区分（plain 风格且稳定）
   * 你想换色或减少到 5 个颜色，改这里即可。
   */
  const BASE_RGB_COLORS = [
    { r: 64, g: 158, b: 255 }, // 蓝
    { r: 103, g: 194, b: 58 }, // 绿
    { r: 230, g: 162, b: 60 }, // 橙
    { r: 245, g: 108, b: 108 }, // 红
    { r: 144, g: 147, b: 153 } // 灰
  ]

  /** 背景透明度（plain） */
  const ROW_BG_ALPHA_LIGHT = 0.14
  const ROW_BG_ALPHA_DARK = 0.22
  /** “应用/平台”名称字体透明度（强调） */
  const NAME_TEXT_ALPHA_LIGHT = 0.95
  const NAME_TEXT_ALPHA_DARK = 0.92

  function getRowBgAlpha() {
    return isDark.value ? ROW_BG_ALPHA_DARK : ROW_BG_ALPHA_LIGHT
  }

  function getNameTextAlpha() {
    return isDark.value ? NAME_TEXT_ALPHA_DARK : NAME_TEXT_ALPHA_LIGHT
  }

  const appRowBaseColorMap = ref<Record<string, { r: number; g: number; b: number }>>({})

  function hashStringToIndex(input: string, mod: number) {
    // djb2 hash（确定性），用于稳定分配颜色
    let h = 5381
    for (let i = 0; i < input.length; i++) {
      h = (h * 33) ^ input.charCodeAt(i)
    }
    return Math.abs(h) % mod
  }

  function rgba(c: { r: number; g: number; b: number }, a: number) {
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`
  }

  function ensureAppRowColors() {
    const next = { ...appRowBaseColorMap.value }
    const appIds = (appTableTree.value || []).filter((r) => r.type === 'app').map((r) => r.id)
    for (const id of appIds) {
      if (next[id]) continue
      const base = BASE_RGB_COLORS[hashStringToIndex(id, BASE_RGB_COLORS.length)]
      next[id] = base
    }
    appRowBaseColorMap.value = next
  }

  watchEffect(() => {
    ensureAppRowColors()
  })

  function getRowStyle({ row }: { row: TableRowWithMeta }) {
    if (row.type === 'account') return {}
    const appId = row.__appId
    if (!appId) return {}
    const base = appRowBaseColorMap.value[appId]
    if (!base) return {}
    return { backgroundColor: rgba(base, getRowBgAlpha()) }
  }

  const WHITE_VALUE_COLUMNS = new Set(['广告支出', '预算', '使用率', 'CPI', '安装数'])

  function getCellStyle({ row, column }: { row: TableRowWithMeta; column: { label?: string } }) {
    // stripe 的底色在 td 上，使用 cell-style 才能稳定覆盖到二级平台行
    const base = getRowStyle({ row })
    if (row.type === 'account') return base

    const label = column?.label
    if (label && WHITE_VALUE_COLUMNS.has(label)) {
      return { ...base, color: '#ffffff' }
    }
    return base
  }

  function getNameStyle(row: TableRowWithMeta) {
    if (row.type === 'account') return {}
    const appId = row.__appId
    if (!appId) return {}
    const base = appRowBaseColorMap.value[appId]
    if (!base) return {}
    return { color: rgba(base, getNameTextAlpha()), fontWeight: 600 }
  }

  watchEffect(() => {
    if (!expandAll.value) return
    expandedRowKeys.value = collectExpandableRowKeys(tableData.value)
  })

  function filterTreeByName(rows: AccountDetailRow[], keyword: string): AccountDetailRow[] {
    const lower = keyword.toLowerCase()
    return rows
      .map((row) => {
        if (row.name.toLowerCase().includes(lower)) return row
        if (row.children?.length) {
          const filtered = filterTreeByName(row.children, keyword)
          if (filtered.length) return { ...row, children: filtered }
        }
        return null
      })
      .filter(Boolean) as AccountDetailRow[]
  }

  function collectExpandableRowKeys(rows: AccountDetailRow[]): string[] {
    const keys: string[] = []
    const walk = (list: AccountDetailRow[]) => {
      for (const row of list) {
        if (row.children?.length) {
          keys.push(String(row.id))
        }
        if (row.children?.length) walk(row.children)
      }
    }
    walk(rows)
    return keys
  }

  function toggleExpandAll() {
    expandAll.value = !expandAll.value
    expandedRowKeys.value = expandAll.value ? collectExpandableRowKeys(tableData.value) : []
  }

  /** 操作列：展开 / 收起当前行的下一级（树节点） */
  function toggleRowExpand(row: AccountDetailRow) {
    if (!row.children?.length) return
    const id = String(row.id)
    const open = expandedRowKeys.value.includes(id)
    if (open) {
      expandAll.value = false
      expandedRowKeys.value = expandedRowKeys.value.filter((k) => k !== id)
    } else {
      expandedRowKeys.value = [...expandedRowKeys.value, id]
    }
  }

  function toFiniteNumber(v: unknown): number | null {
    if (v === null || v === undefined || v === '') return null
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : null
  }

  function formatMoney(n: number | null | undefined) {
    const value = toFiniteNumber(n)
    return value === null
      ? '无数据'
      : '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  function formatNumber(n: number | null | undefined) {
    const value = toFiniteNumber(n)
    return value === null ? '无数据' : value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  const ROI_TARGET = 85
  function getRoiClass(roi: number): string {
    if (roi >= ROI_TARGET) return 'ap-roi-green'
    return 'ap-roi-red'
  }

  /** 使用率进度条颜色：0-20 红，20-40 橙，40-60 黄，60+ 绿 */
  function getUsageRateColor(rate: number): string {
    if (rate < 20) return '#f56c6c'
    if (rate < 40) return '#e6a23c'
    if (rate < 60) return '#e6df44'
    return '#67c23a'
  }

  /** 甜甜圈图中心金额，从 KPI 近7天广告支出取 */
  const donutCenterText = computed(() => {
    if (channelLoading.value) return '$0'
    const k = kpiCards.value.find((item) => item.type === 'spend')
    return k?.value ?? '$0'
  })

  function onExport() {
    console.log('导出', appliedDateRange.value)
  }

  // --- 广告平台消耗环形图 ---
  const channelChart = useChart()
  const channelChartRef = channelChart.chartRef
  function renderChannelChart() {
    // 骨架屏加载阶段不要初始化图表，避免 ECharts 先渲染出“默认圆”
    if (channelLoading.value) return

    // 接口同时返回 `percent` 和 `value`：饼图用于“占比”，优先用 percent
    const data = channelSpend.value.map((d) => ({ name: d.name, value: d.percent ?? d.value }))
    const isDark = channelChart.isDark.value
    /* 环形图边框需传具体颜色，canvas 不解析 CSS 变量 */
    const pieBorderColor = isDark ? '#1d1e1f' : '#fff'
    channelChart.initChart(
      {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}%',
          backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
          borderColor: isDark ? '#333' : '#ddd',
          textStyle: { color: isDark ? '#e5e7eb' : '#333' }
        },
        legend: {
          orient: 'vertical',
          right: 8,
          top: 'center',
          textStyle: { color: isDark ? '#9ca3af' : '#666', fontSize: 12 }
        },
        series: [
          {
            type: 'pie',
            radius: ['42%', '68%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: { borderColor: pieBorderColor, borderWidth: 2 },
            label: { show: false },
            data,
            color: ['#4ABEFF', '#722ed1', '#13c2c2', '#fa8c16', '#eb2f96', '#a0d911']
          }
        ]
      },
      data.length === 0
    )
  }

  // --- 预算使用率条形图（横向）---
  const usageChart = useChart()
  const usageChartRef = usageChart.chartRef
  function renderUsageChart() {
    if (usageLoading.value) return

    const buckets = usageBuckets.value
    const isDark = usageChart.isDark.value
    const colors = ['#f56c6c', '#e6a23c', '#e6df44', '#67c23a', '#67c23a']
    usageChart.initChart(
      {
        tooltip: { trigger: 'axis' },
        grid: { left: '55px', right: 16, top: 12, bottom: 24, containLabel: false },
        xAxis: {
          type: 'value',
          axisLabel: { color: isDark ? '#999' : '#666', fontSize: 11 },
          splitLine: { lineStyle: { color: isDark ? '#333' : '#eee' } }
        },
        yAxis: {
          type: 'category',
          data: buckets.map((b) => b.range).reverse(),
          axisLabel: { color: isDark ? '#999' : '#666', fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        series: [
          {
            type: 'bar',
            barWidth: '60%',
            data: [...buckets]
              .reverse()
              .map((b, i) => ({ value: b.count, itemStyle: { color: colors[i] } }))
          }
        ]
      },
      buckets.length === 0
    )
  }

  // --- 首日ROI趋势折线 ---
  const roiTrendChart = useChart()
  const roiTrendChartRef = roiTrendChart.chartRef
  function renderRoiTrendChart() {
    if (roiTrendLoading.value) return

    const trend = roiTrend.value
    const isDark = roiTrendChart.isDark.value
    roiTrendChart.initChart(
      {
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 16, top: 16, bottom: 28 },
        xAxis: {
          type: 'category',
          data: trend.map((t) => t.date),
          boundaryGap: true,
          axisLabel: { color: isDark ? '#999' : '#666', fontSize: 11 },
          axisLine: { lineStyle: { color: isDark ? '#444' : '#eee' } }
        },
        yAxis: {
          type: 'value',
          min: (v: { min: number }) => Math.max(0, v.min - 20),
          axisLabel: { color: isDark ? '#999' : '#666', fontSize: 11, formatter: '{value}%' },
          splitLine: { lineStyle: { color: isDark ? '#333' : '#eee', type: 'dashed' } }
        },
        series: [
          {
            type: 'line',
            data: trend.map((t) => t.roi),
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 2 },
            itemStyle: { color: '#67c23a' },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%',
              fontSize: 11,
              color: isDark ? '#9ca3af' : '#666'
            }
          }
        ],
        markLine: {
          silent: true,
          symbol: 'none',
          label: { show: true, formatter: '团队 ROI 85%' },
          lineStyle: { type: 'dashed', color: isDark ? '#666' : '#999' },
          data: [{ yAxis: 85 }]
        }
      },
      trend.length === 0
    )
  }

  // --- 近七日消耗节奏面积图 ---
  const paceChart = useChart()
  const paceChartRef = paceChart.chartRef

  const pace = ref<SpendPaceItem[]>([])
  const paceLoading = ref(true)

  let paceRequestSeq = 0

  async function loadTodaySpendPace() {
    const [dateStart, dateEnd] = appliedDateRange.value
    if (!dateStart || !dateEnd) return

    const requestSeq = ++paceRequestSeq
    paceLoading.value = true
    pace.value = []

    try {
      const list = await request.post<SpendPaceItem[]>({
        url: `${ACCOUNT_PERFORMANCE_API_BASE}/today-spend-pace`,
        data: {
          currentPage: 0,
          dateEnd,
          dateStart,
          kw: '',
          ownerId: appliedFilterOwner.value,
          pageSize: 0,
          platform: appliedPlatform.value,
          source: appliedSource.value
        }
      })

      if (requestSeq !== paceRequestSeq) return
      pace.value = Array.isArray(list) ? list : []
    } catch {
      if (requestSeq !== paceRequestSeq) return
      pace.value = []
    } finally {
      if (requestSeq === paceRequestSeq) {
        paceLoading.value = false
        renderPaceChart()
      }
    }
  }

  let paceDebounceTimer: ReturnType<typeof setTimeout> | null = null
  watch(
    [appliedDateRange, appliedSource, appliedPlatform, appliedFilterOwner],
    () => {
      if (paceDebounceTimer) clearTimeout(paceDebounceTimer)
      paceDebounceTimer = setTimeout(() => {
        void loadTodaySpendPace()
      }, 300)
    },
    { deep: true }
  )

  // 预警事项：暂无真实数据，不请求接口（避免开发环境 mock 仍展示）；联调后恢复 request 赋值
  const alerts = ref<AccountAlertItem[]>([])
  const alertsLoading = ref(false)

  async function loadAlerts() {
    const [dateStart, dateEnd] = appliedDateRange.value
    if (!dateStart || !dateEnd) return
    alerts.value = []
  }

  let alertsDebounceTimer: ReturnType<typeof setTimeout> | null = null
  watch(
    [appliedDateRange, appliedSource, appliedPlatform, appliedFilterOwner],
    () => {
      if (alertsDebounceTimer) clearTimeout(alertsDebounceTimer)
      alertsDebounceTimer = setTimeout(() => {
        void loadAlerts()
      }, 300)
    },
    { deep: true }
  )

  function renderPaceChart() {
    if (paceLoading.value) return

    const paceList = pace.value
    const isDark = paceChart.isDark.value
    const successColor =
      getComputedStyle(document.documentElement).getPropertyValue('--art-success').trim() ||
      '#10B981'

    const areaGradient = {
      type: 'linear' as const,
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: 'rgba(16, 185, 129, 0.55)' },
        { offset: 1, color: 'rgba(16, 185, 129, 0.02)' }
      ]
    }

    paceChart.initChart(
      {
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 16, top: 16, bottom: 28 },
        xAxis: {
          type: 'category',
          data: paceList.map((p) => p.date),
          axisLabel: { color: isDark ? '#999' : '#666', fontSize: 11 },
          axisLine: { lineStyle: { color: isDark ? '#444' : '#eee' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: isDark ? '#999' : '#666', fontSize: 11 },
          splitLine: { lineStyle: { color: isDark ? '#333' : '#eee' } }
        },
        series: [
          {
            type: 'line',
            data: paceList.map((p) => p.value),
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            // ECharts 渐变在 TS 类型里有点难对齐，这里通过类型兜底确保可编译
            areaStyle: { color: areaGradient as any },
            lineStyle: { width: 2, color: successColor },
            itemStyle: { color: successColor }
          }
        ]
      },
      paceList.length === 0
    )
  }

  function renderAllCharts() {
    renderChannelChart()
    renderUsageChart()
    renderRoiTrendChart()
    renderPaceChart()
  }

  onMounted(() => {
    void loadMetaFilterOptions()
    renderAllCharts()
    // 首次进入：自动提交一次默认筛选（等价于用户点一次“查询”）
    onQuery()

    // 默认初始化：如果初始就是「应用」，首次进入页面也需要拉取 table-tree
    if (modelValue.value === '应用') void loadAppTableTree()
  })

  /* 深色/浅色切换时重绘图表，保证坐标轴、图例、边框等颜色正确 */
  watch(
    () => channelChart.isDark.value,
    () => {
      renderAllCharts()
    }
  )
</script>

<style scoped lang="scss">
  @import '../ad-performance/styles/ap-card-fx';

  .account-performance-page {
    position: relative;
    min-width: 0;
    padding: 20px 24px 28px;
    overflow-x: clip;

    /* 极光辐射层 ── 与广告成效页一致 */
    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 70% 50% at 6% 6%,
          color-mix(in srgb, var(--art-success) 42%, transparent) 0%,
          color-mix(in srgb, var(--art-primary) 20%, transparent) 38%,
          transparent 58%
        ),
        radial-gradient(
          ellipse 55% 42% at 94% 8%,
          color-mix(in srgb, var(--art-primary) 38%, transparent) 0%,
          color-mix(in srgb, var(--art-warning) 18%, transparent) 38%,
          transparent 58%
        ),
        radial-gradient(
          ellipse 40% 35% at 48% 18%,
          color-mix(in srgb, var(--art-warning) 18%, transparent) 0%,
          transparent 55%
        ),
        radial-gradient(
          ellipse 55% 42% at 76% 4%,
          color-mix(in srgb, var(--art-primary) 22%, transparent) 0%,
          color-mix(in srgb, var(--art-primary) 10%, transparent) 40%,
          transparent 58%
        );
      mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 58%);
      animation:
        ac-perf-aurora-drift 14s ease-in-out infinite alternate,
        ac-perf-bg-flow 22s ease-in-out infinite alternate;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(
          color-mix(in srgb, var(--art-primary) 5%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          90deg,
          color-mix(in srgb, var(--art-primary) 5%, transparent) 1px,
          transparent 1px
        ),
        radial-gradient(
          circle,
          color-mix(in srgb, var(--art-primary) 8%, transparent) 1px,
          transparent 1px
        );
      background-size:
        40px 40px,
        40px 40px,
        80px 80px;
      mask-image: linear-gradient(to bottom, black 0%, black 18%, transparent 45%);
    }

    > *:not(.ac-perf-page-fx) {
      position: relative;
      z-index: 1;
    }

    .date-range-box {
      position: relative;
      display: flex;
      width: 240px;
      max-width: 100%;
      padding: 0;
      margin-left: 8px;
      background: color-mix(in srgb, var(--default-box-color) 55%, transparent);
      border: 1px solid color-mix(in srgb, var(--art-primary) 22%, transparent);
      border-radius: 10px;

      @media (width <=768px) {
        width: 100%;
      }
    }

    .date-range-slider {
      position: absolute;
      top: 3px;
      left: 3px;
      height: calc(100% - 6px);
      pointer-events: none;
      background: linear-gradient(
        92deg,
        color-mix(in srgb, var(--art-primary) 95%, transparent),
        color-mix(in srgb, var(--art-primary) 88%, transparent)
      );
      border-radius: 6px;
      transition: transform var(--duration-normal, 0.25s) var(--ease-out);
    }

    .date-range-btn {
      position: relative;
      z-index: 1;
      display: flex;
      flex: 1 1 0;
      align-items: center;
      justify-content: center;
      min-width: 0;
      height: 38px;
      padding: 0 !important;
      font-size: 13px !important;
      line-height: 1;
      color: var(--el-text-color-regular);
      white-space: nowrap;
      cursor: pointer;
      background: transparent !important;
      border: none !important;
      border-radius: 6px !important;
      transition: color var(--duration-fast, 0.2s) var(--ease-out);

      &:hover {
        color: var(--art-primary);
      }

      &.active {
        color: #fff;
      }
    }
  }

  .ac-perf-page-fx {
    position: absolute;
    inset: -12% -12% 40%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      color-mix(in srgb, var(--art-primary) 14%, transparent) 55deg,
      color-mix(in srgb, var(--art-primary) 10%, transparent) 80deg,
      transparent 130deg,
      color-mix(in srgb, var(--art-success) 12%, transparent) 200deg,
      color-mix(in srgb, var(--art-success) 8%, transparent) 225deg,
      transparent 285deg,
      color-mix(in srgb, var(--art-warning) 10%, transparent) 330deg,
      color-mix(in srgb, var(--art-warning) 6%, transparent) 350deg,
      transparent 360deg
    );
    opacity: 0.85;
    mask-image: linear-gradient(to bottom, black 0%, black 50%, transparent 85%);
    animation: ac-perf-fx-spin 52s linear infinite;
    will-change: transform;
  }

  @keyframes ac-perf-aurora-drift {
    0% {
      filter: hue-rotate(0deg);
      opacity: 0.72;
      transform: scale(1) translate(0, 0);
    }

    50% {
      filter: hue-rotate(18deg);
      opacity: 1;
      transform: scale(1.06) translate(1.2%, -1.2%);
    }

    100% {
      filter: hue-rotate(-12deg);
      opacity: 0.82;
      transform: scale(1) translate(-1.2%, 1.2%);
    }
  }

  @keyframes ac-perf-bg-flow {
    0% {
      opacity: 0.7;
      transform: scaleY(1) skewX(0deg);
    }

    100% {
      opacity: 1;
      transform: scaleY(1.08) skewX(1deg);
    }
  }

  @keyframes ac-perf-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .ac-perf-entry-1 {
    animation: ac-perf-slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.05s;
  }

  .ac-perf-entry-2 {
    animation: ac-perf-slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.14s;
  }

  .ac-perf-entry-3 {
    animation: ac-perf-slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.22s;
  }

  @keyframes ac-perf-slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .account-performance-page__section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .account-performance-page__section--header {
    margin-bottom: 20px;
  }

  .ac-perf-filter-panel {
    position: relative;
    padding: 14px 16px;
    overflow: hidden;
    border-radius: 12px;

    @include ap-neon-bg;
    @include ap-card-mesh;
    @include ap-panel-hover;

    .ap-filters {
      position: relative;
      z-index: 1;
    }
  }

  .ap-header {
    margin-bottom: 0;
  }

  .ap-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    max-width: 55%;

    @media (width <=768px) {
      gap: 8px;
    }
  }

  .ap-filter-select {
    width: 150px;
    min-width: 100px;
    max-width: 100%;

    @media (width <=768px) {
      flex: 1 1 120px;
      min-width: 0;
    }
  }

  .ap-date-picker {
    width: 200px;
    max-width: 100%;

    @media (width <=768px) {
      width: 100%;
      min-width: 0;
    }
  }

  .ap-kpi-row {
    margin-bottom: 16px;
  }

  .ap-kpi-card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 123px;
    padding: 16px;
    overflow: hidden;
    border-radius: 12px;

    @include ap-neon-bg;
    @include ap-panel-hover;

    --kpi-accent-rgb: 16, 185, 129;

    & > * {
      position: relative;
      z-index: 1;
    }

    &--skeleton {
      cursor: default;

      &:hover {
        border-color: color-mix(in srgb, var(--art-primary) 28%, transparent);
        box-shadow:
          0 12px 48px rgb(0 0 0 / 48%),
          0 0 0 1px color-mix(in srgb, var(--art-primary) 10%, transparent),
          inset 0 1px 0 color-mix(in srgb, var(--art-primary) 14%, transparent),
          inset 0 -12px 32px rgb(0 0 0 / 30%);
        transform: none;
      }

      :deep(.el-skeleton) {
        width: 100%;
      }
    }

    .ap-kpi-label {
      margin-bottom: 6px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    .ap-kpi-value {
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .ap-kpi-sub,
    .ap-kpi-detail {
      margin-top: 4px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .ap-kpi-compare {
      margin-top: auto;
      font-size: 12px;

      &.up {
        color: var(--el-color-success);
      }

      &.down {
        color: var(--el-color-danger);
      }
    }

    &--alert {
      --kpi-accent-rgb: 230, 162, 60;

      background-color: color-mix(in srgb, var(--default-box-color) 96%, transparent);
      background-image:
        radial-gradient(
          ellipse 80% 70% at 100% 0%,
          color-mix(in srgb, var(--art-warning) 22%, transparent) 0%,
          transparent 55%
        ),
        linear-gradient(
          158deg,
          color-mix(in srgb, var(--default-box-color) 92%, transparent) 0%,
          color-mix(in srgb, var(--default-bg-color) 96%, transparent) 100%
        );
      border-color: color-mix(in srgb, var(--art-warning) 38%, transparent);
      box-shadow:
        0 12px 48px rgb(0 0 0 / 48%),
        0 0 0 1px color-mix(in srgb, var(--art-warning) 12%, transparent),
        inset 0 1px 0 color-mix(in srgb, var(--art-warning) 12%, transparent);
    }

    &--accounts {
      --kpi-accent-rgb: 59, 130, 246;
    }

    &--spend {
      --kpi-accent-rgb: 59, 130, 246;
    }

    &--installs {
      --kpi-accent-rgb: 59, 130, 246;
    }

    &--apps {
      --kpi-accent-rgb: 59, 130, 246;
    }

    &--roi1 {
      --kpi-accent-rgb: 16, 185, 129;

      background-color: color-mix(in srgb, var(--default-box-color) 96%, transparent);
      background-image:
        radial-gradient(
          ellipse 90% 65% at 50% -25%,
          color-mix(in srgb, var(--art-success) 35%, transparent) 0%,
          transparent 58%
        ),
        radial-gradient(
          ellipse 70% 50% at 0% 100%,
          color-mix(in srgb, var(--art-success) 18%, transparent) 0%,
          transparent 50%
        ),
        linear-gradient(
          158deg,
          color-mix(in srgb, var(--default-box-color) 94%, transparent) 0%,
          color-mix(in srgb, var(--default-bg-color) 98%, transparent) 100%
        );
      border-color: color-mix(in srgb, var(--art-success) 45%, transparent);
      box-shadow:
        0 12px 48px rgb(0 0 0 / 48%),
        0 0 0 1px color-mix(in srgb, var(--art-success) 15%, transparent),
        inset 0 1px 0 color-mix(in srgb, var(--art-success) 18%, transparent),
        inset 0 -12px 32px rgb(0 0 0 / 28%);

      .ap-kpi-label {
        color: color-mix(in srgb, var(--art-success) 95%, transparent);
      }

      .ap-kpi-value {
        color: var(--art-success);
      }

      .ap-kpi-roi-status {
        color: var(--art-success);
        background: color-mix(in srgb, var(--art-success) 14%, transparent);
        border-color: color-mix(in srgb, var(--art-success) 45%, transparent);
      }

      /* 首日 ROI 均值样式已很好看：不让占位元素影响其垂直排版 */
      .ap-kpi-compare--placeholder {
        height: 0;
        margin-top: 0;
      }
    }

    .ap-kpi-roi-target {
      overflow: hidden;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ap-kpi-roi-status {
      flex-shrink: 0;
      padding: 2px 10px;
      font-size: 11px;
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 14%, transparent);
      border: 1px solid color-mix(in srgb, var(--art-success) 45%, transparent);
      border-radius: 9999px;
    }

    .ap-kpi-roi-status.is-bad {
      color: var(--el-color-danger);
      background: color-mix(in srgb, var(--art-danger) 14%, transparent);
      border-color: color-mix(in srgb, var(--art-danger) 45%, transparent);
    }

    .ap-kpi-compare--placeholder {
      visibility: hidden;
    }
  }

  .ap-body {
    /* 桌面端固定左右布局；小屏仍上下排列 */
    flex-wrap: nowrap;
    margin-bottom: 16px;

    @media (width <=991px) {
      flex-wrap: wrap;
    }

    /* 左侧列允许被挤压，表格在内部横向滚动，避免把右侧挤掉 */
    .ap-table-col {
      min-width: 0;
      overflow: hidden;
    }

    /* 右侧列允许收缩，避免被内容撑爆导致换行 */
    .ap-charts-col {
      flex-shrink: 1;
      min-width: 0;
    }
  }

  .ap-table-card {
    position: relative;
    margin-bottom: 16px;
    overflow: hidden;
    border-radius: 12px;

    @include ap-neon-bg;
    @include ap-card-mesh;
    @include ap-panel-hover;

    :deep(.el-card__header) {
      position: relative;
      z-index: 1;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
      background: transparent;
      border-bottom: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
    }

    :deep(.el-card__body) {
      position: relative;
      z-index: 1;
      padding: 12px 16px;
      background: transparent;
    }
  }

  .ap-table-title {
    @include ap-title-gradient;

    font-size: 20px;
    word-break: break-word;
  }

  .ap-table-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    @media (width <=576px) {
      width: 100%;
    }
  }

  .ap-table-search {
    width: 160px;
    min-width: 0;
    margin-left: 10px;

    @media (width <=576px) {
      flex: 1;
      min-width: 120px;
    }
  }

  /* 表格横向滚动，小屏不撑破布局 */
  .ap-table-scroll {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    :deep(.el-table) {
      min-width: 960px;
    }
  }

  .ap-detail-table {
    --el-table-border-color: var(--el-border-color-lighter);
    --el-table-header-bg-color: var(--el-fill-color-light);
  }

  .ap-cell-name {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .ap-row-icon {
    flex-shrink: 0;
    font-size: 16px;
    color: var(--el-text-color-secondary);

    &.ap-row-icon--app {
      color: var(--el-color-primary);
    }

    &.ap-row-icon--platform {
      color: var(--el-text-color-regular);
    }
  }

  .ap-cell-account {
    font-family: ui-monospace, monospace;
    font-size: 12px;
  }

  .ap-usage-cell {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
  }

  .ap-usage-value {
    flex-shrink: 0;
    font-size: 13px;
  }

  .ap-usage-bar {
    flex-shrink: 0;
    width: 48px;

    :deep(.el-progress-bar) {
      width: 100%;
    }
  }

  .ap-status {
    display: inline-flex;
    align-items: center;
    font-size: 12px;

    &--normal {
      color: var(--el-color-success);

      &::before {
        margin-right: 4px;
        font-size: 10px;
        content: '●';
      }
    }

    &--warning {
      color: var(--el-color-warning);

      &::before {
        margin-right: 4px;
        font-size: 10px;
        content: '▲';
      }
    }
  }

  .ap-roi-green {
    color: var(--el-color-success);
  }

  .ap-roi-red {
    color: var(--el-color-danger);
  }

  .ap-table-footer {
    margin-top: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  /* 右侧列整体缩小约 1/3 与原型一致 */
  .ap-charts-col {
    max-width: 100%;
  }

  .ap-charts {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ap-chart-card {
    position: relative;
    margin-bottom: 0;
    overflow: hidden;
    border-radius: 12px;

    @include ap-neon-bg;
    @include ap-card-mesh;
    @include ap-panel-hover;

    :deep(.el-card__header) {
      position: relative;
      z-index: 1;
      padding: 8px 12px;
      font-size: 13px;
      color: var(--el-text-color-primary);
      background: transparent;
      border-bottom: 1px solid color-mix(in srgb, var(--art-primary) 12%, transparent);
    }

    :deep(.el-card__body) {
      position: relative;
      z-index: 1;
      padding: 8px 12px;
      background: transparent;
    }
  }

  /* 与顶部 KPI「预警账户」(.ap-kpi-card--alert) 同系透明黄底与边框 */
  .ap-chart-card.ap-alert-card {
    background-color: color-mix(in srgb, var(--default-box-color) 96%, transparent);
    background-image:
      radial-gradient(
        ellipse 80% 70% at 100% 0%,
        color-mix(in srgb, var(--art-warning) 18%, transparent) 0%,
        transparent 55%
      ),
      linear-gradient(
        158deg,
        color-mix(in srgb, var(--default-box-color) 92%, transparent) 0%,
        color-mix(in srgb, var(--default-bg-color) 96%, transparent) 100%
      );
    border-color: color-mix(in srgb, var(--art-warning) 38%, transparent);
    box-shadow:
      0 12px 48px rgb(0 0 0 / 48%),
      0 0 0 1px color-mix(in srgb, var(--art-warning) 10%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--art-warning) 10%, transparent);

    :deep(.el-card__header) {
      background: transparent;
      border-bottom: 1px solid color-mix(in srgb, var(--art-warning) 22%, transparent);
    }

    :deep(.el-card__body) {
      background: transparent;
    }
  }

  .ap-chart-wrap {
    height: 133px;
    min-height: 107px;

    &.ap-chart-donut {
      height: 147px;
      min-height: 133px;
    }

    &.ap-chart-bar {
      height: 120px;
      min-height: 107px;
    }

    &.ap-chart-line {
      height: 133px;
      min-height: 120px;
    }

    &.ap-chart-pace {
      height: 107px;
      min-height: 93px;
    }

    @media (width <=768px) {
      height: 200px;
      min-height: 180px;
    }
  }

  .ap-donut-center {
    position: absolute;
    top: 50%;
    left: 35%;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  .ap-chart-loading-overlay {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    background: rgb(0 0 0 / 3%);

    :deep(.el-skeleton) {
      width: 80%;
    }
  }

  .ap-app-table-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 480px;
  }

  .ap-app-table-scroll-area {
    overflow: visible;
  }

  .ap-app-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }

  .ap-table-loading-block {
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 480px;
    padding-top: 12px;
    pointer-events: none;

    :deep(.el-skeleton) {
      width: 100%;
      height: 100%;
    }
  }

  .ap-table-loading-overlay {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 12px;
    pointer-events: none;
    background: rgb(0 0 0 / 3%);

    :deep(.el-skeleton) {
      width: 100%;
    }
  }

  .ap-alert-card .ap-alert-list {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ap-alert-skeleton {
    padding: 8px 0;
  }

  .ap-alert-empty {
    padding: 8px 0 16px;
  }

  .ap-alert-item {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: flex-start;
    padding: 6px 0;
    font-size: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    .ap-alert-title {
      flex-shrink: 0;
      font-weight: 500;
      color: var(--el-color-warning);
    }

    .ap-alert-desc {
      flex: 1;
      min-width: 0;
      color: var(--el-text-color-regular);
    }
  }

  /* 深色模式：用 :global(html.dark) 避免 scoped 误伤；限定在本页根节点下以免污染同名类 */
  :global(html.dark) .account-performance-page {
    .ap-detail-table {
      --el-table-border-color: var(--el-border-color);
      --el-table-header-bg-color: var(--el-fill-color-dark);
      --el-table-header-text-color: #fff;

      :deep(.el-table__header-wrapper th),
      :deep(.el-table__header-wrapper th .cell),
      :deep(.el-table__header-wrapper th .sort-caret) {
        color: #fff;
      }
    }

    .ap-chart-loading-overlay {
      background: rgb(0 0 0 / 18%);
    }

    .ap-table-loading-overlay {
      background: rgb(0 0 0 / 18%);
    }

    .ap-alert-item {
      border-bottom-color: var(--el-border-color);
    }
  }

  @media (width <= 768px) {
    .account-performance-page {
      padding-bottom: 16px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .account-performance-page::before,
    .ac-perf-page-fx {
      animation: none;
    }

    .ac-perf-entry-1,
    .ac-perf-entry-2,
    .ac-perf-entry-3 {
      opacity: 1;
      transform: none;
      animation: none;
    }
  }
</style>
