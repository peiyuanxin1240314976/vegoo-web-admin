<template>
  <div class="ecpm-dash">
    <!-- ══════════════════ HEADER ══════════════════ -->
    <header class="dash-header">
      <div class="breadcrumb">
        <span class="bc-parent">商业洞察</span>
        <span class="bc-sep">›</span>
        <span class="bc-cur">ECPM分析</span>
      </div>
      <div class="header-filters">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          size="small"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY/MM/DD"
          class="date-picker"
        />
        <el-skeleton :loading="loadingMetaFilterOptions" animated>
          <template #template>
            <el-skeleton-item variant="text" class="filter-sel-skeleton" />
          </template>
          <el-select v-model="filterPlatform" size="small" class="filter-sel">
            <el-option
              v-for="item in sourceOptions"
              :key="item.value"
              :label="item.label"
              :value="toSelectValue(item.value)"
            />
          </el-select>
        </el-skeleton>
        <el-skeleton :loading="loadingMetaFilterOptions" animated>
          <template #template>
            <el-skeleton-item variant="text" class="filter-sel-skeleton" />
          </template>
          <el-select v-model="filterApp" size="small" class="filter-sel">
            <el-option
              v-for="item in appOptions"
              :key="item.value"
              :label="item.label"
              :value="toSelectValue(item.value)"
            />
          </el-select>
        </el-skeleton>
        <el-skeleton :loading="loadingMetaFilterOptions" animated>
          <template #template>
            <el-skeleton-item variant="text" class="filter-sel-skeleton" />
          </template>
          <el-select v-model="filterCountry" size="small" class="filter-sel">
            <el-option
              v-for="item in countryOptions"
              :key="item.value"
              :label="item.label"
              :value="toSelectValue(item.value)"
            />
          </el-select>
        </el-skeleton>
        <el-button size="small" class="filter-icon-btn" :icon="Filter" />
      </div>
    </header>

    <!-- ══════════════════ KPI ROW ══════════════════ -->
    <div class="kpi-row">
      <!-- 预估 ECPM -->
      <el-skeleton :loading="loadingOverviewKpis" animated>
        <template #template>
          <div class="kpi-card-skeleton-lines">
            <el-skeleton-item variant="p" class="s-line w40" />
            <el-skeleton-item variant="p" class="s-line w70" />
            <el-skeleton-item variant="p" class="s-line w45" />
            <el-skeleton-item variant="p" class="s-line w55" />
          </div>
        </template>
        <div class="kpi-card kpi-teal">
          <div class="kpi-label">
            <el-icon class="kpi-icon teal"><TrendCharts /></el-icon>
            ECPM（预估）
          </div>
          <div class="kpi-value teal">{{ fmt2(kpis.d_ecpm_estimated) }}</div>
          <div class="kpi-meta">广告平台上报</div>
          <div
            class="kpi-change"
            :class="kpis.estimated_change_pct_vs_prev_month >= 0 ? 'up' : 'dn'"
          >
            {{ kpis.estimated_change_pct_vs_prev_month >= 0 ? '↑' : '↓'
            }}{{ Math.abs(kpis.estimated_change_pct_vs_prev_month) }}% vs 上月
          </div>
        </div>
      </el-skeleton>

      <!-- 真实 ECPM -->
      <el-skeleton :loading="loadingOverviewKpis" animated>
        <template #template>
          <div class="kpi-card-skeleton-lines">
            <el-skeleton-item variant="p" class="s-line w40" />
            <el-skeleton-item variant="p" class="s-line w70" />
            <el-skeleton-item variant="p" class="s-line w45" />
            <el-skeleton-item variant="p" class="s-line w55" />
          </div>
        </template>
        <div class="kpi-card kpi-blue">
          <div class="kpi-label">
            <el-icon class="kpi-icon blue"><Money /></el-icon>
            ECPM（真实）
          </div>
          <div class="kpi-value blue">{{ fmt2(kpis.d_ecpm_real) }}</div>
          <div class="kpi-meta">实际入账</div>
          <div class="kpi-change" :class="kpis.real_change_pct_vs_prev_month >= 0 ? 'up' : 'dn'">
            {{ kpis.real_change_pct_vs_prev_month >= 0 ? '↑' : '↓'
            }}{{ Math.abs(kpis.real_change_pct_vs_prev_month) }}% vs 上月
          </div>
        </div>
      </el-skeleton>

      <!-- 最高 ECPM 国家 -->
      <el-skeleton :loading="loadingOverviewKpis" animated>
        <template #template>
          <div class="kpi-card-skeleton-lines">
            <el-skeleton-item variant="p" class="s-line w40" />
            <el-skeleton-item variant="p" class="s-line w70" />
            <el-skeleton-item variant="p" class="s-line w45" />
            <el-skeleton-item variant="p" class="s-line w55" />
          </div>
        </template>
        <div class="kpi-card kpi-dark">
          <div class="kpi-label">
            <el-icon class="kpi-icon white"><Location /></el-icon>
            最高ECPM国家
          </div>
          <div class="kpi-value white large">
            {{ kpis.top_country.label_display }} ${{ fmt2(kpis.top_country.d_ecpm) }}
          </div>
          <div class="kpi-meta">全球最高</div>
          <div class="kpi-meta dim">
            {{ kpis.top_country.second.label_display }} ${{ fmt2(kpis.top_country.second.d_ecpm) }}
            第二
          </div>
        </div>
      </el-skeleton>

      <!-- 最高 ECPM 广告位 -->
      <el-skeleton :loading="loadingOverviewKpis" animated>
        <template #template>
          <div class="kpi-card-skeleton-lines">
            <el-skeleton-item variant="p" class="s-line w40" />
            <el-skeleton-item variant="p" class="s-line w70" />
            <el-skeleton-item variant="p" class="s-line w45" />
            <el-skeleton-item variant="p" class="s-line w55" />
          </div>
        </template>
        <div class="kpi-card kpi-orange">
          <div class="kpi-label">
            <el-icon class="kpi-icon orange"><Grid /></el-icon>
            最高ECPM广告位
          </div>
          <div class="kpi-value orange xlarge">{{ kpis.top_ad_slot.s_app_name }}</div>
          <div class="kpi-meta orange-dim">
            ${{ fmt2(kpis.top_ad_slot.d_ecpm) }} {{ kpis.top_ad_slot.n_ad_type_label }}
          </div>
          <div class="kpi-meta dim">远高于平均水平</div>
        </div>
      </el-skeleton>
    </div>

    <!-- ══════════════════ MAIN GRID ══════════════════ -->
    <div class="main-grid">
      <!-- ── LEFT COLUMN ── -->
      <div class="col col-left">
        <!-- 趋势图 -->
        <div class="card">
          <div class="card-title">ECPM趋势分析（30天）</div>
          <div class="chart-loading-wrap">
            <div ref="trendRef" class="echart echart-trend" />
            <div v-if="loadingOverviewTrend" class="chart-loading-overlay">
              <div class="chart-skeleton-lines">
                <el-skeleton-item variant="p" class="s-line w90" />
                <el-skeleton-item variant="p" class="s-line w85" />
                <el-skeleton-item variant="p" class="s-line w95" />
                <el-skeleton-item variant="p" class="s-line w80" />
                <el-skeleton-item variant="p" class="s-line w88" />
                <el-skeleton-item variant="p" class="s-line w92" />
              </div>
            </div>
          </div>
          <div class="tab-row">
            <button
              v-for="tab in trendTabs"
              :key="tab"
              :class="['tab-btn', activeTrendTab === tab && 'active']"
              @click="activeTrendTab = tab"
              >{{ tab }}</button
            >
          </div>
        </div>

        <!-- 平台对比表 -->
        <div class="card" style="margin-top: 10px">
          <div class="card-title">平台ECPM对比</div>
          <el-skeleton :loading="loadingTablePlatform" animated>
            <template #template>
              <div class="table-skeleton-lines">
                <el-skeleton-item variant="p" class="s-line w95" />
                <el-skeleton-item variant="p" class="s-line w92" />
                <el-skeleton-item variant="p" class="s-line w90" />
                <el-skeleton-item variant="p" class="s-line w94" />
                <el-skeleton-item variant="p" class="s-line w89" />
                <el-skeleton-item variant="p" class="s-line w96" />
              </div>
            </template>
            <ArtTable
              class="ecpm-platform-art-table"
              :data="platformTableRows"
              :columns="platformTableColumns"
              :loading="loadingTablePlatform"
              :header-cell-style="{ background: '#131D2F' }"
              row-key="name"
              :stripe="false"
              :border="false"
              size="default"
              :pagination="undefined"
              :row-class-name="platformTableRowClassName"
            >
              <template #name="{ row }">
                <span class="pname">{{ row.name }}</span>
              </template>
              <template #estimated="{ row }">
                <span class="tr teal">{{ fmt2(row.estimated) }}</span>
              </template>
              <template #real="{ row }">
                <span class="tr blue">{{ fmt2(row.real) }}</span>
              </template>
              <template #revenue="{ row }">
                <span class="tr">{{ row.revenue }}</span>
              </template>
              <template #share="{ row }">
                <span class="tr dim">{{ row.share }}</span>
              </template>
              <template #trend="{ row }">
                <span v-if="row.__isSubtotal" class="tr dim">--</span>
                <svg v-else width="58" height="22" style="display: block; margin-left: auto">
                  <path
                    :d="sparkPath(row.sparkData)"
                    fill="none"
                    :stroke="
                      row.trend === 'up' ? '#00d4aa' : row.trend === 'down' ? '#ff6b6b' : '#4db6e8'
                    "
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </template>
            </ArtTable>
          </el-skeleton>
        </div>
      </div>

      <!-- ── MIDDLE COLUMN ── -->
      <div class="col col-mid">
        <!-- 世界地图 -->
        <div class="card">
          <div class="card-header-row">
            <span class="card-title">ECPM国家分布</span>
            <div class="toggle-group">
              <button
                :class="['tgl', mapMode === 'estimated' && 'active']"
                @click="mapMode = 'estimated'"
                >预估ECPM</button
              >
              <button :class="['tgl', mapMode === 'real' && 'active']" @click="mapMode = 'real'"
                >真实ECPM</button
              >
            </div>
          </div>
          <div class="chart-loading-wrap">
            <div ref="worldMapRef" class="echart echart-map" />
            <div v-if="loadingOverviewMapCountry" class="chart-loading-overlay">
              <div class="chart-skeleton-lines">
                <el-skeleton-item variant="p" class="s-line w92" />
                <el-skeleton-item variant="p" class="s-line w85" />
                <el-skeleton-item variant="p" class="s-line w89" />
                <el-skeleton-item variant="p" class="s-line w95" />
                <el-skeleton-item variant="p" class="s-line w83" />
                <el-skeleton-item variant="p" class="s-line w91" />
              </div>
            </div>
          </div>
        </div>

        <!-- Top 10 国家 -->
        <div class="card" style="margin-top: 10px">
          <div class="card-title">ECPM Top 10 国家</div>
          <div class="chart-loading-wrap">
            <div ref="top10Ref" class="echart echart-top10" />
            <div v-if="loadingOverviewTop10Country" class="chart-loading-overlay">
              <div class="table-skeleton-lines">
                <el-skeleton-item variant="p" class="s-line w80" />
                <el-skeleton-item variant="p" class="s-line w75" />
                <el-skeleton-item variant="p" class="s-line w85" />
                <el-skeleton-item variant="p" class="s-line w70" />
                <el-skeleton-item variant="p" class="s-line w90" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── RIGHT COLUMN ── -->
      <div class="col col-right">
        <!-- 提示条 -->
        <el-skeleton :loading="loadingOverviewInsightTip" animated>
          <template #template>
            <el-skeleton-item variant="p" class="s-line w96 insight-tip-line" />
          </template>
          <div class="alert-bar">
            <el-icon class="alert-icon"><Warning /></el-icon>
            <span>{{ insightTip }}</span>
          </div>
        </el-skeleton>

        <!-- 广告位排行 -->
        <div class="card" style="margin-top: 10px">
          <div class="card-title">ECPM广告位排行</div>
          <el-skeleton :loading="loadingOverviewAdSlotRanking" animated>
            <template #template>
              <div class="table-skeleton-lines">
                <el-skeleton-item variant="p" class="s-line w92" />
                <el-skeleton-item variant="p" class="s-line w88" />
                <el-skeleton-item variant="p" class="s-line w86" />
                <el-skeleton-item variant="p" class="s-line w79" />
                <el-skeleton-item variant="p" class="s-line w84" />
                <el-skeleton-item variant="p" class="s-line w76" />
              </div>
            </template>
            <div class="adslot-list">
              <div v-for="slot in adSlots" :key="slot.name" class="adslot-row">
                <span class="slot-name">{{ slot.name }}</span>
                <div class="slot-track">
                  <div
                    class="slot-bar"
                    :style="{
                      width: (slot.value / 22) * 100 + '%',
                      background: slot.color
                    }"
                  />
                </div>
                <span class="slot-val">{{ slot.value }}</span>
              </div>
            </div>
          </el-skeleton>
        </div>

        <!-- 应用排行 -->
        <div class="card" style="margin-top: 10px">
          <div class="card-header-row">
            <span class="card-title">ECPM应用排行</span>
            <el-select v-model="appRankType" size="small" class="mini-sel">
              <el-option label="预估ECPM" value="estimated" />
              <el-option label="真实ECPM" value="real" />
            </el-select>
          </div>
          <el-skeleton :loading="loadingOverviewAppRanking" animated>
            <template #template>
              <div class="table-skeleton-lines">
                <el-skeleton-item variant="p" class="s-line w95" />
                <el-skeleton-item variant="p" class="s-line w90" />
                <el-skeleton-item variant="p" class="s-line w93" />
                <el-skeleton-item variant="p" class="s-line w87" />
                <el-skeleton-item variant="p" class="s-line w91" />
              </div>
            </template>
            <table class="dtable">
              <thead>
                <tr>
                  <th>应用</th>
                  <th class="tr">ECPM</th>
                  <th class="tr">广告收入</th>
                  <th class="tr">环比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in apps" :key="row.name">
                  <td class="app-name-cell">
                    <span class="app-icon-box">{{ row.icon }}</span>
                    {{ row.name }}
                  </td>
                  <td class="tr teal">{{ fmt2(row.ecpm) }}</td>
                  <td class="tr">{{ row.revenue }}</td>
                  <td :class="['tr', row.change >= 0 ? 'up' : 'dn']">
                    {{ row.change >= 0 ? '↑' : '↓' }}{{ Math.abs(row.change) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </el-skeleton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
  import * as echarts from 'echarts'
  import type { ECharts } from 'echarts'
  import { Filter, TrendCharts, Money, Location, Grid, Warning } from '@element-plus/icons-vue'
  import {
    fetchEcpmMetaFilterOptions,
    fetchEcpmOverviewAdSlotRanking,
    fetchEcpmOverviewAppRanking,
    fetchEcpmOverviewInsightTip,
    fetchEcpmOverviewMapCountry,
    fetchEcpmOverviewKpis,
    fetchEcpmOverviewTop10Country,
    fetchEcpmOverviewTrend,
    fetchEcpmTablePlatform
  } from '@/api/business-insight'
  import type {
    EcpmCountryFilterOption,
    EcpmFilterOption,
    EcpmOverviewKpis,
    EcpmTrendBundle
  } from './types'
  import type { ColumnOption } from '@/types'

  defineOptions({ name: 'EcpmDashboard' })

  function fmt2(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const kpis = ref<EcpmOverviewKpis>({
    d_ecpm_estimated: 0,
    d_ecpm_real: 0,
    estimated_change_pct_vs_prev_month: 0,
    real_change_pct_vs_prev_month: 0,
    top_country: {
      s_country_code: '',
      label_display: '',
      d_ecpm: 0,
      second: { s_country_code: '', label_display: '', d_ecpm: 0 }
    },
    top_ad_slot: {
      s_app_id: '',
      s_app_name: '',
      n_ad_type_label: '',
      d_ecpm: 0
    }
  })
  const platformSubtotal = ref({
    d_ecpm_estimated: 0,
    d_ecpm_real: 0,
    revenue_display: '',
    share_display: ''
  })
  const platforms = ref<
    Array<{
      name: string
      estimated: number
      real: number
      revenue: string
      share: string
      trend: 'up' | 'down' | 'flat'
      sparkData: number[]
    }>
  >([])
  const adSlots = ref<Array<{ name: string; value: number; color: string }>>([])
  const insightTip = ref('')

  const appRankRows = ref<
    Array<{
      s_app_name: string
      icon_text: string
      d_ecpm_estimated: number
      d_ecpm_real: number
      revenue_display: string
      mom_change_pct: number
    }>
  >([])
  const apps = computed(() =>
    appRankRows.value.map((r) => ({
      name: r.s_app_name,
      icon: r.icon_text,
      ecpm: appRankType.value === 'estimated' ? r.d_ecpm_estimated : r.d_ecpm_real,
      revenue: r.revenue_display,
      change: r.mom_change_pct
    }))
  )

  // ─── State ───────────────────────────────────────────────────────────────
  const ALL_OPTION_VALUE = '__ALL__'

  const dateRange = ref<[string, string]>(['2024/05/01', '2024/05/31'])
  const filterPlatform = ref(ALL_OPTION_VALUE)
  const filterApp = ref(ALL_OPTION_VALUE)
  const filterCountry = ref(ALL_OPTION_VALUE)
  const loadingMetaFilterOptions = ref(false)
  const loadingOverviewKpis = ref(false)
  const loadingOverviewTrend = ref(false)
  const loadingTablePlatform = ref(false)
  const loadingOverviewMapCountry = ref(false)
  const loadingOverviewTop10Country = ref(false)
  const loadingOverviewAdSlotRanking = ref(false)
  const loadingOverviewAppRanking = ref(false)
  const loadingOverviewInsightTip = ref(false)
  const sourceOptions = ref<EcpmFilterOption[]>([])
  const appOptions = ref<EcpmFilterOption[]>([])
  const countryOptions = ref<EcpmCountryFilterOption[]>([])
  const trendData = ref<EcpmTrendBundle>({
    x_labels: [],
    series_estimated: [],
    series_real: [],
    series_revenue: []
  })
  const mapCountries = ref<
    Array<{
      s_country_code: string
      geo_name: string
      d_ecpm_estimated: number
      d_ecpm_real: number
    }>
  >([])
  const top10Countries = ref<
    Array<{ s_country_code: string; label_zh: string; d_ecpm: number; bar_color: string }>
  >([])
  const mapMode = ref<'estimated' | 'real'>('estimated')
  const activeTrendTab = ref('预估ECPM')
  const trendTabs = ['预估ECPM', '真实ECPM', '广告收入']
  const appRankType = ref('estimated')

  const platformTableRows = computed(() => [
    ...platforms.value.map((row) => ({ ...row, __isSubtotal: false })),
    {
      name: '小计',
      estimated: platformSubtotal.value.d_ecpm_estimated,
      real: platformSubtotal.value.d_ecpm_real,
      revenue: platformSubtotal.value.revenue_display,
      share: platformSubtotal.value.share_display,
      trend: 'flat' as const,
      sparkData: [],
      __isSubtotal: true
    }
  ])

  const platformTableColumns = computed<ColumnOption[]>(() => [
    { prop: 'name', label: '广告平台', minWidth: 110, useSlot: true, slotName: 'name' },
    {
      prop: 'estimated',
      label: '预估ECPM',
      minWidth: 100,
      align: 'left',
      useSlot: true,
      slotName: 'estimated'
    },
    {
      prop: 'real',
      label: '真实ECPM',
      minWidth: 100,
      align: 'left',
      useSlot: true,
      slotName: 'real'
    },
    {
      prop: 'revenue',
      label: '广告收入',
      minWidth: 90,
      align: 'left',
      useSlot: true,
      slotName: 'revenue'
    },
    { prop: 'share', label: '占比', minWidth: 80, align: 'left', useSlot: true, slotName: 'share' },
    { prop: 'trend', label: '趋势', minWidth: 90, align: 'left', useSlot: true, slotName: 'trend' }
  ])

  function platformTableRowClassName({ row }: { row: { __isSubtotal?: boolean } }) {
    return row.__isSubtotal ? 'platform-total-row' : ''
  }

  // ─── Chart Refs ───────────────────────────────────────────────────────────
  const trendRef = ref<HTMLDivElement>()
  const worldMapRef = ref<HTMLDivElement>()
  const top10Ref = ref<HTMLDivElement>()

  let trendChart: ECharts | null = null
  let worldMapChart: ECharts | null = null
  let top10Chart: ECharts | null = null
  let mapRequestSeq = 0
  let top10RequestSeq = 0

  // ─── Spark Line Helper ────────────────────────────────────────────────────
  function toSelectValue(value: string) {
    return value === '' ? ALL_OPTION_VALUE : value
  }

  function fromSelectValue(value: string) {
    return value === ALL_OPTION_VALUE ? '' : value
  }

  function normalizeYmd(value: string) {
    return String(value).replace(/\//g, '-')
  }

  function sparkPath(data: number[]): string {
    const W = 58
    const H = 20
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * W
        const y = H - ((v - min) / range) * (H - 2) - 1
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }

  // ─── ECharts Theme ────────────────────────────────────────────────────────
  const TRANSPARENT = 'transparent'
  const COLOR_TEAL = '#00d4aa'
  const COLOR_ORANGE = '#f5a623'
  const AXIS_COLOR = '#243a55'
  const LABEL_COLOR = '#6a8aaa'
  const TEXT_COLOR = '#b0c8df'

  const TOOLTIP_STYLE = {
    backgroundColor: '#162035',
    borderColor: '#1e3250',
    textStyle: { color: TEXT_COLOR, fontSize: 12 }
  }

  function getTrendSeriesConfig() {
    if (activeTrendTab.value === '广告收入') {
      return {
        legend: ['广告收入'],
        series: [
          {
            name: '广告收入',
            type: 'line',
            data: trendData.value.series_revenue,
            smooth: 0.4,
            symbol: 'none',
            lineStyle: { color: COLOR_TEAL, width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0,212,170,0.18)' },
                { offset: 1, color: 'rgba(0,212,170,0.01)' }
              ])
            }
          }
        ],
        yMin: null as number | null,
        yMax: null as number | null,
        yInterval: null as number | null
      }
    }
    if (activeTrendTab.value === '真实ECPM') {
      return {
        legend: ['真实ECPM'],
        series: [
          {
            name: '真实ECPM',
            type: 'line',
            data: trendData.value.series_real,
            smooth: 0.4,
            symbol: 'none',
            lineStyle: { color: COLOR_TEAL, width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0,212,170,0.18)' },
                { offset: 1, color: 'rgba(0,212,170,0.01)' }
              ])
            }
          }
        ],
        yMin: 2.8,
        yMax: 4.5,
        yInterval: 0.5
      }
    }
    return {
      legend: ['预估ECPM'],
      series: [
        {
          name: '预估ECPM',
          type: 'line',
          data: trendData.value.series_estimated,
          smooth: 0.4,
          symbol: 'none',
          lineStyle: { color: COLOR_ORANGE, type: 'dashed', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245,166,35,0.18)' },
              { offset: 1, color: 'rgba(245,166,35,0.01)' }
            ])
          }
        }
      ],
      yMin: 2.8,
      yMax: 4.5,
      yInterval: 0.5
    }
  }

  function updateTrendChart() {
    if (!trendChart) return
    const cfg = getTrendSeriesConfig()
    trendChart.setOption({
      legend: { data: cfg.legend },
      xAxis: { data: trendData.value.x_labels },
      yAxis: {
        min: cfg.yMin,
        max: cfg.yMax,
        interval: cfg.yInterval
      },
      series: cfg.series
    })
    trendChart.resize()
  }

  // ─── Trend Chart ──────────────────────────────────────────────────────────
  function initTrendChart() {
    if (!trendRef.value) return
    trendChart = echarts.getInstanceByDom(trendRef.value) ?? echarts.init(trendRef.value)

    trendChart.setOption({
      backgroundColor: TRANSPARENT,
      grid: { top: 36, right: 16, bottom: 30, left: 40 },
      tooltip: {
        trigger: 'axis',
        ...TOOLTIP_STYLE,
        axisPointer: { lineStyle: { color: AXIS_COLOR } }
      },
      legend: {
        data: ['预估ECPM'],
        right: 8,
        top: 4,
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 16,
        textStyle: { color: LABEL_COLOR, fontSize: 11 }
      },
      xAxis: {
        type: 'category',
        data: trendData.value.x_labels,
        boundaryGap: false,
        axisLine: { lineStyle: { color: AXIS_COLOR } },
        axisTick: { show: false },
        axisLabel: { color: LABEL_COLOR, fontSize: 10 },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        min: 2.8,
        max: 4.5,
        interval: 0.5,
        splitLine: { lineStyle: { color: AXIS_COLOR, type: 'dashed' } },
        axisLabel: { color: LABEL_COLOR, fontSize: 10 },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          name: '预估ECPM',
          type: 'line',
          data: trendData.value.series_estimated,
          smooth: 0.4,
          symbol: 'none',
          lineStyle: { color: COLOR_ORANGE, type: 'dashed', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245,166,35,0.18)' },
              { offset: 1, color: 'rgba(245,166,35,0.01)' }
            ])
          }
        }
      ]
    })
    updateTrendChart()
  }

  function mapSeriesData() {
    return mapCountries.value.map((c) => ({
      name: c.geo_name,
      value: mapMode.value === 'estimated' ? c.d_ecpm_estimated : c.d_ecpm_real
    }))
  }

  // ─── World Map ────────────────────────────────────────────────────────────
  async function initWorldMap() {
    if (!worldMapRef.value) return

    try {
      const res = await fetch('/geo/world.json')
      const geoJson = await res.json()
      echarts.registerMap('world', geoJson)

      worldMapChart = echarts.init(worldMapRef.value)
      worldMapChart.setOption({
        backgroundColor: TRANSPARENT,
        tooltip: {
          trigger: 'item',
          ...TOOLTIP_STYLE,
          formatter: (params: any) => `${params.name}<br/>$${params.value ?? 'N/A'}`
        },
        visualMap: {
          min: 0,
          max: 10,
          left: 'left',
          bottom: 8,
          orient: 'horizontal',
          text: ['$10+', '$0'],
          textStyle: { color: LABEL_COLOR, fontSize: 10 },
          inRange: { color: ['#1e3250', '#00a884', '#00d4aa'] },
          itemWidth: 100,
          itemHeight: 10,
          calculable: false
        },
        series: [
          {
            type: 'map',
            map: 'world',
            roam: false,
            zoom: 1.2,
            center: [20, 10],
            itemStyle: {
              areaColor: '#1a2840',
              borderColor: '#0d1420',
              borderWidth: 0.5
            },
            emphasis: {
              itemStyle: { areaColor: '#00d4aa55' },
              label: { show: false }
            },
            label: { show: false },
            data: mapSeriesData()
          }
        ]
      })
    } catch (e) {
      console.warn('[EcpmDashboard] 世界地图数据加载失败，请检查网络', e)
    }
  }

  // ─── Top 10 Chart ─────────────────────────────────────────────────────────
  function initTop10Chart() {
    if (!top10Ref.value) return
    top10Chart = echarts.init(top10Ref.value)

    const countries = top10Countries.value.map((r) => r.label_zh)
    const values = top10Countries.value.map((r) => r.d_ecpm)
    const colors = top10Countries.value.map((r) => r.bar_color)

    top10Chart.setOption({
      backgroundColor: TRANSPARENT,
      grid: { top: 8, right: 48, bottom: 8, left: 72, containLabel: false },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'none' },
        ...TOOLTIP_STYLE
      },
      xAxis: {
        type: 'value',
        show: false,
        max: 10
      },
      yAxis: {
        type: 'category',
        data: countries,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: TEXT_COLOR, fontSize: 11 }
      },
      series: [
        {
          type: 'bar',
          data: values.map((v, i) => ({
            value: v,
            itemStyle: { color: colors[i], borderRadius: [0, 3, 3, 0] }
          })),
          barMaxWidth: 14,
          label: {
            show: true,
            position: 'right',
            color: TEXT_COLOR,
            fontSize: 11,
            formatter: '{c}'
          }
        }
      ]
    })
  }

  // ─── Resize Handler ───────────────────────────────────────────────────────
  function onResize() {
    trendChart?.resize()
    worldMapChart?.resize()
    top10Chart?.resize()
  }

  async function loadMetaFilterOptions() {
    loadingMetaFilterOptions.value = true
    try {
      const response = await fetchEcpmMetaFilterOptions()
      sourceOptions.value = response.sources
      appOptions.value = response.apps
      countryOptions.value = response.countries
      filterPlatform.value = toSelectValue(response.sources[0]?.value ?? '')
      filterApp.value = toSelectValue(response.apps[0]?.value ?? '')
      filterCountry.value = toSelectValue(response.countries[0]?.value ?? '')
    } finally {
      loadingMetaFilterOptions.value = false
    }
  }

  async function loadOverviewKpis() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    loadingOverviewKpis.value = true
    try {
      kpis.value = await fetchEcpmOverviewKpis({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        source: fromSelectValue(filterPlatform.value),
        s_app_id: fromSelectValue(filterApp.value),
        s_country_code: fromSelectValue(filterCountry.value)
      })
    } finally {
      loadingOverviewKpis.value = false
    }
  }

  async function loadOverviewTrend() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    loadingOverviewTrend.value = true
    try {
      trendData.value = await fetchEcpmOverviewTrend({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        source: fromSelectValue(filterPlatform.value),
        s_app_id: fromSelectValue(filterApp.value),
        s_country_code: fromSelectValue(filterCountry.value)
      })
      if (trendChart) initTrendChart()
    } finally {
      loadingOverviewTrend.value = false
    }
  }

  async function loadTablePlatform() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    loadingTablePlatform.value = true
    try {
      const response = await fetchEcpmTablePlatform({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        s_app_id: fromSelectValue(filterApp.value),
        s_country_code: fromSelectValue(filterCountry.value)
      })
      platforms.value = response.rows.map((row) => ({
        name: row.name,
        estimated: row.d_ecpm_estimated,
        real: row.d_ecpm_real,
        revenue: row.revenue_display,
        share: row.share_display,
        trend: row.trend,
        sparkData: row.spark_series
      }))
      platformSubtotal.value = {
        d_ecpm_estimated: response.subtotal.d_ecpm_estimated,
        d_ecpm_real: response.subtotal.d_ecpm_real,
        revenue_display: response.subtotal.revenue_display,
        share_display: response.subtotal.share_display
      }
    } finally {
      loadingTablePlatform.value = false
    }
  }

  async function loadOverviewMapCountry() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    const requestSeq = ++mapRequestSeq
    loadingOverviewMapCountry.value = true
    try {
      const response = await fetchEcpmOverviewMapCountry({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        source: fromSelectValue(filterPlatform.value),
        s_app_id: fromSelectValue(filterApp.value),
        s_country_code: fromSelectValue(filterCountry.value),
        map_metric: mapMode.value
      })
      if (requestSeq !== mapRequestSeq) return
      mapCountries.value = response.items
      if (worldMapChart) {
        worldMapChart.setOption({
          series: [{ data: mapSeriesData() }]
        })
      }
    } finally {
      if (requestSeq === mapRequestSeq) {
        loadingOverviewMapCountry.value = false
        await nextTick()
        worldMapChart?.resize()
      }
    }
  }

  async function loadOverviewTop10Country() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    const requestSeq = ++top10RequestSeq
    loadingOverviewTop10Country.value = true
    try {
      const response = await fetchEcpmOverviewTop10Country({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        source: fromSelectValue(filterPlatform.value),
        s_app_id: fromSelectValue(filterApp.value),
        s_country_code: fromSelectValue(filterCountry.value),
        metric: mapMode.value
      })
      if (requestSeq !== top10RequestSeq) return
      top10Countries.value = response.rows
      if (top10Chart) initTop10Chart()
    } finally {
      if (requestSeq === top10RequestSeq) {
        loadingOverviewTop10Country.value = false
        await nextTick()
        top10Chart?.resize()
      }
    }
  }

  async function loadOverviewAdSlotRanking() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    loadingOverviewAdSlotRanking.value = true
    try {
      const response = await fetchEcpmOverviewAdSlotRanking({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        source: fromSelectValue(filterPlatform.value),
        s_app_id: fromSelectValue(filterApp.value),
        s_country_code: fromSelectValue(filterCountry.value)
      })
      adSlots.value = response.rows.map((row) => ({
        name: row.s_ad_unit_label,
        value: row.d_ecpm,
        color: row.bar_color
      }))
    } finally {
      loadingOverviewAdSlotRanking.value = false
    }
  }

  async function loadOverviewAppRanking() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    loadingOverviewAppRanking.value = true
    try {
      const response = await fetchEcpmOverviewAppRanking({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        source: fromSelectValue(filterPlatform.value),
        s_country_code: fromSelectValue(filterCountry.value)
      })
      appRankRows.value = response.rows
    } finally {
      loadingOverviewAppRanking.value = false
    }
  }

  async function loadOverviewInsightTip() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    loadingOverviewInsightTip.value = true
    try {
      const response = await fetchEcpmOverviewInsightTip({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        s_app_id: fromSelectValue(filterApp.value)
      })
      insightTip.value = response.message
    } finally {
      loadingOverviewInsightTip.value = false
    }
  }

  async function loadOverviewModulesInParallel() {
    await Promise.allSettled([
      loadOverviewKpis(),
      loadOverviewTrend(),
      loadTablePlatform(),
      loadOverviewMapCountry(),
      loadOverviewTop10Country(),
      loadOverviewAdSlotRanking(),
      loadOverviewAppRanking(),
      loadOverviewInsightTip()
    ])
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  onMounted(async () => {
    // 先初始化图表实例，避免请求完成后 loading 提前结束导致空白闪烁
    initTrendChart()
    await initWorldMap()
    initTop10Chart()

    await loadMetaFilterOptions()
    await loadOverviewModulesInParallel()
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    trendChart?.dispose()
    worldMapChart?.dispose()
    top10Chart?.dispose()
    window.removeEventListener('resize', onResize)
  })

  watch(mapMode, async () => {
    await Promise.allSettled([loadOverviewMapCountry(), loadOverviewTop10Country()])
  })

  watch(activeTrendTab, () => {
    updateTrendChart()
  })
</script>

<style scoped>
  /* ── Root & Variables ─────────────────────────────────────────── */
  .ecpm-dash {
    --bg: #0d1422;
    --bg-card: #131d2f;
    --bg-card-2: #162038;
    --border: #1a2b41;
    --border-2: #203350;
    --text: #d4e6f5;
    --text-dim: #5a7a99;
    --text-mid: #8aaac8;
    --teal: #00d4aa;
    --blue: #4db6e8;
    --orange: #f5a623;
    --green: #52c41a;
    --red: #ff6b6b;
    --teal-dim: rgb(0 212 170 / 12%);
    --blue-dim: rgb(77 182 232 / 12%);
    --orange-dim: rgb(245 166 35 / 12%);

    box-sizing: border-box;
    min-height: 100vh;
    padding: 0;
    font-family:
      'PingFang SC',
      'Microsoft YaHei',
      -apple-system,
      sans-serif;
    font-size: 13px;
    color: var(--text);
    background: var(--bg);
  }

  /* ── Header ──────────────────────────────────────────────────── */
  .dash-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
  }

  .breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
  }

  .bc-parent {
    font-size: 14px;
    font-weight: 400;
    color: var(--text-dim);
  }

  .bc-sep {
    color: var(--text-dim);
  }

  .bc-cur {
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
  }

  .header-filters {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  /* Override Element Plus to fit dark theme */
  :deep(.date-picker.el-date-editor) {
    --el-input-bg-color: var(--bg-card-2);
    --el-input-border-color: var(--border-2);
    --el-input-text-color: var(--text);
    --el-input-hover-border-color: var(--teal);

    width: 220px !important;
    font-size: 12px;
  }

  :deep(.filter-sel.el-select) {
    --el-input-bg-color: var(--bg-card-2);
    --el-input-border-color: var(--border-2);
    --el-input-text-color: var(--text);
    --el-input-hover-border-color: var(--teal);

    width: 100px;
  }

  :deep(.filter-sel-skeleton.el-skeleton__item) {
    width: 100px;
    height: 32px;
    border-radius: 6px;
  }

  .kpi-card-skeleton-lines,
  .table-skeleton-lines,
  .chart-skeleton-lines {
    display: grid;
    gap: 10px;
    padding: 10px 0;
  }

  .kpi-card-skeleton-lines {
    min-height: 144px;
  }

  .table-skeleton-lines {
    min-height: 240px;
  }

  .chart-skeleton-lines {
    min-height: 280px;
  }

  .chart-loading-wrap {
    position: relative;
  }

  .chart-loading-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    padding: 8px;
    pointer-events: none;
    background: rgb(19 29 47 / 88%);
    border-radius: 6px;
  }

  :deep(.s-line.el-skeleton__item) {
    height: 12px;
    border-radius: 6px;
  }

  :deep(.insight-tip-line.el-skeleton__item) {
    height: 16px;
    margin-top: 10px;
    border-radius: 6px;
  }

  .w40 {
    width: 40%;
  }

  .w45 {
    width: 45%;
  }

  .w55 {
    width: 55%;
  }

  .w70 {
    width: 70%;
  }

  .w75 {
    width: 75%;
  }

  .w76 {
    width: 76%;
  }

  .w79 {
    width: 79%;
  }

  .w80 {
    width: 80%;
  }

  .w83 {
    width: 83%;
  }

  .w84 {
    width: 84%;
  }

  .w85 {
    width: 85%;
  }

  .w86 {
    width: 86%;
  }

  .w87 {
    width: 87%;
  }

  .w88 {
    width: 88%;
  }

  .w89 {
    width: 89%;
  }

  .w90 {
    width: 90%;
  }

  .w91 {
    width: 91%;
  }

  .w92 {
    width: 92%;
  }

  .w93 {
    width: 93%;
  }

  .w94 {
    width: 94%;
  }

  .w95 {
    width: 95%;
  }

  .w96 {
    width: 96%;
  }

  :deep(.filter-icon-btn.el-button) {
    width: 32px;
    height: 32px;
    color: var(--text-mid);
    background: var(--bg-card-2);
    border-color: var(--border-2);
  }

  :deep(.mini-sel.el-select) {
    --el-input-bg-color: var(--bg-card-2);
    --el-input-border-color: var(--border-2);
    --el-input-text-color: var(--text-mid);

    width: 106px;
  }

  /* ── KPI Row ─────────────────────────────────────────────────── */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    padding: 14px 20px;
  }

  .kpi-card {
    position: relative;
    padding: 16px 18px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-left-width: 3px;
    border-radius: 6px;
  }

  .kpi-card::before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 1px;
    content: '';
    opacity: 0.4;
  }

  .kpi-card.kpi-teal {
    background: linear-gradient(135deg, #0d1d2e, var(--bg-card));
    border-left-color: var(--teal);
  }

  .kpi-card.kpi-blue {
    background: linear-gradient(135deg, #0d1e2e, var(--bg-card));
    border-left-color: var(--blue);
  }

  .kpi-card.kpi-dark {
    background: linear-gradient(135deg, #111e2f, var(--bg-card));
    border-left-color: #1e3a55;
  }

  .kpi-card.kpi-orange {
    background: linear-gradient(135deg, #1c1a0e, var(--bg-card));
    border-left-color: var(--orange);
  }

  .kpi-label {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--text-mid);
  }

  .kpi-icon {
    font-size: 13px;
  }

  .kpi-value {
    margin-bottom: 6px;
    font-size: 36px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.5px;
  }

  .kpi-value.large {
    font-size: 28px;
  }

  .kpi-value.xlarge {
    font-size: 22px;
    font-weight: 800;
  }

  .kpi-meta {
    margin-bottom: 2px;
    font-size: 11px;
    color: var(--text-dim);
  }

  .kpi-meta.orange-dim {
    margin-bottom: 4px;
    color: rgb(245 166 35 / 70%);
  }

  .kpi-meta.dim {
    color: var(--text-dim);
  }

  .kpi-change {
    margin-top: 4px;
    font-size: 12px;
  }

  .kpi-change.up {
    color: var(--green);
  }

  .kpi-change.dn {
    color: var(--red);
  }

  /* Colors */
  .teal {
    color: var(--teal) !important;
  }

  .blue {
    color: var(--blue) !important;
  }

  .orange {
    color: var(--orange) !important;
  }

  .white {
    color: var(--text) !important;
  }

  .up {
    color: var(--green);
  }

  .dn {
    color: var(--red);
  }

  .dim {
    color: var(--text-dim);
  }

  /* ── Main Grid ───────────────────────────────────────────────── */
  .main-grid {
    display: grid;
    grid-template-columns: 38% 38% 24%;
    gap: 10px;
    padding: 0 20px 20px;
  }

  .col {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  /* ── Card ────────────────────────────────────────────────────── */
  .card {
    flex-shrink: 0;
    padding: 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .card-title {
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
  }

  .card-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .card-header-row .card-title {
    margin-bottom: 0;
  }

  /* ── Charts ──────────────────────────────────────────────────── */
  .echart {
    width: 100%;
  }

  .echart-trend {
    height: 220px;
  }

  .echart-map {
    height: 240px;
  }

  .echart-top10 {
    height: 220px;
  }

  /* ── Trend Tabs ──────────────────────────────────────────────── */
  .tab-row {
    display: flex;
    gap: 6px;
    margin-top: 10px;
  }

  .tab-btn {
    padding: 4px 12px;
    font-size: 11px;
    color: var(--text-dim);
    cursor: pointer;
    background: var(--bg-card-2);
    border: 1px solid var(--border-2);
    border-radius: 3px;
    transition: all 0.15s;
  }

  .tab-btn:hover {
    color: var(--text-mid);
    border-color: var(--teal);
  }

  .tab-btn.active {
    color: var(--teal);
    background: var(--teal-dim);
    border-color: rgb(0 212 170 / 40%);
  }

  /* ── Toggle Group ────────────────────────────────────────────── */
  .toggle-group {
    display: flex;
    overflow: hidden;
    border: 1px solid var(--border-2);
    border-radius: 4px;
  }

  .tgl {
    padding: 3px 10px;
    font-size: 11px;
    color: var(--text-dim);
    cursor: pointer;
    background: transparent;
    border: none;
    border-right: 1px solid var(--border-2);
    transition: all 0.15s;
  }

  .tgl:last-child {
    border-right: none;
  }

  .tgl.active {
    color: var(--teal);
    background: var(--bg-card-2);
  }

  /* ── Data Table ──────────────────────────────────────────────── */
  .dtable {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .dtable thead th {
    padding: 0 0 8px;
    font-size: 11px;
    font-weight: 400;
    color: var(--text-dim);
    white-space: nowrap;
    border-bottom: 1px solid var(--border);
  }

  .dtable tbody td {
    padding: 7px 0;
    color: var(--text);
    white-space: nowrap;
    border-bottom: 1px solid var(--border);
  }

  .dtable tbody tr:last-child td {
    border-bottom: none;
  }

  .dtable .pname {
    color: var(--text);
  }

  .dtable .tr {
    padding-right: 4px;
    text-align: right;
  }

  .total-row td {
    padding-top: 8px !important;
    font-size: 12px;
    border-top: 1px solid var(--border-2) !important;
  }

  .ecpm-platform-art-table :deep(.el-table) {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-row-hover-bg-color: rgb(255 255 255 / 3%);
    --el-table-header-bg-color: #131d2f;
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text);
    --el-table-header-text-color: var(--text-dim);
  }

  .ecpm-platform-art-table :deep(.el-table th.el-table__cell) {
    padding: 0 10px 8px;
    font-size: 11px;
    font-weight: 400;
    white-space: nowrap;
    border-bottom: 1px solid var(--border);
  }

  .ecpm-platform-art-table :deep(.el-table td.el-table__cell) {
    padding: 7px 10px;
    white-space: nowrap;
    border-bottom: 1px solid var(--border);
  }

  .ecpm-platform-art-table :deep(.el-table .platform-total-row td.el-table__cell) {
    padding-top: 8px;
    font-size: 12px;
    border-top: 1px solid var(--border-2);
  }

  .fw6 {
    font-weight: 600;
  }

  .app-name-cell {
    display: flex;
    gap: 6px;
    align-items: center;
    color: var(--text);
  }

  .app-icon-box {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 13px;
    background: var(--bg-card-2);
    border-radius: 4px;
  }

  /* ── Alert Bar ───────────────────────────────────────────────── */
  .alert-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 9px 12px;
    font-size: 12px;
    line-height: 1.4;
    color: #e0b860;
    background: rgb(245 166 35 / 10%);
    border: 1px solid rgb(245 166 35 / 25%);
    border-radius: 6px;
  }

  .alert-icon {
    flex-shrink: 0;
    font-size: 14px;
    color: var(--orange);
  }

  /* ── Ad Slot Bars ────────────────────────────────────────────── */
  .adslot-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .adslot-row {
    display: grid;
    grid-template-columns: 100px 1fr 38px;
    gap: 8px;
    align-items: center;
  }

  .slot-name {
    overflow: hidden;
    font-size: 11px;
    color: var(--text-mid);
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .slot-track {
    height: 8px;
    overflow: hidden;
    background: rgb(255 255 255 / 4%);
    border-radius: 2px;
  }

  .slot-bar {
    height: 100%;
    border-radius: 2px;
    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .slot-val {
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    color: var(--text);
    text-align: right;
  }

  /* ── Responsive ──────────────────────────────────────────────── */
  @media (width <= 1280px) {
    .main-grid {
      grid-template-columns: 1fr 1fr;
    }

    .col-right {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-column: 1 / -1;
      gap: 10px;
    }

    .alert-bar {
      grid-column: 1 / -1;
    }
  }

  @media (width <= 900px) {
    .main-grid {
      grid-template-columns: 1fr;
    }

    .kpi-row {
      grid-template-columns: 1fr 1fr;
    }

    .col-right {
      grid-template-columns: 1fr;
    }
  }
</style>
