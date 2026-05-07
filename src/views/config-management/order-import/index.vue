<template>
  <div class="account-sub-page credential-page oi-page art-full-height">
    <div class="account-sub-page__toolbar">
      <div class="account-sub-page__toolbar-fx" aria-hidden="true" />
      <div class="account-sub-page__toolbar-row">
        <div class="account-sub-page__toolbar-copy">
          <span class="account-sub-page__toolbar-line" aria-hidden="true" />
          <div class="account-sub-page__toolbar-titles">
            <span class="account-sub-page__toolbar-eyebrow">Orders</span>
            <span class="account-sub-page__toolbar-title">导入商店订单</span>
          </div>
          <span class="account-sub-page__toolbar-hint">App Store / Google Play 上传与解析进度</span>
        </div>
        <div class="account-sub-page__toolbar-actions">
          <ElButton
            type="primary"
            round
            class="account-sub-page__btn-primary"
            @click="importVisible = true"
          >
            <ElIcon><Plus /></ElIcon>导入订单
          </ElButton>
          <el-select
            v-model="filterDataSource"
            class="toolbar-filter-select"
            @change="currentPage = 1"
          >
            <el-option value="" label="数据源 全部" />
            <el-option value="appstore" label="App Store" />
            <el-option value="googleplay" label="Google Play" />
          </el-select>
          <el-select
            v-model="filterStatus"
            class="toolbar-filter-select"
            @change="handleFilterChange"
          >
            <el-option value="" label="状态 全部" />
            <el-option value="completed" label="已完成" />
            <el-option value="processing" label="处理中" />
            <el-option value="partial" label="部分成功" />
            <el-option value="failed" label="失败" />
          </el-select>
          <ElButton round class="account-sub-page__btn-secondary" @click="handleQuery"
            >查询</ElButton
          >
        </div>
      </div>
    </div>

    <section class="account-sub-page__list-panel credential-page__panel" aria-label="导入商店订单">
      <div class="account-sub-page__list-panel-fx" aria-hidden="true" />
      <div class="account-sub-page__list-panel-body credential-page__panel-body">
        <!-- ── KPI 四卡 ────────────────────────────────────── -->
        <div class="kpi-row">
          <div class="kpi-card kpi-card--blue">
            <div class="kpi-label">今日导入任务</div>
            <div class="kpi-value kpi-value--blue">
              {{ kpi.todayTotal }}<span class="kpi-unit">条上传记录</span>
            </div>
          </div>
          <div class="kpi-card kpi-card--teal">
            <div class="kpi-label">已完成</div>
            <div class="kpi-value kpi-value--teal">{{ kpi.completed }}</div>
            <div class="kpi-sub">全部成功</div>
          </div>
          <div class="kpi-card kpi-card--amber">
            <div class="kpi-label">处理中</div>
            <div class="kpi-value kpi-value--amber">{{ kpi.processing }}</div>
            <div class="kpi-sub kpi-sub--loading">
              正在解析...
              <span class="dot-anim">·</span>
              <span class="dot-anim dot-anim--2">·</span>
              <span class="dot-anim dot-anim--3">·</span>
            </div>
          </div>
          <div class="kpi-card kpi-card--red">
            <div class="kpi-label">异常/失败</div>
            <div class="kpi-value kpi-value--red">{{ kpi.failed }}</div>
            <div class="kpi-sub">无异常</div>
          </div>
        </div>

        <!-- ── 表格面板 ────────────────────────────────────── -->
        <div class="table-panel">
          <div class="filter-bar">
            <ElIcon class="filter-icon"><Clock /></ElIcon>
            <span class="filter-title">上传历史</span>
            <span class="filter-count">共 {{ total }} 条记录</span>
          </div>

          <el-table
            v-loading="loading"
            :data="list"
            class="oi-table"
            style="width: 100%"
            :row-class-name="getRowClass"
          >
            <el-table-column label="任务ID" min-width="80">
              <template #default="{ row }">
                <span class="task-id">{{ row.taskId }}</span>
              </template>
            </el-table-column>

            <el-table-column label="数据源" min-width="120">
              <template #default="{ row }">
                <div class="source-cell">
                  <img
                    :src="row.dataSource === 'appstore' ? appstoreIcon : googleplayIcon"
                    class="source-icon"
                    :alt="row.dataSource"
                  />
                  <span>{{ DATA_SOURCE_LABELS[row.dataSource]?.label }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="uploadTime" label="上传时间" min-width="155" />
            <el-table-column label="总记录数" min-width="100" align="left">
              <template #default="{ row }">{{ row.totalRecords.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column label="新增导入" min-width="90" align="left">
              <template #default="{ row }">{{ row.newImports.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column label="重复跳过" min-width="90" align="left">
              <template #default="{ row }">
                <span v-if="row.duplicateSkipped !== null">{{
                  row.duplicateSkipped.toLocaleString()
                }}</span>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="失败数" min-width="70" align="left">
              <template #default="{ row }">
                <span v-if="row.failedCount !== null">{{ row.failedCount.toLocaleString() }}</span>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>

            <el-table-column label="状态" width="120" align="left">
              <template #default="{ row }">
                <span :class="['status-badge', `status--${row.status}`]">
                  <span v-if="row.status === 'processing'" class="status-spinner" />
                  <span v-else class="status-dot" />
                  {{ STATUS_CONFIGS[row.status]?.label }}
                </span>
              </template>
            </el-table-column>

            <el-table-column label="操作" min-width="200" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-cell">
                  <template v-if="row.status === 'processing'">
                    <button
                      type="button"
                      class="action-btn action-btn--warning"
                      @click.stop="handlePause(row)"
                    >
                      暂停
                    </button>
                    <span class="action-sep" aria-hidden="true">|</span>
                    <button
                      type="button"
                      class="action-btn action-btn--delete"
                      @click.stop="handleCancel(row)"
                    >
                      取消
                    </button>
                  </template>
                  <template v-else>
                    <button
                      type="button"
                      class="action-btn action-btn--secondary"
                      @click.stop="handleViewReport(row)"
                    >
                      查看报告
                    </button>
                  </template>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-bar">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="total"
              layout="prev, pager, next, jumper"
              class="oi-pagination"
              @current-change="handlePageChange"
            />
            <span class="total-text">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 导入弹窗 ────────────────────────────────────── -->
    <ImportDialog v-model:visible="importVisible" @success="handleImportSuccess" />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { Plus, Clock } from '@element-plus/icons-vue'
  import {
    fetchOrderImportTable,
    fetchOrderImportSummary,
    pauseOrderImport,
    cancelOrderImport
  } from '@/api/config-management/order-import'
  import { DATA_SOURCE_LABELS, STATUS_CONFIGS } from './mock/data'
  import ImportDialog from './modules/import-dialog.vue'
  import type { ImportTask } from './types'

  defineOptions({ name: 'OrderImport' })

  const router = useRouter()

  // 图标（用文字替代，实际项目替换为真实图标路径）
  const appstoreIcon =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzFkNmZjZSIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTQuNSAxNGgtOWMtLjgzIDAtMS41LS42Ny0xLjUtMS41VjExaC0xVjloMVY4YzAtMi4yMSAxLjc5LTQgNC00aDFWNmgtMWMtMS4xIDAtMiAuOS0yIDJ2MWg0VjZoMnYzaDF2MmgtMXYzLjVjMCAuODMtLjY3IDEuNS0xLjUgMS41eiIvPjwvc3ZnPg=='
  const googleplayIcon =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzFhOGE0MyIgZD0iTTMgMjAuNVYzLjVjMC0uOTEgMS4wNC0xLjQgMS43NS0uODVsMTUgOC41Yy42OC4zOS42OCEuMzkgMCAxLjM5LjM5bC0xNSA4LjVDNC4wNCAyMS45IDMgMjEuNDEgMyAyMC41eiIvPjwvc3ZnPg=='

  // ─── 数据 ──────────────────────────────────────────────
  const list = ref<ImportTask[]>([])
  const total = ref(0)
  const filterDataSource = ref('')
  const filterStatus = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)

  // ─── KPI ────────────────────────────────────────────────
  const kpi = ref({
    todayTotal: 0,
    completed: 0,
    processing: 0,
    failed: 0
  })
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

  const getRowClass = ({ row }: { row: ImportTask }) =>
    row.status === 'processing' ? 'row-processing' : ''

  // ─── 操作 ───────────────────────────────────────────────
  const handleViewReport = (row: ImportTask) => {
    router.push({ name: 'OrderImportReport', params: { taskId: row.taskId } })
  }

  const handlePause = (row: ImportTask) => {
    pauseOrderImport(row.taskId).catch(() => undefined)
    ElMessage.info(`已暂停任务 ${row.taskId}`)
    handleQuery()
  }

  const handleCancel = (row: ImportTask) => {
    cancelOrderImport(row.taskId).catch(() => undefined)
    ElMessage.warning(`已取消任务 ${row.taskId}`)
    handleQuery()
  }

  // ─── 导入弹窗 ───────────────────────────────────────────
  const importVisible = ref(false)

  const handleImportSuccess = (taskId: string) => {
    importVisible.value = false
    router.push({ name: 'OrderImportReport', params: { taskId } })
  }

  const loadImportTable = async () => {
    loading.value = true
    try {
      const [tableRes, summaryRes] = await Promise.all([
        fetchOrderImportTable({
          page: currentPage.value,
          pageSize: pageSize.value,
          dataSource: filterDataSource.value || undefined,
          status: filterStatus.value || undefined
        }),
        fetchOrderImportSummary({
          dataSource: filterDataSource.value || undefined,
          status: filterStatus.value || undefined
        })
      ])
      list.value = tableRes.records ?? []
      total.value = tableRes.total ?? 0
      kpi.value = {
        todayTotal: summaryRes.todayTotal ?? 0,
        completed: summaryRes.completed ?? 0,
        processing: summaryRes.processing ?? 0,
        failed: summaryRes.failed ?? 0
      }
    } catch {
      list.value = []
      total.value = 0
      kpi.value = { todayTotal: 0, completed: 0, processing: 0, failed: 0 }
    } finally {
      loading.value = false
    }
  }

  const handleFilterChange = () => {
    currentPage.value = 1
  }

  const handleQuery = () => {
    currentPage.value = 1
    loadImportTable()
  }

  const handlePageChange = () => {
    loadImportTable()
  }

  onMounted(() => {
    loadImportTable()
  })
