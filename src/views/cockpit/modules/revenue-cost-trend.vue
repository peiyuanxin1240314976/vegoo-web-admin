<template>
  <div class="cockpit-panel channel-roi-panel">
    <div class="panel-header">
      <span class="panel-title">广告平台ROI&安装量</span>
      <a class="panel-more" href="javascript:;">查看更多</a>
    </div>
    <div class="panel-body">
      <template v-if="list.length">
        <ArtTable
          :data="list"
          :columns="roiColumns"
          size="small"
          height="calc(100% + 45px)"
          show-summary
          :summary-method="getSummaries"
          :header-cell-style="{ background: '#131D2F' }"
          class="roi-table"
        >
          <template #channel="{ row }">
            <div class="col-channel">
              <span class="channel-icon" />
              <span class="channel-name">{{ row.channel }}</span>
            </div>
          </template>
          <template #spend="{ row }">
            <span class="col-number">{{ formatMoney(row.spend) }}</span>
          </template>
          <template #installs="{ row }">
            <span class="col-number">{{ formatNumber(row.installs) }}</span>
          </template>
          <template #cpi="{ row }">
            <span class="col-cpi" :class="getCpiClass(row.cpi)">{{ row.cpi.toFixed(2) }}</span>
          </template>
          <template #trend="{ row, $index }">
            <CockpitRoiTrendSpark
              v-if="row.trend?.length"
              :trend="row.trend"
              :line-color="getTrendLineColorByIndex($index)"
            />
          </template>
        </ArtTable>
      </template>
      <div v-else class="roi-empty">暂无数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import CockpitRoiTrendSpark from './cockpit-roi-trend-spark.vue'
  import type { ColumnOption } from '@/types'
  import type { CockpitChannelRoiInstallItem } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  const num = (v: unknown) => (v != null && Number.isFinite(Number(v)) ? Number(v) : 0)

  /**
   * 统一表格行：兼容已 map 的项，以及接口 { channel, list[] }（list 为近 7 日，含 install/cost/cpl/cpi）
   * 迷你图：无 trend 时由 list 近 7 日生成，默认用每日 cost（与「消耗」列一致）
   */
  function normalizeChannelRoiRows(raw: unknown[]): CockpitChannelRoiInstallItem[] {
    if (!raw.length) return []
    return raw.map((item) => {
      const r = item as Record<string, unknown>
      const list = (r.list as { install?: unknown; cost?: unknown; cpl?: unknown }[]) ?? []
      let trend = Array.isArray(r.trend) ? (r.trend as unknown[]).map((x) => num(x)) : []
      if (!trend.length && list.length) {
        trend = list.map((d) => num(d.cost))
      }
      const first = list[0] ?? {}
      return {
        channel: String(r.channel ?? '—'),
        spend: num(r.spend ?? r.cost ?? first.cost),
        installs: num(r.installs ?? r.install ?? first.install),
        cpi: num(r.cpi ?? r.cpl ?? first.cpl),
        trend
      }
    })
  }

  defineOptions({ name: 'CockpitChannelRoiInstall' })
  /** ArtTable 列配置 */
  const roiColumns: ColumnOption<CockpitChannelRoiInstallItem>[] = [
    { prop: 'channel', label: '广告平台', minWidth: 100, useSlot: true },
    { prop: 'spend', label: '消耗', minWidth: 60, align: 'right', useSlot: true },
    { prop: 'installs', label: '安装量', minWidth: 60, align: 'right', useSlot: true },
    { prop: 'cpi', label: 'CPI', width: 50, align: 'right', useSlot: true },
    { prop: 'trend', label: '近7日', width: 80, align: 'center', useSlot: true }
  ]

  const props = withDefaults(defineProps<{ list?: CockpitChannelRoiInstallItem[] | null }>(), {
    list: null
  })

  const list = computed((): CockpitChannelRoiInstallItem[] => {
    const raw = Array.isArray(props.list)
      ? props.list
      : (MOCK_COCKPIT_OVERVIEW.channelRoiInstall ?? [])
    return normalizeChannelRoiRows(raw as unknown[])
  })

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
    return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  function formatNumber(n: number): string {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  /** ElTable 合计行 */
  function getSummaries(): string[] {
    const t = totals.value
    return ['合计', formatMoney(t.spend), formatNumber(t.installs), '$' + t.cpi.toFixed(2), '']
  }

  /** 近 7 日折线：自上而下按行序循环取色（与 CPI 列绿/黄/红无关） */
  const TREND_LINE_PALETTE = [
    '#3B82F6',
    '#10B981',
    '#F97316',
    '#EF4444',
    '#8B5CF6',
    '#06B6D4',
    '#EC4899',
    '#EAB308',
    '#14B8A6',
    '#A855F7'
  ] as const

  function getTrendLineColorByIndex(index: number): string {
    const i = Number.isFinite(index) && index >= 0 ? index : 0
    return TREND_LINE_PALETTE[i % TREND_LINE_PALETTE.length]
  }
</script>

<style scoped lang="scss">
  .channel-roi-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    font-size: 14px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .panel-title {
      font-weight: 500;
      color: var(--el-text-color-primary);
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
    flex: 1;
    padding: 12px 16px;
    overflow: auto;
  }

  .roi-empty {
    padding: 32px 16px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  .roi-table {
    font-size: 13px;

    :deep(.el-table) {
      --el-table-bg-color: #131d2f;
      --el-table-tr-bg-color: #131d2f;
      --el-table-header-bg-color: #131d2f;
      --el-table-border-color: rgb(255 255 255 / 10%);
      --el-table-text-color: #d4e6f5;
      --el-table-header-text-color: #8aaac8;
    }

    :deep(.el-table__header th) {
      font-weight: 500;
      color: #8aaac8;
    }

    :deep(.el-table__body td),
    :deep(.el-table__footer td) {
      color: #d4e6f5;
    }

    :deep(.el-table__footer .cell) {
      font-weight: 500;
    }

    :deep(.el-table__footer-wrapper td.el-table__cell) {
      background: #131d2f !important;
      border-top: 1px solid rgb(255 255 255 / 10%);
    }

    .col-channel {
      display: flex;
      gap: 8px;
      align-items: center;

      .channel-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        background: var(--el-border-color);
        border-radius: 4px;
      }

      .channel-name {
        white-space: nowrap;
      }
    }

    .col-number {
      white-space: nowrap;
    }

    .col-cpi {
      &.cpi-green {
        color: #67c23a;
      }

      &.cpi-yellow {
        color: #e6a23c;
      }

      &.cpi-red {
        color: #f56c6c;
      }
    }
  }
</style>
