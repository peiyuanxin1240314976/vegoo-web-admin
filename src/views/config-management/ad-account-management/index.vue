<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Upload, View } from '@element-plus/icons-vue'
  import {
    createAdAccount,
    deleteAdAccount,
    disableAdAccount,
    enableAdAccount,
    exportAdAccountList,
    fetchAdAccountOverviewStats,
    fetchAdAccountTable,
    updateAdAccount
  } from '@/api/config-management/ad-account-management'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import type { CockpitMetaOptionItem } from '@/types/cockpit-meta-filter'
  import AccountDetailDialog from './AccountDetailDialog.vue'
  import AddAccountDialog from './AddAccountDialog.vue'
  import type {
    AdAccount,
    AdAccountForm,
    AdAccountOverviewStats,
    AdAccountOverviewStatsQuery,
    AdAccountTableQuery,
    AdAccountUpdatePayload
  } from './types'

  const cockpitMetaStore = useCockpitMetaFilterStore()

  const metaAppOptions = computed(() => cockpitMetaStore.data?.appOptions ?? [])
  const metaPlatformOptions = computed(() => cockpitMetaStore.data?.platformOptions ?? [])
  const metaSourceOptions = computed(() => cockpitMetaStore.data?.sourceOptions ?? [])

  function optionLabel(options: CockpitMetaOptionItem[], value: string): string {
    if (!value) return ''
    return options.find((o) => o.value === value)?.label ?? value
  }

  const filters = reactive<{
    keyword: string
    appId: string
    platform: string
    source: string
    status: '' | 'enabled' | 'disabled'
  }>({
    keyword: '',
    appId: '',
    platform: '',
    source: '',
    status: ''
  })

  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const tableData = ref<AdAccount[]>([])
  const stats = ref<AdAccountOverviewStats>({
    total: 0,
    enabled: 0,
    disabled: 0,
    platformCount: 0
  })

  const tableLoading = ref(false)
  const statsLoading = ref(false)
  const createSubmitting = ref(false)
  const updateSubmitting = ref(false)

  const detailDialogVisible = ref(false)
  const addDialogVisible = ref(false)
  const selectedAccount = ref<AdAccount | null>(null)

  const sourceBadgeStyle: Record<string, { color: string; letter: string; bg: string }> = {
    '1': { color: '#4285F4', letter: 'G', bg: 'rgba(66,133,244,0.15)' },
    '10': { color: '#111111', letter: 'TT', bg: 'rgba(255,255,255,0.85)' },
    '9': { color: '#00C896', letter: 'M', bg: 'rgba(0,200,150,0.15)' },
    '20': { color: '#FF4B4B', letter: 'NB', bg: 'rgba(255,75,75,0.15)' }
  }

  function getSourceBadge(row: AdAccount) {
    const label = optionLabel(metaSourceOptions.value, row.source)
    const preset = sourceBadgeStyle[row.source]
    if (preset) return { ...preset, name: label }
    const letter = label ? label.slice(0, 2).toUpperCase() : row.source
    return {
      color: '#94a3b8',
      letter,
      bg: 'rgba(148,163,184,0.12)',
      name: label
    }
  }

  const tableQuery = computed<AdAccountTableQuery>(() => ({
    current: currentPage.value,
    size: pageSize.value,
    keyword: filters.keyword.trim(),
    appId: filters.appId,
    platform: filters.platform,
    source: filters.source,
    status: filters.status
  }))

  const statsQuery = computed<AdAccountOverviewStatsQuery>(() => ({
    keyword: filters.keyword.trim(),
    appId: filters.appId,
    platform: filters.platform,
    source: filters.source,
    status: filters.status
  }))

  function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error && error.message ? error.message : fallback
  }

  async function loadTable() {
    tableLoading.value = true
    try {
      const response = await fetchAdAccountTable(tableQuery.value)
      tableData.value = response.records
      total.value = response.total
    } catch (error) {
      ElMessage.error(getErrorMessage(error, '加载广告账户列表失败'))
    } finally {
      tableLoading.value = false
    }
  }

  async function loadStats() {
    statsLoading.value = true
    try {
      stats.value = await fetchAdAccountOverviewStats(statsQuery.value)
    } catch (error) {
      ElMessage.error(getErrorMessage(error, '加载概览统计失败'))
    } finally {
      statsLoading.value = false
    }
  }

  async function reloadAll() {
    await Promise.all([loadTable(), loadStats()])
  }

  watch(
    () => [filters.keyword, filters.appId, filters.platform, filters.source, filters.status],
    () => {
      if (currentPage.value !== 1) {
        currentPage.value = 1
      } else {
        void loadTable()
      }
      void loadStats()
    }
  )

  watch([currentPage, pageSize], () => {
    void loadTable()
  })

  onMounted(async () => {
    await cockpitMetaStore.ensureLoaded()
    void reloadAll()
  })

  function handleEdit(row: AdAccount) {
    selectedAccount.value = {
      ...row,
      adAccounts: [...row.adAccounts]
    }
    detailDialogVisible.value = true
  }

  async function handleToggleStatus(row: AdAccount) {
    const confirmMessage =
      row.status === 'enabled' ? '确定要禁用该账户吗？' : '确定要启用该账户吗？'
    try {
      await ElMessageBox.confirm(confirmMessage, '确认', {
        type: 'warning'
      })
    } catch {
      return
    }

    try {
      if (row.status === 'enabled') {
        await disableAdAccount(row.id)
        ElMessage.success('已禁用账户')
      } else {
        await enableAdAccount(row.id)
        ElMessage.success('已启用账户')
      }
      await reloadAll()
    } catch (error) {
      const fallback = row.status === 'enabled' ? '禁用账户失败' : '启用账户失败'
      ElMessage.error(getErrorMessage(error, fallback))
    }
  }

  async function handleDelete(row: AdAccount) {
    try {
      await ElMessageBox.confirm('此操作将永久删除该账户，是否继续？', '警告', { type: 'error' })
    } catch {
      return
    }

    try {
      await deleteAdAccount(row.id)
      ElMessage.success('已删除账户')
      if (selectedAccount.value?.id === row.id) {
        detailDialogVisible.value = false
        selectedAccount.value = null
      }
      await reloadAll()
    } catch (error) {
      ElMessage.error(getErrorMessage(error, '删除账户失败'))
    }
  }

  async function handleExport() {
    try {
      await exportAdAccountList(tableQuery.value)
      ElMessage.success('已开始导出')
    } catch (error) {
      ElMessage.error(getErrorMessage(error, '导出失败'))
    }
  }

  function resetFilter() {
    filters.keyword = ''
    filters.appId = ''
    filters.platform = ''
    filters.source = ''
    filters.status = ''
  }

  async function handleSaveAccount(form: AdAccountForm) {
    createSubmitting.value = true
    try {
      await createAdAccount(form)
      ElMessage.success('创建成功')
      addDialogVisible.value = false
      await reloadAll()
    } catch (error) {
      ElMessage.error(getErrorMessage(error, '创建账户失败'))
    } finally {
      createSubmitting.value = false
    }
  }

  async function handleUpdateAccount(payload: AdAccountUpdatePayload) {
    if (!selectedAccount.value) return
    updateSubmitting.value = true
    try {
      const updated = await updateAdAccount(selectedAccount.value.id, payload)
      selectedAccount.value = updated
      ElMessage.success('更新成功')
      detailDialogVisible.value = false
      await reloadAll()
    } catch (error) {
      ElMessage.error(getErrorMessage(error, '更新账户失败'))
    } finally {
      updateSubmitting.value = false
    }
  }

  function formatAdAccounts(accounts: string[]) {
    if (!accounts.length) return '无'
    if (accounts.length <= 2) return accounts.join(', ')
    return accounts.slice(0, 2).join(', ')
  }

  function maskToken(token: string | null) {
    if (!token) return '-'
    if (token.length <= 8) return `${token.slice(0, 2)}***`
    return `${token.slice(0, 8)}********`
  }
