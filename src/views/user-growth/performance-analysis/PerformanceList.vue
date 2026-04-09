<template>
  <div class="performance-analysis-page perf-page">
    <div class="pa-page-fx" aria-hidden="true"></div>
    <!-- ─── Header ─────────────────────────────────── -->
    <div class="perf-header pa-entry-1">
      <div class="perf-header__panel">
        <div class="perf-header__group">
          <span class="date-label">日期范围</span>
          <div class="date-btns" role="tablist" aria-label="日期范围">
            <button
              v-for="d in DATE_RANGES"
              :key="d.value"
              type="button"
              class="date-btn"
              :class="{ active: activeDateRange === d.value }"
              role="tab"
              :aria-selected="activeDateRange === d.value"
              @click="handleDateRangeClick(d.value)"
            >
              {{ getDateRangeLabel(d) }}
            </button>
          </div>
        </div>

        <div class="perf-header__actions">
          <ElButton round plain type="primary" class="perf-header__btn">
            <span class="perf-header__btn-icon" aria-hidden="true">↓</span>
            导出
          </ElButton>
          <ElButton round plain type="warning" class="perf-header__btn perf-header__btn--admin">
            <span class="perf-header__btn-icon" aria-hidden="true">🔐</span>
            管理员编辑
          </ElButton>
        </div>
      </div>
    </div>

    <div class="perf-body pa-entry-2">
      <!-- ─── Main Area ───────────────────────────── -->
      <div class="main-area">
        <!-- Filters -->
        <div class="filter-block">
          <div class="filter-row">
            <span class="filter-label">人员：</span>
            <button
              v-for="p in personOptions"
              :key="p.value || '__all__'"
              type="button"
              :class="['filter-chip', { active: activePersonFilter === p.value }]"
              @click="activePersonFilter = p.value"
              >{{ p.label }}</button
            >
            <input
              v-model="searchKw"
              type="search"
              class="search-input"
              placeholder="搜索人员…"
              aria-label="搜索人员"
              spellcheck="false"
            />
          </div>
          <div class="filter-row">
            <span class="filter-label">应用：</span>
            <button
              v-for="a in appCategoryOptions"
              :key="a.value || '__all_app__'"
              type="button"
              :class="['filter-chip', { active: activeAppFilter === a.value }]"
              @click="activeAppFilter = a.value"
              >{{ a.label }}</button
            >
            <span class="filter-spacer" aria-hidden="true"></span>
            <span class="filter-label">达标状态：</span>
            <button
              v-for="s in statusOptions"
              :key="s.value || '__all_status__'"
              type="button"
              :class="['filter-chip', { active: activeStatusFilter === s.value }]"
              @click="activeStatusFilter = s.value"
              >{{ s.label }}</button
            >
          </div>
        </div>

        <!-- Table -->
        <div class="table-wrap pa-neon-table-wrap pa-entry-3">
          <div v-if="listLoading" class="pa-skeleton-table" aria-label="表格加载中">
            <ElSkeleton animated>
              <template #template>
                <div class="pa-skeleton-table__header">
                  <ElSkeletonItem variant="text" class="sk sk-w-24" />
                  <ElSkeletonItem variant="text" class="sk sk-w-40" />
                  <ElSkeletonItem variant="text" class="sk sk-w-28" />
                  <ElSkeletonItem variant="text" class="sk sk-w-36" />
                  <ElSkeletonItem variant="text" class="sk sk-w-32" />
                  <ElSkeletonItem variant="text" class="sk sk-w-28" />
                </div>
                <div class="pa-skeleton-table__rows">
                  <div v-for="i in 10" :key="i" class="pa-skeleton-table__row">
                    <ElSkeletonItem variant="text" class="sk sk-w-18" />
                    <ElSkeletonItem variant="text" class="sk sk-w-46" />
                    <ElSkeletonItem variant="text" class="sk sk-w-22" />
                    <ElSkeletonItem variant="text" class="sk sk-w-30" />
                    <ElSkeletonItem variant="text" class="sk sk-w-26" />
                    <ElSkeletonItem variant="text" class="sk sk-w-24" />
                  </div>
                </div>
              </template>
            </ElSkeleton>
          </div>
          <ArtTable
            v-else
            :data="pagedData"
            row-key="id"
            size="small"
            height="100%"
            :row-class-name="getRowClassName"
            :header-cell-style="tableHeaderCellStyle"
            show-summary
            :summary-method="getTableSummaries"
          >
            <ElTableColumn width="50">
              <template #header>
                <input type="checkbox" :checked="allSelected" @change="toggleAll" />
              </template>
              <template #default="{ row }">
                <input
                  type="checkbox"
                  :checked="checkedIds.includes(row.id)"
                  @change="toggleRow(row.id)"
                />
              </template>
            </ElTableColumn>

            <ElTableColumn label="优化师" min-width="100">
              <template #default="{ row }">
                <div class="name-cell">
                  <span class="avatar" :style="{ background: row.avatarBg }">{{
                    row.surname
                  }}</span>
                  {{ row.name }}
                </div>
              </template>
            </ElTableColumn>

            <ElTableColumn label="职级" min-width="70">
              <template #default="{ row }">
                <span :class="['level-badge', `level-${row.levelClass}`]">{{ row.level }}</span>
              </template>
            </ElTableColumn>

            <ElTableColumn min-width="100" align="left">
              <template #header>
                <div class="th-sortable" @click="handleSort('adSpend')">
                  广告支出
                  <span class="sort-icon">{{
                    sortField === 'adSpend' ? (sortAsc ? '↑' : '↓') : '↕'
                  }}</span>
                </div>
              </template>
              <template #default="{ row }">${{ fmt(row.adSpend) }}</template>
            </ElTableColumn>

            <ElTableColumn label="预算" min-width="90" align="left">
              <template #default="{ row }">${{ fmt(row.budget) }}</template>
            </ElTableColumn>
            <ElTableColumn label="首日ROI" min-width="90" align="left">
              <template #default="{ row }">
                <span :class="['num', roiClass(row.roi1)]">{{ row.roi1 }}%</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="3日ROI" min-width="80" align="left">
              <template #default="{ row }">
                <span :class="['num', roiClass(row.roi3)]">{{ row.roi3 }}%</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="7日ROI" min-width="80" align="left">
              <template #default="{ row }">
                <span :class="['num', roiClass(row.roi7)]">{{ row.roi7 }}%</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="代投消耗" min-width="90" align="left">
              <template #default="{ row }">${{ fmt(row.agentCost) }}</template>
            </ElTableColumn>
            <ElTableColumn label="最低消耗" min-width="90" align="left">
              <template #default="{ row }">${{ fmt(row.minCost) }}</template>
            </ElTableColumn>
            <ElTableColumn label="预估利润" min-width="90" align="left">
              <template #default="{ row }">
                <span :class="['num', row.estProfit >= 0 ? 'pos' : 'neg']">
                  {{ row.estProfit >= 0 ? '+' : '' }}${{ fmt(Math.abs(row.estProfit)) }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="最低利润" min-width="90" align="left">
              <template #default="{ row }">
                <span :class="['num', row.minProfit >= 0 ? 'pos' : 'neg']">
                  {{ row.minProfit >= 0 ? '+' : '' }}${{ fmt(Math.abs(row.minProfit)) }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="得分" min-width="80" align="left">
              <template #default="{ row }"
                ><span class="num score">{{ row.score }}分</span></template
              >
            </ElTableColumn>
            <ElTableColumn label="达标状态" min-width="90" align="left">
              <template #default="{ row }">
                <span :class="['status-badge', `s-${row.statusClass}`]">{{ row.status }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" min-width="90" fixed="right">
              <template #default="{ row }">
                <button class="view-btn" @click="viewDetail(row.id)">查看</button>
              </template>
            </ElTableColumn>
          </ArtTable>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <div class="page-left">
            共 {{ tableTotal }} 人 &nbsp; 已选择 {{ checkedIds.length }} 人
            <button
              :class="['compare-btn', { 'compare-active': checkedIds.length >= 2 }]"
              :disabled="checkedIds.length < 2"
              @click="goCompare"
              >对比分析</button
            >
          </div>
          <div class="page-right">
            <ElPagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[20, 50, 100, 200]"
              :size="size"
              :disabled="disabled"
              :background="background"
              layout="total, sizes, prev, pager, next, jumper"
              :total="tableTotal"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>

      <!-- ─── Right Sidebar ──────────────────────── -->
      <div :class="['sidebar', 'pa-sidebar-shell', { collapsed: isSidebarCollapsed }]">
        <div class="sidebar-header">
          <span v-if="!isSidebarCollapsed">指标概览</span>
          <button
            type="button"
            class="collapse-btn"
            :aria-label="isSidebarCollapsed ? '展开指标概览' : '收起指标概览'"
            @click="isSidebarCollapsed = !isSidebarCollapsed"
          >
            <ElIcon>
              <ArrowRightBold v-if="isSidebarCollapsed" />
              <ArrowLeftBold v-else />
            </ElIcon>
          </button>
        </div>
        <div v-show="!isSidebarCollapsed" class="sidebar-content">
          <div class="metric-card pa-neon-lift-card">
            <ElSkeleton :loading="overviewLoading" animated>
              <template #template>
                <ElSkeletonItem variant="text" class="sk sk-w-32" />
                <ElSkeletonItem variant="h1" class="sk sk-w-44 sk-mt-8" />
                <ElSkeletonItem variant="text" class="sk sk-w-28 sk-mt-10" />
              </template>
              <template #default>
                <div class="metric-title">团队广告支出</div>
                <div class="metric-main-row">
                  <div class="metric-val">${{ fmt(overviewMetrics.adSpend) }}</div>
                  <div class="metric-side">
                    <span>周环比</span>
                    <span class="pos-text">+8%</span>
                  </div>
                </div>
              </template>
            </ElSkeleton>
          </div>
          <div class="metric-card pa-neon-lift-card">
            <ElSkeleton :loading="overviewLoading" animated>
              <template #template>
                <ElSkeletonItem variant="text" class="sk sk-w-28" />
                <ElSkeletonItem variant="h1" class="sk sk-w-40 sk-mt-8" />
                <ElSkeletonItem variant="text" class="sk sk-w-22 sk-mt-10" />
              </template>
              <template #default>
                <div class="metric-title">首日ROI均值</div>
                <div class="metric-main-row">
                  <div class="metric-val gold-text">{{ overviewMetrics.avgRoi1.toFixed(2) }}%</div>
                  <div class="metric-badge-inline">{{ overviewMetrics.roiStatusLabel }}</div>
                </div>
              </template>
            </ElSkeleton>
          </div>
          <div class="metric-card pa-neon-lift-card">
            <ElSkeleton :loading="overviewLoading" animated>
              <template #template>
                <ElSkeletonItem variant="text" class="sk sk-w-30" />
                <ElSkeletonItem variant="h1" class="sk sk-w-46 sk-mt-8" />
                <ElSkeletonItem variant="text" class="sk sk-w-24 sk-mt-10" />
              </template>
              <template #default>
                <div class="metric-title">团队预估利润</div>
                <div class="metric-main-row">
                  <div
                    :class="[
                      'metric-val',
                      overviewMetrics.estProfit >= 0 ? 'pos-text' : 'red-text'
                    ]"
                  >
                    {{ overviewMetrics.estProfit >= 0 ? '+' : '-' }}${{
                      fmt(Math.abs(overviewMetrics.estProfit))
                    }}
                  </div>
                  <div class="metric-side">
                    <span>周环比</span>
                    <span class="pos-text">+12%</span>
                  </div>
                </div>
              </template>
            </ElSkeleton>
          </div>
          <div class="metric-card pa-neon-lift-card alert-card">
            <ElSkeleton :loading="overviewLoading" animated>
              <template #template>
                <ElSkeletonItem variant="text" class="sk sk-w-26" />
                <ElSkeletonItem variant="h1" class="sk sk-w-24 sk-mt-8" />
                <ElSkeletonItem variant="text" class="sk sk-w-56 sk-mt-10" />
                <ElSkeletonItem variant="text" class="sk sk-w-46 sk-mt-6" />
              </template>
              <template #default>
                <div class="metric-title">未达标人员</div>
                <div class="metric-main-row metric-main-col">
                  <div class="metric-val red-text">{{ overviewMetrics.failCount }} 人</div>
                  <div class="metric-sub red-text">{{ failNamesText }}</div>
                </div>
              </template>
            </ElSkeleton>
          </div>
        </div>
      </div>
    </div>

    <ElDialog
      v-model="isCustomDateDialogVisible"
      title="选择自定义日期范围"
      width="420px"
      append-to-body
    >
      <ElDatePicker
        v-model="customDateRangeDraft"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        format="YYYY-MM-DD"
        style="width: 100%"
      />
      <template #footer>
        <ElButton round @click="handleCustomDateCancel">取消</ElButton>
        <ElButton round type="primary" @click="handleCustomDateConfirm">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { ArrowLeftBold, ArrowRightBold } from '@element-plus/icons-vue'
  import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
  import {
    fetchPerformanceList,
    fetchPerformanceListFilterOptions,
    fetchPerformanceOverviewMetrics,
    type PerformanceListRequest,
    type PerformanceListRow,
    type PerformanceListTotals,
    type PerformanceOverviewMetricsResponse
  } from '@/api/user-growth/performance-analysis'

  defineOptions({ name: 'PerformanceList' })

  const tableHeaderCellStyle = {
    backgroundColor: 'color-mix(in srgb, var(--default-box-color) 88%, transparent)'
  }

  // ─── Constants ──────────────────────────────────────────
  const DATE_RANGES = [
    { label: '最近7天', value: '7d' },
    { label: '最近30天', value: '30d' },
    { label: '本月', value: 'month' },
    { label: '自定义', value: 'custom' }
  ]

  const personOptions = ref<{ label: string; value: string }[]>([{ label: '全部', value: '' }])
  const appCategoryOptions = ref<{ label: string; value: string }[]>([{ label: '全部', value: '' }])
  const statusOptions = ref<{ label: string; value: string }[]>([{ label: '全部', value: '' }])

  const tableRows = ref<PerformanceListRow[]>([])
  const tableTotal = ref(0)
  const tableTotals = ref<PerformanceListTotals>({
    adSpend: 0,
    budget: 0,
    roi1: 0,
    roi3: 0,
    roi7: 0,
    agentCost: 0,
    estProfit: 0,
    minProfit: 0,
    score: 0
  })

  const overviewMetrics = ref<PerformanceOverviewMetricsResponse>({
    adSpend: 0,
    avgRoi1: 0,
    roiStatusLabel: '—',
    estProfit: 0,
    failCount: 0,
    failNames: []
  })

  // ─── State ──────────────────────────────────────────────
  const router = useRouter()

  const activeDateRange = ref('7d')
  const isCustomDateDialogVisible = ref(false)
  const customDateRangeValue = ref<[string, string] | null>(null)
  const customDateRangeDraft = ref<[string, string] | null>(null)
  const activePersonFilter = ref('')
  const activeAppFilter = ref('')
  const activeStatusFilter = ref('')
  const searchKw = ref('')
  const checkedIds = ref<string[]>([])
  const sortField = ref('')
  const sortAsc = ref(true)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const isSidebarCollapsed = ref(false)
  const filterOptionsLoading = ref(false)
  const listLoading = ref(false)
  const overviewLoading = ref(false)
  let loadSeq = 0

  // ─── Computed ────────────────────────────────────────────
  const failNamesText = computed(() => {
    const list = overviewMetrics.value.failNames ?? []
    return list.length ? list.join('、') : '暂无'
  })

  const size = 'small' as const
  const disabled = false
  const background = false
  const pagedData = computed<PerformanceListRow[]>(() => tableRows.value)
  const allSelected = computed(
    () =>
      pagedData.value.length > 0 && pagedData.value.every((r) => checkedIds.value.includes(r.id))
  )

  // ─── Methods ─────────────────────────────────────────────
  function fmt(n: number) {
    return n.toLocaleString('en-US')
  }

  function formatYDM(dateText: string): string {
    const [year, month, day] = dateText.split('-')
    return `${year}-${day}-${month}`
  }

  function toYmd(d: Date): string {
    return formatYYYYMMDD(d)
  }

  function getActiveDateRange(): [string, string] {
    const now = getAppNow()
    const end = toYmd(now)

    if (activeDateRange.value === '7d') {
      const startDate = cloneAppDate(now)
      startDate.setDate(startDate.getDate() - 6)
      return [toYmd(startDate), end]
    }
    if (activeDateRange.value === '30d') {
      const startDate = cloneAppDate(now)
      startDate.setDate(startDate.getDate() - 29)
      return [toYmd(startDate), end]
    }
    if (activeDateRange.value === 'month') {
      const startDate = cloneAppDate(now)
      startDate.setDate(1)
      return [toYmd(startDate), end]
    }
    if (activeDateRange.value === 'custom' && customDateRangeValue.value) {
      const [startDate, endDate] = customDateRangeValue.value
      return startDate <= endDate ? [startDate, endDate] : [endDate, startDate]
    }
    return ['1900-01-01', '2999-12-31']
  }

  function buildCustomDateLabel(): string {
    if (!customDateRangeValue.value) return '自定义'
    const [startDate, endDate] = customDateRangeValue.value
    return `${formatYDM(startDate)} ~ ${formatYDM(endDate)}`
  }

  function getDateRangeLabel(range: { label: string; value: string }): string {
    if (range.value !== 'custom') return range.label
    return buildCustomDateLabel()
  }

  function handleDateRangeClick(rangeValue: string) {
    if (rangeValue !== 'custom') {
      activeDateRange.value = rangeValue
      return
    }

    if (!customDateRangeValue.value) {
      const today = getAppNow().toISOString().slice(0, 10)
      customDateRangeDraft.value = [today, today]
    } else {
      customDateRangeDraft.value = [...customDateRangeValue.value] as [string, string]
    }
    isCustomDateDialogVisible.value = true
  }

  function handleCustomDateCancel() {
    isCustomDateDialogVisible.value = false
  }

  function handleCustomDateConfirm() {
    if (!customDateRangeDraft.value || customDateRangeDraft.value.length !== 2) {
      ElMessage.warning('请选择开始和结束日期')
      return
    }
    customDateRangeValue.value = [...customDateRangeDraft.value] as [string, string]
    activeDateRange.value = 'custom'
    isCustomDateDialogVisible.value = false
  }

  function roiClass(v: number): string {
    if (v >= 90) return 'roi-high'
    if (v >= 85) return 'roi-mid'
    return 'roi-low'
  }

  function handleSort(field: string) {
    if (sortField.value === field) sortAsc.value = !sortAsc.value
    else {
      sortField.value = field
      sortAsc.value = false
    }
  }

  function toggleAll(e: Event) {
    if ((e.target as HTMLInputElement).checked) {
      const currentPageIds = pagedData.value.map((r) => r.id)
      checkedIds.value = Array.from(new Set([...checkedIds.value, ...currentPageIds]))
    } else {
      const currentPageSet = new Set(pagedData.value.map((r) => r.id))
      checkedIds.value = checkedIds.value.filter((id) => !currentPageSet.has(id))
    }
  }

  function toggleRow(id: string) {
    const idx = checkedIds.value.indexOf(id)
    if (idx >= 0) checkedIds.value.splice(idx, 1)
    else checkedIds.value.push(id)
  }

  function viewDetail(id: string) {
    const [startDate, endDate] = getActiveDateRange()
    router.push({
      name: 'PerformanceComparison',
      query: {
        ids: id,
        startDate,
        endDate,
        personFilter: activePersonFilter.value,
        appFilter: activeAppFilter.value,
        statusFilter: activeStatusFilter.value,
        keyword: searchKw.value
      }
    })
  }

  function goCompare() {
    if (checkedIds.value.length < 2) return
    const [startDate, endDate] = getActiveDateRange()
    router.push({
      name: 'PerformanceComparison',
      query: {
        ids: checkedIds.value.join(','),
        startDate,
        endDate,
        personFilter: activePersonFilter.value,
        appFilter: activeAppFilter.value,
        statusFilter: activeStatusFilter.value,
        keyword: searchKw.value
      }
    })
  }

  function handleSizeChange(size: number) {
    pageSize.value = size
    currentPage.value = 1
  }

  function handleCurrentChange(page: number) {
    currentPage.value = page
  }

  function getRowClassName({ row }: { row: PerformanceListRow }) {
    return [
      'data-row',
      `border-${row.statusClass}`,
      checkedIds.value.includes(row.id) ? 'row-selected' : ''
    ].join(' ')
  }

  function getTableSummaries({ columns }: { columns: Array<{ label?: string }> }) {
    const map: Record<string, string> = {
      优化师: '团队合计',
      职级: '—',
      广告支出: `$${fmt(tableTotals.value.adSpend)}`,
      预算: `$${fmt(tableTotals.value.budget)}`,
      首日ROI: `${tableTotals.value.roi1}%`,
      '3日ROI': `${tableTotals.value.roi3}%`,
      '7日ROI': `${tableTotals.value.roi7}%`,
      代投消耗: `$${fmt(tableTotals.value.agentCost)}`,
      最低消耗: '—',
      预估利润: `+$${fmt(tableTotals.value.estProfit)}`,
      最低利润: `+$${fmt(tableTotals.value.minProfit)}`,
      得分: `${tableTotals.value.score}分`,
      达标状态: '—',
      操作: ''
    }

    return columns.map((column) => map[column.label || ''] ?? '')
  }

  function buildListRequest(): PerformanceListRequest {
    const [startDate, endDate] = getActiveDateRange()
    return {
      startDate,
      endDate,
      personFilter: activePersonFilter.value,
      appFilter: activeAppFilter.value,
      statusFilter: activeStatusFilter.value,
      keyword: searchKw.value.trim(),
      sortField: sortField.value || undefined,
      sortAsc: sortAsc.value,
      current: currentPage.value,
      size: pageSize.value
    }
  }

  async function loadFilterOptions() {
    const seq = ++loadSeq
    const [startDate, endDate] = getActiveDateRange()
    filterOptionsLoading.value = true
    try {
      const res = await fetchPerformanceListFilterOptions({ startDate, endDate })
      if (seq !== loadSeq) return
      personOptions.value = res.personOptions
      appCategoryOptions.value = res.appCategoryOptions
      statusOptions.value = res.statusOptions
    } finally {
      if (seq === loadSeq) filterOptionsLoading.value = false
    }
  }

  async function loadList(seq: number) {
    const body = buildListRequest()
    listLoading.value = true
    try {
      const listRes = await fetchPerformanceList(body)
      if (seq !== loadSeq) return
      tableRows.value = listRes.list
      tableTotal.value = listRes.total
      tableTotals.value = listRes.totals
    } finally {
      if (seq === loadSeq) listLoading.value = false
    }
  }

  async function loadOverview(seq: number) {
    const body = buildListRequest()
    overviewLoading.value = true
    try {
      const metricsRes = await fetchPerformanceOverviewMetrics({
        startDate: body.startDate,
        endDate: body.endDate,
        personFilter: body.personFilter,
        appFilter: body.appFilter,
        statusFilter: body.statusFilter,
        keyword: body.keyword
      })
      if (seq !== loadSeq) return
      overviewMetrics.value = metricsRes
    } finally {
      if (seq === loadSeq) overviewLoading.value = false
    }
  }

  function loadListAndOverview() {
    const seq = ++loadSeq
    void loadList(seq)
    void loadOverview(seq)
  }

  onMounted(async () => {
    await loadFilterOptions()
    loadListAndOverview()
  })

  watch([activeDateRange, customDateRangeValue], async () => {
    currentPage.value = 1
    await loadFilterOptions()
    loadListAndOverview()
  })

  watch([activePersonFilter, activeAppFilter, activeStatusFilter, searchKw], async () => {
    currentPage.value = 1
    loadListAndOverview()
  })

  watch([currentPage, pageSize, sortField, sortAsc], async () => {
    loadListAndOverview()
  })
</script>

<style scoped lang="scss">
  @use './styles/pa-performance-fx.scss' as *;
  @use './styles/pa-filters-or-align.scss' as *;

  // ─── Tokens ──────────────────────────────────────────────
  $bg: #0d1117;
  $bg-card: #161c2d;
  $bg-header: #111827;
  $bg-row-hover: #1e2a3d;
  $bg-row-selected: #1a2540;
  $border: #1f2d47;
  $border-light: #263354;

  $cyan: #22d3ee;
  $gold: #f59e0b;
  $green: #10b981;
  $red: #ef4444;
  $orange: #f97316;
  $purple: #a855f7;

  $text-primary: #e2e8f0;
  $text-secondary: #64748b;
  $text-muted: #475569;

  // ─── Layout ──────────────────────────────────────────────
  .performance-analysis-page.perf-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    padding: 20px 24px 28px;
    overflow: hidden;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 13px;
    color: var(--text-primary);
  }

  .perf-header {
    flex-shrink: 0;
    padding: 0;
  }

  .perf-header__panel {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
  }

  .perf-header__group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    min-width: 0;
  }

  .perf-header__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
  }

  .date-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .perf-header__btn {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  .perf-header__btn-icon {
    font-size: 14px;
    line-height: 1;
  }

  .perf-header__btn--admin {
    :deep(.el-button__text) {
      display: inline-flex;
      gap: 6px;
      align-items: center;
    }
  }

  .btn-tool {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 5px 12px;
    font-size: 12px;
    color: $text-secondary;
    cursor: pointer;
    background: $bg-card;
    border: 1px solid $border-light;
    border-radius: 9999px;
    transition:
      color 0.15s var(--ease-default),
      border-color 0.15s var(--ease-default),
      background-color 0.15s var(--ease-default);

    &:hover {
      color: $text-primary;
      border-color: $cyan;
    }

    .icon {
      font-size: 14px;
    }
  }

  .btn-admin {
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 600;
    color: $gold;
    cursor: pointer;
    background: rgba($gold, 0.1);
    border: 1px solid rgba($gold, 0.5);
    border-radius: 9999px;
    transition:
      background-color 0.15s var(--ease-default),
      border-color 0.15s var(--ease-default);

    &:hover {
      background: rgba($gold, 0.2);
    }
  }

  // ─── Body ────────────────────────────────────────────────
  .perf-body {
    display: flex;
    flex: 1;
    gap: 16px;
    min-height: 0;
    overflow: hidden;
  }

  .main-area {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    padding: 0;
    overflow: hidden;
  }

  // ─── Table ───────────────────────────────────────────────
  .table-wrap {
    flex: 1;
    min-height: 0;
    padding: 0;
    overflow: hidden;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--art-primary) 14%, transparent);
      border-radius: 9999px;
    }
  }

  .pa-skeleton-table {
    height: 100%;
    padding: 14px 14px 18px;
    background: color-mix(in srgb, var(--default-box-color) 72%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
    border-radius: 14px;
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--art-primary) 8%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--art-gray-900) 8%, transparent);
  }

  .pa-skeleton-table__header {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 8px 6px 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--art-primary) 10%, transparent);
  }

  .pa-skeleton-table__rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 12px;
  }

  .pa-skeleton-table__row {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 6px;
    background: color-mix(in srgb, var(--default-bg-color) 25%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-primary) 10%, transparent);
    border-radius: 10px;
  }

  .sk {
    height: 12px;
    border-radius: 9999px;
  }

  .sk-mt-6 {
    margin-top: 6px;
  }

  .sk-mt-8 {
    margin-top: 8px;
  }

  .sk-mt-10 {
    margin-top: 10px;
  }

  .sk-w-18 {
    width: 18%;
  }

  .sk-w-22 {
    width: 22%;
  }

  .sk-w-24 {
    width: 24%;
  }

  .sk-w-26 {
    width: 26%;
  }

  .sk-w-28 {
    width: 28%;
  }

  .sk-w-30 {
    width: 30%;
  }

  .sk-w-32 {
    width: 32%;
  }

  .sk-w-36 {
    width: 36%;
  }

  .sk-w-40 {
    width: 40%;
  }

  .sk-w-44 {
    width: 44%;
  }

  .sk-w-46 {
    width: 46%;
  }

  .sk-w-56 {
    width: 56%;
  }

  .th-sortable {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    cursor: pointer;
    user-select: none;

    &:hover {
      color: $text-primary;
    }
  }

  .sort-icon {
    font-size: 10px;
    opacity: 0.6;
  }

  :deep(.table-wrap .el-table) {
    --el-table-tr-bg-color: transparent;
    --el-table-row-hover-bg-color: #{$bg-row-hover};
    --el-table-border-color: #{$border};
    --el-fill-color-lighter: #0f1623;

    .el-table__inner-wrapper::before {
      background-color: transparent;
    }

    .el-table__header-wrapper {
      position: sticky;
      top: 0;
      z-index: 1;
      background: transparent;
    }

    .el-table__footer-wrapper {
      position: sticky;
      bottom: 0;
      z-index: 2;
      background: linear-gradient(
        to top,
        color-mix(in srgb, var(--default-box-color) 92%, transparent),
        color-mix(in srgb, var(--default-bg-color) 8%, transparent)
      );
      backdrop-filter: blur(10px);
      border-top: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
    }

    .el-table__body-wrapper {
      padding-bottom: 44px;
    }

    th.el-table__cell {
      padding: 11px 10px;
      font-size: 12px;
      font-weight: 500;
      color: $text-secondary;
      background: linear-gradient(
        to bottom,
        color-mix(in srgb, var(--default-box-color) 88%, transparent),
        color-mix(in srgb, var(--default-bg-color) 18%, transparent)
      );
      border-bottom: 1px solid $border;
    }

    td.el-table__cell {
      padding: 10px;
      white-space: nowrap;
      vertical-align: middle;
      border-bottom: 1px solid $border;
    }
  }

  :deep(.table-wrap .el-table__row.data-row) {
    position: relative;
    isolation: isolate;
    transition:
      background-color 0.22s var(--ease-out),
      box-shadow 0.22s var(--ease-out);

    &.row-selected > td.el-table__cell {
      background: $bg-row-selected;
    }

    &.border-over > td.el-table__cell:first-child {
      box-shadow: inset 3px 0 0 0 $gold;
    }

    &.border-pass > td.el-table__cell:first-child {
      box-shadow: inset 3px 0 0 0 $green;
    }

    &.border-near > td.el-table__cell:first-child {
      box-shadow: inset 3px 0 0 0 $orange;
    }

    &.border-fail > td.el-table__cell:first-child {
      box-shadow: inset 3px 0 0 0 $red;
    }

    &:hover {
      background: color-mix(in srgb, var(--art-primary) 9%, transparent) !important;
      box-shadow:
        0 8px 24px rgb(0 0 0 / 22%),
        inset 0 0 0 1px color-mix(in srgb, var(--art-primary) 22%, transparent);
    }
  }

  .name-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .avatar {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    border-radius: 50%;
  }

  .level-badge {
    display: inline-block;
    padding: 2px 5px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    border-radius: 4px;

    &.level-senior {
      color: $cyan;
      background: rgba($cyan, 0.15);
      border: 1px solid rgba($cyan, 0.3);
    }

    &.level-mid {
      color: #60a5fa;
      background: rgba(#3b82f6, 0.15);
      border: 1px solid rgba(#3b82f6, 0.3);
    }

    &.level-junior {
      color: $text-secondary;
      background: rgba($text-muted, 0.15);
      border: 1px solid rgba($text-muted, 0.3);
    }
  }

  .num {
    font-variant-numeric: tabular-nums;
    text-align: left;
  }

  .score {
    font-weight: 600;
    color: $text-primary;
  }

  .pos {
    color: $green;
  }

  .neg {
    color: $red;
  }

  .roi-high {
    color: $green;
  }

  .roi-mid {
    color: $gold;
  }

  .roi-low {
    color: $red;
  }

  .status-badge {
    display: inline-block;
    padding: 1px 5px;
    font-size: 10px;
    font-weight: 600;
    border-radius: 5px;

    &.s-over {
      color: $green;
      background: rgba($green, 0.15);
      border: 1px solid rgba($green, 0.4);
    }

    &.s-pass {
      color: $cyan;
      background: rgba($cyan, 0.12);
      border: 1px solid rgba($cyan, 0.3);
    }

    &.s-near {
      color: $orange;
      background: rgba($orange, 0.12);
      border: 1px solid rgba($orange, 0.3);
    }

    &.s-fail {
      color: $red;
      background: rgba($red, 0.12);
      border: 1px solid rgba($red, 0.3);
    }
  }

  .view-btn {
    padding: 2px 5px;
    font-size: 12px;
    color: $cyan;
    cursor: pointer;
    background: transparent;
    border: 1px solid $border-light;
    border-radius: 5px;
    transition:
      background-color 0.15s var(--ease-default),
      border-color 0.15s var(--ease-default),
      box-shadow 0.22s var(--ease-out);

    &:hover {
      background: rgba($cyan, 0.1);
      border-color: $cyan;
      box-shadow: 0 0 0 1px rgba($cyan, 0.25);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--focus-ring-color, var(--art-primary)) 55%, transparent);
    }
  }

  // ─── Pagination ──────────────────────────────────────────
  .pagination {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    font-size: 12px;
    color: $text-secondary;
    background: color-mix(in srgb, var(--default-box-color) 72%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
    border-radius: 14px;
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--art-primary) 8%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--art-gray-900) 8%, transparent);
  }

  .pagination :deep(.el-pagination) {
    --el-pagination-button-bg-color: transparent;
    --el-pagination-bg-color: transparent;
    --el-pagination-text-color: #{$text-secondary};
    --el-pagination-hover-color: color-mix(in srgb, var(--art-primary) 92%, white 8%);
    --el-pagination-border-radius: 9999px;
  }

  .pagination :deep(.el-pagination .btn-prev),
  .pagination :deep(.el-pagination .btn-next) {
    width: 30px;
    height: 30px;
    border: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
    border-radius: 9999px;
    transition:
      border-color 0.15s var(--ease-default),
      background-color 0.15s var(--ease-default),
      box-shadow 0.22s var(--ease-out);
  }

  .pagination :deep(.el-pagination .btn-prev:hover),
  .pagination :deep(.el-pagination .btn-next:hover) {
    background: color-mix(in srgb, var(--art-primary) 10%, transparent);
    border-color: color-mix(in srgb, var(--art-primary) 38%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--art-primary) 18%, transparent);
  }

  .pagination :deep(.el-pagination .el-pager li) {
    min-width: 30px;
    height: 30px;
    line-height: 30px;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--art-primary) 12%, transparent);
    border-radius: 9999px;
    transition:
      border-color 0.15s var(--ease-default),
      background-color 0.15s var(--ease-default),
      box-shadow 0.22s var(--ease-out),
      color 0.15s var(--ease-default);
  }

  .pagination :deep(.el-pagination .el-pager li:hover) {
    color: color-mix(in srgb, var(--art-primary) 92%, white 8%);
    background: color-mix(in srgb, var(--art-primary) 10%, transparent);
    border-color: color-mix(in srgb, var(--art-primary) 38%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--art-primary) 18%, transparent);
  }

  .pagination :deep(.el-pagination .el-pager li.is-active) {
    color: color-mix(in srgb, var(--art-primary) 92%, white 8%);
    background: color-mix(in srgb, var(--art-primary) 18%, transparent);
    border-color: color-mix(in srgb, var(--art-primary) 45%, transparent);
    box-shadow:
      0 10px 30px rgb(0 0 0 / 18%),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 16%, transparent);
  }

  .pagination :deep(.el-pagination .el-select .el-input__wrapper),
  .pagination :deep(.el-pagination .el-input__wrapper) {
    background: color-mix(in srgb, var(--default-bg-color) 35%, transparent);
    border-radius: 9999px;
    box-shadow: none;
  }

  .page-left {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .compare-btn {
    padding: 5px 14px;
    font-size: 12px;
    color: $text-muted;
    cursor: not-allowed;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
    border-radius: 9999px;
    opacity: 0.75;
    transition:
      color 0.15s var(--ease-default),
      background-color 0.15s var(--ease-default),
      border-color 0.15s var(--ease-default),
      box-shadow 0.22s var(--ease-out),
      opacity 0.15s var(--ease-default);

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--focus-ring-color, var(--art-primary)) 55%, transparent);
    }

    &.compare-active {
      color: color-mix(in srgb, var(--art-primary) 92%, white 8%);
      cursor: pointer;
      background: color-mix(in srgb, var(--art-primary) 12%, transparent);
      border-color: color-mix(in srgb, var(--art-primary) 45%, transparent);
      box-shadow:
        0 10px 30px rgb(0 0 0 / 22%),
        0 0 0 1px color-mix(in srgb, var(--art-primary) 16%, transparent);
      opacity: 1;

      &:hover {
        background: color-mix(in srgb, var(--art-primary) 18%, transparent);
      }
    }
  }

  .page-right {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .page-btn {
    padding: 4px 10px;
    font-size: 12px;
    color: $text-secondary;
    cursor: pointer;
    background: $bg-card;
    border: 1px solid $border-light;
    border-radius: 5px;
    transition: all 0.15s;

    &:hover:not(:disabled) {
      color: $cyan;
      border-color: $cyan;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  }

  .page-info {
    font-size: 12px;
    color: $text-secondary;
  }

  .page-size-select {
    padding: 4px 8px;
    font-size: 12px;
    color: $text-secondary;
    cursor: pointer;
    background: $bg-card;
    border: 1px solid $border-light;
    border-radius: 5px;
    outline: none;
  }

  // ─── Sidebar ─────────────────────────────────────────────
  .sidebar {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: 320px;
    min-height: 0;
    padding: 12px;
    overflow: hidden;
    border-radius: 16px;
    transition:
      width 0.22s var(--ease-default),
      padding 0.22s var(--ease-default);

    &.pa-sidebar-shell {
      @include pa-neon-surface-static;
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--art-primary) 14%, transparent);
      border-radius: 9999px;
    }
  }

  .sidebar.collapsed {
    width: 96px;
    padding: 10px 8px;
  }

  .sidebar-header {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 6px 12px;
    font-size: 13px;
    font-weight: 600;
    color: $text-primary;
    background: linear-gradient(
      to bottom,
      color-mix(in srgb, var(--default-box-color) 88%, transparent),
      transparent
    );
    backdrop-filter: blur(10px);
    border-bottom: 1px solid color-mix(in srgb, var(--art-primary) 12%, transparent);

    .collapse-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      font-size: 14px;
      color: $text-secondary;
      cursor: pointer;
      background: none;
      border: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
      border-radius: 9999px;
      transition:
        color 0.15s var(--ease-default),
        background-color 0.15s var(--ease-default),
        border-color 0.15s var(--ease-default),
        box-shadow 0.22s var(--ease-out);

      &:hover {
        color: $text-primary;
        background: color-mix(in srgb, var(--art-primary) 10%, transparent);
        border-color: color-mix(in srgb, var(--art-primary) 38%, transparent);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--art-primary) 18%, transparent);
      }

      &:focus-visible {
        outline: none;
        box-shadow:
          0 0 0 2px color-mix(in srgb, var(--focus-ring-color, var(--art-primary)) 55%, transparent),
          0 0 0 6px rgb(0 0 0 / 18%);
      }
    }
  }

  .sidebar-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    padding: 12px 0 4px;
    overflow: hidden;
  }

  .metric-card {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    min-height: 64px;
    padding: 14px;
    overflow: hidden auto;

    .metric-title {
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: 600;
      color: $text-secondary;
    }

    .metric-val {
      font-size: 24px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      line-height: 1.25;
      text-shadow: 0 10px 34px rgb(0 0 0 / 28%);
    }

    .metric-sub {
      font-size: 14px;
      font-weight: 600;
    }

    .metric-badge-inline {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      height: 28px;
      padding: 0 10px;
      font-size: 12px;
      font-weight: 600;
      color: $green;
      background: rgba($green, 0.18);
      border: 1px solid rgba($green, 0.35);
      border-radius: 8px;
    }
  }

  .metric-main-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    justify-content: space-between;
  }

  .metric-main-col {
    align-items: flex-start;
  }

  .metric-side {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-items: flex-end;
    font-size: 12px;
    line-height: 1.35;
    color: $text-secondary;
  }

  .metric-card.alert-card {
    border-color: color-mix(in srgb, var(--art-danger) 38%, transparent) !important;
    box-shadow:
      0 12px 48px rgb(0 0 0 / 48%),
      0 0 0 1px color-mix(in srgb, var(--art-danger) 22%, transparent),
      inset 0 1px 0 rgb(186 230 253 / 10%),
      inset 0 -12px 32px rgb(0 0 0 / 30%);
  }

  .pos-text {
    color: $green;
  }

  .red-text {
    color: $red;
  }

  .gold-text {
    color: $gold;
  }

  @media (width <= 1366px) {
    .sidebar {
      width: 280px;
    }

    .metric-card {
      .metric-val {
        font-size: 22px;
      }

      .metric-sub {
        font-size: 13px;
      }

      .metric-badge-inline {
        height: 24px;
        padding: 0 8px;
        font-size: 12px;
      }
    }

    .metric-side {
      font-size: 12px;
    }
  }

  @media (width <= 1280px) {
    .sidebar {
      width: 260px;
      padding: 10px;
    }

    .metric-card {
      padding: 12px;

      .metric-val {
        font-size: 20px;
      }

      .metric-sub {
        font-size: 12px;
      }

      .metric-title {
        font-size: 11px;
      }
    }

    .metric-side {
      font-size: 11px;
    }
  }

  @media (width <= 1200px) {
    .sidebar {
      width: 240px;
      padding: 10px;
    }

    .metric-card {
      .metric-val {
        font-size: 18px;
      }

      .metric-sub {
        font-size: 12px;
      }
    }
  }

  input[type='checkbox'] {
    width: 14px;
    height: 14px;
    accent-color: $cyan;
    cursor: pointer;
  }

  @media (prefers-reduced-motion: reduce) {
    :deep(.table-wrap .el-table__row.data-row:hover) {
      background: transparent !important;
      box-shadow: none;
    }
  }
</style>
