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
        <div class="filter-block pa-neon-filter">
          <div class="filter-row">
            <span class="filter-label">人员：</span>
            <button
              v-for="p in PERSON_FILTERS"
              :key="p"
              type="button"
              :class="['filter-chip', { active: activePersonFilter === p }]"
              @click="activePersonFilter = p"
              >{{ p }}</button
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
              v-for="a in APP_FILTERS"
              :key="a"
              type="button"
              :class="['filter-chip', { active: activeAppFilter === a }]"
              @click="activeAppFilter = a"
              >{{ a }}</button
            >
            <span class="filter-spacer" aria-hidden="true"></span>
            <span class="filter-label">达标状态：</span>
            <button
              v-for="s in STATUS_FILTERS"
              :key="s"
              type="button"
              :class="['filter-chip', { active: activeStatusFilter === s }]"
              @click="activeStatusFilter = s"
              >{{ s }}</button
            >
          </div>
        </div>

        <!-- Table -->
        <div class="table-wrap pa-neon-table-wrap pa-entry-3">
          <ArtTable
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
              <template #default="{ row }">${{ fmt(row.calcCost) }}</template>
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
            共 {{ filteredData.length }} 人 &nbsp; 已选择 {{ checkedIds.length }} 人
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
              :total="filteredData.length"
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
            <div class="metric-title">团队广告支出</div>
            <div class="metric-main-row">
              <div class="metric-val">${{ fmt(overviewMetrics.adSpend) }}</div>
              <div class="metric-side">
                <span>周环比</span>
                <span class="pos-text">+8%</span>
              </div>
            </div>
          </div>
          <div class="metric-card pa-neon-lift-card">
            <div class="metric-title">首日ROI均值</div>
            <div class="metric-main-row">
              <div class="metric-val gold-text">{{ overviewMetrics.avgRoi1.toFixed(2) }}%</div>
              <div class="metric-badge-inline">{{ overviewMetrics.roiStatusLabel }}</div>
            </div>
          </div>
          <div class="metric-card pa-neon-lift-card">
            <div class="metric-title">团队预估利润</div>
            <div class="metric-main-row">
              <div
                :class="['metric-val', overviewMetrics.estProfit >= 0 ? 'pos-text' : 'red-text']"
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
          </div>
          <div class="metric-card pa-neon-lift-card alert-card">
            <div class="metric-title">未达标人员</div>
            <div class="metric-main-row metric-main-col">
              <div class="metric-val red-text">{{ overviewMetrics.failCount }} 人</div>
              <div class="metric-sub red-text">{{ overviewMetrics.failNamesText }}</div>
            </div>
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
  import { ref, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { ArrowLeftBold, ArrowRightBold } from '@element-plus/icons-vue'
  import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'

  defineOptions({ name: 'PerformanceList' })

  const tableHeaderCellStyle = {
    backgroundColor: 'color-mix(in srgb, var(--default-box-color) 88%, transparent)'
  }

  // ─── Types ──────────────────────────────────────────────
  interface StaffRow {
    id: string
    surname: string
    name: string
    avatarBg: string
    level: string
    levelClass: string
    adSpend: number
    calcCost: number
    roi1: number
    roi3: number
    roi7: number
    agentCost: number
    minCost: number
    estProfit: number
    minProfit: number
    score: number
    status: string
    statusClass: string
    reportDate: string
  }

  // ─── Constants ──────────────────────────────────────────
  const DATE_RANGES = [
    { label: '最近7天', value: '7d' },
    { label: '最近30天', value: '30d' },
    { label: '本月', value: 'month' },
    { label: '自定义', value: 'custom' }
  ]

  const PERSON_FILTERS = ['全部', '张三', '李四', '王五', '赵六', '刘七', '陈八', '周九', '吴十']
  const APP_FILTERS = ['全部', '天气类', '健康类', '工具类']
  const STATUS_FILTERS = ['全部', '达标', '未达标']

  const MOCK_DATA: StaffRow[] = [
    {
      id: 'zhao6',
      surname: '赵',
      name: '赵六',
      avatarBg: '#f97316',
      level: '高级优化师',
      levelClass: 'senior',
      adSpend: 52100,
      calcCost: 50800,
      roi1: 96,
      roi3: 94,
      roi7: 95,
      agentCost: 2400,
      minCost: 48000,
      estProfit: 15600,
      minProfit: 9800,
      score: 96,
      status: '超标',
      statusClass: 'over',
      reportDate: '2026-03-26'
    },
    {
      id: 'zhao6',
      surname: '赵',
      name: '赵六',
      avatarBg: '#f97316',
      level: '高级优化师',
      levelClass: 'senior',
      adSpend: 52100,
      calcCost: 50800,
      roi1: 96,
      roi3: 94,
      roi7: 95,
      agentCost: 2400,
      minCost: 48000,
      estProfit: 15600,
      minProfit: 9800,
      score: 96,
      status: '超标',
      statusClass: 'over',
      reportDate: '2026-03-25'
    },
    {
      id: 'zhang3',
      surname: '张',
      name: '张三',
      avatarBg: '#06b6d4',
      level: '高级优化师',
      levelClass: 'senior',
      adSpend: 49279,
      calcCost: 49840,
      roi1: 93,
      roi3: 91,
      roi7: 92,
      agentCost: 1866,
      minCost: 45000,
      estProfit: 12400,
      minProfit: 8200,
      score: 94,
      status: '达标',
      statusClass: 'pass',
      reportDate: '2026-03-22'
    },
    {
      id: 'liu7',
      surname: '刘',
      name: '刘七',
      avatarBg: '#3b82f6',
      level: '优化师',
      levelClass: 'mid',
      adSpend: 33500,
      calcCost: 31200,
      roi1: 91,
      roi3: 89,
      roi7: 90,
      agentCost: 0,
      minCost: 30000,
      estProfit: 8900,
      minProfit: 5100,
      score: 90,
      status: '达标',
      statusClass: 'pass',
      reportDate: '2026-03-18'
    },
    {
      id: 'li4',
      surname: '李',
      name: '李四',
      avatarBg: '#6366f1',
      level: '优化师',
      levelClass: 'mid',
      adSpend: 37838,
      calcCost: 27159,
      roi1: 88,
      roi3: 86,
      roi7: 87,
      agentCost: 38,
      minCost: 25000,
      estProfit: 6800,
      minProfit: 3200,
      score: 88,
      status: '达标',
      statusClass: 'pass',
      reportDate: '2026-03-10'
    },
    {
      id: 'chen8',
      surname: '陈',
      name: '陈八',
      avatarBg: '#8b5cf6',
      level: '优化师',
      levelClass: 'mid',
      adSpend: 29600,
      calcCost: 28400,
      roi1: 85,
      roi3: 83,
      roi7: 84,
      agentCost: 120,
      minCost: 27000,
      estProfit: 3200,
      minProfit: 1800,
      score: 83,
      status: '达标',
      statusClass: 'pass',
      reportDate: '2026-02-28'
    },
    {
      id: 'zhou9',
      surname: '周',
      name: '周九',
      avatarBg: '#0ea5e9',
      level: '优化师',
      levelClass: 'mid',
      adSpend: 24100,
      calcCost: 22800,
      roi1: 82,
      roi3: 80,
      roi7: 81,
      agentCost: 200,
      minCost: 21000,
      estProfit: 1600,
      minProfit: 800,
      score: 80,
      status: '达标',
      statusClass: 'pass',
      reportDate: '2026-02-19'
    },
    {
      id: 'wu10',
      surname: '吴',
      name: '吴十',
      avatarBg: '#64748b',
      level: '初级优化师',
      levelClass: 'junior',
      adSpend: 18200,
      calcCost: 16900,
      roi1: 84,
      roi3: 82,
      roi7: 83,
      agentCost: 0,
      minCost: 15000,
      estProfit: 900,
      minProfit: 200,
      score: 78,
      status: '接近达标',
      statusClass: 'near',
      reportDate: '2026-02-10'
    },
    {
      id: 'wang5',
      surname: '王',
      name: '王五',
      avatarBg: '#a855f7',
      level: '优化师',
      levelClass: 'mid',
      adSpend: 28450,
      calcCost: 26100,
      roi1: 79,
      roi3: 77,
      roi7: 78,
      agentCost: 420,
      minCost: 24000,
      estProfit: -1200,
      minProfit: -3800,
      score: 72,
      status: '未达标',
      statusClass: 'fail',
      reportDate: '2026-01-30'
    }
  ]

  const TOTALS = {
    adSpend: 272068,
    calcCost: 252259,
    roi1: 89,
    roi3: 87,
    roi7: 88,
    agentCost: 5044,
    estProfit: 47200,
    minProfit: 25100,
    score: 85
  }

  // ─── State ──────────────────────────────────────────────
  const router = useRouter()

  const activeDateRange = ref('7d')
  const isCustomDateDialogVisible = ref(false)
  const customDateRangeValue = ref<[string, string] | null>(null)
  const customDateRangeDraft = ref<[string, string] | null>(null)
  const activePersonFilter = ref('全部')
  const activeAppFilter = ref('全部')
  const activeStatusFilter = ref('全部')
  const searchKw = ref('')
  const checkedIds = ref<string[]>([])
  const sortField = ref('')
  const sortAsc = ref(true)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const isSidebarCollapsed = ref(false)

  // ─── Computed ────────────────────────────────────────────
  const filteredData = computed<StaffRow[]>(() => {
    let list = [...MOCK_DATA]
    const [rangeStart, rangeEnd] = getActiveDateRange()

    list = list.filter((r) => r.reportDate >= rangeStart && r.reportDate <= rangeEnd)

    if (activePersonFilter.value !== '全部') {
      list = list.filter((r) => r.name === activePersonFilter.value)
    }
    if (activeStatusFilter.value === '达标') {
      list = list.filter((r) => r.statusClass === 'pass' || r.statusClass === 'over')
    } else if (activeStatusFilter.value === '未达标') {
      list = list.filter((r) => r.statusClass === 'fail' || r.statusClass === 'near')
    }
    if (searchKw.value) {
      list = list.filter((r) => r.name.includes(searchKw.value))
    }
    if (sortField.value === 'adSpend') {
      list.sort((a, b) => (sortAsc.value ? a.adSpend - b.adSpend : b.adSpend - a.adSpend))
    }
    return list
  })
  const overviewMetrics = computed(() => {
    const list = filteredData.value
    const total = list.length
    const adSpend = list.reduce((sum, item) => sum + item.adSpend, 0)
    const estProfit = list.reduce((sum, item) => sum + item.estProfit, 0)
    const avgRoi1 = total > 0 ? list.reduce((sum, item) => sum + item.roi1, 0) / total : 0
    const failRows = list.filter(
      (item) => item.statusClass === 'fail' || item.statusClass === 'near'
    )
    const failNamesText =
      failRows.length > 0 ? failRows.map((item) => item.name).join('、') : '暂无'
    const roiStatusLabel = avgRoi1 >= 85 ? '达标' : '未达标'

    return {
      adSpend,
      estProfit,
      avgRoi1,
      failCount: failRows.length,
      failNamesText,
      roiStatusLabel
    }
  })

  const size = 'small' as const
  const disabled = false
  const background = false
  const pagedData = computed<StaffRow[]>(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredData.value.slice(start, start + pageSize.value)
  })
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

  function getRowClassName({ row }: { row: StaffRow }) {
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
      广告支出: `$${fmt(TOTALS.adSpend)}`,
      预算: `$${fmt(TOTALS.calcCost)}`,
      首日ROI: `${TOTALS.roi1}%`,
      '3日ROI': `${TOTALS.roi3}%`,
      '7日ROI': `${TOTALS.roi7}%`,
      代投消耗: `$${fmt(TOTALS.agentCost)}`,
      最低消耗: '—',
      预估利润: `+$${fmt(TOTALS.estProfit)}`,
      最低利润: `+$${fmt(TOTALS.minProfit)}`,
      得分: `${TOTALS.score}分`,
      达标状态: '—',
      操作: ''
    }

    return columns.map((column) => map[column.label || ''] ?? '')
  }

  watch([filteredData, pageSize], () => {
    const maxPage = Math.max(1, Math.ceil(filteredData.value.length / pageSize.value))
    if (currentPage.value > maxPage) currentPage.value = maxPage
  })