</script>

<template>
  <div class="ad-account-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">广告账户管理</h1>
        <p class="page-subtitle">管理各应用的账户凭证与广告平台映射关系。</p>
      </div>
      <el-button type="primary" round @click="addDialogVisible = true">新建账户</el-button>
    </div>

    <div class="stats-grid" v-loading="statsLoading">
      <div class="stat-card">
        <div class="stat-label">账户总数</div>
        <div class="stat-value">{{ stats.total }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已启用</div>
        <div class="stat-value stat-green">{{ stats.enabled }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已停用</div>
        <div class="stat-value stat-red">{{ stats.disabled }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">广告平台数</div>
        <div class="stat-value stat-blue">{{ stats.platformCount }}</div>
      </div>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="filters.keyword"
        class="filter-search"
        clearable
        placeholder="搜索应用或经理账户"
        :prefix-icon="Search"
      />
      <el-select
        v-model="filters.appId"
        clearable
        filterable
        placeholder="应用"
        class="filter-select"
      >
        <el-option label="全部" value="" />
        <el-option
          v-for="opt in metaAppOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <el-select v-model="filters.platform" clearable placeholder="终端平台" class="filter-select">
        <el-option label="全部" value="" />
        <el-option
          v-for="opt in metaPlatformOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <el-select v-model="filters.source" clearable placeholder="广告平台" class="filter-select">
        <el-option label="全部" value="" />
        <el-option
          v-for="opt in metaSourceOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <el-select v-model="filters.status" clearable placeholder="状态" class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="已启用" value="enabled" />
        <el-option label="已停用" value="disabled" />
      </el-select>
      <div class="filter-actions">
        <el-button round @click="resetFilter">重置</el-button>
        <el-button round :icon="Upload" @click="handleExport">导出</el-button>
      </div>
    </div>

    <div class="table-wrap">
      <el-table
        v-loading="tableLoading"
        :data="tableData"
        class="ad-table"
        :row-style="
          (row) => (row.row.status === 'disabled' ? { background: 'rgba(239,68,68,0.04)' } : {})
        "
      >
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <span
              class="status-dot"
              :class="row.status === 'enabled' ? 'status-dot--on' : 'status-dot--off'"
            />
          </template>
        </el-table-column>

        <el-table-column label="应用" min-width="140">
          <template #default="{ row }">
            <div class="app-cell">
              <div class="app-icon">{{ row.appName.slice(0, 1) }}</div>
              <span class="app-name">{{ row.appName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="终端平台" width="120">
          <template #default="{ row }">
            <span class="platform-badge">{{
              optionLabel(metaPlatformOptions, row.platform) || row.platform
            }}</span>
          </template>
        </el-table-column>

        <el-table-column label="广告平台" width="160">
          <template #default="{ row }">
            <div class="adplatform-cell">
              <span
                class="adplatform-badge"
                :style="{
                  color: getSourceBadge(row).color,
                  background: getSourceBadge(row).bg
                }"
              >
                {{ getSourceBadge(row).letter }}
              </span>
              <span class="adplatform-name">{{ getSourceBadge(row).name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="管理账户" min-width="180">
          <template #default="{ row }">
            <span class="mono-text">{{ row.managerAccount }}</span>
          </template>
        </el-table-column>

        <el-table-column label="广告子账户" min-width="220">
          <template #default="{ row }">
            <template v-if="row.adAccounts.length">
              <span class="mono-text">{{ formatAdAccounts(row.adAccounts) }}</span>
              <el-tag v-if="row.adAccounts.length > 2" size="small" class="more-tag">
                +{{ row.adAccounts.length - 2 }}
              </el-tag>
            </template>
            <span v-else class="null-text">无</span>
          </template>
        </el-table-column>

        <el-table-column label="凭证" min-width="140">
          <template #default="{ row }">
            <span class="mono-text">{{ row.credential || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="令牌" width="180">
          <template #default="{ row }">
            <div class="token-cell" v-if="row.token">
              <span class="token-mask">{{ maskToken(row.token) }}</span>
              <el-icon class="token-eye">
                <View />
              </el-icon>
            </div>
            <span v-else class="null-text">-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <span class="action-btn action-edit" @click="handleEdit(row)">编辑</span>
              <span class="action-divider">|</span>
              <span
                class="action-btn"
                :class="row.status === 'enabled' ? 'action-disable' : 'action-enable'"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 'enabled' ? '禁用' : '启用' }}
              </span>
              <span class="action-divider">|</span>
              <span class="action-btn action-delete" @click="handleDelete(row)">删除</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-bar">
      <span class="pagination-total">共 {{ total }} 条</span>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="prev, pager, next, sizes"
        class="ad-pagination"
      />
    </div>

    <AccountDetailDialog
      v-model:visible="detailDialogVisible"
      :account="selectedAccount"
      :submitting="updateSubmitting"
      @update="handleUpdateAccount"
    />
    <AddAccountDialog
      v-model:visible="addDialogVisible"
      :submitting="createSubmitting"
      @save="handleSaveAccount"
    />
  </div>
</template>

<style scoped>
  .ad-account-page {
    min-height: 100vh;
    padding: 24px 32px;
    color: #e5e7eb;
    background: #0f172a;
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .page-title {
    margin: 0 0 6px;
    font-size: 24px;
    font-weight: 700;
    color: #f8fafc;
  }

  .page-subtitle {
    margin: 0;
    color: #94a3b8;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    padding: 20px;
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 12px;
  }

  .stat-label {
    margin-bottom: 8px;
    font-size: 13px;
    color: #94a3b8;
  }

  .stat-value {
    font-size: 30px;
    font-weight: 700;
  }

  .stat-green {
    color: #10b981;
  }

  .stat-red {
    color: #ef4444;
  }

  .stat-blue {
    color: #38bdf8;
  }

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding: 16px 20px;
    margin-bottom: 16px;
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 12px;
  }

  .filter-search {
    width: 240px;
  }

  .filter-select {
    width: 160px;
  }

  .filter-actions {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }

  .table-wrap {
    overflow: hidden;
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 12px;
  }

  :deep(.ad-table) {
    background: transparent !important;
  }

  :deep(.ad-table th) {
    background: #0b1220 !important;
  }

  .status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .status-dot--on {
    background: #10b981;
  }

  .status-dot--off {
    background: #ef4444;
  }

  .app-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .app-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #2563eb, #38bdf8);
    border-radius: 6px;
  }

  .app-name {
    font-weight: 500;
  }

  .platform-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    background: rgb(255 255 255 / 6%);
    border-radius: 999px;
  }

  .adplatform-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .adplatform-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 6px;
  }

  .mono-text,
  .token-mask {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
  }

  .null-text {
    color: #6b7280;
  }

  .more-tag {
    margin-left: 6px;
  }

  .token-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .token-eye {
    color: #94a3b8;
  }

  .action-cell {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .action-btn {
    cursor: pointer;
  }

  .action-edit {
    color: #60a5fa;
  }

  .action-enable {
    color: #10b981;
  }

  .action-disable {
    color: #f59e0b;
  }

  .action-delete {
    color: #ef4444;
  }

  .action-divider {
    color: #334155;
  }

  .pagination-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0 0;
  }

  .pagination-total {
    color: #94a3b8;
  }
</style>
