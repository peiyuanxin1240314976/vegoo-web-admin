<template>
  <div class="ir-page art-full-height">
    <!-- ── 顶栏 ────────────────────────────────────────── -->
    <div class="page-topbar">
      <div class="topbar-left">
        <div class="breadcrumb">
          <span class="bc-item" @click="goBack">系统管理</span>
          <span class="bc-sep">›</span>
          <span class="bc-item" @click="goBack">导入商店订单</span>
          <span class="bc-sep">›</span>
          <span class="bc-current">导入报告</span>
        </div>
        <h1 class="page-title">
          导入报告
          <span :class="['task-id-badge', `task-id-badge--${report.status}`]">{{ taskId }}</span>
        </h1>
      </div>
      <div class="topbar-actions">
        <ElButton v-if="hasFailures" class="btn-download" @click="handleDownloadFailed">
          <ElIcon><Download /></ElIcon>下载失败数据
        </ElButton>
        <ElButton class="btn-back" @click="goBack">← 返回列表</ElButton>
      </div>
    </div>

    <!-- ── 三卡信息行 ───────────────────────────────────── -->
    <div class="info-row">
      <!-- 任务信息 -->
      <div :class="['info-card', hasFailures && 'info-card--warn']">
        <div class="info-card-title">任务信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">任务 ID</span>
            <span class="info-value info-value--mono">{{ report.taskId }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">上传时间</span>
            <span class="info-value">{{ report.uploadTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">数据源</span>
            <span :class="['source-badge', `source-badge--${report.dataSource}`]">
              {{ report.dataSource === 'appstore' ? 'App Store (iOS)' : 'Google Play (Android)' }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">完成时间</span>
            <span class="info-value">{{ report.completedTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">文件名</span>
            <span class="info-value info-value--mono">{{ report.fileName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">总耗时</span>
            <span class="info-value">{{ durationText }}</span>
          </div>
        </div>
      </div>

      <!-- 数据统计 -->
      <div :class="['info-card', 'info-card--stats', hasFailures && 'info-card--warn']">
        <div class="info-card-title">数据统计</div>
        <div class="stats-body">
          <div class="stats-left">
            <div class="stats-total">{{ report.totalRecords.toLocaleString() }}</div>
            <div class="stats-total-label">总记录数</div>
            <div class="stats-legend">
              <div class="legend-item">
                <span class="legend-dot legend-dot--teal" />
                新增导入 {{ report.newImports.toLocaleString() }} 条 ({{ pct(report.newImports) }}%)
              </div>
              <div class="legend-item">
                <span class="legend-dot legend-dot--amber" />
                重复跳过 {{ report.duplicateSkipped.toLocaleString() }} 条 ({{
                  pct(report.duplicateSkipped)
                }}%)
              </div>
              <div class="legend-item">
                <span class="legend-dot legend-dot--red" />
                失败记录 {{ report.failedCount }} 条 ({{ pct(report.failedCount) }}%)
              </div>
            </div>
          </div>
          <div class="stats-right">
            <svg class="donut" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" class="donut-track" />
              <circle
                cx="50"
                cy="50"
                r="38"
                class="donut-seg donut-seg--teal"
                :stroke-dasharray="`${newArc} ${donutCirc - newArc}`"
                stroke-dashoffset="0"
                transform="rotate(-90 50 50)"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                class="donut-seg donut-seg--amber"
                :stroke-dasharray="`${dupArc} ${donutCirc - dupArc}`"
                :stroke-dashoffset="-newArc"
                transform="rotate(-90 50 50)"
              />
              <circle
                v-if="report.failedCount > 0"
                cx="50"
                cy="50"
                r="38"
                class="donut-seg donut-seg--red"
                :stroke-dasharray="`${failArc} ${donutCirc - failArc}`"
                :stroke-dashoffset="-(newArc + dupArc)"
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- 导入状态 -->
      <div :class="['info-card', 'info-card--status', hasFailures && 'info-card--warn']">
        <div class="info-card-title">导入状态</div>
        <div class="status-body">
          <div :class="['status-icon-row', `status-icon-row--${report.status}`]">
            <ElIcon size="28">
              <CircleCheckFilled v-if="report.status === 'completed'" />
              <WarningFilled v-else />
            </ElIcon>
            <span class="status-label">{{ STATUS_LABEL[report.status] }}</span>
          </div>
          <div class="status-quality-row">
            <span class="sq-label">数据质量</span>
            <span :class="['sq-value', `sq-value--${qualityLevel}`]">{{ qualityText }}</span>
          </div>
          <div class="status-suggest">
            <span class="suggest-label">建议</span>
            <span class="suggest-text">{{ suggestText }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 底部：成功态 ─────────────────────────────────── -->
    <div v-if="!hasFailures" class="bottom-row">
      <!-- 导入数据预览 -->
      <div class="preview-panel">
        <div class="preview-header">
          <span class="preview-title">导入数据预览</span>
          <span class="preview-count">共 {{ report.newImports.toLocaleString() }} 条已导入</span>
          <button class="btn-link">查看全部</button>
        </div>
        <el-table :data="pagedPreview" class="ir-table" style="width: 100%">
          <el-table-column prop="transactionDate" label="交易日期" min-width="100" />
          <el-table-column prop="settlementDate" label="结算日期" min-width="100" />
          <el-table-column
            prop="productName"
            label="产品名称"
            min-width="140"
            show-overflow-tooltip
          />
          <el-table-column prop="sku" label="SKU" min-width="130" show-overflow-tooltip />
          <el-table-column prop="country" label="销售国家" min-width="80" />
          <el-table-column label="分成金额" min-width="90" align="right">
            <template #default="{ row }">{{ row.partnerShare.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="currency" label="分成货币" min-width="80" />
        </el-table>
        <div class="table-footer">
          <el-pagination
            v-model:current-page="previewPage"
            :page-size="previewPageSize"
            :total="report.previewTotal"
            layout="prev, pager, next"
            class="ir-pagination"
            @current-change="handlePreviewPageChange"
          />
          <span class="footer-text">共 {{ previewTotalPages }} 页</span>
        </div>
      </div>

      <!-- 重复数据说明 -->
      <div class="side-panel">
        <div class="side-panel-title">重复数据说明</div>
        <div class="dup-rule-box">
          <div class="dup-rule-label">重复判断规则</div>
          <div class="dup-rule-text">交易日期 + SKU + 销售国家 + 分成金额</div>
          <div class="dup-rule-desc">
            共识别到 {{ report.duplicateSkipped.toLocaleString() }} 条重复记录，已自动跳过<br />
            重复数据不影响已有数据的准确性
          </div>
        </div>
        <div class="dup-ratio-row">
          <span class="sq-label">重复数据占比</span>
          <span class="sq-value">
            {{ (report.duplicateRatio * 100).toFixed(1) }}% ({{ report.duplicateSkipped }} /
            {{ report.totalRecords }})
          </span>
        </div>
        <div class="progress-bar-wrap">
          <div
            class="progress-bar-fill progress-bar-fill--amber"
            :style="{ width: (report.duplicateRatio * 100).toFixed(1) + '%' }"
          />
        </div>
        <p class="side-tip">如需查看重复数据明细，请在任务详情中查看「重复数据」标签页</p>
        <button class="btn-text-link">进入任务详情</button>
      </div>
    </div>

    <!-- ── 底部：异常态 ─────────────────────────────────── -->
    <div v-else class="bottom-row">
      <!-- 失败记录明细 -->
      <div class="preview-panel">
        <div class="preview-header">
          <span class="preview-title">失败记录明细</span>
          <span class="preview-count preview-count--red">共 {{ report.failedCount }} 条</span>
          <button class="btn-link btn-link--amber" @click="handleDownloadFailed">
            下载失败数据
          </button>
        </div>
        <el-table :data="displayedFailedItems" class="ir-table" style="width: 100%">
          <el-table-column label="行号" width="72">
            <template #default="{ row }">
              <span class="row-num">#{{ row.rowNo }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="transactionDate" label="交易日期" min-width="110" />
          <el-table-column prop="sku" label="SKU" min-width="130" show-overflow-tooltip />
          <el-table-column label="错误原因" min-width="200">
            <template #default="{ row }">
              <span :class="['error-tag', `error-tag--${row.errorType}`]">
                {{ row.errorMsg }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="suggestion"
            label="处理建议"
            min-width="160"
            show-overflow-tooltip
          />
        </el-table>
        <div class="table-footer">
          <span class="footer-text">
            展示 {{ displayedFailedItems.length }} / {{ report.failedCount }} 条，
            <button class="btn-text-link">查看全部</button>
          </span>
        </div>
      </div>

      <!-- 失败原因分布 + 处理建议 -->
      <div class="side-panel">
        <div class="side-panel-title">失败原因分布</div>
        <div class="error-dist-list">
          <div v-for="item in errorDist" :key="item.type" class="error-dist-item">
            <span class="error-dist-label">{{ item.label }}</span>
            <div class="error-dist-bar-wrap">
              <div
                class="error-dist-bar"
                :style="{ width: item.pct + '%', background: item.color }"
              />
              <span class="error-dist-pct">{{ item.pct }}%</span>
            </div>
            <span class="error-dist-count">{{ item.count }} 条</span>
          </div>
        </div>

        <!-- 处理建议框 -->
        <div class="fix-suggest-box">
          <div class="fix-suggest-title">处理建议</div>
          <ol class="fix-suggest-list">
            <li>点击「下载失败数据」获取失败记录文件</li>
            <li>根据上方错误原因修正对应字段的数据格式</li>
            <li>重新上传修正后的文件，系统将自动跳过已导入数据</li>
          </ol>
        </div>

        <ElButton class="btn-download-full" @click="handleDownloadFailed">
          <ElIcon><Download /></ElIcon>下载失败数据
        </ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { Download, CircleCheckFilled, WarningFilled } from '@element-plus/icons-vue'
  import {
    exportOrderImportReport,
    fetchOrderImportReportDataStats,
    fetchOrderImportReportErrorDistribution,
    fetchOrderImportReportFailedItems,
    fetchOrderImportReportPreviewList,
    fetchOrderImportReportTaskInfo
  } from '@/api/config-management/order-import'
  import { getErrorDistribution } from '../mock/data'
  import type { ErrorDistributionItem, ImportReportDetail, ImportReportItem } from '../types'

  defineOptions({ name: 'OrderImportReport' })

  const router = useRouter()
  const route = useRoute()
  const taskId = computed(() => route.params.taskId as string)

  const STATUS_LABEL: Record<string, string> = {
    completed: '成功',
    partial: '部分成功',
    failed: '失败',
    processing: '处理中'
  }

  // ─── 报告数据 ──────────────────────────────────────────
  const report = ref<ImportReportDetail>({
    taskId: '',
    dataSource: 'appstore',
    fileName: '',
    uploadTime: '',
    completedTime: '',
    durationSec: 0,
    status: 'completed',
    totalRecords: 0,
    newImports: 0,
    duplicateSkipped: 0,
    failedCount: 0,
    previewList: [],
    previewTotal: 0,
    duplicateRatio: 0
  })

  const failedItems = ref<NonNullable<ImportReportDetail['failedItems']>>([])
  const errorDistribution = ref<ErrorDistributionItem[]>([])

  const loadReport = async () => {
    if (!taskId.value) return
    try {
      const [taskInfo, dataStats, previewData, failedData, errorData] = await Promise.all([
        fetchOrderImportReportTaskInfo(taskId.value),
        fetchOrderImportReportDataStats(taskId.value),
        fetchOrderImportReportPreviewList({
          taskId: taskId.value,
          page: previewPage.value,
          pageSize: previewPageSize
        }),
        fetchOrderImportReportFailedItems(taskId.value),
        fetchOrderImportReportErrorDistribution(taskId.value)
      ])
      report.value = {
        ...report.value,
        ...taskInfo,
        ...dataStats,
        previewList: previewData.records,
        previewTotal: previewData.total
      }
      failedItems.value = failedData.records ?? []
      errorDistribution.value = errorData.items ?? []
    } catch {
      ElMessage.error('报告加载失败，请稍后重试')
    }
  }

  onMounted(() => {
    loadReport()
  })

  // ─── 计算属性 ──────────────────────────────────────────
  const hasFailures = computed(
    () => report.value.status === 'partial' || report.value.status === 'failed'
  )

  const durationText = computed(() => {
    const s = report.value.durationSec
    return `${Math.floor(s / 60)} 分 ${String(s % 60).padStart(2, '0')} 秒`
  })

  const pct = (n: number) =>
    report.value.totalRecords ? Math.round((n / report.value.totalRecords) * 100) : 0

  const qualityLevel = computed(() => {
    const failRate = report.value.totalRecords
      ? report.value.failedCount / report.value.totalRecords
      : 0
    return failRate === 0 ? 'good' : failRate < 0.05 ? 'medium' : 'bad'
  })
  const qualityText = computed(
    () => ({ good: '优秀', medium: '需关注', bad: '较差' })[qualityLevel.value]
  )
  const suggestText = computed(() =>
    qualityLevel.value === 'good' ? '无异常，数据已全部入库' : '请下载失败数据并修正后重新上传'
  )

  // ─── 环形图 ─────────────────────────────────────────────
  const donutCirc = Math.PI * 2 * 38
  const newArc = computed(() => (pct(report.value.newImports) / 100) * donutCirc)
  const dupArc = computed(() => (pct(report.value.duplicateSkipped) / 100) * donutCirc)
  const failArc = computed(() => (pct(report.value.failedCount) / 100) * donutCirc)

  // ─── 成功态：预览分页 ──────────────────────────────────
  const previewPage = ref(1)
  const previewPageSize = 6
  const previewTotalPages = computed(() => Math.ceil(report.value.previewTotal / previewPageSize))
  const pagedPreview = computed<ImportReportItem[]>(() => report.value.previewList)

  const handlePreviewPageChange = async () => {
    if (!taskId.value) return
    try {
      const previewData = await fetchOrderImportReportPreviewList({
        taskId: taskId.value,
        page: previewPage.value,
        pageSize: previewPageSize
      })
      report.value.previewList = previewData.records
      report.value.previewTotal = previewData.total
    } catch {
      ElMessage.error('预览列表加载失败，请稍后重试')
    }
  }

  // ─── 失败态：错误分布 ──────────────────────────────────
  const errorDist = computed(() =>
    errorDistribution.value.length
      ? errorDistribution.value
      : getErrorDistribution(failedItems.value)
  )
  const displayedFailedItems = computed(() => failedItems.value.slice(0, 5))

  // ─── 操作 ──────────────────────────────────────────────
  const goBack = () => router.push({ name: 'OrderImport' })
  const handleDownloadFailed = async () => {
    try {
      await exportOrderImportReport(taskId.value)
      ElMessage.success('已触发失败数据导出')
    } catch {
      ElMessage.error('导出失败，请稍后重试')
    }
  }
</script>

<style lang="scss" scoped>
  .ir-page {
    --bg-page: #0b1120;
    --bg-card: #131c2e;
    --border: rgb(255 255 255 / 7%);
    --border-warn: rgb(245 158 11 / 35%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;
    --amber: #f59e0b;
    --red: #ef4444;

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
    flex-wrap: wrap;
    gap: 12px;
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

  .bc-item {
    color: var(--text-secondary);
    cursor: pointer;
    &:hover {
      color: var(--accent);
    }
  }

  .bc-sep {
    color: var(--text-muted);
  }
  .bc-current {
    color: var(--text-secondary);
  }

  .page-title {
    display: flex;
    gap: 10px;
    align-items: center;
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .task-id-badge {
    padding: 3px 10px;
    font-family: monospace;
    font-size: 14px;
    font-weight: 500;
    border-radius: 6px;

    &--completed {
      color: #60a5fa;
      background: rgb(59 130 246 / 12%);
    }

    &--partial {
      color: var(--amber);
      background: rgb(245 158 11 / 12%);
    }

    &--failed {
      color: var(--red);
      background: rgb(239 68 68 / 12%);
    }

    &--processing {
      color: #60a5fa;
      background: rgb(59 130 246 / 12%);
    }
  }

  .topbar-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .btn-download {
    display: inline-flex !important;
    gap: 5px !important;
    align-items: center !important;
    color: var(--amber) !important;
    background: transparent !important;
    border: 1px solid rgb(245 158 11 / 50%) !important;
    border-radius: 8px !important;

    &:hover {
      color: #0b1120 !important;
      background: var(--amber) !important;
      border-color: var(--amber) !important;
    }
  }

  .btn-back {
    font-weight: 600 !important;
    color: #0b1120 !important;
    background: var(--accent) !important;
    border: none !important;
    border-radius: 8px !important;

    &:hover {
      filter: brightness(1.1);
    }
  }

  // ─── 三卡信息行 ──────────────────────────────────────────
  .info-row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 0.8fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .info-card {
    padding: 20px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;

    &--warn {
      background: linear-gradient(135deg, #131c2e 0%, #1e1608 100%);
      border-color: var(--border-warn);
    }
  }

  .info-card-title {
    margin-bottom: 14px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .info-label {
    font-size: 12px;
    color: var(--text-muted);
  }

  .info-value {
    font-size: 13px;
    color: var(--text-primary);

    &--mono {
      font-family: monospace;
    }
  }

  .source-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 4px;

    &--appstore {
      color: #60a5fa;
      background: rgb(29 111 206 / 15%);
    }

    &--googleplay {
      color: #4ade80;
      background: rgb(26 138 67 / 15%);
    }
  }

  // ─── 数据统计卡 ──────────────────────────────────────────
  .stats-body {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .stats-left {
    flex: 1;
  }

  .stats-total {
    margin-bottom: 4px;
    font-size: 36px;
    font-weight: 700;
    line-height: 1;
    color: var(--text-primary);
  }

  .stats-total-label {
    margin-bottom: 12px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .legend-item {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 5px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .legend-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    &--teal {
      background: #2dd4bf;
    }
    &--amber {
      background: #f59e0b;
    }
    &--red {
      background: #ef4444;
    }
  }

  .stats-right {
    flex-shrink: 0;
    width: 90px;
    height: 90px;
  }

  .donut {
    width: 100%;
    height: 100%;
  }

  .donut-track {
    fill: none;
    stroke: rgb(255 255 255 / 6%);
    stroke-width: 14;
  }

  .donut-seg {
    fill: none;
    stroke-width: 14;
  }
  .donut-seg--teal {
    stroke: #2dd4bf;
  }
  .donut-seg--amber {
    stroke: #f59e0b;
  }
  .donut-seg--red {
    stroke: #ef4444;
  }

  // ─── 状态卡 ──────────────────────────────────────────────
  .status-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .status-icon-row {
    display: flex;
    gap: 8px;
    align-items: center;

    &--completed {
      color: #22c55e;
    }
    &--partial {
      color: var(--amber);
    }
    &--failed {
      color: var(--red);
    }
    &--processing {
      color: #60a5fa;
    }
  }

  .status-label {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .status-quality-row {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
  }

  .sq-label {
    color: var(--text-muted);
  }

  .sq-value {
    color: var(--text-secondary);
    &--good {
      color: #22c55e;
    }
    &--medium {
      color: var(--amber);
    }
    &--bad {
      color: var(--red);
    }
  }

  .status-suggest {
    display: flex;
    gap: 6px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .suggest-label {
    flex-shrink: 0;
  }

  // ─── 底部布局 ────────────────────────────────────────────
  .bottom-row {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 12px;
  }

  // ─── 主表格面板 ──────────────────────────────────────────
  .preview-panel {
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .preview-header {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--border);
  }

  .preview-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .preview-count {
    font-size: 12px;
    color: var(--accent);

    &--red {
      color: var(--red);
    }
  }

  .btn-link {
    padding: 3px 10px;
    margin-left: auto;
    font-size: 12px;
    color: var(--accent);
    cursor: pointer;
    background: transparent;
    border: 1px solid rgb(45 212 191 / 30%);
    border-radius: 4px;
    transition: all 0.15s;

    &:hover {
      background: rgb(45 212 191 / 10%);
    }

    &--amber {
      color: var(--amber);
      border-color: rgb(245 158 11 / 30%);
      &:hover {
        background: rgb(245 158 11 / 10%);
      }
    }
  }

  .ir-table {
    width: 100%;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: #0d1626;
    --el-table-row-hover-bg-color: #162035;
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);

    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 10px;
      font-size: 12px;
      background: #0d1626 !important;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(td.el-table__cell) {
      padding: 10px;
      font-size: 12px;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(tr) {
      background: transparent !important;
    }
    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }
  }

  .row-num {
    font-family: monospace;
    font-size: 12px;
    color: var(--text-muted);
  }

  // 错误标签
  .error-tag {
    font-size: 12px;
    font-weight: 500;

    &--missing_field {
      color: var(--red);
    }
    &--amount_format {
      color: var(--amber);
    }
    &--date_format {
      color: #f97316;
    }
    &--country_code {
      color: var(--amber);
    }
    &--other {
      color: var(--text-muted);
    }
  }

  .table-footer {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
    padding: 8px 16px;
    border-top: 1px solid var(--border);
  }

  .footer-text {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 12px;
    color: var(--text-muted);
  }

  .ir-pagination {
    :deep(.el-pager li) {
      min-width: 26px;
      height: 26px;
      font-size: 12px;
      line-height: 26px;
      color: var(--text-secondary);
      background: transparent;
      border-radius: 4px;
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
      border-radius: 4px;

      &:hover {
        color: var(--accent) !important;
        border-color: var(--accent) !important;
      }
    }
  }

  // ─── 侧边面板 ────────────────────────────────────────────
  .side-panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 20px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .side-panel-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  // 成功态：重复说明
  .dup-rule-box {
    padding: 12px 14px;
    background: rgb(245 158 11 / 8%);
    border: 1px solid rgb(245 158 11 / 20%);
    border-radius: 8px;
  }

  .dup-rule-label {
    margin-bottom: 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--amber);
  }

  .dup-rule-text {
    margin-bottom: 6px;
    font-size: 13px;
    color: var(--text-primary);
  }

  .dup-rule-desc {
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .dup-ratio-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }

  .progress-bar-wrap {
    height: 6px;
    overflow: hidden;
    background: rgb(255 255 255 / 6%);
    border-radius: 3px;
  }

  .progress-bar-fill {
    height: 100%;
    border-radius: 3px;
    &--amber {
      background: var(--amber);
    }
  }

  .side-tip {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-muted);
  }

  .btn-text-link {
    padding: 0;
    font-size: 13px;
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
    background: transparent;
    border: none;
    &:hover {
      opacity: 0.8;
    }
  }

  // 失败态：错误分布
  .error-dist-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .error-dist-item {
    display: grid;
    grid-template-columns: 100px 1fr 36px;
    gap: 8px;
    align-items: center;
    font-size: 12px;
  }

  .error-dist-label {
    overflow: hidden;
    color: var(--text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .error-dist-bar-wrap {
    position: relative;
    display: flex;
    gap: 6px;
    align-items: center;
    height: 14px;
    overflow: hidden;
    background: rgb(255 255 255 / 4%);
    border-radius: 3px;
  }

  .error-dist-bar {
    min-width: 4px;
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
  }

  .error-dist-pct {
    position: absolute;
    right: 4px;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 0 4px rgb(0 0 0 / 80%);
  }

  .error-dist-count {
    font-size: 12px;
    color: var(--text-muted);
    text-align: right;
    white-space: nowrap;
  }

  // 处理建议框
  .fix-suggest-box {
    padding: 14px;
    background: rgb(45 212 191 / 6%);
    border: 1px solid rgb(45 212 191 / 20%);
    border-radius: 8px;
  }

  .fix-suggest-title {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
  }

  .fix-suggest-list {
    padding-left: 18px;
    margin: 0;
    font-size: 12px;
    line-height: 1.8;
    color: var(--text-secondary);
  }

  .btn-download-full {
    display: inline-flex !important;
    gap: 6px !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    padding: 10px !important;
    color: var(--amber) !important;
    background: transparent !important;
    border: 1px solid rgb(245 158 11 / 50%) !important;
    border-radius: 8px !important;

    &:hover {
      color: #0b1120 !important;
      background: var(--amber) !important;
      border-color: var(--amber) !important;
    }
  }
</style>
