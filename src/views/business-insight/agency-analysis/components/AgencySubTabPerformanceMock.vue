<script setup lang="ts">
  defineOptions({ name: 'AgencySubTabPerformanceMock' })

  import type {
    AgencySubTabAccountSummaryPayload,
    AgencySubTabKpiPayload,
    AgencySubTabRecentSummaryPayload,
    AgencySubTabKpiMetricItem
  } from '@/views/business-insight/agency-analysis/types'
  import { computed, ref, watch } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { ElAlert, ElSkeleton } from 'element-plus'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'
  import { formatYYYYMMDD, getAppTodayYYYYMMDD } from '@/utils/app-now'

  const props = defineProps<{
    loading?: boolean
    error?: boolean
    /** 父组件提供的“当前日期”展示文案（如 4月18日）；用于避免固定写死日期 */
    currentDayLabel?: string
    /** 当前子 Tab key：gatherone / kuainiao / chuhai（汇总页不会渲染本组件） */
    agencyTab?: 'summary' | 'gatherone' | 'kuainiao' | 'chuhai'
    /** 与汇总页应用筛选同源（值域与 meta 下拉一致） */
    filterAppId?: string | string[]
    /** 用于初始化「账户汇总」独立日期区间（默认对齐汇总草稿区间） */
    defaultAccountRange?: [string, string]
    kpiLast7?: AgencySubTabKpiPayload | null
    kpiDay?: AgencySubTabKpiPayload | null
    recentSummary?: AgencySubTabRecentSummaryPayload | null
    accountSummary?: AgencySubTabAccountSummaryPayload | null
  }>()

  const emit = defineEmits<{
    (e: 'accountSummarySearch', payload: { startDate: string; endDate: string }): void
  }>()

  function ymdToLocalDate(ymd: string): Date {
    const [y, m, d] = ymd.split('-').map((x) => parseInt(x, 10))
    return new Date(y, m - 1, d)
  }

  function addDaysYmd(ymd: string, delta: number): string {
    const d = ymdToLocalDate(ymd)
    d.setDate(d.getDate() + delta)
    return formatYYYYMMDD(d)
  }

  const _today = getAppTodayYYYYMMDD()
  const accountRangeDraft = ref<[string, string]>([addDaysYmd(_today, -6), _today])
  const accountSummaryQuerying = ref(false)

  watch(
    () => [props.defaultAccountRange, props.agencyTab] as const,
    ([range]) => {
      if (range && range[0] && range[1]) {
        accountRangeDraft.value = [range[0], range[1]]
      }
    },
    { immediate: true }
  )

  watch(
    () => props.accountSummary,
    () => {
      accountSummaryQuerying.value = false
    }
  )

  watch(
    () => props.error,
    (v) => {
      if (v) accountSummaryQuerying.value = false
    }
  )

  function handleAccountSummaryQuery() {
    const r = accountRangeDraft.value
    if (!r?.[0] || !r?.[1]) return
    accountSummaryQuerying.value = true
    emit('accountSummarySearch', { startDate: r[0], endDate: r[1] })
  }

  const METRIC_LABELS = [
    '广告支出',
    '首日ROI',
    'CPA',
    '代投买量用户数',
    '在投应用数',
    '广告账户数',
    '广告系列数',
    '广告组数',
    '投放国家数',
    '投放天数'
  ] as const

  const CARD_THEMES = [
    'spend',
    'roi',
    'cpa',
    'install',
    'app',
    'acct',
    'camp',
    'adset',
    'country',
    'days'
  ] as const

  const recentRowsFallback = [
    {
      app: 'FileRecovery',
      platform: '安卓',
      source: 'Facebook',
      accountId: '1196169169136013',
      accountName: 'GO_FB_FR1_ZL_PG03',
      spend: '$218',
      budget: '$196',
      cpa: '-',
      cpi: '0.09',
      installs: '2553',
      roiTrend: ['101%', '95%', '131%']
    },
    {
      app: 'FileRecovery',
      platform: '安卓',
      source: 'Facebook',
      accountId: '1643261666838590',
      accountName: 'GO_FB_FR1_ZL_PG04',
      spend: '$70.4',
      budget: '$56.0',
      cpa: '-',
      cpi: '0.03',
      installs: '2166',
      roiTrend: ['98%', '102%', '128%']
    }
  ] as const

  const accountRowsFallback = [
    {
      app: 'FileRecovery',
      platform: '安卓',
      source: 'Facebook',
      accountId: '1196169169136013',
      accountName: 'GO_FB_FR1_ZL_PG03',
      spend: '$2259',
      roi1: '101%',
      cpa: '-',
      cpi: '0.09',
      installs: '26526'
    },
    {
      app: 'FileRecovery',
      platform: '安卓',
      source: 'Facebook',
      accountId: '1643261666838590',
      accountName: 'GO_FB_FR1_ZL_PG04',
      spend: '$586',
      roi1: '100%',
      cpa: '-',
      cpi: '0.03',
      installs: '21926'
    }
  ] as const

  function sparkPolylinePoints(pts: readonly (readonly [number, number])[]): string {
    return pts.map(([x, y]) => `${x},${y}`).join(' ')
  }

  /** 三个 ROI 文案对应折线上的顶点下标（与 mock 折线形状一致） */
  const SPARK_ROI_LABEL_VERTEX_INDEX: readonly [1, 2, 3] = [1, 2, 3]

  function sparkRoiPoint(
    pts: readonly (readonly [number, number])[],
    labelIndex: number
  ): readonly [number, number] {
    const vi = SPARK_ROI_LABEL_VERTEX_INDEX[labelIndex as 0 | 1 | 2]
    return pts[vi]!
  }

  const KPI_KEYS_ORDER: AgencySubTabKpiMetricItem['key'][] = [
    'spend',
    'roi1',
    'cpa',
    'installs',
    'appCount',
    'accountCount',
    'campaignCount',
    'adsetCount',
    'countryCount',
    'days'
  ]

  function metricValue(
    payload: AgencySubTabKpiPayload | null | undefined,
    key: AgencySubTabKpiMetricItem['key']
  ) {
    const m = payload?.metrics?.find((x) => x.key === key)
    return m?.value ?? '--'
  }

  const last7PeriodLabel = computed(() => props.kpiLast7?.periodLabel ?? '近7天')
  const dayPeriodLabel = computed(
    () => props.currentDayLabel ?? props.kpiDay?.periodLabel ?? '当日'
  )
  const recentRows = computed(() => props.recentSummary?.rows ?? recentRowsFallback)
  const accountRows = computed(() => props.accountSummary?.rows ?? accountRowsFallback)

  function sparkPointsBySource(source: string | undefined, variant: 'a' | 'b') {
    const src = (source ?? '').trim()
    if (variant === 'a') {
      if (src === 'TikTok') {
        return [
          [6, 16],
          [30, 10],
          [54, 14],
          [78, 6],
          [92, 12]
        ] as const
      }
      if (src === 'Google') {
        return [
          [6, 22],
          [30, 18],
          [54, 10],
          [78, 14],
          [92, 8]
        ] as const
      }
      return [
        [4, 18],
        [28, 12],
        [52, 16],
        [76, 8],
        [92, 10]
      ] as const
    }
    if (src === 'TikTok') {
      return [
        [6, 18],
        [34, 8],
        [58, 12],
        [82, 4],
        [92, 10]
      ] as const
    }
    if (src === 'Google') {
      return [
        [6, 12],
        [34, 16],
        [58, 8],
        [82, 12],
        [92, 6]
      ] as const
    }
    return [
      [4, 20],
      [32, 10],
      [56, 14],
      [80, 6],
      [92, 12]
    ] as const
  }

  function sparkPointsForRecentRow(source: string | undefined, rowIndex: number) {
    const variant: 'a' | 'b' = rowIndex % 2 === 0 ? 'a' : 'b'
    return sparkPointsBySource(source, variant)
  }

  function safeRoiTrendLabels(labels: unknown): string[] {
    if (!Array.isArray(labels)) return []
    return labels
      .map((x) => String(x ?? ''))
      .filter((s) => s.trim())
      .slice(0, 3)
  }
