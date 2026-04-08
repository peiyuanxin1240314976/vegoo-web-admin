<template>
  <div class="revenue-deviation">
    <div class="rd-page-fx" aria-hidden="true"></div>
    <!-- ========== Header ========== -->
    <div class="rd-header rd-entry-1">
      <!-- <div class="rd-page-title">预估收入偏差</div> -->
      <div class="rd-filters">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          class="rd-filter-date"
          :teleported="true"
          popper-class="rd-filter-popper"
        />
        <el-select
          v-model="platform"
          class="rd-filter-select"
          placeholder="广告平台"
          popper-class="rd-filter-popper"
          :teleported="true"
        >
          <el-option
            v-for="item in sourceOptions"
            :key="`source-${item.value}-${item.label}`"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-select
          v-model="appFilter"
          class="rd-filter-select"
          placeholder="应用"
          popper-class="rd-filter-popper"
          :teleported="true"
        >
          <el-option
            v-for="item in appOptions"
            :key="`app-${item.value}-${item.label}`"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-button
          type="primary"
          plain
          round
          :loading="querying"
          :disabled="querying"
          @click="handleQuery"
        >
          查询
        </el-button>
      </div>
    </div>

    <!-- ========== KPI Cards ========== -->
    <div v-if="loadingKpi" class="rd-kpi-grid rd-entry-2">
      <div v-for="i in 5" :key="i" class="rd-kpi-card rd-kpi-card--sk">
        <ElSkeleton animated :throttle="0">
          <template #template>
            <div class="rd-kpi-sk">
              <ElSkeletonItem variant="text" class="rd-kpi-sk__label" />
              <ElSkeletonItem variant="text" class="rd-kpi-sk__value" />
              <ElSkeletonItem variant="text" class="rd-kpi-sk__sub" />
            </div>
          </template>
        </ElSkeleton>
      </div>
    </div>
    <div v-else-if="kpiOverview" class="rd-kpi-grid rd-entry-2">
      <div class="rd-kpi-card rd-kpi-card--green">
        <div class="rd-kpi-card__label">广告收入（预估）</div>
        <div class="rd-kpi-card__value rd-kpi-card__value--green">
          {{ formatUsd2(kpiOverview.d_revenue_estimated) }}
        </div>
        <div class="rd-kpi-card__sub">广告平台上报 / 客户端埋点展示事件计算</div>
      </div>
      <div class="rd-kpi-card rd-kpi-card--gold">
        <div class="rd-kpi-card__label">广告收入（真实）</div>
        <div class="rd-kpi-card__value rd-kpi-card__value--gold">
          {{ formatUsd2(kpiOverview.d_revenue_real) }}
        </div>
        <div class="rd-kpi-card__sub">实际入账金额 / 平台对账数据</div>
      </div>
      <div class="rd-kpi-card rd-kpi-card--red">
        <div class="rd-kpi-card__header-row">
          <div class="rd-kpi-card__label">偏差金额</div>
          <span class="rd-badge rd-badge--red">{{ kpiOverview.s_deviation_badge }}</span>
        </div>
        <div class="rd-kpi-card__value rd-kpi-card__value--red">
          {{ fmtUsdWithSign(kpiOverview.d_deviation_amount) }}
        </div>
        <div class="rd-kpi-card__sub">待对账确认</div>
      </div>
      <div class="rd-kpi-card rd-kpi-card--red">
        <div class="rd-kpi-card__label">偏差率</div>
        <div class="rd-kpi-card__value rd-kpi-card__value--red">
          {{ fmtPctSigned(kpiOverview.d_deviation_rate_pct) }}
        </div>
        <div class="rd-kpi-card__sub">
          {{ kpiOverview.s_deviation_badge }}，待对账 / 历史平均
          {{
            kpiOverview.d_deviation_rate_history_avg_pct.toLocaleString('en-US', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1
            })
          }}%
        </div>
      </div>
      <div class="rd-kpi-card rd-kpi-card--blue">
        <div class="rd-kpi-card__label">影响ROI估算</div>
        <div class="rd-kpi-card__value rd-kpi-card__value--blue">
          {{ fmtRoiPp(kpiOverview.n_roi_impact_pp) }}
        </div>
        <div class="rd-kpi-card__sub">实际ROI将低于预估 / 需校正ROI计算</div>
      </div>
    </div>
    <div v-else class="rd-kpi-empty-wrap rd-entry-2">
      <div class="rd-card rd-kpi-empty-card">
        <ElEmpty description="暂无概览数据，请调整筛选条件或稍后重试" :image-size="88" />
      </div>
    </div>

    <!-- ========== Middle Row ========== -->
    <div class="rd-middle-grid rd-entry-3">
      <!-- 趋势图 -->
      <div class="rd-card rd-trend-card">
        <div class="rd-card__title">收入偏差趋势（30天）</div>
        <div v-if="loadingTrend" class="rd-chart-sk"></div>
        <div v-else-if="isTrendEmpty" class="rd-card-empty rd-card-empty--trend">
          <ElEmpty description="暂无趋势数据" :image-size="90" />
        </div>
        <template v-else>
          <div ref="trendChartRef" class="rd-trend-chart"></div>
          <div class="rd-trend-legend">
            <span class="rd-legend-item rd-legend-item--dashed rd-legend-item--green"
              >预估收入</span
            >
            <span class="rd-legend-item rd-legend-item--solid rd-legend-item--teal">真实收入</span>
            <span class="rd-legend-item rd-legend-item--area rd-legend-item--orange">偏差区域</span>
          </div>
        </template>
      </div>

      <!-- 平台偏差对比 -->
      <div class="rd-card rd-platform-card">
        <div class="rd-card__title">平台偏差对比</div>
        <div v-if="loadingPlatformTable" class="rd-table-skeleton">
          <ElSkeleton animated :throttle="0">
            <template #template>
              <div class="rd-table-skeleton__head">
                <ElSkeletonItem
                  v-for="h in 4"
                  :key="`ph-${h}`"
                  variant="text"
                  class="rd-table-skeleton__cell"
                />
              </div>
              <div v-for="r in 5" :key="`pr-${r}`" class="rd-table-skeleton__row">
                <ElSkeletonItem
                  v-for="c in 4"
                  :key="`pr-${r}-${c}`"
                  variant="text"
                  class="rd-table-skeleton__cell"
                />
              </div>
            </template>
          </ElSkeleton>
        </div>
        <div v-else-if="isPlatformTableEmpty" class="rd-card-empty rd-card-empty--table">
          <ElEmpty description="暂无平台对比数据" :image-size="80" />
        </div>
        <table v-else class="rd-table">
          <thead>
            <tr>
              <th>广告平台</th>
              <th>预估($)</th>
              <th>真实($)</th>
              <th>偏差率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in platformTable?.rows ?? []" :key="row.s_source_label">
              <td>{{ row.s_source_label }}</td>
              <td>{{ formatUsd2(row.d_estimated_usd) }}</td>
              <td>{{ formatUsd2(row.d_real_usd) }}</td>
              <td :class="getDeviationClass(fmtPctSigned(row.d_deviation_rate_pct))">
                {{ fmtPctSigned(row.d_deviation_rate_pct) }}
              </td>
            </tr>
          </tbody>
          <tfoot v-if="platformTable?.total">
            <tr class="rd-table__total">
              <td>合计</td>
              <td>{{ formatUsd2(platformTable.total.d_estimated_usd) }}</td>
              <td>{{ formatUsd2(platformTable.total.d_real_usd) }}</td>
              <td
                :class="getDeviationClass(fmtPctSigned(platformTable.total.d_deviation_rate_pct))"
              >
                {{ fmtPctSigned(platformTable.total.d_deviation_rate_pct) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- 右侧模块（偏差原因分析 / 对账建议）已下线：
           - /api/v1/datacenter/analysis/business-insight/revenue-deviation/overview/reason
           - /api/v1/datacenter/analysis/business-insight/revenue-deviation/overview/advice
      -->
    </div>

    <!-- ========== Bottom Row ========== -->
    <div class="rd-bottom-grid rd-entry-4">
      <!-- 国家偏差分布 Top 10 -->
      <div class="rd-card rd-country-card">
        <div class="rd-card__header-row">
          <div class="rd-card__title">国家偏差分布 Top 10</div>
          <el-icon class="rd-icon-link"><TopRight /></el-icon>
        </div>
        <div class="rd-tab-group">
          <button
            v-for="tab in countryTabs"
            :key="tab.value"
            class="rd-tab-btn"
            :class="{ 'rd-tab-btn--active': activeCountryTab === tab.value }"
            @click="activeCountryTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
        <div v-if="loadingCountry" class="rd-chart-sk rd-chart-sk--tall"></div>
        <div v-else-if="isCountryChartEmpty" class="rd-card-empty rd-card-empty--country">
          <ElEmpty description="暂无国家分布数据" :image-size="90" />
        </div>
        <div v-else ref="countryChartRef" class="rd-country-chart"></div>
      </div>

      <!-- 偏差历史记录 -->
      <div class="rd-card rd-history-card">
        <div class="rd-card__title">偏差历史记录</div>
        <div v-if="loadingHistory" class="rd-table-skeleton rd-table-skeleton--dense">
          <ElSkeleton animated :throttle="0">
            <template #template>
              <div class="rd-table-skeleton__head">
                <ElSkeletonItem
                  v-for="h in 4"
                  :key="`hh-${h}`"
                  variant="text"
                  class="rd-table-skeleton__cell"
                />
              </div>
              <div v-for="r in 8" :key="`hr-${r}`" class="rd-table-skeleton__row">
                <ElSkeletonItem
                  v-for="c in 4"
                  :key="`hr-${r}-${c}`"
                  variant="text"
                  class="rd-table-skeleton__cell"
                />
              </div>
            </template>
          </ElSkeleton>
        </div>
        <div v-else-if="isHistoryEmpty" class="rd-card-empty rd-card-empty--table">
          <ElEmpty description="暂无历史记录" :image-size="80" />
        </div>
        <table v-else class="rd-table">
          <thead>
            <tr>
              <th>月份</th>
              <th>预估收入</th>
              <th>真实收入</th>
              <th>偏差率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in historyRows" :key="row.t_month">
              <td>{{ row.t_month }}</td>
              <td>{{ formatUsd2(row.d_estimated_usd) }}</td>
              <td>{{ formatUsd2(row.d_real_usd) }}</td>
              <td :class="getDeviationClass(fmtPctSigned(row.d_deviation_rate_pct))">
                {{ fmtPctSigned(row.d_deviation_rate_pct) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 四维度偏差明细分析表 -->
      <div class="rd-card rd-matrix-card">
        <div class="rd-card__header-row">
          <div>
            <div class="rd-card__title">四维度偏差明细分析表</div>
            <div class="rd-card__subtitle">应用 × 平台 × 日期 交叉分析，用于校正ROI计算</div>
          </div>
          <el-select
            v-model="matrixPlatform"
            class="rd-select rd-select--sm rd-select--matrix-platform"
            placeholder="平台: 全部"
          >
            <el-option
              v-for="item in sourceOptions"
              :key="`matrix-source-${item.value}-${item.label}`"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="rd-dim-row">
          <span class="rd-dim-label">行维度：</span>
          <span
            v-for="d in rowDimsUi"
            :key="d.value"
            class="rd-dim-chip"
            :class="{
              'rd-dim-chip--active': activeRowDim === d.value,
              'rd-dim-chip--disabled': d.disabled
            }"
            @click="onRowDimClick(d.value)"
            >{{ d.label }}</span
          >
          <span class="rd-dim-label" style="margin-left: 16px">列维度：</span>
          <span
            v-for="d in colDimsUi"
            :key="d.value"
            class="rd-dim-chip"
            :class="{
              'rd-dim-chip--active': activeColDim === d.value,
              'rd-dim-chip--disabled': d.disabled
            }"
            @click="onColDimClick(d.value)"
            >{{ d.label }}</span
          >
        </div>
        <div class="rd-matrix-scroll" :class="{ 'rd-matrix-scroll--busy': matrixLoading }">
          <div v-if="matrixLoading" class="rd-matrix-skeleton">
            <ElSkeleton animated :throttle="0">
              <template #template>
                <div class="rd-matrix-skeleton__head">
                  <ElSkeletonItem
                    variant="text"
                    class="rd-matrix-skeleton__cell rd-matrix-skeleton__cell--app"
                  />
                  <ElSkeletonItem
                    v-for="c in 4"
                    :key="`msh-${c}`"
                    variant="text"
                    class="rd-matrix-skeleton__cell"
                  />
                </div>
                <div v-for="r in 6" :key="`msr-${r}`" class="rd-matrix-skeleton__row">
                  <ElSkeletonItem
                    variant="text"
                    class="rd-matrix-skeleton__cell rd-matrix-skeleton__cell--app"
                  />
                  <ElSkeletonItem
                    v-for="c in 4"
                    :key="`msr-${r}-${c}`"
                    variant="text"
                    class="rd-matrix-skeleton__cell"
                  />
                </div>
              </template>
            </ElSkeleton>
          </div>
          <div v-else-if="isMatrixEmpty" class="rd-card-empty rd-card-empty--matrix">
            <ElEmpty description="暂无明细数据" :image-size="80" />
          </div>
          <div v-else class="rd-matrix-table-inner">
            <table class="rd-table rd-matrix-table">
              <thead>
                <tr>
                  <th>{{ matrixFirstColLabel }}</th>
                  <th v-for="col in matrixCols" :key="col.name" colspan="1">
                    <div class="rd-matrix-col-head">
                      <span>{{ col.name }}</span>
                      <span class="rd-matrix-col-sub">预估/真实/偏差率</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in matrixData" :key="row.rowKey">
                  <td class="rd-matrix-app">
                    <span class="rd-app-icon" :style="{ background: row.iconColor }">{{
                      row.icon
                    }}</span>
                    {{ row.app }}
                  </td>
                  <td
                    v-for="col in matrixCols"
                    :key="col.name"
                    class="rd-matrix-cell"
                    :class="getMatrixClass(matrixCell(row, col.key)?.deviation ?? '')"
                  >
                    <template v-if="matrixCell(row, col.key)">
                      <span class="rd-matrix-est">{{ matrixCell(row, col.key)?.estimated }}</span>
                      <span class="rd-matrix-real">/{{ matrixCell(row, col.key)?.real }}</span>
                      <span
                        class="rd-matrix-dev"
                        :class="getDeviationClass(matrixCell(row, col.key)?.deviation ?? '')"
                      >
                        /{{ matrixCell(row, col.key)?.deviation }}
                      </span>
                    </template>
                  </td>
                </tr>
                <!-- 合计行 -->
                <tr class="rd-table__total">
                  <td>合计</td>
                  <td v-for="col in matrixCols" :key="col.name" class="rd-matrix-cell">
                    <span class="rd-matrix-est">{{ col.total.estimated }}</span>
                    <span class="rd-matrix-real">/{{ col.total.real }}</span>
                    <span
                      class="rd-matrix-dev"
                      :class="getDeviationClass(col.total.deviation ?? '')"
                    >
                      /{{ col.total.deviation }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="rd-matrix-note">
          说明：预估收入通过客户端埋点展示广告事件计算，真实收入来源于广告平台对账数据，偏差率可用于校正各维度ROI计算。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    ref,
    computed,
    onMounted,
    onUnmounted,
    watch,
    nextTick,
    onActivated,
    onDeactivated
  } from 'vue'
  import { TopRight } from '@element-plus/icons-vue'
  import * as echarts from 'echarts'
  import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
  import {
    fetchRevenueDeviationMetaFilterOptions,
    fetchRevenueDeviationOverviewCountryTop10,
    fetchRevenueDeviationOverviewKpis,
    fetchRevenueDeviationOverviewTrend,
    fetchRevenueDeviationTableHistory,
    fetchRevenueDeviationTableMatrix,
    fetchRevenueDeviationTablePlatform
  } from '@/api/revenue-deviation'
  import type {
    RevenueDeviationCountryTop10,
    RevenueDeviationFilterOption,
    RevenueDeviationHistoryRow,
    RevenueDeviationMatrixRow as RdmRow,
    RevenueDeviationOverviewKpis,
    RevenueDeviationOverviewTrend,
    RevenueDeviationPlatformTable,
    RevenueDeviationMatrixColDim,
    RevenueDeviationMatrixRowDim,
    RevenueDeviationQuery
  } from '@/views/business-insight/revenue-deviation/types'

  defineOptions({ name: 'RevenueDeviation' })

  interface MatrixCell {
    estimated: string
    real: string
    deviation: string
  }

  type MatrixRow = {
    /** 展示名重复时仍保证列表 key 唯一 */
    rowKey: string
    app: string
    icon: string
    iconColor: string
    cells: Record<string, MatrixCell | undefined>
  }

  interface MatrixColDef {
    name: string
    key: string
    total: MatrixCell
  }

  function matrixCell(row: MatrixRow, key: string): MatrixCell | undefined {
    return row.cells[key]
  }

  function isMatrixCell(v: unknown): v is MatrixCell {
    if (v === null || typeof v !== 'object') return false
    const o = v as Record<string, unknown>
    return (
      typeof o.estimated === 'string' &&
      typeof o.real === 'string' &&
      typeof o.deviation === 'string'
    )
  }

  function toMatrixVmRows(rows: RdmRow[], colKeys: string[]): MatrixRow[] {
    return rows.map((r, idx) => {
      const raw = r as Record<string, unknown>
      const cells: Record<string, MatrixCell | undefined> = {}
      for (const k of colKeys) {
        const v = raw[k]
        cells[k] = isMatrixCell(v) ? v : undefined
      }
      return {
        rowKey: `${String(r.s_app_name)}-${idx}`,
        app: r.s_app_name,
        icon: r.s_app_icon_emoji,
        iconColor: r.s_icon_color,
        cells
      }
    })
  }

  const ALL_SOURCE_VALUE = '__ALL_SOURCE__'
  const ALL_APP_VALUE = '__ALL_APP__'

  function toSelectOptions(
    options: RevenueDeviationFilterOption[],
    allLabel: string,
    allValue: string
  ): RevenueDeviationFilterOption[] {
    const normalized = options.map((item) => ({
      label: item.label,
      value: item.value === '' ? allValue : item.value
    }))
    if (!normalized.some((item) => item.value === allValue)) {
      return [{ label: allLabel, value: allValue }, ...normalized]
    }
    return normalized
  }

  function getDefaultDateRange(): [string, string] {
    const end = getAppNow()
    const start = cloneAppDate(end)
    start.setMonth(start.getMonth() - 1)
    return [formatYYYYMMDD(start), formatYYYYMMDD(end)]
  }

  // ── State ────────────────────────────────────────────────────────────────────
  const dateRange = ref<[string, string]>(getDefaultDateRange())
  const platform = ref(ALL_SOURCE_VALUE)
  const appFilter = ref(ALL_APP_VALUE)
  const sourceOptions = ref<RevenueDeviationFilterOption[]>([
    { value: ALL_SOURCE_VALUE, label: '全部广告平台' }
  ])
  const appOptions = ref<RevenueDeviationFilterOption[]>([
    { value: ALL_APP_VALUE, label: '全部应用' }
  ])
  const activeCountryTab = ref('amount')
  const matrixPlatform = ref(ALL_SOURCE_VALUE)

  const matrixLoading = ref(true)
  const matrixRequestId = ref(0)

  const kpiOverview = ref<RevenueDeviationOverviewKpis | null>(null)
  const trendData = ref<RevenueDeviationOverviewTrend | null>(null)
  const platformTable = ref<RevenueDeviationPlatformTable | null>(null)
  const countryTop10 = ref<RevenueDeviationCountryTop10 | null>(null)
  const historyRows = ref<RevenueDeviationHistoryRow[]>([])
  const matrixCols = ref<MatrixColDef[]>([])
  const matrixData = ref<MatrixRow[]>([])

  const countryTabs = [
    { label: '偏差金额', value: 'amount' },
    { label: '偏差率', value: 'rate' }
  ]

  const rowDims: { label: string; value: RevenueDeviationMatrixRowDim }[] = [
    { label: '应用', value: 'app' },
    { label: '平台', value: 'platform' },
    { label: '日期', value: 'date' }
  ]
  const colDims: { label: string; value: RevenueDeviationMatrixColDim }[] = [
    { label: '平台', value: 'platform' },
    { label: '日期', value: 'date' }
  ]

  const activeRowDim = ref<RevenueDeviationMatrixRowDim>('app')
  const activeColDim = ref<RevenueDeviationMatrixColDim>('platform')

  const MATRIX_DATE_DIM = 'date' as const

  const rowDimsUi = computed(() =>
    rowDims.map((d) => ({
      ...d,
      disabled: d.value === MATRIX_DATE_DIM && activeColDim.value === MATRIX_DATE_DIM
    }))
  )

  const colDimsUi = computed(() =>
    colDims.map((d) => ({
      ...d,
      disabled: d.value === MATRIX_DATE_DIM && activeRowDim.value === MATRIX_DATE_DIM
    }))
  )

  function fallbackColDim(): RevenueDeviationMatrixColDim {
    return colDims.find((d) => d.value !== MATRIX_DATE_DIM)?.value ?? 'platform'
  }

  function onRowDimClick(v: RevenueDeviationMatrixRowDim) {
    if (v === MATRIX_DATE_DIM && activeColDim.value === MATRIX_DATE_DIM) return
    activeRowDim.value = v
  }

  function onColDimClick(v: RevenueDeviationMatrixColDim) {
    if (v === MATRIX_DATE_DIM && activeRowDim.value === MATRIX_DATE_DIM) return
    activeColDim.value = v
  }

  watch(
    [activeRowDim, activeColDim],
    ([r, c]) => {
      if (r === MATRIX_DATE_DIM && c === MATRIX_DATE_DIM) {
        activeColDim.value = fallbackColDim()
      }
    },
    { flush: 'sync' }
  )

  const matrixFirstColLabel = computed(() => {
    const map: Record<RevenueDeviationMatrixRowDim, string> = {
      app: '应用',
      platform: '广告平台',
      date: '日期'
    }
    return map[activeRowDim.value]
  })

  const loadingKpi = ref(false)
  const loadingTrend = ref(false)
  const loadingPlatformTable = ref(false)
  const loadingCountry = ref(false)
  const loadingHistory = ref(false)
  const querying = ref(false)

  const isTrendEmpty = computed(() => {
    const t = trendData.value
    if (!t) return true
    return !(t.t_day_labels && t.t_day_labels.length > 0)
  })

  const isPlatformTableEmpty = computed(() => {
    const rows = platformTable.value?.rows
    return !(rows && rows.length > 0)
  })

  const isCountryChartEmpty = computed(() => {
    const top = countryTop10.value
    if (!top) return true
    const list = activeCountryTab.value === 'amount' ? top.tab_amount : top.tab_rate
    return !(list && list.length > 0)
  })

  const isHistoryEmpty = computed(() => historyRows.value.length === 0)

  const isMatrixEmpty = computed(
    () => matrixCols.value.length === 0 || matrixData.value.length === 0
  )

  async function loadMetaFilterOptions() {
    try {
      const options = await fetchRevenueDeviationMetaFilterOptions()
      sourceOptions.value = toSelectOptions(options.sources, '全部广告平台', ALL_SOURCE_VALUE)
      appOptions.value = toSelectOptions(options.apps, '全部应用', ALL_APP_VALUE)
    } catch {
      sourceOptions.value = [{ value: ALL_SOURCE_VALUE, label: '全部广告平台' }]
      appOptions.value = [{ value: ALL_APP_VALUE, label: '全部应用' }]
    }
  }

  function buildGlobalQuery(): RevenueDeviationQuery {
    return {
      t_start_date: dateRange.value[0]!,
      t_end_date: dateRange.value[1]!,
      source: platform.value === ALL_SOURCE_VALUE ? '' : platform.value,
      s_app_id: appFilter.value === ALL_APP_VALUE ? '' : appFilter.value,
      row_dim: activeRowDim.value,
      col_dim: activeColDim.value
    }
  }

  function buildMatrixQuery(): RevenueDeviationQuery {
    const global = buildGlobalQuery()
    return {
      ...global,
      source: matrixPlatform.value === ALL_SOURCE_VALUE ? '' : matrixPlatform.value
    }
  }

  function cssVar(name: string) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    return v || name
  }

  async function loadMatrixOnly() {
    const id = ++matrixRequestId.value
    matrixLoading.value = true
    try {
      const q = buildMatrixQuery()
      const matrix = await fetchRevenueDeviationTableMatrix(q)
      if (id !== matrixRequestId.value) return
      matrixCols.value = matrix.cols.map((c) => ({
        name: c.name,
        key: c.key,
        total: c.total
      }))
      matrixData.value = toMatrixVmRows(
        matrix.rows,
        matrix.cols.map((c) => c.key)
      )
    } catch {
      if (id !== matrixRequestId.value) return
      matrixCols.value = []
      matrixData.value = []
    } finally {
      if (id === matrixRequestId.value) {
        matrixLoading.value = false
      }
    }
  }

  function safeTask<T>(fn: () => Promise<T>) {
    return Promise.resolve().then(fn)
  }

  async function loadAllCards() {
    const q = buildGlobalQuery()
    loadingKpi.value = true
    loadingTrend.value = true
    loadingPlatformTable.value = true
    loadingCountry.value = true
    loadingHistory.value = true
    try {
      const [kpi, trend, plat, country, hist] = await Promise.allSettled([
        safeTask(() => fetchRevenueDeviationOverviewKpis(q)),
        safeTask(() => fetchRevenueDeviationOverviewTrend(q)),
        safeTask(() => fetchRevenueDeviationTablePlatform(q)),
        safeTask(() => fetchRevenueDeviationOverviewCountryTop10(q)),
        safeTask(() => fetchRevenueDeviationTableHistory(q))
      ])

      if (kpi.status === 'fulfilled') kpiOverview.value = kpi.value
      if (trend.status === 'fulfilled') trendData.value = trend.value
      if (plat.status === 'fulfilled') platformTable.value = plat.value
      if (country.status === 'fulfilled') countryTop10.value = country.value
      if (hist.status === 'fulfilled') historyRows.value = hist.value
    } finally {
      loadingKpi.value = false
      loadingTrend.value = false
      loadingPlatformTable.value = false
      loadingCountry.value = false
      loadingHistory.value = false
    }
  }

  async function handleQuery() {
    if (querying.value) return
    querying.value = true
    try {
      await loadAllCards()
      await loadMatrixOnly()
    } finally {
      querying.value = false
    }
  }

  function formatUsd2(n?: number | null) {
    if (n === null || n === undefined || Number.isNaN(n)) return '--'
    return n.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  function fmtUsdWithSign(n?: number | null) {
    if (n === null || n === undefined || Number.isNaN(n)) return '--'
    const base = Math.abs(n).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    if (n > 0) return `+${base}`
    if (n < 0) return `-${base}`
    return base
  }

  function fmtPctSigned(n?: number | null) {
    if (n === null || n === undefined || Number.isNaN(n)) return '--'
    if (n === 0) return '0.0%'
    if (n > 0) return `+${n.toFixed(1)}%`
    return `${n.toFixed(1)}%`
  }

  function fmtRoiPp(n?: number | null) {
    if (n === null || n === undefined || Number.isNaN(n)) return '--'
    return `${n.toFixed(1)}pp`
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  /** 接口可能返回 en dash（8–15）或 ASCII 连字符（8-15），分类时统一比较 */
  function normalizeDeviationBracket(val: string) {
    return val.replace(/\u2013|\u2014/g, '-')
  }

  function getDeviationClass(val: string) {
    if (!val) return ''
    if (val.startsWith('+')) return 'rd-text--red'
    if (val.startsWith('-')) return 'rd-text--green'
    const n = normalizeDeviationBracket(val)
    if (n.includes('>15')) return 'rd-text--red'
    if (n.includes('8-15')) return 'rd-text--orange'
    return 'rd-text--muted'
  }

  function getMatrixClass(deviation: string) {
    if (!deviation) return ''
    const n = normalizeDeviationBracket(deviation)
    if (n.includes('>15')) return 'rd-matrix-cell--red'
    if (n.includes('8-15')) return 'rd-matrix-cell--orange'
    return ''
  }

  // ── Charts ────────────────────────────────────────────────────────────────────
  const trendChartRef = ref<HTMLElement | null>(null)
  const countryChartRef = ref<HTMLElement | null>(null)

  let trendChart: echarts.ECharts | null = null
  let countryChart: echarts.ECharts | null = null
  let chartResizeObserver: ResizeObserver | null = null
  let windowResizeBound = false

  function bindWindowResize() {
    if (windowResizeBound) return
    window.addEventListener('resize', resizeHandler)
    windowResizeBound = true
  }

  function unbindWindowResize() {
    if (!windowResizeBound) return
    window.removeEventListener('resize', resizeHandler)
    windowResizeBound = false
  }

  function setupChartResizeObserver() {
    chartResizeObserver?.disconnect()
    chartResizeObserver = null

    if (typeof ResizeObserver === 'undefined') return
    chartResizeObserver = new ResizeObserver(() => {
      resizeHandler()
    })

    if (trendChartRef.value) chartResizeObserver.observe(trendChartRef.value)
    if (countryChartRef.value) chartResizeObserver.observe(countryChartRef.value)
  }

  async function ensureChartsVisibleAndRendered() {
    await nextTick()
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve())
    })

    const trendDom = trendChartRef.value
    const countryDom = countryChartRef.value

    if (trendDom) {
      const instanceInDom = echarts.getInstanceByDom(trendDom)
      if (!trendChart || (instanceInDom && instanceInDom !== trendChart)) {
        trendChart = instanceInDom ?? null
      }
      if (!trendChart) initTrendChart()
    }

    if (countryDom) {
      const instanceInDom = echarts.getInstanceByDom(countryDom)
      if (!countryChart || (instanceInDom && instanceInDom !== countryChart)) {
        countryChart = instanceInDom ?? null
      }
      if (!countryChart) initCountryChart()
    }

    resizeHandler()
  }

  function initTrendChart() {
    if (!trendChartRef.value || !trendData.value) return
    trendChart?.dispose()
    trendChart = echarts.init(trendChartRef.value, 'dark')

    const ttBg = cssVar('--default-box-color')
    const ttBorder = cssVar('--default-border')
    const ttText = cssVar('--text-primary')
    const axisText = cssVar('--text-tertiary')
    const axisLine = cssVar('--default-border')
    const seriesEstimated = cssVar('--art-success')
    const seriesReal = cssVar('--art-primary')
    const days = trendData.value.t_day_labels
    const estimated = trendData.value.n_estimated_series
    const real = trendData.value.n_real_series

    trendChart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 30, right: 10, bottom: 50, left: 50 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: ttBg,
        borderColor: ttBorder,
        textStyle: { color: ttText, fontSize: 12 }
      },
      xAxis: {
        type: 'category',
        data: days,
        axisLine: { lineStyle: { color: axisLine } },
        axisLabel: { color: axisText, fontSize: 11 },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: axisText, fontSize: 11 },
        splitLine: {
          lineStyle: { color: cssVar('--default-border'), type: 'dashed' }
        }
      },
      series: [
        {
          name: '预估收入',
          type: 'line',
          data: estimated,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: seriesEstimated, width: 2, type: 'dashed' },
          itemStyle: { color: seriesEstimated }
        },
        {
          name: '真实收入',
          type: 'line',
          data: real,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: seriesReal, width: 2 },
          itemStyle: { color: seriesReal },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59,130,246,0.18)' },
              { offset: 1, color: 'rgba(59,130,246,0.02)' }
            ])
          }
        },
        {
          name: '偏差区域',
          type: 'line',
          data: estimated.map((e, i) => e - real[i]),
          smooth: true,
          symbol: 'none',
          lineStyle: { opacity: 0 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(249,115,22,0.30)' },
              { offset: 1, color: 'rgba(249,115,22,0.05)' }
            ])
          }
        }
      ]
    })
    trendChart.resize()
  }

  function initCountryChart() {
    if (!countryChartRef.value || !countryTop10.value) return
    countryChart?.dispose()
    countryChart = echarts.init(countryChartRef.value, 'dark')
    const ttBg = cssVar('--default-box-color')
    const ttBorder = cssVar('--default-border')
    const ttText = cssVar('--text-primary')
    const axisText = cssVar('--text-secondary')
    const barColor = cssVar('--art-warning')
    const list =
      activeCountryTab.value === 'amount'
        ? countryTop10.value.tab_amount
        : countryTop10.value.tab_rate
    const countries = list.map((i) => i.label_display)
    const amounts = list.map((i) => i.n_value)
    countryChart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 5, right: 20, bottom: 5, left: 60 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'none' },
        backgroundColor: ttBg,
        borderColor: ttBorder,
        textStyle: { color: ttText, fontSize: 12 }
      },
      xAxis: {
        type: 'value',
        axisLabel: { show: false },
        splitLine: { show: false },
        axisLine: { show: false }
      },
      yAxis: {
        type: 'category',
        data: countries,
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: axisText, fontSize: 12 }
      },
      series: [
        {
          type: 'bar',
          data: amounts,
          barMaxWidth: 14,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: barColor },
              { offset: 1, color: 'rgba(249,115,22,0.16)' }
            ]),
            borderRadius: [0, 4, 4, 0]
          }
        }
      ]
    })
    countryChart.resize()
  }

  const resizeHandler = () => {
    trendChart?.resize()
    countryChart?.resize()
  }

  onMounted(async () => {
    await loadMetaFilterOptions()
    matrixPlatform.value = platform.value
    await loadAllCards()
    await loadMatrixOnly()
    await ensureChartsVisibleAndRendered()
    setupChartResizeObserver()
    bindWindowResize()
  })

  onUnmounted(() => {
    unbindWindowResize()
    chartResizeObserver?.disconnect()
    chartResizeObserver = null
    trendChart?.dispose()
    countryChart?.dispose()
  })

  onActivated(async () => {
    setupChartResizeObserver()
    bindWindowResize()
    await ensureChartsVisibleAndRendered()
  })

  onDeactivated(() => {
    unbindWindowResize()
    chartResizeObserver?.disconnect()
    chartResizeObserver = null
  })

  watch(activeCountryTab, () => {
    countryChart?.dispose()
    countryChart = null
    initCountryChart()
  })

  watch(trendData, async (val) => {
    if (!val) return
    await nextTick()
    initTrendChart()
  })

  watch(countryTop10, async (val) => {
    if (!val) return
    await nextTick()
    initCountryChart()
  })

  /** 四维度偏差明细表：平台 / 行维 / 列维 切换单独拉矩阵接口，不依赖顶部「查询」 */
  watch([matrixPlatform, activeRowDim, activeColDim], async () => {
    await loadMatrixOnly()
  })
