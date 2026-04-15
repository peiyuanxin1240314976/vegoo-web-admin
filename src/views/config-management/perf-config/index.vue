<template>
  <div class="pc-page art-full-height">
    <!-- ── 顶栏 ──────────────────────────────────────────── -->
    <div class="page-topbar">
      <div class="topbar-left">
        <div class="breadcrumb">
          <span class="bc-parent">系统配置</span>
          <span class="bc-sep">›</span>
          <span class="bc-current">绩效配置</span>
        </div>
        <h1 class="page-title">绩效配置</h1>
      </div>
      <div class="topbar-actions">
        <ElButton round class="btn-create" @click="createVisible = true">
          <ElIcon><Plus /></ElIcon>新建配置
        </ElButton>
        <ElButton class="btn-export" @click="handleExport">
          <ElIcon><Download /></ElIcon>导出
        </ElButton>
      </div>
    </div>

    <!-- ── KPI 四卡 ─────────────────────────────────────── -->
    <div class="kpi-row">
      <div class="kpi-card kpi-card--blue">
        <div class="kpi-label">总配置数</div>
        <div class="kpi-value kpi-value--blue">{{ kpi.total }}</div>
      </div>
      <div class="kpi-card kpi-card--teal">
        <div class="kpi-label">已发布</div>
        <div class="kpi-value kpi-value--teal">{{ kpi.published }}</div>
      </div>
      <div class="kpi-card kpi-card--amber">
        <div class="kpi-label">草稿</div>
        <div class="kpi-value kpi-value--amber">{{ kpi.draft }}</div>
      </div>
      <div class="kpi-card kpi-card--gray">
        <div class="kpi-label">已归档</div>
        <div class="kpi-value kpi-value--gray">{{ kpi.archived }}</div>
      </div>
    </div>

    <!-- ── 表格面板 ───────────────────────────────────────── -->
    <div class="table-panel">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-input
          v-model="filterKeyword"
          placeholder="搜索应用名称..."
          class="filter-search"
          clearable
          @input="currentPage = 1"
        >
          <template #prefix
            ><ElIcon><Search /></ElIcon
          ></template>
        </el-input>
        <el-select v-model="filterPlatform" class="filter-select" @change="currentPage = 1">
          <el-option value="" label="终端平台：全部" />
          <el-option
            v-for="opt in metaPlatformOptions"
            :key="opt.value"
            :value="opt.value"
            :label="'终端：' + opt.label"
          />
        </el-select>
        <el-select v-model="filterSource" class="filter-select" @change="currentPage = 1">
          <el-option value="" label="广告平台：全部" />
          <el-option
            v-for="opt in metaSourceOptions"
            :key="opt.value"
            :value="opt.value"
            :label="opt.label"
          />
        </el-select>
        <el-select v-model="filterStatus" class="filter-select" @change="currentPage = 1">
          <el-option value="" label="状态：全部" />
          <el-option value="published" label="已发布" />
          <el-option value="draft" label="草稿" />
          <el-option value="archived" label="已归档" />
        </el-select>
      </div>

      <!-- 表格 -->
      <el-table
        :data="pagedList"
        class="pc-table"
        style="width: 100%"
        :row-class-name="getRowClass"
        highlight-current-row
        @row-click="handleRowClick"
      >
        <el-table-column label="应用名称" min-width="180">
          <template #default="{ row }">
            <div class="app-cell">
              <span class="app-icon" :style="{ background: row.appIcon }">
                {{ row.appName.charAt(0) }}
              </span>
              <span class="app-name">{{ row.appName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="终端平台" min-width="100">
          <template #default="{ row }">
            <span class="platform-tag">{{ platformCellLabel(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="广告平台" min-width="140">
          <template #default="{ row }">
            {{ sourceCellLabels(row) }}
          </template>
        </el-table-column>
        <el-table-column label="评估方式" min-width="100" align="center">
          <template #default="{ row }">{{ row.activeVersion.evalMethod }}</template>
        </el-table-column>
        <el-table-column label="评估天数" min-width="100" align="center">
          <template #default="{ row }">{{ row.activeVersion.evalDays }} 天</template>
        </el-table-column>
        <el-table-column label="达标要求" min-width="110" align="right">
          <template #default="{ row }">
            <span class="rate-val rate-val--target">
              {{
                row.activeVersion.evalMethod === 'ROI'
                  ? row.activeVersion.targetRate + '%'
                  : '$' + row.activeVersion.targetRate
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="最低要求" min-width="110" align="right">
          <template #default="{ row }">
            {{
              row.activeVersion.evalMethod === 'ROI'
                ? row.activeVersion.minRate + '%'
                : '$' + row.activeVersion.minRate
            }}
          </template>
        </el-table-column>
        <el-table-column label="难度系数" min-width="100" align="center">
          <template #default="{ row }">{{ row.activeVersion.difficultyFactor }}</template>
        </el-table-column>
        <el-table-column label="运行状态" min-width="100" align="center">
          <template #default="{ row }">
            <span class="run-badge" :style="{ color: RUN_STATUS_CONFIG[row.runStatus].color }">
              <span
                class="run-dot"
                :style="{ background: RUN_STATUS_CONFIG[row.runStatus].color }"
              />
              {{ RUN_STATUS_CONFIG[row.runStatus].label }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="版本状态" min-width="130" align="center">
          <template #default="{ row }">
            <span
              class="version-badge"
              :style="{
                color: STATUS_CONFIG[row.activeVersion.status].color,
                background: STATUS_CONFIG[row.activeVersion.status].bg
              }"
            >
              {{ STATUS_CONFIG[row.activeVersion.status].label }} v{{ row.activeVersion.version }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120" align="center" fixed="right">
          <template #default="{ row }">
            <button class="action-btn" @click.stop="handleEdit(row)">编辑</button>
            <button class="action-btn action-btn--detail" @click.stop="handleRowClick(row)"
              >详情</button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-bar">
        <span class="total-text">共 {{ filteredList.length }} 条</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredList.length"
          :page-sizes="[10, 20, 50]"
          layout="prev, pager, next, sizes"
          class="pc-pagination"
        />
      </div>
    </div>

    <!-- ── 详情抽屉（el-drawer）──────────────────────────── -->
    <el-drawer
      v-model="drawerVisible"
      :with-header="false"
      size="400px"
      direction="rtl"
      class="pc-detail-drawer"
      :modal="false"
      :append-to-body="false"
      @close="drawerItem = null"
    >
      <div v-if="drawerItem" class="drawer-inner">
        <!-- 抽屉头部 -->
        <div class="drawer-header">
          <div class="drawer-app">
            <span class="drawer-app-icon" :style="{ background: drawerItem.appIcon }">
              {{ drawerItem.appName.charAt(0) }}
            </span>
            <div class="drawer-app-info">
              <span class="drawer-app-name">{{ drawerItem.appName }}</span>
              <div class="drawer-app-tags">
                <span class="drawer-tag">{{ platformCellLabel(drawerItem) }}</span>
                <span
                  v-for="(t, i) in sourceCellLabelParts(drawerItem)"
                  :key="i"
                  class="drawer-tag"
                  >{{ t }}</span
                >
              </div>
            </div>
          </div>
          <div class="drawer-header-icons">
            <ElIcon class="drawer-icon-btn" title="编辑" @click="handleEdit(drawerItem)"
              ><Edit
            /></ElIcon>
            <ElIcon class="drawer-icon-btn" title="关闭" @click="drawerVisible = false"
              ><Close
            /></ElIcon>
          </div>
        </div>

        <!-- 当前激活版本条 -->
        <div class="drawer-active-bar">
          <span class="active-label">当前激活版本：</span>
          <span class="active-version">
            v{{ drawerItem.activeVersion.version }}
            <span :style="{ color: STATUS_CONFIG[drawerItem.activeVersion.status].color }">
              {{ STATUS_CONFIG[drawerItem.activeVersion.status].label }}
            </span>
            ★
          </span>
        </div>

        <!-- 内容滚动区 -->
        <div class="drawer-body">
          <!-- 基本信息 -->
          <div class="drawer-section">
            <div class="drawer-section-title">基本信息</div>
            <div class="drawer-grid">
              <div class="drawer-item">
                <span class="di-label">应用名称</span>
                <span class="di-value">{{ drawerItem.appName }}</span>
              </div>
              <div class="drawer-item">
                <span class="di-label">终端平台</span>
                <span class="di-value">{{ platformCellLabel(drawerItem) }}</span>
              </div>
              <div class="drawer-item">
                <span class="di-label">广告平台</span>
                <span class="di-value">{{ sourceCellLabels(drawerItem) }}</span>
              </div>
              <div class="drawer-item">
                <span class="di-label">运行状态</span>
                <span
                  class="di-value"
                  :style="{ color: RUN_STATUS_CONFIG[drawerItem.runStatus].color }"
                >
                  {{ RUN_STATUS_CONFIG[drawerItem.runStatus].label }}
                </span>
              </div>
              <div class="drawer-item">
                <span class="di-label">允许多投</span>
                <span class="di-value">{{ drawerItem.allowMulti ? '是' : '否' }}</span>
              </div>
              <div class="drawer-item">
                <span class="di-label">评估方式</span>
                <span class="di-value">{{ drawerItem.activeVersion.evalMethod }}</span>
              </div>
              <div class="drawer-item">
                <span class="di-label">评估天数</span>
                <span class="di-value">{{ drawerItem.activeVersion.evalDays }} 天</span>
              </div>
              <div class="drawer-item">
                <span class="di-label">难度系数</span>
                <span class="di-value">{{ drawerItem.activeVersion.difficultyFactor }}</span>
              </div>
            </div>
          </div>

          <!-- 绩效指标 -->
          <div class="drawer-section">
            <div class="drawer-section-title">绩效指标</div>
            <div class="drawer-grid">
              <div class="drawer-item">
                <span class="di-label">达标要求</span>
                <span class="di-value di-value--accent">
                  {{
                    drawerItem.activeVersion.evalMethod === 'ROI'
                      ? drawerItem.activeVersion.targetRate + '%'
                      : '$' + drawerItem.activeVersion.targetRate
                  }}
                </span>
              </div>
              <div class="drawer-item">
                <span class="di-label">最低要求</span>
                <span class="di-value">
                  {{
                    drawerItem.activeVersion.evalMethod === 'ROI'
                      ? drawerItem.activeVersion.minRate + '%'
                      : '$' + drawerItem.activeVersion.minRate
                  }}
                </span>
              </div>
              <div class="drawer-item">
                <span class="di-label">最低利润</span>
                <span class="di-value">
                  {{
                    drawerItem.activeVersion.minProfit != null
                      ? '$' + drawerItem.activeVersion.minProfit.toLocaleString()
                      : '-'
                  }}
                </span>
              </div>
              <div class="drawer-item">
                <span class="di-label">附加条件</span>
                <span class="di-value">{{ drawerItem.activeVersion.extraCondition || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 版本历史 -->
          <div class="drawer-section drawer-section--versions">
            <div class="drawer-section-title">版本历史</div>
            <div class="version-list">
              <div
                v-for="ver in drawerItem.versions"
                :key="ver.version"
                :class="['version-item', ver.isActive && 'version-item--active']"
              >
                <div
                  class="ver-dot"
                  :style="{ background: ver.isActive ? '#2dd4bf' : '#334155' }"
                />
                <div class="ver-body">
                  <div class="ver-head">
                    <span class="ver-name">v{{ ver.version }}</span>
                    <span v-if="ver.isActive" class="ver-active-tag">当前激活</span>
                  </div>
                  <div class="ver-meta">
                    {{ STATUS_CONFIG[ver.status].label }} | {{ ver.publishedAt }} |
                    {{ ver.publishedBy }}
                  </div>
                  <div class="ver-stats">
                    达标{{
                      ver.evalMethod === 'ROI' ? ver.targetRate + '%' : '$' + ver.targetRate
                    }}
                    &nbsp;最低{{
                      ver.evalMethod === 'ROI' ? ver.minRate + '%' : '$' + ver.minRate
                    }}
                    &nbsp;系数{{ ver.difficultyFactor }}
                  </div>
                  <div class="ver-actions">
                    <button class="ver-btn" @click="handleViewVersion(ver)">查看</button>
                    <button
                      v-if="drawerItem.versions.length > 1"
                      class="ver-btn"
                      @click="openCompare(drawerItem!, ver)"
                      >对比</button
                    >
                    <button
                      v-if="!ver.isActive && ver.status !== 'archived'"
                      class="ver-btn ver-btn--activate"
                      @click="handleActivate(ver)"
                      >设为激活</button
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 抽屉底部 -->
        <div class="drawer-footer">
          <ElButton class="btn-new-ver" @click="createVisible = true">
            <ElIcon><Plus /></ElIcon>新建版本
          </ElButton>
          <ElButton class="btn-export-drawer" @click="handleExport">
            <ElIcon><Download /></ElIcon>导出
          </ElButton>
        </div>
      </div>
    </el-drawer>

    <!-- ── 弹窗 ─────────────────────────────────────────── -->
    <PerfCreateDialog v-model:visible="createVisible" @success="handleCreateSuccess" />

    <VersionCompareDialog
      v-if="compareVisible"
      v-model:visible="compareVisible"
      :item="compareItem!"
      :default-version="compareVersion"
      @activate="handleActivate"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { Plus, Download, Search, Edit, Close } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    fetchPerfOverviewKpi,
    fetchPerfTable,
    createPerfConfig,
    activatePerfConfig,
    exportPerfConfig
  } from '@/api/config-management/perf-config'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import type { CockpitMetaOptionItem } from '@/types/cockpit-meta-filter'
  import { PerfConfigApiSource, PerfConfigEndpoint } from './config/data-source'
  import { clonePerfList, STATUS_CONFIG, RUN_STATUS_CONFIG } from './mock/data'
  import PerfCreateDialog from './modules/perf-create-dialog.vue'
  import VersionCompareDialog from './modules/version-compare-dialog.vue'
  import type { PerfConfigItem, PerfVersion } from './types'

  defineOptions({ name: 'PerfConfig' })

  const cockpitMetaStore = useCockpitMetaFilterStore()
  const metaPlatformOptions = computed(() => cockpitMetaStore.data?.platformOptions ?? [])
  const metaSourceOptions = computed(() => cockpitMetaStore.data?.sourceOptions ?? [])

  function optionLabel(options: CockpitMetaOptionItem[], value: string): string {
    if (!value) return ''
    return options.find((o) => o.value === value)?.label ?? value
  }

  function platformCellLabel(row: PerfConfigItem) {
    return optionLabel(metaPlatformOptions.value, row.platform) || row.platform
  }

  function sourceCodes(row: PerfConfigItem) {
    return row.sourceList?.length ? row.sourceList : [row.source]
  }

  function sourceCellLabels(row: PerfConfigItem) {
    return sourceCodes(row)
      .map((c) => optionLabel(metaSourceOptions.value, c) || c)
      .join('、')
  }

  function sourceCellLabelParts(row: PerfConfigItem) {
    return sourceCodes(row).map((c) => optionLabel(metaSourceOptions.value, c) || c)
  }

  // ─── 数据 ──────────────────────────────────────────────
  const list = ref<PerfConfigItem[]>(clonePerfList())
  const filterKeyword = ref('')
  const filterPlatform = ref('')
  const filterSource = ref('')
  const filterStatus = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)

  // ─── KPI（独立接口：与列表同筛选、全量聚合，非当前页） ───────
  const overviewKpi = ref({ total: 0, published: 0, draft: 0, archived: 0 })
  const kpi = computed(() => overviewKpi.value)

  const loadOverviewKpi = async () => {
    try {
      overviewKpi.value = await fetchPerfOverviewKpi(
        {
          keyword: filterKeyword.value || undefined,
          platform: filterPlatform.value || undefined,
          source: filterSource.value || undefined,
          status: filterStatus.value || undefined
        },
        list.value
      )
    } catch {
      overviewKpi.value = { total: 0, published: 0, draft: 0, archived: 0 }
    }
  }

  watch(
    [filterKeyword, filterPlatform, filterSource, filterStatus],
    () => {
      void loadOverviewKpi()
    },
    { flush: 'post' }
  )

  // ─── 筛选 ───────────────────────────────────────────────
  const filteredList = computed(() =>
    list.value.filter((row) => {
      const kw = filterKeyword.value.trim().toLowerCase()
      if (kw && !row.appName.toLowerCase().includes(kw) && !row.appId.toLowerCase().includes(kw)) {
        return false
      }
      if (filterPlatform.value && row.platform !== filterPlatform.value) return false
      if (filterSource.value && !sourceCodes(row).includes(filterSource.value)) return false
      if (filterStatus.value && row.activeVersion.status !== filterStatus.value) return false
      return true
    })
  )

  const pagedList = computed(() => {
    const s = (currentPage.value - 1) * pageSize.value
    return filteredList.value.slice(s, s + pageSize.value)
  })

  // ─── 抽屉 ──────────────────────────────────────────────
  const drawerItem = ref<PerfConfigItem | null>(null)
  const drawerVisible = ref(false)

  watch(drawerVisible, (v) => {
    if (!v) drawerItem.value = null
  })

  const getRowClass = ({ row }: { row: PerfConfigItem }) =>
    drawerItem.value?.id === row.id ? 'row-selected' : ''

  const handleRowClick = (row: PerfConfigItem) => {
    if (drawerItem.value?.id === row.id) {
      drawerVisible.value = false
    } else {
      drawerItem.value = row
      drawerVisible.value = true
    }
  }

  // ─── 新建 ───────────────────────────────────────────────
  const createVisible = ref(false)

  const handleCreateSuccess = (item: PerfConfigItem) => {
    if (!PerfConfigApiSource[PerfConfigEndpoint.Create]) {
      createPerfConfig({
        step1: {
          appId: item.appId,
          appName: item.appName,
          platform: item.platform,
          sourceList: [...item.sourceList],
          runStatus: item.runStatus,
          allowMulti: item.allowMulti
        },
        step2: {
          evalMethod: item.activeVersion.evalMethod,
          evalDays: item.activeVersion.evalDays,
          targetRate: item.activeVersion.targetRate,
          minRate: item.activeVersion.minRate,
          difficultyFactor: item.activeVersion.difficultyFactor,
          minProfit: item.activeVersion.minProfit,
          extraCondition: item.activeVersion.extraCondition
        },
        saveMode: item.activeVersion.status === 'published' ? 'publish' : 'draft'
      }).catch(() => undefined)
    }
    list.value.unshift(item)
    void loadOverviewKpi()
    ElMessage.success('配置已保存')
  }

  // ─── 编辑 ───────────────────────────────────────────────
  const handleEdit = (row: PerfConfigItem) => {
    drawerItem.value = row
    createVisible.value = true
  }

  // ─── 版本操作 ────────────────────────────────────────────
  const handleViewVersion = (ver: PerfVersion) => {
    ElMessage.info(`查看 v${ver.version} 详情`)
  }

  const handleActivate = (ver: PerfVersion) => {
    if (!drawerItem.value) return
    if (!PerfConfigApiSource[PerfConfigEndpoint.Activate]) {
      activatePerfConfig(drawerItem.value.id, ver.version).catch(() => undefined)
    }
    drawerItem.value.versions.forEach((v) => {
      v.isActive = false
    })
    ver.isActive = true
    drawerItem.value.activeVersion = ver
    ElMessage.success(`已将 v${ver.version} 设为激活版本`)
  }

  // ─── 版本对比 ────────────────────────────────────────────
  const compareVisible = ref(false)
  const compareItem = ref<PerfConfigItem | null>(null)
  const compareVersion = ref<PerfVersion | null>(null)

  const openCompare = (item: PerfConfigItem, ver: PerfVersion) => {
    compareItem.value = item
    compareVersion.value = ver
    compareVisible.value = true
  }

  const handleExport = async () => {
    try {
      await exportPerfConfig({
        keyword: filterKeyword.value || undefined,
        platform: filterPlatform.value || undefined,
        source: filterSource.value || undefined,
        status: filterStatus.value || undefined
      })
      ElMessage.success('已开始导出')
    } catch (error) {
      const msg = error instanceof Error && error.message ? error.message : '导出失败'
      ElMessage.error(msg)
    }
  }

  const loadPerfTable = async () => {
    if (PerfConfigApiSource[PerfConfigEndpoint.Table]) return
    try {
      await fetchPerfTable({
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: filterKeyword.value || undefined,
        platform: filterPlatform.value || undefined,
        source: filterSource.value || undefined,
        status: filterStatus.value || undefined
      })
    } catch {
      // keep mock fallback
    }
  }

  onMounted(async () => {
    await cockpitMetaStore.ensureLoaded()
    void loadOverviewKpi()
    void loadPerfTable()
  })
</script>

<style lang="scss" scoped>
  .pc-page {
    --bg-page: #0b1120;
    --bg-card: #131c2e;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;

    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0 24px 24px;
    overflow: hidden;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: var(--text-primary);
    background: var(--bg-page);
  }

  // ── 顶栏 ────────────────────────────────────────────────
  .page-topbar {
    display: flex;
    flex-shrink: 0;
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

  .topbar-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .btn-create {
    display: inline-flex !important;
    gap: 5px !important;
    align-items: center !important;
    padding: 10px 20px !important;
    font-size: 14px !important;
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
    display: inline-flex !important;
    gap: 5px !important;
    align-items: center !important;
    color: var(--text-secondary) !important;
    background: var(--bg-card) !important;
    border: 1px solid var(--border) !important;
    border-radius: 8px !important;

    &:hover {
      color: var(--accent) !important;
      border-color: var(--accent) !important;
    }
  }

  // ── KPI ─────────────────────────────────────────────────
  .kpi-row {
    display: grid;
    flex-shrink: 0;
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

    &--blue {
      border-left-color: #3b82f6;
    }

    &--teal {
      border-left-color: #2dd4bf;
    }

    &--amber {
      border-left-color: #f59e0b;
    }

    &--gray {
      border-left-color: #64748b;
    }
  }

  .kpi-label {
    margin-bottom: 6px;
    font-size: 13px;
    color: var(--text-muted);
  }

  .kpi-value {
    font-size: 32px;
    font-weight: 700;
    line-height: 1;

    &--blue {
      color: #60a5fa;
    }

    &--teal {
      color: #2dd4bf;
    }

    &--amber {
      color: #f59e0b;
    }

    &--gray {
      color: #64748b;
    }
  }

  // ── 表格面板 ────────────────────────────────────────────
  .table-panel {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .filter-bar {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
  }

  .filter-search {
    width: 200px;

    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      border-radius: 7px;
      box-shadow: none !important;

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

  .filter-select {
    width: 140px;

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

  .pc-table {
    flex: 1;
    overflow: auto;
    cursor: pointer;
    background: transparent !important;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: #0d1626;
    --el-table-row-hover-bg-color: #162035;
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-current-row-bg-color: rgb(45 212 191 / 8%);

    :deep(th.el-table__cell) {
      padding: 11px 14px;
      font-size: 12px;
      white-space: nowrap;
      background: #0d1626 !important;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(td.el-table__cell) {
      padding: 12px 14px;
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
      border-left: 2px solid var(--accent);
    }
  }

  .app-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .app-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    border-radius: 7px;
  }

  .app-name {
    font-size: 13px;
    color: var(--text-primary);
    white-space: nowrap;
  }

  .platform-tag {
    padding: 3px 8px;
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    background: rgb(255 255 255 / 5%);
    border-radius: 4px;
  }

  .run-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }

  .run-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .rate-val--target {
    font-weight: 600;
    color: var(--accent);
  }

  .version-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    border-radius: 4px;
  }

  .action-btn {
    padding: 3px 10px;
    font-size: 12px;
    color: #60a5fa;
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: 1px solid rgb(96 165 250 / 30%);
    border-radius: 4px;
    transition: all 0.15s;

    & + & {
      margin-left: 5px;
    }

    &:hover {
      color: #fff;
      background: #3b82f6;
      border-color: #3b82f6;
    }

    &--detail {
      color: var(--accent);
      border-color: rgb(45 212 191 / 30%);

      &:hover {
        color: #fff;
        background: var(--accent);
        border-color: var(--accent);
      }
    }
  }

  .pagination-bar {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-top: 1px solid var(--border);
  }

  .total-text {
    font-size: 13px;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .pc-pagination {
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

    :deep(.el-select .el-select__wrapper) {
      color: var(--text-secondary) !important;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      box-shadow: none !important;
    }
  }

  // ── el-drawer 全局覆盖 ───────────────────────────────────
  .pc-detail-drawer {
    :deep(.el-drawer) {
      background: #131c2e;
      border-left: 1px solid rgb(255 255 255 / 7%);
      box-shadow: -8px 0 32px rgb(0 0 0 / 40%);
    }

    :deep(.el-drawer__body) {
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
    }
  }

  // ── 抽屉内容 ─────────────────────────────────────────────
  .drawer-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: var(--text-primary);
  }

  .drawer-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    border-bottom: 1px solid var(--border);
  }

  .drawer-app {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .drawer-app-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    border-radius: 11px;
  }

  .drawer-app-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .drawer-app-tags {
    display: flex;
    gap: 5px;
    margin-top: 4px;
  }

  .drawer-tag {
    padding: 2px 8px;
    font-size: 11px;
    color: var(--text-secondary);
    background: rgb(255 255 255 / 6%);
    border-radius: 3px;
  }

  .drawer-header-icons {
    display: flex;
    gap: 10px;
  }

  .drawer-icon-btn {
    font-size: 17px;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
      color: var(--text-primary);
    }
  }

  .drawer-active-bar {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
    align-items: center;
    padding: 10px 18px;
    font-size: 12px;
    background: rgb(45 212 191 / 5%);
    border-bottom: 1px solid var(--border);
  }

  .active-label {
    color: var(--text-muted);
  }

  .active-version {
    display: flex;
    gap: 5px;
    align-items: center;
    font-weight: 600;
    color: var(--text-primary);
  }

  .drawer-body {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #1e293b transparent;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #1e293b;
      border-radius: 3px;
    }
  }

  .drawer-section {
    padding: 14px 18px;
    border-bottom: 1px solid var(--border);

    &:last-child {
      border-bottom: none;
    }
  }

  .drawer-section-title {
    margin-bottom: 12px;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .drawer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;
  }

  .drawer-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .di-label {
    font-size: 11px;
    color: var(--text-muted);
  }

  .di-value {
    font-size: 13px;
    color: var(--text-primary);

    &--accent {
      font-weight: 600;
      color: var(--accent);
    }
  }

  // 版本历史
  .version-list {
    display: flex;
    flex-direction: column;
  }

  .version-item {
    display: flex;
    gap: 10px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);

    &:last-child {
      border-bottom: none;
    }

    &--active .ver-name {
      color: var(--accent);
    }
  }

  .ver-dot {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    margin-top: 4px;
    border-radius: 50%;
  }

  .ver-head {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 3px;
  }

  .ver-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .ver-active-tag {
    padding: 1px 6px;
    font-size: 10px;
    color: var(--accent);
    background: rgb(45 212 191 / 12%);
    border-radius: 3px;
  }

  .ver-meta {
    margin-bottom: 2px;
    font-size: 11px;
    color: var(--text-muted);
  }

  .ver-stats {
    margin-bottom: 7px;
    font-size: 11px;
    color: var(--text-secondary);
  }

  .ver-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .ver-btn {
    padding: 3px 9px;
    font-size: 11px;
    color: var(--accent);
    cursor: pointer;
    background: transparent;
    border: 1px solid rgb(45 212 191 / 30%);
    border-radius: 3px;

    &:hover {
      background: rgb(45 212 191 / 10%);
    }

    &--activate {
      color: #f59e0b;
      border-color: rgb(245 158 11 / 30%);

      &:hover {
        background: rgb(245 158 11 / 10%);
      }
    }
  }

  .drawer-footer {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    padding: 14px 18px;
    border-top: 1px solid var(--border);
  }

  .btn-new-ver {
    display: inline-flex !important;
    flex: 1;
    gap: 5px !important;
    align-items: center !important;
    justify-content: center !important;
    font-weight: 600 !important;
    color: #0b1120 !important;
    background: var(--accent) !important;
    border: none !important;
    border-radius: 7px !important;

    &:hover {
      filter: brightness(1.1);
    }
  }

  .btn-export-drawer {
    display: inline-flex !important;
    gap: 5px !important;
    align-items: center !important;
    color: var(--text-secondary) !important;
    background: var(--bg-card) !important;
    border: 1px solid var(--border) !important;
    border-radius: 7px !important;

    &:hover {
      color: var(--accent) !important;
      border-color: var(--accent) !important;
    }
  }

  // 下拉全局覆盖
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
