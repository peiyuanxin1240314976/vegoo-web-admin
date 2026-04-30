<template>
  <div class="account-sub-page credential-page optimizer-page art-full-height">
    <div class="account-sub-page__toolbar">
      <div class="account-sub-page__toolbar-fx" aria-hidden="true" />
      <div class="account-sub-page__toolbar-row">
        <div class="account-sub-page__toolbar-copy">
          <span class="account-sub-page__toolbar-line" aria-hidden="true" />
          <div class="account-sub-page__toolbar-titles">
            <span class="account-sub-page__toolbar-eyebrow">Optimizer</span>
            <span class="account-sub-page__toolbar-title">优化师管理</span>
          </div>
          <span class="account-sub-page__toolbar-hint">人员档案、消耗指标与列表导出</span>
        </div>
        <div class="account-sub-page__toolbar-actions">
          <ElButton type="primary" round class="account-sub-page__btn-primary" @click="handleAdd">
            <ElIcon><Plus /></ElIcon>新增优化师
          </ElButton>
          <ElButton round class="account-sub-page__btn-secondary" @click="handleExport">
            <ElIcon><Download /></ElIcon>导出
          </ElButton>
        </div>
      </div>
    </div>

    <section class="account-sub-page__list-panel credential-page__panel" aria-label="优化师管理">
      <div class="account-sub-page__list-panel-fx" aria-hidden="true" />
      <div class="account-sub-page__list-panel-body credential-page__panel-body">
        <!-- ── 统计卡片 ──────────────────────────────────────────────── -->
        <div class="stat-cards">
          <div class="stat-card stat-card--total">
            <div class="stat-card__body">
              <div class="stat-label">优化师总数</div>
              <div class="stat-value teal">{{ stats.total }}<span class="stat-unit">人</span></div>
            </div>
            <el-icon class="stat-icon teal"><TrendCharts /></el-icon>
          </div>
          <div class="stat-card stat-card--active">
            <div class="stat-card__body">
              <div class="stat-label">在职</div>
              <div class="stat-value teal">{{ stats.active }}<span class="stat-unit">人</span></div>
            </div>
            <el-icon class="stat-icon teal"><TrendCharts /></el-icon>
          </div>
          <div class="stat-card stat-card--consume">
            <div class="stat-card__body">
              <div class="stat-label">最低消耗均值</div>
              <div class="stat-value amber">${{ stats.avgConsumption }}</div>
            </div>
            <el-icon class="stat-icon amber"><Right /></el-icon>
          </div>
          <div class="stat-card stat-card--new">
            <div class="stat-card__body">
              <div class="stat-label">本月新增</div>
              <div class="stat-value blue"
                >{{ stats.monthNew }}<span class="stat-unit">人</span></div
              >
            </div>
            <el-icon class="stat-icon blue"><TrendCharts /></el-icon>
          </div>
        </div>

        <div class="optimizer-filter-bar">
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索名称/代号"
            class="filter-search"
            clearable
            @keyup.enter="handleQuery"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <span class="optimizer-filter-bar__label">状态</span>
          <el-select v-model="filterForm.status" placeholder="全部" class="filter-status" clearable>
            <el-option label="在职" value="在职" />
            <el-option label="离职" value="离职" />
          </el-select>
          <ElButton round type="primary" @click="handleQuery">
            <ElIcon><Search /></ElIcon>查询
          </ElButton>
        </div>

        <!-- ── 列表卡片 ──────────────────────────────────────────────── -->
        <div class="table-wrapper">
          <div class="table-title">优化师列表</div>
          <el-table
            :data="pagedList"
            v-loading="tableLoading"
            element-loading-text="加载中..."
            class="optimizer-table"
            table-layout="fixed"
            :highlight-current-row="true"
            :row-class-name="getRowClass"
            :row-style="getRowStyle"
            @row-click="handleRowClick"
          >
            <!-- 序号 -->
            <el-table-column label="序号" width="80" align="center">
              <template #default="{ $index }">
                <span class="col-no">{{ $index + 1 + (currentPage - 1) * pageSize }}</span>
              </template>
            </el-table-column>

            <!-- 名称 -->
            <el-table-column label="名称" min-width="100" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="optimizer-name">
                  <!-- <div class="avatar" :style="{ background: row.avatarColor }">
                    {{ getUserInitial(row.userName) }}
                  </div> -->
                  <span>{{ row.userName }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 版本号 -->
            <el-table-column label="版本号" min-width="100" align="center">
              <template #default="{ row }">
                <span class="version-badge">v{{ row.version }}</span>
              </template>
            </el-table-column>

            <!-- 代号 -->
            <el-table-column label="代号" min-width="100" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="scode-text">{{ row.sCode }}</span>
              </template>
            </el-table-column>

            <!-- 代号2 -->
            <el-table-column label="代号2" min-width="100" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="scode2-text">{{ row.sCode2 || '–' }}</span>
              </template>
            </el-table-column>

            <!-- 最低消耗要求 -->
            <el-table-column label="最低消耗要求" min-width="100" align="right">
              <template #default="{ row }">
                <span class="consume-text">${{ row.minConsumption.toFixed(2) }}</span>
              </template>
            </el-table-column>

            <!-- 检验码 -->
            <el-table-column label="检验码" min-width="100" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="checkcode-cell">
                  <span class="checkcode-text">{{ truncateCode(row.checkCode, 8) }}</span>
                  <el-icon class="copy-icon" @click.stop="handleCopy(row.checkCode)"
                    ><CopyDocument
                  /></el-icon>
                </div>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column label="状态" min-width="100" align="center">
              <template #default="{ row }">
                <span
                  :class="[
                    'status-badge',
                    row.status === '在职' ? 'status--active' : 'status--inactive'
                  ]"
                >
                  {{ row.status }}
                </span>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column label="操作" width="220" fixed="right" align="center">
              <template #default="{ row }">
                <div class="action-btns">
                  <button class="action-btn btn-edit" @click.stop="handleEdit(row)">编辑</button>
                  <button class="action-btn btn-detail" @click.stop="handleDetail(row)"
                    >详情</button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-bar">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50, 9999]"
              :pager-count="5"
              layout="total, prev, pager, next, sizes"
              background
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ── 详情抽屉 ─────────────────────────────────────────────── -->
    <OptimizerDetailDrawer v-model:visible="drawerVisible" :data="currentRow" @edit="handleEdit" />

    <!-- ── 新增/编辑弹窗 ──────────────────────────────────────────── -->
    <OptimizerFormDialog
      v-model:visible="formVisible"
      :edit-data="editData"
      :system-users="systemUserOptions"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { Plus, Download, Search, CopyDocument, TrendCharts, Right } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    createOptimizer,
    exportOptimizerList,
    fetchOptimizerMetaSystemUsers,
    fetchOptimizerOverview,
    fetchOptimizerTable,
    updateOptimizer
  } from '@/api/config-management/optimizer-management'
  import { getAppNow } from '@/utils/app-now'
  import OptimizerDetailDrawer from './modules/optimizer-detail-drawer.vue'
  import OptimizerFormDialog from './modules/optimizer-form-dialog.vue'
  import { cloneOptimizerMockList, systemUsers as seedSystemUsers } from './mock/data'
  import type { OptimizerItem, OptimizerFormPayload, SystemUser } from './types'

  defineOptions({ name: 'OptimizerManagement' })

  /** 接口可用时为 true：列表与分页走服务端 */
  const useRemoteTable = ref(false)
  const serverTotal = ref(0)
  const remoteOverview = ref<Api.ConfigManagement.Optimizer.OverviewResponse | null>(null)

  const systemUserOptions = ref<SystemUser[]>([...seedSystemUsers])

  // ─── 筛选 ───────────────────────────────────────────────────────
  const filterForm = reactive({ keyword: '', status: '' })
  const queriedFilter = reactive({ keyword: '', status: '' })
  const optimizerList = ref<OptimizerItem[]>(cloneOptimizerMockList())

  // ─── 分页 ───────────────────────────────────────────────────────
  const currentPage = ref(1)
  const pageSize = ref(10)
  const tableLoading = ref(false)

  // ─── 弹窗状态 ────────────────────────────────────────────────────
  const drawerVisible = ref(false)
  const formVisible = ref(false)
  const currentRow = ref<OptimizerItem | null>(null)
  const editData = ref<OptimizerItem | null>(null)

  const tableRequestSize = () => (pageSize.value >= 9999 ? 5000 : pageSize.value)

  async function refreshOverview() {
    try {
      remoteOverview.value = await fetchOptimizerOverview()
    } catch {
      remoteOverview.value = null
    }
  }

  async function refreshTable() {
    if (!useRemoteTable.value) return
    tableLoading.value = true
    try {
      const res = await fetchOptimizerTable({
        current: currentPage.value,
        size: tableRequestSize(),
        keyword: queriedFilter.keyword.trim() || undefined,
        status: queriedFilter.status || undefined
      })
      optimizerList.value = res.records as OptimizerItem[]
      serverTotal.value = res.total
    } catch {
      useRemoteTable.value = false
      remoteOverview.value = null
      serverTotal.value = 0
      optimizerList.value = cloneOptimizerMockList()
      ElMessage.warning('列表接口不可用，已切换为本地演示数据')
    } finally {
      tableLoading.value = false
    }
  }

  onMounted(async () => {
    try {
      const users = await fetchOptimizerMetaSystemUsers()
      if (Array.isArray(users) && users.length) {
        systemUserOptions.value = users as SystemUser[]
      }
    } catch {
      /* 使用 seedSystemUsers */
    }

    try {
      const [overview, table] = await Promise.all([
        fetchOptimizerOverview().catch(() => null),
        fetchOptimizerTable({
          current: 1,
          size: tableRequestSize(),
          keyword: undefined,
          status: undefined
        })
      ])
      if (overview) remoteOverview.value = overview
      if (table?.records && Array.isArray(table.records)) {
        useRemoteTable.value = true
        optimizerList.value = table.records as OptimizerItem[]
        serverTotal.value = table.total
        currentPage.value = table.current ?? 1
      }
    } catch {
      /* 保持 Mock */
    }
  })

  // ─── 过滤（仅本地 Mock 模式） ───────────────────────────────────
  const filteredList = computed(() => {
    if (useRemoteTable.value) return optimizerList.value
    const kw = queriedFilter.keyword.trim().toLowerCase()
    return optimizerList.value.filter((item) => {
      if (
        kw &&
        !(item.userName ?? '').toLowerCase().includes(kw) &&
        !(item.sCode ?? '').toLowerCase().includes(kw)
      ) {
        return false
      }
      if (queriedFilter.status && item.status !== queriedFilter.status) return false
      return true
    })
  })

  const total = computed(() =>
    useRemoteTable.value ? serverTotal.value : filteredList.value.length
  )

  const pagedList = computed(() => {
    if (useRemoteTable.value) return optimizerList.value
    if (pageSize.value >= 9999) return filteredList.value
    const start = (currentPage.value - 1) * pageSize.value
    return filteredList.value.slice(start, start + pageSize.value)
  })

  watch([currentPage, pageSize], () => {
    if (useRemoteTable.value) void refreshTable()
  })

  const handleQuery = () => {
    queriedFilter.keyword = filterForm.keyword
    queriedFilter.status = filterForm.status
    if (currentPage.value !== 1) {
      currentPage.value = 1
      return
    }
    if (useRemoteTable.value) {
      void refreshTable()
      void refreshOverview()
    }
  }

  // ─── 统计 ───────────────────────────────────────────────────────
  const stats = computed(() => {
    if (remoteOverview.value) {
      return {
        total: remoteOverview.value.total,
        active: remoteOverview.value.active,
        avgConsumption: remoteOverview.value.avgMinConsumption,
        monthNew: remoteOverview.value.monthNew
      }
    }
    const list = optimizerList.value
    const active = list.filter((i) => i.status === '在职')
    const avg = active.length
      ? Math.round(active.reduce((s, i) => s + i.minConsumption, 0) / active.length)
      : 0
    const thisMonth = getAppNow().toISOString().slice(0, 7)
    const monthNew = list.filter((i) => i.createTime.startsWith(thisMonth)).length
    return {
      total: useRemoteTable.value ? serverTotal.value : list.length,
      active: active.length,
      avgConsumption: avg,
      monthNew
    }
  })

  // ─── 操作 ───────────────────────────────────────────────────────
  const handleAdd = () => {
    editData.value = null
    formVisible.value = true
  }

  const handleEdit = (row: OptimizerItem) => {
    editData.value = { ...row }
    formVisible.value = true
    drawerVisible.value = false
  }

  const handleDetail = (row: OptimizerItem) => {
    currentRow.value = row
    drawerVisible.value = true
  }

  const handleRowClick = (row: OptimizerItem) => {
    currentRow.value = row
    drawerVisible.value = true
  }

  const getRowClass = () => 'fx-table-row-enter'

  const getRowStyle = ({ rowIndex }: { rowIndex: number }) => ({
    '--fx-row-idx': String(rowIndex)
  })

  const truncateCode = (code: string, keep = 8) => {
    if (code.length <= keep + 2) return code
    return `${code.slice(0, keep)}...${code.slice(-2)}`
  }

  // const getUserInitial = (userName?: string | null) => {
  //   const normalized = (userName ?? '').trim()
  //   return normalized ? normalized.charAt(0) : '-'
  // }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('已复制到剪贴板')
    })
  }

  const exportCsvLocal = () => {
    const rows = useRemoteTable.value ? optimizerList.value : filteredList.value
    const header = ['序号', '名称', '版本号', '代号', '代号2', '最低消耗要求', '检验码', '状态']
    const lines = [header.join(',')]
    rows.forEach((r) => {
      lines.push(
        [
          r.no,
          r.userName,
          `v${r.version}`,
          r.sCode,
          r.sCode2 || '',
          `$${r.minConsumption.toFixed(2)}`,
          r.checkCode,
          r.status
        ].join(',')
      )
    })
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `optimizers_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  }

  const handleExport = async () => {
    if (useRemoteTable.value) {
      try {
        await exportOptimizerList({
          keyword: queriedFilter.keyword.trim() || undefined,
          status: queriedFilter.status || undefined
        })
        ElMessage.success('导出成功')
        return
      } catch {
        ElMessage.warning('导出接口不可用，已改为导出当前列表（CSV）')
      }
    }
    exportCsvLocal()
  }

  const handleFormSuccess = async (payload: OptimizerFormPayload) => {
    const user = systemUserOptions.value.find((u) => u.id === payload.userId)
    const now = getAppNow().toISOString().slice(0, 16).replace('T', ' ')

    if (useRemoteTable.value) {
      try {
        if (payload.id) {
          await updateOptimizer({ ...payload, id: payload.id })
          ElMessage.success('保存成功')
        } else {
          await createOptimizer(payload)
          ElMessage.success('新增成功')
        }
        await Promise.all([refreshTable(), refreshOverview()])
        formVisible.value = false
        editData.value = null
        return
      } catch {
        ElMessage.warning('服务端保存失败，已改为仅更新本地演示数据')
        useRemoteTable.value = false
        remoteOverview.value = null
      }
    }

    if (payload.id) {
      const idx = optimizerList.value.findIndex((i) => i.id === payload.id)
      if (idx >= 0) {
        optimizerList.value[idx] = {
          ...optimizerList.value[idx],
          ...payload,
          userName: user?.userName ?? optimizerList.value[idx].userName,
          email: user?.email ?? optimizerList.value[idx].email,
          avatarColor: user?.avatarColor ?? optimizerList.value[idx].avatarColor,
          lastModifyTime: now
        }
        if (currentRow.value?.id === payload.id) {
          currentRow.value = optimizerList.value[idx]
        }
      }
      ElMessage.success('保存成功')
    } else {
      const maxNo = optimizerList.value.reduce((m, i) => Math.max(m, i.no), 0)
      const newItem: OptimizerItem = {
        id: `opt${Date.now()}`,
        no: maxNo + 1,
        userId: payload.userId,
        userName: user?.userName ?? '',
        email: user?.email ?? '',
        avatarColor: user?.avatarColor ?? '#2dd4bf',
        version: payload.version,
        sCode: payload.sCode,
        sCode2: payload.sCode2,
        minConsumption: payload.minConsumption,
        checkCode: payload.checkCode,
        status: payload.status,
        apps: [],
        recentLogs: [],
        createTime: now.slice(0, 10),
        lastModifyTime: now
      }
      optimizerList.value.unshift(newItem)
      ElMessage.success('新增成功')
    }
    formVisible.value = false
    editData.value = null
  }
</script>

<style lang="scss" scoped>
  .account-sub-page.credential-page.optimizer-page {
    --page-border: color-mix(in srgb, var(--el-color-primary) 16%, transparent);
    --page-text-main: color-mix(in srgb, var(--text-primary) 92%, white 8%);
    --as-border: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --as-surface: color-mix(in srgb, var(--default-box-color) 94%, transparent);
    --as-header-bg: color-mix(in srgb, var(--default-box-color) 78%, black 4%);
    --bg-card: var(--as-surface);
    --border: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    --accent: var(--el-color-primary);
    --accent-dim: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --blue: var(--el-color-info);
    --blue-dim: color-mix(in srgb, var(--el-color-info) 14%, transparent);
    --amber: var(--art-warning);
    --amber-dim: color-mix(in srgb, var(--art-warning) 14%, transparent);
    --green: var(--art-success);
    --green-dim: color-mix(in srgb, var(--art-success) 14%, transparent);
    --red: var(--art-danger);
    --red-dim: color-mix(in srgb, var(--art-danger) 14%, transparent);
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

  .account-sub-page.credential-page.optimizer-page::before {
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

  .account-sub-page.credential-page.optimizer-page > * {
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

  .optimizer-filter-bar {
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

  .optimizer-filter-bar__label {
    font-size: 13px;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .filter-search {
    width: 180px;

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

  .filter-status {
    width: 90px;

    :deep(.el-select__wrapper) {
      color: var(--text-primary);
      background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
      border: 1px solid var(--border) !important;
      border-radius: 7px;
      box-shadow: none !important;
    }
  }

  // ─── 统计卡片 ────────────────────────────────────────────────────
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 18px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 24px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
  }

  .stat-card__body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .stat-label {
    font-size: 13px;
    color: var(--text-muted);
  }

  .stat-value {
    display: flex;
    gap: 4px;
    align-items: baseline;
    font-size: 32px;
    font-weight: 700;

    &.teal {
      color: var(--accent);
    }

    &.amber {
      color: var(--amber);
    }

    &.blue {
      color: var(--blue);
    }
  }

  .stat-unit {
    font-size: 15px;
    font-weight: 400;
  }

  .stat-icon {
    font-size: 32px;
    opacity: 0.5;

    &.teal {
      color: var(--accent);
    }

    &.amber {
      color: var(--amber);
    }

    &.blue {
      color: var(--blue);
    }
  }

  // ─── 表格 ────────────────────────────────────────────────────────
  .table-wrapper {
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
  }

  .table-title {
    padding: 16px 20px 14px;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
  }

  .optimizer-table {
    width: 100%;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: var(--as-header-bg);
    --el-table-row-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);

    cursor: pointer;
    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 12px;
      font-size: 13px;
      font-weight: 500;
      background: var(--as-header-bg) !important;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(td.el-table__cell) {
      padding: 12px;
      font-size: 13px;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(tr) {
      background: transparent !important;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }

    :deep(.current-row td) {
      background: color-mix(in srgb, var(--el-color-primary) 8%, transparent) !important;
      border-left: 2px solid var(--accent);
    }
  }

  .col-no {
    font-size: 13px;
    color: var(--text-muted);
  }

  .optimizer-name {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    border-radius: 50%;
  }

  .version-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    border-radius: 4px;
  }

  .scode-text {
    font-size: 13px;
    color: var(--accent);
  }

  .scode2-text {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .consume-text {
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);
  }

  .checkcode-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .checkcode-text {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .copy-icon {
    flex-shrink: 0;
    font-size: 14px;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
      color: var(--accent);
    }
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 20px;

    &.status--active {
      color: var(--green);
      background: var(--green-dim);
    }

    &.status--inactive {
      color: var(--red);
      background: var(--red-dim);
    }
  }

  .action-btns {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
  }

  .action-btn {
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    background: transparent;
    border: 1px solid;
    border-radius: 20px;
    transition: all 0.15s;

    &.btn-edit {
      color: var(--accent);
      border-color: var(--accent);

      &:hover {
        background: var(--accent-dim);
      }
    }

    &.btn-detail {
      color: var(--text-secondary);
      border-color: color-mix(in srgb, var(--el-color-primary) 18%, transparent);

      &:hover {
        color: var(--text-primary);
        border-color: var(--text-secondary);
      }
    }
  }

  // ─── 分页 ────────────────────────────────────────────────────────
  .pagination-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    padding: 12px 16px;
    border-top: 1px solid var(--border);
  }

  .pagination-total {
    margin-right: auto;
    font-size: 13px;
    color: var(--text-muted);
  }

  .page-size-select {
    width: 90px;

    :deep(.el-select__wrapper) {
      font-size: 12px;
      color: var(--text-secondary);
      background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
      border: 1px solid var(--border) !important;
      box-shadow: none !important;
    }
  }

  // ─── Element Plus 下拉覆盖 ───────────────────────────────────────
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

    .optimizer-filter-bar .filter-search {
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
