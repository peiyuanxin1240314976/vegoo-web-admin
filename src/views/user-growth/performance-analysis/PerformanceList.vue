<template>
  <div class="perf-page">
    <!-- ─── Header ─────────────────────────────────── -->
    <div class="perf-header">
      <div class="header-left">
        <div class="breadcrumb">
          <span class="bc-parent">用户增长</span>
          <span class="bc-sep">›</span>
          <span class="bc-current">人员绩效</span>
        </div>
        <div class="subtitle">实时数据截止 {{ currentTime }}</div>
      </div>
      <div class="header-right">
        <span class="date-label">日期范围：</span>
        <div class="date-btns">
          <button
            v-for="d in DATE_RANGES"
            :key="d.value"
            :class="['date-btn', { active: activeDateRange === d.value }]"
            @click="activeDateRange = d.value"
            >{{ d.label }}</button
          >
        </div>
        <button class="btn-tool"> <span class="icon">⊞</span> 自定义列 </button>
        <button class="btn-tool"> <span class="icon">↓</span> 导出 </button>
        <button class="btn-admin">🔐 管理员编辑</button>
      </div>
    </div>

    <div class="perf-body">
      <!-- ─── Main Area ───────────────────────────── -->
      <div class="main-area">
        <!-- Filters -->
        <div class="filter-block">
          <div class="filter-row">
            <span class="filter-label">人员：</span>
            <button
              v-for="p in PERSON_FILTERS"
              :key="p"
              :class="['filter-chip', { active: activePersonFilter === p }]"
              @click="activePersonFilter = p"
              >{{ p }}</button
            >
            <input v-model="searchKw" class="search-input" placeholder="搜索人员..." />
          </div>
          <div class="filter-row">
            <span class="filter-label">应用：</span>
            <button
              v-for="a in APP_FILTERS"
              :key="a"
              :class="['filter-chip', { active: activeAppFilter === a }]"
              @click="activeAppFilter = a"
              >{{ a }}</button
            >
            <span class="filter-label" style="margin-left: 24px">达标状态：</span>
            <button
              v-for="s in STATUS_FILTERS"
              :key="s"
              :class="['filter-chip', { active: activeStatusFilter === s }]"
              @click="activeStatusFilter = s"
              >{{ s }}</button
            >
          </div>
        </div>

        <!-- Table -->
        <div class="table-wrap">
          <table class="perf-table">
            <thead>
              <tr>
                <th class="col-check">
                  <input type="checkbox" :checked="allSelected" @change="toggleAll" />
                </th>
                <th class="col-name">投放师</th>
                <th>职级</th>
                <th class="sortable" @click="handleSort('adSpend')">
                  广告支出
                  <span class="sort-icon">{{
                    sortField === 'adSpend' ? (sortAsc ? '↑' : '↓') : '↕'
                  }}</span>
                </th>
                <th>计算消耗</th>
                <th>首日ROI</th>
                <th>3日ROI</th>
                <th>7日ROI</th>
                <th>代投消耗</th>
                <th>最低消耗</th>
                <th>预估利润</th>
                <th>最低利润</th>
                <th>绩效得分</th>
                <th>达标状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in filteredData"
                :key="row.id"
                :class="[
                  'data-row',
                  `border-${row.statusClass}`,
                  { 'row-selected': checkedIds.includes(row.id) }
                ]"
              >
                <td>
                  <input
                    type="checkbox"
                    :checked="checkedIds.includes(row.id)"
                    @change="toggleRow(row.id)"
                  />
                </td>
                <td class="name-cell">
                  <span class="avatar" :style="{ background: row.avatarBg }">{{
                    row.surname
                  }}</span>
                  {{ row.name }}
                </td>
                <td>
                  <span :class="['level-badge', `level-${row.levelClass}`]">{{ row.level }}</span>
                </td>
                <td class="num">${{ fmt(row.adSpend) }}</td>
                <td class="num">${{ fmt(row.calcCost) }}</td>
                <td :class="['num', roiClass(row.roi1)]">{{ row.roi1 }}%</td>
                <td :class="['num', roiClass(row.roi3)]">{{ row.roi3 }}%</td>
                <td :class="['num', roiClass(row.roi7)]">{{ row.roi7 }}%</td>
                <td class="num">${{ fmt(row.agentCost) }}</td>
                <td class="num">${{ fmt(row.minCost) }}</td>
                <td :class="['num', row.estProfit >= 0 ? 'pos' : 'neg']">
                  {{ row.estProfit >= 0 ? '+' : '' }}${{ fmt(Math.abs(row.estProfit)) }}
                </td>
                <td :class="['num', row.minProfit >= 0 ? 'pos' : 'neg']">
                  {{ row.minProfit >= 0 ? '+' : '' }}${{ fmt(Math.abs(row.minProfit)) }}
                </td>
                <td class="num score">{{ row.score }}分</td>
                <td>
                  <span :class="['status-badge', `s-${row.statusClass}`]">{{ row.status }}</span>
                </td>
                <td>
                  <button class="view-btn" @click="viewDetail(row.id)">查看</button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td></td>
                <td class="total-label">团队合计</td>
                <td>—</td>
                <td class="num">${{ fmt(TOTALS.adSpend) }}</td>
                <td class="num">${{ fmt(TOTALS.calcCost) }}</td>
                <td class="num">{{ TOTALS.roi1 }}%</td>
                <td class="num">{{ TOTALS.roi3 }}%</td>
                <td class="num">{{ TOTALS.roi7 }}%</td>
                <td class="num">${{ fmt(TOTALS.agentCost) }}</td>
                <td class="num">—</td>
                <td class="num pos">+${{ fmt(TOTALS.estProfit) }}</td>
                <td class="num pos">+${{ fmt(TOTALS.minProfit) }}</td>
                <td class="num">{{ TOTALS.score }}分</td>
                <td>—</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
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
            <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--"
              >上一页</button
            >
            <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
            <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++"
              >下一页</button
            >
            <select v-model="pageSize" class="page-size-select">
              <option :value="20">每页 20 条</option>
              <option :value="50">每页 50 条</option>
            </select>
          </div>
        </div>
      </div>

      <!-- ─── Right Sidebar ──────────────────────── -->
      <div class="sidebar">
        <div class="sidebar-header">
          <span>指标概览</span>
          <button class="collapse-btn">∧</button>
        </div>
        <div class="metric-card">
          <div class="metric-title">团队广告支出</div>
          <div class="metric-val">${{ fmt(272068) }}</div>
          <div class="metric-sub pos-text">周环比 +8%</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">首日ROI均值</div>
          <div class="metric-val gold-text">89%</div>
          <div class="metric-badge-inline">达标</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">团队预估利润</div>
          <div class="metric-val pos-text">+$47,200</div>
          <div class="metric-sub pos-text">周环比 +12%</div>
        </div>
        <div class="metric-card alert-card">
          <div class="metric-title">未达标人员</div>
          <div class="metric-val red-text">1 人</div>
          <div class="metric-sub red-text">王五</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'

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
      level: '高级投放师',
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
      statusClass: 'over'
    },
    {
      id: 'zhang3',
      surname: '张',
      name: '张三',
      avatarBg: '#06b6d4',
      level: '高级投放师',
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
      statusClass: 'pass'
    },
    {
      id: 'liu7',
      surname: '刘',
      name: '刘七',
      avatarBg: '#3b82f6',
      level: '投放师',
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
      statusClass: 'pass'
    },
    {
      id: 'li4',
      surname: '李',
      name: '李四',
      avatarBg: '#6366f1',
      level: '投放师',
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
      statusClass: 'pass'
    },
    {
      id: 'chen8',
      surname: '陈',
      name: '陈八',
      avatarBg: '#8b5cf6',
      level: '投放师',
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
      statusClass: 'pass'
    },
    {
      id: 'zhou9',
      surname: '周',
      name: '周九',
      avatarBg: '#0ea5e9',
      level: '投放师',
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
      statusClass: 'pass'
    },
    {
      id: 'wu10',
      surname: '吴',
      name: '吴十',
      avatarBg: '#64748b',
      level: '初级投放师',
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
      statusClass: 'near'
    },
    {
      id: 'wang5',
      surname: '王',
      name: '王五',
      avatarBg: '#a855f7',
      level: '投放师',
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
      statusClass: 'fail'
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

  const currentTime = ref('14:40')
  const activeDateRange = ref('7d')
  const activePersonFilter = ref('全部')
  const activeAppFilter = ref('全部')
  const activeStatusFilter = ref('全部')
  const searchKw = ref('')
  const checkedIds = ref<string[]>([])
  const sortField = ref('')
  const sortAsc = ref(true)
  const currentPage = ref(1)
  const pageSize = ref(20)

  // ─── Computed ────────────────────────────────────────────
  const filteredData = computed<StaffRow[]>(() => {
    let list = [...MOCK_DATA]

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

  const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value) || 1)
  const allSelected = computed(
    () =>
      filteredData.value.length > 0 &&
      filteredData.value.every((r) => checkedIds.value.includes(r.id))
  )

  // ─── Methods ─────────────────────────────────────────────
  function fmt(n: number) {
    return n.toLocaleString('en-US')
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
      checkedIds.value = filteredData.value.map((r) => r.id)
    } else {
      checkedIds.value = []
    }
  }

  function toggleRow(id: string) {
    const idx = checkedIds.value.indexOf(id)
    if (idx >= 0) checkedIds.value.splice(idx, 1)
    else checkedIds.value.push(id)
  }

  function viewDetail(id: string) {
    router.push({ name: 'PerformanceComparison', query: { ids: id } })
  }

  function goCompare() {
    if (checkedIds.value.length < 2) return
    router.push({ name: 'PerformanceComparison', query: { ids: checkedIds.value.join(',') } })
  }
