<template>
  <div class="credential-tab">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-row">
        <!-- 广告平台 -->
        <div class="filter-group">
          <span class="filter-label">广告平台：</span>
          <div class="toggle-tabs">
            <button
              :class="['toggle-tab', { 'toggle-tab--active': sourceFilter === '' }]"
              @click="sourceFilter = ''"
            >
              全部
            </button>
            <button
              v-for="p in platformShortList"
              :key="p.value"
              :class="['toggle-tab', { 'toggle-tab--active': sourceFilter === p.value }]"
              @click="sourceFilter = p.value"
            >
              {{ p.shortLabel }}
            </button>
          </div>
        </div>
        <!-- 上次全量验证 + 立即验证全部 -->
        <div class="validate-all-bar">
          <span class="last-validate-tip">上次全量验证：<span class="last-validate-time">2026-03-13 08:00</span></span>
          <button class="btn-validate-all" @click="handleValidateAll">立即验证全部</button>
        </div>
      </div>
      <div class="filter-row">
        <!-- 凭据类型 -->
        <div class="filter-group">
          <span class="filter-label">凭据类型：</span>
          <div class="toggle-tabs">
            <button
              v-for="t in credTypeOptions"
              :key="t.value"
              :class="['toggle-tab', { 'toggle-tab--active': credTypeFilter === t.value }]"
              @click="credTypeFilter = t.value"
            >
              {{ t.label }}
            </button>
          </div>
        </div>
        <!-- 验证状态 -->
        <div class="filter-group">
          <span class="filter-label">验证状态：</span>
          <div class="toggle-tabs">
            <button
              v-for="s in statusOptions"
              :key="s.value"
              :class="['toggle-tab', { 'toggle-tab--active': statusFilter === s.value }]"
              @click="statusFilter = s.value"
            >
              {{ s.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card stat-card--total">
        <div class="stat-label">凭据总数</div>
        <div class="stat-value stat-value--total">{{ stats.total }}</div>
      </div>
      <div class="stat-card stat-card--ok">
        <div class="stat-label">验证正常</div>
        <div class="stat-value-row">
          <span class="stat-value stat-value--ok">{{ stats.ok }}</span>
          <span class="stat-rate">{{ stats.okRate }}%</span>
        </div>
      </div>
      <div class="stat-card stat-card--fail">
        <div class="stat-label">验证失败</div>
        <div class="stat-value-row">
          <span class="stat-value stat-value--fail">{{ stats.fail }}</span>
          <span class="stat-tag-fail">需更新</span>
        </div>
      </div>
      <div class="stat-card stat-card--pending">
        <div class="stat-label">待验证</div>
        <div class="stat-value stat-value--pending">{{ stats.pending }}</div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <el-table
        :data="pagedList"
        class="credential-table"
        table-layout="auto"
        :row-class-name="getRowClass"
        @row-click="handleRowClick"
      >
        <el-table-column prop="name" label="凭据名称" min-width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cred-name-cell">
              <span v-if="row.id === selectedId" class="selected-chip">SELECTED</span>
              <span class="cred-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="广告平台" min-width="130">
          <template #default="{ row }">
            <div class="platform-cell">
              <span class="platform-icon" :style="{ color: getPlatformColor(row.source) }">
                {{ getPlatformShort(row.source) }}
              </span>
              <span class="platform-name">{{ row.source }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="group" label="分组" min-width="80" />
        <el-table-column prop="credentialType" label="凭据类型" min-width="110" />
        <el-table-column label="关联应用" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="apps-text">{{ row.apps.join('，') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="关联账户数" min-width="90" align="center">
          <template #default="{ row }">
            <span class="account-count">{{ row.accountCount }}个</span>
          </template>
        </el-table-column>
        <el-table-column label="验证状态" min-width="110" align="center">
          <template #default="{ row }">
            <span :class="['status-badge', getStatusClass(row.status)]">
              <span class="status-dot" />
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="最后验证" min-width="100" align="center">
          <template #default="{ row }">
            <span class="last-time">{{ row.lastValidateTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="130" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-btns">
              <button
                v-if="row.status === '验证失败'"
                class="action-btn action-btn--revalidate"
                @click.stop="emit('revalidate', row)"
              >
                重新验证
              </button>
              <template v-else>
                <button class="action-btn action-btn--validate" @click.stop="emit('validate', row)">
                  验证
                </button>
              </template>
              <button class="action-btn action-btn--edit" @click.stop="emit('edit', row)">
                编辑
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
          layout="prev, pager, next, jumper"
          class="cred-pagination"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { fetchCredentialTable, validateCredentialBatch } from '@/api/config-management/account-management'
  import { AccountApiSource } from '../config/data-source'
  import { cloneCredentialMockList } from '../mock/data'
  import { PLATFORM_CONFIGS } from '../types'
  import type { CredentialItem } from '../types'

  defineOptions({ name: 'CredentialTab' })

  const props = defineProps<{
    searchKeyword: string
  }>()

  const emit = defineEmits<{
    detail: [row: CredentialItem]
    edit: [row: CredentialItem]
    validate: [row: CredentialItem]
    revalidate: [row: CredentialItem]
  }>()

  const platformShortList = PLATFORM_CONFIGS.filter((p) =>
    ['Google Ads', 'Meta Ads', 'TikTok Ads', 'Mintegral', 'Snapchat Ads', 'Kwai Ads'].includes(p.value)
  ).map((p) => ({ value: p.value, shortLabel: p.shortLabel === 'G' ? 'Google' : p.shortLabel === 'f' ? 'Meta' : p.shortLabel }))

  const credTypeOptions = [
    { label: '全部', value: '' },
    { label: '客户端Token', value: '客户端Token' },
    { label: '服务号', value: '服务号' },
    { label: '证书文件', value: '证书文件' }
  ]

  const statusOptions = [
    { label: '全部', value: '' },
    { label: '验证正常', value: '验证正常' },
    { label: '验证失败', value: '验证失败' },
    { label: '待验证', value: '待验证' }
  ]

  const sourceFilter = ref('')
  const credTypeFilter = ref('')
  const statusFilter = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)
  const selectedId = ref('')

  const credentialList = ref<CredentialItem[]>([])

  const loadCredentialList = async () => {
    if (!AccountApiSource.credentialTable) {
      try {
        const response = await fetchCredentialTable({ current: 1, size: 1000 })
        const rows = (response as any)?.records ?? (response as any)?.list ?? []
        if (Array.isArray(rows)) {
          credentialList.value = rows
          return
        }
      } catch {
        // remote unavailable, fallback to mock
      }
    }
    credentialList.value = cloneCredentialMockList()
  }

  onMounted(() => {
    loadCredentialList()
  })

  defineExpose({
    reloadList: loadCredentialList
  })

  const filteredList = computed(() => {
    return credentialList.value.filter((item) => {
      const kw = props.searchKeyword.toLowerCase()
      if (kw && !item.name.toLowerCase().includes(kw) && !item.id.toLowerCase().includes(kw)) return false
      if (sourceFilter.value && item.source !== sourceFilter.value) return false
      if (credTypeFilter.value && item.credentialType !== credTypeFilter.value) return false
      if (statusFilter.value && item.status !== statusFilter.value) return false
      return true
    })
  })

  const total = computed(() => filteredList.value.length)

  const pagedList = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredList.value.slice(start, start + pageSize.value)
  })

  const stats = computed(() => {
    const all = credentialList.value
    const ok = all.filter((i) => i.status === '验证正常').length
    const fail = all.filter((i) => i.status === '验证失败').length
    const pending = all.filter((i) => i.status === '待验证').length
    return {
      total: all.length,
      ok,
      fail,
      pending,
      okRate: all.length ? Math.round((ok / all.length) * 1000) / 10 : 0
    }
  })

  watch(
    () => [props.searchKeyword, sourceFilter.value, credTypeFilter.value, statusFilter.value],
    () => { currentPage.value = 1 }
  )

  function getPlatformColor(source: string) {
    return PLATFORM_CONFIGS.find((p) => p.value === source)?.color ?? '#94a3b8'
  }

  function getPlatformShort(source: string) {
    const cfg = PLATFORM_CONFIGS.find((p) => p.value === source)
    return cfg?.shortLabel ?? source[0]
  }

  function getStatusClass(status: string) {
    if (status === '验证正常') return 'status-badge--ok'
    if (status === '验证失败') return 'status-badge--fail'
    return 'status-badge--pending'
  }

  function getRowClass({ row }: { row: CredentialItem }) {
    return row.id === selectedId.value ? 'row--selected' : ''
  }

  const handleRowClick = (row: CredentialItem) => {
    selectedId.value = row.id
    emit('detail', row)
  }

  const handleValidateAll = async () => {
    if (!AccountApiSource.validateCredentialBatch) {
      try {
        await validateCredentialBatch(credentialList.value.map((item) => item.id))
      } catch {
        // keep local notice
      }
    }
    ElMessage.info('全量验证任务已提交，请稍后查看结果')
  }
</script>

<style lang="scss" scoped>
  .credential-tab {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  // ─── 筛选栏 ─────────────────────────────────────────
  .filter-bar {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px 16px;
    background: var(--bg-card, #131c2e);
    border: 1px solid var(--border, rgb(255 255 255 / 7%));
    border-radius: 10px;
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 24px;
    align-items: center;
    justify-content: space-between;
  }

  .filter-group {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .filter-label {
    flex-shrink: 0;
    font-size: 13px;
    color: var(--text-secondary, #94a3b8);
  }

  .toggle-tabs {
    display: flex;
    gap: 4px;
  }

  .toggle-tab {
    padding: 4px 12px;
    font-size: 12px;
    color: var(--text-secondary, #94a3b8);
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--border, rgb(255 255 255 / 7%));
    border-radius: 6px;
    transition: all 0.18s;

    &:hover { color: var(--text-primary, #e2e8f0); }

    &--active {
      color: var(--accent, #3b82f6);
      background: rgb(59 130 246 / 12%);
      border-color: rgb(59 130 246 / 30%);
    }
  }

  .validate-all-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-left: auto;
  }

  .last-validate-tip {
    font-size: 12px;
    color: var(--text-muted, #64748b);
  }

  .last-validate-time {
    color: var(--text-secondary, #94a3b8);
  }

  .btn-validate-all {
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 500;
    color: #3b82f6;
    cursor: pointer;
    background: rgb(59 130 246 / 10%);
    border: 1px solid rgb(59 130 246 / 25%);
    border-radius: 6px;
    transition: all 0.18s;

    &:hover { background: rgb(59 130 246 / 20%); }
  }

  // ─── 统计卡片 ────────────────────────────────────────
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 16px 20px;
    background: var(--bg-card, #131c2e);
    border: 1px solid var(--border, rgb(255 255 255 / 7%));
    border-radius: 10px;

    &--ok   { border-left: 3px solid #22c55e; }
    &--fail { border-left: 3px solid #f87171; }
    &--pending { border-left: 3px solid #f59e0b; }
  }

  .stat-label {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--text-secondary, #94a3b8);
  }

  .stat-value-row {
    display: flex;
    gap: 10px;
    align-items: baseline;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;

    &--total   { color: #e2e8f0; }
    &--ok      { color: #22c55e; }
    &--fail    { color: #f87171; }
    &--pending { color: #f59e0b; }
  }

  .stat-rate {
    font-size: 14px;
    font-weight: 500;
    color: #22c55e;
  }

  .stat-tag-fail {
    padding: 2px 6px;
    font-size: 11px;
    color: #f87171;
    background: rgb(248 113 113 / 12%);
    border-radius: 4px;
  }

  // ─── 表格 ────────────────────────────────────────────
  .table-wrapper {
    padding: 16px;
    background: var(--bg-card, #131c2e);
    border: 1px solid var(--border, rgb(255 255 255 / 7%));
    border-radius: 10px;
  }

  .credential-table {
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
      font-weight: 500;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      background: transparent;
    }

    :deep(td.el-table__cell) { font-size: 13px; }

    :deep(.el-table__inner-wrapper::before) { display: none; }

    :deep(.row--selected td.el-table__cell) {
      background: rgb(59 130 246 / 8%) !important;
    }
  }

  .cred-name-cell {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .selected-chip {
    display: inline-block;
    padding: 1px 5px;
    font-size: 9px;
    font-weight: 700;
    color: #3b82f6;
    letter-spacing: 0.05em;
    background: rgb(59 130 246 / 15%);
    border-radius: 3px;
  }

  .cred-name {
    font-weight: 500;
    color: #e2e8f0;
  }

  .platform-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .platform-icon {
    font-size: 11px;
    font-weight: 700;
  }

  .platform-name {
    font-size: 12px;
    color: #94a3b8;
  }

  .apps-text {
    font-size: 12px;
    color: #94a3b8;
  }

  .account-count {
    font-weight: 600;
    color: #3b82f6;
  }

  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 8px;
    font-size: 12px;
    border-radius: 20px;

    &--ok {
      color: #22c55e;
      background: rgb(34 197 94 / 10%);
      .status-dot { background: #22c55e; }
    }

    &--fail {
      color: #f87171;
      background: rgb(248 113 113 / 10%);
      .status-dot { background: #f87171; }
    }

    &--pending {
      color: #f59e0b;
      background: rgb(245 158 11 / 10%);
      .status-dot {
        background: transparent;
        border: 1.5px solid #f59e0b;
      }
    }
  }

  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .last-time {
    font-size: 12px;
    color: #64748b;
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

    &--validate {
      color: #3b82f6;
      background: rgb(59 130 246 / 10%);
      border-color: rgb(59 130 246 / 20%);
      &:hover { background: rgb(59 130 246 / 20%); }
    }

    &--revalidate {
      color: #f59e0b;
      background: rgb(245 158 11 / 10%);
      border-color: rgb(245 158 11 / 20%);
      &:hover { background: rgb(245 158 11 / 20%); }
    }

    &--edit {
      color: #34d399;
      background: rgb(52 211 153 / 10%);
      border-color: rgb(52 211 153 / 20%);
      &:hover { background: rgb(52 211 153 / 20%); }
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
    color: #94a3b8;
  }

  .cred-pagination {
    :deep(.el-pager li) {
      color: #94a3b8;
      background: transparent;
      &.is-active { color: #3b82f6; background: rgb(59 130 246 / 15%); border-radius: 4px; }
      &:hover:not(.is-active) { color: #e2e8f0; }
    }

    :deep(.btn-prev),
    :deep(.btn-next) {
      color: #94a3b8;
      background: transparent;
      &:hover { color: #e2e8f0; }
      &:disabled { opacity: 0.4; }
    }

    :deep(.el-pagination__jump .el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border, rgb(255 255 255 / 7%)) !important;
      box-shadow: none !important;
    }

    :deep(.el-pagination__jump) {
      color: #94a3b8;
    }
  }
</style>
