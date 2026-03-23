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
        <el-select v-model="filterPlatform" size="small" class="filter-sel">
          <el-option label="全部平台" value="" />
          <el-option label="Admob" value="admob" />
          <el-option label="Facebook" value="facebook" />
          <el-option label="Applovin" value="applovin" />
        </el-select>
        <el-select v-model="filterApp" size="small" class="filter-sel">
          <el-option label="全部应用" value="" />
          <el-option label="WeatherRadar" value="weather" />
          <el-option label="PhoneTracker2" value="phone" />
        </el-select>
        <el-select v-model="filterCountry" size="small" class="filter-sel">
          <el-option label="全部国家" value="" />
          <el-option label="美国" value="us" />
          <el-option label="韩国" value="kr" />
        </el-select>
        <el-button size="small" class="filter-icon-btn" :icon="Filter" />
      </div>
    </header>

    <!-- ══════════════════ KPI ROW ══════════════════ -->
    <div class="kpi-row">
      <!-- 预估 ECPM -->
      <div class="kpi-card kpi-teal">
        <div class="kpi-label">
          <el-icon class="kpi-icon teal"><TrendCharts /></el-icon>
          ECPM（预估）
        </div>
        <div class="kpi-value teal">{{ fmt2(kpis.d_ecpm_estimated) }}</div>
        <div class="kpi-meta">广告平台上报</div>
        <div class="kpi-change" :class="kpis.estimated_change_pct_vs_prev_month >= 0 ? 'up' : 'dn'">
          {{ kpis.estimated_change_pct_vs_prev_month >= 0 ? '↑' : '↓'
          }}{{ Math.abs(kpis.estimated_change_pct_vs_prev_month) }}% vs 上月
        </div>
      </div>

      <!-- 真实 ECPM -->
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

      <!-- 最高 ECPM 国家 -->
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

      <!-- 最高 ECPM 广告位 -->
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
    </div>

    <!-- ══════════════════ MAIN GRID ══════════════════ -->
    <div class="main-grid">
      <!-- ── LEFT COLUMN ── -->
      <div class="col col-left">
        <!-- 趋势图 -->
        <div class="card">
          <div class="card-title">ECPM趋势分析（30天）</div>
          <div ref="trendRef" class="echart echart-trend" />
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
          <table class="dtable">
            <thead>
              <tr>
                <th>广告平台</th>
                <th class="tr">预估ECPM</th>
                <th class="tr">真实ECPM</th>
                <th class="tr">广告收入</th>
                <th class="tr">占比</th>
                <th class="tr">趋势</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in platforms" :key="row.name">
                <td class="pname">{{ row.name }}</td>
                <td class="tr teal">{{ row.estimated }}</td>
                <td class="tr blue">{{ row.real }}</td>
                <td class="tr">{{ row.revenue }}</td>
                <td class="tr dim">{{ row.share }}</td>
                <td class="tr">
                  <svg width="58" height="22" style="display: block">
                    <path
                      :d="sparkPath(row.sparkData)"
                      fill="none"
                      :stroke="
                        row.trend === 'up'
                          ? '#00d4aa'
                          : row.trend === 'down'
                            ? '#ff6b6b'
                            : '#4db6e8'
                      "
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </td>
              </tr>
              <tr class="total-row">
                <td>小计</td>
                <td class="tr teal fw6">{{ fmt2(platformSubtotal.d_ecpm_estimated) }}</td>
                <td class="tr blue fw6">{{ fmt2(platformSubtotal.d_ecpm_real) }}</td>
                <td class="tr fw6">{{ platformSubtotal.revenue_display }}</td>
                <td class="tr fw6">{{ platformSubtotal.share_display }}</td>
                <td class="tr dim">--</td>
              </tr>
            </tbody>
          </table>
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
          <div ref="worldMapRef" class="echart echart-map" />
        </div>

        <!-- Top 10 国家 -->
        <div class="card" style="margin-top: 10px">
          <div class="card-title">ECPM Top 10 国家</div>
          <div ref="top10Ref" class="echart echart-top10" />
        </div>
      </div>

      <!-- ── RIGHT COLUMN ── -->
      <div class="col col-right">
        <!-- 提示条 -->
        <div class="alert-bar">
          <el-icon class="alert-icon"><Warning /></el-icon>
          <span>{{ insightTip }}</span>
        </div>

        <!-- 广告位排行 -->
        <div class="card" style="margin-top: 10px">
          <div class="card-title">ECPM广告位排行</div>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import * as echarts from 'echarts'
  import type { ECharts } from 'echarts'
  import { Filter, TrendCharts, Money, Location, Grid, Warning } from '@element-plus/icons-vue'
  import {
    MOCK_ECPM_KPIS,
    MOCK_ECPM_PLATFORMS,
    MOCK_ECPM_PLATFORM_SUBTOTAL,
    MOCK_ECPM_TREND,
    MOCK_ECPM_MAP_COUNTRIES,
    MOCK_ECPM_TOP_COUNTRIES,
    MOCK_ECPM_AD_SLOTS,
    MOCK_ECPM_APP_RANK,
    MOCK_ECPM_INSIGHT_TIP
  } from './mock'

  defineOptions({ name: 'EcpmDashboard' })

  function fmt2(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const kpis = MOCK_ECPM_KPIS
  const platformSubtotal = MOCK_ECPM_PLATFORM_SUBTOTAL
  const platforms = MOCK_ECPM_PLATFORMS
  const adSlots = MOCK_ECPM_AD_SLOTS
  const insightTip = MOCK_ECPM_INSIGHT_TIP

  const apps = computed(() =>
    MOCK_ECPM_APP_RANK.map((r) => ({
      name: r.s_app_name,
      icon: r.icon_text,
      ecpm: appRankType.value === 'estimated' ? r.d_ecpm_estimated : r.d_ecpm_real,
      revenue: r.revenue_display,
      change: r.mom_change_pct
    }))
  )

  // ─── State ───────────────────────────────────────────────────────────────
  const dateRange = ref<[string, string]>(['2024/05/01', '2024/05/31'])
  const filterPlatform = ref('')
  const filterApp = ref('')
  const filterCountry = ref('')
  const mapMode = ref<'estimated' | 'real'>('estimated')
  const activeTrendTab = ref('预估ECPM')
  const trendTabs = ['预估ECPM', '真实ECPM', '广告收入']
  const appRankType = ref('estimated')

  // ─── Chart Refs ───────────────────────────────────────────────────────────
  const trendRef = ref<HTMLDivElement>()
  const worldMapRef = ref<HTMLDivElement>()
  const top10Ref = ref<HTMLDivElement>()

  let trendChart: ECharts | null = null
  let worldMapChart: ECharts | null = null
  let top10Chart: ECharts | null = null

  // ─── Spark Line Helper ────────────────────────────────────────────────────
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

  // ─── Trend Chart ──────────────────────────────────────────────────────────
  function initTrendChart() {
    if (!trendRef.value) return
    trendChart = echarts.init(trendRef.value)

    const days = MOCK_ECPM_TREND.x_labels
    const estimated = MOCK_ECPM_TREND.series_estimated
    const real = MOCK_ECPM_TREND.series_real

    trendChart.setOption({
      backgroundColor: TRANSPARENT,
      grid: { top: 36, right: 16, bottom: 30, left: 40 },
      tooltip: {
        trigger: 'axis',
        ...TOOLTIP_STYLE,
        axisPointer: { lineStyle: { color: AXIS_COLOR } }
      },
      legend: {
        data: ['预估ECPM', '真实ECPM'],
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
        data: days,
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
          data: estimated,
          smooth: 0.4,
          symbol: 'none',
          lineStyle: { color: COLOR_ORANGE, type: 'dashed', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245,166,35,0.18)' },
              { offset: 1, color: 'rgba(245,166,35,0.01)' }
            ])
          }
        },
        {
          name: '真实ECPM',
          type: 'line',
          data: real,
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
      ]
    })
  }

  function mapSeriesData() {
    return MOCK_ECPM_MAP_COUNTRIES.map((c) => ({
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

    const countries = MOCK_ECPM_TOP_COUNTRIES.map((r) => r.label_zh)
    const values = MOCK_ECPM_TOP_COUNTRIES.map((r) => r.d_ecpm)
    const colors = MOCK_ECPM_TOP_COUNTRIES.map((r) => r.bar_color)

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

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  onMounted(() => {
    initTrendChart()
    initWorldMap()
    initTop10Chart()
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    trendChart?.dispose()
    worldMapChart?.dispose()
    top10Chart?.dispose()
    window.removeEventListener('resize', onResize)
  })

  watch(mapMode, () => {
    if (!worldMapChart) return
    worldMapChart.setOption({
      series: [{ data: mapSeriesData() }]
    })
    worldMapChart.resize()
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

    width: 86px;
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
