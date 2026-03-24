<template>
  <div class="open-account-tab">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <!-- 左侧筛选 -->
      <div class="filter-left">
        <!-- 广告平台 -->
        <div class="filter-group">
          <span class="filter-label">广告平台：</span>
          <el-select v-model="sourceFilter" placeholder="全部" class="filter-select" clearable>
            <el-option label="全部" value="" />
            <el-option v-for="p in PLATFORM_CONFIGS" :key="p.value" :label="p.label" :value="p.value" />
          </el-select>
        </div>
        <!-- 开户状态 -->
        <div class="filter-group">
          <span class="filter-label">开户状态：</span>
          <div class="status-tabs">
            <button
              v-for="s in statusOptions"
              :key="s.value"
              :class="['status-tab', `status-tab--${s.type}`, { 'status-tab--active': statusFilter === s.value }]"
              @click="statusFilter = s.value"
            >
              {{ s.label }}
              <span v-if="s.count !== undefined" class="status-tab-count">{{ s.count }}</span>
            </button>
          </div>
        </div>
        <!-- 代理商 -->
        <div class="filter-group">
          <span class="filter-label">代理商：</span>
          <el-select v-model="agencyFilter" placeholder="全部" class="filter-select" clearable>
            <el-option label="全部" value="" />
            <el-option v-for="a in agencyOptions" :key="a" :label="a" :value="a" />
          </el-select>
        </div>
        <!-- 应用 -->
        <div class="filter-group">
          <span class="filter-label">应用：</span>
          <el-select v-model="appFilter" placeholder="全部" class="filter-select" clearable>
            <el-option label="全部" value="" />
            <el-option v-for="a in appOptions" :key="a" :label="a" :value="a" />
          </el-select>
        </div>
      </div>
      <!-- 右侧飞书推送 -->
      <div class="feishu-bar">
        <span class="feishu-label">飞书推送：</span>
        <span class="feishu-status">
          <span :class="['feishu-dot', { 'feishu-dot--on': feishuEnabled }]" />
          {{ feishuEnabled ? '已开启' : '未开启' }}
        </span>
        <button class="feishu-setting-btn" @click="handleOpenFeishuSetting">
          推送设置
          <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
            <circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M8 2v2M8 12v2M2 8h2M12 8h2M3.5 3.5l1.5 1.5M11 11l1.5 1.5M3.5 12.5L5 11M11 5l1.5-1.5"
              stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-label">开户记录总数</div>
        <div class="stat-value stat-value--total">{{ stats.total }}</div>
      </div>
      <div class="stat-card stat-card--warn">
        <div class="stat-label-row">
          <span class="stat-label">待分配凭据</span>
          <span class="stat-tag-warn">需处理</span>
        </div>
        <div class="stat-value stat-value--warn">{{ stats.pending }}</div>
      </div>
      <div class="stat-card stat-card--ok">
        <div class="stat-label">已激活</div>
        <div class="stat-value stat-value--ok">{{ stats.active }}</div>
      </div>
      <div class="stat-card stat-card--fail">
        <div class="stat-label">开户失败</div>
        <div class="stat-value stat-value--fail">{{ stats.failed }}</div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <el-table
        :data="pagedList"
        class="open-account-table"
        table-layout="auto"
        :row-class-name="getRowClass"
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="申请ID" min-width="90">
          <template #default="{ row }">
            <span class="apply-id" :style="{ color: row.id === selectedId ? '#22d3ee' : '#3b82f6' }">
              {{ row.id }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="广告平台" min-width="140">
          <template #default="{ row }">
            <div class="platform-cell">
              <span class="platform-icon-wrap" :style="{ color: getPlatformColor(row.source), background: getPlatformBg(row.source) }">
                {{ getPlatformShort(row.source) }}
              </span>
              <span class="platform-name">{{ row.source }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="app" label="应用" min-width="120" show-overflow-tooltip />
        <el-table-column label="平台" min-width="70" align="center">
          <template #default="{ row }">
            <span :class="['platform-badge', row.platform === 'iOS' ? 'platform-badge--ios' : 'platform-badge--android']">
              {{ row.platform }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="accountType" label="开户类型" min-width="90" align="center" />
        <el-table-column label="归属代理商" min-width="110" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="['agency-name', isHighlightAgency(row.agency) ? 'agency-name--highlight' : '']">
              {{ row.agency }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="开户金额" min-width="90" align="right">
          <template #default="{ row }">
            <span class="amount">${{ row.amount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="applicant" label="申请人" min-width="70" align="center" />
        <el-table-column label="登记时间" min-width="90" align="center">
          <template #default="{ row }">
            <span class="reg-time">{{ row.registerTime.slice(5, 10) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <span :class="['status-badge', getStatusClass(row.status)]">
              <span class="status-icon">{{ getStatusIcon(row.status) }}</span>
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="160" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-btns">
              <button class="action-btn action-btn--view" @click.stop="emit('detail', row)">
                查看
              </button>
              <button
                v-if="row.status === '待分配'"
                class="action-btn action-btn--assign"
                @click.stop="emit('assign', row)"
              >
                分配凭据
              </button>
              <button class="action-btn action-btn--del" @click.stop="emit('delete', row)">
                删除
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-bar">
        <span class="pagination-total">共 {{ total }} 条</span>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          class="oa-pagination"
        />
        <span class="pagination-jumper">
          跳转至
          <el-input v-model="jumpPage" class="jumper-input" @keyup.enter="handleJump" />
          页
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    fetchOpenAccountFeishuConfig,
    fetchOpenAccountTable,
    saveOpenAccountFeishuConfig
  } from '@/api/config-management'
  import { AccountApiSource } from '../config/data-source'
  import { cloneOpenAccountMockList, agencyOptions, appOptions } from '../mock/data'
  import { PLATFORM_CONFIGS } from '../types'
  import type { OpenAccountItem } from '../types'

  defineOptions({ name: 'OpenAccountTab' })

  const props = defineProps<{ searchKeyword: string }>()

  const emit = defineEmits<{
    detail: [row: OpenAccountItem]
    assign: [row: OpenAccountItem]
    delete: [row: OpenAccountItem]
  }>()

  const sourceFilter = ref('')
  const statusFilter = ref('')
  const agencyFilter = ref('')
  const appFilter = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)
  const jumpPage = ref('')
  const selectedId = ref('')

  const list = ref<OpenAccountItem[]>([])
  const feishuEnabled = ref(true)

  const loadOpenAccountList = async () => {
    if (!AccountApiSource.openAccountTable) {
      try {
        const response = await fetchOpenAccountTable({ current: 1, size: 1000 })
        const rows = (response as any)?.records ?? (response as any)?.list ?? []
        if (Array.isArray(rows)) {
          list.value = rows
          return
        }
      } catch {
        // remote unavailable, fallback to mock
      }
    }
    list.value = cloneOpenAccountMockList()
  }

  const loadFeishuConfig = async () => {
    if (AccountApiSource.fetchOpenAccountFeishuConfig) return
    try {
      const response = await fetchOpenAccountFeishuConfig()
      feishuEnabled.value = !!(response as any)?.enabled
    } catch {
      // keep default
    }
  }

  onMounted(() => {
    loadOpenAccountList()
    loadFeishuConfig()
  })

  defineExpose({
    reloadList: loadOpenAccountList
  })

  const filteredList = computed(() =>
    list.value.filter((item) => {
      const kw = props.searchKeyword.toLowerCase()
      if (kw && !item.id.toLowerCase().includes(kw) && !item.app.toLowerCase().includes(kw)) return false
      if (sourceFilter.value && item.source !== sourceFilter.value) return false
      if (statusFilter.value && item.status !== statusFilter.value) return false
      if (agencyFilter.value && item.agency !== agencyFilter.value) return false
      if (appFilter.value && item.app !== appFilter.value) return false
      return true
    })
  )

  const total = computed(() => filteredList.value.length)
  const pagedList = computed(() => {
    const s = (currentPage.value - 1) * pageSize.value
    return filteredList.value.slice(s, s + pageSize.value)
  })

  const stats = computed(() => ({
    total: list.value.length,
    pending: list.value.filter((i) => i.status === '待分配').length,
    active:  list.value.filter((i) => i.status === '已激活').length,
    failed:  list.value.filter((i) => i.status === '开户失败').length
  }))

  const statusOptions = computed(() => [
    { label: '全部',    value: '',      type: 'default' },
    { label: '待分配',  value: '待分配', type: 'warn',  count: stats.value.pending },
    { label: '已激活',  value: '已激活', type: 'ok',    count: stats.value.active },
    { label: '开户失败',value: '开户失败',type: 'fail',  count: stats.value.failed }
  ])

  watch(
    () => [props.searchKeyword, sourceFilter.value, statusFilter.value, agencyFilter.value, appFilter.value],
    () => { currentPage.value = 1 }
  )

  function getPlatformColor(source: string) {
    return PLATFORM_CONFIGS.find((p) => p.value === source)?.color ?? '#94a3b8'
  }
  function getPlatformBg(source: string) {
    return PLATFORM_CONFIGS.find((p) => p.value === source)?.bg ?? 'rgb(148 163 184 / 12%)'
  }
  function getPlatformShort(source: string) {
    return PLATFORM_CONFIGS.find((p) => p.value === source)?.shortLabel ?? source[0]
  }

  function getStatusClass(status: string) {
    if (status === '已激活')  return 'status-badge--ok'
    if (status === '待分配')  return 'status-badge--pending'
    return 'status-badge--fail'
  }

  function getStatusIcon(status: string) {
    if (status === '已激活')  return '●'
    if (status === '开户失败') return '✕'
    return '✓'
  }

  function isHighlightAgency(agency: string) {
    return ['星达传媒', '天联广告'].includes(agency)
  }

  function getRowClass({ row }: { row: OpenAccountItem }) {
    return row.id === selectedId.value ? 'row--selected' : ''
  }

  const handleRowClick = (row: OpenAccountItem) => {
    selectedId.value = row.id
    emit('detail', row)
  }

  const handleJump = () => {
    const raw = parseInt(jumpPage.value, 10)
    jumpPage.value = ''
    if (Number.isNaN(raw) || raw < 1) return
    currentPage.value = Math.min(raw, Math.max(1, Math.ceil(total.value / pageSize.value)))
  }

  const handleOpenFeishuSetting = async () => {
    const nextEnabled = !feishuEnabled.value
    if (!AccountApiSource.saveOpenAccountFeishuConfig) {
      try {
        await saveOpenAccountFeishuConfig({ enabled: nextEnabled })
      } catch {
        ElMessage.error('保存飞书推送设置失败')
        return
      }
    }
    feishuEnabled.value = nextEnabled
    ElMessage.success(nextEnabled ? '飞书推送已开启' : '飞书推送已关闭')
  }
</script>

<style lang="scss" scoped>
  .open-account-tab {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  // ─── 筛选栏 ─────────────────────────────────────────
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 0;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--bg-card, #131c2e);
    border: 1px solid var(--border, rgb(255 255 255 / 7%));
    border-radius: 10px;
  }

  .filter-left {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 20px;
    align-items: center;
  }

  .filter-group {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .filter-label {
    flex-shrink: 0;
    font-size: 13px;
    color: #94a3b8;
  }

  .filter-select {
    width: 120px;

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 8%) !important;
      border-radius: 6px;
      box-shadow: none !important;
      &:focus-within { border-color: #3b82f6 !important; }
    }

    :deep(.el-input__inner),
    :deep(.el-select__placeholder) {
      font-size: 12px;
      color: #e2e8f0;
    }
  }

  // ─── 状态筛选切换 ────────────────────────────────────
  .status-tabs {
    display: flex;
    gap: 4px;
  }

  .status-tab {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 4px 10px;
    font-size: 12px;
    color: #94a3b8;
    cursor: pointer;
    background: transparent;
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 6px;
    transition: all 0.18s;

    &--active.status-tab--default { color: #e2e8f0; background: rgb(255 255 255 / 8%); border-color: rgb(255 255 255 / 15%); }
    &--active.status-tab--warn    { color: #f59e0b; background: rgb(245 158 11 / 12%); border-color: rgb(245 158 11 / 35%); }
    &--active.status-tab--ok      { color: #22c55e; background: rgb(34 197 94 / 12%); border-color: rgb(34 197 94 / 35%); }
    &--active.status-tab--fail    { color: #f87171; background: rgb(248 113 113 / 12%); border-color: rgb(248 113 113 / 35%); }

    &:not(.status-tab--active):hover { color: #e2e8f0; border-color: rgb(255 255 255 / 14%); }
  }

  .status-tab-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 16px;
    padding: 0 4px;
    font-size: 10px;
    font-weight: 700;
    border-radius: 8px;

    .status-tab--active.status-tab--warn  & { color: #f59e0b; background: rgb(245 158 11 / 20%); }
    .status-tab--active.status-tab--ok    & { color: #22c55e; background: rgb(34 197 94 / 20%); }
    .status-tab--active.status-tab--fail  & { color: #f87171; background: rgb(248 113 113 / 20%); }
    .status-tab:not(.status-tab--active) & { color: #94a3b8; background: rgb(255 255 255 / 8%); }
  }

  // ─── 飞书推送 ────────────────────────────────────────
  .feishu-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-shrink: 0;
  }

  .feishu-label {
    font-size: 13px;
    color: #64748b;
  }

  .feishu-status {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 13px;
    color: #22c55e;
  }

  .feishu-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;

    &--on { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
  }

  .feishu-setting-btn {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 4px 10px;
    font-size: 12px;
    color: #64748b;
    cursor: pointer;
    background: transparent;
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 6px;
    transition: all 0.18s;

    &:hover { color: #94a3b8; border-color: rgb(255 255 255 / 14%); }
  }

  // ─── 统计卡片 ────────────────────────────────────────
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 18px 20px;
    background: var(--bg-card, #131c2e);
    border: 1px solid var(--border, rgb(255 255 255 / 7%));
    border-radius: 10px;

    &--warn { background: rgb(245 158 11 / 6%); border-color: rgb(245 158 11 / 20%); }
    &--ok   { background: rgb(34 197 94 / 6%);  border-color: rgb(34 197 94 / 20%); }
    &--fail { background: rgb(248 113 113 / 6%); border-color: rgb(248 113 113 / 20%); }
  }

  .stat-label { font-size: 12px; color: #94a3b8; margin-bottom: 8px; }

  .stat-label-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
  }

  .stat-tag-warn {
    padding: 1px 6px;
    font-size: 11px;
    color: #f59e0b;
    background: rgb(245 158 11 / 15%);
    border-radius: 4px;
  }

  .stat-value {
    font-size: 30px;
    font-weight: 700;
    line-height: 1;

    &--total { color: #e2e8f0; }
    &--warn  { color: #f59e0b; }
    &--ok    { color: #22c55e; }
    &--fail  { color: #f87171; }
  }

  // ─── 表格 ────────────────────────────────────────────
  .table-wrapper {
    padding: 16px;
    background: var(--bg-card, #131c2e);
    border: 1px solid var(--border, rgb(255 255 255 / 7%));
    border-radius: 10px;
  }

  .open-account-table {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: transparent;
    --el-table-row-hover-bg-color: rgb(255 255 255 / 3%);
    --el-table-border-color: rgb(255 255 255 / 6%);
    --el-table-text-color: #e2e8f0;
    --el-table-header-text-color: #64748b;

    cursor: pointer;

    :deep(th.el-table__cell) {
      font-size: 12px;
      text-transform: uppercase;
      background: transparent;
    }

    :deep(td.el-table__cell) { font-size: 13px; }

    :deep(.el-table__inner-wrapper::before) { display: none; }

    :deep(.row--selected td.el-table__cell) {
      background: rgb(34 211 238 / 5%) !important;
      border-left: none;
    }

    :deep(.row--selected td.el-table__cell:first-child) {
      border-left: 3px solid #22d3ee !important;
    }
  }

  .apply-id {
    font-family: 'SF Mono', monospace;
    font-size: 13px;
    font-weight: 600;
  }

  .platform-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .platform-icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .platform-name {
    font-size: 13px;
    color: #e2e8f0;
  }

  .platform-badge {
    display: inline-block;
    padding: 2px 7px;
    font-size: 11px;
    border-radius: 4px;

    &--android { color: #94a3b8; background: rgb(148 163 184 / 12%); border: 1px solid rgb(148 163 184 / 20%); }
    &--ios     { color: #a78bfa; background: rgb(167 139 250 / 12%); border: 1px solid rgb(167 139 250 / 20%); }
  }

  .agency-name {
    font-size: 13px;
    color: #94a3b8;

    &--highlight { color: #22d3ee; }
  }

  .amount {
    font-weight: 500;
    color: #e2e8f0;
  }

  .reg-time {
    font-size: 12px;
    color: #64748b;
  }

  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;

    &--ok      { color: #22c55e; }
    &--pending { color: #f59e0b; }
    &--fail    { color: #f87171; }
  }

  .status-icon { font-size: 10px; }

  .action-btns {
    display: flex;
    gap: 6px;
    justify-content: center;
  }

  .action-btn {
    padding: 3px 8px;
    font-size: 12px;
    cursor: pointer;
    border: 1px solid transparent;
    border-radius: 4px;
    transition: all 0.18s;

    &--view   { color: #3b82f6; background: rgb(59 130 246 / 10%); border-color: rgb(59 130 246 / 20%); &:hover { background: rgb(59 130 246 / 20%); } }
    &--assign { color: #22d3ee; background: rgb(34 211 238 / 10%); border-color: rgb(34 211 238 / 20%); &:hover { background: rgb(34 211 238 / 20%); } }
    &--del    { color: #f87171; background: rgb(248 113 113 / 10%); border-color: rgb(248 113 113 / 20%); &:hover { background: rgb(248 113 113 / 20%); } }
  }

  // ─── 分页 ────────────────────────────────────────────
  .pagination-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    padding-top: 16px;
    margin-top: 4px;
    border-top: 1px solid rgb(255 255 255 / 7%);
  }

  .pagination-total { font-size: 13px; color: #94a3b8; }

  .oa-pagination {
    :deep(.el-pager li) {
      color: #94a3b8; background: transparent;
      &.is-active { color: #3b82f6; background: rgb(59 130 246 / 15%); border-radius: 4px; }
      &:hover:not(.is-active) { color: #e2e8f0; }
    }
    :deep(.btn-prev), :deep(.btn-next) { color: #94a3b8; background: transparent; &:hover { color: #e2e8f0; } &:disabled { opacity: 0.4; } }
  }

  .pagination-jumper {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    color: #94a3b8;
  }

  .jumper-input {
    width: 52px;
    :deep(.el-input__wrapper) { background: rgb(255 255 255 / 4%) !important; border: 1px solid rgb(255 255 255 / 7%) !important; border-radius: 5px; box-shadow: none !important; }
    :deep(.el-input__inner) { font-size: 12px; color: #e2e8f0; text-align: center; }
  }
</style>
