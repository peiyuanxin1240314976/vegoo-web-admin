<template>
  <div class="application-management-page art-full-height">
    <!-- 面包屑 + 操作 -->
    <div class="page-header">
      <span class="breadcrumb">
        <span class="breadcrumb-parent">{{ t('menus.configManagement.title') }}</span>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">{{
          t('menus.configManagement.applicationManagement')
        }}</span>
      </span>
      <div class="header-actions">
        <ElButton round class="btn-add" @click="handleAdd">
          <ElIcon><Plus /></ElIcon>新增应用
        </ElButton>
        <ElButton round class="btn-export" @click="handleExport">
          <ElIcon><Download /></ElIcon>导出
        </ElButton>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="filterForm.keyword"
        placeholder="搜索应用名称或ID"
        class="filter-search"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <div class="filter-selects">
        <span class="filter-label">类别</span>
        <el-select v-model="filterForm.category" placeholder="全部" class="filter-select" clearable>
          <el-option
            v-for="opt in categoryOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <span class="filter-label">平台</span>
        <el-select v-model="filterForm.platform" placeholder="全部" class="filter-select" clearable>
          <el-option label="Android" value="Android" />
          <el-option label="iOS" value="iOS" />
        </el-select>
        <span class="filter-label">状态</span>
        <el-select v-model="filterForm.status" placeholder="全部" class="filter-select" clearable>
          <el-option label="正常" value="正常" />
          <el-option label="禁用" value="禁用" />
        </el-select>
        <span class="filter-label">创建人</span>
        <el-select v-model="filterForm.creator" placeholder="全部" class="filter-select" clearable>
          <el-option
            v-for="opt in creatorOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card stat-card--total">
        <div class="stat-label">应用总数</div>
        <div class="stat-value">{{ stats.total }}<span class="stat-unit">个</span></div>
      </div>
      <div class="stat-card stat-card--ios">
        <div class="stat-label">iOS应用</div>
        <div class="stat-value">{{ stats.ios }}<span class="stat-unit">个</span></div>
      </div>
      <div class="stat-card stat-card--android">
        <div class="stat-label">Android应用</div>
        <div class="stat-value">{{ stats.android }}<span class="stat-unit">个</span></div>
      </div>
      <div class="stat-card stat-card--pending">
        <div class="stat-label">待处理</div>
        <div class="stat-value">
          {{ stats.pending }}<span class="stat-unit">个</span>
          <span class="stat-badge">需关注</span>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <el-table
        :data="filteredTableData"
        class="app-table"
        row-class-name="app-table-row"
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="ID" min-width="110" />
        <el-table-column prop="appName" label="应用名" min-width="120" />
        <el-table-column label="图标" width="70">
          <template #default="{ row }">
            <div class="app-icon" :style="{ background: row.iconColor }">
              {{ row.appName.charAt(0) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="平台" width="110">
          <template #default="{ row }">
            <span
              :class="[
                'platform-badge',
                row.platform === 'Android' ? 'platform-badge--android' : 'platform-badge--ios'
              ]"
            >
              <span class="platform-dot" />{{ row.platform }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="bundleId" label="Bundle ID" min-width="200" show-overflow-tooltip />
        <el-table-column prop="packageId" label="软件包ID" min-width="200" show-overflow-tooltip />
        <el-table-column prop="shortName" label="应用简称" width="90" />
        <el-table-column prop="category" label="类别" width="90" />
        <el-table-column prop="timezone" label="报表时区" width="90" />
        <el-table-column prop="priority" label="优先级" width="80" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <span
              :class="[
                'status-badge',
                row.status === '正常' ? 'status-badge--normal' : 'status-badge--disabled'
              ]"
            >
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="80" />
        <el-table-column prop="createTime" label="创建时间" width="110" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <button class="action-btn action-btn--edit" @click.stop="handleEdit(row)">
                <el-icon><EditPen /></el-icon>编辑
              </button>
              <button class="action-btn action-btn--delete" @click.stop="handleDelete(row)">
                <el-icon><Delete /></el-icon>删除
              </button>
              <button class="action-btn action-btn--view" @click.stop="handleView(row)">
                <el-icon><View /></el-icon>查看
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-bar">
        <span class="pagination-total">共 {{ total }} 条</span>
        <el-select v-model="pageSize" class="page-size-select" @change="handlePageSizeChange">
          <el-option label="每页 10 条" :value="10" />
          <el-option label="每页 20 条" :value="20" />
          <el-option label="每页 50 条" :value="50" />
        </el-select>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          class="app-pagination"
          @current-change="handlePageChange"
        />
        <span class="pagination-jumper">
          跳转至
          <el-input v-model="jumpPage" class="jumper-input" @keyup.enter="handleJump" />
          页
        </span>
      </div>
    </div>

    <!-- 右侧详情抽屉（子组件内包含遮罩与动画） -->
    <AppDetailDrawer
      v-model:visible="drawerVisible"
      :app-data="currentApp"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- 新增/编辑弹窗 -->
    <AppFormDialog
      v-model:visible="formVisible"
      :edit-data="editData"
      @success="handleFormSuccess"
    />

    <!-- 删除确认弹窗 -->
    <AppDeleteDialog
      v-model:visible="deleteVisible"
      :app-data="deleteData"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { Plus, Download, Search, EditPen, Delete, View } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import AppDetailDrawer from './modules/app-detail-drawer.vue'
  import AppFormDialog from './modules/app-form-dialog.vue'
  import AppDeleteDialog from './modules/app-delete-dialog.vue'
  import {
    applicationMockList,
    applicationCategoryOptions,
    applicationCreatorOptions
  } from './mock/data'
  import type { ApplicationAppItem } from './types'

  defineOptions({ name: 'ApplicationManagement' })

  const { t } = useI18n()

  /** 筛选（后续可对接 meta-filter-options） */
  const filterForm = reactive({
    keyword: '',
    category: '',
    platform: '',
    status: '',
    creator: ''
  })

  const currentPage = ref(1)
  const pageSize = ref(20)
  const jumpPage = ref('')
  const total = ref(42)
  const drawerVisible = ref(false)
  const formVisible = ref(false)
  const deleteVisible = ref(false)
  const currentApp = ref<ApplicationAppItem | null>(null)
  const editData = ref<ApplicationAppItem | null>(null)
  const deleteData = ref<ApplicationAppItem | null>(null)

  const stats = reactive({ total: 42, ios: 18, android: 24, pending: 3 })

  const categoryOptions = applicationCategoryOptions
  const creatorOptions = applicationCreatorOptions

  const filteredTableData = computed(() => {
    return applicationMockList.filter((item) => {
      const kw = filterForm.keyword.toLowerCase()
      if (kw && !item.id.toLowerCase().includes(kw) && !item.appName.toLowerCase().includes(kw)) {
        return false
      }
      if (filterForm.category && item.category !== filterForm.category) return false
      if (filterForm.platform && item.platform !== filterForm.platform) return false
      if (filterForm.status && item.status !== filterForm.status) return false
      if (filterForm.creator && item.creator !== filterForm.creator) return false
      return true
    })
  })

  const handleAdd = () => {
    editData.value = null
    formVisible.value = true
  }

  const handleEdit = (row: ApplicationAppItem) => {
    editData.value = { ...row }
    formVisible.value = true
    drawerVisible.value = false
  }

  const handleDelete = (row: ApplicationAppItem) => {
    deleteData.value = row
    deleteVisible.value = true
  }

  const handleView = (row: ApplicationAppItem) => {
    currentApp.value = row
    drawerVisible.value = true
  }

  const handleRowClick = (row: ApplicationAppItem) => {
    currentApp.value = row
    drawerVisible.value = true
  }

  const handleExport = () => {
    ElMessage.success('导出成功')
  }

  const handlePageChange = (page: number) => {
    currentPage.value = page
  }

  const handlePageSizeChange = () => {
    currentPage.value = 1
  }

  const handleJump = () => {
    const p = parseInt(jumpPage.value, 10)
    if (p > 0) {
      currentPage.value = p
      jumpPage.value = ''
    }
  }

  const handleFormSuccess = () => {
    formVisible.value = false
    ElMessage.success('操作成功')
  }

  const handleDeleteConfirm = () => {
    deleteVisible.value = false
    ElMessage.success('删除成功')
    if (drawerVisible.value) drawerVisible.value = false
  }
</script>

<style lang="scss" scoped>
  // ─── CSS 变量 ───────────────────────────────────────────
  .application-management-page {
    --bg-page: #0b1120;
    --bg-card: #131c2e;
    --bg-row: #0f1829;
    --bg-row-hover: #162035;
    --border: rgb(255 255 255 / 7%);
    --border-accent: rgb(45 212 191 / 25%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;
    --accent-dim: rgb(45 212 191 / 12%);
    --android-green: #22c55e;
    --android-bg: rgb(34 197 94 / 12%);
    --ios-blue: #60a5fa;
    --ios-bg: rgb(96 165 250 / 12%);
    --status-normal: #22c55e;
    --status-bg: rgb(34 197 94 / 12%);
    --red: #ef4444;
    --red-dim: rgb(239 68 68 / 12%);
    --amber: #f59e0b;

    position: relative;
    min-height: 100vh;
    padding: 0 24px 24px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: var(--text-primary);
    background: var(--bg-page);
  }

  // ─── 页面头部 ───────────────────────────────────────────
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0 16px;
  }

  .breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 14px;
  }

  .breadcrumb-parent {
    color: var(--text-secondary);
  }

  .breadcrumb-sep {
    color: var(--text-muted);
  }

  .breadcrumb-current {
    font-weight: 500;
    color: var(--text-primary);
  }

  .header-actions {
    display: flex;
    gap: 10px;
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
    transition: all 0.2s;

    &:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
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
    transition: all 0.2s;

    &:hover {
      color: var(--accent) !important;
      border-color: var(--accent) !important;
    }
  }

  // ─── 筛选栏 ────────────────────────────────────────────
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding: 14px 16px;
    margin-bottom: 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .filter-search {
    width: 200px;

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

  .filter-label {
    font-size: 13px;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .filter-select {
    width: 110px;

    :deep(.el-select__wrapper) {
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

  // ─── 统计卡片 ───────────────────────────────────────────
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .stat-card {
    position: relative;
    padding: 20px 22px;
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

    &--ios::before {
      background: var(--ios-blue);
    }

    &--android::before {
      background: var(--android-green);
    }

    &--pending::before {
      background: var(--amber);
    }
  }

  .stat-label {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .stat-value {
    display: flex;
    gap: 4px;
    align-items: baseline;
    font-size: 28px;
    font-weight: 700;

    .stat-card--total & {
      color: var(--accent);
    }

    .stat-card--ios & {
      color: var(--ios-blue);
    }

    .stat-card--android & {
      color: var(--android-green);
    }

    .stat-card--pending & {
      color: var(--amber);
    }
  }

  .stat-unit {
    font-size: 14px;
    font-weight: 400;
  }

  .stat-badge {
    padding: 2px 6px;
    margin-left: 4px;
    font-size: 10px;
    font-weight: 500;
    color: var(--amber);
    background: rgb(245 158 11 / 15%);
    border-radius: 4px;
  }

  // ─── 表格 ──────────────────────────────────────────────
  .table-wrapper {
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .app-table {
    --el-table-bg-color: transparent;
    --el-table-header-bg-color: #0f1829;
    --el-table-row-hover-bg-color: var(--bg-row-hover);
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-border: 1px solid var(--border);

    cursor: pointer;
    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 12px 8px;
      font-size: 12px;
      font-weight: 500;
      background: #0f1829 !important;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(td.el-table__cell) {
      padding: 10px 8px;
      font-size: 12px;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(tr) {
      background: transparent !important;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }
  }

  .app-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    border-radius: 6px;
  }

  .platform-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 8px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 5px;

    &--android {
      color: var(--android-green);
      background: var(--android-bg);
    }

    &--ios {
      color: var(--ios-blue);
      background: var(--ios-bg);
    }
  }

  .platform-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;

    .platform-badge--android & {
      background: var(--android-green);
    }

    .platform-badge--ios & {
      background: var(--ios-blue);
    }
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 4px;

    &--normal {
      color: var(--status-normal);
      background: var(--status-bg);
    }

    &--disabled {
      color: var(--red);
      background: var(--red-dim);
    }
  }

  .action-btns {
    display: flex;
    gap: 2px;
    align-items: center;
  }

  .action-btn {
    display: inline-flex;
    gap: 3px;
    align-items: center;
    padding: 3px 6px;
    font-size: 12px;
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 4px;
    transition: all 0.15s;

    &--edit {
      color: var(--accent);

      &:hover {
        background: var(--accent-dim);
      }
    }

    &--delete {
      color: var(--red);

      &:hover {
        background: var(--red-dim);
      }
    }

    &--view {
      color: var(--text-secondary);

      &:hover {
        color: var(--text-primary);
        background: rgb(255 255 255 / 6%);
      }
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

  .pagination-total {
    font-size: 13px;
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

  .pagination-jumper {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    color: var(--text-muted);
  }

  .jumper-input {
    width: 48px;

    :deep(.el-input__wrapper) {
      height: 28px;
      padding: 0 6px;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: var(--text-primary);
      text-align: center;
    }
  }

  // ─── Element Plus 下拉弹出层覆盖 ───────────────────────
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
