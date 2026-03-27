<template>
  <div class="optimizer-page art-full-height">
    <!-- ── 页头：面包屑 + 操作栏 ───────────────────────────────── -->
    <div class="page-header">
      <span class="breadcrumb">
        <span class="breadcrumb-parent">系统管理</span>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">优化师管理</span>
      </span>
      <div class="header-actions">
        <el-button class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增优化师
        </el-button>
        <el-button class="btn-export" @click="handleExport">
          <el-icon><Download /></el-icon>导出
        </el-button>
        <el-input
          v-model="filterForm.keyword"
          placeholder="搜索名称/代号"
          class="filter-search"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <span class="header-label">状态</span>
        <el-select v-model="filterForm.status" placeholder="全部" class="filter-status" clearable>
          <el-option label="在职" value="在职" />
          <el-option label="离职" value="离职" />
        </el-select>
      </div>
    </div>

    <!-- ── 统计卡片 ──────────────────────────────────────────────── -->
    <div class="stat-cards">
      <div class="stat-card stat-card--total">
        <div class="stat-card__body">
          <div class="stat-label">优化师总数</div>
          <div class="stat-value teal">{{ stats.total }}<span class="stat-unit">人</span></div>
        </div>
        <el-icon class="stat-icon teal"><TrendCharts /></el-icon>
      </div>
      <div class="stat-card stat-card--active">
        <div class="stat-card__body">
          <div class="stat-label">在职</div>
          <div class="stat-value teal">{{ stats.active }}<span class="stat-unit">人</span></div>
        </div>
        <el-icon class="stat-icon teal"><TrendCharts /></el-icon>
      </div>
      <div class="stat-card stat-card--consume">
        <div class="stat-card__body">
          <div class="stat-label">最低消耗均值</div>
          <div class="stat-value amber">${{ stats.avgConsumption }}</div>
        </div>
        <el-icon class="stat-icon amber"><Right /></el-icon>
      </div>
      <div class="stat-card stat-card--new">
        <div class="stat-card__body">
          <div class="stat-label">本月新增</div>
          <div class="stat-value blue">{{ stats.monthNew }}<span class="stat-unit">人</span></div>
        </div>
        <el-icon class="stat-icon blue"><TrendCharts /></el-icon>
      </div>
    </div>

    <!-- ── 列表卡片 ──────────────────────────────────────────────── -->
    <div class="table-wrapper">
      <div class="table-title">优化师列表</div>
      <el-table
        :data="pagedList"
        class="optimizer-table"
        table-layout="fixed"
        :highlight-current-row="true"
        @row-click="handleRowClick"
      >
        <!-- 序号 -->
        <el-table-column label="序号" width="80" align="center">
          <template #default="{ $index }">
            <span class="col-no">{{ $index + 1 + (currentPage - 1) * pageSize }}</span>
          </template>
        </el-table-column>

        <!-- 名称 -->
        <el-table-column label="名称" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="optimizer-name">
              <div class="avatar" :style="{ background: row.avatarColor }">
                {{ row.userName.charAt(0) }}
              </div>
              <span>{{ row.userName }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 版本号 -->
        <el-table-column label="版本号" min-width="100" align="center">
          <template #default="{ row }">
            <span class="version-badge">v{{ row.version }}</span>
          </template>
        </el-table-column>

        <!-- 代号 -->
        <el-table-column label="代号" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="scode-text">{{ row.sCode }}</span>
          </template>
        </el-table-column>

        <!-- 代号2 -->
        <el-table-column label="代号2" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="scode2-text">{{ row.sCode2 || '–' }}</span>
          </template>
        </el-table-column>

        <!-- 最低消耗要求 -->
        <el-table-column label="最低消耗要求" min-width="100" align="right">
          <template #default="{ row }">
            <span class="consume-text">${{ row.minConsumption.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <!-- 检验码 -->
        <el-table-column label="检验码" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="checkcode-cell">
              <span class="checkcode-text">{{ truncateCode(row.checkCode, 8) }}</span>
              <el-icon class="copy-icon" @click.stop="handleCopy(row.checkCode)"
                ><CopyDocument
              /></el-icon>
            </div>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <span
              :class="[
                'status-badge',
                row.status === '在职' ? 'status--active' : 'status--inactive'
              ]"
            >
              {{ row.status }}
            </span>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-btns">
              <button class="action-btn btn-edit" @click.stop="handleEdit(row)">编辑</button>
              <button class="action-btn btn-detail" @click.stop="handleDetail(row)">详情</button>
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
          :pager-count="5"
          layout="prev, pager, next"
          class="app-pagination"
        />
        <el-select v-model="pageSize" class="page-size-select" @change="currentPage = 1">
          <el-option label="全部" :value="9999" />
          <el-option label="每页 10 条" :value="10" />
          <el-option label="每页 20 条" :value="20" />
          <el-option label="每页 50 条" :value="50" />
        </el-select>
      </div>
    </div>

    <!-- ── 详情抽屉 ─────────────────────────────────────────────── -->
    <OptimizerDetailDrawer v-model:visible="drawerVisible" :data="currentRow" @edit="handleEdit" />

    <!-- ── 新增/编辑弹窗 ──────────────────────────────────────────── -->
    <OptimizerFormDialog
      v-model:visible="formVisible"
      :edit-data="editData"
      :system-users="systemUserOptions"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { Plus, Download, Search, CopyDocument, TrendCharts, Right } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    createOptimizer,
    exportOptimizerList,
    fetchOptimizerMetaSystemUsers,
    fetchOptimizerOverview,
    fetchOptimizerTable,
    updateOptimizer
  } from '@/api/config-management/optimizer-management'
  import { getAppNow } from '@/utils/app-now'
  import OptimizerDetailDrawer from './modules/optimizer-detail-drawer.vue'
  import OptimizerFormDialog from './modules/optimizer-form-dialog.vue'
  import { cloneOptimizerMockList, systemUsers as seedSystemUsers } from './mock/data'
  import type { OptimizerItem, OptimizerFormPayload, SystemUser } from './types'

  defineOptions({ name: 'OptimizerManagement' })

  /** 接口可用时为 true：列表与分页走服务端 */
  const useRemoteTable = ref(false)
  const serverTotal = ref(0)
  const remoteOverview = ref<Api.ConfigManagement.Optimizer.OverviewResponse | null>(null)

  const systemUserOptions = ref<SystemUser[]>([...seedSystemUsers])

  // ─── 筛选 ───────────────────────────────────────────────────────
  const filterForm = reactive({ keyword: '', status: '' })
  const optimizerList = ref<OptimizerItem[]>(cloneOptimizerMockList())

  // ─── 分页 ───────────────────────────────────────────────────────
  const currentPage = ref(1)
  const pageSize = ref(9999)

  // ─── 弹窗状态 ────────────────────────────────────────────────────
  const drawerVisible = ref(false)
  const formVisible = ref(false)
  const currentRow = ref<OptimizerItem | null>(null)
  const editData = ref<OptimizerItem | null>(null)

  const tableRequestSize = () => (pageSize.value >= 9999 ? 5000 : pageSize.value)

  async function refreshOverview() {
    try {
      remoteOverview.value = await fetchOptimizerOverview()
    } catch {
      remoteOverview.value = null
    }
  }

  async function refreshTable() {
    if (!useRemoteTable.value) return
    try {
      const res = await fetchOptimizerTable({
        current: currentPage.value,
        size: tableRequestSize(),
        keyword: filterForm.keyword.trim() || undefined,
        status: filterForm.status || undefined
      })
      optimizerList.value = res.records as OptimizerItem[]
      serverTotal.value = res.total
    } catch {
      useRemoteTable.value = false
      remoteOverview.value = null
      serverTotal.value = 0
      optimizerList.value = cloneOptimizerMockList()
      ElMessage.warning('列表接口不可用，已切换为本地演示数据')
    }
  }

  onMounted(async () => {
    try {
      const users = await fetchOptimizerMetaSystemUsers()
      if (Array.isArray(users) && users.length) {
        systemUserOptions.value = users as SystemUser[]
      }
    } catch {
      /* 使用 seedSystemUsers */
    }

    try {
      const [overview, table] = await Promise.all([
        fetchOptimizerOverview().catch(() => null),
        fetchOptimizerTable({
          current: 1,
          size: tableRequestSize(),
          keyword: undefined,
          status: undefined
        })
      ])
      if (overview) remoteOverview.value = overview
      if (table?.records && Array.isArray(table.records)) {
        useRemoteTable.value = true
        optimizerList.value = table.records as OptimizerItem[]
        serverTotal.value = table.total
        currentPage.value = table.current ?? 1
      }
    } catch {
      /* 保持 Mock */
    }
  })

  // ─── 过滤（仅本地 Mock 模式） ───────────────────────────────────
  const filteredList = computed(() => {
    if (useRemoteTable.value) return optimizerList.value
    const kw = filterForm.keyword.trim().toLowerCase()
    return optimizerList.value.filter((item) => {
      if (
        kw &&
        !item.userName.toLowerCase().includes(kw) &&
        !item.sCode.toLowerCase().includes(kw)
      ) {
        return false
      }
      if (filterForm.status && item.status !== filterForm.status) return false
      return true
    })
  })

  const total = computed(() =>
    useRemoteTable.value ? serverTotal.value : filteredList.value.length
  )

  const pagedList = computed(() => {
    if (useRemoteTable.value) return optimizerList.value
    if (pageSize.value >= 9999) return filteredList.value
    const start = (currentPage.value - 1) * pageSize.value
    return filteredList.value.slice(start, start + pageSize.value)
  })

  watch(
    () => ({ ...filterForm }),
    () => {
      currentPage.value = 1
      if (useRemoteTable.value) {
        void refreshTable()
        void refreshOverview()
      }
    },
    { deep: true }
  )

  watch([currentPage, pageSize], () => {
    if (useRemoteTable.value) void refreshTable()
  })

  // ─── 统计 ───────────────────────────────────────────────────────
  const stats = computed(() => {
    if (remoteOverview.value) {
      return {
        total: remoteOverview.value.total,
        active: remoteOverview.value.active,
        avgConsumption: remoteOverview.value.avgMinConsumption,
        monthNew: remoteOverview.value.monthNew
      }
    }
    const list = optimizerList.value
    const active = list.filter((i) => i.status === '在职')
    const avg = active.length
      ? Math.round(active.reduce((s, i) => s + i.minConsumption, 0) / active.length)
      : 0
    const thisMonth = getAppNow().toISOString().slice(0, 7)
    const monthNew = list.filter((i) => i.createTime.startsWith(thisMonth)).length
    return {
      total: useRemoteTable.value ? serverTotal.value : list.length,
      active: active.length,
      avgConsumption: avg,
      monthNew
    }
  })

  // ─── 操作 ───────────────────────────────────────────────────────
  const handleAdd = () => {
    editData.value = null
    formVisible.value = true
  }

  const handleEdit = (row: OptimizerItem) => {
    editData.value = { ...row }
    formVisible.value = true
    drawerVisible.value = false
  }

  const handleDetail = (row: OptimizerItem) => {
    currentRow.value = row
    drawerVisible.value = true
  }

  const handleRowClick = (row: OptimizerItem) => {
    currentRow.value = row
    drawerVisible.value = true
  }

  const truncateCode = (code: string, keep = 8) => {
    if (code.length <= keep + 2) return code
    return `${code.slice(0, keep)}...${code.slice(-2)}`
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('已复制到剪贴板')
    })
  }

  const exportCsvLocal = () => {
    const rows = useRemoteTable.value ? optimizerList.value : filteredList.value
    const header = ['序号', '名称', '版本号', '代号', '代号2', '最低消耗要求', '检验码', '状态']
    const lines = [header.join(',')]
    rows.forEach((r) => {
      lines.push(
        [
          r.no,
          r.userName,
          `v${r.version}`,
          r.sCode,
          r.sCode2 || '',
          `$${r.minConsumption.toFixed(2)}`,
          r.checkCode,
          r.status
        ].join(',')
      )
    })
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `optimizers_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  }

  const handleExport = async () => {
    if (useRemoteTable.value) {
      try {
        await exportOptimizerList({
          keyword: filterForm.keyword.trim() || undefined,
          status: filterForm.status || undefined
        })
        ElMessage.success('导出请求已提交')
        return
      } catch {
        ElMessage.warning('导出接口不可用，已改为导出当前列表（CSV）')
      }
    }
    exportCsvLocal()
  }

  const handleFormSuccess = async (payload: OptimizerFormPayload) => {
    const user = systemUserOptions.value.find((u) => u.id === payload.userId)
    const now = getAppNow().toISOString().slice(0, 16).replace('T', ' ')

    if (useRemoteTable.value) {
      try {
        if (payload.id) {
          await updateOptimizer({ ...payload, id: payload.id })
          ElMessage.success('保存成功')
        } else {
          await createOptimizer(payload)
          ElMessage.success('新增成功')
        }
        await Promise.all([refreshTable(), refreshOverview()])
        formVisible.value = false
        editData.value = null
        return
      } catch {
        ElMessage.warning('服务端保存失败，已改为仅更新本地演示数据')
        useRemoteTable.value = false
        remoteOverview.value = null
      }
    }

    if (payload.id) {
      const idx = optimizerList.value.findIndex((i) => i.id === payload.id)
      if (idx >= 0) {
        optimizerList.value[idx] = {
          ...optimizerList.value[idx],
          ...payload,
          userName: user?.userName ?? optimizerList.value[idx].userName,
          email: user?.email ?? optimizerList.value[idx].email,
          avatarColor: user?.avatarColor ?? optimizerList.value[idx].avatarColor,
          lastModifyTime: now
        }
        if (currentRow.value?.id === payload.id) {
          currentRow.value = optimizerList.value[idx]
        }
      }
      ElMessage.success('保存成功')
    } else {
      const maxNo = optimizerList.value.reduce((m, i) => Math.max(m, i.no), 0)
      const newItem: OptimizerItem = {
        id: `opt${Date.now()}`,
        no: maxNo + 1,
        userId: payload.userId,
        userName: user?.userName ?? '',
        email: user?.email ?? '',
        avatarColor: user?.avatarColor ?? '#2dd4bf',
        version: payload.version,
        sCode: payload.sCode,
        sCode2: payload.sCode2,
        minConsumption: payload.minConsumption,
        checkCode: payload.checkCode,
        status: payload.status,
        apps: [],
        recentLogs: [],
        createTime: now.slice(0, 10),
        lastModifyTime: now
      }
      optimizerList.value.unshift(newItem)
      ElMessage.success('新增成功')
    }
    formVisible.value = false
    editData.value = null
  }
</script>

<style lang="scss" scoped>
  .optimizer-page {
    --bg-page: #0b1120;
    --bg-card: #131c2e;
    --bg-header: #0f1829;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;
    --accent-dim: rgb(45 212 191 / 12%);
    --blue: #60a5fa;
    --blue-dim: rgb(96 165 250 / 12%);
    --amber: #f59e0b;
    --amber-dim: rgb(245 158 11 / 12%);
    --green: #22c55e;
    --green-dim: rgb(34 197 94 / 12%);
    --red: #ef4444;
    --red-dim: rgb(239 68 68 / 12%);

    position: relative;
    min-height: 100vh;
    padding: 0 24px 24px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: var(--text-primary);
    background: var(--bg-page);
  }

  // ─── 页头 ───────────────────────────────────────────────────────
  .page-header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0 16px;
  }

  .breadcrumb {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
    align-items: center;
    font-size: 20px;
    font-weight: 600;
  }

  .breadcrumb-parent {
    font-size: 16px;
    font-weight: 400;
    color: var(--text-secondary);
  }

  .breadcrumb-sep {
    font-size: 16px;
    color: var(--text-muted);
  }

  .breadcrumb-current {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .header-actions {
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
    align-items: center;
  }

  .header-label {
    font-size: 13px;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .btn-add {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 8px 16px !important;
    font-weight: 600 !important;
    color: #0b1120 !important;
    white-space: nowrap;
    background: var(--accent) !important;
    border: none !important;
    border-radius: 8px !important;
    transition: all 0.2s;

    &:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
  }

  .btn-export {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 8px 14px !important;
    color: var(--text-secondary) !important;
    white-space: nowrap;
    background: transparent !important;
    border: 1px solid var(--border) !important;
    border-radius: 8px !important;
    transition: all 0.2s;

    &:hover {
      color: var(--accent) !important;
      border-color: var(--accent) !important;
    }
  }

  .filter-search {
    width: 180px;

    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      border-radius: 7px;
      box-shadow: none !important;

      &:hover,
      &:focus-within {
        border-color: var(--accent) !important;
      }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: var(--text-primary);
    }

    :deep(.el-input__prefix) {
      color: var(--text-muted);
    }
  }

  .filter-status {
    width: 90px;

    :deep(.el-select__wrapper) {
      color: var(--text-primary);
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      border-radius: 7px;
      box-shadow: none !important;
    }
  }

  // ─── 统计卡片 ────────────────────────────────────────────────────
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 18px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 24px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
  }

  .stat-card__body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .stat-label {
    font-size: 13px;
    color: var(--text-muted);
  }

  .stat-value {
    display: flex;
    gap: 4px;
    align-items: baseline;
    font-size: 32px;
    font-weight: 700;

    &.teal {
      color: var(--accent);
    }

    &.amber {
      color: var(--amber);
    }

    &.blue {
      color: var(--blue);
    }
  }

  .stat-unit {
    font-size: 15px;
    font-weight: 400;
  }

  .stat-icon {
    font-size: 32px;
    opacity: 0.5;

    &.teal {
      color: var(--accent);
    }

    &.amber {
      color: var(--amber);
    }

    &.blue {
      color: var(--blue);
    }
  }

  // ─── 表格 ────────────────────────────────────────────────────────
  .table-wrapper {
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
  }

  .table-title {
    padding: 16px 20px 14px;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
  }

  .optimizer-table {
    width: 100%;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: #0f1829;
    --el-table-row-hover-bg-color: rgb(45 212 191 / 5%);
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);

    cursor: pointer;
    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 12px;
      font-size: 13px;
      font-weight: 500;
      background: #0f1829 !important;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(td.el-table__cell) {
      padding: 12px;
      font-size: 13px;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(tr) {
      background: transparent !important;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }

    :deep(.current-row td) {
      background: rgb(45 212 191 / 6%) !important;
      border-left: 2px solid var(--accent);
    }
  }

  .col-no {
    font-size: 13px;
    color: var(--text-muted);
  }

  .optimizer-name {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    border-radius: 50%;
  }

  .version-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    background: rgb(255 255 255 / 8%);
    border-radius: 4px;
  }

  .scode-text {
    font-size: 13px;
    color: var(--accent);
  }

  .scode2-text {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .consume-text {
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);
  }

  .checkcode-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .checkcode-text {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .copy-icon {
    flex-shrink: 0;
    font-size: 14px;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
      color: var(--accent);
    }
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 20px;

    &.status--active {
      color: var(--green);
      background: var(--green-dim);
    }

    &.status--inactive {
      color: var(--red);
      background: var(--red-dim);
    }
  }

  .action-btns {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
  }

  .action-btn {
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    background: transparent;
    border: 1px solid;
    border-radius: 20px;
    transition: all 0.15s;

    &.btn-edit {
      color: var(--accent);
      border-color: var(--accent);

      &:hover {
        background: var(--accent-dim);
      }
    }

    &.btn-detail {
      color: var(--text-secondary);
      border-color: rgb(255 255 255 / 15%);

      &:hover {
        color: var(--text-primary);
        border-color: var(--text-secondary);
      }
    }
  }

  // ─── 分页 ────────────────────────────────────────────────────────
  .pagination-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    padding: 12px 16px;
    border-top: 1px solid var(--border);
  }

  .pagination-total {
    margin-right: auto;
    font-size: 13px;
    color: var(--text-muted);
  }

  .page-size-select {
    width: 90px;

    :deep(.el-select__wrapper) {
      font-size: 12px;
      color: var(--text-secondary);
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      box-shadow: none !important;
    }
  }

  .app-pagination {
    :deep(.el-pager li) {
      min-width: 30px;
      height: 30px;
      font-size: 13px;
      line-height: 30px;
      color: var(--text-secondary);
      background: transparent;
      border-radius: 6px;

      &:hover {
        color: var(--accent);
      }

      &.is-active {
        font-weight: 700;
        color: #0b1120;
        background: var(--accent);
      }
    }

    :deep(.btn-prev),
    :deep(.btn-next) {
      color: var(--text-secondary) !important;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      border-radius: 6px;

      &:hover {
        color: var(--accent) !important;
        border-color: var(--accent) !important;
      }
    }
  }

  // ─── Element Plus 下拉覆盖 ───────────────────────────────────────
  :deep(.el-select-dropdown) {
    background: #1a2540 !important;
    border: 1px solid var(--border) !important;
  }

  :deep(.el-select-dropdown__item) {
    color: var(--text-secondary) !important;

    &:hover,
    &.is-hovering {
      color: var(--accent) !important;
      background: rgb(45 212 191 / 8%) !important;
    }

    &.is-selected {
      color: var(--accent) !important;
      background: rgb(45 212 191 / 12%) !important;
    }
  }
</style>
