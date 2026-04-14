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

  const filters = reactive<{
    keyword: string
    appName: string
    platform: '' | 'Android' | 'iOS'
    adPlatform: '' | 'Google' | 'TikTok' | 'Mintegral' | 'NewsBreak'
    status: '' | 'enabled' | 'disabled'
  }>({
    keyword: '',
    appName: '',
    platform: '',
    adPlatform: '',
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

  const appOptions = ['Weather5', 'Weather6', 'Weather8', 'Weather9']
  const adPlatformOptions = ['Google', 'TikTok', 'Mintegral', 'NewsBreak']

  const platformConfig: Record<string, { color: string; letter: string; bg: string }> = {
    Google: { color: '#4285F4', letter: 'G', bg: 'rgba(66,133,244,0.15)' },
    TikTok: { color: '#111111', letter: 'TT', bg: 'rgba(255,255,255,0.85)' },
    Mintegral: { color: '#00C896', letter: 'M', bg: 'rgba(0,200,150,0.15)' },
    NewsBreak: { color: '#FF4B4B', letter: 'NB', bg: 'rgba(255,75,75,0.15)' }
  }

  const tableQuery = computed<AdAccountTableQuery>(() => ({
    current: currentPage.value,
    size: pageSize.value,
    keyword: filters.keyword.trim(),
    appName: filters.appName,
    platform: filters.platform,
    adPlatform: filters.adPlatform,
    status: filters.status
  }))

  const statsQuery = computed<AdAccountOverviewStatsQuery>(() => ({
    keyword: filters.keyword.trim(),
    appName: filters.appName,
    platform: filters.platform,
    adPlatform: filters.adPlatform,
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
      ElMessage.error(getErrorMessage(error, 'Failed to load ad account table'))
    } finally {
      tableLoading.value = false
    }
  }

  async function loadStats() {
    statsLoading.value = true
    try {
      stats.value = await fetchAdAccountOverviewStats(statsQuery.value)
    } catch (error) {
      ElMessage.error(getErrorMessage(error, 'Failed to load overview stats'))
    } finally {
      statsLoading.value = false
    }
  }

  async function reloadAll() {
    await Promise.all([loadTable(), loadStats()])
  }

  watch(
    () => [filters.keyword, filters.appName, filters.platform, filters.adPlatform, filters.status],
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

  onMounted(() => {
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
    const action = row.status === 'enabled' ? 'disable' : 'enable'
    try {
      await ElMessageBox.confirm(`Confirm to ${action} this account?`, 'Confirm', {
        type: 'warning'
      })
    } catch {
      return
    }

    try {
      if (row.status === 'enabled') {
        await disableAdAccount(row.id)
        ElMessage.success('Account disabled')
      } else {
        await enableAdAccount(row.id)
        ElMessage.success('Account enabled')
      }
      await reloadAll()
    } catch (error) {
      ElMessage.error(getErrorMessage(error, `Failed to ${action} account`))
    }
  }

  async function handleDelete(row: AdAccount) {
    try {
      await ElMessageBox.confirm(
        'This action will permanently delete the account. Continue?',
        'Warning',
        { type: 'error' }
      )
    } catch {
      return
    }

    try {
      await deleteAdAccount(row.id)
      ElMessage.success('Account deleted')
      if (selectedAccount.value?.id === row.id) {
        detailDialogVisible.value = false
        selectedAccount.value = null
      }
      await reloadAll()
    } catch (error) {
      ElMessage.error(getErrorMessage(error, 'Failed to delete account'))
    }
  }

  async function handleExport() {
    try {
      await exportAdAccountList(tableQuery.value)
      ElMessage.success('Export started')
    } catch (error) {
      ElMessage.error(getErrorMessage(error, 'Failed to export table data'))
    }
  }

  function resetFilter() {
    filters.keyword = ''
    filters.appName = ''
    filters.platform = ''
    filters.adPlatform = ''
    filters.status = ''
  }

  async function handleSaveAccount(form: AdAccountForm) {
    createSubmitting.value = true
    try {
      await createAdAccount(form)
      ElMessage.success('Account created')
      addDialogVisible.value = false
      await reloadAll()
    } catch (error) {
      ElMessage.error(getErrorMessage(error, 'Failed to create account'))
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
      ElMessage.success('Account updated')
      detailDialogVisible.value = false
      await reloadAll()
    } catch (error) {
      ElMessage.error(getErrorMessage(error, 'Failed to update account'))
    } finally {
      updateSubmitting.value = false
    }
  }

  function formatAdAccounts(accounts: string[]) {
    if (!accounts.length) return 'NULL'
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
        <h1 class="page-title">Ad Account Management</h1>
        <p class="page-subtitle">
          Manage account credentials and platform mappings for each application.
        </p>
      </div>
      <el-button type="primary" @click="addDialogVisible = true"> Create Account </el-button>
    </div>

    <div class="stats-grid" v-loading="statsLoading">
      <div class="stat-card">
        <div class="stat-label">Total Accounts</div>
        <div class="stat-value">{{ stats.total }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Enabled</div>
        <div class="stat-value stat-green">{{ stats.enabled }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Disabled</div>
        <div class="stat-value stat-red">{{ stats.disabled }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Platforms</div>
        <div class="stat-value stat-blue">{{ stats.platformCount }}</div>
      </div>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="filters.keyword"
        class="filter-search"
        clearable
        placeholder="Search app or manager account"
        :prefix-icon="Search"
      />
      <el-select v-model="filters.appName" clearable placeholder="App" class="filter-select">
        <el-option label="All" value="" />
        <el-option v-for="app in appOptions" :key="app" :label="app" :value="app" />
      </el-select>
      <el-select v-model="filters.platform" clearable placeholder="Platform" class="filter-select">
        <el-option label="All" value="" />
        <el-option label="Android" value="Android" />
        <el-option label="iOS" value="iOS" />
      </el-select>
      <el-select
        v-model="filters.adPlatform"
        clearable
        placeholder="Ad Platform"
        class="filter-select"
      >
        <el-option label="All" value="" />
        <el-option
          v-for="platform in adPlatformOptions"
          :key="platform"
          :label="platform"
          :value="platform"
        />
      </el-select>
      <el-select v-model="filters.status" clearable placeholder="Status" class="filter-select">
        <el-option label="All" value="" />
        <el-option label="Enabled" value="enabled" />
        <el-option label="Disabled" value="disabled" />
      </el-select>
      <div class="filter-actions">
        <el-button @click="resetFilter">Reset</el-button>
        <el-button :icon="Upload" @click="handleExport">Export</el-button>
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
        <el-table-column label="Status" width="80" align="center">
          <template #default="{ row }">
            <span
              class="status-dot"
              :class="row.status === 'enabled' ? 'status-dot--on' : 'status-dot--off'"
            />
          </template>
        </el-table-column>

        <el-table-column label="App" min-width="140">
          <template #default="{ row }">
            <div class="app-cell">
              <div class="app-icon">{{ row.appName.slice(0, 1) }}</div>
              <span class="app-name">{{ row.appName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Platform" width="120">
          <template #default="{ row }">
            <span class="platform-badge">{{ row.platform }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Ad Platform" width="160">
          <template #default="{ row }">
            <div class="adplatform-cell">
              <span
                class="adplatform-badge"
                :style="{
                  color: platformConfig[row.adPlatform]?.color,
                  background: platformConfig[row.adPlatform]?.bg
                }"
              >
                {{ platformConfig[row.adPlatform]?.letter }}
              </span>
              <span class="adplatform-name">{{ row.adPlatform }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Manager Account" min-width="180">
          <template #default="{ row }">
            <span class="mono-text">{{ row.managerAccount }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Ad Accounts" min-width="220">
          <template #default="{ row }">
            <template v-if="row.adAccounts.length">
              <span class="mono-text">{{ formatAdAccounts(row.adAccounts) }}</span>
              <el-tag v-if="row.adAccounts.length > 2" size="small" class="more-tag">
                +{{ row.adAccounts.length - 2 }}
              </el-tag>
            </template>
            <span v-else class="null-text">NULL</span>
          </template>
        </el-table-column>

        <el-table-column label="Credential" min-width="140">
          <template #default="{ row }">
            <span class="mono-text">{{ row.credential || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Token" width="180">
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

        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <span class="action-btn action-edit" @click="handleEdit(row)">Edit</span>
              <span class="action-divider">|</span>
              <span
                class="action-btn"
                :class="row.status === 'enabled' ? 'action-disable' : 'action-enable'"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 'enabled' ? 'Disable' : 'Enable' }}
              </span>
              <span class="action-divider">|</span>
              <span class="action-btn action-delete" @click="handleDelete(row)">Delete</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-bar">
      <span class="pagination-total">Total {{ total }} records</span>
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
