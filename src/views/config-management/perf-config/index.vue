<template>
  <div class="account-sub-page credential-page pc-page art-full-height">
    <div class="account-sub-page__toolbar">
      <div class="account-sub-page__toolbar-fx" aria-hidden="true" />
      <div class="account-sub-page__toolbar-row">
        <div class="account-sub-page__toolbar-copy">
          <span class="account-sub-page__toolbar-line" aria-hidden="true" />
          <div class="account-sub-page__toolbar-titles">
            <span class="account-sub-page__toolbar-eyebrow">Performance</span>
            <span class="account-sub-page__toolbar-title">绩效配置</span>
          </div>
          <span class="account-sub-page__toolbar-hint">版本、指标与多平台筛选</span>
        </div>
        <div class="account-sub-page__toolbar-actions">
          <ElButton
            type="primary"
            round
            class="account-sub-page__btn-primary"
            @click="createVisible = true"
          >
            <ElIcon><Plus /></ElIcon>新建配置
          </ElButton>
          <ElButton round class="account-sub-page__btn-secondary" @click="handleExport">
            <ElIcon><Download /></ElIcon>导出
          </ElButton>
        </div>
      </div>
    </div>

    <section class="account-sub-page__list-panel credential-page__panel" aria-label="绩效配置">
      <div class="account-sub-page__list-panel-fx" aria-hidden="true" />
      <div class="account-sub-page__list-panel-body credential-page__panel-body">
        <!-- ── KPI 四卡 ─────────────────────────────────────── -->
        <div class="kpi-row">
          <div class="kpi-card kpi-card--blue">
            <div class="kpi-label">总配置数</div>
            <div class="kpi-value kpi-value--blue">{{ kpi.total }}</div>
          </div>
          <!-- <div class="kpi-card kpi-card--teal">
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
          </div> -->
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
              @keyup.enter="handleQuery"
            >
              <template #prefix
                ><ElIcon><Search /></ElIcon
              ></template>
            </el-input>
            <el-select v-model="filterPlatform" class="filter-select" placeholder="终端平台">
              <el-option value="" label="终端平台：全部" />
              <el-option
                v-for="opt in metaPlatformOptions"
                :key="opt.value"
                :value="opt.value"
                :label="'终端：' + opt.label"
              />
            </el-select>
            <el-select v-model="filterSource" class="filter-select" placeholder="广告平台">
              <el-option value="" label="广告平台：全部" />
              <el-option
                v-for="opt in metaSourceOptions"
                :key="opt.value"
                :value="opt.value"
                :label="opt.label"
              />
            </el-select>
            <!-- <el-select v-model="filterStatus" class="filter-select" placeholder="状态">
              <el-option value="" label="状态：全部" />
              <el-option value="published" label="已发布" />
              <el-option value="draft" label="草稿" />
              <el-option value="archived" label="已归档" />
            </el-select> -->
            <ElButton round type="primary" @click="handleQuery">
              <ElIcon><Search /></ElIcon>查询
            </ElButton>
          </div>

          <!-- 表格 -->
          <el-table
            :data="tableRows"
            v-loading="tableLoading"
            element-loading-text="加载中..."
            :empty-text="tableLoading ? '加载中...' : '暂无数据'"
            class="pc-table"
            style="width: 100%"
            :row-class-name="getRowClass"
            :row-style="getRowStyle"
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
                    formatPerfRequirementDisplay(
                      row.activeVersion.evalMethod,
                      row.activeVersion.targetRate
                    )
                  }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="最低要求" min-width="110" align="right">
              <template #default="{ row }">
                {{
                  formatPerfRequirementDisplay(
                    row.activeVersion.evalMethod,
                    row.activeVersion.minRate
                  )
                }}
              </template>
            </el-table-column>
            <el-table-column label="难度系数" min-width="100" align="center">
              <template #default="{ row }">{{ row.activeVersion.difficultyFactor }}</template>
            </el-table-column>
            <!-- <el-table-column label="运行状态" min-width="100" align="center">
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
                  {{ STATUS_CONFIG[row.activeVersion.status].label }} v{{
                    row.activeVersion.version
                  }}
                </span>
              </template>
            </el-table-column> -->
            <el-table-column label="操作" min-width="220" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-cell">
                  <ElButton
                    text
                    type="primary"
                    class="action-row-edit-btn"
                    @click.stop="handleEdit(row)"
                  >
                    编辑
                  </ElButton>
                  <span class="action-sep" aria-hidden="true">|</span>
                  <button
                    type="button"
                    class="action-btn action-btn--secondary"
                    @click.stop="handleRowClick(row)"
                  >
                    详情
                  </button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div v-if="paginationTotal > 0" class="pagination-bar">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="paginationTotal"
              :page-sizes="[10, 20, 50, 9999]"
              background
              layout="total, prev, pager, next, sizes"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ── 详情抽屉（el-drawer）──────────────────────────── -->
    <el-drawer
      v-model="drawerVisible"
      :with-header="false"
      size="400px"
      direction="rtl"
      class="pc-detail-drawer"
      append-to-body
      :close-on-click-modal="true"
      :close-on-press-escape="true"
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
            <!-- <ElIcon class="drawer-icon-btn" title="编辑" @click="handleEdit(drawerItem)"
              ><Edit
            /></ElIcon> -->
            <ElIcon class="drawer-icon-btn" title="关闭" @click="closeDetailDrawer"
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
              <!-- <div class="drawer-item">
                <span class="di-label">运行状态</span>
                <span
                  class="di-value"
                  :style="{ color: RUN_STATUS_CONFIG[drawerItem.runStatus].color }"
                >
                  {{ RUN_STATUS_CONFIG[drawerItem.runStatus].label }}
                </span>
              </div> -->
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
                    formatPerfRequirementDisplay(
                      drawerItem.activeVersion.evalMethod,
                      drawerItem.activeVersion.targetRate
                    )
                  }}
                </span>
              </div>
              <div class="drawer-item">
                <span class="di-label">最低要求</span>
                <span class="di-value">
                  {{
                    formatPerfRequirementDisplay(
                      drawerItem.activeVersion.evalMethod,
                      drawerItem.activeVersion.minRate
                    )
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
                <div :class="['ver-dot', ver.isActive ? 'ver-dot--active' : 'ver-dot--inactive']" />
                <div class="ver-body">
                  <div class="ver-head">
                    <span class="ver-name">v{{ ver.version }}</span>
                    <span v-if="ver.isActive" class="ver-active-tag">当前激活</span>
                  </div>
                  <div class="ver-meta">
                    {{ ver.publishedAt }} |
                    {{ ver.publishedBy }}
                  </div>
                  <div class="ver-stats">
                    达标{{
                      formatPerfRequirementDisplay(ver.evalMethod, ver.targetRate)
                    }}
                    &nbsp;最低{{
                      formatPerfRequirementDisplay(ver.evalMethod, ver.minRate)
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
          <!-- <ElButton
            type="primary"
            round
            class="account-sub-page__btn-primary drawer-footer__btn"
            @click="openCreateDialogFromDrawer"
          >
            <ElIcon><Plus /></ElIcon>新建版本
          </ElButton>
          <ElButton
            round
            class="account-sub-page__btn-secondary drawer-footer__btn"
            @click="handleExport"
          >
            <ElIcon><Download /></ElIcon>导出
          </ElButton> -->
          <!-- <ElButton
            round
            class="account-sub-page__btn-secondary drawer-footer__btn"
            @click="closeDetailDrawer"
          >
            <ElIcon><Close /></ElIcon>关闭
          </ElButton> -->
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
  import { Plus, Download, Search, Close } from '@element-plus/icons-vue'
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
  import { clonePerfList, STATUS_CONFIG } from './mock/data'
  import PerfCreateDialog from './modules/perf-create-dialog.vue'
  import VersionCompareDialog from './modules/version-compare-dialog.vue'
  import type { EvalMethod, PerfConfigItem, PerfVersion } from './types'
  import { formatPerfRequirementDisplay } from './utils/perf-requirement-display'

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

  const DEFAULT_VERSION: PerfVersion = {
    version: 1,
    status: 'draft',
    publishedAt: '',
    publishedBy: '',
    evalMethod: 'ROI',
    evalDays: 1,
    targetRate: 0,
    minRate: 0,
    difficultyFactor: 1,
    minProfit: null,
    extraCondition: '',
    isActive: false
  }

  function normalizeEvalMethod(raw: unknown): string {
    if (typeof raw === 'string') {
      const s = raw.trim()
      if (s) return s
    }
    return 'ROI'
  }

  /** 新建弹窗提交的 step2 仍为 ROI | CPA；列表接口可能返回其它文案 */
  function evalMethodForCreatePayload(m: string): EvalMethod {
    return m === 'CPA' ? 'CPA' : 'ROI'
  }

  function normalizeVersion(
    raw: Partial<PerfVersion> | null | undefined,
    fallbackVersion = 1
  ): PerfVersion {
    return {
      version: raw?.version ?? fallbackVersion,
      status:
        raw?.status === 'published' || raw?.status === 'archived' || raw?.status === 'draft'
          ? raw.status
          : 'draft',
      publishedAt: raw?.publishedAt ?? '',
      publishedBy: raw?.publishedBy ?? '',
      evalMethod: normalizeEvalMethod(raw?.evalMethod),
      evalDays: raw?.evalDays ?? 1,
      targetRate: raw?.targetRate ?? 0,
      minRate: raw?.minRate ?? 0,
      difficultyFactor: raw?.difficultyFactor ?? 1,
      minProfit: raw?.minProfit ?? null,
      extraCondition: raw?.extraCondition ?? '',
      isActive: Boolean(raw?.isActive)
    }
  }

  function normalizeItem(raw: PerfConfigItem): PerfConfigItem {
    const versions = Array.isArray(raw.versions) ? raw.versions : []
    const normalizedVersions = versions.map((ver, index) =>
      normalizeVersion(ver as Partial<PerfVersion>, index + 1)
    )
    const activeFromList =
      normalizedVersions.find((ver) => ver.isActive) ??
      normalizedVersions.find((ver) => ver.status === 'published') ??
      normalizedVersions[0]
    const activeVersion = normalizeVersion(
      raw.activeVersion as Partial<PerfVersion>,
      activeFromList?.version ?? 1
    )
    const effectiveActiveVersion =
      raw.activeVersion?.status == null && activeFromList ? activeFromList : activeVersion
    return {
      ...raw,
      sourceList: raw.sourceList?.length ? raw.sourceList : raw.source ? [raw.source] : [],
      runStatus:
        raw.runStatus === 'running' || raw.runStatus === 'paused' || raw.runStatus === 'stopped'
          ? raw.runStatus
          : 'stopped',
      activeVersion: effectiveActiveVersion,
      versions: normalizedVersions.length
        ? normalizedVersions
        : [normalizeVersion(DEFAULT_VERSION, 1)]
    }
  }

  // ─── 数据 ──────────────────────────────────────────────
  const list = ref<PerfConfigItem[]>(clonePerfList().map(normalizeItem))
  const filterKeyword = ref('')
  const filterPlatform = ref('')
  const filterSource = ref('')
  const filterStatus = ref('')
  const queriedKeyword = ref('')
  const queriedPlatform = ref('')
  const queriedSource = ref('')
  const queriedStatus = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const tableLoading = ref(false)
  const tableTotal = ref(0)
  const isTableRemote = computed(() => !PerfConfigApiSource[PerfConfigEndpoint.Table])

  // ─── KPI（独立接口：与列表同筛选、全量聚合，非当前页） ───────
  const overviewKpi = ref({ total: 0, published: 0, draft: 0, archived: 0 })
  const kpi = computed(() => overviewKpi.value)

  const loadOverviewKpi = async () => {
    try {
      const res = await fetchPerfOverviewKpi(
        {
          keyword: queriedKeyword.value || undefined,
          platform: queriedPlatform.value || undefined,
          source: queriedSource.value || undefined,
          status: queriedStatus.value || undefined
        },
        list.value
      )
      overviewKpi.value = {
        total: res?.total ?? 0,
        published: res?.published ?? 0,
        draft: res?.draft ?? 0,
        archived: res?.archived ?? 0
      }
    } catch {
      overviewKpi.value = { total: 0, published: 0, draft: 0, archived: 0 }
    }
  }

  // ─── 筛选 ───────────────────────────────────────────────
  const filteredList = computed(() =>
    list.value.filter((row) => {
      const kw = queriedKeyword.value.trim().toLowerCase()
      if (kw && !row.appName.toLowerCase().includes(kw) && !row.appId.toLowerCase().includes(kw)) {
        return false
      }
      if (queriedPlatform.value && row.platform !== queriedPlatform.value) return false
      if (queriedSource.value && !sourceCodes(row).includes(queriedSource.value)) return false
      if (queriedStatus.value && row.activeVersion.status !== queriedStatus.value) return false
      return true
    })
  )

  const pagedList = computed(() => {
    const s = (currentPage.value - 1) * pageSize.value
    return filteredList.value.slice(s, s + pageSize.value)
  })

  const tableRows = computed(() => (isTableRemote.value ? list.value : pagedList.value))
  const paginationTotal = computed(() =>
    isTableRemote.value ? tableTotal.value : filteredList.value.length
  )

  // ─── 抽屉 ──────────────────────────────────────────────
  const drawerItem = ref<PerfConfigItem | null>(null)
  const drawerVisible = ref(false)

  watch(drawerVisible, (v) => {
    if (!v) drawerItem.value = null
  })

  const getRowClass = ({ row }: { row: PerfConfigItem }) =>
    drawerItem.value?.id === row.id ? 'row-selected fx-table-row-enter' : 'fx-table-row-enter'

  const getRowStyle = ({ rowIndex }: { rowIndex: number }) => ({
    '--fx-row-idx': String(rowIndex)
  })

  const closeDetailDrawer = () => {
    drawerVisible.value = false
  }

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

  // function openCreateDialogFromDrawer() {
  //   createVisible.value = true
  //   closeDetailDrawer()
  // }

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
          evalMethod: evalMethodForCreatePayload(item.activeVersion.evalMethod),
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
    list.value.unshift(normalizeItem(item))
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
    tableLoading.value = true
    try {
      const res = await fetchPerfTable({
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: queriedKeyword.value || undefined,
        platform: queriedPlatform.value || undefined,
        source: queriedSource.value || undefined,
        status: queriedStatus.value || undefined
      })
      list.value = (res.records ?? []).map(normalizeItem)
      tableTotal.value = res.total ?? 0
      if (list.value.length === 0) {
        drawerVisible.value = false
      }
    } catch {
      list.value = []
      tableTotal.value = 0
      drawerVisible.value = false
    } finally {
      tableLoading.value = false
    }
  }

  const handleQuery = () => {
    queriedKeyword.value = filterKeyword.value
    queriedPlatform.value = filterPlatform.value
    queriedSource.value = filterSource.value
    queriedStatus.value = filterStatus.value
    void loadOverviewKpi()
    if (currentPage.value !== 1) {
      currentPage.value = 1
      return
    }
    void loadPerfTable()
  }

  watch(
    [currentPage, pageSize],
    () => {
      void loadPerfTable()
    },
    { flush: 'post' }
  )

  onMounted(async () => {
    await cockpitMetaStore.ensureLoaded()
    handleQuery()
  })
</script>

<style lang="scss" scoped>
  .account-sub-page.credential-page.pc-page {
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

  .account-sub-page.credential-page.pc-page::before {
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

  .account-sub-page.credential-page.pc-page > * {
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

  // ── KPI ─────────────────────────────────────────────────
  .kpi-row {
    display: grid;
    flex-shrink: 0;
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

    &--blue {
      border-left-color: var(--el-color-info);
    }

    &--teal {
      border-left-color: var(--accent);
    }

    &--amber {
      border-left-color: var(--art-warning);
    }

    &--gray {
      border-left-color: color-mix(in srgb, var(--text-tertiary) 70%, var(--el-color-primary) 30%);
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
      color: var(--el-color-info);
    }

    &--teal {
      color: var(--accent);
    }

    &--amber {
      color: var(--art-warning);
    }

    &--gray {
      color: var(--text-tertiary);
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

  .filter-select {
    width: 140px;

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

  .pc-table {
    flex: 1;
    overflow: auto;
    cursor: pointer;
    background: transparent !important;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: var(--as-header-bg);
    --el-table-row-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-current-row-bg-color: color-mix(in srgb, var(--el-color-primary) 8%, transparent);

    :deep(th.el-table__cell) {
      padding: 11px 14px;
      font-size: 12px;
      white-space: nowrap;
      background: var(--as-header-bg) !important;
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
      background: color-mix(in srgb, var(--el-color-primary) 8%, transparent) !important;
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
    background: color-mix(in srgb, var(--default-box-color) 50%, transparent);
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

  .action-cell {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: center;
  }

  :deep(.action-row-edit-btn.el-button) {
    height: auto;
    min-height: 0;
    padding: 4px 6px;
    margin: 0;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
    border-radius: 6px;
  }

  .action-btn {
    padding: 4px 6px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
    white-space: nowrap;
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 6px;
    transition:
      color var(--duration-fast) var(--ease-out),
      background-color var(--duration-fast) var(--ease-out);

    &--secondary {
      color: var(--text-secondary);

      &:hover {
        color: var(--text-primary);
        background: color-mix(in srgb, var(--default-box-color) 70%, transparent);
      }

      &:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--text-secondary) 35%, transparent);
        outline-offset: 2px;
      }
    }
  }

  .action-sep {
    flex-shrink: 0;
    padding: 0 1px;
    font-size: 12px;
    line-height: 1;
    color: color-mix(in srgb, var(--border) 85%, transparent);
    user-select: none;
  }

  .pagination-bar {
    display: flex;
    flex-shrink: 0;
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

  // .pc-pagination {
  //   :deep(.el-pager li) {
  //     min-width: 28px;
  //     height: 28px;
  //     font-size: 13px;
  //     line-height: 28px;
  //     color: var(--text-secondary);
  //     background: transparent;
  //     border-radius: 5px;

  //     &:hover {
  //       color: var(--accent);
  //     }

  //     &.is-active {
  //       font-weight: 700;
  //       color: #fff;
  //       background: var(--accent);
  //     }
  //   }

  //   :deep(.btn-prev),
  //   :deep(.btn-next) {
  //     color: var(--text-secondary) !important;
  //     background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
  //     border: 1px solid var(--border) !important;
  //     border-radius: 5px;

  //     &:hover {
  //       color: var(--accent) !important;
  //       border-color: var(--accent) !important;
  //     }
  //   }

  //   :deep(.el-select .el-select__wrapper) {
  //     color: var(--text-secondary) !important;
  //     background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
  //     border: 1px solid var(--border) !important;
  //     box-shadow: none !important;
  //   }
  // }

  // ── el-drawer 全局覆盖 ───────────────────────────────────
  .pc-detail-drawer {
    :deep(.el-drawer) {
      background: color-mix(in srgb, var(--default-box-color) 94%, transparent);
      border-left: 1px solid var(--border);
      box-shadow: -8px 0 32px rgb(0 0 0 / 28%);
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
    background: color-mix(in srgb, var(--default-box-color) 55%, transparent);
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
    background: color-mix(in srgb, var(--el-color-primary) 6%, transparent);
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
    scrollbar-color: color-mix(in srgb, var(--el-color-primary) 22%, transparent) transparent;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--default-box-color) 70%, black 12%);
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

    &--active {
      background: var(--accent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    }

    &--inactive {
      background: color-mix(in srgb, var(--text-tertiary) 55%, var(--default-box-color) 45%);
    }
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
    background: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
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
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 35%, transparent);
    border-radius: 3px;

    &:hover {
      background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
    }

    &--activate {
      color: var(--art-warning);
      border-color: color-mix(in srgb, var(--art-warning) 35%, transparent);

      &:hover {
        background: color-mix(in srgb, var(--art-warning) 12%, transparent);
      }
    }
  }

  .drawer-footer {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 8px;
    padding: 14px 18px;
    border-top: 1px solid var(--border);
  }

  .drawer-footer__btn.account-sub-page__btn-primary {
    flex: 1;
    justify-content: center;
  }

  // 下拉全局覆盖
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

    .filter-search,
    .filter-select {
      width: 100%;
      min-width: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .account-sub-page__btn-primary.el-button--primary:hover,
    .account-sub-page__btn-secondary.el-button:hover {
      transform: none;
    }
  }
</style>
