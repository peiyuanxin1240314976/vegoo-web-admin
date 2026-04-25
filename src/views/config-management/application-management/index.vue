<template>
  <div class="account-sub-page application-management-page art-full-height">
    <div class="account-sub-page__toolbar">
      <div class="account-sub-page__toolbar-fx" aria-hidden="true" />
      <div class="account-sub-page__toolbar-row">
        <div class="account-sub-page__toolbar-copy">
          <span class="account-sub-page__toolbar-line" aria-hidden="true" />
          <div class="account-sub-page__toolbar-titles">
            <span class="account-sub-page__toolbar-eyebrow">{{
              t('menus.configManagement.title')
            }}</span>
            <span class="account-sub-page__toolbar-title">{{
              t('menus.configManagement.applicationManagement')
            }}</span>
          </div>
          <span class="account-sub-page__toolbar-hint">应用列表、筛选、统计与导出</span>
        </div>
        <div class="account-sub-page__toolbar-actions">
          <ElButton type="primary" round class="account-sub-page__btn-primary" @click="handleAdd">
            <ElIcon><Plus /></ElIcon>新增应用
          </ElButton>
          <ElButton round class="account-sub-page__btn-secondary" @click="handleExport">
            <ElIcon><Download /></ElIcon>导出
          </ElButton>
        </div>
      </div>
    </div>

    <section
      class="account-sub-page__list-panel application-management-page__panel"
      aria-label="应用管理"
    >
      <div class="account-sub-page__list-panel-fx" aria-hidden="true" />
      <div class="account-sub-page__list-panel-body application-management-page__panel-body">
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
            <el-select
              v-model="filterForm.category"
              placeholder="全部"
              class="filter-select"
              clearable
            >
              <el-option
                v-for="opt in categoryOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <span class="filter-label">平台</span>
            <el-select
              v-model="filterForm.platform"
              placeholder="全部"
              class="filter-select"
              clearable
            >
              <el-option
                v-for="opt in platformOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <span class="filter-label">状态</span>
            <el-select
              v-model="filterForm.status"
              placeholder="全部"
              class="filter-select"
              clearable
            >
              <el-option label="正常" value="正常" />
              <el-option label="禁用" value="禁用" />
            </el-select>
            <span class="filter-label">创建人</span>
            <el-select
              v-model="filterForm.creator"
              placeholder="全部"
              class="filter-select"
              clearable
            >
              <el-option
                v-for="opt in creatorOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <ElButton
              type="primary"
              round
              class="account-sub-page__btn-primary btn-query"
              @click="handleSearch"
            >
              查询
            </ElButton>
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
            <el-table-column
              prop="id"
              label="ID"
              min-width="100"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column
              prop="appName"
              label="应用名"
              min-width="100"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column label="图标" min-width="100" align="center">
              <template #default="{ row }">
                <div class="app-icon" :style="{ background: row.iconColor }">
                  {{ row.appName.charAt(0) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="平台" min-width="100" align="left">
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
            <el-table-column
              prop="bundleId"
              label="Bundle ID"
              min-width="100"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column
              prop="packageId"
              label="软件包ID"
              min-width="100"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column
              prop="shortName"
              label="应用简称"
              min-width="100"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column
              prop="category"
              label="类别"
              min-width="100"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column
              prop="timezone"
              label="报表时区"
              min-width="100"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column prop="priority" label="优先级" min-width="100" align="left" />
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
            <el-table-column
              prop="creator"
              label="创建人"
              min-width="100"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column
              prop="createTime"
              label="创建时间"
              min-width="100"
              align="left"
              show-overflow-tooltip
            />
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
      </div>
    </section>

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

  function csvCell(value: string) {
    if (/[,"\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
    return value
  }

  const exportCsvLocal = async () => {
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
    ] as const
    const lines = [
      '\uFEFF' + header.join(','),
      ...rows.map((r) =>
        header
          .map((key) => {
            const v = r[key as keyof ApplicationAppItem]
            const s = v === undefined || v === null ? '' : String(v)
            return csvCell(s)
          })
          .join(',')
      )
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `applications_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  }

  const handleExport = async () => {
    try {
      await exportApplicationList({
        ...tableQueryBase()
      })
      ElMessage.success('导出成功')
      return
    } catch {
      ElMessage.warning('导出接口不可用，已改为导出当前筛选列表（CSV）')
    }
    await exportCsvLocal()
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
  .account-sub-page {
    --page-border: color-mix(in srgb, var(--el-color-primary) 16%, transparent);
    --page-text-main: color-mix(in srgb, var(--text-primary) 92%, white 8%);
    --am-border: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --am-surface: color-mix(in srgb, var(--default-box-color) 94%, transparent);
    --am-header-bg: color-mix(in srgb, var(--default-box-color) 78%, black 4%);
    --am-row-hover: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    --accent-dim: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    --android-green: var(--art-success);
    --android-bg: color-mix(in srgb, var(--art-success) 14%, transparent);
    --ios-blue: color-mix(in srgb, #60a5fa 70%, var(--el-color-primary) 30%);
    --ios-bg: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --web-purple: color-mix(in srgb, var(--theme-color) 45%, var(--el-color-primary) 55%);
    --web-bg: color-mix(in srgb, var(--theme-color) 14%, transparent);
    --status-normal: var(--art-success);
    --status-bg: color-mix(in srgb, var(--art-success) 14%, transparent);
    --red: var(--art-danger);
    --red-dim: color-mix(in srgb, var(--art-danger) 12%, transparent);
    --amber: var(--art-warning);
    --amber-bg: color-mix(in srgb, var(--art-warning) 14%, transparent);

    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding: 24px;
    overflow-x: clip;
    color: var(--page-text-main);
    background: var(--default-bg-color);
    isolation: isolate;
  }

  .account-sub-page::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(
        ellipse 55% 40% at 88% 0%,
        color-mix(in srgb, var(--theme-color) 22%, transparent) 0%,
        transparent 58%
      ),
      radial-gradient(
        ellipse 40% 32% at 12% 6%,
        color-mix(in srgb, var(--el-color-primary) 16%, transparent) 0%,
        transparent 55%
      );
    mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 55%);
  }

  .account-sub-page > * {
    position: relative;
    z-index: 1;
  }

  .account-sub-page__toolbar {
    position: relative;
    flex-shrink: 0;
    margin-bottom: 16px;
    overflow: hidden;
    backdrop-filter: blur(18px);
    border: 1px solid var(--page-border);
    border-radius: 20px;
    box-shadow:
      0 18px 48px rgb(0 0 0 / 18%),
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 7%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 7%, transparent);
  }

  .account-sub-page__toolbar-fx {
    position: absolute;
    inset: -50% -10% 35%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 200deg at 70% 40%,
      color-mix(in srgb, var(--el-color-primary) 14%, transparent),
      color-mix(in srgb, var(--theme-color) 12%, transparent),
      color-mix(in srgb, var(--art-success) 8%, transparent),
      color-mix(in srgb, var(--el-color-primary) 14%, transparent)
    );
    filter: blur(40px);
    opacity: 0.5;
  }

  .account-sub-page__toolbar-row {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 16px 20px;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--default-box-color) 88%, transparent),
        color-mix(in srgb, var(--default-box-color) 76%, transparent)
      ),
      linear-gradient(
        118deg,
        color-mix(in srgb, var(--theme-color) 8%, transparent),
        color-mix(in srgb, var(--el-color-primary) 6%, transparent)
      );
  }

  .account-sub-page__toolbar-row::after {
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
      color-mix(in srgb, var(--el-color-primary) 45%, transparent) 35%,
      color-mix(in srgb, var(--theme-color) 38%, transparent) 65%,
      transparent 100%
    );
    opacity: 0.85;
  }

  .account-sub-page__toolbar-copy {
    display: grid;
    flex: 1 1 220px;
    grid-template-rows: auto auto;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 4px 12px;
    align-items: center;
    min-width: 0;
  }

  .account-sub-page__toolbar-line {
    display: inline-block;
    grid-row: 1 / span 2;
    align-self: center;
    width: 4px;
    height: 36px;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--el-color-primary) 70%, transparent),
      color-mix(in srgb, var(--theme-color) 55%, transparent)
    );
    border-radius: 999px;
    box-shadow: 0 0 18px color-mix(in srgb, var(--el-color-primary) 28%, transparent);
  }

  .account-sub-page__toolbar-titles {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .account-sub-page__toolbar-hint {
    grid-column: 2;
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-tertiary);
  }

  .account-sub-page__toolbar-eyebrow {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    opacity: 0.65;
  }

  .account-sub-page__toolbar-title {
    font-size: 17px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.02em;
    background-color: transparent;
    background-image: linear-gradient(
      105deg,
      var(--page-text-main) 0%,
      color-mix(in srgb, var(--el-color-primary) 72%, var(--page-text-main) 28%) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .account-sub-page__toolbar-actions {
    display: flex;
    flex: 1 1 260px;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
  }

  .account-sub-page__list-panel {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--default-box-color) 93%, transparent) 0%,
        color-mix(in srgb, var(--default-box-color) 86%, transparent) 100%
      ),
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--el-color-primary) 5%, transparent),
        color-mix(in srgb, var(--theme-color) 4%, transparent)
      );
    isolation: isolate;
    backdrop-filter: blur(18px);
    border: 1px solid var(--page-border);
    border-radius: 20px;
    box-shadow:
      0 18px 48px rgb(0 0 0 / 16%),
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 7%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 6%, transparent);

    &::before {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: 2;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, var(--el-color-primary) 42%, transparent) 40%,
        color-mix(in srgb, var(--theme-color) 32%, transparent) 70%,
        transparent 100%
      );
      border-radius: 20px 20px 0 0;
      opacity: 0.8;
    }
  }

  .account-sub-page__list-panel-fx {
    position: absolute;
    inset: -35% 20% 40%;
    z-index: 0;
    pointer-events: none;
    background: radial-gradient(
      ellipse 80% 55% at 18% 0%,
      color-mix(in srgb, var(--el-color-primary) 18%, transparent) 0%,
      transparent 62%
    );
    filter: blur(32px);
    opacity: 0.55;
  }

  .account-sub-page__list-panel-body {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 14px 14px 16px;
    overflow: auto;
    scrollbar-gutter: stable;
  }

  .account-sub-page__btn-primary.el-button--primary {
    font-weight: 600 !important;
    box-shadow:
      0 10px 22px color-mix(in srgb, var(--el-color-primary) 28%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 14%, transparent) !important;
    transition:
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out),
      filter var(--duration-normal) var(--ease-out);

    &:hover {
      filter: brightness(1.04);
      box-shadow:
        0 12px 28px color-mix(in srgb, var(--el-color-primary) 34%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 18%, transparent) !important;
      transform: translateY(-1px);
    }
  }

  .account-sub-page__btn-secondary.el-button {
    --el-button-bg-color: color-mix(in srgb, var(--default-box-color) 52%, transparent);
    --el-button-border-color: color-mix(in srgb, var(--el-color-primary) 20%, transparent);
    --el-button-text-color: var(--text-secondary);
    --el-button-hover-text-color: var(--el-color-primary);
    --el-button-hover-border-color: color-mix(in srgb, var(--el-color-primary) 48%, transparent);
    --el-button-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 9%, transparent);
    --el-button-active-text-color: var(--el-color-primary);
    --el-button-active-border-color: color-mix(in srgb, var(--el-color-primary) 55%, transparent);
    --el-button-active-bg-color: color-mix(in srgb, var(--el-color-primary) 12%, transparent);

    font-weight: 500;
    transition:
      border-color var(--duration-normal) var(--ease-out),
      background-color var(--duration-normal) var(--ease-out),
      color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);

    &:hover {
      box-shadow: 0 8px 18px color-mix(in srgb, var(--el-color-primary) 14%, transparent);
      transform: translateY(-1px);
    }
  }

  .btn-query.el-button {
    height: 32px !important;
    padding: 0 16px !important;
    font-size: 13px !important;
  }

  // ─── 筛选栏 ────────────────────────────────────────────
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 14px;
    align-items: center;
    padding: 16px 18px;
    margin-bottom: 16px;
    background:
      radial-gradient(
        ellipse 90% 70% at 12% 0%,
        color-mix(in srgb, var(--el-color-primary) 10%, transparent) 0%,
        transparent 58%
      ),
      linear-gradient(
        165deg,
        color-mix(in srgb, var(--default-box-color) 96%, transparent) 0%,
        color-mix(in srgb, var(--default-box-color) 88%, transparent) 100%
      );
    border: 1px solid var(--am-border);
    border-radius: 16px;
    box-shadow:
      0 8px 24px rgb(0 0 0 / 6%),
      inset 0 1px 0 color-mix(in srgb, white 6%, transparent);
  }

  .filter-search {
    width: 200px;
    min-width: 160px;

    :deep(.el-input__wrapper) {
      background: color-mix(in srgb, var(--default-box-color) 72%, transparent) !important;
      border: 1px solid var(--am-border) !important;
      border-radius: 10px;
      box-shadow: none !important;
      transition:
        border-color var(--duration-normal) var(--ease-out),
        box-shadow var(--duration-normal) var(--ease-out);

      &:hover,
      &:focus-within {
        border-color: color-mix(in srgb, var(--el-color-primary) 40%, transparent) !important;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--el-color-primary) 14%, transparent) !important;
      }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: var(--text-primary);
    }

    :deep(.el-input__prefix) {
      color: var(--text-tertiary);
    }
  }

  .filter-selects {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 8px 10px;
    align-items: center;
  }

  .filter-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .filter-select {
    width: 118px;

    :deep(.el-select__wrapper) {
      min-height: 32px;
      color: var(--text-primary);
      background: color-mix(in srgb, var(--default-box-color) 72%, transparent) !important;
      border: 1px solid var(--am-border) !important;
      border-radius: 10px;
      box-shadow: none !important;
      transition:
        border-color var(--duration-fast) var(--ease-out),
        box-shadow var(--duration-fast) var(--ease-out);
    }

    :deep(.el-select__wrapper:hover) {
      border-color: color-mix(in srgb, var(--el-color-primary) 38%, transparent) !important;
    }

    :deep(.el-select__wrapper.is-focused) {
      border-color: color-mix(in srgb, var(--el-color-primary) 50%, transparent) !important;
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--el-color-primary) 16%, transparent) !important;
    }
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
    padding: 18px 20px;
    overflow: hidden;
    isolation: isolate;
    border: 1px solid var(--am-border);
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

    &:hover {
      border-color: color-mix(in srgb, var(--el-color-primary) 28%, transparent);
      box-shadow:
        0 10px 24px rgb(0 0 0 / 8%),
        0 0 0 1px color-mix(in srgb, var(--el-color-primary) 8%, transparent);
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
          var(--am-surface) 0%,
          color-mix(in srgb, var(--default-bg-color) 35%, transparent) 100%
        );

      &::before {
        background: var(--el-color-primary);
      }
    }

    &--ios {
      background:
        radial-gradient(
          ellipse 100% 80% at 88% 0%,
          color-mix(in srgb, var(--el-color-primary) 14%, transparent) 0%,
          transparent 55%
        ),
        linear-gradient(
          165deg,
          color-mix(in srgb, var(--default-box-color) 88%, transparent) 0%,
          var(--am-surface) 100%
        );

      &::before {
        background: var(--ios-blue);
      }
    }

    &--android {
      background:
        radial-gradient(
          ellipse 100% 80% at 12% 12%,
          color-mix(in srgb, var(--art-success) 14%, transparent) 0%,
          transparent 56%
        ),
        linear-gradient(
          198deg,
          var(--am-surface) 0%,
          color-mix(in srgb, var(--default-box-color) 86%, transparent) 100%
        );

      &::before {
        background: var(--android-green);
      }
    }

    &--pending {
      background:
        radial-gradient(
          ellipse 95% 78% at 85% 15%,
          color-mix(in srgb, var(--art-warning) 14%, transparent) 0%,
          transparent 58%
        ),
        linear-gradient(
          175deg,
          color-mix(in srgb, var(--default-box-color) 88%, transparent) 0%,
          var(--am-surface) 100%
        );

      &::before {
        background: var(--amber);
      }
    }
  }

  .stat-label {
    position: relative;
    z-index: 1;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-tertiary);
    letter-spacing: 0.02em;
  }

  .stat-value {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: baseline;
    font-size: 28px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;

    .stat-card--total & {
      color: var(--el-color-primary);
      text-shadow: 0 0 22px color-mix(in srgb, var(--el-color-primary) 20%, transparent);
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
    font-weight: 500;
    color: var(--text-secondary);
  }

  .stat-badge {
    padding: 2px 8px;
    margin-left: 6px;
    font-size: 10px;
    font-weight: 600;
    color: var(--amber);
    background: var(--amber-bg);
    border-radius: 6px;
  }

  // ─── 表格 ──────────────────────────────────────────────
  .table-wrapper {
    overflow: hidden;
    background: var(--am-surface);
    border: 1px solid var(--am-border);
    border-radius: 14px;
    box-shadow:
      0 8px 24px rgb(0 0 0 / 6%),
      inset 0 1px 0 color-mix(in srgb, white 5%, transparent);
  }

  .app-table {
    width: 100%;
    cursor: pointer;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: var(--am-header-bg);
    --el-table-row-hover-bg-color: var(--am-row-hover);
    --el-table-border-color: var(--am-border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-border: 1px solid var(--am-border);

    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 12px 8px;
      font-size: 12px;
      font-weight: 600;
      background: var(--am-header-bg) !important;
      border-bottom: 1px solid var(--am-border) !important;
    }

    :deep(td.el-table__cell) {
      padding: 10px 8px;
      font-size: 12px;
      color: var(--text-primary);
      border-bottom: 1px solid var(--am-border) !important;
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
    margin: 0 auto;
    font-size: 13px;
    font-weight: 700;
    color: var(--el-color-white);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
  }

  .platform-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 8px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 6px;

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
    font-weight: 500;
    border-radius: 6px;

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
    gap: 6px;
    align-items: center;
    justify-content: center;
  }

  .action-btn {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 6px;
    transition:
      color var(--duration-fast) var(--ease-out),
      background-color var(--duration-fast) var(--ease-out);

    &--edit {
      color: var(--el-color-primary);

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
        background: color-mix(in srgb, var(--default-box-color) 70%, transparent);
      }
    }
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
    border-top: 1px solid var(--am-border);
  }

  .pagination-total {
    margin-right: auto;
    font-size: 13px;
    color: var(--text-tertiary);
  }

  .page-size-select {
    width: 118px;

    :deep(.el-select__wrapper) {
      height: 30px;
      min-height: 30px;
      font-size: 12px;
      color: var(--text-secondary);
      background: color-mix(in srgb, var(--default-box-color) 72%, transparent) !important;
      border: 1px solid var(--am-border) !important;
      border-radius: 8px;
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
      border: 1px solid var(--am-border) !important;
      border-radius: 6px;

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
    color: var(--text-tertiary);
  }

  .jumper-input {
    width: 52px;

    :deep(.el-input__wrapper) {
      height: 28px;
      padding: 0 6px;
      background: color-mix(in srgb, var(--default-box-color) 72%, transparent) !important;
      border: 1px solid var(--am-border) !important;
      border-radius: 6px;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: var(--text-primary);
      text-align: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .account-sub-page__btn-primary.el-button--primary:hover,
    .account-sub-page__btn-secondary.el-button:hover,
    .stat-card:hover {
      transform: none;
    }
  }

  @media (width <= 1200px) {
    .stat-cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width <= 768px) {
    .account-sub-page {
      padding: 16px;
    }

    .account-sub-page__toolbar {
      border-radius: 16px;
    }

    .account-sub-page__list-panel {
      border-radius: 16px;

      &::before {
        border-radius: 16px 16px 0 0;
      }
    }

    .stat-cards {
      grid-template-columns: 1fr;
    }
  }
</style>
