<template>
  <div class="cc-page art-full-height">
    <!-- ── 页面标题栏 ──────────────────────────────────── -->
    <div class="page-topbar">
      <div class="topbar-left">
        <div class="breadcrumb">
          <span class="bc-parent">系统配置</span>
          <span class="bc-sep">›</span>
          <span class="bc-current">成本系数管理</span>
        </div>
        <h1 class="page-title">成本系数管理</h1>
      </div>
      <ElButton round class="btn-add" @click="handleAdd">
        <ElIcon><Plus /></ElIcon>新增系数
      </ElButton>
    </div>

    <!-- ── KPI 四卡 ────────────────────────────────────── -->
    <div class="kpi-row">
      <div class="kpi-card kpi-card--teal">
        <div class="kpi-label">配置总条数</div>
        <div class="kpi-value kpi-value--teal">
          {{ kpiData.total }}<span class="kpi-unit">条记录</span>
        </div>
      </div>
      <div class="kpi-card kpi-card--blue">
        <div class="kpi-label">已启用</div>
        <div class="kpi-value kpi-value--blue">
          {{ kpiData.active }}<span class="kpi-unit">条有效配置</span>
        </div>
      </div>
      <div class="kpi-card kpi-card--amber">
        <div class="kpi-label">平台覆盖</div>
        <div class="kpi-value kpi-value--amber">
          {{ kpiData.platforms }}<span class="kpi-unit">个广告平台</span>
        </div>
      </div>
      <div class="kpi-card kpi-card--purple">
        <div class="kpi-label">本月变更</div>
        <div class="kpi-value kpi-value--purple">
          {{ kpiData.monthChanges }}<span class="kpi-unit">次系数调整</span>
        </div>
      </div>
    </div>

    <!-- ── 内容区：表格 ────────────────────────────────── -->
    <div class="content-grid">
      <div class="table-panel">
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <span class="filter-title">系数配置列表</span>
          <div class="filter-controls">
            <span class="filter-label">广告平台</span>
            <el-select
              v-model="filterNSource"
              placeholder="全部"
              class="filter-select"
              clearable
              @change="currentPage = 1"
            >
              <el-option :value="''" label="全部" />
              <el-option
                v-for="p in adPlatformOptions"
                :key="p.nSource"
                :value="p.nSource"
                :label="p.name"
              />
            </el-select>
            <AppDatePicker
              v-model="filterYear"
              type="year"
              placeholder="生效日期"
              value-format="YYYY"
              class="filter-year"
              clearable
            />
            <el-input
              v-model="filterKeyword"
              placeholder="搜索"
              class="filter-search"
              clearable
              @input="currentPage = 1"
            >
              <template #prefix
                ><el-icon><Search /></el-icon
              ></template>
            </el-input>
            <ElButton round class="btn-filter">筛选</ElButton>
          </div>
        </div>

        <!-- 表格 -->
        <el-table
          :data="list"
          class="cc-table"
          style="width: 100%"
          :row-class-name="getRowClass"
          highlight-current-row
          @row-click="handleRowClick"
        >
          <el-table-column label="广告平台" min-width="150">
            <template #default="{ row }">
              <div class="platform-cell">
                <span class="platform-icon" :style="{ background: getPlatform(row.nSource).color }">
                  {{ getPlatform(row.nSource).abbr }}
                </span>
                <div class="platform-info">
                  <span class="platform-name">{{ row.platformName }}</span>
                  <span class="platform-nsource">n_source={{ row.nSource }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="tStart"
            label="生效起始日期(t_start)"
            min-width="155"
            show-overflow-tooltip
          />
          <el-table-column label="折算比例(d_cost_ratio)" min-width="160" align="right">
            <template #default="{ row }">
              {{ formatRatio(row.dCostRatio) }}
            </template>
          </el-table-column>
          <el-table-column label="安装成本(d_install_cost)" min-width="170" align="right">
            <template #default="{ row }">
              {{ formatInstallCost(row.dInstallCost) }}
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="最后修改时间" min-width="155" />
          <el-table-column prop="updatedBy" label="操作人" min-width="90" />
          <el-table-column label="状态" width="110" align="center">
            <template #default="{ row }">
              <span :class="['status-badge', isActive(row) ? 'status--active' : 'status--pending']">
                <span class="status-dot" />
                {{ isActive(row) ? '生效中' : '待生效' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-btns">
                <button class="action-btn action-btn--edit" @click.stop="handleEdit(row)">
                  编辑
                </button>
                <button class="action-btn action-btn--del" @click.stop="handleDelete(row)">
                  删除
                </button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-bar">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="serverTotal"
            layout="prev, pager, next"
            class="cc-pagination"
          />
          <span class="total-text">共 {{ serverTotal }} 条</span>
        </div>
      </div>
    </div>

    <!-- ── 弹窗 ─────────────────────────────────────────── -->
    <CostFormDialog
      v-model:visible="formVisible"
      :edit-data="editItem"
      @success="handleFormSuccess"
    />

    <CostDeleteDialog
      v-model:visible="deleteVisible"
      :item="deleteItem"
      @confirm="handleDeleteConfirm"
    />

    <CostDetailDrawer
      v-model:visible="drawerVisible"
      :item="activeItem"
      :history="activeHistory"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { Plus, Search } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { getAppNow } from '@/utils/app-now'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import {
    fetchCostCoefficientTable,
    fetchCostCoefficientOverviewKpi,
    createCostCoefficient,
    updateCostCoefficient,
    deleteCostCoefficient,
    fetchCostCoefficientHistory
  } from '@/api/config-management/cost-coefficient'
  import CostFormDialog from './modules/cost-form-dialog.vue'
  import CostDeleteDialog from './modules/cost-delete-dialog.vue'
  import CostDetailDrawer from './modules/cost-detail-drawer.vue'
  import { AD_PLATFORMS, getPlatform, getHistory } from './mock/data'
  import type {
    CostCoefficientItem,
    CostCoefficientFormModel,
    CostCoefficientHistory,
    CostCoefficientOverviewKpi
  } from './types'

  defineOptions({ name: 'CostCoefficient' })

  // ─── 数据 ──────────────────────────────────────────────
  const cockpitMetaFilterStore = useCockpitMetaFilterStore()
  const list = ref<CostCoefficientItem[]>([])
  const serverTotal = ref(0)
  const filterNSource = ref<number | ''>('')
  const filterYear = ref('')
  const filterKeyword = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const adPlatformOptions = computed(() => {
    const source = cockpitMetaFilterStore.data?.sourceOptions ?? []
    const mapped = source
      .map((item) => ({
        nSource: Number(item.value),
        name: item.label
      }))
      .filter((item) => Number.isFinite(item.nSource) && item.nSource > 0)
    return mapped.length > 0 ? mapped : AD_PLATFORMS.map((item) => ({ ...item }))
  })

  // 判断是否生效中（t_start <= today）
  const isActive = (row: CostCoefficientItem) => {
    return row.tStart <= getAppNow().toISOString().slice(0, 10)
  }

  const kpiData = ref<CostCoefficientOverviewKpi>({
    total: 0,
    active: 0,
    platforms: 0,
    monthChanges: 0
  })

  function tableQueryBase() {
    return {
      nSource: filterNSource.value || undefined,
      tStartYear: filterYear.value || undefined,
      keyword: filterKeyword.value || undefined
    }
  }

  function pickFiniteNumber(v: unknown, fallback = 0): number {
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : fallback
  }

  /** 兼容后端缺省/null、蛇形字段别名 */
  function normalizeCostCoefficientItem(raw: Record<string, unknown>): CostCoefficientItem {
    return {
      id: String(raw.id ?? ''),
      nSource: pickFiniteNumber(raw.nSource ?? raw.n_source, 0),
      platformName: String(raw.platformName ?? raw.platform_name ?? ''),
      tStart: String(raw.tStart ?? raw.t_start ?? ''),
      dCostRatio: pickFiniteNumber(raw.dCostRatio ?? raw.d_cost_ratio, 0),
      dInstallCost: pickFiniteNumber(raw.dInstallCost ?? raw.d_install_cost, 0),
      updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ''),
      updatedBy: String(raw.updatedBy ?? raw.updated_by ?? ''),
      remark: String(raw.remark ?? ''),
      isDeleted: Boolean(raw.isDeleted ?? raw.is_deleted ?? false)
    }
  }

  function formatRatio(v: number | null | undefined) {
    return pickFiniteNumber(v, 0).toFixed(3)
  }

  function formatInstallCost(v: number | null | undefined) {
    return pickFiniteNumber(v, 0).toFixed(5)
  }

  async function loadKpiFromApi() {
    try {
      kpiData.value = await fetchCostCoefficientOverviewKpi(tableQueryBase())
    } catch {
      /* 保持上一屏 KPI */
    }
  }

  async function loadTable() {
    try {
      const res = await fetchCostCoefficientTable({
        ...tableQueryBase(),
        page: currentPage.value,
        pageSize: pageSize.value
      })
      const r = res as Api.Common.PaginatedResponse<CostCoefficientItem> & {
        data?: { list?: Record<string, unknown>[]; total?: number }
        list?: Record<string, unknown>[]
      }
      const rawRows = Array.isArray(r.records)
        ? r.records
        : (r.data?.list ?? (Array.isArray(r.list) ? r.list : []))
      list.value = rawRows.map((row) =>
        normalizeCostCoefficientItem(row as Record<string, unknown>)
      )
      serverTotal.value = Number(r.total ?? r.data?.total ?? 0)
    } catch {
      list.value = []
      serverTotal.value = 0
    }
  }

  watch([filterNSource, filterYear, filterKeyword], () => {
    currentPage.value = 1
  })

  watch([filterNSource, filterYear, filterKeyword, currentPage, pageSize], () => {
    loadTable()
    loadKpiFromApi()
  })

  onMounted(() => {
    if (!cockpitMetaFilterStore.data) {
      void cockpitMetaFilterStore.ensureLoaded()
    }
    loadTable()
    loadKpiFromApi()
  })

  // ─── 行高亮 ─────────────────────────────────────────────
  const activeItem = ref<CostCoefficientItem | null>(null)
  const activeHistory = ref<CostCoefficientHistory[]>([])

  const getRowClass = ({ row }: { row: CostCoefficientItem }) => {
    return activeItem.value?.id === row.id ? 'row-selected' : ''
  }

  const drawerVisible = ref(false)

  const handleRowClick = async (row: CostCoefficientItem) => {
    activeItem.value = row
    try {
      const h = await fetchCostCoefficientHistory(row.id)
      activeHistory.value = Array.isArray(h) ? (h as CostCoefficientHistory[]) : getHistory(row.id)
    } catch {
      activeHistory.value = getHistory(row.id)
    }
    drawerVisible.value = true
  }

  // ─── 新增 ───────────────────────────────────────────────
  const formVisible = ref(false)
  const editItem = ref<CostCoefficientItem | null>(null)

  const handleAdd = () => {
    editItem.value = null
    formVisible.value = true
  }

  const handleEdit = (row: CostCoefficientItem) => {
    editItem.value = { ...row }
    formVisible.value = true
  }

  const handleFormSuccess = async (payload: CostCoefficientFormModel, isEdit: boolean) => {
    try {
      if (isEdit && editItem.value) {
        await updateCostCoefficient(editItem.value.id, payload)
      } else {
        await createCostCoefficient(payload)
      }
      await loadTable()
      await loadKpiFromApi()
      ElMessage.success(isEdit ? '保存成功' : '创建成功')
    } catch {
      ElMessage.error(isEdit ? '保存失败' : '创建失败')
      return
    }
    formVisible.value = false
    editItem.value = null
  }

  // ─── 删除 ───────────────────────────────────────────────
  const deleteVisible = ref(false)
  const deleteItem = ref<CostCoefficientItem | null>(null)

  const handleDelete = (row: CostCoefficientItem) => {
    deleteItem.value = row
    deleteVisible.value = true
  }

  const handleDeleteConfirm = async () => {
    if (!deleteItem.value) return
    try {
      await deleteCostCoefficient(deleteItem.value.id)
      await loadTable()
      await loadKpiFromApi()
      if (activeItem.value?.id === deleteItem.value.id) activeItem.value = null
      ElMessage.success('删除成功')
    } catch {
      ElMessage.error('删除失败')
    }
    deleteVisible.value = false
    deleteItem.value = null
  }
</script>

<style lang="scss" scoped>
  .cc-page {
    --bg-page: #0b1120;
    --bg-card: #131c2e;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;
    --accent-dim: rgb(45 212 191 / 10%);

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
  }

  .breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 6px;
    font-size: 13px;
  }

  .bc-parent {
    color: var(--text-secondary);
  }

  .bc-sep {
    color: var(--text-muted);
  }

  .bc-current {
    color: var(--text-secondary);
  }

  .page-title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
    color: var(--text-primary);
  }

  .btn-add {
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

    &:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
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
    padding: 16px 20px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-left: 4px solid;
    border-radius: 10px;

    &--teal {
      border-left-color: #2dd4bf;
    }

    &--blue {
      border-left-color: #60a5fa;
    }

    &--amber {
      border-left-color: #f59e0b;
    }

    &--purple {
      border-left-color: #a78bfa;
    }
  }

  .kpi-label {
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--text-muted);
  }

  .kpi-value {
    font-size: 30px;
    font-weight: 700;
    line-height: 1;

    &--teal {
      color: #2dd4bf;
    }

    &--blue {
      color: #60a5fa;
    }

    &--amber {
      color: #f59e0b;
    }

    &--purple {
      color: #a78bfa;
    }
  }

  .kpi-unit {
    margin-left: 4px;
    font-size: 13px;
    font-weight: 400;
    color: var(--text-muted);
  }

  // ─── 内容区 ──────────────────────────────────────────────
  .content-grid {
    min-width: 0;
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
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--border);
  }

  .filter-title {
    margin-right: 4px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .filter-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-left: auto;
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

  .filter-year {
    width: 110px;

    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      border-radius: 7px;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      color: var(--text-primary);
    }
  }

  .filter-search {
    width: 140px;

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

  .btn-filter {
    padding: 7px 14px !important;
    font-size: 13px !important;
    color: var(--text-secondary) !important;
    background: transparent !important;
    border: 1px solid var(--border) !important;
    border-radius: 7px !important;

    &:hover {
      color: var(--accent) !important;
      border-color: var(--accent) !important;
    }
  }

  .cc-table {
    width: 100%;
    cursor: pointer;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: #0d1626;
    --el-table-row-hover-bg-color: #162035;
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-current-row-bg-color: rgb(45 212 191 / 8%);

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

    :deep(tr) {
      background: transparent !important;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }

    :deep(.row-selected td) {
      background: rgb(45 212 191 / 8%) !important;
    }
  }

  .platform-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .platform-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    border-radius: 6px;
  }

  .platform-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .platform-name {
    font-size: 13px;
    color: var(--text-primary);
  }

  .platform-nsource {
    font-size: 11px;
    color: var(--text-muted);
  }

  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 8px;
    font-size: 12px;
    border-radius: 4px;

    &.status--active {
      color: #22c55e;
      background: rgb(34 197 94 / 12%);
    }

    &.status--pending {
      color: #f59e0b;
      background: rgb(245 158 11 / 12%);
    }
  }

  .status-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    background: currentcolor;
    border-radius: 50%;
  }

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

    &--edit {
      color: #fff;
      background: #3b82f6;

      &:hover {
        background: #2563eb;
      }
    }

    &--del {
      color: #fff;
      background: #ef4444;

      &:hover {
        background: #dc2626;
      }
    }
  }

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

  .cc-pagination {
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

  // ─── 下拉 ────────────────────────────────────────────────
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
