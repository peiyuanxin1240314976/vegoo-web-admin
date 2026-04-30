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
      <div class="stat-card stat-card--total">
        <div class="stat-label">代理商总数</div>
        <div class="stat-value stat-value--total">{{ stats.total }}</div>
      </div>
      <div class="stat-card stat-card--active">
        <div class="stat-label">已合作</div>
        <div class="stat-value stat-value--active">{{ stats.active }}</div>
      </div>
      <div class="stat-card stat-card--managed">
        <div class="stat-label">管理账户数</div>
        <div class="stat-value stat-value--managed">{{ stats.managedAccounts }}</div>
      </div>
      <div class="stat-card stat-card--spend">
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
        max-height="630px"
        table-layout="fixed"
        :row-class-name="getRowClass"
        @row-click="handleRowClick"
      >
        <el-table-column
          prop="id"
          label="代理商ID"
          min-width="100"
          align="left"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="agency-id">{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="agencyName"
          label="代理商名称"
          min-width="100"
          align="left"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="agency-name">{{ row.agencyName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="广告平台" min-width="100" align="left">
          <template #default="{ row }">
            <span class="platform-chip" :style="getPlatformStyle(row.source)">
              {{ row.source }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="合作模式" min-width="100" align="left">
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
        <el-table-column label="管理账户数" min-width="100" align="left">
          <template #default="{ row }">
            <span class="account-count">{{ row.managedAccounts }}</span>
          </template>
        </el-table-column>
        <el-table-column label="本月消耗" min-width="100" align="left">
          <template #default="{ row }">
            <span class="spend-val">${{ row.monthSpend.toLocaleString('en-US') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="到期日期" min-width="100" align="left">
          <template #default="{ row }">
            <span
              :class="['expire-date', isExpiringSoon(row.expireDate) ? 'expire-date--warn' : '']"
            >
              {{ row.expireDate || '--' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" align="left">
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
    return row.id === (props.selectedId ?? innerSelectedId.value) ? 'row-selected' : ''
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
    --ag-border: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --ag-border-strong: color-mix(in srgb, var(--el-color-primary) 24%, transparent);
    --ag-surface: color-mix(in srgb, var(--default-box-color) 94%, transparent);
    --ag-surface-soft: color-mix(in srgb, var(--default-box-color) 84%, transparent);
    --ag-row-hover: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    --ag-header-bg: color-mix(in srgb, var(--default-box-color) 78%, black 4%);
    --accent-dim: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    --text-primary: var(--text-primary);
    --text-secondary: var(--text-secondary);
    --text-muted: var(--text-tertiary);
    --green: var(--art-success);
    --green-bg: color-mix(in srgb, var(--art-success) 14%, transparent);
    --amber: var(--art-warning);
    --amber-bg: color-mix(in srgb, var(--art-warning) 14%, transparent);
    --red: var(--art-danger);
    --red-bg: color-mix(in srgb, var(--art-danger) 12%, transparent);
    --purple: color-mix(in srgb, var(--theme-color) 42%, var(--el-color-primary) 58%);
    --purple-bg: color-mix(in srgb, var(--theme-color) 14%, transparent);

    display: flex;
    flex-direction: column;
    gap: 0;
  }

  // ─── 筛选栏 ────────────────────────────────────────────
  .filter-bar {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: center;
    padding: 16px 18px;
    margin-bottom: 16px;
    overflow: hidden;
    background:
      radial-gradient(
        ellipse 90% 70% at 12% 0%,
        color-mix(in srgb, var(--el-color-primary) 12%, transparent) 0%,
        transparent 58%
      ),
      linear-gradient(
        165deg,
        color-mix(in srgb, var(--default-box-color) 96%, transparent) 0%,
        color-mix(in srgb, var(--default-box-color) 88%, transparent) 100%
      );
    isolation: isolate;
    border: 1px solid var(--ag-border);
    border-radius: 16px;
    box-shadow:
      0 12px 32px rgb(0 0 0 / 8%),
      inset 0 1px 0 color-mix(in srgb, white 7%, transparent);
  }

  .filter-bar::after {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 2px;
    pointer-events: none;
    content: '';
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--el-color-primary) 40%, transparent) 42%,
      color-mix(in srgb, var(--theme-color) 32%, transparent) 58%,
      transparent 100%
    );
    opacity: 0.85;
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
      background: color-mix(in srgb, var(--default-box-color) 72%, transparent) !important;
      border: 1px solid var(--ag-border) !important;
      border-radius: 9999px;
      box-shadow: none !important;
      transition:
        border-color var(--duration-fast) var(--ease-out),
        background-color var(--duration-fast) var(--ease-out),
        box-shadow var(--duration-fast) var(--ease-out);
    }

    :deep(.el-select__wrapper:hover) {
      background: color-mix(in srgb, var(--el-color-primary) 9%, transparent) !important;
      border-color: color-mix(in srgb, var(--el-color-primary) 42%, transparent) !important;
    }

    :deep(.el-select__wrapper.is-focused) {
      border-color: color-mix(in srgb, var(--el-color-primary) 55%, transparent) !important;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--el-color-primary) 18%, transparent) !important;
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

  :deep(.el-select-dropdown__item.is-selected) {
    font-weight: 600;
    color: var(--el-color-primary);
  }

  :deep(.el-select-dropdown__item:hover) {
    background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
  }

  // ─── 统计卡片 ───────────────────────────────────────────
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .stat-card {
    position: relative;
    padding: 16px 18px;
    overflow: hidden;
    isolation: isolate;
    border: 1px solid var(--ag-border);
    border-radius: 14px;
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 5%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 6%, transparent);
    transition:
      border-color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 3px;
      height: 100%;
      content: '';
    }

    &::after {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      height: 1px;
      pointer-events: none;
      content: '';
      opacity: 0.65;
    }

    &:hover {
      border-color: var(--ag-border-strong);
      box-shadow:
        0 10px 24px rgb(0 0 0 / 8%),
        0 0 0 1px color-mix(in srgb, var(--el-color-primary) 8%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 8%, transparent);
      transform: translateY(-1px);
    }

    &--total {
      background:
        radial-gradient(
          ellipse 110% 85% at 92% 8%,
          color-mix(in srgb, var(--el-color-primary) 20%, transparent) 0%,
          transparent 58%
        ),
        linear-gradient(
          155deg,
          var(--ag-surface) 0%,
          color-mix(in srgb, var(--default-bg-color) 35%, transparent) 100%
        );

      &::before {
        background: var(--el-color-primary);
      }

      &::after {
        background: linear-gradient(
          90deg,
          transparent,
          color-mix(in srgb, var(--el-color-primary) 35%, transparent),
          transparent
        );
      }
    }

    &--active {
      background:
        radial-gradient(
          ellipse 100% 80% at 88% 0%,
          color-mix(in srgb, var(--art-success) 16%, transparent) 0%,
          transparent 55%
        ),
        linear-gradient(165deg, var(--ag-surface-soft) 0%, var(--ag-surface) 100%);

      &::before {
        background: var(--green);
      }

      &::after {
        background: linear-gradient(
          90deg,
          transparent,
          color-mix(in srgb, var(--art-success) 30%, transparent),
          transparent
        );
      }
    }

    &--managed {
      background:
        radial-gradient(
          ellipse 100% 80% at 10% 12%,
          color-mix(in srgb, var(--theme-color) 14%, transparent) 0%,
          transparent 56%
        ),
        linear-gradient(198deg, var(--ag-surface) 0%, var(--ag-surface-soft) 100%);

      &::before {
        background: var(--purple);
      }

      &::after {
        background: linear-gradient(
          90deg,
          transparent,
          color-mix(in srgb, var(--theme-color) 28%, transparent),
          transparent
        );
      }
    }

    &--spend {
      background:
        radial-gradient(
          ellipse 95% 78% at 85% 15%,
          color-mix(in srgb, var(--art-warning) 14%, transparent) 0%,
          transparent 58%
        ),
        linear-gradient(175deg, var(--ag-surface-soft) 0%, var(--ag-surface) 100%);

      &::before {
        background: var(--amber);
      }

      &::after {
        background: linear-gradient(
          90deg,
          transparent,
          color-mix(in srgb, var(--art-warning) 32%, transparent),
          transparent
        );
      }
    }
  }

  .stat-label {
    position: relative;
    z-index: 1;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.02em;
  }

  .stat-value {
    position: relative;
    z-index: 1;
    font-size: 26px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    letter-spacing: -0.02em;

    &--total {
      color: var(--el-color-primary);
      text-shadow: 0 0 24px color-mix(in srgb, var(--el-color-primary) 22%, transparent);
    }

    &--active {
      color: var(--green);
      text-shadow: 0 0 20px color-mix(in srgb, var(--art-success) 18%, transparent);
    }

    &--managed {
      color: var(--purple);
      text-shadow: 0 0 20px color-mix(in srgb, var(--theme-color) 16%, transparent);
    }

    &--spend {
      color: var(--amber);
      text-shadow: 0 0 18px color-mix(in srgb, var(--art-warning) 14%, transparent);
    }
  }

  // ─── 表格 ──────────────────────────────────────────────
  .table-wrapper {
    overflow: hidden;
    background: var(--ag-surface);
    border: 1px solid var(--ag-border);
    border-radius: 14px;
    box-shadow:
      0 8px 24px rgb(0 0 0 / 6%),
      inset 0 1px 0 color-mix(in srgb, white 5%, transparent);
  }

  .agency-table {
    width: 100%;
    cursor: pointer;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: var(--ag-header-bg);
    --el-table-row-hover-bg-color: var(--ag-row-hover);
    --el-table-border-color: var(--ag-border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-border: 1px solid var(--ag-border);

    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 12px 10px;
      font-size: 12px;
      font-weight: 600;
      background: var(--ag-header-bg) !important;
      border-bottom: 1px solid var(--ag-border) !important;
    }

    :deep(td.el-table__cell) {
      padding: 10px;
      font-size: 13px;
      border-bottom: 1px solid var(--ag-border) !important;
    }

    :deep(tr) {
      background: transparent !important;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }

    :deep(tr.row-selected td.el-table__cell) {
      background: color-mix(in srgb, var(--el-color-primary) 11%, transparent) !important;
      border-bottom-color: color-mix(in srgb, var(--el-color-primary) 18%, transparent) !important;
    }
  }

  .row-index {
    font-size: 12px;
    color: var(--text-muted);
  }

  .agency-id {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .agency-name {
    font-weight: 500;
    color: var(--text-primary);
  }

  .platform-chip {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 5px;
  }

  .coop-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 6px;

    &--auth {
      color: var(--purple);
      background: var(--purple-bg);
    }

    &--direct {
      color: var(--green);
      background: var(--green-bg);
    }
  }

  .account-count {
    font-weight: 600;
    color: var(--el-color-primary);
  }

  .spend-val {
    font-weight: 500;
    color: var(--amber);
  }

  .expire-date {
    font-size: 12px;
    color: var(--text-secondary);

    &--warn {
      color: var(--amber);
    }
  }

  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 8px;
    font-size: 12px;
    border-radius: 5px;

    &--active {
      color: var(--green);
      background: var(--green-bg);
    }

    &--pending {
      color: var(--amber);
      background: var(--amber-bg);
    }

    &--terminated {
      color: var(--text-muted);
      background: color-mix(in srgb, var(--text-tertiary) 10%, transparent);
    }
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;

    .status-badge--active & {
      background: var(--green);
    }

    .status-badge--pending & {
      background: var(--amber);
    }

    .status-badge--terminated & {
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
    padding: 4px 9px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 6px;
    transition:
      color var(--duration-fast) var(--ease-out),
      background-color var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);

    &--view {
      color: var(--text-secondary);

      &:hover {
        color: var(--el-color-primary);
        background: var(--accent-dim);
        transform: translateY(-0.5px);
      }
    }

    &--edit {
      color: var(--el-color-primary);

      &:hover {
        background: var(--accent-dim);
        transform: translateY(-0.5px);
      }
    }

    &--del {
      color: var(--red);

      &:hover {
        background: var(--red-bg);
        transform: translateY(-0.5px);
      }
    }
  }

  // ─── 分页 ──────────────────────────────────────────────
  .pagination-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    justify-content: flex-end;
    padding: 12px 16px;
    background: color-mix(in srgb, var(--default-box-color) 88%, transparent);
    border-top: 1px solid var(--ag-border);
  }

  .pagination-total {
    margin-right: auto;
    font-size: 13px;
    color: var(--text-muted);
  }

  .agency-pagination {
    :deep(.el-pager li) {
      min-width: 28px;
      height: 28px;
      font-size: 13px;
      line-height: 28px;
      color: var(--text-secondary);
      background: transparent;
      border-radius: 6px;
      transition:
        color var(--duration-fast) var(--ease-out),
        background-color var(--duration-fast) var(--ease-out);

      &:hover {
        color: var(--el-color-primary);
      }

      &.is-active {
        font-weight: 700;
        color: var(--el-color-white);
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--el-color-primary) 94%, black 6%),
          color-mix(in srgb, var(--el-color-primary) 82%, black 18%)
        );
        box-shadow: 0 4px 12px color-mix(in srgb, var(--el-color-primary) 28%, transparent);
      }
    }

    :deep(.btn-prev),
    :deep(.btn-next) {
      color: var(--text-secondary) !important;
      background: color-mix(in srgb, var(--default-box-color) 65%, transparent) !important;
      border: 1px solid var(--ag-border) !important;
      border-radius: 6px;
      transition:
        color var(--duration-fast) var(--ease-out),
        border-color var(--duration-fast) var(--ease-out),
        background-color var(--duration-fast) var(--ease-out);

      &:hover {
        color: var(--el-color-primary) !important;
        border-color: color-mix(in srgb, var(--el-color-primary) 45%, transparent) !important;
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
    width: 52px;

    :deep(.el-input__wrapper) {
      height: 28px;
      padding: 0 6px;
      background: color-mix(in srgb, var(--default-box-color) 72%, transparent) !important;
      border: 1px solid var(--ag-border) !important;
      border-radius: 6px;
      box-shadow: none !important;
      transition:
        border-color var(--duration-fast) var(--ease-out),
        box-shadow var(--duration-fast) var(--ease-out);
    }

    :deep(.el-input__wrapper:hover),
    :deep(.el-input__wrapper.is-focus) {
      border-color: color-mix(in srgb, var(--el-color-primary) 45%, transparent) !important;
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--el-color-primary) 14%, transparent) !important;
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: var(--text-primary);
      text-align: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .stat-card:hover {
      transform: none;
    }

    .action-btn:hover {
      transform: none;
    }
  }

  @media (width <= 1200px) {
    .stat-cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width <= 560px) {
    .stat-cards {
      grid-template-columns: 1fr;
    }

    .pagination-bar {
      justify-content: center;
    }

    .pagination-total {
      flex: 1 1 100%;
      margin-right: 0;
      text-align: center;
    }
  }
</style>
