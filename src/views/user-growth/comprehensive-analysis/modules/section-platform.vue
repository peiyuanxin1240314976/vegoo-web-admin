<template>
  <div class="ca-dashboard">
    <!-- ── 中部四列 ─────────────────────────────────────────── -->
    <div class="ca-mid-grid">
      <!-- Col 1: 广告平台 CPI 对比 -->
      <ElCard class="ca-panel" shadow="never">
        <template #header>
          <span>广告平台 CPI 对比</span>
        </template>
        <div class="target-label">
          目标 ${{
            data?.platformCpiBar?.target != null
              ? Number(data.platformCpiBar.target).toFixed(2)
              : '--'
          }}
        </div>
        <div ref="platformBarRef" class="ca-chart ca-chart--platform-bar"></div>
      </ElCard>

      <!-- Col 2: 应用 CPI 排行 -->
      <ElCard class="ca-panel" shadow="never">
        <template #header>
          <div class="panel-header-row">
            <span>应用 CPI 排行</span>
            <ElSelect
              v-model="appRankPlatform"
              size="small"
              style="width: 102px"
              :teleported="false"
            >
              <ElOption label="按广告平台" value="all" />
              <ElOption label="Google Ads" value="google" />
              <ElOption label="Facebook" value="facebook" />
              <ElOption label="TikTok" value="tiktok" />
            </ElSelect>
          </div>
        </template>
        <div class="app-rank-list">
          <div
            v-for="item in displayedAppCpiRank"
            :key="item.id"
            class="app-rank-item"
            @click="emit('drill-down', item.name)"
          >
            <div class="app-rank-item__info">
              <span class="app-icon">{{ item.name.slice(0, 1) }}</span>
              <span class="app-name">{{ item.name }}</span>
            </div>
            <div class="app-rank-item__right">
              <span
                class="app-cpi"
                :class="cpiColorClass(item.cpi, data?.platformCpiBar?.target ?? 2.5)"
              >
                ${{ item.cpi.toFixed(2) }}
              </span>
              <el-icon
                class="trend-icon"
                :class="
                  item.trend === 'up' ? 'trend-up' : item.trend === 'down' ? 'trend-down' : ''
                "
              >
                <Top v-if="item.trend === 'up'" />
                <Bottom v-else-if="item.trend === 'down'" />
                <Minus v-else />
              </el-icon>
              <el-icon class="drill-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
        <div class="app-rank-hint">点击应用可查看该应用各广告平台的详细数据</div>
      </ElCard>

      <!-- Col 3: 国家 CPI 分布（地图） -->
      <ElCard class="ca-panel" shadow="never">
        <template #header>
          <div class="panel-header-row">
            <span>国家 CPI 分布</span>
            <div class="map-metric-tabs">
              <button
                v-for="m in mapMetrics"
                :key="m"
                type="button"
                class="map-metric-tab"
                :class="{ 'is-active': activeMapMetric === m }"
                @click="activeMapMetric = m"
                >{{ m }}</button
              >
            </div>
          </div>
        </template>
        <div ref="mapRef" class="ca-chart ca-chart--map"></div>
      </ElCard>

      <!-- Col 4: CPI Top 8 国家 + 投放预警 -->
      <div class="ca-col4">
        <ElCard class="ca-panel ca-panel--top8" shadow="never">
          <template #header>CPI Top 8 国家</template>
          <div class="top8-list">
            <div v-for="item in data?.countryTop8 ?? []" :key="item.code" class="top8-item">
              <span class="top8-country">{{ item.country }}</span>
              <div class="top8-bar-wrap">
                <div
                  class="top8-bar"
                  :style="{
                    width: barWidth(item.cpi) + '%',
                    background: cpiBarColor(item.cpi, data?.platformCpiBar?.target ?? 2.5)
                  }"
                ></div>
              </div>
              <span
                class="top8-cpi"
                :class="cpiColorClass(item.cpi, data?.platformCpiBar?.target ?? 2.5)"
              >
                ${{ item.cpi.toFixed(2) }}
              </span>
            </div>
          </div>
        </ElCard>

        <ElCard class="ca-panel ca-panel--alerts" shadow="never">
          <template #header>投放预警</template>
          <div class="alert-list">
            <div v-for="alert in data?.alerts ?? []" :key="alert.id" class="alert-item">
              <span class="alert-dot" :class="`alert-dot--${alert.level}`"></span>
              <span class="alert-text" :class="`alert-text--${alert.level}`">{{ alert.text }}</span>
            </div>
          </div>
        </ElCard>
      </div>
    </div>

    <!-- ── 底部两列 ─────────────────────────────────────────── -->
    <div class="ca-bottom-grid">
      <!-- Left: 广告平台 CPI 趋势 -->
      <ElCard class="ca-panel" shadow="never">
        <template #header>广告平台 CPI 趋势（近7天）</template>
        <div ref="cpiTrendRef" class="ca-chart ca-chart--trend"></div>
      </ElCard>

      <!-- Right: ECPM 分析 -->
      <ElCard class="ca-panel" shadow="never">
        <template #header>ECPM 分析（近7天）</template>
        <div ref="ecpmRef" class="ca-chart ca-chart--ecpm"></div>
        <div v-if="data?.ecpmAnalysis" class="ecpm-metrics">
          <div class="ecpm-metric ecpm-metric--teal">
            <div class="ecpm-metric__label">预估ECPM</div>
            <div class="ecpm-metric__value">{{ data.ecpmAnalysis.metrics.estimatedEcpm }}</div>
          </div>
          <div class="ecpm-metric ecpm-metric--orange">
            <div class="ecpm-metric__label">真实ECPM</div>
            <div class="ecpm-metric__value">{{ data.ecpmAnalysis.metrics.actualEcpm }}</div>
          </div>
          <div class="ecpm-metric ecpm-metric--red">
            <div class="ecpm-metric__label">偏差率</div>
            <div class="ecpm-metric__value">{{ data.ecpmAnalysis.metrics.biasRate }}</div>
          </div>
          <div class="ecpm-metric ecpm-metric--red">
            <div class="ecpm-metric__label">偏差金额</div>
            <div class="ecpm-metric__value">{{ data.ecpmAnalysis.metrics.biasAmount }}</div>
          </div>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { Top, Bottom, ArrowRight, Minus } from '@element-plus/icons-vue'
  import { useChart } from '@/hooks/core/useChart'
  import { echarts, type EChartsOption } from '@/plugins/echarts'
  import type { ComprehensiveAnalysisData, CpiStatus } from '../types'

  defineOptions({ name: 'CaSectionPlatform' })

  const props = defineProps<{ data: ComprehensiveAnalysisData | null }>()
  const emit = defineEmits<{ 'drill-down': [name: string] }>()

  // ─── 世界地图 ──────────────────────────────────────────────────
  const WORLD_JSON_URL = `${import.meta.env.BASE_URL}geo/world.json`
  let mapRegistered = false

  async function ensureMapRegistered() {
    if (mapRegistered) return
    const res = await fetch(WORLD_JSON_URL)
    const json = await res.json()
    echarts.registerMap('world', json)
    mapRegistered = true
  }

  /** ISO-2 → world.json 英文名（覆盖常用投放国家） */
  const CODE_TO_NAME_EN: Record<string, string> = {
    US: 'United States of America',
    GB: 'United Kingdom',
    DE: 'Germany',
    AU: 'Australia',
    CA: 'Canada',
    JP: 'Japan',
    KR: 'South Korea',
    FR: 'France',
    BR: 'Brazil',
    IN: 'India',
    ID: 'Indonesia',
    MX: 'Mexico',
    TH: 'Thailand',
    VN: 'Vietnam',
    PH: 'Philippines',
    TR: 'Turkey',
    SA: 'Saudi Arabia',
    AE: 'United Arab Emirates',
    SG: 'Singapore',
    MY: 'Malaysia'
  }

  const appRankPlatform = ref('all')
  /** 应用 CPI 排行：按所选广告平台切换展示（本地口径模拟） */
  const PLATFORM_RANK_FACTOR: Record<string, number> = {
    all: 1,
    google: 1.08,
    facebook: 1.02,
    tiktok: 0.93
  }
  const displayedAppCpiRank = computed(() => {
    const list = props.data?.appCpiRank ?? []
    const factor = PLATFORM_RANK_FACTOR[appRankPlatform.value] ?? 1
    const mapped = list.map((item, i) => ({
      ...item,
      cpi: +(item.cpi * factor * (1 + (i % 5) * 0.006)).toFixed(2)
    }))
    if (appRankPlatform.value === 'all') return mapped
    return [...mapped].sort((a, b) => b.cpi - a.cpi)
  })
  const activeMapMetric = ref('CPI')
  const mapMetrics = ['CPI', 'ECPM', 'ROI']

  // 图表实例
  const platformBarChart = useChart()
  const mapChart = useChart()
  const cpiTrendChart = useChart()
  const ecpmChart = useChart()

  const platformBarRef = platformBarChart.chartRef
  const mapRef = mapChart.chartRef
  const cpiTrendRef = cpiTrendChart.chartRef
  const ecpmRef = ecpmChart.chartRef

  // ─── 工具函数 ──────────────────────────────────────────────────

  function cpiColorClass(cpi: number, target: number) {
    if (cpi <= target) return 'cpi-good'
    if (cpi <= target * 1.2) return 'cpi-near'
    return 'cpi-over'
  }

  function cpiBarColor(cpi: number, target: number) {
    if (cpi <= target) return '#22c55e'
    if (cpi <= target * 1.2) return '#f97316'
    return '#ef4444'
  }

  function statusLabel(status: CpiStatus) {
    return { good: '↓达标', near: '→接近', over: '↑超标' }[status]
  }

  function statusColor(status: CpiStatus) {
    return { good: '#22c55e', near: '#f97316', over: '#ef4444' }[status]
  }

  const top8Max = () => Math.max(...(props.data?.countryTop8?.map((c) => c.cpi) ?? [1]))
  function barWidth(cpi: number) {
    return Math.round((cpi / top8Max()) * 100)
  }

  // ─── 广告平台 CPI 对比（横向柱状图）────────────────────────────

  function buildPlatformBarOption(): EChartsOption {
    const d = props.data?.platformCpiBar
    if (!d) return {}
    const { getAxisLineStyle, getSplitLineStyle, getAxisLabelStyle, getTooltipStyle } =
      platformBarChart
    const items = d.items

    return {
      tooltip: {
        ...getTooltipStyle('axis'),
        formatter: (p: any) => {
          const item = items[p[0].dataIndex]
          return `${item.name}: $${item.cpi.toFixed(2)} — ${statusLabel(item.status)}`
        }
      },
      grid: { top: 8, right: 90, bottom: 8, left: 0, containLabel: true },
      xAxis: {
        type: 'value',
        min: 0,
        max: Math.max(...items.map((i) => i.cpi)) * 1.3,
        axisLabel: { ...getAxisLabelStyle(), formatter: '${value}' },
        splitLine: getSplitLineStyle()
        // 目标线用 markLine 实现
      },
      yAxis: {
        type: 'category',
        data: items.map((i) => i.name),
        axisLine: getAxisLineStyle(),
        axisTick: { show: false },
        axisLabel: getAxisLabelStyle()
      },
      series: [
        {
          type: 'bar',
          data: items.map((item) => ({
            value: item.cpi,
            itemStyle: { color: item.color, borderRadius: [0, 4, 4, 0] }
          })),
          barMaxWidth: 18,
          label: {
            show: true,
            position: 'right',
            formatter: (p: any) => {
              const item = items[p.dataIndex]
              return `$${item.cpi.toFixed(2)}  ${statusLabel(item.status)}`
            },
            color: (p: any) => statusColor(items[p.dataIndex].status),
            fontSize: 11,
            fontWeight: 600
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: '#94a3b8', type: 'dashed', width: 1 },
            data: [{ xAxis: d.target }],
            label: { show: false }
          }
        }
      ]
    } as unknown as EChartsOption
  }

  // ─── 国家 CPI 分布（世界地图）──────────────────────────────────

  interface MapMetricConfig {
    valueKey: 'cpi' | 'ecpm' | 'roi'
    unit: string
    goodMax: number
    nearMax: number
    labels: [string, string, string]
  }

  const MAP_METRIC_CONFIG: Record<string, MapMetricConfig> = {
    CPI: {
      valueKey: 'cpi',
      unit: '$',
      goodMax: 2.5,
      nearMax: 3.0,
      labels: ['达标', '接近', '超标']
    },
    ECPM: {
      valueKey: 'ecpm',
      unit: '$',
      goodMax: 18,
      nearMax: 22,
      labels: ['偏低', '正常', '偏高']
    },
    ROI: { valueKey: 'roi', unit: '%', goodMax: 40, nearMax: 25, labels: ['优秀', '一般', '偏低'] }
  }

  /** 根据 CPI 值派生各国其他指标（mock，保证幂等） */
  function deriveMetricValue(cpi: number, metric: string): number {
    if (metric === 'CPI') return cpi
    if (metric === 'ECPM') return +(14 + (3.5 - cpi) * 3.2).toFixed(1)
    // ROI: 高 CPI 国家通常 ROI 也高（T3 高端市场）
    return +(cpi * 14 - 4).toFixed(1)
  }

  function buildMapOption(): EChartsOption {
    const items = props.data?.countryCpiMap ?? []
    const metric = activeMapMetric.value
    const cfg = MAP_METRIC_CONFIG[metric] ?? MAP_METRIC_CONFIG['CPI']
    const { getTooltipStyle } = mapChart

    const mapData = items.map((c) => {
      const val = deriveMetricValue(c.cpi, metric)
      return {
        name: CODE_TO_NAME_EN[c.code] ?? c.country,
        value: val,
        nameCn: c.country,
        code: c.code
      }
    })

    // ROI：越高越好（逻辑翻转）；CPI/ECPM：越低越好
    const isHighGood = metric === 'ROI'
    const [goodColor, nearColor, badColor] = isHighGood
      ? ['#22c55e', '#f97316', '#ef4444']
      : ['#22c55e', '#f97316', '#ef4444']

    const pieces = isHighGood
      ? [
          {
            min: cfg.goodMax,
            color: goodColor,
            label: `≥${cfg.goodMax}${cfg.unit} ${cfg.labels[0]}`
          },
          { min: cfg.nearMax, max: cfg.goodMax, color: nearColor, label: cfg.labels[1] },
          {
            max: cfg.nearMax,
            color: badColor,
            label: `<${cfg.nearMax}${cfg.unit} ${cfg.labels[2]}`
          }
        ]
      : [
          {
            max: cfg.goodMax,
            color: goodColor,
            label: `≤${cfg.goodMax}${cfg.unit} ${cfg.labels[0]}`
          },
          { min: cfg.goodMax, max: cfg.nearMax, color: nearColor, label: cfg.labels[1] },
          {
            min: cfg.nearMax,
            color: badColor,
            label: `>${cfg.nearMax}${cfg.unit} ${cfg.labels[2]}`
          }
        ]

    return {
      backgroundColor: 'transparent',
      tooltip: {
        ...getTooltipStyle('item'),
        formatter: (p: any) => {
          if (!p.data?.value) return p.name
          return `<b>${p.data.nameCn || p.name}</b><br/>${metric}: ${cfg.unit}${p.data.value.toFixed(2)}`
        }
      },
      visualMap: {
        show: true,
        type: 'piecewise',
        pieces,
        outOfRange: { color: '#e2e8f0' },
        orient: 'horizontal',
        bottom: 4,
        left: 'center',
        itemWidth: 12,
        itemHeight: 10,
        textStyle: { fontSize: 10, color: 'var(--art-gray-500)' },
        itemGap: 8
      },
      series: [
        {
          type: 'map',
          map: 'world',
          roam: true,
          zoom: 1.2,
          scaleLimit: { min: 0.8, max: 4 },
          data: mapData,
          itemStyle: {
            areaColor: '#e2e8f0',
            borderColor: '#a0aec0',
            borderWidth: 0.5
          },
          emphasis: {
            itemStyle: {
              areaColor: '#93c5fd',
              borderColor: '#3b82f6',
              borderWidth: 1
            },
            label: { show: true, fontSize: 10, color: '#1e40af' }
          },
          select: { itemStyle: { areaColor: '#93c5fd' }, label: { show: true } },
          label: { show: false }
        }
      ]
    }
  }

  // ─── 广告平台 CPI 趋势（折线图）────────────────────────────────

  function buildCpiTrendOption(): EChartsOption {
    const d = props.data?.platformCpiTrend
    if (!d) return {}
    const { getAxisLineStyle, getSplitLineStyle, getAxisLabelStyle, getTooltipStyle } =
      cpiTrendChart
    return {
      tooltip: { ...getTooltipStyle('axis') },
      legend: {
        data: d.series.filter((s) => !s.dashed).map((s) => s.name),
        top: 0,
        left: 0,
        textStyle: { color: 'var(--art-gray-600)', fontSize: 11 },
        itemWidth: 12,
        itemHeight: 8
      },
      grid: { top: 30, right: 10, bottom: 30, left: 0, containLabel: true },
      xAxis: {
        type: 'category',
        data: d.dates,
        axisLine: getAxisLineStyle(),
        axisTick: { show: false },
        axisLabel: getAxisLabelStyle()
      },
      yAxis: {
        type: 'value',
        axisLabel: { ...getAxisLabelStyle(), formatter: '${value}' },
        splitLine: getSplitLineStyle()
      },
      series: d.series.map((s) => ({
        name: s.name,
        type: 'line',
        smooth: !s.dashed,
        data: s.data,
        lineStyle: { color: s.color, width: s.dashed ? 1 : 2, type: s.dashed ? 'dashed' : 'solid' },
        itemStyle: { color: s.color },
        symbol: s.dashed ? 'none' : 'circle',
        symbolSize: 3,
        areaStyle: s.dashed ? undefined : { color: s.color, opacity: 0.06 },
        ...(s.dashed ? { tooltip: { show: false } } : {})
      }))
    }
  }

  // ─── ECPM 分析（面积图）─────────────────────────────────────────

  function buildEcpmOption(): EChartsOption {
    const d = props.data?.ecpmAnalysis
    if (!d) return {}
    const { getAxisLineStyle, getSplitLineStyle, getAxisLabelStyle, getTooltipStyle } = ecpmChart
    return {
      tooltip: { ...getTooltipStyle('axis') },
      legend: {
        data: ['预估ECPM', '真实ECPM'],
        top: 0,
        right: 0,
        textStyle: { color: 'var(--art-gray-600)', fontSize: 11 },
        itemWidth: 20,
        itemHeight: 8
      },
      grid: { top: 28, right: 10, bottom: 30, left: 0, containLabel: true },
      xAxis: {
        type: 'category',
        data: d.dates,
        axisLine: getAxisLineStyle(),
        axisTick: { show: false },
        axisLabel: getAxisLabelStyle()
      },
      yAxis: {
        type: 'value',
        min: (v: any) => Math.floor(v.min - 2),
        axisLabel: getAxisLabelStyle(),
        splitLine: getSplitLineStyle()
      },
      series: [
        {
          name: '预估ECPM',
          type: 'line',
          data: d.estimated,
          smooth: true,
          lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
          itemStyle: { color: '#f59e0b' },
          symbol: 'none',
          areaStyle: { color: '#f59e0b', opacity: 0.15 }
        },
        {
          name: '真实ECPM',
          type: 'line',
          data: d.actual,
          smooth: true,
          lineStyle: { color: '#14b8a6', width: 2 },
          itemStyle: { color: '#14b8a6' },
          symbol: 'none',
          areaStyle: { color: '#14b8a6', opacity: 0.2 }
        }
      ]
    }
  }

  // ─── 渲染 ──────────────────────────────────────────────────────

  async function renderAll() {
    platformBarChart.initChart(buildPlatformBarOption())
    await ensureMapRegistered()
    mapChart.initChart(buildMapOption())
    cpiTrendChart.initChart(buildCpiTrendOption())
    ecpmChart.initChart(buildEcpmOption())
  }

  watch(() => props.data, renderAll, { deep: true })
  watch(activeMapMetric, async () => {
    await ensureMapRegistered()
    mapChart.initChart(buildMapOption())
  })
  onMounted(renderAll)
