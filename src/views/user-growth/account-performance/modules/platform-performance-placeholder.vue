<!-- 我是平台页面 -->
<template>
  <div>
    <div class="ap-table-scroll">
      <div v-if="platformLoading" class="ap-table-skeleton-scroll">
        <ElSkeleton animated :rows="8" />
      </div>

      <template v-else>
        <ArtVirtualTable
          :columns="virtualColumns"
          :data="platformData"
          row-key="id"
          :height-offset="520"
          :min-height="430"
          class="ap-platform-table"
        >
          <template #cell:name="{ row }">
            <div class="ap-platform-name">
              <span
                class="ap-platform-icon"
                :style="{
                  background: row.iconBg,
                  color: row.iconColor,
                  boxShadow: `0 0 0 1px ${row.iconBg}44`
                }"
              >
                {{ row.iconChar }}
              </span>
              <span class="ap-platform-label">{{ row.name }}</span>
            </div>
          </template>

          <template #cell:accountCount="{ row }">
            <span class="ap-account-count">{{ row.accountCount }}个账户</span>
          </template>

          <template #cell:spend="{ row }">{{ formatMoney(row.spend) }}</template>
          <template #cell:budget="{ row }">{{ formatMoney(row.budget) }}</template>

          <template #cell:usageRate="{ row }">
            <div class="ap-usage-cell">
              <ElProgress
                v-if="hasFiniteNumber(row.usageRate)"
                :percentage="Math.min(100, round2Number(row.usageRate) ?? 0)"
                :color="getUsageRateColor(round2Number(row.usageRate) ?? 0)"
                :show-text="false"
                :stroke-width="6"
                class="ap-usage-bar"
              />
              <span
                class="ap-usage-value"
                :style="{
                  color: hasFiniteNumber(row.usageRate)
                    ? getUsageRateColor(round2Number(row.usageRate) ?? 0)
                    : ''
                }"
              >
                {{ formatPercentFixed2OrEmpty(row.usageRate) }}
              </span>
            </div>
          </template>

          <template #cell:cpi="{ row }">{{ formatFixed2OrEmpty(row.cpi) }}</template>
          <template #cell:installs="{ row }">{{ formatNumber(row.installs) }}</template>

          <template #cell:firstThreeDayRoi="{ row }">
            <ElTooltip
              v-if="hasRoiTrend(row.firstThreeDayRoi)"
              placement="top"
              :show-after="100"
              effect="dark"
            >
              <template #content>
                <div class="ap-roi-tooltip">
                  <div
                    v-for="item in roiTooltipItems(row.firstThreeDayRoi)"
                    :key="item.key"
                    class="ap-roi-tooltip-item"
                  >
                    <span>{{ item.date }}</span>
                    <span>{{ item.value }}</span>
                  </div>
                </div>
              </template>

              <div class="ap-roi-trend-cell">
                <svg
                  class="ap-roi-trend-svg"
                  viewBox="0 0 72 24"
                  aria-label="首日ROI趋势"
                  role="img"
                >
                  <polyline
                    :points="roiPolylinePoints(row.firstThreeDayRoi)"
                    class="ap-roi-trend-line"
                  />
                  <circle
                    v-for="point in roiChartPoints(row.firstThreeDayRoi)"
                    :key="point.key"
                    :cx="point.x"
                    :cy="point.y"
                    r="2"
                    class="ap-roi-trend-dot"
                  />
                </svg>
              </div>
            </ElTooltip>
            <span v-else>无数据</span>
          </template>

          <template #cell:roi3="{ row }">
            <span
              v-if="hasFiniteNumber(row.roi3)"
              :class="getRoiClass(round2Number(row.roi3) ?? 0)"
            >
              {{ formatPercentFixed2OrEmpty(row.roi3) }}
            </span>
            <span v-else>无数据</span>
          </template>

          <template #cell:roi7="{ row }">
            <span
              v-if="hasFiniteNumber(row.roi7)"
              :class="getRoiClass(round2Number(row.roi7) ?? 0)"
            >
              {{ formatPercentFixed2OrEmpty(row.roi7) }}
            </span>
            <span v-else>无数据</span>
          </template>

          <template #cell:status="{ row }">
            <span v-if="row.status === 'normal'" class="ap-status ap-status--normal">正常</span>
            <span v-else-if="row.status === 'warning'" class="ap-status ap-status--warning"
              >注意</span
            >
            <span v-else-if="row.status === 'roi_low'" class="ap-status ap-status--roi-low">
              <span class="ap-status-icon">▲</span> ROI偏低
            </span>
            <span v-else>无数据</span>
          </template>

          <template #cell:operation="{ row }">
            <ElButton round link type="primary" size="small" @click="goCampaignDetail(row)">
              详情
            </ElButton>
          </template>
        </ArtVirtualTable>

        <div v-if="!platformData.length" class="ap-table-empty">
          <ElEmpty description="暂无数据" :image-size="120" />
        </div>
      </template>
    </div>

    <!-- 底部汇总 -->
    <div class="ap-table-footer">
      共 {{ platformTotal }} 个广告平台 / {{ accountTotal }} 个广告账户
    </div>

    <ElPagination
      v-if="platformTotal > 0"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="platformTotal"
      :page-sizes="pageSizes"
      layout="prev, pager, next, sizes"
      small
      background
      class="ap-platform-pagination"
      :disabled="platformLoading"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import request from '@/utils/http'
  import { toAppIdsRequestBody } from '@/utils/app-id-request'
  import { ACCOUNT_PERFORMANCE_API_BASE } from '@/views/user-growth/account-performance/config/api-base'
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Vetur 对 <script setup> 的误报：.vue 无 default export
  import ArtVirtualTable from '@/components/core/art-virtual-table/index.vue'
  import type { ArtVirtualTableColumn } from '@/components/core/art-virtual-table/index.vue'

  defineOptions({ name: 'PlatformPerformancePlaceholder' })

  const router = useRouter()

  const props = defineProps<{
    dateRange: [string, string]
    source: string
    selectedAppId: string
    filterOwner: string
    keys: string
  }>()

  /** 平台颜色 & 图标字符配置 */
  const PLATFORM_ICON_MAP: Record<string, { iconBg: string; iconColor: string; iconChar: string }> =
    {
      TikTok: { iconBg: '#010101', iconColor: '#ffffff', iconChar: '♪' },
      Facebook: { iconBg: '#1877f2', iconColor: '#ffffff', iconChar: 'f' },
      Google: { iconBg: '#4285f4', iconColor: '#ffffff', iconChar: 'G' },
      Mintegral: { iconBg: '#7c3aed', iconColor: '#ffffff', iconChar: 'M' },
      Kwai: { iconBg: '#ff6d00', iconColor: '#ffffff', iconChar: 'K' },
      NewsBreak: { iconBg: '#e53e3e', iconColor: '#ffffff', iconChar: 'N' }
    }

  interface PlatformRow {
    id: string
    name: string
    iconBg: string
    iconColor: string
    iconChar: string
    accountCount: number
    spend: number
    budget: number
    usageRate: number
    cpi: number
    installs: number
    firstThreeDayRoi: FirstThreeDayRoi
    roi3: number
    roi7: number
    status: 'normal' | 'warning' | 'roi_low'
  }

  interface FirstThreeDayRoi {
    dates: string[]
    data: (number | null)[]
  }

  function goCampaignDetail(row: PlatformRow) {
    router.push({
      name: 'AdPlatformInfo',
      query: { id: String(row.id) }
    })
  }

  // 接口未返回时不要展示 mock 数据，否则骨架屏会“盖在 mock 上面”
  const platformData = ref<PlatformRow[]>([])
  const platformTotal = ref(0)
  const accountTotal = ref(0)
  const platformLoading = ref(true)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const pageSizes = [10, 20, 50]

  type PlatformApiRow = Omit<PlatformRow, 'iconBg' | 'iconColor' | 'iconChar'> & {
    iconBg?: string
    iconColor?: string
    iconChar?: string
    roi1?: number | null
  }

  function normalizePlatformRow(row: PlatformApiRow): PlatformRow {
    const icon = row.iconBg && row.iconColor && row.iconChar ? row : PLATFORM_ICON_MAP[row.name]
    const roiDates = Array.isArray(row.firstThreeDayRoi?.dates)
      ? row.firstThreeDayRoi.dates.slice(0, 3).map(String)
      : ['2026-04-09', '2026-04-08', '2026-04-07']
    const roiDataIn = Array.isArray(row.firstThreeDayRoi?.data) ? row.firstThreeDayRoi.data : []
    const roiFromSeries: (number | null)[] = [0, 1, 2].map((index) =>
      index < roiDataIn.length ? toFiniteNumber(roiDataIn[index]) : null
    )
    const roi1Fallback = toFiniteNumber(row.roi1)
    const roiData: (number | null)[] =
      roiFromSeries.every((item) => item === null) && roi1Fallback !== null
        ? [roi1Fallback, roiFromSeries[1], roiFromSeries[2]]
        : roiFromSeries
    return {
      ...(row as PlatformRow),
      ...(typeof (icon as any).iconBg === 'string' ? { iconBg: (icon as any).iconBg } : {}),
      ...(typeof (icon as any).iconColor === 'string'
        ? { iconColor: (icon as any).iconColor }
        : {}),
      ...(typeof (icon as any).iconChar === 'string' ? { iconChar: (icon as any).iconChar } : {}),
      firstThreeDayRoi: {
        dates: roiDates.length === 3 ? roiDates : ['2026-04-09', '2026-04-08', '2026-04-07'],
        data: roiData
      }
    }
  }

  let requestSeq = 0
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let suppressPageWatch = false

  const virtualColumns = computed<ArtVirtualTableColumn[]>(() => [
    { key: 'name', title: '广告平台', width: 170, flexGrow: 1 },
    { key: 'accountCount', title: '账户数', width: 96, align: 'center' },
    { key: 'spend', title: '广告支出', width: 106, align: 'center' },
    { key: 'budget', title: '预算', width: 120, align: 'center' },
    { key: 'usageRate', title: '使用率', width: 150, align: 'center' },
    { key: 'cpi', title: 'CPI', width: 90, align: 'center' },
    { key: 'installs', title: '安装数', width: 120, align: 'center' },
    { key: 'firstThreeDayRoi', title: '首日ROI', width: 120, align: 'center' },
    { key: 'roi3', title: '3日ROI', width: 126, align: 'center' },
    { key: 'roi7', title: '7日ROI', width: 126, align: 'center' },
    { key: 'status', title: '状态', width: 70, align: 'center' },
    { key: 'operation', title: '操作', width: 70, align: 'center' }
  ])

  async function loadPlatformPerformance() {
    const [dateStart, dateEnd] = props.dateRange
    if (!dateStart || !dateEnd) return

    const seq = ++requestSeq
    platformLoading.value = true
    platformData.value = []
    /* 同上：勿在请求前将 platformTotal 置 0，否则分页器会把 current-page 打回 1 */

    try {
      const res = await request.post<{
        platformTotal: number
        accountTotal: number
        platforms: PlatformApiRow[]
      }>({
        url: `${ACCOUNT_PERFORMANCE_API_BASE}/platform-performance-placeholder-table`,
        data: {
          /* 与 ElPagination 一致：从 1 开始 */
          currentPage: currentPage.value,
          dateEnd,
          dateStart,
          keys: props.keys.trim(),
          ownerId: props.filterOwner,
          pageSize: pageSize.value,
          appIds: toAppIdsRequestBody(props.selectedAppId),
          source: props.source
        }
      })

      if (seq !== requestSeq) return

      platformTotal.value = typeof res.platformTotal === 'number' ? res.platformTotal : 0
      accountTotal.value = typeof res.accountTotal === 'number' ? res.accountTotal : 0
      platformData.value = Array.isArray(res.platforms)
        ? res.platforms.map((p) => normalizePlatformRow(p))
        : []
    } catch {
      if (seq !== requestSeq) return
      platformTotal.value = 0
      accountTotal.value = 0
      platformData.value = []
    } finally {
      if (seq === requestSeq) platformLoading.value = false
    }
  }

  watch(
    [
      () => props.dateRange,
      () => props.source,
      () => props.selectedAppId,
      () => props.filterOwner,
      () => props.keys
    ],
    () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        suppressPageWatch = true
        currentPage.value = 1
        void loadPlatformPerformance()
        setTimeout(() => {
          suppressPageWatch = false
        }, 0)
      }, 300)
    },
    { deep: true }
  )

  watch([currentPage, pageSize], () => {
    if (suppressPageWatch) return
    void loadPlatformPerformance()
  })

  void loadPlatformPerformance()

  function onCurrentChange(v: number) {
    currentPage.value = v
  }

  function onSizeChange(v: number) {
    pageSize.value = v
    currentPage.value = 1
  }

  function formatMoney(n: number | null | undefined): string {
    const value = toFiniteNumber(n)
    return value === null
      ? '无数据'
      : '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  function formatNumber(n: number | null | undefined): string {
    const value = toFiniteNumber(n)
    return value === null ? '无数据' : value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  /** 使用率进度条颜色：0-20 红，20-40 橙，40-60 黄，60+ 绿 */
  function getUsageRateColor(rate: number): string {
    if (rate < 20) return '#f56c6c'
    if (rate < 40) return '#e6a23c'
    if (rate < 60) return '#e6df44'
    return '#67c23a'
  }

  /**
   * ROI 三段色阶：
   * >= 90 绿，>= 75 橙，< 75 红
   */
  function getRoiClass(roi: number): string {
    if (roi >= 90) return 'ap-roi-green'
    if (roi >= 75) return 'ap-roi-orange'
    return 'ap-roi-red'
  }

  const EMPTY_TEXT = '无数据'

  function toFiniteNumber(v: unknown): number | null {
    if (v === null || v === undefined || v === '') return null
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : null
  }

  function round2Number(v: unknown): number | null {
    const n = toFiniteNumber(v)
    return n === null ? null : Number(n.toFixed(2))
  }

  function hasFiniteNumber(v: unknown): boolean {
    return toFiniteNumber(v) !== null
  }

  function formatFixed2OrEmpty(v: unknown): string {
    const n = toFiniteNumber(v)
    return n === null ? EMPTY_TEXT : n.toFixed(2)
  }

  function formatPercentFixed2OrEmpty(v: unknown): string {
    const n = toFiniteNumber(v)
    return n === null ? EMPTY_TEXT : `${n.toFixed(2)}%`
  }

  function hasRoiTrend(roi: FirstThreeDayRoi | null | undefined): boolean {
    return roiChartPoints(roi).length >= 2
  }

  function roiChartPoints(roi: FirstThreeDayRoi | null | undefined): Array<{
    key: string
    x: number
    y: number
    value: number
    date: string
  }> {
    const dates = Array.isArray(roi?.dates) ? roi!.dates.slice(0, 3).map(String) : []
    const raw = Array.isArray(roi?.data) ? roi!.data.slice(0, 3) : []
    const valid = raw
      .map((item, index) => {
        const value = toFiniteNumber(item)
        if (value === null) return null
        return {
          key: `${dates[index] ?? index}-${value}`,
          value,
          date: dates[index] ?? `D${index + 1}`,
          index
        }
      })
      .filter(Boolean) as Array<{ key: string; value: number; date: string; index: number }>

    if (!valid.length) return []

    const values = valid.map((item) => item.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || 1
    const xMap = [8, 36, 64]

    return valid.map((item) => ({
      key: item.key,
      value: item.value,
      date: item.date,
      x: xMap[item.index] ?? 8 + item.index * 28,
      y: Number((20 - ((item.value - min) / span) * 12).toFixed(2))
    }))
  }

  function roiPolylinePoints(roi: FirstThreeDayRoi | null | undefined): string {
    return roiChartPoints(roi)
      .map((point) => `${point.x},${point.y}`)
      .join(' ')
  }

  function roiTooltipItems(roi: FirstThreeDayRoi | null | undefined): Array<{
    key: string
    date: string
    value: string
  }> {
    const dates = Array.isArray(roi?.dates) ? roi!.dates.slice(0, 3).map(String) : []
    const raw = Array.isArray(roi?.data) ? roi!.data.slice(0, 3) : []
    return raw
      .map((item, index) => {
        const value = toFiniteNumber(item)
        if (value === null) return null
        return {
          key: `${dates[index] ?? index}-${value}`,
          date: dates[index] ?? `D${index + 1}`,
          value: `${value.toFixed(2)}%`
        }
      })
      .filter(Boolean) as Array<{ key: string; date: string; value: string }>
  }
</script>

<style scoped lang="scss">
  /* 表格横向滚动 */
  .ap-table-scroll {
    position: relative;
    width: 100%;
    min-height: 430px;
    max-height: 560px;
    overflow: hidden;
    -webkit-overflow-scrolling: touch;

    :deep(.el-table) {
      min-width: 1020px;
    }
  }

  .ap-table-skeleton-scroll {
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    min-height: 430px;
    max-height: 560px;
    padding-top: 12px;
    overflow-y: auto;

    :deep(.el-skeleton) {
      width: 85%;
      height: 100%;
    }
  }

  .ap-platform-table {
    --el-table-border-color: var(--el-border-color-lighter);
    --el-table-header-bg-color: var(--el-fill-color-light);

    /* 行间距 */
    :deep(.el-table__row) {
      height: 64px;
    }
  }

  .ap-platform-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }

  html.dark .ap-platform-table {
    --el-table-border-color: var(--el-border-color);
    --el-table-header-bg-color: var(--el-fill-color-dark);

    :deep(.el-table__header-wrapper th),
    :deep(.el-table__header-wrapper th .cell) {
      color: #fff;
    }
  }

  /* 平台名称单元格 */
  .ap-platform-name {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  /* 平台图标圆形徽章 */
  .ap-platform-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 17px;
    font-weight: 700;
    user-select: none;
    border-radius: 10px;
  }

  .ap-platform-label {
    font-size: 15px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  /* 账户数 */
  .ap-account-count {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  /* 使用率进度条组合 */
  .ap-usage-cell {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
  }

  .ap-usage-value {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 500;
  }

  .ap-usage-bar {
    flex-shrink: 0;
    width: 60px;

    :deep(.el-progress-bar) {
      width: 100%;
    }
  }

  /* 状态标签 */
  .ap-status {
    display: inline-flex;
    gap: 3px;
    align-items: center;
    font-size: 12px;

    &--normal {
      color: var(--el-color-success);

      &::before {
        margin-right: 3px;
        font-size: 8px;
        content: '●';
      }
    }

    &--warning {
      color: var(--el-color-warning);

      &::before {
        margin-right: 3px;
        font-size: 8px;
        content: '●';
      }
    }

    &--roi-low {
      font-weight: 500;
      color: var(--el-color-danger);
    }
  }

  .ap-status-icon {
    font-size: 11px;
  }

  /* ROI 颜色 */
  .ap-roi-green {
    font-weight: 500;
    color: var(--el-color-success);
  }

  .ap-roi-orange {
    font-weight: 500;
    color: var(--el-color-warning);
  }

  .ap-roi-red {
    font-weight: 500;
    color: var(--el-color-danger);
  }

  .ap-roi-trend-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 24px;
  }

  .ap-roi-trend-svg {
    width: 72px;
    height: 24px;
    overflow: visible;
  }

  .ap-roi-trend-line {
    fill: none;
    stroke: #23e7d6;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  .ap-roi-trend-dot {
    fill: #23e7d6;
    stroke: rgb(24 24 27 / 85%);
    stroke-width: 1;
  }

  .ap-roi-tooltip {
    min-width: 148px;
  }

  .ap-roi-tooltip-item {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;

    & + & {
      margin-top: 6px;
    }
  }

  /* 底部汇总 */
  .ap-table-footer {
    margin-top: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
