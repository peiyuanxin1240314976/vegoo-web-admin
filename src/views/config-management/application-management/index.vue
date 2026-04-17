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
          <el-option
            v-for="opt in platformOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
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
        <ElButton round class="btn-query" @click="handleSearch">查询</ElButton>
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
        v-loading="tableLoading"
        :data="tableRecords"
        class="app-table"
        table-layout="fixed"
        row-class-name="app-table-row"
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="ID" min-width="100" show-overflow-tooltip />
        <el-table-column prop="appName" label="应用名" min-width="100" show-overflow-tooltip />
        <el-table-column label="图标" min-width="100" align="center">
          <template #default="{ row }">
            <div class="app-icon" :style="{ background: row.iconColor }">
              {{ row.appName.charAt(0) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="平台" min-width="100">
          <template #default="{ row }">
            <span
              :class="[
                'platform-badge',
                row.platform === 'Android'
                  ? 'platform-badge--android'
                  : row.platform === 'iOS'
                    ? 'platform-badge--ios'
                    : 'platform-badge--web'
              ]"
            >
              <span class="platform-dot" />{{ row.platform }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="bundleId" label="Bundle ID" min-width="100" show-overflow-tooltip />
        <el-table-column prop="packageId" label="软件包ID" min-width="100" show-overflow-tooltip />
        <el-table-column prop="shortName" label="应用简称" min-width="100" show-overflow-tooltip />
        <el-table-column prop="category" label="类别" min-width="100" show-overflow-tooltip />
        <el-table-column prop="timezone" label="报表时区" min-width="100" show-overflow-tooltip />
        <el-table-column prop="priority" label="优先级" min-width="100" />
        <el-table-column label="状态" min-width="100" align="center">
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
        <el-table-column prop="creator" label="创建人" min-width="100" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="100" show-overflow-tooltip />
        <el-table-column label="操作" width="260" fixed="right" align="center">
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
        <span class="pagination-total">共 {{ serverTotal }} 条</span>
        <el-select v-model="pageSize" class="page-size-select" @change="handlePageSizeChange">
          <el-option label="每页 10 条" :value="10" />
          <el-option label="每页 20 条" :value="20" />
          <el-option label="每页 50 条" :value="50" />
        </el-select>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="serverTotal"
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
      :category-options="categoryOptions"
      :timezone-options="timezoneOptions"
      :platform-options="platformOptions"
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
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { Plus, Download, Search, EditPen, Delete, View } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    createApplication,
    deleteApplication,
    exportApplicationList,
    fetchApplicationFilterFormOptions,
    fetchApplicationOverviewStats,
    fetchApplicationTable,
    updateApplication
  } from '@/api/config-management/application-management'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import { useUserStore } from '@/store/modules/user'
  import AppDetailDrawer from './modules/app-detail-drawer.vue'
  import AppFormDialog from './modules/app-form-dialog.vue'
  import AppDeleteDialog from './modules/app-delete-dialog.vue'
  import { type ApplicationAppItem, type ApplicationFormPayload, type OptionItem } from './types'

  defineOptions({ name: 'ApplicationManagement' })

  const { t } = useI18n()
  const userStore = useUserStore()
  const cockpitMetaFilterStore = useCockpitMetaFilterStore()

  /** 筛选（可与 meta-filter-options 对齐） */
  const filterForm = reactive({
    keyword: '',
    category: '',
    platform: '',
    status: '',
    creator: ''
  })

  const tableRecords = ref<ApplicationAppItem[]>([])
  const serverTotal = ref(0)
  const tableLoading = ref(false)
  const stats = ref({ total: 0, ios: 0, android: 0, pending: 0 })

  const currentPage = ref(1)
  const pageSize = ref(20)
  const jumpPage = ref('')
  const drawerVisible = ref(false)
  const formVisible = ref(false)
  const deleteVisible = ref(false)
  const currentApp = ref<ApplicationAppItem | null>(null)
  const editData = ref<ApplicationAppItem | null>(null)
  const deleteData = ref<ApplicationAppItem | null>(null)

  const categoryOptions = ref<OptionItem[]>([])
  const creatorOptions = ref<OptionItem[]>([])
  const timezoneOptions = ref<OptionItem[]>([])
  const fallbackPlatformOptions = ref<Array<{ label: string; value: 'Android' | 'iOS' | 'Web' }>>([
    { label: 'Android', value: 'Android' },
    { label: 'iOS', value: 'iOS' },
    { label: 'Web', value: 'Web' }
  ])

  function normalizePlatformLabel(value: string, label: string): 'Android' | 'iOS' | 'Web' | '' {
    const normalizedValue = value.trim()
    const normalizedLabel = label.trim().toLowerCase()

    if (normalizedValue === '0') return 'Android'
    if (normalizedValue === '1') return 'iOS'
    if (normalizedValue === '6') return 'Web'

    if (normalizedLabel.includes('android') || normalizedLabel.includes('安卓')) return 'Android'
    if (normalizedLabel.includes('ios') || normalizedLabel.includes('苹果')) return 'iOS'
    if (normalizedLabel.includes('web')) return 'Web'

    return ''
  }

  const platformOptions = computed(() => {
    const source = cockpitMetaFilterStore.data?.platformOptions ?? []
    const mapped = source
      .map((item) => {
        const normalized = normalizePlatformLabel(item.value, item.label)
        if (!normalized) return null
        return { label: normalized, value: normalized }
      })
      .filter(
        (item): item is { label: 'Android' | 'iOS' | 'Web'; value: 'Android' | 'iOS' | 'Web' } =>
          !!item
      )

    if (!mapped.length) return fallbackPlatformOptions.value
    return mapped.filter(
      (item, index, arr) => arr.findIndex((target) => target.value === item.value) === index
    )
  })

  function tableQueryBase() {
    return {
      ...(filterForm.keyword.trim() ? { keyword: filterForm.keyword.trim() } : {}),
      ...(filterForm.category ? { category: filterForm.category } : {}),
      ...(filterForm.platform ? { platform: filterForm.platform } : {}),
      ...(filterForm.status ? { status: filterForm.status } : {}),
      ...(filterForm.creator ? { creator: filterForm.creator } : {})
    }
  }

  function syncCurrentAppFromTable() {
    if (!currentApp.value) return
    const row = tableRecords.value.find((a) => a.id === currentApp.value!.id)
    if (row) currentApp.value = { ...row }
  }

  async function loadStats() {
    try {
      const res = await fetchApplicationOverviewStats(tableQueryBase())
      stats.value = {
        total: res.totalApplications,
        ios: res.iosCount,
        android: res.androidCount,
        pending: res.pendingCount
      }
    } catch {
      /* request / mock 已统一走 fetch* */
    }
  }

  async function loadFilterAndFormOptions() {
    try {
      const res = await fetchApplicationFilterFormOptions()
      categoryOptions.value = res.categoryOptions ?? []
      creatorOptions.value = res.creatorOptions ?? []
      timezoneOptions.value = res.timezoneOptions ?? []
    } catch {
      categoryOptions.value = []
      creatorOptions.value = []
      timezoneOptions.value = []
    }
  }

  async function loadTable() {
    tableLoading.value = true
    try {
      const res = await fetchApplicationTable({
        current: currentPage.value,
        size: pageSize.value,
        ...tableQueryBase()
      })
      const maxPage = Math.max(1, Math.ceil(res.total / pageSize.value) || 1)
      if (currentPage.value > maxPage) {
        currentPage.value = maxPage
        tableLoading.value = false
        return loadTable()
      }
      tableRecords.value = res.records
      serverTotal.value = res.total
      syncCurrentAppFromTable()
    } catch {
      tableRecords.value = []
      serverTotal.value = 0
    } finally {
      tableLoading.value = false
    }
  }

  onMounted(() => {
    void cockpitMetaFilterStore.ensureLoaded()
    loadFilterAndFormOptions()
    loadStats()
    loadTable()
  })

  watch([currentPage, pageSize], () => {
    loadTable()
  })

  const handleSearch = () => {
    loadStats()
    if (currentPage.value !== 1) {
      currentPage.value = 1
      return
    }
    loadTable()
  }

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

  const handleExport = async () => {
    let rows: ApplicationAppItem[] = []
    try {
      const res = await fetchApplicationTable({
        current: 1,
        size: 10000,
        ...tableQueryBase()
      })
      rows = res.records
    } catch {
      ElMessage.error('获取导出数据失败')
      return
    }

    const header = [
      'id',
      'appName',
      'platform',
      'bundleId',
      'packageId',
      'shortName',
      'category',
      'timezone',
      'priority',
      'status',
      'creator',
      'createTime'
    ]
    const lines = [header.join(',')]
    for (const r of rows) {
      const cells = header.map((key) => {
        const v = r[key as keyof ApplicationAppItem]
        const s = v === undefined || v === null ? '' : String(v)
        return `"${s.replace(/"/g, '""')}"`
      })
      lines.push(cells.join(','))
    }
    const bom = '\uFEFF'
    const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `applications_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)

    try {
      await exportApplicationList({
        current: currentPage.value,
        size: pageSize.value,
        ...tableQueryBase()
      })
    } catch {
      /* 远程导出未就绪时仅本地下载 CSV */
    }
    ElMessage.success('导出成功')
  }

  const handlePageChange = (page: number) => {
    currentPage.value = page
  }

  const handlePageSizeChange = () => {
    currentPage.value = 1
  }

  const handleJump = () => {
    const raw = parseInt(jumpPage.value, 10)
    jumpPage.value = ''
    if (Number.isNaN(raw) || raw < 1) return
    const maxPage = Math.max(1, Math.ceil(serverTotal.value / pageSize.value))
    currentPage.value = Math.min(raw, maxPage)
  }

  const handleFormSuccess = async (payload: ApplicationFormPayload) => {
    const userName = userStore.getUserInfo?.userName || userStore.getUserInfo?.username || '系统'
    const editing = !!editData.value

    const body: ApplicationFormPayload = editing
      ? { ...payload, lastModifier: userName }
      : { ...payload, creator: userName }

    try {
      if (editing) {
        await updateApplication(body)
      } else {
        await createApplication(body)
      }
      await loadStats()
      await loadTable()
      ElMessage.success(editing ? '保存成功' : '创建成功')
      formVisible.value = false
      editData.value = null
    } catch {
      ElMessage.error(editing ? '保存失败' : '创建失败')
    }
  }

  const handleDeleteConfirm = async () => {
    const id = deleteData.value?.id
    deleteVisible.value = false
    if (!id) {
      deleteData.value = null
      return
    }

    try {
      await deleteApplication(id)
      await loadStats()
      await loadTable()
      if (currentApp.value?.id === id) {
        currentApp.value = null
        drawerVisible.value = false
      }
      ElMessage.success('删除成功')
    } catch {
      ElMessage.error('删除失败')
    }

    deleteData.value = null
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
    --web-purple: #a78bfa;
    --web-bg: rgb(167 139 250 / 12%);
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

  .btn-query {
    padding: 8px 16px !important;
    font-weight: 600 !important;
    color: #0b1120 !important;
    background: var(--accent) !important;
    border: none !important;
    border-radius: 8px !important;
    transition: all 0.2s;

    &:hover {
      filter: brightness(1.08);
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
    width: 100%;

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

    &--web {
      color: var(--web-purple);
      background: var(--web-bg);
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

    .platform-badge--web & {
      background: var(--web-purple);
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
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    justify-content: center;
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