</script>

<style scoped lang="scss">
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
  .perf-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 13px;
    color: $text-primary;
    background: $bg;
  }

  // ─── Header ──────────────────────────────────────────────
  .perf-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    background: $bg-header;
    border-bottom: 1px solid $border;
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

  .header-right {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .date-label {
    font-size: 12px;
    color: $text-secondary;
    white-space: nowrap;
  }

  .date-btns {
    display: flex;
    gap: 2px;
  }

  .date-btn {
    padding: 5px 12px;
    font-size: 12px;
    color: $text-secondary;
    cursor: pointer;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      color: $text-primary;
      background: $bg-card;
    }

    &.active {
      font-weight: 600;
      color: #000;
      background: $cyan;
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
    border-radius: 6px;
    transition: all 0.15s;

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
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      background: rgba($gold, 0.2);
    }
  }

  // ─── Body ────────────────────────────────────────────────
  .perf-body {
    display: flex;
    flex: 1;
    gap: 0;
    overflow: hidden;
  }

  .main-area {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    padding: 16px 20px;
    overflow: hidden;
  }

  // ─── Filters ─────────────────────────────────────────────
  .filter-block {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 8px;
    padding: 12px 16px;
    background: $bg-card;
    border: 1px solid $border;
    border-radius: 10px;
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .filter-label {
    flex-shrink: 0;
    font-size: 12px;
    color: $text-secondary;
    white-space: nowrap;
  }

  .filter-chip {
    padding: 4px 12px;
    font-size: 12px;
    color: $text-secondary;
    cursor: pointer;
    background: transparent;
    border: 1px solid $border-light;
    border-radius: 20px;
    transition: all 0.15s;

    &:hover {
      color: $text-primary;
      border-color: $cyan;
    }

    &.active {
      font-weight: 600;
      color: #000;
      background: $cyan;
      border-color: $cyan;
    }
  }

  .search-input {
    width: 140px;
    padding: 4px 12px;
    font-size: 12px;
    color: $text-primary;
    background: rgb(255 255 255 / 4%);
    border: 1px solid $border-light;
    border-radius: 20px;
    outline: none;

    &::placeholder {
      color: $text-muted;
    }

    &:focus {
      border-color: $cyan;
    }
  }

  // ─── Table ───────────────────────────────────────────────
  .table-wrap {
    flex: 1;
    overflow: auto;
    background: $bg-card;
    border: 1px solid $border;
    border-radius: 10px;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: $bg-card;
    }

    &::-webkit-scrollbar-thumb {
      background: $border-light;
      border-radius: 3px;
    }
  }

  .perf-table {
    width: 100%;
    font-size: 12.5px;
    border-collapse: collapse;

    th {
      position: sticky;
      top: 0;
      z-index: 1;
      padding: 11px 10px;
      font-size: 12px;
      font-weight: 500;
      color: $text-secondary;
      text-align: left;
      white-space: nowrap;
      background: #0f1623;
      border-bottom: 1px solid $border;

      &.sortable {
        cursor: pointer;
        user-select: none;

        &:hover {
          color: $text-primary;
        }
      }

      .sort-icon {
        margin-left: 4px;
        font-size: 10px;
        opacity: 0.6;
      }
    }

    .col-check {
      width: 36px;
      padding-left: 14px;
    }

    .col-name {
      min-width: 100px;
    }

    .data-row {
      border-bottom: 1px solid $border;
      border-left: 3px solid transparent;
      transition: background 0.15s;

      &:hover {
        background: $bg-row-hover;
      }

      &.row-selected {
        background: $bg-row-selected;
      }

      &.border-over {
        border-left-color: $gold;
      }

      &.border-pass {
        border-left-color: $green;
      }

      &.border-near {
        border-left-color: $orange;
      }

      &.border-fail {
        border-left-color: $red;
      }

      td {
        padding: 10px;
        white-space: nowrap;
        vertical-align: middle;
      }
    }

    .total-row {
      background: #0f1623;
      border-top: 2px solid $border-light;

      td {
        padding: 10px;
        font-weight: 600;
        color: $text-secondary;
      }

      .total-label {
        color: $text-primary;
      }
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
    padding: 2px 8px;
    font-size: 11px;
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
    text-align: right;
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
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 20px;

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
    padding: 4px 12px;
    font-size: 12px;
    color: $cyan;
    cursor: pointer;
    background: transparent;
    border: 1px solid $border-light;
    border-radius: 5px;
    transition: all 0.15s;

    &:hover {
      background: rgba($cyan, 0.1);
      border-color: $cyan;
    }
  }

  // ─── Pagination ──────────────────────────────────────────
  .pagination {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 10px 4px;
    font-size: 12px;
    color: $text-secondary;
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
    border: 1px solid $border-light;
    border-radius: 6px;
    transition: all 0.15s;

    &.compare-active {
      color: $cyan;
      cursor: pointer;
      background: rgba($cyan, 0.08);
      border-color: $cyan;

      &:hover {
        background: rgba($cyan, 0.15);
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
    width: 220px;
    padding: 0;
    overflow-y: auto;
    background: $bg-card;
    border-left: 1px solid $border;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 10px;
    font-size: 13px;
    font-weight: 600;
    color: $text-primary;
    border-bottom: 1px solid $border;

    .collapse-btn {
      font-size: 14px;
      color: $text-secondary;
      cursor: pointer;
      background: none;
      border: none;

      &:hover {
        color: $text-primary;
      }
    }
  }

  .metric-card {
    padding: 16px;
    border-bottom: 1px solid $border;

    .metric-title {
      margin-bottom: 6px;
      font-size: 11px;
      color: $text-secondary;
    }

    .metric-val {
      margin-bottom: 4px;
      font-size: 22px;
      font-weight: 700;
      line-height: 1.2;
    }

    .metric-sub {
      font-size: 11px;
    }

    .metric-badge-inline {
      display: inline-block;
      padding: 2px 8px;
      margin-top: 4px;
      font-size: 11px;
      color: $cyan;
      background: rgba($cyan, 0.12);
      border: 1px solid rgba($cyan, 0.3);
      border-radius: 4px;
    }
  }

  .alert-card {
    background: rgba($red, 0.05);
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

  input[type='checkbox'] {
    width: 14px;
    height: 14px;
    accent-color: $cyan;
    cursor: pointer;
  }
</style>
