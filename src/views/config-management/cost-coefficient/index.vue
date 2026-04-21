<template>
  <div class="account-sub-page credential-page cc-page art-full-height">
    <div class="account-sub-page__toolbar">
      <div class="account-sub-page__toolbar-fx" aria-hidden="true" />
      <div class="account-sub-page__toolbar-row">
        <div class="account-sub-page__toolbar-copy">
          <span class="account-sub-page__toolbar-line" aria-hidden="true" />
          <div class="account-sub-page__toolbar-titles">
            <span class="account-sub-page__toolbar-eyebrow">Cost</span>
            <span class="account-sub-page__toolbar-title">成本系数管理</span>
          </div>
          <span class="account-sub-page__toolbar-hint">折算比例、安装成本与生效区间维护</span>
        </div>
        <div class="account-sub-page__toolbar-actions">
          <ElButton type="primary" round class="account-sub-page__btn-primary" @click="handleAdd">
            <ElIcon><Plus /></ElIcon>新增系数
          </ElButton>
        </div>
      </div>
    </div>

    <section class="account-sub-page__list-panel credential-page__panel" aria-label="成本系数管理">
      <div class="account-sub-page__list-panel-fx" aria-hidden="true" />
      <div class="account-sub-page__list-panel-body credential-page__panel-body">
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
                <ElButton type="primary" round class="account-sub-page__btn-primary btn-query"
                  >筛选</ElButton
                >
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
                    <span
                      class="platform-icon"
                      :style="{ background: getPlatform(row.nSource).color }"
                    >
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
                  <span
                    :class="['status-badge', isActive(row) ? 'status--active' : 'status--pending']"
                  >
                    <span class="status-dot" />
                    {{ isActive(row) ? '生效中' : '待生效' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" align="center" fixed="right">
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
      </div>
    </section>

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
  .account-sub-page.credential-page.cc-page {
    --page-border: color-mix(in srgb, var(--el-color-primary) 16%, transparent);
    --page-text-main: color-mix(in srgb, var(--text-primary) 92%, white 8%);
    --as-border: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --as-surface: color-mix(in srgb, var(--default-box-color) 94%, transparent);
    --as-header-bg: color-mix(in srgb, var(--default-box-color) 78%, black 4%);
    --bg-card: var(--as-surface);
    --border: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    --accent: var(--el-color-primary);
    --accent-dim: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    --text-primary: var(--text-primary);
    --text-secondary: var(--text-secondary);
    --text-muted: var(--text-tertiary);

    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding: 24px;
    overflow: clip auto;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 13px;
    color: var(--page-text-main);
    background: var(--default-bg-color);
    isolation: isolate;
  }

  .account-sub-page.credential-page.cc-page::before {
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

  .account-sub-page.credential-page.cc-page > * {
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
    flex: 1 1 200px;
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

  .btn-query.el-button {
    height: 32px !important;
    padding: 0 16px !important;
    font-size: 13px !important;
  }

  // ─── KPI ────────────────────────────────────────────────
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 14px;
  }

  .kpi-card {
    padding: 16px 20px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-left: 4px solid;
    border-radius: 10px;

    &--teal {
      border-left-color: var(--accent);
    }

    &--blue {
      border-left-color: var(--el-color-info);
    }

    &--amber {
      border-left-color: var(--art-warning);
    }

    &--purple {
      border-left-color: color-mix(in srgb, var(--el-color-primary) 45%, #8b5cf6 55%);
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
      color: var(--accent);
    }

    &--blue {
      color: var(--el-color-info);
    }

    &--amber {
      color: var(--art-warning);
    }

    &--purple {
      color: color-mix(in srgb, var(--el-color-primary) 40%, #a78bfa 60%);
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
      background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
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
      background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
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

  .cc-table {
    width: 100%;
    cursor: pointer;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: var(--as-header-bg);
    --el-table-row-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-current-row-bg-color: color-mix(in srgb, var(--el-color-primary) 8%, transparent);

    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 11px 10px;
      font-size: 12px;
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

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }

    :deep(.row-selected td) {
      background: color-mix(in srgb, var(--el-color-primary) 8%, transparent) !important;
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
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 12%, transparent);
    }

    &.status--pending {
      color: var(--art-warning);
      background: color-mix(in srgb, var(--art-warning) 12%, transparent);
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
      color: var(--el-color-primary);
      background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
      border: 1px solid color-mix(in srgb, var(--el-color-primary) 35%, transparent);

      &:hover {
        background: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
      }
    }

    &--del {
      color: var(--art-danger);
      background: color-mix(in srgb, var(--art-danger) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--art-danger) 35%, transparent);

      &:hover {
        background: color-mix(in srgb, var(--art-danger) 16%, transparent);
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

  // ─── 下拉 ────────────────────────────────────────────────
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
    .kpi-row {
      grid-template-columns: repeat(2, 1fr);
    }

    .account-sub-page__toolbar-actions {
      justify-content: flex-start;
    }
  }

  @media (width <= 600px) {
    .account-sub-page__toolbar-row {
      flex-direction: column;
      align-items: stretch;
    }

    .kpi-row {
      grid-template-columns: 1fr 1fr;
    }

    .filter-controls {
      width: 100%;
      margin-left: 0;
    }

    .filter-select,
    .filter-year,
    .filter-search {
      width: 100%;
      min-width: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .account-sub-page__btn-primary.el-button--primary:hover {
      transform: none;
    }
  }
</style>
