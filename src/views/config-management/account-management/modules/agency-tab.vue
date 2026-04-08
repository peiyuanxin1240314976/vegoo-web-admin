<template>
  <div class="agency-tab">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <!-- 广告平台 -->
      <div class="filter-group">
        <span class="filter-label">广告平台：</span>
        <el-select
          v-model="sourceFilter"
          placeholder="全部"
          class="filter-select filter-select--platform"
          clearable
          filterable
          :loading="sourceFilterLoading"
        >
          <el-option
            v-for="option in platformOptions"
            :key="option.value || 'all'"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>
      <!-- 合作模式 -->
      <div class="filter-group">
        <span class="filter-label">合作模式：</span>
        <el-select v-model="coopModeFilter" placeholder="全部" class="filter-select" clearable>
          <el-option
            v-for="m in coopModeOptions"
            :key="m.value || 'all'"
            :label="m.label"
            :value="m.value"
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
      <div class="stat-card">
        <div class="stat-label">代理商总数</div>
        <div class="stat-value stat-value--total">{{ stats.total }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已合作</div>
        <div class="stat-value stat-value--active">{{ stats.active }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">管理账户数</div>
        <div class="stat-value stat-value--accounts">{{ stats.managedAccounts }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">本月总消耗</div>
        <div class="stat-value stat-value--spend"
          >${{ stats.monthSpend.toLocaleString('en-US') }}</div
        >
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <el-table
        :data="pagedList"
        class="agency-table"
        table-layout="auto"
        :row-class-name="getRowClass"
        @row-click="handleRowClick"
      >
        <el-table-column type="index" label="序号" width="60" align="center">
          <template #default="{ $index }">
            <span class="row-index">{{ $index + 1 + (currentPage - 1) * pageSize }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="代理商ID" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="agency-id">{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="agencyName" label="代理商名称" min-width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="agency-name">{{ row.agencyName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="广告平台" min-width="120">
          <template #default="{ row }">
            <span class="platform-chip" :style="getPlatformStyle(row.source)">
              {{ row.source }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="合作模式" min-width="100" align="center">
          <template #default="{ row }">
            <span
              :class="[
                'coop-badge',
                row.coopMode === '授权代理' ? 'coop-badge--auth' : 'coop-badge--direct'
              ]"
            >
              {{ row.coopMode }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="管理账户数" min-width="100" align="center">
          <template #default="{ row }">
            <span class="account-count">{{ row.managedAccounts }}</span>
          </template>
        </el-table-column>
        <el-table-column label="本月消耗" min-width="120" align="right">
          <template #default="{ row }">
            <span class="spend-val">${{ row.monthSpend.toLocaleString('en-US') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="到期日期" min-width="110" align="center">
          <template #default="{ row }">
            <span
              :class="['expire-date', isExpiringSoon(row.expireDate) ? 'expire-date--warn' : '']"
            >
              {{ row.expireDate || '--' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="90" align="center">
          <template #default="{ row }">
            <span :class="['status-badge', getStatusClass(row.status)]">
              <span class="status-dot" />
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-btns">
              <button class="action-btn action-btn--view" @click.stop="emit('select', row)">
                查看
              </button>
              <button class="action-btn action-btn--edit" @click.stop="emit('edit', row)">
                编辑
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
          class="agency-pagination"
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
  import { storeToRefs } from 'pinia'
  import { fetchAgencyTable } from '@/api/config-management/account-management'
  import { getAppNowMs } from '@/utils/app-now'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import type { CockpitMetaOptionItem } from '@/types/cockpit-meta-filter'
  import { AccountApiSource } from '../config/data-source'
  import { cloneAgencyMockList } from '../mock/data'
  import { PLATFORM_CONFIGS } from '../types'
  import type { AgencyItem } from '../types'

  defineOptions({ name: 'AgencyTab' })

  const props = defineProps<{
    searchKeyword: string
    selectedId?: string
  }>()

  const emit = defineEmits<{
    select: [row: AgencyItem]
    edit: [row: AgencyItem]
    delete: [row: AgencyItem]
  }>()

  const coopModeOptions = [
    { label: '全部', value: '' },
    { label: '授权代理', value: '授权代理' },
    { label: '直接开户', value: '直接开户' }
  ]

  const statusOptions = [
    { label: '全部', value: '' },
    { label: '已合作', value: '已合作' },
    { label: '待开通', value: '洽谈中' },
    { label: '已到期', value: '已到期' },
    { label: '已终止', value: '已终止' }
  ]

  const cockpitMetaFilterStore = useCockpitMetaFilterStore()
  const { data: cockpitMeta } = storeToRefs(cockpitMetaFilterStore)
  const sourceFilterLoading = ref(false)
  const platformOptions = computed(() => {
    const metaSources = (cockpitMeta.value?.sourceOptions ?? []) as CockpitMetaOptionItem[]
    const mapped = metaSources
      .filter((opt) => opt.value !== 'all')
      .map((opt) => ({ label: opt.label, value: opt.value }))
    if (mapped.length > 0) return [{ label: '全部', value: '' }, ...mapped]
    return [
      { label: '全部', value: '' },
      ...PLATFORM_CONFIGS.map((item) => ({ label: item.shortLabel, value: item.value }))
    ]
  })

  const sourceFilter = ref('')
  const coopModeFilter = ref('')
  const statusFilter = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)
  const jumpPage = ref('')
  const innerSelectedId = ref('')

  const agencyList = ref<AgencyItem[]>([])

  const loadAgencyList = async () => {
    if (!AccountApiSource.agencyTable) {
      try {
        const response = await fetchAgencyTable({ current: 1, size: 1000 })
        const rows = (response as any)?.records ?? (response as any)?.list ?? []
        if (Array.isArray(rows)) {
          agencyList.value = rows
          autoSelectFirst()
          return
        }
      } catch {
        // remote unavailable, fallback to mock
      }
    }
    agencyList.value = cloneAgencyMockList()
    autoSelectFirst()
  }

  const autoSelectFirst = () => {
    if (!props.selectedId && agencyList.value.length > 0) {
      const first = agencyList.value[0]
      innerSelectedId.value = first.id
      emit('select', first)
    }
  }

  onMounted(async () => {
    sourceFilterLoading.value = true
    try {
      await cockpitMetaFilterStore.ensureLoaded()
    } finally {
      sourceFilterLoading.value = false
    }
    loadAgencyList()
  })

  const filteredList = computed(() => {
    return agencyList.value.filter((item) => {
      const kw = props.searchKeyword.toLowerCase()
      if (
        kw &&
        !item.id.toLowerCase().includes(kw) &&
        !item.agencyName.toLowerCase().includes(kw)
      ) {
        return false
      }
      if (!rowMatchesSourceFilter(item, sourceFilter.value)) return false
      if (coopModeFilter.value && item.coopMode !== coopModeFilter.value) return false
      if (statusFilter.value && item.status !== statusFilter.value) return false
      return true
    })
  })

  const total = computed(() => filteredList.value.length)

  const pagedList = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredList.value.slice(start, start + pageSize.value)
  })

  const stats = computed(() => ({
    total: agencyList.value.length,
    active: agencyList.value.filter((i) => i.status === '已合作').length,
    managedAccounts: agencyList.value.reduce((s, i) => s + i.managedAccounts, 0),
    monthSpend: agencyList.value.reduce((s, i) => s + i.monthSpend, 0)
  }))

  watch(
    () => [props.searchKeyword, sourceFilter.value, coopModeFilter.value, statusFilter.value],
    () => {
      currentPage.value = 1
    }
  )

  function getPlatformStyle(source: string) {
    const cfg = PLATFORM_CONFIGS.find((p) => p.value === source)
    if (!cfg) return {}
    return { color: cfg.color, background: cfg.bg }
  }

  function rowMatchesSourceFilter(row: AgencyItem, filterValue: string) {
    if (!filterValue) return true
    if (row.source === filterValue) return true
    const opts = cockpitMeta.value?.sourceOptions ?? []
    const byMeta = opts.find((o) => o.value === filterValue)
    if (byMeta) return row.source === byMeta.label
    return false
  }

  function getStatusClass(status: string) {
    if (status === '已合作') return 'status-badge--active'
    if (status === '洽谈中') return 'status-badge--pending'
    return 'status-badge--terminated'
  }

  function isExpiringSoon(date: string) {
    if (!date || date === '--') return false
    const d = new Date(date)
    const diff = (d.getTime() - getAppNowMs()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 30
  }

  function getRowClass({ row }: { row: AgencyItem }) {
    return row.id === (props.selectedId ?? innerSelectedId.value) ? 'row--selected' : ''
  }

  const handleRowClick = (row: AgencyItem) => {
    innerSelectedId.value = row.id
    emit('select', row)
  }

  const handleJump = () => {
    const raw = parseInt(jumpPage.value, 10)
    jumpPage.value = ''
    if (Number.isNaN(raw) || raw < 1) return
    const maxPage = Math.max(1, Math.ceil(total.value / pageSize.value))
    currentPage.value = Math.min(raw, maxPage)
  }

  // 从列表中移除已删除的代理商（供父组件调用）
  const removeFromList = (id: string) => {
    agencyList.value = agencyList.value.filter((i) => i.id !== id)
    if (innerSelectedId.value === id) innerSelectedId.value = ''
  }

  defineExpose({
    reloadList: loadAgencyList,
    removeFromList
  })
</script>

<style lang="scss" scoped>
  .agency-tab {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  // ─── 筛选栏 ─────────────────────────────────────────
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: center;
    padding: 14px 16px;
    background: linear-gradient(180deg, rgb(19 28 46 / 90%) 0%, rgb(19 28 46 / 75%) 100%);
    border: 1px solid var(--border, rgb(255 255 255 / 7%));
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
    color: var(--text-secondary, #94a3b8);
  }

  .filter-select {
    width: 140px;

    :deep(.el-select__wrapper) {
      min-height: 34px;
      color: var(--text-primary, #e2e8f0);
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border, rgb(255 255 255 / 7%)) !important;
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
      border-color: var(--accent, #3b82f6) !important;
      box-shadow: 0 0 0 2px rgb(59 130 246 / 22%) !important;
    }

    :deep(.el-select__placeholder),
    :deep(.el-select__selected-item) {
      font-size: 13px;
      color: var(--text-primary, #e2e8f0);
    }

    :deep(.el-select__caret) {
      color: var(--text-secondary, #94a3b8);
    }
  }

  .filter-select--platform {
    width: 150px;
  }

  :deep(.el-select-dropdown__item.is-selected) {
    font-weight: 600;
    color: var(--accent, #3b82f6);
  }

  :deep(.el-select-dropdown__item:hover) {
    background: rgb(59 130 246 / 12%);
  }

  // ─── 统计卡片 ────────────────────────────────────────
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 20px;
    background: var(--bg-card, #131c2e);
    border: 1px solid var(--border, rgb(255 255 255 / 7%));
    border-radius: 10px;
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-secondary, #94a3b8);
  }

  .stat-value {
    font-size: 26px;
    font-weight: 700;
    line-height: 1;

    &--total {
      color: #e2e8f0;
    }
    &--active {
      color: #22c55e;
    }
    &--accounts {
      color: #3b82f6;
    }
    &--spend {
      color: #f59e0b;
    }
  }

  // ─── 表格 ────────────────────────────────────────────
  .table-wrapper {
    padding: 16px;
    background: var(--bg-card, #131c2e);
    border: 1px solid var(--border, rgb(255 255 255 / 7%));
    border-radius: 10px;
  }

  .agency-table {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: transparent;
    --el-table-row-hover-bg-color: rgb(255 255 255 / 3%);
    --el-table-border-color: rgb(255 255 255 / 6%);
    --el-table-text-color: #e2e8f0;
    --el-table-header-text-color: #64748b;

    :deep(th.el-table__cell) {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      background: transparent;
    }

    :deep(td.el-table__cell) {
      font-size: 13px;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }

    :deep(.row--selected td.el-table__cell) {
      background: rgb(59 130 246 / 8%) !important;
    }

    cursor: pointer;
  }

  .row-index {
    font-size: 12px;
    color: var(--text-muted, #64748b);
  }

  .agency-id {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    color: var(--text-secondary, #94a3b8);
  }

  .agency-name {
    font-weight: 500;
    color: var(--text-primary, #e2e8f0);
  }

  .platform-chip {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
  }

  .coop-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 4px;

    &--auth {
      color: #818cf8;
      background: rgb(129 140 248 / 12%);
    }

    &--direct {
      color: #34d399;
      background: rgb(52 211 153 / 12%);
    }
  }

  .account-count {
    font-weight: 600;
    color: #3b82f6;
  }

  .spend-val {
    font-weight: 500;
    color: #f59e0b;
  }

  .expire-date {
    font-size: 12px;
    color: var(--text-secondary, #94a3b8);

    &--warn {
      color: #f59e0b;
    }
  }

  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 8px;
    font-size: 12px;
    border-radius: 20px;

    &--active {
      color: #22c55e;
      background: rgb(34 197 94 / 10%);

      .status-dot {
        background: #22c55e;
      }
    }

    &--pending {
      color: #f59e0b;
      background: rgb(245 158 11 / 10%);

      .status-dot {
        background: #f59e0b;
      }
    }

    &--terminated {
      color: #64748b;
      background: rgb(100 116 139 / 10%);

      .status-dot {
        background: #64748b;
      }
    }
  }

  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

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

    &--view {
      color: #3b82f6;
      background: rgb(59 130 246 / 10%);
      border-color: rgb(59 130 246 / 20%);

      &:hover {
        background: rgb(59 130 246 / 20%);
      }
    }

    &--edit {
      color: #34d399;
      background: rgb(52 211 153 / 10%);
      border-color: rgb(52 211 153 / 20%);

      &:hover {
        background: rgb(52 211 153 / 20%);
      }
    }

    &--del {
      color: #f87171;
      background: rgb(248 113 113 / 10%);
      border-color: rgb(248 113 113 / 20%);

      &:hover {
        background: rgb(248 113 113 / 20%);
      }
    }
  }

  // ─── 分页 ────────────────────────────────────────────
  .pagination-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    padding-top: 16px;
    margin-top: 4px;
    border-top: 1px solid var(--border, rgb(255 255 255 / 7%));
  }

  .pagination-total {
    font-size: 13px;
    color: var(--text-secondary, #94a3b8);
  }

  .agency-pagination {
    :deep(.el-pager li) {
      color: #94a3b8;
      background: transparent;

      &.is-active {
        color: #3b82f6;
        background: rgb(59 130 246 / 15%);
        border-radius: 4px;
      }

      &:hover:not(.is-active) {
        color: #e2e8f0;
      }
    }

    :deep(.btn-prev),
    :deep(.btn-next) {
      color: #94a3b8;
      background: transparent;

      &:hover {
        color: #e2e8f0;
      }
      &:disabled {
        opacity: 0.4;
      }
    }
  }

  .pagination-jumper {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    color: var(--text-secondary, #94a3b8);
  }

  .jumper-input {
    width: 52px;

    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border, rgb(255 255 255 / 7%)) !important;
      border-radius: 5px;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      font-size: 12px;
      color: var(--text-primary, #e2e8f0);
      text-align: center;
    }
  }
</style>
