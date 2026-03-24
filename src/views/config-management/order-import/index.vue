<template>
  <div class="oi-page art-full-height">
    <!-- ── 页面标题栏 ──────────────────────────────────── -->
    <div class="page-topbar">
      <div class="topbar-left">
        <div class="breadcrumb">
          <span class="bc-parent">系统管理</span>
          <span class="bc-sep">›</span>
          <span class="bc-current">导入商店订单</span>
        </div>
        <h1 class="page-title">导入商店订单</h1>
      </div>
      <div class="topbar-actions">
        <ElButton round class="btn-import" @click="importVisible = true">
          <ElIcon><Plus /></ElIcon>导入订单
        </ElButton>
        <el-select
          v-model="filterDataSource"
          class="filter-select"
          @change="currentPage = 1"
        >
          <el-option value="" label="数据源 全部" />
          <el-option value="appstore" label="App Store" />
          <el-option value="googleplay" label="Google Play" />
        </el-select>
        <el-select
          v-model="filterStatus"
          class="filter-select"
          @change="currentPage = 1"
        >
          <el-option value="" label="状态 全部" />
          <el-option value="completed" label="已完成" />
          <el-option value="processing" label="处理中" />
          <el-option value="partial" label="部分成功" />
          <el-option value="failed" label="失败" />
        </el-select>
      </div>
    </div>

    <!-- ── KPI 四卡 ────────────────────────────────────── -->
    <div class="kpi-row">
      <div class="kpi-card kpi-card--blue">
        <div class="kpi-label">今日导入任务</div>
        <div class="kpi-value kpi-value--blue">
          {{ kpi.todayTotal }}<span class="kpi-unit">条上传记录</span>
        </div>
      </div>
      <div class="kpi-card kpi-card--teal">
        <div class="kpi-label">已完成</div>
        <div class="kpi-value kpi-value--teal">{{ kpi.completed }}</div>
        <div class="kpi-sub">全部成功</div>
      </div>
      <div class="kpi-card kpi-card--amber">
        <div class="kpi-label">处理中</div>
        <div class="kpi-value kpi-value--amber">{{ kpi.processing }}</div>
        <div class="kpi-sub kpi-sub--loading">
          正在解析...
          <span class="dot-anim">·</span>
          <span class="dot-anim dot-anim--2">·</span>
          <span class="dot-anim dot-anim--3">·</span>
        </div>
      </div>
      <div class="kpi-card kpi-card--red">
        <div class="kpi-label">异常/失败</div>
        <div class="kpi-value kpi-value--red">{{ kpi.failed }}</div>
        <div class="kpi-sub">无异常</div>
      </div>
    </div>

    <!-- ── 表格面板 ────────────────────────────────────── -->
    <div class="table-panel">
      <div class="filter-bar">
        <ElIcon class="filter-icon"><Clock /></ElIcon>
        <span class="filter-title">上传历史</span>
        <span class="filter-count">共 {{ filteredList.length }} 条记录</span>
      </div>

      <el-table
        :data="pagedList"
        class="oi-table"
        style="width: 100%"
        :row-class-name="getRowClass"
      >
        <el-table-column label="任务ID" min-width="100">
          <template #default="{ row }">
            <span class="task-id">{{ row.taskId }}</span>
          </template>
        </el-table-column>

        <el-table-column label="数据源" min-width="140">
          <template #default="{ row }">
            <div class="source-cell">
              <img
                :src="row.dataSource === 'appstore' ? appstoreIcon : googleplayIcon"
                class="source-icon"
                :alt="row.dataSource"
              />
              <span>{{ DATA_SOURCE_LABELS[row.dataSource]?.label }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="uploadTime" label="上传时间" min-width="155" />
        <el-table-column label="总记录数" min-width="100" align="right">
          <template #default="{ row }">{{ row.totalRecords.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="新增导入" min-width="100" align="right">
          <template #default="{ row }">{{ row.newImports.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="重复跳过" min-width="100" align="right">
          <template #default="{ row }">
            <span v-if="row.duplicateSkipped !== null">{{ row.duplicateSkipped.toLocaleString() }}</span>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="失败数" min-width="80" align="right">
          <template #default="{ row }">
            <span v-if="row.failedCount !== null">{{ row.failedCount.toLocaleString() }}</span>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <span :class="['status-badge', `status--${row.status}`]">
              <span v-if="row.status === 'processing'" class="status-spinner" />
              <span v-else class="status-dot" />
              {{ STATUS_CONFIGS[row.status]?.label }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <template v-if="row.status === 'processing'">
                <button class="action-btn action-btn--warn" @click="handlePause(row)">暂停</button>
                <button class="action-btn action-btn--del" @click="handleCancel(row)">取消</button>
              </template>
              <template v-else>
                <button class="action-btn action-btn--view" @click="handleViewReport(row)">
                  查看报告
                </button>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredList.length"
          layout="prev, pager, next, jumper"
          class="oi-pagination"
        />
        <span class="total-text">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      </div>
    </div>

    <!-- ── 导入弹窗 ────────────────────────────────────── -->
    <ImportDialog
      v-model:visible="importVisible"
      @success="handleImportSuccess"
    />

  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { Plus, Clock } from '@element-plus/icons-vue'
  import {
    fetchOrderImportTable,
    fetchOrderImportSummary,
    pauseOrderImport,
    cancelOrderImport
  } from '@/api/config-management'
  import { OrderImportApiSource } from './config/data-source'
  import { cloneTaskList, DATA_SOURCE_LABELS, STATUS_CONFIGS } from './mock/data'
  import ImportDialog from './modules/import-dialog.vue'
  import type { ImportTask } from './types'

  defineOptions({ name: 'OrderImport' })

  const router = useRouter()

  // 图标（用文字替代，实际项目替换为真实图标路径）
  const appstoreIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzFkNmZjZSIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTQuNSAxNGgtOWMtLjgzIDAtMS41LS42Ny0xLjUtMS41VjExaC0xVjloMVY4YzAtMi4yMSAxLjc5LTQgNC00aDFWNmgtMWMtMS4xIDAtMiAuOS0yIDJ2MWg0VjZoMnYzaDF2MmgtMXYzLjVjMCAuODMtLjY3IDEuNS0xLjUgMS41eiIvPjwvc3ZnPg=='
  const googleplayIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzFhOGE0MyIgZD0iTTMgMjAuNVYzLjVjMC0uOTEgMS4wNC0xLjQgMS43NS0uODVsMTUgOC41Yy42OC4zOS42OCEuMzkgMCAxLjM5LjM5bC0xNSA4LjVDNC4wNCAyMS45IDMgMjEuNDEgMyAyMC41eiIvPjwvc3ZnPg=='

  // ─── 数据 ──────────────────────────────────────────────
  const list = ref<ImportTask[]>(cloneTaskList())
  const filterDataSource = ref('')
  const filterStatus = ref('')
  const currentPage = ref(1)
  const pageSize = ref(7)

  // ─── KPI ────────────────────────────────────────────────
  const kpi = computed(() => ({
    todayTotal: 5,
    completed: list.value.filter((r) => r.status === 'completed').length,
    processing: list.value.filter((r) => r.status === 'processing').length,
    failed: list.value.filter((r) => r.status === 'failed').length
  }))

  // ─── 筛选 ───────────────────────────────────────────────
  const filteredList = computed(() => {
    return list.value.filter((row) => {
      if (filterDataSource.value && row.dataSource !== filterDataSource.value) return false
      if (filterStatus.value && row.status !== filterStatus.value) return false
      return true
    })
  })

  const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize.value))

  const pagedList = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredList.value.slice(start, start + pageSize.value)
  })

  const getRowClass = ({ row }: { row: ImportTask }) =>
    row.status === 'processing' ? 'row-processing' : ''

  // ─── 操作 ───────────────────────────────────────────────
  const handleViewReport = (row: ImportTask) => {
    router.push({ name: 'OrderImportReport', params: { taskId: row.taskId } })
  }

  const handlePause = (row: ImportTask) => {
    if (!OrderImportApiSource.pauseImport) {
      pauseOrderImport(row.taskId).catch(() => undefined)
    }
    ElMessage.info(`已暂停任务 ${row.taskId}`)
  }

  const handleCancel = (row: ImportTask) => {
    if (!OrderImportApiSource.cancelImport) {
      cancelOrderImport(row.taskId).catch(() => undefined)
    }
    const idx = list.value.findIndex((r) => r.id === row.id)
    if (idx >= 0) list.value.splice(idx, 1)
    ElMessage.warning(`已取消任务 ${row.taskId}`)
  }

  // ─── 导入弹窗 ───────────────────────────────────────────
  const importVisible = ref(false)

  const handleImportSuccess = (taskId: string) => {
    importVisible.value = false
    router.push({ name: 'OrderImportReport', params: { taskId } })
  }

  const loadImportTable = async () => {
    if (OrderImportApiSource.importTable) return
    try {
      await fetchOrderImportTable({
        page: currentPage.value,
        pageSize: pageSize.value,
        dataSource: filterDataSource.value || undefined,
        status: filterStatus.value || undefined
      })
      await fetchOrderImportSummary()
    } catch {
      // fallback to local mock list
    }
  }

  loadImportTable()
