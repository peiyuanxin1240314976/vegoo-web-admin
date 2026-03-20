<!-- 我是平台页面 -->
<template>
  <div>
    <div v-if="platformLoading" class="ap-table-skeleton-scroll">
      <ElSkeleton animated :rows="8" />
    </div>

    <div v-else class="ap-table-scroll">
      <ElTable :data="platformData" size="default" class="ap-platform-table">
        <!-- 广告平台（图标 + 名称） -->
        <ElTableColumn label="广告平台" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="ap-platform-name">
              <span
                class="ap-platform-icon"
                :style="{
                  background: row.iconBg,
                  color: row.iconColor,
                  boxShadow: `0 0 0 1px ${row.iconBg}44`
                }"
                >{{ row.iconChar }}</span
              >
              <span class="ap-platform-label">{{ row.name }}</span>
            </div>
          </template>
        </ElTableColumn>

        <!-- 账户数 -->
        <ElTableColumn label="账户数" width="100" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="ap-account-count">{{ row.accountCount }}个账户</span>
          </template>
        </ElTableColumn>

        <!-- 广告支出 -->
        <ElTableColumn label="广告支出" width="110" align="center" sortable show-overflow-tooltip>
          <template #default="{ row }">{{ formatMoney(row.spend) }}</template>
        </ElTableColumn>

        <!-- 预算 -->
        <ElTableColumn label="预算" width="100" align="center" show-overflow-tooltip>
          <template #default="{ row }">{{ formatMoney(row.budget) }}</template>
        </ElTableColumn>

        <!-- 使用率 -->
        <ElTableColumn label="使用率" width="140" align="center" show-overflow-tooltip>
          <template #default="{ row }">
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
                >{{ formatPercentFixed2OrEmpty(row.usageRate) }}</span
              >
            </div>
          </template>
        </ElTableColumn>

        <!-- CPI -->
        <ElTableColumn label="CPI" width="70" align="center" show-overflow-tooltip>
          <template #default="{ row }">{{ formatFixed2OrEmpty(row.cpi) }}</template>
        </ElTableColumn>

        <!-- 安装数 -->
        <ElTableColumn label="安装数" width="100" align="center" show-overflow-tooltip>
          <template #default="{ row }">{{ formatNumber(row.installs) }}</template>
        </ElTableColumn>

        <!-- 首日ROI -->
        <ElTableColumn label="首日ROI" width="90" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span
              v-if="hasFiniteNumber(row.roi1)"
              :class="getRoiClass(round2Number(row.roi1) ?? 0)"
            >
              {{ formatPercentFixed2OrEmpty(row.roi1) }}
            </span>
            <span v-else>无数据</span>
          </template>
        </ElTableColumn>

        <!-- 3日ROI -->
        <ElTableColumn label="3日ROI" width="80" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span
              v-if="hasFiniteNumber(row.roi3)"
              :class="getRoiClass(round2Number(row.roi3) ?? 0)"
            >
              {{ formatPercentFixed2OrEmpty(row.roi3) }}
            </span>
            <span v-else>无数据</span>
          </template>
        </ElTableColumn>

        <!-- 7日ROI -->
        <ElTableColumn label="7日ROI" width="80" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span
              v-if="hasFiniteNumber(row.roi7)"
              :class="getRoiClass(round2Number(row.roi7) ?? 0)"
            >
              {{ formatPercentFixed2OrEmpty(row.roi7) }}
            </span>
            <span v-else>无数据</span>
          </template>
        </ElTableColumn>

        <!-- 状态 -->
        <ElTableColumn label="状态" width="110" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.status === 'normal'" class="ap-status ap-status--normal">正常</span>
            <span v-else-if="row.status === 'warning'" class="ap-status ap-status--warning"
              >注意</span
            >
            <span v-else-if="row.status === 'roi_low'" class="ap-status ap-status--roi-low">
              <span class="ap-status-icon">▲</span> ROI偏低
            </span>
            <span v-else>无数据</span>
          </template>
        </ElTableColumn>

        <!-- 操作 -->
        <ElTableColumn label="操作" width="80" align="center" fixed="right" show-overflow-tooltip>
          <template #default>
            <ElButton link type="primary" size="small">详情</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <ElPagination
        v-if="platformTotal > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="platformTotal"
        :page-sizes="pageSizes"
        layout="prev, pager, next, sizes"
        small
        class="ap-platform-pagination"
      />
    </div>

    <!-- 底部汇总 -->
    <div class="ap-table-footer">
      共 {{ platformTotal }} 个广告平台 / {{ accountTotal }} 个广告账户
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import request from '@/utils/http'

  defineOptions({ name: 'PlatformPerformancePlaceholder' })

  const props = defineProps<{
    dateRange: [string, string]
    source: string
    platform: string
    filterOwner: string
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
    roi1: number
    roi3: number
    roi7: number
    status: 'normal' | 'warning' | 'roi_low'
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
  }

  function normalizePlatformRow(row: PlatformApiRow): PlatformRow {
    const icon = row.iconBg && row.iconColor && row.iconChar ? row : PLATFORM_ICON_MAP[row.name]
    return {
      ...(row as PlatformRow),
      ...(typeof (icon as any).iconBg === 'string' ? { iconBg: (icon as any).iconBg } : {}),
      ...(typeof (icon as any).iconColor === 'string'
        ? { iconColor: (icon as any).iconColor }
        : {}),
      ...(typeof (icon as any).iconChar === 'string' ? { iconChar: (icon as any).iconChar } : {})
    }
  }

  let requestSeq = 0
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let suppressPageWatch = false

  async function loadPlatformPerformance() {
    const [dateStart, dateEnd] = props.dateRange
    if (!dateStart || !dateEnd) return

    const seq = ++requestSeq
    platformLoading.value = true
    platformData.value = []
    platformTotal.value = 0
    accountTotal.value = 0

    try {
      const res = await request.post<{
        platformTotal: number
        accountTotal: number
        platforms: PlatformApiRow[]
      }>({
        url: '/api/v1/datacenter/analysis/account-performance/platform-performance-placeholder-table',
        data: {
          currentPage: Math.max(0, currentPage.value - 1),
          dateEnd,
          dateStart,
          kw: '',
          ownerId: props.filterOwner,
          pageSize: pageSize.value,
          platform: props.platform,
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
    [() => props.dateRange, () => props.source, () => props.platform, () => props.filterOwner],
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
</script>

<style scoped lang="scss">
  /* 表格横向滚动 */
  .ap-table-scroll {
    position: relative;
    width: 100%;
    min-height: 430px;
    max-height: 560px;
    overflow: auto;
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

  /* 底部汇总 */
  .ap-table-footer {
    margin-top: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
