<template>
  <div class="app-assignment-page art-full-height">
    <!-- ── 页面头部 ────────────────────────────────────────── -->
    <div class="page-header">
      <div class="breadcrumb">
        <span class="bc-parent">系统配置</span>
        <span class="bc-sep">›</span>
        <span class="bc-current">应用分配</span>
      </div>
      <div class="page-header__toolbar">
        <div class="header-title">应用分配</div>
        <div class="header-actions">
          <ElButton round class="btn-add" @click="handleAdd">
            <ElIcon><Plus /></ElIcon>新建分配
          </ElButton>
          <ElButton round class="btn-export" @click="handleExport">
            <ElIcon><Download /></ElIcon>导出
          </ElButton>
        </div>
      </div>
    </div>

    <!-- ── 统计卡片 ───────────────────────────────────────── -->
    <div class="stat-cards">
      <div class="stat-card stat-card--total">
        <div class="stat-label">总分配数</div>
        <div class="stat-value">{{ stats.total }}</div>
      </div>
      <div class="stat-card stat-card--active">
        <div class="stat-label">活跃分配</div>
        <div class="stat-value">{{ stats.active }}</div>
      </div>
      <div class="stat-card stat-card--unassigned">
        <div class="stat-label">未分配应用</div>
        <div class="stat-value">{{ stats.unassigned }}</div>
      </div>
      <div class="stat-card stat-card--optimizer">
        <div class="stat-label">优化师数</div>
        <div class="stat-value">{{ stats.optimizerCount }}</div>
      </div>
    </div>

    <!-- ── 筛选栏 ─────────────────────────────────────────── -->
    <div class="filter-bar">
      <el-input
        v-model="filterForm.keyword"
        placeholder="搜索应用名称 / 优化师..."
        class="filter-search"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <div class="filter-selects">
        <el-select
          v-model="filterForm.platform"
          class="filter-select"
          clearable
          placeholder="平台：全部"
        >
          <el-option label="Android（安卓）" value="Android" />
          <el-option label="iOS" value="iOS" />
        </el-select>
        <el-select
          v-model="filterForm.adPlatform"
          class="filter-select"
          clearable
          placeholder="广告平台：全部"
        >
          <el-option
            v-for="opt in adPlatformOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-select
          v-model="filterForm.optimizer"
          class="filter-select"
          clearable
          placeholder="优化师：全部"
        >
          <el-option
            v-for="opt in optimizerOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-select
          v-model="filterForm.status"
          class="filter-select"
          clearable
          placeholder="状态：全部"
        >
          <el-option label="活跃" value="活跃" />
          <el-option label="草稿配置" value="草稿配置" />
          <el-option label="已归档" value="已归档" />
        </el-select>
      </div>
    </div>

    <!-- ── 数据表格 ───────────────────────────────────────── -->
    <div class="table-wrapper">
      <el-table
        v-loading="tableLoading"
        :data="tableRecords"
        class="assignment-table"
        style="width: 100%"
        :row-class-name="rowClass"
        @row-click="handleRowClick"
      >
        <el-table-column label="应用名称" min-width="20%" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="app-name-cell">
              <div class="app-icon-sm" :style="{ background: row.iconColor }">
                {{ row.appName.charAt(0) }}
              </div>
              <span class="app-name-text">{{ row.appName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="平台" min-width="10%" align="center">
          <template #default="{ row }">
            <span
              :class="[
                'platform-badge',
                row.platform === 'Android' ? 'platform-badge--android' : 'platform-badge--ios'
              ]"
            >
              {{ row.platform === 'Android' ? '安卓' : 'iOS' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="广告平台" min-width="14%" prop="adPlatform" show-overflow-tooltip />
        <el-table-column label="优化师" min-width="12%" prop="optimizer" show-overflow-tooltip />
        <el-table-column label="绩效配置版本" min-width="15%">
          <template #default="{ row }">
            <span :class="['version-badge', versionBadgeClass(row)]">
              {{ row.configVersionLabel }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="assignTime" label="分配时间" min-width="13%" align="center" />
        <el-table-column label="状态" min-width="12%" align="center">
          <template #default="{ row }">
            <span :class="['status-badge', statusClass(row.status)]">
              <span class="status-dot" />{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <button class="edit-btn" @click.stop="handleEdit(row)">编辑</button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-bar">
        <span class="page-total">共 {{ tableTotal }} 条</span>
        <el-select v-model="pageSize" class="page-size-select" @change="handlePageSizeChange">
          <el-option label="每页 20 条" :value="20" />
          <el-option label="每页 50 条" :value="50" />
        </el-select>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="tableTotal"
          layout="prev, pager, next"
          class="app-pagination"
        />
      </div>
    </div>

    <!-- ── 右侧详情抽屉 ──────────────────────────────────── -->
    <AssignmentDetailDrawer
      v-model:visible="drawerVisible"
      :assignment="currentAssignment"
      @edit="handleEdit"
      @view-logs="handleViewLogs"
    />

    <!-- ── 新建/编辑弹窗 ─────────────────────────────────── -->
    <AssignmentFormDialog
      v-model:visible="formVisible"
      :edit-data="editData"
      :ad-platform-options="metaFilter.adPlatformOptions"
      :optimizer-options="metaFilter.optimizerOptions"
      :assignable-apps="assignableAppOptions"
      :load-versions="loadPerformanceVersions"
      @success="handleFormSuccess"
    />

    <!-- ── 变更记录弹窗 ───────────────────────────────────── -->
    <ChangeLogDialog v-model:visible="logVisible" :assignment="logAssignment" />
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch, onMounted } from 'vue'
  import { Plus, Download, Search } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    createAppAssignment,
    exportAppAssignmentList,
    fetchAppAssignmentDetail,
    fetchAppAssignmentMetaAssignableApps,
    fetchAppAssignmentMetaFilterOptions,
    fetchAppAssignmentMetaPerformanceVersions,
    fetchAppAssignmentOverview,
    fetchAppAssignmentTable,
    updateAppAssignment
  } from '@/api/config-management/app-assignment'
  import AssignmentDetailDrawer from './modules/assignment-detail-drawer.vue'
  import AssignmentFormDialog from './modules/assignment-form-dialog.vue'
  import ChangeLogDialog from './modules/change-log-dialog.vue'
  import type {
    AppAssignmentItem,
    AppAssignmentMetaFilterResponse,
    AppAssignmentOverviewResponse,
    AppAssignableAppMetaItem,
    AssignmentAssignableSelectOption,
    AssignmentFormModel,
    AssignmentStatus
  } from './types'

  defineOptions({ name: 'AppAssignment' })

  // ─── 筛选 ────────────────────────────────────────────────
  const filterForm = reactive({
    keyword: '',
    platform: '',
    adPlatform: '',
    optimizer: '',
    status: ''
  })

  const currentPage = ref(1)
  const pageSize = ref(20)
  const tableLoading = ref(false)
  const tableRecords = ref<AppAssignmentItem[]>([])
  const tableTotal = ref(0)
  const overview = ref<AppAssignmentOverviewResponse | null>(null)

  const metaFilter = reactive<AppAssignmentMetaFilterResponse>({
    adPlatformOptions: [],
    optimizerOptions: []
  })
  const assignableAppsRaw = ref<AppAssignableAppMetaItem[]>([])

  const assignableAppOptions = computed<AssignmentAssignableSelectOption[]>(() =>
    assignableAppsRaw.value.map((a) => ({
      label: `${a.appName}（${a.platform === 'Android' ? '安卓' : 'iOS'}）`,
      value: a.appId,
      appName: a.appName,
      iconColor: a.iconColor
    }))
  )

  const adPlatformOptions = computed(() => metaFilter.adPlatformOptions)
  const optimizerOptions = computed(() => metaFilter.optimizerOptions)

  // ─── 统计卡片（与 overview 契约一致）──────────────────────
  const stats = computed(() => {
    if (overview.value) {
      return {
        total: overview.value.total,
        active: overview.value.active,
        unassigned: overview.value.unassigned,
        optimizerCount: overview.value.optimizerCount
      }
    }
    return {
      total: tableTotal.value,
      active: 0,
      unassigned: 0,
      optimizerCount: 0
    }
  })

  async function loadOverview() {
    try {
      overview.value = await fetchAppAssignmentOverview()
    } catch {
      overview.value = null
    }
  }

  async function loadTable() {
    tableLoading.value = true
    try {
      const res = await fetchAppAssignmentTable({
        current: currentPage.value,
        size: pageSize.value,
        keyword: filterForm.keyword.trim() || undefined,
        platform: filterForm.platform || undefined,
        source: filterForm.adPlatform || undefined,
        optimizer: filterForm.optimizer || undefined,
        status: filterForm.status || undefined
      })
      tableRecords.value = Array.isArray(res.records) ? res.records : []
      tableTotal.value = Number(res.total ?? 0)
    } catch {
      tableRecords.value = []
      tableTotal.value = 0
    } finally {
      tableLoading.value = false
    }
  }

  async function loadMeta() {
    try {
      const [filterRes, appsRes] = await Promise.all([
        fetchAppAssignmentMetaFilterOptions(),
        fetchAppAssignmentMetaAssignableApps()
      ])
      metaFilter.adPlatformOptions = filterRes.adPlatformOptions ?? []
      metaFilter.optimizerOptions = filterRes.optimizerOptions ?? []
      assignableAppsRaw.value = appsRes.apps ?? []
    } catch {
      metaFilter.adPlatformOptions = []
      metaFilter.optimizerOptions = []
      assignableAppsRaw.value = []
    }
  }

  function loadPerformanceVersions(appId: string) {
    return fetchAppAssignmentMetaPerformanceVersions({ appId }).then((r) => r.versions ?? [])
  }

  function handlePageSizeChange() {
    currentPage.value = 1
  }

  watch(
    () => ({ ...filterForm }),
    () => {
      const wasPage = currentPage.value
      currentPage.value = 1
      if (wasPage === 1) void loadTable()
    },
    { deep: true }
  )

  watch([currentPage, pageSize], () => {
    void loadTable()
  })

  onMounted(async () => {
    await loadMeta()
    await Promise.all([loadOverview(), loadTable()])
  })

  // ─── 弹窗 / 抽屉状态 ────────────────────────────────────
  const drawerVisible = ref(false)
  const formVisible = ref(false)
  const logVisible = ref(false)
  const currentAssignment = ref<AppAssignmentItem | null>(null)
  const editData = ref<AppAssignmentItem | null>(null)
  const logAssignment = ref<AppAssignmentItem | null>(null)

  // ─── 样式辅助 ────────────────────────────────────────────
  const rowClass = ({ row }: { row: AppAssignmentItem }) =>
    currentAssignment.value?.id === row.id
      ? 'assignment-row assignment-row--active'
      : 'assignment-row'

  const statusClass = (status: AssignmentStatus) =>
    ({
      活跃: 'status-badge--active',
      草稿配置: 'status-badge--draft',
      已归档: 'status-badge--archived'
    })[status] ?? ''

  const versionBadgeClass = (row: AppAssignmentItem) => {
    const ver = row.availableVersions.find((v) => v.id === row.configVersionId)
    if (!ver) return ''
    if (ver.status === '草稿') return 'version-badge--draft'
    if (ver.status === '已归档') return 'version-badge--archived'
    return 'version-badge--published'
  }

  // ─── 事件处理 ────────────────────────────────────────────
  const handleRowClick = async (row: AppAssignmentItem) => {
    currentAssignment.value = row
    drawerVisible.value = true
    try {
      const detail = await fetchAppAssignmentDetail({ id: row.id })
      if (detail) currentAssignment.value = detail
    } catch {
      currentAssignment.value = row
    }
  }

  const handleAdd = () => {
    editData.value = null
    formVisible.value = true
  }

  const handleEdit = (row: AppAssignmentItem) => {
    editData.value = row
    formVisible.value = true
    drawerVisible.value = false
  }

  const handleViewLogs = (row: AppAssignmentItem) => {
    logAssignment.value = row
    logVisible.value = true
  }

  const handleFormSuccess = async (payload: AssignmentFormModel) => {
    try {
      if (editData.value) {
        await updateAppAssignment({ ...payload, id: editData.value.id })
        ElMessage.success('保存成功')
      } else {
        await createAppAssignment(payload)
        ElMessage.success('分配已创建')
      }
      formVisible.value = false
      editData.value = null
      await Promise.all([loadOverview(), loadTable()])
    } catch {
      /* request 层已提示 */
    }
  }

  const handleExport = async () => {
    try {
      await exportAppAssignmentList({
        keyword: filterForm.keyword.trim() || undefined,
        platform: filterForm.platform || undefined,
        source: filterForm.adPlatform || undefined,
        optimizer: filterForm.optimizer || undefined,
        status: filterForm.status || undefined
      })
      ElMessage.success('导出成功')
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : '导出失败')
    }
  }
</script>

<style lang="scss" scoped>
  .app-assignment-page {
    --bg-page: #0b1120;
    --bg-card: #131c2e;
    --bg-row: #0f1829;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;
    --accent-dim: rgb(45 212 191 / 12%);
    --android-green: #22c55e;
    --ios-blue: #60a5fa;
    --amber: #f59e0b;
    --red: #ef4444;

    position: relative;
    min-height: 100vh;
    padding: 0 24px 24px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: var(--text-primary);
    background: var(--bg-page);
  }

  // ─── 页面头部 ───────────────────────────────────────────
  .page-header {
    padding: 18px 0 16px;
  }

  .breadcrumb {
    display: flex;
    gap: 5px;
    align-items: center;
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .page-header__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: center;
    justify-content: space-between;
  }

  .bc-parent {
    color: var(--text-secondary);
  }

  .bc-sep {
    color: var(--text-muted);
  }

  .bc-current {
    font-weight: 500;
    color: var(--text-primary);
  }

  .header-title {
    flex: 1;
    min-width: 0;
    margin-bottom: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .header-actions {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
  }

  .btn-add {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 16px !important;
    font-weight: 600 !important;
    color: #0b1120 !important;
    background: var(--accent) !important;
    border: none !important;
    border-radius: 8px !important;

    &:hover {
      filter: brightness(1.1);
    }
  }

  .btn-export {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 16px !important;
    color: var(--text-secondary) !important;
    background: transparent !important;
    border: 1px solid var(--border) !important;
    border-radius: 8px !important;

    &:hover {
      color: var(--accent) !important;
      border-color: var(--accent) !important;
    }
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
      border-radius: 10px 0 0 10px;
    }

    &--total::before {
      background: var(--accent);
    }

    &--active::before {
      background: var(--android-green);
    }

    &--unassigned::before {
      background: var(--amber);
    }

    &--optimizer::before {
      background: var(--ios-blue);
    }
  }

  .stat-label {
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .stat-value {
    font-size: 32px;
    font-weight: 700;

    .stat-card--total & {
      color: var(--accent);
    }

    .stat-card--active & {
      color: var(--android-green);
    }

    .stat-card--unassigned & {
      color: var(--amber);
    }

    .stat-card--optimizer & {
      color: var(--ios-blue);
    }
  }

  // ─── 筛选栏 ─────────────────────────────────────────────
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .filter-search {
    width: 220px;

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

  .filter-selects {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .filter-select {
    width: 130px;

    :deep(.el-select__wrapper) {
      font-size: 12px;
      color: var(--text-primary);
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      border-radius: 7px;
      box-shadow: none !important;

      &:hover {
        border-color: var(--accent) !important;
      }
    }
  }

  // ─── 表格 ──────────────────────────────────────────────
  .table-wrapper {
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .assignment-table {
    --el-table-bg-color: transparent;
    --el-table-header-bg-color: #0f1829;
    --el-table-row-hover-bg-color: #162035;
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-border: 1px solid var(--border);

    cursor: pointer;
    background: transparent !important;

    /* 固定表格算法，按列 min-width 比例铺满整行，避免窄列过挤、宽列过空 */
    :deep(.el-table__body),
    :deep(.el-table__header) {
      width: 100% !important;
      table-layout: fixed;
    }

    :deep(th.el-table__cell) {
      padding: 11px 10px;
      font-size: 12px;
      font-weight: 500;
      background: #0f1829 !important;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(td.el-table__cell) {
      padding: 10px;
      font-size: 13px;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(tr) {
      background: transparent !important;
    }

    :deep(.assignment-row--active td) {
      background: rgb(45 212 191 / 5%) !important;
      border-left: 2px solid var(--accent);
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }
  }

  .app-name-cell {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .app-icon-sm {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    border-radius: 6px;
  }

  .app-name-text {
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .platform-badge {
    display: inline-block;
    padding: 2px 7px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;

    &--android {
      color: var(--android-green);
      background: rgb(34 197 94 / 12%);
    }

    &--ios {
      color: var(--ios-blue);
      background: rgb(96 165 250 / 12%);
    }
  }

  .version-badge {
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 4px;

    &--published {
      color: var(--accent);
      background: var(--accent-dim);
    }

    &--draft {
      color: var(--amber);
      background: rgb(245 158 11 / 12%);
    }

    &--archived {
      color: var(--text-muted);
      background: rgb(255 255 255 / 5%);
    }
  }

  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;

    &--active {
      color: #22c55e;
      background: rgb(34 197 94 / 12%);

      .status-dot {
        background: #22c55e;
      }
    }

    &--draft {
      color: var(--amber);
      background: rgb(245 158 11 / 12%);

      .status-dot {
        background: var(--amber);
      }
    }

    &--archived {
      color: var(--text-muted);
      background: rgb(255 255 255 / 5%);

      .status-dot {
        background: var(--text-muted);
      }
    }
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .edit-btn {
    padding: 3px 10px;
    font-size: 12px;
    color: var(--accent);
    cursor: pointer;
    background: var(--accent-dim);
    border: 1px solid rgb(45 212 191 / 20%);
    border-radius: 5px;
    transition: all 0.15s;

    &:hover {
      background: rgb(45 212 191 / 18%);
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

  .page-total {
    font-size: 12px;
    color: var(--text-muted);
  }

  .page-size-select {
    width: 110px;

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

  // ─── Element Plus 全局覆盖 ──────────────────────────────
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