</script>

<style lang="scss" scoped>
  .account-sub-page.credential-page.oi-page {
    --page-border: color-mix(in srgb, var(--el-color-primary) 16%, transparent);
    --page-text-main: color-mix(in srgb, var(--text-primary) 92%, white 8%);
    --as-surface: color-mix(in srgb, var(--default-box-color) 94%, transparent);
    --as-header-bg: color-mix(in srgb, var(--default-box-color) 78%, black 4%);
    --bg-card: var(--as-surface);
    --border: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    --accent: var(--el-color-primary);
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

  .account-sub-page.credential-page.oi-page::before {
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

  .account-sub-page.credential-page.oi-page > * {
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

  .toolbar-filter-select {
    width: 120px;
    min-width: 0;

    :deep(.el-select__wrapper) {
      color: var(--text-primary);
      background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
      border: 1px solid var(--border) !important;
      border-radius: 8px;
      box-shadow: none !important;

      &:hover {
        border-color: var(--accent) !important;
      }
    }
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

    font-weight: 600;
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

  // ─── KPI ────────────────────────────────────────────────
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 14px;
  }

  .kpi-card {
    padding: 20px 24px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-left: 4px solid;
    border-radius: 10px;

    &--blue {
      background:
        linear-gradient(
          135deg,
          color-mix(in srgb, var(--default-box-color) 92%, transparent) 0%,
          color-mix(in srgb, var(--el-color-info) 8%, var(--default-box-color) 92%) 100%
        ),
        var(--bg-card);
      border-left-color: var(--el-color-info);
    }

    &--teal {
      border-left-color: var(--accent);
    }

    &--amber {
      border-left-color: var(--art-warning);
    }

    &--red {
      border-left-color: var(--art-danger);
    }
  }

  .kpi-label {
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--text-muted);
  }

  .kpi-value {
    font-size: 36px;
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

    &--red {
      color: var(--art-danger);
    }
  }

  .kpi-unit {
    margin-left: 6px;
    font-size: 13px;
    font-weight: 400;
    color: var(--text-muted);
  }

  .kpi-sub {
    margin-top: 6px;
    font-size: 12px;
    color: var(--text-muted);

    &--loading {
      display: flex;
      gap: 1px;
      align-items: center;
      color: var(--art-warning);
    }
  }

  .dot-anim {
    animation: dotPulse 1.4s infinite;

    &--2 {
      animation-delay: 0.2s;
    }

    &--3 {
      animation-delay: 0.4s;
    }
  }

  @keyframes dotPulse {
    0%,
    80%,
    100% {
      opacity: 0.2;
    }

    40% {
      opacity: 1;
    }
  }

  // ─── 表格面板 ────────────────────────────────────────────
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
    gap: 8px;
    align-items: center;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--border);
  }

  .filter-icon {
    font-size: 15px;
    color: var(--text-muted);
  }

  .filter-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .filter-count {
    padding: 2px 8px;
    margin-left: 8px;
    font-size: 12px;
    color: var(--text-muted);
    background: color-mix(in srgb, var(--default-box-color) 50%, transparent);
    border-radius: 10px;
  }

  .oi-table {
    flex: 1;
    width: 100%;
    overflow: auto;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: var(--as-header-bg);
    --el-table-row-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);

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

    :deep(.row-processing td) {
      background: color-mix(in srgb, var(--art-warning) 8%, transparent) !important;
      border-left: 2px solid var(--art-warning);
    }
  }

  .task-id {
    font-family: monospace;
    font-size: 13px;
    color: var(--text-primary);
  }

  .source-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .source-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
    border-radius: 4px;
  }

  .text-muted {
    color: var(--text-muted);
  }

  // ── 状态 ────────────────────────────────────────────────
  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 8px;
    font-size: 12px;
    border-radius: 4px;

    &.status--completed {
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 14%, transparent);
    }

    &.status--processing {
      color: var(--art-warning);
      background: color-mix(in srgb, var(--art-warning) 14%, transparent);
    }

    &.status--partial {
      color: var(--art-warning);
      background: color-mix(in srgb, var(--art-warning) 14%, transparent);
    }

    &.status--failed {
      color: var(--art-danger);
      background: color-mix(in srgb, var(--art-danger) 14%, transparent);
    }
  }

  .status-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    background: currentcolor;
    border-radius: 50%;
  }

  .status-spinner {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border: 1.5px solid currentcolor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  // ── 操作列（与配置管理其他页 action-cell 一致：ghost 文字链、| 分隔）──
  .action-cell {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: center;
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

    &--warning {
      color: var(--text-warning);

      &:hover {
        color: var(--text-primary);
        background: color-mix(in srgb, var(--art-warning) 18%, transparent);
      }

      &:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--art-warning) 40%, transparent);
        outline-offset: 2px;
      }
    }

    &--delete {
      color: var(--text-danger);

      &:hover {
        background: color-mix(in srgb, var(--art-danger) 16%, transparent);
      }

      &:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--art-danger) 40%, transparent);
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

  // ── 分页 ────────────────────────────────────────────────
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

  .oi-pagination {
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

  // ── 下拉弹出 ────────────────────────────────────────────
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

    .toolbar-filter-select {
      flex: 1 1 100%;
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .account-sub-page__btn-primary.el-button--primary:hover,
    .account-sub-page__btn-secondary.el-button:hover {
      transform: none;
    }

    .dot-anim {
      animation: none;
    }

    .status-spinner {
      animation: none;
    }
  }
</style>