</script>

<style scoped lang="scss">
  .ca-dashboard {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  // ── 中部四列 ──────────────────────────────────────────────────
  .ca-mid-grid {
    display: grid;
    grid-template-columns: 28fr 22fr 30fr 20fr;
    gap: 14px;
    align-items: start;
  }

  // ── 底部两列 ──────────────────────────────────────────────────
  .ca-bottom-grid {
    display: grid;
    grid-template-columns: 58fr 42fr;
    gap: 14px;
  }

  // ── 通用面板 ──────────────────────────────────────────────────
  .ca-panel {
    :deep(.el-card__header) {
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
      color: var(--art-gray-800);
    }

    :deep(.el-card__body) {
      padding: 10px 14px;
    }
  }

  // ── 图表高度 ──────────────────────────────────────────────────
  .ca-chart {
    width: 100%;

    &--platform-bar {
      height: 220px;
    }

    &--map {
      height: 280px;
    }

    &--trend {
      height: 220px;
    }

    &--ecpm {
      height: 160px;
    }
  }

  .panel-header-row {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }

  // ── CPI 目标标签 ──────────────────────────────────────────────
  .target-label {
    margin-bottom: 4px;
    font-size: 11px;
    color: var(--art-gray-500);
    text-align: right;
  }

  // ── 应用 CPI 排行 ─────────────────────────────────────────────
  .app-rank-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .app-rank-item {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 7px 8px;
    cursor: pointer;
    border-radius: 6px;
    transition: background 0.15s;

    &:hover {
      background: color-mix(in srgb, var(--art-primary) 6%, var(--default-box-color));
    }

    &__info {
      display: flex;
      gap: 8px;
      align-items: center;
      min-width: 0;
    }

    &__right {
      display: flex;
      flex-shrink: 0;
      gap: 4px;
      align-items: center;
    }
  }

  .app-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    background: var(--art-primary);
    border-radius: 6px;
  }

  .app-name {
    overflow: hidden;
    font-size: 12px;
    color: var(--art-gray-800);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .app-cpi {
    font-size: 13px;
    font-weight: 600;
  }

  .trend-icon {
    font-size: 12px;
  }

  .drill-arrow {
    font-size: 12px;
    color: var(--art-gray-400);
  }

  .cpi-good {
    color: #22c55e;
  }

  .cpi-near {
    color: #f97316;
  }

  .cpi-over {
    color: #ef4444;
  }

  .trend-up {
    color: #ef4444;
  }

  .trend-down {
    color: #22c55e;
  }

  .app-rank-hint {
    margin-top: 8px;
    font-size: 11px;
    color: var(--art-gray-400);
  }

  // ── 地图指标切换 ──────────────────────────────────────────────
  .map-metric-tabs {
    display: flex;
    gap: 2px;
  }

  .map-metric-tab {
    padding: 2px 8px;
    font-size: 11px;
    color: var(--art-gray-600);
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--default-border);
    border-radius: 4px;
    transition: all 0.15s;

    &.is-active {
      color: var(--art-primary);
      background: color-mix(in srgb, var(--art-primary) 12%, var(--default-box-color));
      border-color: var(--art-primary);
    }
  }

  // ── CPI Top 8 ─────────────────────────────────────────────────
  .ca-col4 {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ca-panel--top8 :deep(.el-card__body) {
    padding: 8px 12px;
  }

  .ca-panel--alerts :deep(.el-card__body) {
    padding: 8px 12px;
  }

  .top8-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .top8-item {
    display: grid;
    grid-template-columns: 36px 1fr 44px;
    gap: 4px;
    align-items: center;
    font-size: 11px;
  }

  .top8-country {
    overflow: hidden;
    color: var(--art-gray-700);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .top8-bar-wrap {
    height: 8px;
    overflow: hidden;
    background: var(--default-border);
    border-radius: 4px;
  }

  .top8-bar {
    height: 100%;
    border-radius: 4px;
    transition: width 0.4s ease;
  }

  .top8-cpi {
    font-size: 11px;
    font-weight: 600;
    text-align: right;
  }

  // ── 投放预警 ──────────────────────────────────────────────────
  .alert-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .alert-item {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    font-size: 11px;
    line-height: 1.4;
  }

  .alert-dot {
    display: inline-block;
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    margin-top: 3px;
    border-radius: 50%;

    &--danger {
      background: #ef4444;
    }

    &--warning {
      background: #f97316;
    }

    &--info {
      background: #3b82f6;
    }
  }

  .alert-text {
    &--danger {
      color: #ef4444;
    }

    &--warning {
      color: #f97316;
    }

    &--info {
      color: #3b82f6;
    }
  }

  // ── ECPM 底部指标 ─────────────────────────────────────────────
  .ecpm-metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-top: 10px;
  }

  .ecpm-metric {
    padding: 8px 10px;
    text-align: center;
    border-radius: 8px;

    &__label {
      margin-bottom: 4px;
      font-size: 11px;
      color: #fff;
      opacity: 0.8;
    }

    &__value {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
    }

    &--teal {
      background: #0d9488;
    }

    &--orange {
      background: #ea580c;
    }

    &--red {
      background: #dc2626;
    }
  }
</style>
