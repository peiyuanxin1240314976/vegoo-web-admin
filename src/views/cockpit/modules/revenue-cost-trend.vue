<template>
  <div class="channel-roi-panel">
    <div class="channel-roi-border-spin" aria-hidden="true" />
    <div class="panel-header">
      <span class="panel-title">广告平台ROI&买量用户</span>
      <!-- <a class="panel-more" href="javascript:;">查看更多</a> -->
    </div>
    <div class="panel-body">
      <template v-if="list.length">
        <ArtTable
          :data="list"
          :columns="roiColumns"
          size="small"
          height="100%"
          show-summary
          :summary-method="getSummaries"
          class="roi-table"
        >
          <template #channel="{ row }">
            <div class="col-channel">
              <div
                v-for="ico in [channelIconDisplay(row)]"
                :key="(ico.iconClass ?? '') + ico.letter"
                class="channel-icon"
                :class="{ 'channel-icon--iconfont': ico.iconClass }"
                :title="row.channel"
              >
                <i
                  v-if="ico.iconClass"
                  class="iconfont"
                  :class="ico.iconClass"
                  aria-hidden="true"
                />
                <span v-else class="channel-icon-fallback">{{ ico.letter }}</span>
              </div>
              <span class="channel-name">{{ row.channel }}</span>
            </div>
          </template>
          <template #spend="{ row }">
            <div class="cell-metric cell-metric--inline">
              <span class="col-number tabular-nums">{{ formatMoney(row.spend) }}</span>
              <span
                v-if="
                  row.spendChange != null &&
                  Number.isFinite(row.spendChange) &&
                  row.spendChange !== 0
                "
                class="cell-delta tabular-nums"
                :class="row.spendChange > 0 ? 'delta-up' : 'delta-down'"
              >
                {{ row.spendChange > 0 ? '↑' : '↓' }}{{ formatMoneyAbs(row.spendChange) }}
              </span>
            </div>
          </template>
          <template #installs="{ row }">
            <div class="cell-metric cell-metric--inline">
              <span class="col-number tabular-nums">{{ formatNumber(row.installs) }}</span>
              <span
                v-if="
                  row.installsChange != null &&
                  Number.isFinite(row.installsChange) &&
                  row.installsChange !== 0
                "
                class="cell-delta tabular-nums"
                :class="row.installsChange > 0 ? 'delta-up' : 'delta-down'"
              >
                {{ row.installsChange > 0 ? '↑' : '↓' }}{{ formatIntAbs(row.installsChange) }}
              </span>
            </div>
          </template>
          <template #roi="{ row }">
            <div class="cell-metric cell-metric--inline">
              <span class="col-number tabular-nums">{{ formatRoi(row.roi) }}</span>
              <span
                v-if="
                  row.roiChange != null && Number.isFinite(row.roiChange) && row.roiChange !== 0
                "
                class="cell-delta tabular-nums"
                :class="row.roiChange > 0 ? 'delta-up' : 'delta-down'"
              >
                {{ row.roiChange > 0 ? '↑' : '↓' }}{{ formatRoiAbs(row.roiChange) }}
              </span>
            </div>
          </template>
          <template #cpi="{ row }">
            <span class="col-cpi tabular-nums" :class="getCpiClass(row.cpi)">{{
              row.cpi.toFixed(2)
            }}</span>
          </template>
        </ArtTable>
      </template>
      <div v-else class="roi-empty">暂无数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useMediaQuery } from '@vueuse/core'
  import { getAdPlatformIconDisplay } from '@/utils/ui/ad-platform-iconfont'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import type { ColumnOption } from '@/types'
  import type { CockpitChannelRoiInstallItem } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  const num = (v: unknown) => (v != null && Number.isFinite(Number(v)) ? Number(v) : 0)

  /**
   * 统一表格行：兼容已 map 的项，以及接口 { channel, list[] }（list 为近 7 日，含 install/cost/cpl/cpi）
   */
  function normalizeChannelRoiRows(raw: unknown[]): CockpitChannelRoiInstallItem[] {
    if (!raw.length) return []
    return raw.map((item) => {
      const r = item as Record<string, unknown>
      const list =
        (r.list as { install?: unknown; cost?: unknown; cpl?: unknown; roi?: unknown }[]) ?? []
      const first = list[0] ?? {}
      const platformRaw = r.platform
      const platform =
        platformRaw != null && String(platformRaw).trim() !== ''
          ? String(platformRaw).trim()
          : undefined
      return {
        channel: String(r.channel ?? '—'),
        platform,
        spend: num(r.spend ?? r.cost ?? first.cost),
        spendChange: Number.isFinite(num(r.spendChange ?? r.costChange))
          ? num(r.spendChange ?? r.costChange)
          : undefined,
        installs: num(r.installs ?? r.install ?? first.install),
        installsChange: Number.isFinite(num(r.installsChange ?? r.installChange))
          ? num(r.installsChange ?? r.installChange)
          : undefined,
        roi: num(r.roi ?? first.roi),
        roiChange: Number.isFinite(num(r.roiChange)) ? num(r.roiChange) : undefined,
        cpi: num(r.cpi ?? r.cpl ?? first.cpl)
      }
    })
  }

  defineOptions({ name: 'CockpitChannelRoiInstall' })
  /** 与驾驶舱 md 栅格断点一致：窄屏列宽收紧（见下方 @media 样式取消固定高度） */
  const isNarrowViewport = useMediaQuery('(max-width: 992px)')

  /** ArtTable 列配置（窄屏略收紧 minWidth，减轻横向挤压） */
  const roiColumns = computed((): ColumnOption<CockpitChannelRoiInstallItem>[] => {
    const narrow = isNarrowViewport.value
    const baseWidth = narrow ? 78 : 120
    return [
      { prop: 'channel', label: '广告平台', minWidth: baseWidth, useSlot: true },
      { prop: 'roi', label: 'ROI', minWidth: baseWidth, align: 'left', useSlot: true },
      {
        prop: 'installs',
        label: '买量用户',
        minWidth: baseWidth,
        align: 'left',
        useSlot: true
      },
      { prop: 'spend', label: '广告支出', minWidth: baseWidth, align: 'left', useSlot: true },

      { prop: 'cpi', label: 'CPI', minWidth: baseWidth, align: 'left', useSlot: true }
    ]
  })

  const props = withDefaults(defineProps<{ list?: CockpitChannelRoiInstallItem[] | null }>(), {
    list: null
  })

  const list = computed((): CockpitChannelRoiInstallItem[] => {
    const raw = Array.isArray(props.list)
      ? props.list
      : (MOCK_COCKPIT_OVERVIEW.channelRoiInstall ?? [])
    return normalizeChannelRoiRows(raw as unknown[])
  })

  function channelIconDisplay(row: CockpitChannelRoiInstallItem) {
    return getAdPlatformIconDisplay({ platform: row.platform, name: row.channel })
  }

  const totals = computed(() => {
    const rows = list.value
    const spend = rows.reduce((s: number, r: CockpitChannelRoiInstallItem) => s + r.spend, 0)
    const installs = rows.reduce((s: number, r: CockpitChannelRoiInstallItem) => s + r.installs, 0)
    const cpi = spend > 0 ? spend / installs : 0
    return { spend, installs, cpi }
  })

  /** CPI 三档：绿(<1.0) / 黄(1.0~1.3) / 红(>=1.3) */
  const CPI_GREEN_MAX = 1.0
  const CPI_YELLOW_MAX = 1.3
  function getCpiClass(cpi: number): 'cpi-green' | 'cpi-yellow' | 'cpi-red' {
    if (cpi < CPI_GREEN_MAX) return 'cpi-green'
    if (cpi < CPI_YELLOW_MAX) return 'cpi-yellow'
    return 'cpi-red'
  }

  function formatMoney(n: number): string {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function formatNumber(n: number): string {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  function formatMoneyAbs(n: number): string {
    return formatMoney(Math.abs(n))
  }

  function formatIntAbs(n: number): string {
    const v = Math.abs(n)
    return Number.isFinite(v) ? Math.round(v).toLocaleString('en-US') : '0'
  }

  function formatRoi(roi: number): string {
    if (!Number.isFinite(roi) || roi <= 0) return '—'
    const pct = roi * 100
    return pct.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
  }

  function formatRoiAbs(roi: number): string {
    const v = Math.abs(roi)
    if (!Number.isFinite(v)) return '0.00%'
    const pct = v * 100
    return pct.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
  }

  /** ElTable 合计行（按列 prop 动态映射，避免列顺序调整后错位） */
  function getSummaries(params: { columns: Array<{ property?: string }> }): string[] {
    const t = totals.value
    return params.columns.map((col, index) => {
      const prop = col.property
      if (index === 0 || prop === 'channel') return '合计'
      if (prop === 'spend') return formatMoney(t.spend)
      if (prop === 'installs') return formatNumber(t.installs)
      if (prop === 'roi') return '—'
      if (prop === 'cpi') return '$' + t.cpi.toFixed(2)
      return ''
    })
  }
</script>

<style scoped lang="scss">
  /* 与广告成效 KPI 卡片同系：旋转渐变边框 */
  @property --channel-roi-border-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  .channel-roi-panel {
    --ch-accent: #10b981;
    --ch-accent-2: #22d3ee;
    --ch-glow: rgb(16 185 129 / 28%);
    --ch-glow-2: rgb(34 211 238 / 14%);
    --ch-spin-a: rgb(16 185 129 / 42%);
    --ch-spin-b: rgb(34 211 238 / 34%);
    --ch-spin-c: rgb(59 130 246 / 24%);
    --ch-table-bg: color-mix(in srgb, var(--ch-accent) 4%, rgb(7 12 22));
    --ch-table-bg-soft: rgb(10 20 34 / 76%);
    --ch-table-header-text: rgb(176 216 224 / 78%);
    --ch-table-text: #e2e8f0;
    --ch-table-muted: rgb(226 232 240 / 82%);
    --ch-table-line: rgb(125 211 252 / 10%);
    --ch-table-line-strong: rgb(45 212 191 / 16%);
    --ch-table-hover: rgb(16 185 129 / 8%);
    --ch-table-summary: rgb(20 34 48 / 88%);

    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background-color: rgb(6 12 22 / 96%);
    background-image:
      radial-gradient(
        ellipse 120% 80% at 50% -18%,
        var(--ch-glow) 0%,
        var(--ch-glow-2) 30%,
        transparent 58%
      ),
      linear-gradient(
        172deg,
        color-mix(in srgb, var(--ch-accent) 10%, rgb(6 12 22)) 0%,
        color-mix(in srgb, var(--ch-accent) 14%, rgb(6 12 22)) 54%,
        color-mix(in srgb, var(--ch-accent-2) 10%, rgb(6 12 22)) 100%
      );
    border: 1px solid color-mix(in srgb, var(--ch-accent-2) 28%, transparent);
    border-radius: 18px;
    box-shadow:
      0 18px 44px rgb(2 8 23 / 40%),
      0 0 0 1px color-mix(in srgb, var(--ch-accent) 10%, transparent),
      inset 0 1px 0 rgb(255 255 255 / 9%),
      inset 0 0 0 1px rgb(255 255 255 / 2%),
      inset 0 18px 36px rgb(16 185 129 / 4%);
    transition:
      box-shadow 0.4s var(--ease-out),
      border-color 0.28s var(--ease-default);

    > *:not(.channel-roi-border-spin) {
      position: relative;
      z-index: 1;
    }

    &::before {
      position: absolute;
      top: 0;
      left: 50%;
      z-index: 0;
      width: 80%;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        var(--ch-accent),
        var(--ch-accent-2),
        transparent
      );
      opacity: 0.56;
      transform: translateX(-50%);
    }

    &::after {
      position: absolute;
      bottom: 0;
      left: 50%;
      z-index: 0;
      width: 60%;
      height: 1px;
      pointer-events: none;
      content: '';
      background: linear-gradient(90deg, transparent, var(--ch-accent), transparent);
      opacity: 0.28;
      transform: translateX(-50%);
    }

    &:hover {
      border-color: color-mix(in srgb, var(--ch-accent-2) 40%, transparent);
      box-shadow:
        0 22px 54px rgb(2 8 23 / 46%),
        0 0 0 1px color-mix(in srgb, var(--ch-accent) 16%, transparent),
        inset 0 1px 0 rgb(255 255 255 / 12%),
        inset 0 18px 42px rgb(34 211 238 / 5%);
    }

    &:active {
      transition-duration: 0.12s;
    }
  }

  .channel-roi-border-spin {
    position: absolute;
    inset: -1px;
    z-index: 2;
    padding: 1px;
    pointer-events: none;
    background: conic-gradient(
      from var(--channel-roi-border-angle, 0deg) at 50% 50%,
      transparent 0deg,
      var(--ch-spin-a) 45deg,
      transparent 95deg,
      transparent 145deg,
      var(--ch-spin-b) 195deg,
      transparent 250deg,
      transparent 300deg,
      var(--ch-spin-c) 340deg,
      transparent 360deg
    );
    filter: blur(0.2px);
    border-radius: inherit;
    opacity: 0.7;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: channel-roi-border-spin 6s linear infinite;

    --channel-roi-border-angle: 0deg;
  }

  @keyframes channel-roi-border-spin {
    to {
      --channel-roi-border-angle: 360deg;
    }
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px 11px;
    font-size: 14px;
    border-bottom: 1px solid color-mix(in srgb, var(--ch-accent-2) 14%, transparent);

    .panel-title {
      font-weight: 700;
      line-height: 1.2;
      color: rgb(221 248 244 / 92%);
      text-shadow: 0 0 18px rgb(45 212 191 / 10%);
      letter-spacing: 0.02em;
    }

    .panel-more {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      text-decoration: none;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .panel-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 10px 12px 14px;
    overflow: auto;
  }

  .roi-empty {
    padding: 32px 16px;
    font-size: 13px;
    color: var(--text-secondary);
    text-align: center;
  }

  .roi-table {
    flex: 1;
    width: 100%;
    min-height: 0;
    font-size: 13px;

    :deep(.el-table) {
      --el-table-bg-color: var(--ch-table-bg);
      --el-table-tr-bg-color: var(--ch-table-bg);
      --el-table-header-bg-color: var(--ch-table-bg);
      --el-table-border-color: var(--ch-table-line);
      --el-table-text-color: var(--ch-table-text);
      --el-table-header-text-color: var(--ch-table-header-text);
    }

    :deep(.el-table::before) {
      background-color: transparent;
    }

    :deep(.el-table th.el-table__cell) {
      height: 38px;
      padding: 0;
      vertical-align: middle;
      background: linear-gradient(180deg, rgb(14 28 44 / 78%), rgb(9 18 32 / 70%));
      border-bottom: 1px solid var(--ch-table-line-strong);
    }

    :deep(.el-table__header th) {
      font-weight: 600;
      letter-spacing: 0.03em;
    }

    :deep(.el-table__header-wrapper .cell) {
      display: flex;
      align-items: center;
      min-height: 38px;
      padding: 0 10px;
      font-size: 12px;
      line-height: 1.2;
      color: var(--ch-table-header-text);
    }

    :deep(.el-table__body tr) {
      transition:
        background-color 0.18s ease,
        box-shadow 0.18s ease;
    }

    :deep(.el-table__body tr:hover > td.el-table__cell) {
      background: linear-gradient(90deg, rgb(16 185 129 / 8%), rgb(34 211 238 / 4%));
    }

    :deep(.el-table__body td.el-table__cell),
    :deep(.el-table__footer td.el-table__cell) {
      height: 42px;
      padding: 0;
      vertical-align: middle;
      border-bottom: 1px solid var(--ch-table-line);
    }

    :deep(.el-table__body td),
    :deep(.el-table__footer td) {
      color: var(--ch-table-text);
    }

    :deep(.el-table__body .cell),
    :deep(.el-table__footer .cell) {
      display: flex;
      align-items: center;
      min-height: 42px;
      padding: 0 10px;
      line-height: 1.2;
    }

    :deep(.el-table__footer .cell) {
      font-weight: 600;
      color: rgb(226 232 240 / 90%);
    }

    :deep(.el-table__footer-wrapper td.el-table__cell) {
      background: linear-gradient(180deg, var(--ch-table-summary), rgb(11 18 30 / 96%)) !important;
      border-top: 1px solid var(--ch-table-line-strong);
      border-bottom: 0;
    }

    .col-channel {
      display: flex;
      gap: 10px;
      align-items: center;
      min-height: 42px;

      .channel-icon {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        overflow: hidden;
        background:
          linear-gradient(180deg, rgb(19 40 56 / 96%), rgb(12 28 42 / 92%)),
          color-mix(in srgb, var(--ch-accent) 18%, rgb(15 23 42));
        border: 1px solid rgb(255 255 255 / 8%);
        border-radius: 8px;
        box-shadow:
          inset 0 1px 0 rgb(255 255 255 / 6%),
          0 0 0 1px rgb(45 212 191 / 6%);

        &--iconfont {
          color: rgb(226 232 240 / 92%);
        }

        & .iconfont {
          font-size: 16px;
          line-height: 1;
        }

        .channel-icon-fallback {
          font-size: 11px;
          font-weight: 700;
          line-height: 1;
          color: rgb(226 232 240 / 92%);
        }
      }

      .channel-name {
        line-height: 1.2;
        color: var(--ch-table-text);
        white-space: nowrap;
      }
    }

    .col-number {
      color: var(--ch-table-muted);
      white-space: nowrap;
    }

    .cell-metric {
      display: flex;
      gap: 8px;
      align-items: center;
      min-height: 42px;
      line-height: 1.1;
    }

    .cell-metric--inline {
      flex-direction: row;
    }

    .cell-delta {
      font-size: 12px;
      font-weight: 600;
      opacity: 0.96;
    }

    .delta-up {
      color: var(--text-success);
    }

    .delta-down {
      color: var(--text-danger);
    }

    .col-cpi {
      &.cpi-green {
        color: var(--text-success);
      }

      &.cpi-yellow {
        color: var(--text-warning);
      }

      &.cpi-red {
        color: var(--text-danger);
      }
    }
  }

  html:not(.dark) .channel-roi-panel {
    --ch-table-bg: #fff;
    --ch-table-header-text: #64748b;
    --ch-table-text: #334155;

    background-color: #fff;
    background-image: none;
    border: 1px solid var(--el-border-color-lighter);
    box-shadow:
      0 8px 24px rgb(15 23 42 / 8%),
      inset 0 1px 0 rgb(255 255 255 / 90%);

    &::before {
      opacity: 0.7;
    }

    &::after {
      opacity: 0.35;
    }

    &:hover {
      border-color: color-mix(in srgb, var(--ch-accent) 45%, var(--el-border-color-lighter));
      box-shadow:
        0 14px 36px rgb(15 23 42 / 12%),
        0 0 0 1px color-mix(in srgb, var(--ch-accent) 22%, transparent);
    }

    .channel-roi-border-spin {
      opacity: 0.45;
    }

    .panel-header {
      border-bottom-color: var(--el-border-color-lighter);

      .panel-title {
        color: #303133;
      }
    }

    .roi-table {
      :deep(.el-table) {
        --el-table-border-color: var(--el-border-color-lighter);
      }

      :deep(.el-table__footer-wrapper td.el-table__cell) {
        border-top-color: var(--el-border-color-lighter);
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .channel-roi-border-spin {
      opacity: 0;
      animation: none;
    }

    .channel-roi-panel {
      transition: none;

      &:hover,
      &:active {
        transform: none;
      }
    }
  }

  /* 窄屏：取消固定表格高度，按内容展开，合计行随页面/面板滚动可见（ArtTable 默认会传 height:100%） */
  @media (width <= 992px) {
    .channel-roi-panel {
      height: auto;
      min-height: 240px;
      overflow: visible;
    }

    .panel-body {
      flex: 0 1 auto;
      overflow: auto visible;
    }

    .roi-table.art-table {
      flex: 0 0 auto;
      height: auto !important;

      :deep(.el-table) {
        height: auto !important;
      }

      :deep(.el-table__inner-wrapper) {
        height: auto !important;
      }

      :deep(.el-table__body-wrapper) {
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
      }

      :deep(.el-scrollbar__wrap) {
        overflow: visible !important;
      }
    }
  }
</style>
