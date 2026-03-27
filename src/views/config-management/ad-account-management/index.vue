<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Upload } from '@element-plus/icons-vue'
  import AccountDetailDialog from './AccountDetailDialog.vue'
  import AddAccountDialog from './AddAccountDialog.vue'
  import type { AdAccount } from './types'

  // ─── Mock data ─────────────────────────────────────────────────────────────────
  const mockData: AdAccount[] = [
    {
      id: 1,
      status: 'enabled',
      appName: 'Weather5',
      platform: 'Android',
      adPlatform: 'Google',
      managerAccount: '560-369-9741',
      adAccounts: ['385-510-4056', '250-161-1888', '542-141-4898', '292-126-4627'],
      credential: 'AdCost',
      token: '32ba778abac3978d34a0a46db475d7147f1997b8'
    },
    {
      id: 2,
      status: 'enabled',
      appName: 'Weather5',
      platform: 'Android',
      adPlatform: 'TikTok',
      managerAccount: '744708116631368720',
      adAccounts: [],
      credential: 'TikTok1',
      token: '32ba778a••••••'
    },
    {
      id: 3,
      status: 'enabled',
      appName: 'Weather5',
      platform: 'Android',
      adPlatform: 'Mintegral',
      managerAccount: 'vegoo',
      adAccounts: [],
      credential: 'MintegralAdCost1',
      token: null
    },
    {
      id: 4,
      status: 'enabled',
      appName: 'Weather5',
      platform: 'Android',
      adPlatform: 'NewsBreak',
      managerAccount: '192001862051147366',
      adAccounts: [],
      credential: 'NewsBreakCost1',
      token: null
    },
    {
      id: 5,
      status: 'disabled',
      appName: 'Weather5',
      platform: 'Android',
      adPlatform: 'NewsBreak',
      managerAccount: '196006482456592752',
      adAccounts: [],
      credential: 'NewsBreakCost2',
      token: null
    },
    {
      id: 6,
      status: 'enabled',
      appName: 'Weather6',
      platform: 'Android',
      adPlatform: 'Google',
      managerAccount: '560-369-9741',
      adAccounts: ['566-130-6966', '247-501-9691', '810-968-5835'],
      credential: 'AdCost',
      token: null
    },
    {
      id: 7,
      status: 'enabled',
      appName: 'Weather8',
      platform: 'Android',
      adPlatform: 'Google',
      managerAccount: '560-369-9741',
      adAccounts: ['810-968-5835', '463-423-2598'],
      credential: 'AdCost',
      token: null
    }
  ]

  // ─── State ────────────────────────────────────────────────────────────────────
  const searchText = ref('')
  const filterApp = ref('')
  const filterPlatform = ref('')
  const filterAdPlatform = ref('')
  const filterStatus = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const detailDialogVisible = ref(false)
  const addDialogVisible = ref(false)
  const selectedAccount = ref<AdAccount | null>(null)

  // ─── Computed ─────────────────────────────────────────────────────────────────
  const stats = computed(() => ({
    total: mockData.length,
    enabled: mockData.filter((d) => d.status === 'enabled').length,
    disabled: mockData.filter((d) => d.status === 'disabled').length,
    platforms: [...new Set(mockData.map((d) => d.adPlatform))].length
  }))

  const filteredData = computed(() => {
    return mockData.filter((item) => {
      const matchSearch =
        !searchText.value ||
        item.appName.toLowerCase().includes(searchText.value.toLowerCase()) ||
        item.managerAccount.includes(searchText.value)
      const matchApp = !filterApp.value || item.appName === filterApp.value
      const matchPlatform = !filterPlatform.value || item.platform === filterPlatform.value
      const matchAdPlatform = !filterAdPlatform.value || item.adPlatform === filterAdPlatform.value
      const matchStatus = !filterStatus.value || item.status === filterStatus.value
      return matchSearch && matchApp && matchPlatform && matchAdPlatform && matchStatus
    })
  })

  const pagedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredData.value.slice(start, start + pageSize.value)
  })

  // ─── Platform icons/colors ────────────────────────────────────────────────────
  const platformConfig: Record<string, { color: string; letter: string; bg: string }> = {
    Google: { color: '#4285F4', letter: 'G', bg: 'rgba(66,133,244,0.15)' },
    TikTok: { color: '#ffffff', letter: '♪', bg: 'rgba(255,255,255,0.1)' },
    Mintegral: { color: '#00C896', letter: 'M', bg: 'rgba(0,200,150,0.15)' },
    NewsBreak: { color: '#FF4B4B', letter: 'NB', bg: 'rgba(255,75,75,0.15)' }
  }

  // ─── Methods ──────────────────────────────────────────────────────────────────
  const handleEdit = (row: AdAccount) => {
    selectedAccount.value = { ...row }
    detailDialogVisible.value = true
  }

  const handleToggleStatus = async (row: AdAccount) => {
    const action = row.status === 'enabled' ? '禁用' : '启用'
    await ElMessageBox.confirm(`确认${action}该账户？`, '提示', { type: 'warning' })
    const item = mockData.find((d) => d.id === row.id)
    if (item) item.status = item.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功`)
  }

  const handleDelete = async () => {
    await ElMessageBox.confirm('确认删除该账户？此操作不可撤销。', '警告', { type: 'error' })
    ElMessage.success('删除成功')
  }

  const handleExport = () => {
    ElMessage.success('正在导出数据...')
  }

  const resetFilter = () => {
    searchText.value = ''
    filterApp.value = ''
    filterPlatform.value = ''
    filterAdPlatform.value = ''
    filterStatus.value = ''
  }

  const handleSaveAccount = () => {
    ElMessage.success('账户保存成功')
    addDialogVisible.value = false
  }

  const handleUpdateAccount = () => {
    ElMessage.success('账户更新成功')
    detailDialogVisible.value = false
  }

  const formatAdAccounts = (accounts: string[]) => {
    if (!accounts.length) return 'NULL'
    if (accounts.length <= 2) return accounts.join(', ')
    return accounts.slice(0, 2).join(', ')
  }
</script>

<template>
  <div class="ad-account-page">
    <!-- ── 页头 ── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">广告账户管理</h1>
        <p class="page-subtitle">管理各应用在不同广告平台的账户配置与认证信息</p>
      </div>
      <el-button class="btn-add" @click="addDialogVisible = true">
        <span class="btn-add-icon">+</span> 新增账户
      </el-button>
    </div>

    <!-- ── 统计卡片 ── -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">账户总数</div>
        <div class="stat-value stat-default">
          {{ stats.total }} <span class="stat-sub">全部配置</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已启用</div>
        <div class="stat-value stat-green">
          {{ stats.enabled }} <span class="stat-sub">正常运行</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已禁用</div>
        <div class="stat-value stat-red">
          {{ stats.disabled }} <span class="stat-sub">暂停使用</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">广告平台</div>
        <div class="stat-value stat-blue">
          {{ stats.platforms }} <span class="stat-sub">Google / TikTok / Mintegral 等</span>
        </div>
      </div>
    </div>

    <!-- ── 筛选栏 ── -->
    <div class="filter-bar">
      <el-input
        v-model="searchText"
        placeholder="搜索应用名、账户ID..."
        :prefix-icon="Search"
        class="filter-search"
        clearable
      />
      <el-select v-model="filterApp" placeholder="应用名称 全部" clearable class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="Weather5" value="Weather5" />
        <el-option label="Weather6" value="Weather6" />
        <el-option label="Weather8" value="Weather8" />
      </el-select>
      <el-select v-model="filterPlatform" placeholder="平台 全部" clearable class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="Android" value="Android" />
        <el-option label="iOS" value="iOS" />
      </el-select>
      <el-select
        v-model="filterAdPlatform"
        placeholder="广告平台 全部"
        clearable
        class="filter-select"
      >
        <el-option label="全部" value="" />
        <el-option label="Google" value="Google" />
        <el-option label="TikTok" value="TikTok" />
        <el-option label="Mintegral" value="Mintegral" />
        <el-option label="NewsBreak" value="NewsBreak" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="状态 全部" clearable class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="已启用" value="enabled" />
        <el-option label="已禁用" value="disabled" />
      </el-select>
      <div class="filter-actions">
        <span class="btn-reset" @click="resetFilter">重置筛选</span>
        <el-button class="btn-export" :icon="Upload" @click="handleExport">导出</el-button>
      </div>
    </div>

    <!-- ── 表格 ── -->
    <div class="table-wrap">
      <el-table
        :data="pagedData"
        class="ad-table"
        row-class-name="ad-table-row"
        :row-style="
          (row) => (row.row.status === 'disabled' ? { background: 'rgba(239,68,68,0.04)' } : {})
        "
      >
        <!-- 状态 -->
        <el-table-column label="状态" width="60" align="center">
          <template #default="{ row }">
            <span
              class="status-dot"
              :class="row.status === 'enabled' ? 'status-dot--on' : 'status-dot--off'"
            />
          </template>
        </el-table-column>

        <!-- 应用名 -->
        <el-table-column label="应用名" width="130">
          <template #default="{ row }">
            <div class="app-cell">
              <div class="app-icon">🌤</div>
              <span class="app-name">{{ row.appName }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 平台 -->
        <el-table-column label="平台" width="110">
          <template #default="{ row }">
            <span class="platform-badge">
              <svg class="android-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M17.523 15.341A5 5 0 0 0 22 10.5a5 5 0 0 0-5-5 5 5 0 0 0-4.965 4.5H11.97A5 5 0 0 0 7 5.5a5 5 0 0 0-5 5 5 5 0 0 0 4.477 4.841V17.5H5v2h14v-2h-1.477v-2.159zM7 13.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm10 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
                />
              </svg>
              {{ row.platform }}
            </span>
          </template>
        </el-table-column>

        <!-- 广告平台 -->
        <el-table-column label="广告平台" width="140">
          <template #default="{ row }">
            <div class="adplatform-cell">
              <span
                class="adplatform-badge"
                :style="{
                  color: platformConfig[row.adPlatform]?.color,
                  background: platformConfig[row.adPlatform]?.bg
                }"
                >{{ platformConfig[row.adPlatform]?.letter }}</span
              >
              <span class="adplatform-name">{{ row.adPlatform }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 管理账户 -->
        <el-table-column label="管理账户" width="190">
          <template #default="{ row }">
            <span class="mono-text">{{ row.managerAccount }}</span>
          </template>
        </el-table-column>

        <!-- 广告账户 -->
        <el-table-column label="广告账户" min-width="200">
          <template #default="{ row }">
            <template v-if="row.adAccounts.length">
              <span class="mono-text">{{ formatAdAccounts(row.adAccounts) }}</span>
              <el-tag v-if="row.adAccounts.length > 2" size="small" class="more-tag"
                >+{{ row.adAccounts.length - 2 }}</el-tag
              >
            </template>
            <span v-else class="null-text">{{ row.status === 'disabled' ? 'NULL2' : 'NULL' }}</span>
          </template>
        </el-table-column>

        <!-- 凭据 -->
        <el-table-column label="凭据" width="150">
          <template #default="{ row }">
            <span class="mono-text">{{ row.credential }}</span>
          </template>
        </el-table-column>

        <!-- Token -->
        <el-table-column label="Token" width="160">
          <template #default="{ row }">
            <div class="token-cell" v-if="row.token">
              <span class="token-mask">••••••••••••••</span>
              <el-icon class="token-eye"><View /></el-icon>
            </div>
            <span v-else class="null-text">—</span>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <span class="action-btn action-edit" @click="handleEdit(row)">编辑</span>
              <span class="action-divider">|</span>
              <span
                class="action-btn"
                :class="row.status === 'enabled' ? 'action-disable' : 'action-enable'"
                @click="handleToggleStatus(row)"
                >{{ row.status === 'enabled' ? '禁用' : '启用' }}</span
              >
              <span class="action-divider">|</span>
              <span class="action-btn action-delete" @click="handleDelete">删除</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ── 分页 ── -->
    <div class="pagination-bar">
      <span class="pagination-total">共 {{ filteredData.length }} 条记录</span>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="filteredData.length"
        layout="prev, pager, next, sizes"
        class="ad-pagination"
      />
    </div>

    <!-- ── 弹窗 ── -->
    <AccountDetailDialog
      v-model:visible="detailDialogVisible"
      :account="selectedAccount"
      @update="handleUpdateAccount"
    />
    <AddAccountDialog v-model:visible="addDialogVisible" @save="handleSaveAccount" />
  </div>
</template>

<style scoped>
  /* ── 基础 ── */
  .ad-account-page {
    min-height: 100vh;
    padding: 24px 32px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: #e2e8f0;
    background: #0d1117;
  }

  /* ── 页头 ── */
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
    color: #f1f5f9;
    letter-spacing: -0.5px;
  }

  .page-subtitle {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
  }

  .btn-add {
    display: flex;
    gap: 6px;
    align-items: center;
    height: 38px !important;
    padding: 0 18px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    color: #fff !important;
    background: #3b82f6 !important;
    border: none !important;
    border-radius: 8px !important;
    transition: all 0.2s !important;
  }

  .btn-add:hover {
    background: #2563eb !important;
    box-shadow: 0 4px 16px rgb(59 130 246 / 40%) !important;
    transform: translateY(-1px);
  }

  .btn-add-icon {
    font-size: 18px;
    line-height: 1;
  }

  /* ── 统计卡片 ── */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    padding: 20px 24px;
    background: #161b27;
    border: 1px solid #1e2535;
    border-radius: 12px;
    transition: border-color 0.2s;
  }

  .stat-card:hover {
    border-color: #2d3a50;
  }

  .stat-label {
    margin-bottom: 10px;
    font-size: 13px;
    color: #6b7280;
  }

  .stat-value {
    display: flex;
    gap: 10px;
    align-items: baseline;
    font-size: 32px;
    font-weight: 700;
  }

  .stat-sub {
    font-size: 13px;
    font-weight: 400;
    color: #6b7280;
  }

  .stat-default {
    color: #f1f5f9;
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

  /* ── 筛选栏 ── */
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding: 16px 20px;
    margin-bottom: 16px;
    background: #161b27;
    border: 1px solid #1e2535;
    border-radius: 12px;
  }

  .filter-search {
    width: 220px !important;
  }

  .filter-select {
    width: 150px !important;
  }

  .filter-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-left: auto;
  }

  .btn-reset {
    font-size: 13px;
    color: #3b82f6;
    white-space: nowrap;
    cursor: pointer;
    transition: color 0.2s;
  }

  .btn-reset:hover {
    color: #60a5fa;
  }

  .btn-export {
    height: 34px !important;
    font-size: 13px !important;
    color: #e2e8f0 !important;
    background: #1e2535 !important;
    border: 1px solid #2d3a50 !important;
    border-radius: 8px !important;
  }

  .btn-export:hover {
    background: #253045 !important;
  }

  /* ── 表格 ── */
  .table-wrap {
    margin-bottom: 16px;
    overflow: hidden;
    background: #161b27;
    border: 1px solid #1e2535;
    border-radius: 12px;
  }

  :deep(.ad-table) {
    background: transparent !important;
  }

  :deep(.ad-table .el-table__header-wrapper th) {
    padding: 12px 0 !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    color: #6b7280 !important;
    background: #0f1420 !important;
    border-bottom: 1px solid #1e2535 !important;
  }

  :deep(.ad-table .el-table__body tr) {
    background: transparent !important;
  }

  :deep(.ad-table .el-table__body tr:hover > td) {
    background: rgb(59 130 246 / 5%) !important;
  }

  :deep(.ad-table .el-table__body td) {
    padding: 14px 0 !important;
    font-size: 13px !important;
    color: #cbd5e1 !important;
    background: transparent !important;
    border-bottom: 1px solid #1a2030 !important;
  }

  :deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
    background: rgb(59 130 246 / 5%) !important;
  }

  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }

  .status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .status-dot--on {
    background: #10b981;
    box-shadow: 0 0 6px rgb(16 185 129 / 50%);
  }

  .status-dot--off {
    background: #ef4444;
    box-shadow: 0 0 6px rgb(239 68 68 / 50%);
  }

  .app-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .app-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 15px;
    background: linear-gradient(135deg, #1e88e5, #42a5f5);
    border-radius: 6px;
  }

  .app-name {
    font-weight: 500;
    color: #e2e8f0;
  }

  .platform-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 10px;
    font-size: 12px;
    color: #94a3b8;
    background: rgb(255 255 255 / 6%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 6px;
  }

  .android-icon {
    width: 13px;
    height: 13px;
    color: #a3e635;
    fill: #a3e635;
  }

  .adplatform-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .adplatform-badge {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 6px;
  }

  .adplatform-name {
    font-size: 13px;
    color: #cbd5e1;
  }

  .mono-text {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 12.5px;
    color: #94a3b8;
  }

  .null-text {
    font-size: 13px;
    font-style: italic;
    color: #4b5563;
  }

  .more-tag {
    margin-left: 6px;
    font-size: 11px !important;
    color: #60a5fa !important;
    background: rgb(59 130 246 / 15%) !important;
    border: 1px solid rgb(59 130 246 / 30%) !important;
    border-radius: 4px !important;
  }

  .token-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .token-mask {
    font-size: 11px;
    color: #4b5563;
    letter-spacing: 2px;
  }

  .token-eye {
    font-size: 14px;
    color: #6b7280;
    cursor: pointer;
    transition: color 0.2s;
  }

  .token-eye:hover {
    color: #94a3b8;
  }

  .action-cell {
    display: flex;
    flex-wrap: nowrap;
    gap: 4px;
    align-items: center;
  }

  .action-btn {
    font-size: 13px;
    cursor: pointer;
    transition: color 0.15s;
  }

  .action-edit {
    color: #3b82f6;
  }

  .action-edit:hover {
    color: #60a5fa;
  }

  .action-disable {
    color: #f59e0b;
  }

  .action-disable:hover {
    color: #fbbf24;
  }

  .action-enable {
    color: #10b981;
  }

  .action-enable:hover {
    color: #34d399;
  }

  .action-delete {
    color: #ef4444;
  }

  .action-delete:hover {
    color: #f87171;
  }

  .action-divider {
    color: #2d3a50;
    user-select: none;
  }

  /* ── 分页 ── */
  .pagination-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
  }

  .pagination-total {
    font-size: 13px;
    color: #6b7280;
  }

  :deep(.ad-pagination .el-pager li) {
    min-width: 32px !important;
    height: 32px !important;
    margin: 0 2px !important;
    font-size: 13px !important;
    line-height: 30px !important;
    color: #94a3b8 !important;
    background: #161b27 !important;
    border: 1px solid #1e2535 !important;
    border-radius: 6px !important;
    transition: all 0.2s !important;
  }

  :deep(.ad-pagination .el-pager li.is-active) {
    color: #fff !important;
    background: #3b82f6 !important;
    border-color: #3b82f6 !important;
  }

  :deep(.ad-pagination .el-pager li:hover) {
    color: #e2e8f0 !important;
    background: #1e2535 !important;
  }

  :deep(.ad-pagination .btn-prev),
  :deep(.ad-pagination .btn-next) {
    width: 32px !important;
    height: 32px !important;
    color: #94a3b8 !important;
    background: #161b27 !important;
    border: 1px solid #1e2535 !important;
    border-radius: 6px !important;
  }

  :deep(.ad-pagination .el-select .el-input__wrapper) {
    background: #161b27 !important;
    border: 1px solid #1e2535 !important;
    box-shadow: none !important;
  }

  :deep(.ad-pagination .el-select .el-input__inner) {
    font-size: 13px !important;
    color: #94a3b8 !important;
  }

  /* ── Element Plus 全局覆盖（作用域） ── */
  :deep(.el-input__wrapper) {
    background: #1a2030 !important;
    border: 1px solid #2d3a50 !important;
    border-radius: 8px !important;
    box-shadow: none !important;
    transition: border-color 0.2s !important;
  }

  :deep(.el-input__wrapper:hover),
  :deep(.el-input__wrapper.is-focus) {
    border-color: #3b82f6 !important;
  }

  :deep(.el-input__inner) {
    font-size: 13px !important;
    color: #e2e8f0 !important;
    background: transparent !important;
  }

  :deep(.el-input__inner::placeholder) {
    color: #4b5563 !important;
  }

  :deep(.el-select .el-input__wrapper) {
    cursor: pointer;
  }

  :deep(.el-select__placeholder) {
    color: #6b7280 !important;
  }
</style>