</script>

<style lang="scss" scoped>
  .oi-page {
    --bg-page: #0b1120;
    --bg-card: #131c2e;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;

    position: relative;
    padding: 0 24px 24px;
    overflow-y: auto;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: var(--text-primary);
    background: var(--bg-page);
  }

  // ─── 顶栏 ───────────────────────────────────────────────
  .page-topbar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 20px 0 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 6px;
    font-size: 13px;
  }

  .bc-parent  { color: var(--text-secondary); }
  .bc-sep     { color: var(--text-muted); }
  .bc-current { color: var(--text-secondary); }

  .page-title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
  }

  .topbar-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .btn-import {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 10px 20px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    color: #0b1120 !important;
    background: var(--accent) !important;
    border: none !important;
    border-radius: 8px !important;
    transition: all 0.2s;

    &:hover { filter: brightness(1.1); transform: translateY(-1px); }
  }

  .filter-select {
    width: 120px;

    :deep(.el-select__wrapper) {
      color: var(--text-primary);
      background: var(--bg-card) !important;
      border: 1px solid var(--border) !important;
      border-radius: 8px;
      box-shadow: none !important;

      &:hover { border-color: var(--accent) !important; }
    }
  }

  // ─── KPI ────────────────────────────────────────────────
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .kpi-card {
    padding: 20px 24px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
    border-left: 4px solid;

    &--blue  { border-left-color: #3b82f6; background: linear-gradient(135deg, #131c2e 0%, #0f1e3a 100%); }
    &--teal  { border-left-color: #2dd4bf; }
    &--amber { border-left-color: #f59e0b; }
    &--red   { border-left-color: #ef4444; }
  }

  .kpi-label {
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--text-muted);
  }

  .kpi-value {
    font-size: 36px;
    font-weight: 700;
    line-height: 1;

    &--blue  { color: #60a5fa; }
    &--teal  { color: #2dd4bf; }
    &--amber { color: #f59e0b; }
    &--red   { color: #ef4444; }
  }

  .kpi-unit {
    margin-left: 6px;
    font-size: 13px;
    font-weight: 400;
    color: var(--text-muted);
  }

  .kpi-sub {
    margin-top: 6px;
    font-size: 12px;
    color: var(--text-muted);

    &--loading { color: #f59e0b; display: flex; align-items: center; gap: 1px; }
  }

  .dot-anim {
    animation: dotPulse 1.4s infinite;
    &--2 { animation-delay: 0.2s; }
    &--3 { animation-delay: 0.4s; }
  }

  @keyframes dotPulse {
    0%, 80%, 100% { opacity: 0.2; }
    40% { opacity: 1; }
  }

  // ─── 表格面板 ────────────────────────────────────────────
  .table-panel {
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .filter-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--border);
  }

  .filter-icon {
    color: var(--text-muted);
    font-size: 15px;
  }

  .filter-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .filter-count {
    margin-left: 8px;
    padding: 2px 8px;
    font-size: 12px;
    color: var(--text-muted);
    background: rgb(255 255 255 / 5%);
    border-radius: 10px;
  }

  .oi-table {
    width: 100%;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: #0d1626;
    --el-table-row-hover-bg-color: #162035;
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);

    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 11px 10px;
      font-size: 12px;
      background: #0d1626 !important;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(td.el-table__cell) {
      padding: 10px;
      font-size: 13px;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(tr) { background: transparent !important; }
    :deep(.el-table__inner-wrapper::before) { display: none; }

    :deep(.row-processing td) {
      background: rgb(245 158 11 / 6%) !important;
      border-left: 2px solid #f59e0b;
    }
  }

  .task-id {
    font-family: monospace;
    font-size: 13px;
    color: var(--text-primary);
  }

  .source-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .source-icon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    object-fit: contain;
  }

  .text-muted { color: var(--text-muted); }

  // ── 状态 ────────────────────────────────────────────────
  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 8px;
    font-size: 12px;
    border-radius: 4px;

    &.status--completed  { color: #22c55e; background: rgb(34 197 94 / 12%); }
    &.status--processing { color: #f59e0b; background: rgb(245 158 11 / 12%); }
    &.status--partial    { color: #f59e0b; background: rgb(245 158 11 / 12%); }
    &.status--failed     { color: #ef4444; background: rgb(239 68 68 / 12%); }
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentcolor;
    flex-shrink: 0;
  }

  .status-spinner {
    width: 8px;
    height: 8px;
    border: 1.5px solid currentcolor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  // ── 操作按钮 ────────────────────────────────────────────
  .action-btns {
    display: flex;
    gap: 4px;
    justify-content: center;
  }

  .action-btn {
    padding: 3px 10px;
    font-size: 12px;
    cursor: pointer;
    border: none;
    border-radius: 4px;
    transition: all 0.15s;

    &--view {
      color: var(--accent);
      background: transparent;

      &:hover { color: #fff; background: var(--accent); }
    }

    &--warn {
      color: #f59e0b;
      background: transparent;

      &:hover { color: #0b1120; background: #f59e0b; }
    }

    &--del {
      color: #ef4444;
      background: transparent;

      &:hover { color: #fff; background: #ef4444; }
    }
  }

  // ── 分页 ────────────────────────────────────────────────
  .pagination-bar {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
    padding: 10px 16px;
    border-top: 1px solid var(--border);
  }

  .total-text {
    font-size: 13px;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .oi-pagination {
    :deep(.el-pager li) {
      min-width: 28px;
      height: 28px;
      font-size: 13px;
      line-height: 28px;
      color: var(--text-secondary);
      background: transparent;
      border-radius: 5px;

      &:hover { color: var(--accent); }

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
      border-radius: 5px;

      &:hover {
        color: var(--accent) !important;
        border-color: var(--accent) !important;
      }
    }
  }

  // ── 下拉弹出 ────────────────────────────────────────────
  :deep(.el-select-dropdown) {
    background: #1a2540 !important;
    border: 1px solid var(--border) !important;
  }

  :deep(.el-select-dropdown__item) {
    color: var(--text-secondary) !important;

    &:hover, &.is-hovering {
      color: var(--accent) !important;
      background: rgb(45 212 191 / 8%) !important;
    }

    &.is-selected {
      color: var(--accent) !important;
      background: rgb(45 212 191 / 12%) !important;
    }
  }
</style>