</script>

<style scoped lang="scss">
  @import './styles/pa-performance-fx';

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

  // ─── Header ──────────────────────────────────────────────
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
    padding: 10px 14px;
    margin-bottom: 12px;
    border-radius: 16px;

    @include pa-neon-surface-static;
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

  .breadcrumb {
    font-size: 16px;
    font-weight: 600;

    .bc-parent {
      color: $text-secondary;
      cursor: pointer;

      &:hover {
        color: $text-primary;
      }
    }

    .bc-sep {
      margin: 0 6px;
      color: $text-muted;
    }

    .bc-current {
      color: $text-primary;
    }
  }

  .subtitle {
    margin-top: 2px;
    font-size: 11px;
    color: $text-muted;
  }

  .date-label {
    font-size: 12px;
    color: $text-secondary;
    white-space: nowrap;
  }

  .date-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .date-btn {
    padding: 5px 12px;
    font-size: 12px;
    color: $text-secondary;
    cursor: pointer;
    background: color-mix(in srgb, var(--default-box-color) 72%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
    border-radius: 9999px;
    transition:
      color 0.15s var(--ease-default),
      background-color 0.15s var(--ease-default),
      border-color 0.15s var(--ease-default);

    &:hover {
      color: $text-primary;
      border-color: color-mix(in srgb, var(--art-primary) 40%, transparent);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--focus-ring-color, var(--art-primary)) 55%, transparent);
    }

    &.active {
      font-weight: 600;
      color: var(--art-gray-900);
      background: color-mix(in srgb, var(--art-primary) 82%, white 18%);
      border-color: color-mix(in srgb, var(--art-primary) 55%, transparent);
    }
  }

  .perf-header__btn {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 6px 14px;
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
    padding: 0;
    overflow: hidden;
  }

  // ─── Filters ─────────────────────────────────────────────
  .filter-block {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 8px;
    padding: 12px 14px;
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    padding: 8px 10px;
    background: color-mix(in srgb, var(--default-bg-color) 35%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-primary) 10%, transparent);
    border-radius: 12px;
  }

  .filter-label {
    flex-shrink: 0;
    font-size: 12px;
    color: $text-secondary;
    white-space: nowrap;
  }

  .filter-spacer {
    width: 10px;
    height: 14px;
    margin: 0 2px 0 6px;
    border-left: 1px dashed color-mix(in srgb, var(--art-primary) 18%, transparent);
  }

  .filter-chip {
    padding: 4px 12px;
    font-size: 12px;
    color: $text-secondary;
    cursor: pointer;
    background: color-mix(in srgb, var(--default-box-color) 35%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
    border-radius: 20px;
    transition:
      color 0.15s var(--ease-default),
      background-color 0.15s var(--ease-default),
      border-color 0.15s var(--ease-default),
      box-shadow 0.22s var(--ease-out);

    &:hover {
      color: $text-primary;
      border-color: color-mix(in srgb, var(--art-primary) 45%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--art-primary) 20%, transparent);
    }

    &:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 2px color-mix(in srgb, var(--focus-ring-color, var(--art-primary)) 55%, transparent),
        0 0 0 6px rgb(0 0 0 / 18%);
    }

    &.active {
      font-weight: 600;
      color: var(--art-gray-900);
      background: color-mix(in srgb, var(--art-primary) 82%, white 18%);
      border-color: color-mix(in srgb, var(--art-primary) 55%, transparent);
      box-shadow:
        0 10px 30px rgb(0 0 0 / 22%),
        0 0 0 1px color-mix(in srgb, var(--art-primary) 24%, transparent),
        0 0 24px color-mix(in srgb, var(--art-primary) 16%, transparent);
    }
  }

  .search-input {
    flex: 1;
    width: 220px;
    min-width: 180px;
    max-width: 360px;
    padding: 6px 12px;
    font-size: 12px;
    color: $text-primary;
    background: rgb(255 255 255 / 4%);
    border: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
    border-radius: 20px;
    outline: none;
    transition:
      border-color 0.15s var(--ease-default),
      box-shadow 0.22s var(--ease-out);

    &::placeholder {
      color: $text-muted;
    }

    &:focus-visible {
      border-color: color-mix(in srgb, var(--art-primary) 55%, transparent);
      box-shadow:
        0 0 0 2px color-mix(in srgb, var(--focus-ring-color, var(--art-primary)) 45%, transparent),
        0 0 0 6px rgb(0 0 0 / 16%);
    }
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
    padding: 12px;
    overflow-y: auto;
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
    flex-direction: column;
    gap: 12px;
    padding: 12px 0 4px;
  }

  .metric-card {
    padding: 14px;

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
