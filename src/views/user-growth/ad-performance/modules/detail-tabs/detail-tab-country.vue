<template>
  <div class="ad-performance-detail-tab">
    <div class="ad-performance-detail-tab__toolbar">
      <div class="ad-performance-detail-tab__toolbar-left">
        <span class="ad-performance-detail-tab__hint">{{ data?.marketSummaryText ?? '-' }}</span>
      </div>
      <div class="ad-performance-detail-tab__toolbar-right">
        <span class="ad-performance-detail-tab__hint">{{ data?.sortHintText ?? '' }}</span>
      </div>
    </div>

    <ElCard shadow="never" class="ad-performance-detail-card">
      <template #header>各市场广告支出分布</template>
      <div class="ad-performance-detail-country">
        <div
          v-for="(row, idx) in data?.spendRows ?? []"
          :key="row.countryCode + idx"
          class="ad-performance-detail-country__row"
        >
          <div class="ad-performance-detail-country__left">
            <span class="ad-performance-detail-country__flag">{{
              countryFlag(row.countryCode)
            }}</span>
            <span class="ad-performance-detail-country__name">{{ row.countryName }}</span>
          </div>
          <div class="ad-performance-detail-country__bar">
            <div class="ad-performance-detail-country__bar-bg">
              <div
                class="ad-performance-detail-country__bar-fill"
                :style="{ width: `${row.percent}%` }"
              />
            </div>
          </div>
          <div class="ad-performance-detail-country__right">
            <span class="ad-performance-detail-country__spend">{{
              formatMoney(row.spend, 0)
            }}</span>
            <span class="ad-performance-detail-country__percent">{{ row.percent }}%</span>
            <span class="ad-performance-detail-country__cpi"
              >CPI {{ formatMoney(row.cpi, 2) }}</span
            >
          </div>
        </div>
      </div>
    </ElCard>

    <ElCard shadow="never" class="ad-performance-detail-card">
      <template #header>市场详情</template>
      <ElTable :data="data?.marketRows ?? []" size="small" class="ad-performance-detail-table">
        <ElTableColumn prop="countryName" label="国家" min-width="130">
          <template #default="{ row }">
            <span class="ad-performance-detail-market__country">
              <span class="ad-performance-detail-market__flag">{{
                countryFlag(row.countryCode)
              }}</span>
              <span class="ad-performance-detail-market__name">{{ row.countryName }}</span>
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="spend" label="广告支出" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.spend, 0) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="cpi" label="CPI" width="90" align="right">
          <template #default="{ row }">{{ formatMoney(row.cpi, 2) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="ctr" label="点击率" width="90" align="right">
          <template #default="{ row }">{{ row.ctr }}%</template>
        </ElTableColumn>
        <ElTableColumn prop="cvr" label="转化率" width="90" align="right">
          <template #default="{ row }">{{ row.cvr }}%</template>
        </ElTableColumn>
        <ElTableColumn prop="roi1" label="首日ROI" width="90" align="right">
          <template #default="{ row }"
            ><span :class="roiClass(row.roi1)">{{ row.roi1 }}%</span></template
          >
        </ElTableColumn>
        <ElTableColumn prop="roi3" label="3日ROI" width="90" align="right">
          <template #default="{ row }"
            ><span :class="roiClass(row.roi3)">{{ row.roi3 }}%</span></template
          >
        </ElTableColumn>
        <ElTableColumn prop="roi7" label="7日ROI" width="90" align="right">
          <template #default="{ row }"
            ><span :class="roiClass(row.roi7)">{{ row.roi7 }}%</span></template
          >
        </ElTableColumn>
        <ElTableColumn prop="roiTotal" label="累ROI" width="90" align="right">
          <template #default="{ row }"
            ><span :class="roiClass(row.roiTotal)">{{ row.roiTotal }}%</span></template
          >
        </ElTableColumn>
        <ElTableColumn prop="estimatedProfit" label="预估利润" width="110" align="right">
          <template #default="{ row }">
            <span :class="profitClass(row.estimatedProfit)">
              {{ row.estimatedProfit >= 0 ? '+' : '' }}{{ formatMoney(row.estimatedProfit, 0) }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="趋势" width="80" align="center">
          <template #default="{ row }">
            <svg class="ad-performance-detail-market__spark" viewBox="0 0 64 20" aria-hidden="true">
              <defs>
                <linearGradient id="spark-up" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--art-success)" stop-opacity="0.22" />
                  <stop offset="100%" stop-color="var(--art-success)" stop-opacity="0" />
                </linearGradient>
                <linearGradient id="spark-down" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--art-danger)" stop-opacity="0.22" />
                  <stop offset="100%" stop-color="var(--art-danger)" stop-opacity="0" />
                </linearGradient>
                <linearGradient id="spark-flat" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stop-color="var(--el-text-color-secondary)"
                    stop-opacity="0.18"
                  />
                  <stop
                    offset="100%"
                    stop-color="var(--el-text-color-secondary)"
                    stop-opacity="0"
                  />
                </linearGradient>
              </defs>
              <path
                class="ad-performance-detail-market__spark-area"
                :class="sparkLineClass(row.trendDirection)"
                :d="sparklineAreaPath(getTrendPoints(row), 64, 20)"
              />
              <polyline
                class="ad-performance-detail-market__spark-line"
                :class="sparkLineClass(row.trendDirection)"
                :points="sparklinePoints(getTrendPoints(row), 64, 20)"
              />
              <circle
                class="ad-performance-detail-market__spark-dot"
                :class="sparkLineClass(row.trendDirection)"
                :cx="sparklineLastPoint(getTrendPoints(row), 64, 20).x"
                :cy="sparklineLastPoint(getTrendPoints(row), 64, 20).y"
                r="2.4"
              />
            </svg>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <ElCard shadow="never" class="ad-performance-detail-card ad-performance-detail-insight">
      <template #header>{{ data?.insightTitle ?? '市场洞察' }}</template>
      <div class="ad-performance-detail-insight__text">{{ data?.insightText ?? '-' }}</div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import type { AdPerformanceDetailCountryTabData, AdPerformanceDetailMarketRow } from '../../types'

  defineOptions({ name: 'AdPerformanceDetailTabCountry' })

  defineProps<{
    data?: AdPerformanceDetailCountryTabData
  }>()

  function formatMoney(n: number, digits: 0 | 2) {
    const num = Number.isFinite(n) ? n : 0
    return (
      '$' +
      num.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    )
  }

  function roiClass(roi: number): string {
    return roi >= 80 ? 'is-roi-up' : 'is-roi-down'
  }

  function profitClass(profit: number): string {
    return profit >= 0 ? 'is-profit-up' : 'is-profit-down'
  }

  function getTrendPoints(row: AdPerformanceDetailMarketRow): number[] {
    if (Array.isArray(row.trendPoints) && row.trendPoints.length >= 2) return row.trendPoints
    if (row.trendDirection === 'up') return [72, 74, 76, 77, 79, 81, 83]
    if (row.trendDirection === 'down') return [83, 81, 80, 78, 76, 75, 74]
    return [78, 78, 79, 78, 78, 79, 78]
  }

  function sparklinePoints(values: number[], width: number, height: number): string {
    const v = (values ?? []).filter((n) => Number.isFinite(n)) as number[]
    if (v.length < 2) return ''
    const min = Math.min(...v)
    const max = Math.max(...v)
    const range = Math.max(1e-6, max - min)
    const pad = 2
    const innerW = Math.max(1, width - pad * 2)
    const innerH = Math.max(1, height - pad * 2)
    return v
      .map((val, idx) => {
        const x = pad + (innerW * idx) / (v.length - 1)
        const y = pad + innerH - ((val - min) / range) * innerH
        return `${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
  }

  function sparklineAreaPath(values: number[], width: number, height: number): string {
    const v = (values ?? []).filter((n) => Number.isFinite(n)) as number[]
    if (v.length < 2) return ''
    const min = Math.min(...v)
    const max = Math.max(...v)
    const range = Math.max(1e-6, max - min)
    const pad = 2
    const innerW = Math.max(1, width - pad * 2)
    const innerH = Math.max(1, height - pad * 2)
    const points = v.map((val, idx) => {
      const x = pad + (innerW * idx) / (v.length - 1)
      const y = pad + innerH - ((val - min) / range) * innerH
      return { x, y }
    })
    const baseY = pad + innerH
    const head = `M ${points[0].x.toFixed(2)} ${baseY.toFixed(2)} L ${points[0].x.toFixed(
      2
    )} ${points[0].y.toFixed(2)}`
    const lines = points
      .slice(1)
      .map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ')
    const tail = `L ${points[points.length - 1].x.toFixed(2)} ${baseY.toFixed(2)} Z`
    return `${head} ${lines} ${tail}`
  }

  function sparklineLastPoint(
    values: number[],
    width: number,
    height: number
  ): { x: number; y: number } {
    const v = (values ?? []).filter((n) => Number.isFinite(n)) as number[]
    if (v.length < 2) return { x: 0, y: 0 }
    const min = Math.min(...v)
    const max = Math.max(...v)
    const range = Math.max(1e-6, max - min)
    const pad = 2
    const innerW = Math.max(1, width - pad * 2)
    const innerH = Math.max(1, height - pad * 2)
    const idx = v.length - 1
    const x = pad + (innerW * idx) / (v.length - 1)
    const y = pad + innerH - ((v[idx] - min) / range) * innerH
    return { x, y }
  }

  function sparkLineClass(dir: 'up' | 'down' | 'flat') {
    if (dir === 'up') return 'is-spark-up'
    if (dir === 'down') return 'is-spark-down'
    return 'is-spark-flat'
  }

  function countryFlag(code: string) {
    const c = String(code ?? '').toUpperCase()
    const map: Record<string, string> = {
      US: '🇺🇸',
      CA: '🇨🇦',
      GB: '🇬🇧',
      UK: '🇬🇧',
      AU: '🇦🇺',
      NZ: '🇳🇿',
      JP: '🇯🇵',
      BR: '🇧🇷'
    }
    return map[c] ?? c
  }
</script>

<style scoped lang="scss">
  .ad-performance-detail-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  .ad-performance-detail-tab__toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    padding: 0 4px;
  }

  .ad-performance-detail-tab__hint {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .ad-performance-detail-card {
    background: color-mix(in srgb, var(--default-box-color) 92%, transparent);
    border: 1px solid color-mix(in srgb, var(--default-border) 75%, transparent);
    border-radius: 12px;

    :deep(.el-card__header) {
      padding-bottom: 0;
      font-size: 14px;
      font-weight: 800;
      color: var(--el-text-color-primary);
      border-bottom: none;
    }

    :deep(.el-card__body) {
      padding-top: 12px;
    }
  }

  .ad-performance-detail-country {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ad-performance-detail-country__row {
    display: grid;
    grid-template-columns: 160px minmax(0, 1fr) 220px;
    gap: 12px;
    align-items: center;
    min-width: 0;
  }

  .ad-performance-detail-country__left {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    min-width: 0;
  }

  .ad-performance-detail-country__flag {
    font-size: 16px;
    line-height: 1;
  }

  .ad-performance-detail-country__name {
    overflow: hidden;
    font-size: 13px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ad-performance-detail-country__bar-bg {
    height: 10px;
    overflow: hidden;
    background: color-mix(in srgb, var(--default-border) 65%, transparent);
    border-radius: 9999px;
  }

  .ad-performance-detail-country__bar-fill {
    height: 100%;
    background: var(--art-success);
    border-radius: 9999px;
  }

  .ad-performance-detail-country__right {
    display: inline-flex;
    gap: 10px;
    align-items: baseline;
    justify-content: flex-end;
    min-width: 0;
  }

  .ad-performance-detail-country__spend {
    min-width: 70px;
    font-size: 13px;
    font-weight: 800;
    color: var(--art-success);
    text-align: right;
  }

  .ad-performance-detail-country__percent {
    min-width: 40px;
    font-size: 13px;
    font-weight: 800;
    color: var(--el-text-color-primary);
    text-align: right;
  }

  .ad-performance-detail-country__cpi {
    min-width: 80px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: right;
  }

  .ad-performance-detail-table {
    :deep(.el-table) {
      background: transparent;
    }
  }

  .ad-performance-detail-market__country {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  .ad-performance-detail-market__flag {
    font-size: 16px;
  }

  .ad-performance-detail-market__name {
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  .ad-performance-detail-market__trend {
    font-size: 12px;
    font-weight: 800;
  }

  .ad-performance-detail-market__spark {
    width: 64px;
    height: 20px;
    overflow: visible;
  }

  .ad-performance-detail-market__spark-line {
    opacity: 0.95;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.2;
  }

  .ad-performance-detail-market__spark-area {
    opacity: 0.9;
  }

  .ad-performance-detail-market__spark-dot {
    opacity: 0.95;
  }

  .is-spark-up {
    stroke: var(--art-success);
  }

  .is-spark-down {
    stroke: var(--art-danger);
  }

  .is-spark-flat {
    stroke: var(--el-text-color-secondary);
  }

  .ad-performance-detail-market__spark-area.is-spark-up {
    fill: url('#spark-up');
    stroke: none;
  }

  .ad-performance-detail-market__spark-area.is-spark-down {
    fill: url('#spark-down');
    stroke: none;
  }

  .ad-performance-detail-market__spark-area.is-spark-flat {
    fill: url('#spark-flat');
    stroke: none;
  }

  .ad-performance-detail-market__spark-dot.is-spark-up {
    fill: var(--art-success);
    stroke: var(--default-box-color);
    stroke-width: 1.2;
  }

  .ad-performance-detail-market__spark-dot.is-spark-down {
    fill: var(--art-danger);
    stroke: var(--default-box-color);
    stroke-width: 1.2;
  }

  .ad-performance-detail-market__spark-dot.is-spark-flat {
    fill: var(--el-text-color-secondary);
    stroke: var(--default-box-color);
    stroke-width: 1.2;
  }

  .is-roi-up {
    font-weight: 700;
    color: var(--art-success);
  }

  .is-roi-down {
    font-weight: 700;
    color: var(--art-warning);
  }

  .is-profit-up {
    font-weight: 800;
    color: var(--art-success);
  }

  .is-profit-down {
    font-weight: 800;
    color: var(--art-danger);
  }

  .ad-performance-detail-insight {
    border-color: color-mix(in srgb, var(--art-success) 25%, var(--default-border));
  }

  .ad-performance-detail-insight__text {
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-primary);
  }

  @media (width <= 1200px) {
    .ad-performance-detail-country__row {
      grid-template-columns: 140px minmax(0, 1fr) 180px;
    }
  }
</style>
