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
        max-height="630px"
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
        <el-table-column label="账户类型" min-width="90" align="left">
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
        <el-table-column label="账户余额" min-width="110" align="left">
          <template #default="{ row }">
            <span :class="['balance', { 'balance--low': row.status === '余额不足' }]">
              ${{ row.balance.toLocaleString('en-US') }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="本月消耗" min-width="110" align="left">
          <template #default="{ row }">
            <span class="spend">${{ row.monthSpend.toLocaleString('en-US') }}</span>
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
        <el-table-column label="操作" width="260" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-cell">
              <button
                type="button"
                class="action-btn action-btn--secondary"
                @click.stop="emit('detail', row)"
              >
                查看
              </button>
              <template v-if="row.status !== '已停用'">
                <span class="action-sep" aria-hidden="true">|</span>
                <button
                  type="button"
                  class="action-btn action-btn--secondary"
                  @click.stop="emit('recharge', row)"
                >
                  充值
                </button>
                <span class="action-sep" aria-hidden="true">|</span>
                <button
                  type="button"
                  class="action-btn action-btn--primary"
                  @click.stop="emit('edit', row)"
                >
                  编辑
                </button>
              </template>
              <template v-else>
                <span class="action-sep" aria-hidden="true">|</span>
                <button
                  type="button"
                  class="action-btn action-btn--secondary"
                  @click.stop="handleEnable(row)"
                >
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
    const ids = Array.isArray(appFilter.value)
      ? appFilter.value.map((id) => String(id ?? '').trim()).filter(Boolean)
      : String(appFilter.value ?? '')
          .trim()
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
    if (ids.length === 0) return true
    return ids.some((id) => {
      const hit = settingAppsForSelect.value.find((a) => String(a.sAppId ?? '').trim() === id)
      const name = hit ? String(hit.sAppName ?? '').trim() : ''
      if (name && item.apps.includes(name)) return true
      return item.apps.includes(id)
    })
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
  const appFilter = ref<string | string[]>([])
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
    --ad-border: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --ad-border-strong: color-mix(in srgb, var(--el-color-primary) 24%, transparent);
    --ad-surface: color-mix(in srgb, var(--default-box-color) 94%, transparent);
    --ad-surface-soft: color-mix(in srgb, var(--default-box-color) 84%, transparent);
    --ad-row-hover: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    --ad-header-bg: color-mix(in srgb, var(--default-box-color) 78%, black 4%);
    --accent: var(--el-color-primary);
    --accent-dim: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    --accent-glow: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
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
    border: 1px solid var(--ad-border);
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
      border: 1px solid var(--ad-border) !important;
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
    background: color-mix(in srgb, var(--default-box-color) 72%, transparent) !important;
    border: 1px solid var(--ad-border) !important;
    box-shadow: none !important;
    transition:
      border-color var(--duration-fast) var(--ease-out),
      background-color var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out);
  }

  :deep(.ad-account-app-select__trigger .app-platform-search-select__text) {
    font-size: 13px;
    color: var(--text-primary);
  }

  :deep(.ad-account-app-select__trigger .app-platform-search-select__suffix) {
    color: var(--text-secondary);
  }

  :deep(.ad-account-app-select__trigger:hover) {
    background: color-mix(in srgb, var(--el-color-primary) 9%, transparent) !important;
    border-color: color-mix(in srgb, var(--el-color-primary) 42%, transparent) !important;
  }

  :deep(.ad-account-app-select__trigger.is-open) {
    border-color: color-mix(in srgb, var(--el-color-primary) 55%, transparent) !important;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--el-color-primary) 18%, transparent) !important;
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
    border: 1px solid var(--ad-border);
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
      border-color: var(--ad-border-strong);
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
          var(--ad-surface) 0%,
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
        linear-gradient(165deg, var(--ad-surface-soft) 0%, var(--ad-surface) 100%);

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

    &--proxy {
      background:
        radial-gradient(
          ellipse 100% 80% at 10% 12%,
          color-mix(in srgb, var(--theme-color) 14%, transparent) 0%,
          transparent 56%
        ),
        linear-gradient(198deg, var(--ad-surface) 0%, var(--ad-surface-soft) 100%);

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

    &--new {
      background:
        radial-gradient(
          ellipse 95% 78% at 85% 15%,
          color-mix(in srgb, var(--art-warning) 14%, transparent) 0%,
          transparent 58%
        ),
        linear-gradient(175deg, var(--ad-surface-soft) 0%, var(--ad-surface) 100%);

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
    display: flex;
    gap: 6px;
    align-items: baseline;
    font-size: 26px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;

    &--total {
      color: var(--el-color-primary);
      text-shadow: 0 0 24px color-mix(in srgb, var(--el-color-primary) 22%, transparent);
    }

    &--active {
      color: var(--green);
      text-shadow: 0 0 20px color-mix(in srgb, var(--art-success) 18%, transparent);
    }

    &--proxy {
      color: var(--purple);
      text-shadow: 0 0 20px color-mix(in srgb, var(--theme-color) 16%, transparent);
    }

    &--new {
      color: var(--amber);
      text-shadow: 0 0 18px color-mix(in srgb, var(--art-warning) 14%, transparent);
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
    font-weight: 600;
    color: var(--amber);
    background: var(--amber-bg);
    border-radius: 6px;
  }

  // ─── 表格 ──────────────────────────────────────────────
  .table-wrapper {
    overflow: hidden;
    background: var(--ad-surface);
    border: 1px solid var(--ad-border);
    border-radius: 14px;
    box-shadow:
      0 8px 24px rgb(0 0 0 / 6%),
      inset 0 1px 0 color-mix(in srgb, white 5%, transparent);
  }

  .account-table {
    width: 100%;
    cursor: pointer;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: var(--ad-header-bg);
    --el-table-row-hover-bg-color: var(--ad-row-hover);
    --el-table-border-color: var(--ad-border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-border: 1px solid var(--ad-border);

    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 12px 10px;
      font-size: 12px;
      font-weight: 600;
      background: var(--ad-header-bg) !important;
      border-bottom: 1px solid var(--ad-border) !important;
    }

    :deep(td.el-table__cell) {
      padding: 10px;
      font-size: 13px;
      border-bottom: 1px solid var(--ad-border) !important;
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
    border-radius: 6px;

    &--direct {
      color: var(--el-color-primary);
      background: var(--accent-dim);
    }

    &--proxy {
      color: var(--purple);
      background: var(--purple-bg);
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
      background: color-mix(in srgb, var(--text-tertiary) 10%, transparent);
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

  .action-cell {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: center;
  }

  .action-btn {
    padding: 4px 6px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 6px;
    transition:
      color var(--duration-fast) var(--ease-out),
      background-color var(--duration-fast) var(--ease-out);

    &--primary {
      color: var(--el-color-primary);

      &:hover {
        background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
      }
    }

    &--secondary {
      color: var(--text-secondary);

      &:hover {
        color: var(--text-primary);
        background: color-mix(in srgb, var(--default-box-color) 70%, transparent);
      }
    }
  }

  .action-sep {
    flex-shrink: 0;
    padding: 0 1px;
    font-size: 12px;
    line-height: 1;
    color: color-mix(in srgb, var(--ad-border) 90%, transparent);
    user-select: none;
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
    border-top: 1px solid var(--ad-border);
  }

  .pagination-total {
    margin-right: auto;
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
      border: 1px solid var(--ad-border) !important;
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
      border: 1px solid var(--ad-border) !important;
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
