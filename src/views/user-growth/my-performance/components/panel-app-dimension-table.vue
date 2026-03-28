<template>
  <div class="panel">
    <ElSkeleton :loading="loading" animated>
      <template #template>
        <div class="panel__header">
          <ElSkeletonItem variant="text" class="app-table-sk-title" />
        </div>
        <div class="panel__body">
          <div class="table-scroll app-table-sk">
            <div class="app-table-sk-toolbar">
              <ElSkeletonItem v-for="c in 10" :key="c" variant="text" class="app-table-sk-th" />
            </div>
            <div v-for="r in 6" :key="r" class="app-table-sk-row">
              <ElSkeletonItem variant="text" class="app-table-sk-cell app-table-sk-cell--app" />
              <ElSkeletonItem v-for="c in 9" :key="c" variant="text" class="app-table-sk-cell" />
            </div>
            <div class="app-table-sk-summary">
              <ElSkeletonItem variant="text" class="app-table-sk-sum-line" />
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <div class="panel__header">
          <div class="header-left">
            <span class="title">{{ title }}</span>
            <span v-if="headerHint" class="header-hint">{{ headerHint }}</span>
          </div>
        </div>

        <div class="panel__body">
          <div class="table-scroll">
            <ElTable
              :data="tableData"
              row-key="id"
              :tree-props="{ children: 'children' }"
              :default-expand-all="false"
              :expand-row-keys="expandedRowKeys"
              :row-style="getRowStyle"
              :cell-style="getCellStyle"
              stripe
              size="default"
              class="mp-detail-table"
              table-layout="fixed"
              :header-cell-style="{ fontWeight: 600 }"
            >
              <ElTableColumn :label="colApp" min-width="220" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="name-cell">
                    <span
                      v-if="row.type === 'app' && row.__appId"
                      class="app-dot"
                      :class="'app-dot--' + appDotFromAppId(row.__appId)"
                    ></span>
                    <span class="name" :class="'is-' + row.type" :style="getNameStyle(row)">{{
                      row.name
                    }}</span>
                  </span>
                </template>
              </ElTableColumn>

              <ElTableColumn :label="colPlatform" width="90" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row.platform" class="dim dim--platform">{{ row.platform }}</span>
                  <span v-else>--</span>
                </template>
              </ElTableColumn>

              <ElTableColumn :label="colSource" width="110" show-overflow-tooltip>
                <template #default="{ row }">
                  <span
                    v-if="row.type === 'source'"
                    class="dim dim--source"
                    :style="getSourceTextStyle(row)"
                  >
                    {{ row.name }}
                  </span>
                  <span
                    v-else-if="row.type === 'app'"
                    class="dim dim--source"
                    :style="getSourceTextStyle(row)"
                    >全部</span
                  >
                  <span v-else>--</span>
                </template>
              </ElTableColumn>

              <ElTableColumn :label="colWindow" width="70" show-overflow-tooltip>
                <template #default="{ row }">
                  {{ row.windowLabel ?? (row.type === 'app' ? '--' : '--') }}
                </template>
              </ElTableColumn>

              <ElTableColumn :label="colReachRate" width="80" align="right">
                <template #default="{ row }">{{ fmtNum(row.reachRate, '%') }}</template>
              </ElTableColumn>

              <ElTableColumn :label="colMinRate" width="80" align="right">
                <template #default="{ row }">{{ fmtNum(row.minRate, '%') }}</template>
              </ElTableColumn>

              <ElTableColumn :label="colDeviationCoef" width="90" align="right">
                <template #default="{ row }">{{ fmtNum(row.deviationCoef) }}</template>
              </ElTableColumn>

              <ElTableColumn :label="colMinProfit" width="110" align="right">
                <template #default="{ row }">{{ fmtMoney(row.minProfit) }}</template>
              </ElTableColumn>

              <ElTableColumn :label="colAdSpend" width="110" align="right">
                <template #default="{ row }">
                  <span class="ad-spend">{{ fmtMoney(row.adSpend) }}</span>
                </template>
              </ElTableColumn>

              <ElTableColumn :label="colCalculatedSpend" width="110" align="right">
                <template #default="{ row }">{{ fmtMoney(row.calculatedSpend) }}</template>
              </ElTableColumn>

              <ElTableColumn :label="colRoi" width="80" align="right">
                <template #default="{ row }">
                  <span
                    v-if="row.roi != null"
                    class="roi-pill"
                    :class="roiClass(row.roi)"
                    :style="getRoiPillStyle(row)"
                  >
                    {{ row.roi }}%
                  </span>
                  <span v-else>--</span>
                </template>
              </ElTableColumn>

              <ElTableColumn :label="colCommissionSpend" width="110" align="right">
                <template #default="{ row }">{{ fmtMoney(row.commissionSpend) }}</template>
              </ElTableColumn>

              <ElTableColumn :label="colEstimatedProfit" width="120" align="right">
                <template #default="{ row }">
                  <span
                    v-if="row.estimatedProfit != null"
                    :class="profitClass(row.estimatedProfit)"
                  >
                    {{ fmtSignedMoney(row.estimatedProfit) }}
                  </span>
                  <span v-else>--</span>
                </template>
              </ElTableColumn>

              <ElTableColumn :label="colCpa" width="90" align="right">
                <template #default="{ row }">{{
                  row.cpa != null ? '$' + row.cpa.toFixed(2) : '--'
                }}</template>
              </ElTableColumn>

              <ElTableColumn :label="colScore" width="80" align="right">
                <template #default="{ row }">
                  <span v-if="row.score != null" class="score">{{ row.score }}分</span>
                  <span v-else>--</span>
                </template>
              </ElTableColumn>

              <ElTableColumn :label="colStatus" width="90" show-overflow-tooltip>
                <template #default="{ row }">
                  <span
                    v-if="row.type === 'source' && row.status"
                    class="status-pill"
                    :class="'is-' + row.status"
                    :style="getStatusPillStyle(row)"
                  >
                    {{ row.statusText }}
                  </span>
                  <span v-else>--</span>
                </template>
              </ElTableColumn>
            </ElTable>

            <div class="summary-footer">
              <div class="summary-footer__label">合计/均值：</div>
              <div class="summary-footer__items">
                <div class="sf-item">
                  <span class="sf-k">基础系数</span>
                  <span class="sf-v">--</span>
                </div>
                <div class="sf-item">
                  <span class="sf-k">广告支出</span>
                  <span class="sf-v is-primary">{{ money(summary.adSpend) }}</span>
                </div>
                <div class="sf-item">
                  <span class="sf-k">预算</span>
                  <span class="sf-v is-info">{{ money(summary.calculatedSpend) }}</span>
                </div>
                <div class="sf-item">
                  <span class="sf-k">平均ROI</span>
                  <span class="sf-v is-warning">{{ summary.roi }}%</span>
                </div>
                <div class="sf-item">
                  <span class="sf-k">代投消耗</span>
                  <span class="sf-v is-info">{{ money(summary.commissionSpend) }}</span>
                </div>
                <div class="sf-item">
                  <span class="sf-k">预估利润</span>
                  <span class="sf-v" :class="profitClass(summary.estimatedProfit)">{{
                    signedMoney(summary.estimatedProfit)
                  }}</span>
                </div>
                <div class="sf-item">
                  <span class="sf-k">平均CPA</span>
                  <span class="sf-v">{{ '$' + summary.cpa.toFixed(2) }}</span>
                </div>
                <div class="sf-item">
                  <span class="sf-k">绩效分数</span>
                  <span class="sf-v is-strong">{{ summary.score }}分</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </ElSkeleton>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useSettingStore } from '@/store/modules/setting'
  import type { MyPerformanceAppTableSummary, MyPerformanceAppTreeRow } from '../types'

  defineOptions({ name: 'MyPerformancePanelAppDimensionTable' })

  const settingStore = useSettingStore()
  const { isDark } = storeToRefs(settingStore)

  const props = withDefaults(
    defineProps<{
      loading?: boolean
      title: string
      list: MyPerformanceAppTreeRow[]
      summary: MyPerformanceAppTableSummary
      headerHint?: string
      colApp?: string
      colPlatform?: string
      colSource?: string
      colWindow?: string
      colReachRate?: string
      colMinRate?: string
      colDeviationCoef?: string
      colMinProfit?: string
      colAdSpend?: string
      colCalculatedSpend?: string
      colRoi?: string
      colCommissionSpend?: string
      colEstimatedProfit?: string
      colCpa?: string
      colScore?: string
      colStatus?: string
    }>(),
    {
      loading: false,
      colApp: '应用',
      colPlatform: '平台',
      colSource: '广告平台',
      colWindow: '天数',
      colReachRate: '达标要求',
      colMinRate: '最低要求',
      colDeviationCoef: '违度系数',
      colMinProfit: '最低利润',
      colAdSpend: '广告支出',
      colCalculatedSpend: '预算',
      colRoi: 'ROI',
      colCommissionSpend: '代投消耗',
      colEstimatedProfit: '预估利润',
      colCpa: 'CPA',
      colScore: '分数',
      colStatus: '状态'
    }
  )

  const headerHint = computed(() => props.headerHint)
  const colApp = computed(() => props.colApp)
  const colPlatform = computed(() => props.colPlatform)
  const colSource = computed(() => props.colSource)
  const colWindow = computed(() => props.colWindow)
  const colReachRate = computed(() => props.colReachRate)
  const colMinRate = computed(() => props.colMinRate)
  const colDeviationCoef = computed(() => props.colDeviationCoef)
  const colMinProfit = computed(() => props.colMinProfit)
  const colAdSpend = computed(() => props.colAdSpend)
  const colCalculatedSpend = computed(() => props.colCalculatedSpend)
  const colRoi = computed(() => props.colRoi)
  const colCommissionSpend = computed(() => props.colCommissionSpend)
  const colEstimatedProfit = computed(() => props.colEstimatedProfit)
  const colCpa = computed(() => props.colCpa)
  const colScore = computed(() => props.colScore)
  const colStatus = computed(() => props.colStatus)

  type TableRowWithMeta = MyPerformanceAppTreeRow & { __appId?: string }

  const tableData = computed(() => attachAppMeta(props.list))

  const expandedRowKeys = computed(() => {
    const rows = tableData.value ?? []
    const appWithChildren = rows.filter((r) => r.type === 'app' && r.children?.length)
    const collapseCount = Math.min(2, Math.max(1, appWithChildren.length ? 2 : 0))
    const collapsed = new Set(appWithChildren.slice(-collapseCount).map((r) => r.id))
    return appWithChildren.filter((r) => !collapsed.has(r.id)).map((r) => r.id)
  })

  /**
   * 基色调色板：保持稳定且“随机感”
   * 仅用透明度区分层级与深浅，避免过度花哨
   */
  const BASE_RGB_COLORS = [
    { r: 64, g: 158, b: 255 }, // 蓝
    { r: 103, g: 194, b: 58 }, // 绿
    { r: 230, g: 162, b: 60 }, // 橙
    { r: 245, g: 108, b: 108 }, // 红
    { r: 144, g: 147, b: 153 }, // 灰
    { r: 114, g: 46, b: 209 } // 紫
  ]

  const ROW_BG_ALPHA_LIGHT = 0.12
  const ROW_BG_ALPHA_DARK = 0.18
  const NAME_TEXT_ALPHA_LIGHT = 0.92
  const NAME_TEXT_ALPHA_DARK = 0.9

  function getRowBgAlpha() {
    return isDark.value ? ROW_BG_ALPHA_DARK : ROW_BG_ALPHA_LIGHT
  }

  function getNameTextAlpha() {
    return isDark.value ? NAME_TEXT_ALPHA_DARK : NAME_TEXT_ALPHA_LIGHT
  }

  function hashStringToIndex(input: string, mod: number) {
    let h = 5381
    for (let i = 0; i < input.length; i++) {
      h = (h * 33) ^ input.charCodeAt(i)
    }
    return Math.abs(h) % mod
  }

  function hashToUnit(input: string) {
    // 0 ~ 1
    const idx = hashStringToIndex(input, 10000)
    return idx / 9999
  }

  function randRange(input: string, min: number, max: number) {
    const u = hashToUnit(input)
    return min + (max - min) * u
  }

  function pickMin(list: Array<number | null | undefined>) {
    const nums = list.filter((v): v is number => typeof v === 'number')
    if (!nums.length) return undefined
    return Math.min(...nums)
  }

  function rgba(c: { r: number; g: number; b: number }, a: number) {
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`
  }

  function getBaseColor(appId: string) {
    const base = BASE_RGB_COLORS[hashStringToIndex(appId, BASE_RGB_COLORS.length)]
    return base ?? BASE_RGB_COLORS[0]
  }

  function attachAppMeta(
    rows: MyPerformanceAppTreeRow[],
    currentAppId?: string
  ): TableRowWithMeta[] {
    return (rows ?? []).map((row) => {
      const appId = row.type === 'app' ? row.id : currentAppId
      const next: TableRowWithMeta = { ...(row as TableRowWithMeta), __appId: appId }
      if (row.children?.length) {
        next.children = attachAppMeta(row.children, appId)
      }

      if (next.type === 'app' && next.children?.length) {
        const children = next.children

        const adSpendSum = sum(children.map((c) => c.adSpend))
        const calculatedSum = sum(children.map((c) => c.calculatedSpend))
        const commissionSum = sum(children.map((c) => c.commissionSpend))
        const estimatedProfitSum = sum(children.map((c) => c.estimatedProfit))

        const totalAdSpend = adSpendSum ?? 0
        const weightedRoi: number | undefined =
          totalAdSpend > 0
            ? Math.round(
                children.reduce((acc, c) => acc + (c.roi ?? 0) * (c.adSpend ?? 0), 0) / totalAdSpend
              )
            : undefined

        const avgCpa = average(children.map((c) => c.cpa))
        const avgScore = average(children.map((c) => c.score))
        const avgReachRate = average(children.map((c) => c.reachRate))
        const avgMinRate = average(children.map((c) => c.minRate))
        const avgCoef = average(children.map((c) => c.deviationCoef))
        const minMinProfit = pickMin(children.map((c) => c.minProfit))

        next.adSpend = adSpendSum || undefined
        next.calculatedSpend = calculatedSum || undefined
        next.commissionSpend = commissionSum || undefined
        next.estimatedProfit = estimatedProfitSum || undefined
        next.roi = weightedRoi
        next.cpa = avgCpa ?? undefined
        next.score = avgScore != null ? Math.round(avgScore) : undefined
        next.reachRate = avgReachRate != null ? Math.round(avgReachRate) : undefined
        next.minRate = avgMinRate != null ? Math.round(avgMinRate) : undefined
        next.deviationCoef = avgCoef != null ? Math.round(avgCoef * 10) / 10 : undefined
        next.minProfit = minMinProfit
      }

      if (next.type === 'app' && (!next.children || next.children.length === 0)) {
        // 没有子级时，为了展示效果生成稳定随机值
        const seed = next.id || next.name
        next.platform = '安卓'
        next.windowLabel = '--'

        const reach = Math.round(randRange(seed + ':reach', 50, 100))
        const min = Math.max(0, Math.min(reach, Math.round(randRange(seed + ':min', 45, 98))))
        const coef = Math.round(randRange(seed + ':coef', 7, 15)) / 10

        const adSpend = Math.round(randRange(seed + ':adSpend', 1200, 46000) / 10) * 10
        const calculated = Math.round(adSpend * randRange(seed + ':calcRate', 0.75, 0.98))
        const commission = Math.round(adSpend * randRange(seed + ':commissionRate', 0.05, 0.18))
        const estimated = Math.round(randRange(seed + ':profit', -500, 4500))
        const cpa = Math.round(randRange(seed + ':cpa', 0.5, 3.2) * 100) / 100
        const score = Math.round(randRange(seed + ':score', 0, 30))
        const minProfit = Math.round(randRange(seed + ':minProfit', 0, 50000) / 100) * 100

        next.reachRate = reach
        next.minRate = min
        next.deviationCoef = coef
        next.minProfit = minProfit || undefined
        next.adSpend = adSpend
        next.calculatedSpend = calculated
        next.roi = Math.round(randRange(seed + ':roi', 50, 99))
        next.commissionSpend = commission
        next.estimatedProfit = estimated
        next.cpa = cpa
        next.score = score
      }

      return next
    })
  }

  function sum(list: Array<number | null | undefined>): number {
    let total = 0
    for (const v of list) total += typeof v === 'number' ? v : 0
    return total
  }

  function average(list: Array<number | null | undefined>): number | undefined {
    const nums = list.filter((v): v is number => typeof v === 'number')
    if (!nums.length) return undefined
    let total = 0
    for (const n of nums) total += n
    return total / nums.length
  }

  function getRowStyle({ row }: { row: TableRowWithMeta }) {
    if (!row.__appId) return {}
    const base = getBaseColor(row.__appId)
    return { backgroundColor: rgba(base, getRowBgAlpha()) }
  }

  function getCellStyle({ row }: { row: TableRowWithMeta }) {
    // stripe 的底色在 td 上，用 cell-style 才能稳定覆盖
    return getRowStyle({ row })
  }

  function getNameStyle(row: TableRowWithMeta) {
    if (!row.__appId) return {}
    const base = getBaseColor(row.__appId)
    return { color: rgba(base, getNameTextAlpha()), fontWeight: row.type === 'source' ? 600 : 700 }
  }

  function getRoiPillStyle(row: TableRowWithMeta) {
    if (!row.__appId) return {}
    const base = getBaseColor(row.__appId)
    const roi = row.roi
    const tone = typeof roi === 'number' ? roiClass(roi) : ''

    // 同一色系：根据 ROI 档位只调透明度与边框强度
    const bgAlpha = tone === 'is-good' ? 0.18 : tone === 'is-mid' ? 0.14 : 0.1
    const borderAlpha = tone === 'is-good' ? 0.32 : tone === 'is-mid' ? 0.26 : 0.2
    const textAlpha = 0.95

    return {
      background: rgba(base, bgAlpha),
      borderColor: rgba(base, borderAlpha),
      color: rgba(base, textAlpha)
    }
  }

  function getSourceTextStyle(row: TableRowWithMeta) {
    if (!row.__appId) return {}
    const base = getBaseColor(row.__appId)
    return { color: rgba(base, 0.92) }
  }

  function getStatusPillStyle(row: TableRowWithMeta) {
    if (!row.__appId) return {}
    const base = getBaseColor(row.__appId)
    const status = row.status

    const bgAlpha = status === 'running' ? 0.18 : status === 'warning' ? 0.14 : 0.1
    const borderAlpha = status === 'running' ? 0.32 : status === 'warning' ? 0.26 : 0.2
    const textAlpha = 0.95

    return {
      background: rgba(base, bgAlpha),
      borderColor: rgba(base, borderAlpha),
      color: rgba(base, textAlpha)
    }
  }

  function money(n: number) {
    return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  function signedMoney(n: number) {
    const s = money(Math.abs(n))
    return (n >= 0 ? '+' : '-') + s
  }

  function roiClass(roi: number) {
    if (roi >= 90) return 'is-good'
    if (roi >= 80) return 'is-mid'
    return 'is-bad'
  }

  function profitClass(p: number) {
    return p >= 0 ? 'is-profit' : 'is-loss'
  }

  function appDotFromAppId(appId: string) {
    const id = (appId || '').toLowerCase()
    if (id.includes('weather')) return 'weather'
    if (id.includes('phone')) return 'phone'
    if (id.includes('blood')) return 'blood'
    return 'default'
  }

  function fmtNum(v?: number, suffix = '') {
    if (v == null) return '--'
    return String(v) + suffix
  }

  function fmtMoney(v?: number) {
    if (v == null) return '--'
    return money(v)
  }

  function fmtSignedMoney(v?: number) {
    if (v == null) return '--'
    return signedMoney(v)
  }
</script>

<style scoped lang="scss">
  @import '../styles/mp-card-fx';

  .panel {
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(16px) saturate(1.08);
    border: 1px solid rgb(63 63 70 / 42%);
    border-radius: 16px;

    @include mp-neon-stack;
    @include mp-card-mesh;
    @include mp-panel-hover-lift;
    @include mp-panel-header-title-hover;

    &::before {
      position: absolute;
      top: -40%;
      left: 50%;
      z-index: 0;
      width: 80%;
      height: 85%;
      pointer-events: none;
      content: '';
      background: radial-gradient(ellipse at center, rgb(99 102 241 / 9%) 0%, transparent 68%);
      transform: translateX(-50%);
      animation: app-table-aurora 12s ease-in-out infinite alternate;
    }
  }

  .app-table-sk-title {
    width: 32% !important;
    height: 16px !important;
  }

  .app-table-sk {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 280px;
    padding: 4px 2px 8px;
  }

  .app-table-sk-toolbar {
    display: grid;
    grid-template-columns: 2.2fr repeat(9, 1fr);
    gap: 8px;
    padding-bottom: 8px;
    margin-bottom: 4px;
    border-bottom: 1px solid rgb(63 63 70 / 25%);
  }

  .app-table-sk-th {
    width: 100% !important;
    height: 12px !important;
  }

  .app-table-sk-row {
    display: grid;
    grid-template-columns: 2.2fr repeat(9, 1fr);
    gap: 8px;
    align-items: center;
    padding: 8px 4px;
    border-radius: 8px;
  }

  .app-table-sk-cell {
    width: 100% !important;
    height: 14px !important;
  }

  .app-table-sk-cell--app {
    width: 88% !important;
  }

  .app-table-sk-summary {
    padding-top: 10px;
    margin-top: 6px;
    border-top: 1px solid rgb(63 63 70 / 25%);
  }

  .app-table-sk-sum-line {
    width: 72% !important;
    height: 16px !important;
  }

  @keyframes app-table-aurora {
    0% {
      opacity: 0.35;
      transform: translateX(-50%) translateY(0);
    }

    100% {
      opacity: 0.85;
      transform: translateX(-48%) translateY(4%);
    }
  }

  .panel__header {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-start;
    padding: 12px 16px;
    border-bottom: 1px solid rgb(63 63 70 / 30%);
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
    min-width: 0;
  }

  .title {
    font-size: 14px;

    @include mp-title-gradient;
  }

  .header-hint {
    min-width: 0;
    overflow: hidden;
    font-size: 12px;
    color: var(--text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .panel__body {
    position: relative;
    z-index: 1;
    padding: 12px 14px 16px;
  }

  .table-scroll {
    position: relative;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    :deep(.el-table) {
      min-width: 980px;
    }
  }

  .summary-footer {
    position: sticky;
    bottom: 0;
    z-index: 3;
    display: flex;
    gap: 10px;
    align-items: center;
    min-width: 980px;
    padding: 12px 14px;
    margin-top: 10px;
    overflow: hidden;
    background: linear-gradient(
      90deg,
      rgb(24 24 27 / 92%) 0%,
      rgb(39 39 42 / 88%) 25%,
      rgb(30 58 138 / 18%) 50%,
      rgb(39 39 42 / 88%) 75%,
      rgb(24 24 27 / 92%) 100%
    );
    background-size: 200% 100%;
    backdrop-filter: blur(12px);
    border: 1px solid rgb(63 63 70 / 45%);
    border-radius: 12px;
    box-shadow:
      0 -4px 20px rgb(0 0 0 / 25%),
      0 0 40px rgb(59 130 246 / 6%),
      inset 0 1px 0 rgb(244 244 245 / 5%);
    animation: summary-sheen 6s ease-in-out infinite;

    &::before {
      position: absolute;
      inset: 0;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        105deg,
        transparent 40%,
        rgb(34 211 238 / 6%) 50%,
        transparent 60%
      );
      animation: summary-glint 4s ease-in-out infinite;
    }
  }

  @keyframes summary-sheen {
    0%,
    100% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }
  }

  @keyframes summary-glint {
    0%,
    100% {
      opacity: 0;
      transform: translateX(-30%);
    }

    50% {
      opacity: 1;
      transform: translateX(30%);
    }
  }

  .summary-footer__label {
    position: relative;
    z-index: 1;
    flex: none;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-primary);
    text-shadow: 0 0 10px rgb(244 244 245 / 18%);
  }

  .summary-footer__items {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    align-items: center;
    min-width: 0;
  }

  .sf-item {
    display: inline-flex;
    gap: 8px;
    align-items: baseline;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .sf-k {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .sf-v {
    font-size: 13px;
    font-weight: 700;
    color: rgb(244 244 245 / 92%);
  }

  .sf-v.is-primary {
    color: rgb(96 165 250 / 98%);
    text-shadow: 0 0 10px rgb(59 130 246 / 25%);
  }

  .sf-v.is-info {
    color: rgb(34 211 238 / 95%);
    text-shadow: 0 0 10px rgb(34 211 238 / 25%);
  }

  .sf-v.is-warning {
    color: rgb(249 115 22 / 98%);
    text-shadow: 0 0 10px rgb(249 115 22 / 25%);
  }

  .sf-v.is-strong {
    color: rgb(244 244 245);
    text-shadow: 0 0 10px rgb(244 244 245 / 20%);
  }

  .mp-detail-table {
    font-size: 14px;
    transition:
      filter 0.45s var(--ease-out),
      transform 0.45s var(--ease-out);
    transform-origin: top center;

    --el-table-border-color: var(--el-border-color-lighter);
    --el-table-header-bg-color: var(--el-fill-color-light);

    :deep(.el-table__cell .cell) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :deep(.el-table__row) {
      transition:
        background-color 0.25s var(--ease-out),
        box-shadow 0.25s var(--ease-out);
    }

    :deep(.el-table__row:hover > td) {
      background-color: rgb(39 39 42 / 45%) !important;
      box-shadow: inset 0 0 0 1px rgb(59 130 246 / 12%);
    }

    :deep(.el-table__row:hover > td:first-child) {
      box-shadow:
        inset 0 0 0 1px rgb(59 130 246 / 12%),
        inset 3px 0 12px rgb(59 130 246 / 6%);
    }
  }

  .panel:hover .mp-detail-table {
    filter: brightness(1.04) drop-shadow(0 6px 24px rgb(59 130 246 / 6%));
    transform: translateY(-2px);
  }

  html.dark .mp-detail-table {
    --el-table-border-color: rgb(63 63 70 / 40%);
    --el-table-header-bg-color: rgb(24 24 27 / 70%);
    --el-table-header-text-color: #fff;

    :deep(.el-table__header-wrapper th),
    :deep(.el-table__header-wrapper th .cell) {
      color: #fff;
    }

    :deep(.el-table__header-wrapper) {
      backdrop-filter: blur(4px);
    }
  }

  .app-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 8px;
    vertical-align: middle;
    border-radius: 4px;
    transition:
      box-shadow var(--duration-fast) var(--ease-default),
      transform var(--duration-fast) var(--ease-default);

    &.app-dot--weather {
      background: linear-gradient(135deg, #93c5fd, #60a5fa);
      box-shadow: 0 0 8px rgb(96 165 250 / 35%);
    }

    &.app-dot--phone {
      background: linear-gradient(135deg, #86efac, #22c55e);
      box-shadow: 0 0 8px rgb(34 197 94 / 35%);
    }

    &.app-dot--blood {
      background: linear-gradient(135deg, #f87171, #ef4444);
      box-shadow: 0 0 8px rgb(239 68 68 / 35%);
    }

    &.app-dot--default {
      background: rgb(161 161 170 / 45%);
      box-shadow: 0 0 6px rgb(161 161 170 / 15%);
    }
  }

  .roi-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 54px;
    height: 22px;
    padding: 0 8px;
    font-size: 12px;
    font-weight: 750;
    font-variant-numeric: tabular-nums;
    line-height: 22px;
    border: 1px solid transparent;
    border-radius: 9999px;
    transition:
      box-shadow 0.25s var(--ease-out),
      transform 0.2s var(--ease-out);

    &:hover {
      transform: scale(1.06);
    }

    &.is-good {
      box-shadow:
        0 0 10px rgb(16 185 129 / 28%),
        0 0 20px rgb(16 185 129 / 12%);
      animation: pill-neon-green 2.6s ease-in-out infinite;
    }

    &.is-mid {
      box-shadow:
        0 0 10px rgb(245 158 11 / 22%),
        0 0 20px rgb(245 158 11 / 8%);
      animation: pill-neon-amber 2.8s ease-in-out infinite;
    }

    &.is-bad {
      box-shadow:
        0 0 10px rgb(244 63 94 / 22%),
        0 0 20px rgb(244 63 94 / 8%);
      animation: pill-neon-rose 3s ease-in-out infinite;
    }
  }

  @keyframes pill-neon-green {
    0%,
    100% {
      box-shadow:
        0 0 8px rgb(16 185 129 / 22%),
        0 0 18px rgb(16 185 129 / 8%);
    }

    50% {
      box-shadow:
        0 0 14px rgb(16 185 129 / 38%),
        0 0 28px rgb(16 185 129 / 14%);
    }
  }

  @keyframes pill-neon-amber {
    0%,
    100% {
      box-shadow:
        0 0 8px rgb(245 158 11 / 18%),
        0 0 16px rgb(245 158 11 / 6%);
    }

    50% {
      box-shadow:
        0 0 14px rgb(245 158 11 / 32%),
        0 0 26px rgb(245 158 11 / 10%);
    }
  }

  @keyframes pill-neon-rose {
    0%,
    100% {
      box-shadow:
        0 0 8px rgb(244 63 94 / 18%),
        0 0 16px rgb(244 63 94 / 6%);
    }

    50% {
      box-shadow:
        0 0 14px rgb(244 63 94 / 32%),
        0 0 26px rgb(244 63 94 / 10%);
    }
  }

  .ad-spend {
    font-weight: 850;
    font-variant-numeric: tabular-nums;
    color: rgb(56 189 248 / 98%);
    text-shadow: 0 0 8px rgb(56 189 248 / 20%);
  }

  .is-profit {
    color: var(--art-success);
    text-shadow: 0 0 6px rgb(16 185 129 / 20%);
  }

  .is-loss {
    color: var(--art-danger);
    text-shadow: 0 0 6px rgb(239 68 68 / 20%);
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 22px;
    padding: 0 10px;
    font-size: 12px;
    font-weight: 700;
    line-height: 22px;
    white-space: nowrap;
    border: 1px solid transparent;
    border-radius: 9999px;
    transition:
      box-shadow var(--duration-fast) var(--ease-default),
      transform var(--duration-fast) var(--ease-default);

    &:hover {
      transform: scale(1.05);
    }
  }

  .name-cell {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dim {
    font-size: 12px;
    color: rgb(244 244 245 / 70%);
  }

  .score {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: rgb(148 163 184 / 95%);
    text-shadow: 0 0 6px rgb(148 163 184 / 15%);
  }

  @media (prefers-reduced-motion: reduce) {
    .panel {
      transition: none;
    }

    .panel:hover {
      transform: none;
    }

    .panel:hover .panel__header .title {
      filter: none;
      transform: none;
    }

    .panel:hover .mp-detail-table {
      filter: none;
      transform: none;
    }

    .mp-detail-table {
      transition: none;
    }

    .panel::before {
      animation: none;
    }

    .panel::after {
      opacity: 0.12;
    }

    .summary-footer,
    .summary-footer::before {
      animation: none;
    }

    .roi-pill.is-good,
    .roi-pill.is-mid,
    .roi-pill.is-bad {
      animation: none;
    }
  }
</style>