</script>

<template>
  <div class="aa-sub-mock">
    <ElAlert
      v-if="error"
      type="error"
      show-icon
      :closable="false"
      title="子 Tab 数据加载失败"
      class="aa-sub-mock__alert"
    />

    <!-- 近7天 KPI 行 -->
    <div class="aa-sub-mock__toolbar">
      <span class="aa-sub-mock__period">{{ last7PeriodLabel }}</span>
    </div>
    <div class="aa-sub-mock__kpi-grid">
      <template v-if="loading">
        <div v-for="n in METRIC_LABELS.length" :key="`r7-sk-${n}`" class="aa-sub-mock__kpi-card">
          <ElSkeleton animated :rows="1" />
        </div>
      </template>
      <template v-else>
        <div
          v-for="(label, i) in METRIC_LABELS"
          :key="`r7-${label}`"
          class="aa-sub-mock__kpi-card"
          :class="`aa-sub-mock__kpi-card--${CARD_THEMES[i]}`"
        >
          <div class="aa-sub-mock__kpi-label">{{ label }}</div>
          <div class="aa-sub-mock__kpi-value">{{
            metricValue(props.kpiLast7, KPI_KEYS_ORDER[i])
          }}</div>
        </div>
      </template>
    </div>

    <!-- 单日 KPI 行 -->
    <div class="aa-sub-mock__toolbar aa-sub-mock__toolbar--plain">
      <span class="aa-sub-mock__period">{{ dayPeriodLabel }}</span>
    </div>
    <div class="aa-sub-mock__kpi-grid">
      <template v-if="loading">
        <div v-for="n in METRIC_LABELS.length" :key="`d-sk-${n}`" class="aa-sub-mock__kpi-card">
          <ElSkeleton animated :rows="1" />
        </div>
      </template>
      <template v-else>
        <div
          v-for="(label, i) in METRIC_LABELS"
          :key="`d-${label}`"
          class="aa-sub-mock__kpi-card"
          :class="`aa-sub-mock__kpi-card--${CARD_THEMES[i]}`"
        >
          <div class="aa-sub-mock__kpi-label">{{ label }}</div>
          <div class="aa-sub-mock__kpi-value">{{
            metricValue(props.kpiDay, KPI_KEYS_ORDER[i])
          }}</div>
        </div>
      </template>
    </div>

    <!-- 近期汇总 -->
    <section class="aa-sub-mock__section">
      <div class="aa-sub-mock__section-head aa-sub-mock__section-head--start">
        <div class="aa-sub-mock__section-head-main">
          <span class="aa-sub-mock__section-icon" aria-hidden="true">▤</span>
          <h3 class="aa-sub-mock__section-title">近期汇总</h3>
        </div>
      </div>
      <div class="aa-sub-mock__table-scroll">
        <table class="aa-sub-mock__table">
          <thead>
            <tr>
              <th>应用</th>
              <th>平台</th>
              <th>广告平台</th>
              <th colspan="2">广告账户</th>
              <th class="text-right">广告支出</th>
              <th class="text-right">预算</th>
              <th class="text-right">CPA</th>
              <th class="text-right">CPI</th>
              <th class="text-right">代投买量用户数</th>
              <th>首日ROI趋势</th>
            </tr>
            <tr class="aa-sub-mock__subhead">
              <th colspan="3"></th>
              <th>ID</th>
              <th>名称</th>
              <th colspan="5"></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!recentRows.length">
              <td colspan="11" class="aa-sub-mock__merge-cell">暂无数据</td>
            </tr>
            <tr v-for="(row, idx) in recentRows" :key="`${row.accountId}-${idx}`">
              <template v-if="idx === 0">
                <td :rowspan="recentRows.length" class="aa-sub-mock__merge-cell">{{ row.app }}</td>
                <td :rowspan="recentRows.length" class="aa-sub-mock__merge-cell">{{
                  row.platform
                }}</td>
                <td :rowspan="recentRows.length" class="aa-sub-mock__merge-cell">{{
                  row.source
                }}</td>
              </template>
              <td class="aa-sub-mock__mono">{{ row.accountId }}</td>
              <td>{{ row.accountName }}</td>
              <td class="text-right fw-600">{{ row.spend }}</td>
              <td class="text-right">{{ row.budget }}</td>
              <td class="text-right">{{ row.cpa }}</td>
              <td class="text-right">{{ row.cpi }}</td>
              <td class="text-right">{{ row.installs }}</td>
              <td class="aa-sub-mock__td-spark">
                <div
                  v-if="safeRoiTrendLabels(row.roiTrend).length"
                  class="aa-sub-mock__spark"
                  role="img"
                  :aria-label="`ROI 趋势 ${safeRoiTrendLabels(row.roiTrend).join(',')}`"
                >
                  <svg
                    class="aa-sub-mock__spark-svg"
                    viewBox="0 -24 96 50"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <polyline
                      fill="none"
                      stroke="#34d399"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      :points="sparkPolylinePoints(sparkPointsForRecentRow(row.source, idx))"
                    />
                    <circle
                      v-for="(pt, i) in sparkPointsForRecentRow(row.source, idx)"
                      :key="`s-${idx}-${i}`"
                      :cx="pt[0]"
                      :cy="pt[1]"
                      r="2.75"
                      class="aa-sub-mock__spark-dot"
                    />
                    <g
                      v-for="(label, labelIdx) in safeRoiTrendLabels(row.roiTrend)"
                      :key="`tip-${idx}-${labelIdx}`"
                      class="aa-sub-mock__spark-tip"
                      :transform="`translate(${sparkRoiPoint(sparkPointsForRecentRow(row.source, idx), labelIdx)[0]}, ${sparkRoiPoint(sparkPointsForRecentRow(row.source, idx), labelIdx)[1]})`"
                    >
                      <rect
                        x="-15"
                        y="-20"
                        width="30"
                        height="12"
                        rx="4"
                        class="aa-sub-mock__spark-tip-bg"
                      />
                      <text x="0" y="-11" text-anchor="middle" class="aa-sub-mock__spark-label">
                        {{ label }}
                      </text>
                    </g>
                  </svg>
                </div>
                <span v-else>—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 账户汇总 -->
    <section class="aa-sub-mock__section">
      <div class="aa-sub-mock__section-head">
        <div class="aa-sub-mock__section-head-main">
          <span class="aa-sub-mock__section-icon" aria-hidden="true">▤</span>
          <h3 class="aa-sub-mock__section-title">账户汇总</h3>
        </div>
        <div class="aa-sub-mock__section-actions" aria-label="账户汇总查询">
          <AppDatePicker
            v-model="accountRangeDraft"
            :shortcuts="dateRangeShortcuts"
            type="daterange"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            range-separator="~"
            start-placeholder="开始"
            end-placeholder="结束"
            size="small"
            class="aa-sub-mock__acct-range"
            popper-class="aa-agency-filter-popper"
            unlink-panels
          />
          <el-button
            type="primary"
            plain
            size="small"
            class="aa-sub-mock__acct-query"
            :loading="accountSummaryQuerying"
            @click="handleAccountSummaryQuery"
          >
            查询
          </el-button>
        </div>
      </div>
      <div class="aa-sub-mock__table-scroll">
        <table class="aa-sub-mock__table">
          <thead>
            <tr>
              <th>应用</th>
              <th>平台</th>
              <th>广告平台</th>
              <th>账户ID</th>
              <th>账户名称</th>
              <th class="text-right">广告支出</th>
              <th class="text-right">首日ROI</th>
              <th class="text-right">CPA</th>
              <th class="text-right">CPI</th>
              <th class="text-right">代投买量用户数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!accountRows.length">
              <td colspan="10" class="aa-sub-mock__merge-cell">暂无数据</td>
            </tr>
            <tr v-for="(row, idx) in accountRows" :key="`${row.accountId}-${idx}`">
              <template v-if="idx === 0">
                <td :rowspan="accountRows.length" class="aa-sub-mock__merge-cell">{{ row.app }}</td>
                <td :rowspan="accountRows.length" class="aa-sub-mock__merge-cell">{{
                  row.platform
                }}</td>
                <td :rowspan="accountRows.length" class="aa-sub-mock__merge-cell">{{
                  row.source
                }}</td>
              </template>
              <td class="aa-sub-mock__mono">{{ row.accountId }}</td>
              <td>{{ row.accountName }}</td>
              <td class="text-right fw-600">{{ row.spend }}</td>
              <td class="text-right">{{ row.roi1 }}</td>
              <td class="text-right">{{ row.cpa }}</td>
              <td class="text-right">{{ row.cpi }}</td>
              <td class="text-right">{{ row.installs }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
  $card: #11161f;
  $border: #1e3a5f;
  $text: #e2e8f0;
  $muted: #94a3b8;

  .aa-sub-mock {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    padding-bottom: 8px;
    font-size: 13px;
    color: $text;
  }

  .aa-sub-mock__alert {
    margin: 2px 0 6px;
  }

  .aa-sub-mock__kpi-card :deep(.el-skeleton) {
    --el-skeleton-color: rgb(148 163 184 / 12%);
    --el-skeleton-to-color: rgb(148 163 184 / 22%);
  }

  .aa-sub-mock__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    min-height: 28px;
  }

  .aa-sub-mock__toolbar--plain {
    margin-top: 4px;
  }

  .aa-sub-mock__period {
    font-size: 14px;
    font-weight: 600;
    color: $muted;
    letter-spacing: 0.02em;
  }

  .aa-sub-mock__kpi-grid {
    display: grid;
    grid-template-columns: repeat(10, minmax(0, 1fr));
    gap: 10px;
    width: 100%;
  }

  @media (width <= 1400px) {
    .aa-sub-mock__kpi-grid {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
  }

  @media (width <= 720px) {
    .aa-sub-mock__kpi-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .aa-sub-mock__kpi-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 0;
    min-height: 88px;
    padding: 12px 8px;
    overflow: hidden;
    text-align: center;
    background: $card;
    isolation: isolate;
    border: 1px solid rgb(30 58 95 / 55%);
    border-radius: 12px;
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 4%);
    transition:
      transform 0.22s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      box-shadow 0.28s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color 0.22s ease;

    &::before {
      position: absolute;
      inset: -1px;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(ellipse 80% 60% at 10% 15%, rgb(59 130 246 / 16%), transparent 55%),
        radial-gradient(ellipse 70% 55% at 90% 80%, rgb(16 185 129 / 14%), transparent 58%),
        radial-gradient(ellipse 70% 55% at 50% 120%, rgb(168 85 247 / 10%), transparent 60%);
      opacity: 0.85;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(186 230 253 / 5%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 5%) 1px, transparent 1px);
      background-size: 20px 20px;
      opacity: 0.55;
      mask-image: radial-gradient(circle at 50% 35%, black 0%, transparent 62%);
    }

    &:hover {
      border-color: rgb(96 165 250 / 45%);
      box-shadow:
        0 12px 38px rgb(0 0 0 / 42%),
        0 0 0 1px rgb(96 165 250 / 16%),
        inset 0 1px 0 rgb(255 255 255 / 6%),
        0 0 28px rgb(59 130 246 / 10%);
      transform: translateY(-2px);
    }
  }

  .aa-sub-mock__kpi-card--spend {
    border-color: rgb(59 130 246 / 35%);
  }

  .aa-sub-mock__kpi-card--roi {
    border-color: rgb(16 185 129 / 38%);
  }

  .aa-sub-mock__kpi-card--cpa {
    border-color: rgb(245 158 11 / 35%);
  }

  .aa-sub-mock__kpi-card--install {
    border-color: rgb(6 182 212 / 35%);
  }

  .aa-sub-mock__kpi-label {
    position: relative;
    z-index: 1;
    margin-bottom: 8px;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.25;
    color: $muted;
  }

  .aa-sub-mock__kpi-value {
    position: relative;
    z-index: 1;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.1;
    color: $text;
    text-shadow: 0 6px 18px rgb(0 0 0 / 45%);
    letter-spacing: -0.02em;
  }

  .aa-sub-mock__section {
    position: relative;
    padding: 14px 16px 16px;
    overflow: visible;
    background: rgb(13 24 41 / 92%);
    isolation: isolate;
    border: 1px solid $border;
    border-radius: 14px;
    box-shadow:
      0 10px 34px rgb(0 0 0 / 38%),
      inset 0 1px 0 rgb(186 230 253 / 7%);
    transition:
      transform 0.22s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      box-shadow 0.3s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color 0.22s ease;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(ellipse 85% 60% at 14% 12%, rgb(16 185 129 / 10%), transparent 60%),
        radial-gradient(ellipse 70% 55% at 90% 0%, rgb(59 130 246 / 10%), transparent 62%),
        linear-gradient(180deg, rgb(255 255 255 / 4%), transparent 38%);
      opacity: 0.95;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        radial-gradient(circle, rgb(6 182 212 / 8%) 1px, transparent 1px),
        linear-gradient(rgb(186 230 253 / 5%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 5%) 1px, transparent 1px);
      background-size:
        80px 80px,
        26px 26px,
        26px 26px;
      opacity: 0.35;
      mask-image: radial-gradient(circle at 50% 0%, black 0%, transparent 62%);
    }

    &:hover {
      border-color: rgb(96 165 250 / 35%);
      box-shadow:
        0 14px 44px rgb(0 0 0 / 44%),
        0 0 0 1px rgb(96 165 250 / 12%),
        inset 0 1px 0 rgb(186 230 253 / 10%),
        0 0 44px rgb(59 130 246 / 10%);
      transform: translateY(-1px);
    }
  }

  .aa-sub-mock__section-head {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .aa-sub-mock__section-head--start {
    justify-content: flex-start;
  }

  .aa-sub-mock__section-head-main {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .aa-sub-mock__section-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
  }

  .aa-sub-mock__acct-range {
    width: min(360px, 100%);
  }

  .aa-sub-mock__acct-range :deep(.el-input__wrapper) {
    background: rgb(8 17 30 / 55%);
    box-shadow: 0 0 0 1px rgb(30 58 95 / 55%) inset;
  }

  .aa-sub-mock__acct-query {
    border-radius: 999px;
  }

  .aa-sub-mock__section-icon {
    font-size: 14px;
    color: rgb(52 211 153 / 85%);
  }

  .aa-sub-mock__section-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: $text;
    text-align: left;
    letter-spacing: 0.02em;
    background-image: linear-gradient(
      90deg,
      rgb(226 232 240 / 92%) 0%,
      rgb(59 130 246 / 85%) 45%,
      rgb(16 185 129 / 85%) 100%
    );
    background-repeat: no-repeat;
    -webkit-background-clip: text;
    background-clip: text;
    background-size: 100% 100%;
    -webkit-text-fill-color: transparent;
  }

  .aa-sub-mock__table-scroll {
    position: relative;
    z-index: 1;
    width: 100%;
    overflow: auto visible;
    -webkit-overflow-scrolling: touch;
  }

  .aa-sub-mock__table {
    width: 100%;
    min-width: 980px;
    overflow: visible;
    border-collapse: collapse;

    th,
    td {
      padding: 9px 10px;
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid rgb(15 28 46 / 90%);
    }

    thead tr:first-child th {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      background: rgb(10 20 34 / 95%);
    }

    .aa-sub-mock__subhead th {
      padding-top: 4px;
      padding-bottom: 6px;
      font-size: 11px;
      font-weight: 500;
      color: #64748b;
      background: rgb(10 20 34 / 95%);
      border-bottom: 1px solid $border;
    }

    tbody td {
      font-size: 12px;
      color: $muted;
    }

    tbody tr {
      overflow: visible;
    }

    tbody tr:hover td {
      background: rgb(17 31 53 / 55%);
    }

    td.aa-sub-mock__td-spark {
      min-height: 72px;
      padding-top: 14px;
      padding-bottom: 14px;
      overflow: visible;
      vertical-align: middle;
    }

    td.aa-sub-mock__merge-cell {
      color: $text;
      text-align: center;
      vertical-align: middle;
      background: rgb(9 18 32 / 88%);
      border-right: 1px solid rgb(30 58 95 / 45%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .aa-sub-mock__kpi-card,
    .aa-sub-mock__section {
      transition: none;
    }

    .aa-sub-mock__kpi-card:hover,
    .aa-sub-mock__section:hover {
      transform: none;
    }
  }

  .aa-sub-mock__mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    color: #cbd5e1;
  }

  .text-right {
    text-align: right;
  }

  .fw-600 {
    font-weight: 600;
    color: $text;
  }

  .aa-sub-mock__spark {
    display: block;
    min-width: 120px;
    pointer-events: none;
  }

  .aa-sub-mock__spark-svg {
    display: block;
    width: 100%;
    max-width: 148px;
    height: 52px;
    min-height: 52px;
    pointer-events: none;
  }

  .aa-sub-mock__spark-dot {
    pointer-events: none;
    fill: #34d399;
    stroke: #0b1220;
    stroke-width: 1;
  }

  .aa-sub-mock__spark-tip {
    pointer-events: none;
  }

  .aa-sub-mock__spark-tip-bg {
    pointer-events: none;
    fill: rgb(6 78 59 / 92%);
    stroke: rgb(52 211 153 / 48%);
    stroke-width: 1;
  }

  .aa-sub-mock__spark-label {
    font-size: 6.5px;
    font-weight: 700;
    pointer-events: none;
    fill: #ecfdf5;
  }
</style>
