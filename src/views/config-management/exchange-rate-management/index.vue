<template>
  <div class="account-sub-page credential-page er-page art-full-height">
    <div class="account-sub-page__toolbar">
      <div class="account-sub-page__toolbar-fx" aria-hidden="true" />
      <div class="account-sub-page__toolbar-row">
        <div class="account-sub-page__toolbar-copy">
          <span class="account-sub-page__toolbar-line" aria-hidden="true" />
          <div class="account-sub-page__toolbar-titles">
            <span class="account-sub-page__toolbar-eyebrow">FX</span>
            <span class="account-sub-page__toolbar-title">汇率管理</span>
          </div>
          <span class="account-sub-page__toolbar-hint">同步、手动维护、走势与异常阈值</span>
        </div>
        <div class="account-sub-page__toolbar-actions">
          <ElButton
            type="primary"
            round
            class="account-sub-page__btn-primary"
            @click="openSyncDialog"
          >
            <ElIcon><Refresh /></ElIcon>同步汇率
          </ElButton>
          <ElButton round class="account-sub-page__btn-secondary" @click="manualVisible = true">
            <ElIcon><Edit /></ElIcon>手动输入
          </ElButton>
          <ElButton round class="account-sub-page__btn-secondary" @click="handleExport">
            <ElIcon><Download /></ElIcon>导出
          </ElButton>
        </div>
      </div>
    </div>

    <section class="account-sub-page__list-panel credential-page__panel" aria-label="汇率管理">
      <div class="account-sub-page__list-panel-fx" aria-hidden="true" />
      <div class="account-sub-page__list-panel-body credential-page__panel-body">
        <div class="er-filter-bar">
          <AppDatePicker
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
                  <div class="kpi-value kpi-value--source">{{ kpi.dataSourceLabel }}</div>
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
                <el-table-column
                  prop="lastUpdated"
                  label="最后更新"
                  min-width="90"
                  align="center"
                />
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
                <el-table-column label="操作" width="110" align="center" fixed="right">
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
                  <ElSwitch v-model="syncConfig.backupSourceEnabled" class="backup-switch" />
                </div>
              </div>

              <ElButton
                type="primary"
                round
                class="account-sub-page__btn-primary btn-save-settings"
                @click="handleSaveSettings"
                >保存设置</ElButton
              >
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 弹窗 ─────────────────────────────────────────── -->
    <RateManualDialog
      v-model:visible="manualVisible"
      :currency-options="syncMetaOptions.currencyOptions"
      @success="handleManualSuccess"
    />

    <RateSyncDialog
      v-model:visible="syncDialogVisible"
      :source-options="syncMetaOptions.sourceOptions"
      :pair-options="syncMetaOptions.pairOptions"
      @sync="handleStartSync"
    />

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
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import * as echarts from 'echarts/core'
  import { LineChart } from 'echarts/charts'
  import { TooltipComponent, GridComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { getAppNow } from '@/utils/app-now'
  import {
    fetchExchangeRateTable,
    fetchExchangeRateOverviewKpi,
    fetchExchangeRateTrend,
    fetchExchangeRateSyncConfig,
    fetchExchangeRateSyncMetaOptions,
    createExchangeRate,
    syncExchangeRates,
    saveSyncConfig,
    exportExchangeRates,
    updateExchangeRateOverride
  } from '@/api/config-management/exchange-rate-management'
  import RateManualDialog from './modules/rate-manual-dialog.vue'
  import RateSyncDialog from './modules/rate-sync-dialog.vue'
  import RateSyncProgressDialog from './modules/rate-sync-progress-dialog.vue'
  import RateSyncDoneDialog from './modules/rate-sync-done-dialog.vue'
  import { ALL_CURRENCY_PAIRS } from './mock/data'
  import type {
    ExchangeRateItem,
    ExchangeRateOverviewKpi,
    ExchangeRateSyncMetaOptions,
    ExchangeRateTrendPoint,
    ManualRateFormModel,
    SyncResult,
    SyncConfig
  } from './types'

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
  const syncMetaOptions = ref<ExchangeRateSyncMetaOptions>({
    sourceOptions: [],
    pairOptions: [],
    currencyOptions: []
  })

  watch(filterPair, () => {
    currentPage.value = 1
  })
  watch(filterDate, () => {
    currentPage.value = 1
  })

  // ─── 同步设置 ───────────────────────────────────────────
  const syncConfig = reactive<SyncConfig & { alertThreshold: number }>({
    frequency: 'hourly',
    alertThreshold: 2,
    primarySource: 'openexchange',
    backupSourceEnabled: true
  })

  // ─── KPI ────────────────────────────────────────────────
  const lastSyncTime = ref(getAppNow())
  const kpiData = ref<ExchangeRateOverviewKpi>({
    total: 0,
    abnormal: 0,
    lastSyncTime: '',
    dataSourceLabel: 'Open Exchange'
  })

  const kpi = computed(() => {
    const diff = Math.round((getAppNow().getTime() - lastSyncTime.value.getTime()) / 60000)
    const diffLabel = diff < 1 ? '刚刚' : `${diff}分钟前`
    return {
      total: kpiData.value.total,
      lastSyncLabel: diffLabel,
      abnormal: kpiData.value.abnormal,
      dataSourceLabel: kpiData.value.dataSourceLabel
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

  async function loadSyncMetaOptions() {
    try {
      syncMetaOptions.value = await fetchExchangeRateSyncMetaOptions()
    } catch {
      // 保持组件内默认兜底
    }
  }

  async function loadKpiFromApi() {
    try {
      const data = await fetchExchangeRateOverviewKpi({
        ...tableQueryBase(),
        alertThreshold: syncConfig.alertThreshold
      })
      kpiData.value = data
      if (data.lastSyncTime) {
        lastSyncTime.value = new Date(data.lastSyncTime.replace(' ', 'T'))
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
  watch(filterDate, () => {
    void loadTrend()
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
  const trendPoints = ref<ExchangeRateTrendPoint[]>([])

  async function loadTrend() {
    try {
      trendPoints.value = await fetchExchangeRateTrend({
        pair: activePair.value,
        date: filterDate.value || undefined
      })
      lineChart?.setOption(buildLineOption())
    } catch {
      trendPoints.value = []
      lineChart?.setOption(buildLineOption())
      ElMessage.error('加载走势图失败')
    }
  }

  function buildLineOption() {
    const dates = trendPoints.value.map((item) => {
      const d = new Date(item.date)
      return `${d.getMonth() + 1}/${d.getDate()}`
    })
    const trendData = trendPoints.value.map((item) => item.rate)
    return {
      backgroundColor: 'transparent',
      grid: { left: 8, right: 8, top: 12, bottom: 6, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        borderColor: 'rgba(255,255,255,0.08)',
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
          data: trendData,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#14b8a6', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(20,184,166,0.22)' },
              { offset: 1, color: 'rgba(20,184,166,0.02)' }
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
    void loadSyncMetaOptions()
    void (async () => {
      try {
        const config = await fetchExchangeRateSyncConfig()
        syncConfig.frequency = config.frequency
        syncConfig.alertThreshold = config.alertThreshold
        syncConfig.primarySource = config.primarySource
        syncConfig.backupSourceEnabled = config.backupSourceEnabled
      } catch {
        // 保持默认配置
      }
    })()
    void loadTable()
    void loadKpiFromApi()
    void loadTrend()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart)
    lineChart?.dispose()
  })

  // ─── 操作 ──────────────────────────────────────────────
  const handleRowClick = (row: ExchangeRateItem) => {
    activePair.value = row.pair
    void loadTrend()
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
  .account-sub-page.credential-page.er-page {
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

  .account-sub-page.credential-page.er-page::before {
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

  .account-sub-page.credential-page.er-page > * {
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

  .er-filter-bar {
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

  .header-date {
    width: 150px;

    :deep(.el-input__wrapper) {
      color: var(--text-primary);
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
      color: var(--text-primary);
    }
  }

  .header-select {
    width: 130px;

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
      background: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    }

    &--blue {
      background: color-mix(in srgb, var(--el-color-info) 18%, transparent);
    }

    &--amber {
      background: color-mix(in srgb, var(--art-warning) 18%, transparent);
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
      color: var(--accent);
    }

    &--blue {
      color: var(--el-color-info);
    }

    &--amber {
      color: var(--art-warning);
    }

    &--source {
      font-size: 16px;
      font-weight: 700;
      color: var(--accent);
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
      background: linear-gradient(90deg, var(--accent), transparent);
    }

    &--blue {
      background: linear-gradient(90deg, var(--el-color-info), transparent);
    }

    &--amber {
      background: linear-gradient(90deg, var(--art-warning), transparent);
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
    --el-table-header-bg-color: var(--as-header-bg);
    --el-table-row-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-border: 1px solid var(--border);

    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 11px 8px;
      font-size: 12px;
      font-weight: 500;
      background: var(--as-header-bg) !important;
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
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 12%, transparent);
    }

    &--down {
      color: var(--art-danger);
      background: color-mix(in srgb, var(--art-danger) 12%, transparent);
    }
  }

  .source-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    font-size: 11px;
    border-radius: 4px;

    &--auto {
      color: var(--el-color-info);
      background: color-mix(in srgb, var(--el-color-info) 12%, transparent);
    }

    &--manual {
      color: var(--art-warning);
      background: color-mix(in srgb, var(--art-warning) 12%, transparent);
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
      color: var(--art-warning);
      background: color-mix(in srgb, var(--art-warning) 12%, transparent);
      border-color: var(--art-warning);
    }

    &:hover:not(.override-btn--active) {
      color: var(--text-primary);
      border-color: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
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
    background: color-mix(in srgb, var(--default-box-color) 40%, transparent);
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
      background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
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
      color: var(--art-success);
    }
  }

  .backup-switch.el-switch {
    --el-switch-on-color: var(--el-color-primary);
  }

  .btn-save-settings {
    width: 100%;
    margin-top: 4px;
  }

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

  @media (width <= 1100px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (width <= 900px) {
    .kpi-row {
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

    .kpi-row {
      grid-template-columns: 1fr 1fr;
    }

    .er-filter-bar .header-date,
    .er-filter-bar .header-select {
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