</script>

<style scoped lang="scss">
  @use './styles/rd-card-fx.scss' as *;

  /* ── 页面背景分层（对齐 ad-performance 高对比风格；使用项目 token） ───────── */
  .revenue-deviation {
    position: relative;
    min-width: 0;
    padding: 20px 24px;
    overflow: hidden;
    font-size: 13px;
    color: var(--text-primary);
    background: var(--default-bg-color);
  }

  .revenue-deviation::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(
        ellipse 70% 50% at 8% 6%,
        color-mix(in srgb, var(--art-success) 42%, transparent) 0%,
        color-mix(in srgb, var(--art-primary) 18%, transparent) 38%,
        transparent 58%
      ),
      radial-gradient(
        ellipse 55% 42% at 94% 8%,
        color-mix(in srgb, var(--art-primary) 38%, transparent) 0%,
        color-mix(in srgb, var(--art-warning) 14%, transparent) 38%,
        transparent 58%
      ),
      radial-gradient(
        ellipse 40% 35% at 48% 18%,
        color-mix(in srgb, var(--art-primary) 14%, transparent) 0%,
        transparent 55%
      );
    mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 58%);
    animation:
      rd-aurora-drift 14s var(--ease-out) infinite alternate,
      rd-bg-flow 22s var(--ease-out) infinite alternate;
  }

  .revenue-deviation::after {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background-image:
      linear-gradient(color-mix(in srgb, var(--art-primary) 8%, transparent) 1px, transparent 1px),
      linear-gradient(
        90deg,
        color-mix(in srgb, var(--art-primary) 8%, transparent) 1px,
        transparent 1px
      ),
      radial-gradient(
        circle,
        color-mix(in srgb, var(--art-success) 10%, transparent) 1px,
        transparent 1px
      );
    background-size:
      40px 40px,
      40px 40px,
      80px 80px;
    mask-image: linear-gradient(to bottom, black 0%, black 18%, transparent 45%);
  }

  .revenue-deviation > *:not(.rd-page-fx) {
    position: relative;
    z-index: 1;
  }

  .rd-page-fx {
    position: absolute;
    inset: -12% -12% 40%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      color-mix(in srgb, var(--art-primary) 14%, transparent) 55deg,
      color-mix(in srgb, var(--art-success) 10%, transparent) 80deg,
      transparent 130deg,
      color-mix(in srgb, var(--art-warning) 12%, transparent) 200deg,
      transparent 285deg,
      color-mix(in srgb, var(--art-danger) 10%, transparent) 330deg,
      transparent 360deg
    );
    opacity: 0.85;
    mask-image: linear-gradient(to bottom, black 0%, black 50%, transparent 85%);
    animation: rd-fx-spin 52s linear infinite;
    will-change: transform;
  }

  @keyframes rd-aurora-drift {
    0% {
      opacity: 0.72;
      transform: scale(1) translate(0, 0);
    }

    50% {
      opacity: 1;
      transform: scale(1.06) translate(1.2%, -1.2%);
    }

    100% {
      opacity: 0.82;
      transform: scale(1) translate(-1.2%, 1.2%);
    }
  }

  @keyframes rd-bg-flow {
    0% {
      opacity: 0.7;
      transform: scaleY(1) skewX(0deg);
    }

    100% {
      opacity: 1;
      transform: scaleY(1.08) skewX(1deg);
    }
  }

  @keyframes rd-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .rd-entry-1 {
    animation: rd-slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.05s;
  }

  .rd-entry-2 {
    animation: rd-slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.14s;
  }

  .rd-entry-3 {
    animation: rd-slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.22s;
  }

  .rd-entry-4 {
    animation: rd-slide-up 0.55s var(--ease-out) both;
    animation-delay: 0.3s;
  }

  @keyframes rd-slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ── Header ────────────────────────────────────────────────────────── */
  .rd-header {
    //display: flex;
    // align-items: center;
    // justify-content: space-between;
    margin-bottom: 20px;
  }

  .rd-page-title {
    @include rd-title-gradient;

    font-size: 18px;
  }

  .rd-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    justify-content: start;
    min-width: 0;
    padding: 14px 16px;
    background: color-mix(in srgb, var(--default-bg-color) 82%, transparent);
    backdrop-filter: blur(12px);
    border: 1px solid color-mix(in srgb, var(--art-primary) 18%, transparent);
    border-radius: 16px;
    box-shadow:
      0 8px 32px color-mix(in srgb, black 40%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--text-primary) 8%, transparent),
      0 0 40px color-mix(in srgb, var(--art-primary) 8%, transparent);
  }

  .rd-filter-date {
    max-width: 260px;
  }

  :deep(.rd-filter-date.el-date-editor.el-range-editor) {
    max-width: 260px !important;
  }

  .rd-filter-select {
    width: 134px;
    min-width: 120px;
    max-width: 100%;
  }

  .rd-select--sm {
    width: 140px;
  }

  .rd-select--matrix-platform {
    width: 168px;
    max-width: 100%;
  }

  :deep(.rd-filter-date .el-input__wrapper),
  :deep(.rd-filter-select .el-input__wrapper) {
    background: color-mix(in srgb, var(--art-primary) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-primary) 24%, transparent);
    border-radius: 9999px;
    box-shadow: none;
    transition:
      border-color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      background-color var(--duration-normal) var(--ease-out);
  }

  :deep(.rd-filter-date .el-input__wrapper:hover),
  :deep(.rd-filter-select .el-input__wrapper:hover) {
    border-color: color-mix(in srgb, var(--art-primary) 42%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--art-primary) 16%, transparent);
  }

  :deep(.rd-filter-date .el-input__wrapper.is-focus),
  :deep(.rd-filter-select .el-input__wrapper.is-focus) {
    background: color-mix(in srgb, var(--art-primary) 10%, transparent) !important;
    border-color: color-mix(in srgb, var(--art-primary) 55%, transparent) !important;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--art-primary) 18%, transparent) !important;
  }

  :deep(.rd-filter-date .el-input__inner),
  :deep(.rd-filter-select .el-input__inner) {
    font-size: 14px;
    color: var(--text-primary);
  }

  .rd-filter-action {
    height: 40px !important;
    padding: 0 14px !important;
    font-weight: 600;
    border-radius: 9999px !important;
    transition:
      transform var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      border-color var(--duration-normal) var(--ease-out);
  }

  .rd-filter-action--apply {
    --rd-btn-bg: color-mix(in srgb, var(--el-color-primary) 78%, var(--default-box-color));
    --rd-btn-bg-hover: color-mix(in srgb, var(--el-color-primary) 88%, var(--default-box-color));
    --rd-btn-border: color-mix(in srgb, var(--el-color-primary) 70%, transparent);
    --rd-btn-border-hover: color-mix(in srgb, var(--el-color-primary) 86%, transparent);
    --el-button-bg-color: var(--rd-btn-bg);
    --el-button-border-color: var(--rd-btn-border);
    --el-button-hover-bg-color: var(--rd-btn-bg-hover);
    --el-button-hover-border-color: var(--rd-btn-border-hover);
    --el-button-active-bg-color: color-mix(
      in srgb,
      var(--el-color-primary) 94%,
      var(--default-box-color)
    );
    --el-button-active-border-color: color-mix(in srgb, var(--el-color-primary) 92%, transparent);

    color: var(--el-color-white) !important;
    box-shadow:
      0 0 18px color-mix(in srgb, var(--el-color-primary) 18%, transparent),
      0 0 42px color-mix(in srgb, var(--el-color-primary) 10%, transparent);
  }

  .rd-filter-action--apply:hover {
    box-shadow:
      0 0 22px color-mix(in srgb, var(--el-color-primary) 22%, transparent),
      0 0 50px color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    transform: translateY(-2px);
  }

  .rd-filter-action--apply:active {
    transform: translateY(0);
  }

  .rd-filter-action--apply:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 var(--focus-ring-width) color-mix(in srgb, var(--focus-ring-color) 38%, transparent),
      0 0 18px color-mix(in srgb, var(--el-color-primary) 18%, transparent),
      0 0 42px color-mix(in srgb, var(--el-color-primary) 10%, transparent);
  }

  .rd-filter-action--apply.is-disabled,
  .rd-filter-action--apply.is-disabled:hover,
  .rd-filter-action--apply.is-disabled:active {
    box-shadow: none;
    transform: none;
  }

  /* ── KPI Grid ──────────────────────────────────────────────────────── */
  .rd-kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(168px, 100%), 1fr));
    gap: 14px;
    margin-bottom: 16px;
  }

  @media (width >= 1600px) {
    .rd-kpi-grid {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  .rd-kpi-card {
    --rd-accent: var(--art-primary);

    position: relative;
    min-width: 0;
    padding: 18px 20px;
    overflow: hidden;
    border-radius: 10px;

    @include rd-neon-bg(var(--rd-accent));
    @include rd-card-mesh;
    @include rd-panel-hover(var(--rd-accent));
  }

  .rd-kpi-card--sk {
    min-height: 108px;
  }

  .rd-kpi-card::before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 3px;
    content: '';
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--rd-accent) 85%, transparent) 30%,
      color-mix(in srgb, var(--rd-accent) 55%, transparent) 70%,
      transparent 100%
    );
    border-radius: 10px 10px 0 0;
  }

  .rd-kpi-card--green::before {
    --rd-accent: var(--art-success);
  }

  .rd-kpi-card--gold::before {
    --rd-accent: var(--art-warning);
  }

  .rd-kpi-card--red::before {
    --rd-accent: var(--art-danger);
  }

  .rd-kpi-card--blue::before {
    --rd-accent: var(--art-primary);
  }

  .rd-kpi-card__header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2px;
  }

  .rd-kpi-card__label {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .rd-kpi-card__value {
    margin-bottom: 6px;
    font-size: clamp(1.125rem, 2.6vw + 0.6rem, 1.75rem);
    font-weight: 700;
    text-shadow: 0 0 18px color-mix(in srgb, var(--rd-accent) 18%, transparent);
    letter-spacing: -0.5px;
    word-break: break-word;
  }

  .rd-kpi-card__value--green {
    color: var(--art-success);
  }

  .rd-kpi-card__value--gold {
    color: var(--art-warning);
  }

  .rd-kpi-card__value--red {
    color: var(--art-danger);
  }

  .rd-kpi-card__value--blue {
    color: var(--art-primary);
  }

  .rd-kpi-card__sub {
    font-size: 11px;
    line-height: 1.4;
    color: var(--text-tertiary);
    word-break: break-word;
  }

  /* ── Badge ─────────────────────────────────────────────────────────── */
  .rd-badge {
    padding: 2px 7px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 4px;
  }

  .rd-badge--red {
    color: var(--art-danger);
    background: color-mix(in srgb, var(--art-danger) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-danger) 22%, transparent);
  }

  /* ── Middle Grid ───────────────────────────────────────────────────── */
  .rd-middle-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 320px) minmax(240px, 280px);
    gap: 14px;
    align-items: stretch;
    margin-bottom: 16px;
  }

  .rd-platform-card {
    grid-column: 2 / -1;
    min-width: 0;
  }

  @media (width <= 1199px) {
    .rd-middle-grid {
      grid-template-columns: 1fr;
    }

    .rd-platform-card {
      grid-column: auto;
    }
  }

  .rd-right-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 0;
  }

  /* 第二行三列统一高度，右侧两卡等分 */
  .rd-trend-card,
  .rd-platform-card,
  .rd-right-col {
    height: 100%;
    min-height: 0;
  }

  .rd-reason-card,
  .rd-advice-card {
    flex: 1;
    min-height: 0;
  }

  .rd-trend-card,
  .rd-reason-card,
  .rd-country-card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  /* ── Card Base ─────────────────────────────────────────────────────── */
  .rd-card {
    --rd-panel-accent: var(--art-primary);

    position: relative;
    padding: 16px 18px;
    overflow: hidden;
    border: 1px solid transparent;
    border-radius: 10px;

    @include rd-neon-bg(var(--rd-panel-accent));
    @include rd-card-mesh;
    @include rd-panel-hover(var(--rd-panel-accent));
  }

  .rd-card__title {
    @include rd-card-title-hover(&, var(--art-primary));

    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  /* 关键标题做渐变强调（对齐 ad-performance） */
  .rd-trend-card .rd-card__title,
  .rd-platform-card .rd-card__title,
  .rd-reason-card .rd-card__title,
  .rd-advice-card .rd-card__title,
  .rd-country-card .rd-card__title,
  .rd-history-card .rd-card__title,
  .rd-matrix-card .rd-card__title {
    @include rd-title-gradient;

    font-size: 15px;
  }

  .rd-card__title--gold {
    color: var(--art-warning);
  }

  .rd-card__subtitle {
    margin-top: 2px;
    font-size: 11px;
    color: var(--text-tertiary);
  }

  .rd-card__header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .rd-icon-link {
    font-size: 14px;
    color: var(--text-tertiary);
    cursor: pointer;
  }

  /* ── Trend Chart ───────────────────────────────────────────────────── */
  .rd-trend-chart {
    position: relative;
    z-index: 1;
    flex: 1;
    min-height: 160px;
  }

  .rd-trend-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    justify-content: center;
    margin-top: 8px;
  }

  .rd-legend-item {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11px;
    color: var(--text-secondary);
  }

  .rd-legend-item::before {
    display: inline-block;
    width: 20px;
    height: 2px;
    content: '';
    border-radius: 1px;
  }

  .rd-legend-item--green::before {
    height: 0;
    background: var(--art-success);
    border-top: 2px dashed var(--art-success);
  }

  .rd-legend-item--teal::before {
    background: var(--art-primary);
  }

  .rd-legend-item--orange::before {
    height: 8px;
    background: var(--art-warning);
    border-radius: 2px;
    opacity: 0.6;
  }

  /* ── Table ─────────────────────────────────────────────────────────── */
  .rd-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .rd-table th {
    padding: 6px 8px;
    font-weight: 500;
    color: var(--text-tertiary);
    text-align: left;
    border-bottom: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
  }

  .rd-table td {
    padding: 8px;
    color: var(--text-secondary);
    border-bottom: 1px solid color-mix(in srgb, var(--art-primary) 10%, transparent);
  }

  .rd-table tr:last-child td {
    border-bottom: none;
  }

  .rd-table tr:hover td {
    background: color-mix(in srgb, var(--art-primary) 6%, transparent);
  }

  .rd-matrix-table tbody tr:hover td:first-child {
    background: color-mix(in srgb, var(--art-primary) 6%, var(--default-box-color));
  }

  .rd-table__total td {
    font-weight: 600;
    color: var(--text-primary) !important;
    border-top: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
    border-bottom: none;
  }

  /* ── 表格骨架（平台对比 / 历史记录）────────────────────────────────── */
  .rd-table-skeleton {
    padding: 4px 0 2px;
  }

  .rd-table-skeleton__head,
  .rd-table-skeleton__row {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.9fr);
    gap: 10px;
    align-items: center;
    margin-bottom: 12px;
  }

  .rd-table-skeleton__head {
    padding-bottom: 8px;
    margin-bottom: 14px;
    border-bottom: 1px solid color-mix(in srgb, var(--art-primary) 12%, transparent);
  }

  .rd-table-skeleton--dense .rd-table-skeleton__row {
    margin-bottom: 10px;
  }

  .rd-table-skeleton__cell {
    height: 14px;
  }

  .rd-table-skeleton__head .rd-table-skeleton__cell {
    height: 12px;
  }

  .rd-kpi-empty-wrap {
    margin-bottom: 16px;
  }

  .rd-kpi-empty-card {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 132px;
    padding: 20px 16px;
  }

  .rd-card-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 8px 8px;

    :deep(.el-empty__description) {
      margin-top: 12px;
      color: var(--text-tertiary);
    }

    :deep(.el-empty__image) {
      opacity: 0.85;
    }
  }

  .rd-card-empty--trend {
    flex: 1;
    min-height: 168px;
  }

  .rd-card-empty--table {
    min-height: 176px;
  }

  .rd-card-empty--country {
    flex: 1;
    min-height: 200px;
  }

  .rd-card-empty--matrix {
    min-height: 240px;
  }

  /* ── Text Colors ───────────────────────────────────────────────────── */
  .rd-text--red {
    color: var(--art-danger) !important;
  }

  .rd-text--green {
    color: var(--art-success) !important;
  }

  .rd-text--orange {
    color: var(--art-warning) !important;
  }

  .rd-text--muted {
    color: var(--text-tertiary) !important;
  }

  /* ── Reason Chart ──────────────────────────────────────────────────── */
  .rd-reason-body {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .rd-reason-chart {
    flex-shrink: 0;
    width: 110px;
    height: 110px;
  }

  .rd-chart-sk {
    position: relative;
    z-index: 1;
    height: 200px;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--default-box-color) 72%, transparent),
      color-mix(in srgb, var(--default-box-color) 92%, transparent),
      color-mix(in srgb, var(--default-box-color) 72%, transparent)
    );
    background-size: 220% 100%;
    border-radius: 12px;
    animation: rd-sk-shimmer 1.4s var(--ease-out) infinite;
  }

  .rd-chart-sk--tall {
    height: 240px;
  }

  .rd-pie-sk {
    flex-shrink: 0;
    width: 110px;
    height: 110px;
    background: radial-gradient(
      circle at 30% 30%,
      color-mix(in srgb, var(--default-box-color) 90%, transparent),
      color-mix(in srgb, var(--default-box-color) 70%, transparent)
    );
    border-radius: 50%;
    animation: rd-sk-pulse 1.2s var(--ease-out) infinite alternate;
  }

  .rd-kpi-sk {
    display: grid;
    gap: 10px;
  }

  .rd-kpi-sk__label {
    width: 72%;
    height: 12px;
  }

  .rd-kpi-sk__value {
    width: 58%;
    height: 26px;
  }

  .rd-kpi-sk__sub {
    width: 88%;
    height: 10px;
  }

  @keyframes rd-sk-shimmer {
    from {
      background-position: 0% 0%;
      opacity: 0.9;
    }

    to {
      background-position: 100% 0%;
      opacity: 1;
    }
  }

  @keyframes rd-sk-pulse {
    from {
      opacity: 0.6;
      transform: scale(0.98);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .rd-reason-legend {
    flex: 1;
  }

  .rd-reason-legend__item {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 7px;
    font-size: 11px;
    color: var(--text-secondary);
  }

  .rd-reason-legend__dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .rd-reason-legend__name {
    flex: 1;
  }

  .rd-reason-legend__val {
    font-weight: 600;
    color: var(--text-primary);
  }

  /* ── Advice Card ───────────────────────────────────────────────────── */
  .rd-advice-list {
    padding: 0;
    margin: 0 0 14px;
    list-style: none;
  }

  .rd-advice-list li {
    position: relative;
    padding: 4px 0 4px 14px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-secondary);
  }

  .rd-advice-list li::before {
    position: absolute;
    left: 0;
    color: var(--art-warning);
    content: '•';
  }

  .rd-advice-actions {
    display: flex;
    gap: 8px;
  }

  .rd-btn-outline {
    flex: 1;
    height: 32px !important;
    font-size: 12px !important;
    color: var(--text-secondary) !important;
    background: transparent !important;
    border: 1px solid color-mix(in srgb, var(--art-primary) 22%, transparent) !important;
    transition:
      border-color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);
  }

  .rd-btn-primary {
    flex: 1;
    height: 32px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    color: var(--el-color-white) !important;
    background: color-mix(
      in srgb,
      var(--el-color-primary) 78%,
      var(--default-box-color)
    ) !important;
    border-color: color-mix(in srgb, var(--el-color-primary) 70%, transparent) !important;
    transition:
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);
  }

  .rd-btn-outline:hover,
  .rd-btn-primary:hover {
    box-shadow: 0 0 18px color-mix(in srgb, var(--el-color-primary) 22%, transparent);
    transform: translateY(-2px);
  }

  /* ── Bottom Grid ───────────────────────────────────────────────────── */
  .rd-bottom-grid {
    display: grid;
    grid-template-columns: minmax(200px, 240px) minmax(180px, 0.6fr) minmax(min(100%, 420px), 1.4fr);
    gap: 14px;
    align-items: stretch;
  }

  @media (width <= 1399px) {
    .rd-bottom-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .rd-matrix-card {
      grid-column: 1 / -1;
    }
  }

  @media (width <= 767px) {
    .rd-bottom-grid {
      grid-template-columns: 1fr;
    }

    .rd-matrix-card {
      grid-column: auto;
    }
  }

  /* 第三行三列同高 */
  .rd-country-card,
  .rd-history-card,
  .rd-matrix-card {
    min-width: 0;
    height: 100%;
    min-height: 0;
  }

  .rd-history-card,
  .rd-matrix-card {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  /* ── Country Chart ─────────────────────────────────────────────────── */
  .rd-tab-group {
    display: flex;
    gap: 4px;
    margin-bottom: 10px;
  }

  .rd-tab-btn {
    padding: 3px 10px;
    font-size: 11px;
    color: var(--text-tertiary);
    cursor: pointer;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--art-primary) 22%, transparent);
    border-radius: 4px;
    transition:
      color var(--duration-normal) var(--ease-out),
      background-color var(--duration-normal) var(--ease-out),
      border-color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);
  }

  .rd-tab-btn--active {
    color: var(--art-success);
    background: color-mix(in srgb, var(--art-success) 14%, transparent);
    border-color: color-mix(in srgb, var(--art-success) 28%, transparent);
    box-shadow: 0 0 20px color-mix(in srgb, var(--art-success) 16%, transparent);
  }

  .rd-tab-btn:hover {
    border-color: color-mix(in srgb, var(--art-primary) 28%, transparent);
    box-shadow: 0 0 20px color-mix(in srgb, var(--art-primary) 14%, transparent);
    transform: translateY(-2px);
  }

  .rd-country-chart {
    flex: 1;
    min-height: 200px;
  }

  /* ── Matrix Table ──────────────────────────────────────────────────── */
  .rd-dim-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-bottom: 10px;
  }

  .rd-dim-label {
    font-size: 11px;
    color: var(--rd-text-muted);
  }

  .rd-dim-chip {
    padding: 2px 8px;
    font-size: 11px;
    color: var(--rd-text-muted);
    cursor: pointer;
    border: 1px solid #334155;
    border-radius: 4px;
  }

  .rd-dim-chip--active {
    color: var(--rd-blue);
    background: rgb(96 165 250 / 15%);
    border-color: var(--rd-blue);
  }

  .rd-dim-chip--disabled {
    cursor: not-allowed;
    background: color-mix(in srgb, var(--default-box-color) 70%, transparent);
    border-color: color-mix(in srgb, var(--default-border) 80%, transparent);
    opacity: 0.45;
  }

  .rd-matrix-scroll {
    position: relative;
    z-index: 1;
    box-sizing: border-box;
    flex: 1;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    min-height: 0;
    max-height: 340px;
    overflow: auto;
    overscroll-behavior-x: contain;

    /* 始终显示可拖拽滚动条（覆盖系统「叠加滚动条」观感） */
    scrollbar-width: auto;
    scrollbar-color: color-mix(in srgb, var(--art-gray-500) 75%, transparent) var(--default-border);
  }

  .rd-matrix-scroll::-webkit-scrollbar {
    width: 11px;
    height: 11px;
  }

  .rd-matrix-scroll::-webkit-scrollbar-track {
    background: color-mix(in srgb, var(--default-border) 65%, transparent);
    border-radius: 6px;
  }

  .rd-matrix-scroll::-webkit-scrollbar-thumb {
    min-width: 40px;
    min-height: 40px;
    background: color-mix(in srgb, var(--art-gray-600) 70%, var(--default-border));
    border: 2px solid color-mix(in srgb, var(--default-border) 65%, transparent);
    border-radius: 6px;
  }

  .rd-matrix-scroll::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--art-gray-500) 85%, var(--art-primary));
  }

  .rd-matrix-scroll::-webkit-scrollbar-corner {
    background: var(--default-box-color);
  }

  /*
   * 块级 + fit-content：min-width 相对 .rd-matrix-scroll 计算，避免 inline-block+table 上 min-width:100% 循环导致表被压成容器宽、横向永远不溢出。
   */
  .rd-matrix-table-inner {
    display: block;
    width: fit-content;
    min-width: 100%;
  }

  .rd-matrix-scroll--busy {
    min-height: 288px;
  }

  .rd-matrix-skeleton {
    box-sizing: border-box;
    width: 100%;
    min-height: 272px;
    padding: 6px 4px 12px;
  }

  .rd-matrix-skeleton__head,
  .rd-matrix-skeleton__row {
    display: grid;
    grid-template-columns: minmax(72px, 108px) repeat(4, minmax(0, 1fr));
    gap: 10px;
    align-items: center;
    margin-bottom: 12px;
  }

  .rd-matrix-skeleton__head {
    padding-bottom: 8px;
    margin-bottom: 14px;
    border-bottom: 1px solid color-mix(in srgb, var(--art-primary) 12%, transparent);
  }

  .rd-matrix-skeleton__cell {
    height: 14px;
  }

  .rd-matrix-skeleton__head .rd-matrix-skeleton__cell {
    height: 12px;
  }

  .rd-matrix-skeleton__cell--app {
    max-width: 100%;
  }

  /*
   * 双类提高优先级，压过 .rd-table { width:100% }；列为每格设 min-width，列少时总宽仍可能超过卡片，才能出现横向条。
   */
  .rd-matrix-table.rd-table {
    width: max-content;
    max-width: none;
    table-layout: auto;
    border-spacing: 0;
    border-collapse: separate;
  }

  .rd-matrix-table thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--default-box-color);
    box-shadow: 0 1px 0 color-mix(in srgb, var(--art-primary) 14%, transparent);
  }

  .rd-matrix-table thead th:first-child {
    left: 0;
    z-index: 5;
    min-width: 7.5rem;
    box-shadow:
      0 1px 0 color-mix(in srgb, var(--art-primary) 14%, transparent),
      1px 0 0 color-mix(in srgb, var(--art-primary) 14%, transparent);
  }

  .rd-matrix-table thead th:not(:first-child) {
    min-width: 9.5rem;
  }

  .rd-matrix-table tbody td:first-child {
    position: sticky;
    left: 0;
    z-index: 3;
    min-width: 7.5rem;
    background: var(--default-box-color);
    box-shadow: 1px 0 0 color-mix(in srgb, var(--art-primary) 14%, transparent);
  }

  .rd-matrix-table tbody td:not(:first-child) {
    min-width: 9.5rem;
  }

  .rd-matrix-col-head {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .rd-matrix-col-sub {
    font-size: 10px;
    font-weight: 400;
    color: var(--rd-text-muted);
  }

  .rd-matrix-app {
    display: flex;
    gap: 6px;
    align-items: center;
    white-space: nowrap;
  }

  .rd-app-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 12px;
    border-radius: 4px;
  }

  .rd-matrix-cell {
    font-size: 11px;
    white-space: nowrap;
  }

  .rd-matrix-est {
    color: var(--rd-text-primary);
  }

  .rd-matrix-real {
    color: var(--rd-text-secondary);
  }

  .rd-matrix-dev {
    font-size: 11px;
  }

  .rd-matrix-cell--red {
    background: rgb(248 113 113 / 8%);
  }

  .rd-matrix-cell--orange {
    background: rgb(251 146 60 / 8%);
  }

  .rd-matrix-note {
    padding-top: 8px;
    margin-top: 10px;
    font-size: 11px;
    line-height: 1.6;
    color: var(--text-tertiary);
    border-top: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
  }

  /* ── 视口：大/中/窄屏通用收紧与表头换行 ───────────────────────────── */
  @media (width <= 1199px) {
    .revenue-deviation {
      padding: 16px 18px;
    }
  }

  @media (width <= 767px) {
    .revenue-deviation {
      padding: 12px 14px;
    }

    .rd-kpi-grid {
      gap: 10px;
    }

    .rd-kpi-card {
      padding: 14px 16px;
    }

    .rd-filter-date,
    :deep(.rd-filter-date.el-date-editor.el-range-editor) {
      flex: 1 1 100%;
      max-width: 100% !important;
    }

    .rd-filter-select {
      flex: 1 1 calc(50% - 6px);
      width: auto;
      min-width: 0;
    }

    .rd-matrix-card .rd-card__header-row {
      flex-wrap: wrap;
      gap: 10px;
    }

    .rd-matrix-card .rd-select--matrix-platform {
      width: 100%;
      max-width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .revenue-deviation::before,
    .rd-page-fx {
      animation: none;
    }

    .rd-entry-1,
    .rd-entry-2,
    .rd-entry-3,
    .rd-entry-4 {
      opacity: 1;
      transform: none;
      animation: none;
    }

    .rd-card,
    .rd-kpi-card,
    .rd-tab-btn,
    .rd-btn-outline,
    .rd-btn-primary {
      transition: none !important;
      transform: none !important;
    }
  }
</style>

<style lang="scss">
  .rd-filter-popper {
    z-index: var(--z-dropdown);
  }
</style>
