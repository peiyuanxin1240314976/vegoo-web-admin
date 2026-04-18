<template>
  <div class="ad-account-tab">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <!-- 应用 -->
      <div class="filter-group">
        <span class="filter-label">应用：</span>
        <div class="filter-select filter-select--app">
          <AppPlatformSearchSelect
            v-model="appFilter"
            mode="app"
            input-class="ad-account-app-select__trigger"
            placeholder="全部"
            search-placeholder="搜索类别/应用名称/应用简称"
            all-label="全部应用"
            :setting-apps="settingAppsForSelect"
            :height="34"
            :width="190"
            :min-width="160"
            :max-width="220"
            radius="9999px"
            dropdown-class="ad-account-app-filter-popper"
            :show-platform-suffix="true"
          />
        </div>
      </div>
      <!-- 广告平台 -->
      <div class="filter-group">
        <span class="filter-label">广告平台：</span>
        <el-select
          v-model="sourceFilter"
          placeholder="全部"
          class="filter-select filter-select--platform"
          clearable
        >
          <el-option
            v-for="option in platformOptions"
            :key="option.value || 'all'"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>
      <!-- 账户类型 -->
      <div class="filter-group">
        <span class="filter-label">账户类型：</span>
        <el-select v-model="accountTypeFilter" placeholder="全部" class="filter-select" clearable>
          <el-option
            v-for="t in accountTypeOptions"
            :key="t.value || 'all'"
            :label="t.label"
            :value="t.value"
          />
        </el-select>
      </div>
      <!-- 状态 -->
      <div class="filter-group">
        <span class="filter-label">状态：</span>
        <el-select v-model="statusFilter" placeholder="全部" class="filter-select" clearable>
          <el-option
            v-for="s in statusOptions"
            :key="s.value || 'all'"
            :label="s.label"
            :value="s.value"
          />
        </el-select>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card stat-card--total">
        <div class="stat-label">广告账户总数</div>
        <div class="stat-value stat-value--total">{{ stats.total }}</div>
      </div>
      <div class="stat-card stat-card--active">
        <div class="stat-label">活跃账户</div>
        <div class="stat-value stat-value--active">
          {{ stats.active }}
          <span class="stat-arrow stat-arrow--up">↑</span>
        </div>
      </div>
      <div class="stat-card stat-card--proxy">
        <div class="stat-label">代投账户</div>
        <div class="stat-value stat-value--proxy">{{ stats.proxy }}</div>
      </div>
      <div class="stat-card stat-card--new">
        <div class="stat-label">本月新开</div>
        <div class="stat-value stat-value--new">
          {{ stats.newThisMonth }}
          <span class="stat-delta">+{{ stats.newThisMonthDelta }}</span>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <el-table
        :data="pagedList"
        class="account-table"
        table-layout="fixed"
        :row-class-name="getRowClassName"
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="账户ID" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="['acc-id', { 'acc-id--warning': row.status === '余额不足' }]">
              {{ row.id }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="accountName"
          label="账户名称"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column label="广告平台" min-width="120">
          <template #default="{ row }">
            <span class="platform-chip" :style="getPlatformStyle(row.source)">
              {{ row.source }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="agency" label="代理商" min-width="100" show-overflow-tooltip />
        <el-table-column label="账户类型" min-width="90" align="center">
          <template #default="{ row }">
            <span
              :class="[
                'type-badge',
                row.accountType === '直投' ? 'type-badge--direct' : 'type-badge--proxy'
              ]"
            >
              {{ row.accountType }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="账户余额" min-width="110" align="right">
          <template #default="{ row }">
            <span :class="['balance', { 'balance--low': row.status === '余额不足' }]">
              ${{ row.balance.toLocaleString('en-US') }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="本月消耗" min-width="110" align="right">
          <template #default="{ row }">
            <span class="spend">${{ row.monthSpend.toLocaleString('en-US') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <span :class="['status-badge', getStatusClass(row.status)]">
              <span class="status-dot" />
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-btns">
              <button class="action-btn action-btn--view" @click.stop="emit('detail', row)">
                查看
              </button>
              <template v-if="row.status !== '已停用'">
                <button class="action-btn action-btn--recharge" @click.stop="emit('recharge', row)">
                  充值
                </button>
                <button class="action-btn action-btn--edit" @click.stop="emit('edit', row)">
                  编辑
                </button>
              </template>
              <template v-else>
                <button class="action-btn action-btn--enable" @click.stop="handleEnable(row)">
                  启用
                </button>
              </template>
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
          class="account-pagination"
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
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import { enableAccount, fetchAccountTable } from '@/api/config-management/account-management'
  import { AccountApiSource } from '../config/data-source'
  import { cloneAccountMockList } from '../mock/data'
  import { PLATFORM_CONFIGS } from '../types'
  import type { AdAccountItem } from '../types'

  defineOptions({ name: 'AdAccountTab' })

  const props = defineProps<{
    searchKeyword: string
    selectedId?: string
  }>()

  const emit = defineEmits<{
    'new-account': []
    edit: [row: AdAccountItem]
    recharge: [row: AdAccountItem]
    disable: [row: AdAccountItem]
    detail: [row: AdAccountItem]
    select: [row: AdAccountItem]
  }>()

  const accountTypeOptions = [
    { label: '全部', value: '' },
    { label: '直投', value: '直投' },
    { label: '代投', value: '代投' }
  ]

  const statusOptions = [
    { label: '全部', value: '' },
    { label: '正常', value: '正常' },
    { label: '余额不足', value: '余额不足' },
    { label: '已停用', value: '已停用' }
  ]

  const cockpitMetaFilterStore = useCockpitMetaFilterStore()

  /** 与 AppPlatformSearchSelect 一致：来自 cockpit；无数据时列表为空（依赖 ensureLoaded） */
  const settingAppsForSelect = computed(() => cockpitMetaFilterStore.data?.settingApps ?? [])

  /** 表格行 `apps` 为应用名字符串；筛选值为 sAppId，需解析为名称再 includes */
  function rowMatchesAppFilter(item: AdAccountItem): boolean {
    const id = appFilter.value.trim()
    if (!id) return true
    const hit = settingAppsForSelect.value.find((a) => String(a.sAppId ?? '').trim() === id)
    const name = hit ? String(hit.sAppName ?? '').trim() : ''
    if (name && item.apps.includes(name)) return true
    if (item.apps.includes(id)) return true
    return false
  }

  const platformOptions = computed(() => {
    const source = cockpitMetaFilterStore.data?.sourceOptions
    if (source?.length) {
      return [{ label: '全部', value: '' }, ...source]
    }
    return [
      { label: '全部', value: '' },
      ...PLATFORM_CONFIGS.map((item) => ({
        label: item.label,
        value: item.value
      }))
    ]
  })

  const sourceFilter = ref('')
  const accountTypeFilter = ref('')
  const statusFilter = ref('')
  /** 选中的应用 sAppId；空字符串表示不限 */
  const appFilter = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)
  const jumpPage = ref('')

  const accountList = ref<AdAccountItem[]>([])

  const loadAccountList = async () => {
    if (!AccountApiSource.accountTable) {
      try {
        const response = await fetchAccountTable({ current: 1, size: 1000 })
        const rows = (response as any)?.records ?? (response as any)?.list ?? []
        if (Array.isArray(rows)) {
          accountList.value = rows
          autoSelectFirst()
          return
        }
      } catch {
        // remote unavailable, fallback to mock
      }
    }
    accountList.value = cloneAccountMockList()
    autoSelectFirst()
  }

  const autoSelectFirst = () => {
    const first = accountList.value[0]
    if (first && !props.selectedId) {
      emit('select', first)
    }
  }

  onMounted(() => {
    if (!cockpitMetaFilterStore.data) {
      cockpitMetaFilterStore.ensureLoaded()
    }
    loadAccountList()
  })

  defineExpose({
    reloadList: loadAccountList
  })

  const filteredList = computed(() => {
    return accountList.value.filter((item) => {
      const kw = props.searchKeyword.toLowerCase()
      if (
        kw &&
        !item.id.toLowerCase().includes(kw) &&
        !item.accountName.toLowerCase().includes(kw)
      ) {
        return false
      }
      if (sourceFilter.value && item.source !== sourceFilter.value) return false
      if (accountTypeFilter.value && item.accountType !== accountTypeFilter.value) return false
      if (statusFilter.value && item.status !== statusFilter.value) return false
      if (!rowMatchesAppFilter(item)) return false
      return true
    })
  })

  const total = computed(() => filteredList.value.length)

  const pagedList = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredList.value.slice(start, start + pageSize.value)
  })

  const stats = computed(() => ({
    total: accountList.value.length,
    active: accountList.value.filter((i) => i.status === '正常').length,
    proxy: accountList.value.filter((i) => i.accountType === '代投').length,
    newThisMonth: 12,
    newThisMonthDelta: 3
  }))

  watch(
    () => [
      props.searchKeyword,
      sourceFilter.value,
      accountTypeFilter.value,
      statusFilter.value,
      appFilter.value
    ],
    () => {
      currentPage.value = 1
    }
  )

  function getPlatformStyle(source: string) {
    const cfg = PLATFORM_CONFIGS.find((p) => p.value === source)
    if (!cfg) return {}
    return { color: cfg.color, background: cfg.bg }
  }

  function getStatusClass(status: string) {
    if (status === '正常') return 'status-badge--normal'
    if (status === '余额不足') return 'status-badge--warning'
    return 'status-badge--disabled'
  }

  function getRowClassName({ row }: { row: AdAccountItem }) {
    return row.id === props.selectedId ? 'row-selected' : ''
  }

  const handleRowClick = (row: AdAccountItem) => {
    emit('select', row)
    emit('detail', row)
  }

  const handleJump = () => {
    const raw = parseInt(jumpPage.value, 10)
    jumpPage.value = ''
    if (Number.isNaN(raw) || raw < 1) return
    const maxPage = Math.max(1, Math.ceil(total.value / pageSize.value))
    currentPage.value = Math.min(raw, maxPage)
  }

  const handleEnable = async (row: AdAccountItem) => {
    if (!AccountApiSource.enableAccount) {
      try {
        await enableAccount(row.id)
      } catch {
        // mock fallback
      }
    }
    const idx = accountList.value.findIndex((i) => i.id === row.id)
    if (idx >= 0) accountList.value[idx].status = '正常'
    ElMessage.success('账户已启用')
  }
</script>

<style lang="scss" scoped>
  .ad-account-tab {
    --bg-card: #131c2e;
    --bg-row-hover: #162035;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #3b82f6;
    --accent-dim: rgb(59 130 246 / 12%);
    --green: #22c55e;
    --green-bg: rgb(34 197 94 / 12%);
    --amber: #f59e0b;
    --amber-bg: rgb(245 158 11 / 12%);
    --red: #ef4444;
    --red-bg: rgb(239 68 68 / 12%);
  }

  // ─── 筛选栏 ────────────────────────────────────────────
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: center;
    padding: 14px 16px;
    margin-bottom: 16px;
    background: linear-gradient(180deg, rgb(19 28 46 / 90%) 0%, rgb(19 28 46 / 75%) 100%);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 8px 20px rgb(0 0 0 / 18%);
  }

  .filter-group {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .filter-label {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .filter-select {
    width: 140px;

    :deep(.el-select__wrapper) {
      min-height: 34px;
      color: var(--text-primary);
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      border-radius: 9999px;
      box-shadow: none !important;
      transition:
        border-color var(--duration-fast, 150ms) var(--ease-default, ease),
        background-color var(--duration-fast, 150ms) var(--ease-default, ease),
        box-shadow var(--duration-fast, 150ms) var(--ease-default, ease);
    }

    :deep(.el-select__wrapper:hover) {
      background: rgb(59 130 246 / 10%) !important;
      border-color: rgb(59 130 246 / 55%) !important;
    }

    :deep(.el-select__wrapper.is-focused) {
      border-color: var(--accent) !important;
      box-shadow: 0 0 0 2px rgb(59 130 246 / 22%) !important;
    }

    :deep(.el-select__placeholder),
    :deep(.el-select__selected-item) {
      font-size: 13px;
      color: var(--text-primary);
    }

    :deep(.el-select__caret) {
      color: var(--text-secondary);
    }
  }

  .filter-select--platform {
    width: 150px;
  }

  .filter-select--app {
    display: inline-flex;
    width: 190px;
  }

  :deep(.ad-account-app-select__trigger.app-platform-search-select) {
    box-sizing: border-box;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 12px !important;
    font-size: 13px !important;
    color: var(--text-primary);
    background: rgb(255 255 255 / 4%) !important;
    border: 1px solid var(--border) !important;
    box-shadow: none !important;
    transition:
      border-color var(--duration-fast, 150ms) var(--ease-default, ease),
      background-color var(--duration-fast, 150ms) var(--ease-default, ease),
      box-shadow var(--duration-fast, 150ms) var(--ease-default, ease);
  }

  :deep(.ad-account-app-select__trigger .app-platform-search-select__text) {
    font-size: 13px;
    color: var(--text-primary);
  }

  :deep(.ad-account-app-select__trigger .app-platform-search-select__suffix) {
    color: var(--text-secondary);
  }

  :deep(.ad-account-app-select__trigger:hover) {
    background: rgb(59 130 246 / 10%) !important;
    border-color: rgb(59 130 246 / 55%) !important;
  }

  :deep(.ad-account-app-select__trigger.is-open) {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 2px rgb(59 130 246 / 22%) !important;
  }

  :deep(.el-select-dropdown__item.is-selected) {
    font-weight: 600;
    color: var(--accent);
  }

  :deep(.el-select-dropdown__item:hover) {
    background: rgb(59 130 246 / 12%);
  }

  // ─── 统计卡片 ───────────────────────────────────────────
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .stat-card {
    position: relative;
    padding: 18px 20px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 3px;
      height: 100%;
      content: '';
    }

    &--total::before {
      background: var(--accent);
    }

    &--active::before {
      background: var(--green);
    }

    &--proxy::before {
      background: #a78bfa;
    }

    &--new::before {
      background: var(--amber);
    }
  }

  .stat-label {
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .stat-value {
    display: flex;
    gap: 6px;
    align-items: baseline;
    font-size: 28px;
    font-weight: 700;

    &--total {
      color: var(--accent);
    }

    &--active {
      color: var(--green);
    }

    &--proxy {
      color: #a78bfa;
    }

    &--new {
      color: var(--amber);
    }
  }

  .stat-arrow {
    font-size: 16px;

    &--up {
      color: var(--green);
    }
  }

  .stat-delta {
    padding: 2px 6px;
    font-size: 12px;
    font-weight: 500;
    color: var(--amber);
    background: var(--amber-bg);
    border-radius: 4px;
  }

  // ─── 表格 ──────────────────────────────────────────────
  .table-wrapper {
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .account-table {
    width: 100%;
    cursor: pointer;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: #0f1829;
    --el-table-row-hover-bg-color: var(--bg-row-hover);
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-border: 1px solid var(--border);

    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 12px 8px;
      font-size: 12px;
      font-weight: 500;
      background: #0f1829 !important;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(td.el-table__cell) {
      padding: 10px 8px;
      font-size: 13px;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(tr) {
      background: transparent !important;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }

    :deep(tr.row-selected td.el-table__cell) {
      background: var(--accent-dim) !important;
      border-bottom-color: rgb(59 130 246 / 20%) !important;
    }
  }

  .acc-id {
    font-weight: 500;
    color: var(--text-primary);

    &--warning {
      color: var(--amber);
    }
  }

  .platform-chip {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 5px;
  }

  .type-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 4px;

    &--direct {
      color: var(--accent);
      background: var(--accent-dim);
    }

    &--proxy {
      color: #a78bfa;
      background: rgb(167 139 250 / 12%);
    }
  }

  .balance {
    font-weight: 500;
    color: var(--text-primary);

    &--low {
      color: var(--amber);
    }
  }

  .spend {
    color: var(--text-secondary);
  }

  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 8px;
    font-size: 12px;
    border-radius: 5px;

    &--normal {
      color: var(--green);
      background: var(--green-bg);
    }

    &--warning {
      color: var(--amber);
      background: var(--amber-bg);
    }

    &--disabled {
      color: var(--text-muted);
      background: rgb(255 255 255 / 5%);
    }
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;

    .status-badge--normal & {
      background: var(--green);
    }

    .status-badge--warning & {
      background: var(--amber);
    }

    .status-badge--disabled & {
      background: var(--text-muted);
    }
  }

  .action-btns {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
  }

  .action-btn {
    padding: 3px 8px;
    font-size: 12px;
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 4px;
    transition: all 0.15s;

    &--view {
      color: var(--text-secondary);

      &:hover {
        color: var(--accent);
        background: var(--accent-dim);
      }
    }

    &--recharge {
      color: var(--green);

      &:hover {
        background: var(--green-bg);
      }
    }

    &--edit {
      color: var(--accent);

      &:hover {
        background: var(--accent-dim);
      }
    }

    &--enable {
      color: var(--amber);

      &:hover {
        background: var(--amber-bg);
      }
    }
  }

  // ─── 分页 ──────────────────────────────────────────────
  .pagination-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    padding: 12px 16px;
    border-top: 1px solid var(--border);
  }

  .pagination-total {
    font-size: 13px;
    color: var(--text-muted);
  }

  .account-pagination {
    :deep(.el-pager li) {
      min-width: 28px;
      height: 28px;
      font-size: 13px;
      line-height: 28px;
      color: var(--text-secondary);
      background: transparent;
      border-radius: 5px;

      &:hover {
        color: var(--accent);
      }

      &.is-active {
        font-weight: 700;
        color: #fff;
        background: var(--accent);
      }
    }

    :deep(.btn-prev),
    :deep(.btn-next) {
      color: var(--text-secondary) !important;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      border-radius: 5px;

      &:hover {
        color: var(--accent) !important;
        border-color: var(--accent) !important;
      }
    }
  }

  .pagination-jumper {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    color: var(--text-muted);
  }

  .jumper-input {
    width: 48px;

    :deep(.el-input__wrapper) {
      height: 28px;
      padding: 0 6px;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: var(--text-primary);
      text-align: center;
    }
  }
</style>
