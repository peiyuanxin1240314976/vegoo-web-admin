<template>
  <div class="account-sub-page credential-page app-assignment-page art-full-height">
    <div class="account-sub-page__toolbar">
      <div class="account-sub-page__toolbar-fx" aria-hidden="true" />
      <div class="account-sub-page__toolbar-row">
        <div class="account-sub-page__toolbar-copy">
          <span class="account-sub-page__toolbar-line" aria-hidden="true" />
          <div class="account-sub-page__toolbar-titles">
            <span class="account-sub-page__toolbar-eyebrow">Assignment</span>
            <span class="account-sub-page__toolbar-title">应用分配</span>
          </div>
          <span class="account-sub-page__toolbar-hint">应用与优化师绑定、绩效版本与导出</span>
        </div>
        <div class="account-sub-page__toolbar-actions">
          <ElButton type="primary" round class="account-sub-page__btn-primary" @click="handleAdd">
            <ElIcon><Plus /></ElIcon>新建分配
          </ElButton>
          <ElButton round class="account-sub-page__btn-secondary" @click="handleExport">
            <ElIcon><Download /></ElIcon>导出
          </ElButton>
        </div>
      </div>
    </div>

    <section class="account-sub-page__list-panel credential-page__panel" aria-label="应用分配">
      <div class="account-sub-page__list-panel-fx" aria-hidden="true" />
      <div class="account-sub-page__list-panel-body credential-page__panel-body">
        <!-- ── 统计卡片（不与右侧详情并排）───────────────────────── -->
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

        <div class="app-assignment-layout">
          <div class="app-assignment-layout__left">
            <!-- ── 筛选栏 ─────────────────────────────────────────── -->
            <div class="app-assignment-filter-bar">
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
                  <el-option
                    v-for="opt in terminalPlatformFilterOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                <el-select
                  v-model="filterForm.source"
                  class="filter-select"
                  clearable
                  placeholder="广告平台：全部"
                >
                  <el-option
                    v-for="opt in sourceFilterOptions"
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

            <!-- ── 数据表格（与右侧详情同高，内部滚动）────────────────── -->
            <div class="table-wrapper">
              <el-table
                v-loading="tableLoading"
                :data="tableRecords"
                class="assignment-table"
                style="width: 100%"
                height="100%"
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
                        row.platform === 'Android'
                          ? 'platform-badge--android'
                          : 'platform-badge--ios'
                      ]"
                    >
                      {{ row.platform === 'Android' ? '安卓' : 'iOS' }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="广告平台"
                  min-width="14%"
                  prop="adPlatform"
                  show-overflow-tooltip
                />
                <el-table-column
                  label="优化师"
                  min-width="12%"
                  prop="optimizer"
                  show-overflow-tooltip
                />
                <el-table-column label="绩效配置版本" min-width="15%">
                  <template #default="{ row }">
                    <span :class="['version-badge', versionBadgeClass(row)]">
                      {{ row.configVersionLabel }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="assignTime"
                  label="分配时间"
                  min-width="13%"
                  align="center"
                />
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
                <el-select
                  v-model="pageSize"
                  class="page-size-select"
                  @change="handlePageSizeChange"
                >
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
          </div>

          <div class="app-assignment-layout__right">
            <div class="assignment-detail-wrapper">
              <AssignmentDetailDrawer
                :visible="true"
                mode="side"
                :assignment="currentAssignment"
                @update:visible="handleSideDrawerClose"
                @edit="handleEdit"
                @view-logs="handleViewLogs"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 新建/编辑弹窗 ─────────────────────────────────── -->
    <AssignmentFormDialog
      v-model:visible="formVisible"
      :edit-data="editData"
      :source-options="sourceFilterOptions"
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
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import type { CockpitMetaOptionItem } from '@/types/cockpit-meta-filter'
  import { assignmentSourceFallbackOptions } from './mock/data'
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
    AssignmentPlatform,
    AssignmentStatus
  } from './types'

  defineOptions({ name: 'AppAssignment' })

  // ─── 筛选 ────────────────────────────────────────────────
  const filterForm = reactive({
    keyword: '',
    platform: '',
    source: '',
    optimizer: '',
    status: ''
  })

  const currentPage = ref(1)
  const pageSize = ref(20)
  const tableLoading = ref(false)
  const tableRecords = ref<AppAssignmentItem[]>([])
  const tableTotal = ref(0)
  const overview = ref<AppAssignmentOverviewResponse | null>(null)

  const cockpitMetaFilterStore = useCockpitMetaFilterStore()

  const metaFilter = reactive<AppAssignmentMetaFilterResponse>({
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

  function normalizeTerminalPlatform(value: string, label: string): AssignmentPlatform | '' {
    const normalizedValue = value.trim()
    const normalizedLabel = label.trim().toLowerCase()
    if (normalizedValue === '0') return 'Android'
    if (normalizedValue === '1') return 'iOS'
    if (normalizedLabel.includes('android') || normalizedLabel.includes('安卓')) return 'Android'
    if (normalizedLabel.includes('ios') || normalizedLabel.includes('苹果')) return 'iOS'
    return ''
  }

  const terminalPlatformFilterOptions = computed(() => {
    const raw = cockpitMetaFilterStore.data?.platformOptions ?? []
    const mapped = raw
      .map((item) => {
        const normalized = normalizeTerminalPlatform(item.value, item.label)
        if (!normalized) return null
        return {
          label: normalized === 'Android' ? 'Android（安卓）' : 'iOS',
          value: normalized
        }
      })
      .filter((item): item is { label: string; value: AssignmentPlatform } => !!item)
    const dedup = mapped.filter(
      (item, index, arr) => arr.findIndex((t) => t.value === item.value) === index
    )
    if (dedup.length) return dedup
    return [
      { label: 'Android（安卓）', value: 'Android' as const },
      { label: 'iOS', value: 'iOS' as const }
    ]
  })

  const sourceFilterOptions = computed<CockpitMetaOptionItem[]>(() => {
    const fromStore = cockpitMetaFilterStore.data?.sourceOptions ?? []
    if (fromStore.length) return fromStore
    return assignmentSourceFallbackOptions
  })

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
        source: filterForm.source || undefined,
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
      metaFilter.optimizerOptions = filterRes.optimizerOptions ?? []
      assignableAppsRaw.value = appsRes.apps ?? []
    } catch {
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
    await Promise.all([cockpitMetaFilterStore.ensureLoaded(), loadMeta()])
    await Promise.all([loadOverview(), loadTable()])
  })

  // ─── 弹窗 / 抽屉状态 ────────────────────────────────────
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
  }

  const handleViewLogs = (row: AppAssignmentItem) => {
    logAssignment.value = row
    logVisible.value = true
  }

  const handleSideDrawerClose = () => {
    currentAssignment.value = null
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
        source: filterForm.source || undefined,
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
  .account-sub-page.credential-page.app-assignment-page {
    --page-border: color-mix(in srgb, var(--el-color-primary) 16%, transparent);
    --page-text-main: color-mix(in srgb, var(--text-primary) 92%, white 8%);
    --as-border: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --as-surface: color-mix(in srgb, var(--default-box-color) 94%, transparent);
    --as-header-bg: color-mix(in srgb, var(--default-box-color) 78%, black 4%);
    --as-row-hover: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    --bg-card: var(--as-surface);
    --border: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    --accent: var(--el-color-primary);
    --accent-dim: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --android-green: var(--art-success);
    --ios-blue: var(--el-color-info);
    --amber: var(--art-warning);
    --red: var(--art-danger);
    --text-primary: var(--text-primary);
    --text-secondary: var(--text-secondary);
    --text-muted: var(--text-tertiary);

    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding: 24px;
    overflow-x: clip;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 13px;
    color: var(--page-text-main);
    background: var(--default-bg-color);
    isolation: isolate;
  }

  .account-sub-page.credential-page.app-assignment-page::before {
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

  .account-sub-page.credential-page.app-assignment-page > * {
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

    &::after {
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
    letter-spacing: 0.14em;
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
    flex: 1 1 280px;
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
    overflow: hidden;
    scrollbar-gutter: stable;
  }

  .app-assignment-layout {
    --assignment-panel-max-h: clamp(640px, 76vh, 1000px);

    display: grid;
    flex: 1;
    grid-template-columns: minmax(0, 1fr) 480px;
    gap: 14px;
    align-items: start;
    min-height: 0;
  }

  .app-assignment-layout__left {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .app-assignment-layout__right {
    min-width: 0;
    min-height: 0;
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

  .app-assignment-filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    padding: 14px 16px;
    margin-bottom: 14px;
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
    border: 1px solid var(--as-border);
    border-radius: 14px;
    box-shadow:
      0 8px 24px rgb(0 0 0 / 6%),
      inset 0 1px 0 color-mix(in srgb, white 6%, transparent);
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

  // ─── 筛选栏（布局见 .app-assignment-filter-bar）──────────
  .filter-search {
    width: 220px;

    :deep(.el-input__wrapper) {
      background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
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
      background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
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
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    max-height: var(--assignment-panel-max-h);
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .assignment-detail-wrapper {
    height: var(--assignment-panel-max-h);
    overflow: hidden;
    border-radius: 14px;
  }

  .assignment-table {
    --el-table-bg-color: transparent;
    --el-table-header-bg-color: var(--as-header-bg);
    --el-table-row-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-border: 1px solid var(--border);

    flex: 1;
    min-height: 0;
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
      background: var(--as-header-bg) !important;
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
      background: color-mix(in srgb, var(--el-color-primary) 8%, transparent) !important;
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
      background: color-mix(in srgb, var(--art-success) 12%, transparent);
    }

    &--ios {
      color: var(--ios-blue);
      background: color-mix(in srgb, var(--el-color-info) 14%, transparent);
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
      background: color-mix(in srgb, var(--art-warning) 12%, transparent);
    }

    &--archived {
      color: var(--text-muted);
      background: color-mix(in srgb, var(--el-color-primary) 5%, transparent);
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
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 12%, transparent);

      .status-dot {
        background: var(--art-success);
      }
    }

    &--draft {
      color: var(--amber);
      background: color-mix(in srgb, var(--art-warning) 12%, transparent);

      .status-dot {
        background: var(--amber);
      }
    }

    &--archived {
      color: var(--text-muted);
      background: color-mix(in srgb, var(--el-color-primary) 5%, transparent);

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
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 22%, transparent);
    border-radius: 5px;
    transition: all 0.15s;

    &:hover {
      background: color-mix(in srgb, var(--el-color-primary) 16%, transparent);
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
      background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
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
        color: #fff;
        background: var(--accent);
      }
    }

    :deep(.btn-prev),
    :deep(.btn-next) {
      color: var(--text-secondary) !important;
      background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
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
    background: color-mix(in srgb, var(--default-box-color) 96%, transparent) !important;
    border: 1px solid var(--border) !important;
  }

  :deep(.el-select-dropdown__item) {
    color: var(--text-secondary) !important;

    &:hover,
    &.is-hovering {
      color: var(--accent) !important;
      background: color-mix(in srgb, var(--el-color-primary) 10%, transparent) !important;
    }

    &.is-selected {
      color: var(--accent) !important;
      background: color-mix(in srgb, var(--el-color-primary) 14%, transparent) !important;
    }
  }

  @media (width <= 900px) {
    .app-assignment-layout {
      grid-template-columns: 1fr;
    }

    .app-assignment-layout__right {
      order: 2;
    }

    .stat-cards {
      grid-template-columns: repeat(2, 1fr);
    }

    .account-sub-page__toolbar-actions {
      gap: 8px;
    }
  }

  @media (width <= 600px) {
    .account-sub-page__toolbar-row {
      flex-direction: column;
      align-items: stretch;
    }

    .account-sub-page__toolbar-actions {
      justify-content: flex-start;
    }

    .stat-cards {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .account-sub-page__btn-primary.el-button--primary:hover,
    .account-sub-page__btn-secondary.el-button:hover {
      transform: none;
    }
  }
</style>
