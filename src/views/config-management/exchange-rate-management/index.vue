<template>
  <div class="er-page art-full-height">
    <!-- ── 页面头部 ─────────────────────────────────────── -->
    <div class="page-header">
      <span class="breadcrumb">
        <span class="bc-parent">系统管理</span>
        <span class="bc-sep">›</span>
        <span class="bc-current">汇率管理</span>
      </span>
      <div class="header-actions">
        <ElButton round class="btn-sync" @click="openSyncDialog">
          <ElIcon><Refresh /></ElIcon>同步汇率
        </ElButton>
        <ElButton round class="btn-secondary" @click="manualVisible = true">
          <ElIcon><Edit /></ElIcon>手动输入
        </ElButton>
        <ElButton round class="btn-secondary" @click="handleExport">
          <ElIcon><Download /></ElIcon>导出
        </ElButton>
        <ElDatePicker
          v-model="filterDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          class="header-date"
        />
        <el-select v-model="filterPair" placeholder="货币对 全部" class="header-select" clearable>
          <el-option v-for="p in ALL_CURRENCY_PAIRS" :key="p" :label="p" :value="p" />
        </el-select>
      </div>
    </div>

    <!-- ── 内容区：左右两列 ─────────────────────────────── -->
    <div class="content-grid">
      <!-- 左列：KPI四卡 + 汇率列表表格 -->
      <div class="left-col">
        <!-- KPI 四卡 -->
        <div class="kpi-row">
          <div class="kpi-card kpi-card--teal">
            <div class="kpi-icon-wrap kpi-icon-wrap--teal">💱</div>
            <div class="kpi-body">
              <div class="kpi-label">已配置货币对</div>
              <div class="kpi-value kpi-value--teal"
                >{{ kpi.total }}<span class="kpi-unit">对</span></div
              >
            </div>
            <div class="kpi-accent kpi-accent--teal" />
          </div>
          <div class="kpi-card kpi-card--blue">
            <div class="kpi-icon-wrap kpi-icon-wrap--blue">🕐</div>
            <div class="kpi-body">
              <div class="kpi-label">最后同步时间</div>
              <div class="kpi-value kpi-value--blue kpi-value--sm">{{ kpi.lastSyncLabel }}</div>
            </div>
            <div class="kpi-accent kpi-accent--blue" />
          </div>
          <div class="kpi-card kpi-card--amber">
            <div class="kpi-icon-wrap kpi-icon-wrap--amber">⚠️</div>
            <div class="kpi-body">
              <div class="kpi-label">异常汇率</div>
              <div class="kpi-value kpi-value--amber">
                {{ kpi.abnormal }}<span class="kpi-unit">个</span>
              </div>
              <div class="kpi-sub">偏差超过 {{ syncConfig.alertThreshold }}%</div>
            </div>
            <div class="kpi-accent kpi-accent--amber" />
          </div>
          <div class="kpi-card kpi-card--source">
            <div class="kpi-icon-wrap kpi-icon-wrap--teal">🔗</div>
            <div class="kpi-body">
              <div class="kpi-label">数据来源</div>
              <div class="kpi-value kpi-value--source">Open Exchange</div>
            </div>
            <div class="kpi-accent kpi-accent--teal" />
          </div>
        </div>

        <!-- 表格 -->
        <div class="table-panel">
          <el-table
            :data="rateList"
            class="rate-table"
            style="width: 100%"
            @row-click="handleRowClick"
          >
            <el-table-column prop="pair" label="货币对" min-width="90" show-overflow-tooltip />
            <el-table-column label="当前汇率" min-width="100" align="right">
              <template #default="{ row }">
                <span class="rate-val">{{ formatRate(row.currentRate) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="昨日汇率" min-width="100" align="right">
              <template #default="{ row }">
                <span class="rate-val rate-val--dim">{{ formatRate(row.yesterdayRate) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="变动幅度" min-width="100" align="center">
              <template #default="{ row }">
                <span
                  :class="[
                    'change-badge',
                    row.changePercent >= 0 ? 'change-badge--up' : 'change-badge--down'
                  ]"
                >
                  {{ row.changePercent >= 0 ? '▲' : '▼' }}
                  {{ Math.abs(row.changePercent).toFixed(2) }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="lastUpdated" label="最后更新" min-width="90" align="center" />
            <el-table-column label="数据来源" min-width="90" align="center">
              <template #default="{ row }">
                <span
                  :class="[
                    'source-tag',
                    row.dataSource === 'manual' ? 'source-tag--manual' : 'source-tag--auto'
                  ]"
                >
                  {{ row.dataSource === 'manual' ? '手动' : '自动同步' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="90" align="center" fixed="right">
              <template #default="{ row }">
                <button
                  :class="['override-btn', row.overrideAuto && 'override-btn--active']"
                  @click.stop="toggleOverride(row)"
                >
                  {{ row.overrideAuto ? '已覆盖' : '覆盖' }}
                </button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-bar">
            <span class="total-text">共 {{ serverTotal }} 条</span>
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="serverTotal"
              layout="prev, pager, next"
              class="er-pagination"
            />
          </div>
        </div>
      </div>

      <!-- 右列：走势图 + 同步设置 -->
      <div class="right-col">
        <!-- 走势图 -->
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">{{ activePair }} 走势（30天）</span>
          </div>
          <div ref="lineEl" class="line-chart" />
        </div>

        <!-- 同步设置 -->
        <div class="settings-card">
          <div class="settings-title">同步设置</div>

          <div class="settings-item">
            <span class="settings-label">同步频率</span>
            <div class="freq-tabs">
              <button
                v-for="f in FREQ_OPTIONS"
                :key="f.value"
                :class="['freq-tab', syncConfig.frequency === f.value && 'freq-tab--active']"
                @click="syncConfig.frequency = f.value"
              >
                {{ f.label }}
              </button>
            </div>
          </div>

          <div class="settings-item">
            <span class="settings-label">异常预警阈值</span>
            <div class="threshold-row">
              <span class="threshold-prefix">偏差超过</span>
              <ElInputNumber
                v-model="syncConfig.alertThreshold"
                :min="1"
                :max="50"
                :step="1"
                class="threshold-input"
                controls-position="right"
              />
              <span class="threshold-suffix">% 时发送警告</span>
            </div>
          </div>

          <div class="settings-item">
            <span class="settings-label">数据来源</span>
            <div class="source-row">
              <span class="source-name">Open Exchange Rates API</span>
              <span class="source-status source-status--ok">已连接 ✓</span>
            </div>
          </div>

          <div class="settings-item">
            <span class="settings-label">备用来源</span>
            <div class="source-row">
              <span class="source-name">Fixer.io</span>
              <ElSwitch
                v-model="syncConfig.backupSourceEnabled"
                active-color="#2dd4bf"
                class="backup-switch"
              />
            </div>
          </div>

          <ElButton round class="btn-save-settings" @click="handleSaveSettings">保存设置</ElButton>
        </div>
      </div>
    </div>

    <!-- ── 弹窗 ─────────────────────────────────────────── -->
    <RateManualDialog v-model:visible="manualVisible" @success="handleManualSuccess" />

    <RateSyncDialog v-model:visible="syncDialogVisible" @sync="handleStartSync" />

    <RateSyncProgressDialog
      v-model:visible="syncProgressVisible"
      :current="syncProgress.current"
      :total="syncProgress.total"
      :current-pair="syncProgress.currentPair"
      :pairs="syncProgress.pairs"
      @cancel="handleCancelSync"
    />

    <RateSyncDoneDialog v-model:visible="syncDoneVisible" :result="syncResult" />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { Refresh, Edit, Download } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import * as echarts from 'echarts/core'
  import { LineChart } from 'echarts/charts'
  import { TooltipComponent, GridComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { getAppNow, cloneAppDate } from '@/utils/app-now'
  import {
    fetchExchangeRateTable,
    createExchangeRate,
    syncExchangeRates,
    saveSyncConfig,
    exportExchangeRates,
    updateExchangeRateOverride
  } from '@/api/config-management'
  import RateManualDialog from './modules/rate-manual-dialog.vue'
  import RateSyncDialog from './modules/rate-sync-dialog.vue'
  import RateSyncProgressDialog from './modules/rate-sync-progress-dialog.vue'
  import RateSyncDoneDialog from './modules/rate-sync-done-dialog.vue'
  import { ALL_CURRENCY_PAIRS, mockTrendData, mockSyncConfig } from './mock/data'
  import type { ExchangeRateItem, ManualRateFormModel, SyncResult, SyncConfig } from './types'

  echarts.use([LineChart, TooltipComponent, GridComponent, CanvasRenderer])

  defineOptions({ name: 'ExchangeRateManagement' })

  // ─── 数据 ──────────────────────────────────────────────
  const rateList = ref<ExchangeRateItem[]>([])
  const serverTotal = ref(0)
  const filterDate = ref('')
  const filterPair = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const activePair = ref('USD/EUR')

  watch(filterPair, () => {
    currentPage.value = 1
  })
  watch(filterDate, () => {
    currentPage.value = 1
  })

  // ─── 同步设置 ───────────────────────────────────────────
  const syncConfig = reactive<SyncConfig & { alertThreshold: number }>({
    ...mockSyncConfig,
    alertThreshold: mockSyncConfig.alertThreshold
  })

  // ─── KPI ────────────────────────────────────────────────
  const lastSyncTime = ref(getAppNow())
  const kpiData = ref({ total: 0, abnormal: 0 })

  const kpi = computed(() => {
    const diff = Math.round((getAppNow().getTime() - lastSyncTime.value.getTime()) / 60000)
    const diffLabel = diff < 1 ? '刚刚' : `${diff}分钟前`
    return {
      total: kpiData.value.total,
      lastSyncLabel: diffLabel,
      abnormal: kpiData.value.abnormal
    }
  })

  function tableQueryBase() {
    return {
      pair: filterPair.value || undefined,
      date: filterDate.value || undefined
    }
  }

  async function loadTable() {
    try {
      const res = await fetchExchangeRateTable({
        ...tableQueryBase(),
        page: currentPage.value,
        pageSize: pageSize.value
      })
      const r = res as Api.Common.PaginatedResponse<ExchangeRateItem>
      rateList.value = r.records ?? []
      serverTotal.value = r.total ?? 0
    } catch {
      ElMessage.error('加载列表失败')
    }
  }

  async function loadKpiFromApi() {
    try {
      const res = await fetchExchangeRateTable({
        ...tableQueryBase(),
        page: 1,
        pageSize: 10000
      })
      const r = res as Api.Common.PaginatedResponse<ExchangeRateItem>
      const rows = r.records ?? []
      kpiData.value = {
        total: r.total ?? rows.length,
        abnormal: rows.filter((row) => Math.abs(row.changePercent) > syncConfig.alertThreshold)
          .length
      }
    } catch {
      // 保持 KPI 上轮值
    }
  }

  watch([filterPair, filterDate, currentPage, pageSize], () => {
    void loadTable()
  })
  watch([filterPair, filterDate], () => {
    void loadKpiFromApi()
  })
  watch(
    () => syncConfig.alertThreshold,
    () => {
      void loadKpiFromApi()
    }
  )

  const FREQ_OPTIONS = [
    { label: '每小时', value: 'hourly' as const },
    { label: '每6小时', value: 'every6h' as const },
    { label: '每天', value: 'daily' as const }
  ]

  const handleSaveSettings = async () => {
    try {
      await saveSyncConfig(syncConfig)
      ElMessage.success('同步设置已保存')
    } catch {
      ElMessage.error('保存失败')
    }
  }

  // ─── 折线图 ─────────────────────────────────────────────
  const lineEl = ref<HTMLElement | null>(null)
  let lineChart: echarts.ECharts | null = null

  function buildLineOption() {
    const dates = Array.from({ length: 30 }, (_, i) => {
      const d = cloneAppDate(getAppNow())
      d.setDate(d.getDate() - (29 - i))
      return `${d.getMonth() + 1}/${d.getDate()}`
    })
    return {
      backgroundColor: 'transparent',
      grid: { left: 8, right: 8, top: 12, bottom: 6, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a2540',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#e2e8f0', fontSize: 12 },
        formatter: (params: { name: string; value: number }[]) =>
          `${params[0].name}：${params[0].value.toFixed(4)}`
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { color: '#64748b', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
        axisTick: { show: false },
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLabel: { color: '#64748b', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          type: 'line',
          data: mockTrendData,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#2dd4bf', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(45,212,191,0.25)' },
              { offset: 1, color: 'rgba(45,212,191,0.02)' }
            ])
          }
        }
      ]
    }
  }

  const resizeChart = () => lineChart?.resize()

  onMounted(() => {
    nextTick(() => {
      if (lineEl.value) {
        lineChart = echarts.init(lineEl.value)
        lineChart.setOption(buildLineOption())
      }
    })
    window.addEventListener('resize', resizeChart)
    void loadTable()
    void loadKpiFromApi()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart)
    lineChart?.dispose()
  })

  // ─── 操作 ──────────────────────────────────────────────
  const handleRowClick = (row: ExchangeRateItem) => {
    activePair.value = row.pair
  }

  const toggleOverride = async (row: ExchangeRateItem) => {
    const next = !row.overrideAuto
    try {
      await updateExchangeRateOverride(row.id, next)
      await loadTable()
      await loadKpiFromApi()
      ElMessage.success(next ? `${row.pair} 已覆盖自动同步` : `${row.pair} 已取消覆盖`)
    } catch {
      ElMessage.error('操作失败')
    }
  }

  const formatRate = (val: number) => {
    if (val >= 1000) return val.toLocaleString('en-US', { maximumFractionDigits: 2 })
    return val.toFixed(4)
  }

  // ─── 手动输入 ───────────────────────────────────────────
  const manualVisible = ref(false)

  const handleManualSuccess = async (payload: ManualRateFormModel) => {
    try {
      await createExchangeRate(payload)
      await loadTable()
      await loadKpiFromApi()
    } catch {
      ElMessage.error('保存失败')
    }
  }

  // ─── 同步汇率 ───────────────────────────────────────────
  const syncDialogVisible = ref(false)
  const syncProgressVisible = ref(false)
  const syncDoneVisible = ref(false)

  const syncProgress = reactive({
    current: 0,
    total: 0,
    currentPair: '',
    pairs: [] as string[]
  })

  const syncResult = ref<SyncResult>({
    total: 0,
    success: 0,
    overrideManual: 0,
    failed: 0,
    syncTime: ''
  })

  let syncTimer: ReturnType<typeof setInterval> | null = null

  const openSyncDialog = () => {
    syncDialogVisible.value = true
  }

  const handleStartSync = async (pairs: string[], source = 'openexchange') => {
    try {
      await syncExchangeRates(pairs, source)
    } catch {
      ElMessage.error('同步请求失败')
      return
    }
    syncProgress.current = 0
    syncProgress.total = pairs.length
    syncProgress.currentPair = pairs[0] ?? ''
    syncProgress.pairs = pairs
    syncProgressVisible.value = true

    let i = 0
    syncTimer = setInterval(() => {
      i++
      syncProgress.current = i
      syncProgress.currentPair = pairs[i] ?? pairs[pairs.length - 1]
      if (i >= pairs.length) {
        clearInterval(syncTimer!)
        syncTimer = null
        syncProgressVisible.value = false
        const now = getAppNow()
        void (async () => {
          try {
            const full = await fetchExchangeRateTable({
              ...tableQueryBase(),
              page: 1,
              pageSize: 10000
            })
            const rows = (full as Api.Common.PaginatedResponse<ExchangeRateItem>).records ?? []
            const manualCount = rows.filter((r) => r.dataSource === 'manual').length
            syncResult.value = {
              total: pairs.length,
              success: Math.max(0, pairs.length - manualCount),
              overrideManual: manualCount,
              failed: 0,
              syncTime: now.toISOString().slice(0, 19).replace('T', ' ')
            }
          } catch {
            syncResult.value = {
              total: pairs.length,
              success: pairs.length,
              overrideManual: 0,
              failed: 0,
              syncTime: now.toISOString().slice(0, 19).replace('T', ' ')
            }
          }
          lastSyncTime.value = now
          syncDoneVisible.value = true
          await loadTable()
          await loadKpiFromApi()
        })()
      }
    }, 300)
  }

  const handleCancelSync = () => {
    if (syncTimer) {
      clearInterval(syncTimer)
      syncTimer = null
    }
    syncProgressVisible.value = false
    ElMessage.info('同步已取消')
  }

  // ─── 导出 ───────────────────────────────────────────────
  const handleExport = async () => {
    try {
      await exportExchangeRates({
        page: currentPage.value,
        pageSize: pageSize.value,
        pair: filterPair.value || undefined,
        date: filterDate.value || undefined
      })
      ElMessage.success('导出成功')
    } catch {
      ElMessage.error('导出失败')
    }
  }
</script>

<style lang="scss" scoped>
  .er-page {
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

  // ─── 头部 ───────────────────────────────────────────────
  .page-header {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    padding: 18px 0 14px;
  }

  .breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-right: 8px;
    font-size: 14px;
  }

  .bc-parent {
    color: var(--text-secondary);
  }

  .bc-sep {
    color: var(--text-muted);
  }

  .bc-current {
    font-weight: 600;
    color: var(--text-primary);
  }

  .header-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-left: auto;
  }

  .btn-sync {
    display: inline-flex;
    gap: 5px;
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
    }
  }

  .btn-secondary {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 8px 14px !important;
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

  .header-date {
    width: 150px;

    :deep(.el-input__wrapper) {
      color: var(--text-primary);
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
      color: var(--text-primary);
    }
  }

  .header-select {
    width: 130px;

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

  // ─── KPI ────────────────────────────────────────────────
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .kpi-card {
    position: relative;
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 16px 16px 20px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .kpi-icon-wrap {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    font-size: 20px;
    border-radius: 10px;

    &--teal {
      background: rgb(45 212 191 / 15%);
    }
    &--blue {
      background: rgb(96 165 250 / 15%);
    }
    &--amber {
      background: rgb(245 158 11 / 15%);
    }
  }

  .kpi-body {
    flex: 1;
    min-width: 0;
  }

  .kpi-label {
    margin-bottom: 4px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .kpi-value {
    font-size: 28px;
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

    &--source {
      font-size: 16px;
      font-weight: 700;
      color: #2dd4bf;
    }

    &--sm {
      font-size: 16px;
    }
  }

  .kpi-sub {
    margin-top: 3px;
    font-size: 11px;
    color: var(--text-muted);
  }

  .kpi-unit {
    margin-left: 3px;
    font-size: 13px;
    font-weight: 400;
    color: var(--text-muted);
  }

  .kpi-accent {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 3px;
    border-radius: 0 0 10px 10px;

    &--teal {
      background: linear-gradient(90deg, #2dd4bf, transparent);
    }
    &--blue {
      background: linear-gradient(90deg, #60a5fa, transparent);
    }
    &--amber {
      background: linear-gradient(90deg, #f59e0b, transparent);
    }
  }

  // ─── 两列布局 ────────────────────────────────────────────
  .content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 14px;
    align-items: start;
  }

  .left-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  .right-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  // ─── 表格 ───────────────────────────────────────────────
  .table-panel {
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .rate-table {
    width: 100%;
    cursor: pointer;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: #0f1829;
    --el-table-row-hover-bg-color: #162035;
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-border: 1px solid var(--border);

    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 11px 8px;
      font-size: 12px;
      font-weight: 500;
      background: #0f1829 !important;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(td.el-table__cell) {
      padding: 10px 8px;
      font-size: 13px;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(tr) {
      background: transparent !important;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }
  }

  .rate-val {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: var(--text-primary);

    &--dim {
      color: var(--text-muted);
    }
  }

  .change-badge {
    display: inline-flex;
    gap: 2px;
    align-items: center;
    padding: 2px 7px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 4px;

    &--up {
      color: #22c55e;
      background: rgb(34 197 94 / 12%);
    }

    &--down {
      color: #ef4444;
      background: rgb(239 68 68 / 12%);
    }
  }

  .source-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    font-size: 11px;
    border-radius: 4px;

    &--auto {
      color: #60a5fa;
      background: rgb(96 165 250 / 12%);
    }

    &--manual {
      color: #f59e0b;
      background: rgb(245 158 11 / 12%);
    }
  }

  .override-btn {
    padding: 3px 10px;
    font-size: 12px;
    color: var(--text-muted);
    cursor: pointer;
    background: none;
    border: 1px solid var(--border);
    border-radius: 4px;
    transition: all 0.15s;

    &--active {
      color: #f59e0b;
      background: rgb(245 158 11 / 12%);
      border-color: #f59e0b;
    }

    &:hover:not(.override-btn--active) {
      color: var(--text-primary);
      border-color: rgb(255 255 255 / 15%);
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
  }

  .er-pagination {
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

  // ─── 图表卡片 ────────────────────────────────────────────
  .chart-card {
    padding: 16px 14px 12px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .chart-header {
    margin-bottom: 10px;
  }

  .chart-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .line-chart {
    width: 100%;
    height: 200px;
  }

  // ─── 同步设置卡片 ─────────────────────────────────────────
  .settings-card {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .settings-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .settings-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .settings-label {
    font-size: 12px;
    color: var(--text-muted);
  }

  .freq-tabs {
    display: flex;
    gap: 6px;
  }

  .freq-tab {
    padding: 4px 10px;
    font-size: 12px;
    color: var(--text-muted);
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid var(--border);
    border-radius: 5px;
    transition: all 0.15s;

    &--active {
      color: var(--accent);
      background: var(--accent-dim);
      border-color: var(--accent);
    }

    &:hover:not(.freq-tab--active) {
      color: var(--text-secondary);
    }
  }

  .threshold-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .threshold-prefix,
  .threshold-suffix {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .threshold-input {
    width: 80px;

    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      box-shadow: none !important;

      &:hover,
      &:focus-within {
        border-color: var(--accent) !important;
      }
    }

    :deep(.el-input__inner) {
      color: var(--text-primary);
      text-align: center;
    }
  }

  .source-row {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
  }

  .source-name {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .source-status {
    font-size: 12px;
    font-weight: 600;

    &--ok {
      color: #22c55e;
    }
  }

  .btn-save-settings {
    width: 100%;
    font-weight: 600 !important;
    color: #0b1120 !important;
    background: var(--accent) !important;
    border: none !important;
    border-radius: 8px !important;
  }
</style>
