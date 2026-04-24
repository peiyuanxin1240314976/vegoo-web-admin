<template>
  <div>
    <div class="ap-table-scroll">
      <div v-if="accountsLoading" class="ap-table-skeleton-scroll">
        <ElSkeleton animated :rows="11" />
      </div>

      <template v-else>
        <div class="ap-table-h-scroll">
          <ElTable
            :data="pagedData"
            row-key="id"
            height="480"
            size="small"
            :style="{ width: `${tableMinWidth}px` }"
            class="ap-account-table"
          >
            <ElTableColumn prop="appName" label="应用" min-width="128" align="center">
              <template #default="{ row }">
                <div class="ap-app-cell">
                  <span
                    class="ap-app-glyph"
                    :style="{
                      background: getAppBadge(row.appName).bg,
                      color: getAppBadge(row.appName).color,
                      boxShadow: `0 0 0 1px ${getAppBadge(row.appName).bg}44`
                    }"
                    aria-hidden="true"
                  >
                    {{ getAppBadge(row.appName).char }}
                  </span>
                  <span
                    class="ap-app-name"
                    :style="{
                      color: getAppBadge(row.appName).textColor ?? getAppBadge(row.appName).bg
                    }"
                  >
                    {{ row.appName?.trim() || '—' }}
                  </span>
                </div>
              </template>
            </ElTableColumn>

            <ElTableColumn prop="platform" label="平台" width="80" align="center">
              <template #default="{ row }">
                <span class="ap-terminal-txt">{{ row.platform?.trim() || '—' }}</span>
              </template>
            </ElTableColumn>

            <ElTableColumn prop="source" label="广告平台" min-width="132" align="center">
              <template #default="{ row }">
                <div class="ap-platform-cell">
                  <span
                    class="ap-platform-icon-sm"
                    :style="{
                      background: getPlatformIcon(row.source).bg,
                      color: getPlatformIcon(row.source).color
                    }"
                  >
                    {{ getPlatformIcon(row.source).char }}
                  </span>
                  <span class="ap-platform-name-sm">{{ row.source?.trim() || '—' }}</span>
                </div>
              </template>
            </ElTableColumn>

            <ElTableColumn label="广告账户" align="center">
              <ElTableColumn prop="adAccount.accountId" label="ID" min-width="100" align="center">
                <template #default="{ row }">
                  <span class="ap-account-id ap-account-id--solo">
                    {{ row.adAccount?.accountId?.trim() || '—' }}
                  </span>
                </template>
              </ElTableColumn>

              <ElTableColumn prop="adAccount.name" align="center" label="名称" min-width="100">
                <template #default="{ row }">
                  <span class="ap-account-name">{{ row.adAccount?.name?.trim() || '—' }}</span>
                </template>
              </ElTableColumn>

              <ElTableColumn prop="adAccount.spend" label="广告支出" width="108" align="center">
                <template #default="{ row }">{{ formatMoney(row.adAccount?.spend) }}</template>
              </ElTableColumn>

              <ElTableColumn prop="adAccount.budget" label="预算" width="96" align="center">
                <template #default="{ row }">{{ formatMoney(row.adAccount?.budget) }}</template>
              </ElTableColumn>

              <ElTableColumn prop="adAccount.cpa" label="CPA" width="80" align="center">
                <template #default="{ row }">{{
                  formatOptionalMoneyOrEmpty(row.adAccount?.cpa)
                }}</template>
              </ElTableColumn>

              <ElTableColumn prop="adAccount.cpi" label="CPI" width="72" align="center">
                <template #default="{ row }">{{
                  formatFixed2OrEmpty(row.adAccount?.cpi)
                }}</template>
              </ElTableColumn>

              <ElTableColumn prop="adAccount.installs" label="买量用户" width="96" align="center">
                <template #default="{ row }">{{ formatNumber(row.adAccount?.installs) }}</template>
              </ElTableColumn>
            </ElTableColumn>

            <ElTableColumn prop="usageRate" label="使用率" min-width="140" align="center">
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
                  >
                    {{ formatPercentFixed2OrEmpty(row.usageRate) }}
                  </span>
                </div>
              </template>
            </ElTableColumn>

            <ElTableColumn label="首日ROI" align="center">
              <ElTableColumn :label="roiHeaderTitles[0]" width="108" align="center">
                <template #default="{ row }">
                  <span
                    v-if="roiDayValue(row, 0) !== null"
                    :class="getRoiClass(roiDayValue(row, 0) ?? 0)"
                  >
                    {{ formatPercentFixed2OrEmpty(roiDayValue(row, 0)) }}
                  </span>
                  <span v-else class="ap-roi-empty">—</span>
                </template>
              </ElTableColumn>

              <ElTableColumn :label="roiHeaderTitles[1]" width="108" align="center">
                <template #default="{ row }">
                  <span
                    v-if="roiDayValue(row, 1) !== null"
                    :class="getRoiClass(roiDayValue(row, 1) ?? 0)"
                  >
                    {{ formatPercentFixed2OrEmpty(roiDayValue(row, 1)) }}
                  </span>
                  <span v-else class="ap-roi-empty">—</span>
                </template>
              </ElTableColumn>

              <ElTableColumn :label="roiHeaderTitles[2]" width="108" align="center">
                <template #default="{ row }">
                  <span
                    v-if="roiDayValue(row, 2) !== null"
                    :class="getRoiClass(roiDayValue(row, 2) ?? 0)"
                  >
                    {{ formatPercentFixed2OrEmpty(roiDayValue(row, 2)) }}
                  </span>
                  <span v-else class="ap-roi-empty">—</span>
                </template>
              </ElTableColumn>
            </ElTableColumn>

            <ElTableColumn prop="roi3" label="3日ROI" width="92" align="center">
              <template #default="{ row }">
                <span
                  v-if="hasFiniteNumber(row.roi3)"
                  :class="getRoiClass(round2Number(row.roi3) ?? 0)"
                >
                  {{ formatPercentFixed2OrEmpty(row.roi3) }}
                </span>
                <span v-else>{{ EMPTY_TEXT }}</span>
              </template>
            </ElTableColumn>

            <ElTableColumn prop="roi7" label="7日ROI" width="92" align="center">
              <template #default="{ row }">
                <span
                  v-if="hasFiniteNumber(row.roi7)"
                  :class="getRoiClass(round2Number(row.roi7) ?? 0)"
                >
                  {{ formatPercentFixed2OrEmpty(row.roi7) }}
                </span>
                <span v-else>{{ EMPTY_TEXT }}</span>
              </template>
            </ElTableColumn>

            <ElTableColumn prop="status" label="状态" width="108" align="center">
              <template #default="{ row }">
                <span v-if="row.status === 'normal'" class="ap-status ap-status--normal">正常</span>
                <span v-else-if="row.status === 'warning'" class="ap-status ap-status--warning"
                  >注意</span
                >
                <span v-else-if="row.status === 'roi_low'" class="ap-status ap-status--roi-low">
                  <span class="ap-status-icon">●</span> ROI偏低
                </span>
                <span v-else>{{ EMPTY_TEXT }}</span>
              </template>
            </ElTableColumn>

            <ElTableColumn label="操作" width="88" align="center">
              <template #default="{ row }">
                <ElButton
                  round
                  link
                  type="primary"
                  size="small"
                  :disabled="!canOpenCampaignDetail(row)"
                  @click="goCampaignDetail(row)"
                >
                  系列
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <div v-if="!pagedData.length" class="ap-table-empty">
          <ElEmpty description="暂无数据" :image-size="120" />
        </div>
      </template>
    </div>

    <div class="ap-table-footer-row">
      <span class="ap-table-footer">共 {{ total }} 个广告账户</span>
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="prev, pager, next, sizes"
        small
        background
        class="ap-pagination"
        :disabled="accountsLoading"
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import request from '@/utils/http'
  import { buildAppSelectionRequestBody } from '@/utils/app-id-request'
  import { ACCOUNT_PERFORMANCE_API_BASE } from '@/views/user-growth/account-performance/config/api-base'
  import { LEGACY_ACCOUNT_MOCK_ROWS } from './app-performance-legacy-mock'

  defineOptions({ name: 'AppPerformancePlaceholder' })

  interface PlatformIconConfig {
    bg: string
    color: string
    char: string
  }

  interface AppBadgeConfig {
    bg: string
    color: string
    char: string
    textColor?: string
  }

  interface FirstThreeDayRoi {
    dates: string[]
    data: (number | null)[]
  }

  interface AdAccountMetrics {
    id: string
    name: string | null
    accountId: string
    spend: number
    budget: number | null
    cpa: number | null
    cpi: number
    installs: number
  }

  interface AccountRow {
    appId: string
    appName: string
    platform: string
    source: string
    adAccount: AdAccountMetrics
    usageRate: number
    firstThreeDayRoi: FirstThreeDayRoi
    roi3: number
    roi7: number
    status: 'normal' | 'warning' | 'roi_low'
  }

  type TableAccountRow = AccountRow & { id: string }

  const props = defineProps<{
    dateRange: [string, string]
    source: string
    selectedAppId: string | string[]
    filterOwner: string
    keys: string
  }>()

  const router = useRouter()
  const currentPage = ref(1)
  const pageSize = ref(10)
  const accountsLoading = ref(true)
  const accounts = ref<AccountRow[]>([])
  const total = ref(0)
  const EMPTY_TEXT = '无数据'
  const DEFAULT_ROI_DATES = ['2026-04-09', '2026-04-08', '2026-04-07'] as const
  const tableMinWidth = 2184

  const PLATFORM_ICON_MAP: Record<string, PlatformIconConfig> = {
    TikTok: { bg: '#010101', color: '#ffffff', char: 'T' },
    Facebook: { bg: '#1877f2', color: '#ffffff', char: 'f' },
    Google: { bg: '#4285f4', color: '#ffffff', char: 'G' },
    Mintegral: { bg: '#7c3aed', color: '#ffffff', char: 'M' },
    Kwai: { bg: '#ff6d00', color: '#ffffff', char: 'K' },
    NewsBreak: { bg: '#e53e3e', color: '#ffffff', char: 'N' }
  }

  function getPlatformIcon(source: string | null | undefined): PlatformIconConfig {
    const name = typeof source === 'string' ? source.trim() : ''
    if (!name) return { bg: '#666', color: '#fff', char: '?' }
    return PLATFORM_ICON_MAP[name] ?? { bg: '#666', color: '#fff', char: name[0] ?? '?' }
  }

  function getAppBadge(appName: string | null | undefined): AppBadgeConfig {
    const name = typeof appName === 'string' ? appName.trim() : ''
    if (!name) return { bg: '#6b7280', color: '#fff', char: 'A' }
    const palette = [
      { bg: '#4f8cff', textColor: '#5aa2ff' },
      { bg: '#22c55e', textColor: '#6fdc52' },
      { bg: '#f59e0b', textColor: '#eab13d' },
      { bg: '#ef4444', textColor: '#f06b6b' },
      { bg: '#8b5cf6', textColor: '#a78bfa' },
      { bg: '#06b6d4', textColor: '#33d6f6' }
    ]
    const hash = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
    const picked = palette[hash % palette.length]
    return {
      bg: picked.bg,
      color: '#ffffff',
      textColor: picked.textColor,
      char: name[0]!.toUpperCase()
    }
  }

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

  function formatMoney(n: number | null | undefined): string {
    const value = toFiniteNumber(n)
    return value === null
      ? EMPTY_TEXT
      : '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  function formatOptionalMoneyOrEmpty(n: number | null | undefined): string {
    const value = toFiniteNumber(n)
    return value === null
      ? EMPTY_TEXT
      : '$' +
          value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
  }

  function formatNumber(n: number | null | undefined): string {
    const value = toFiniteNumber(n)
    return value === null ? EMPTY_TEXT : value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  function formatFixed2OrEmpty(v: unknown): string {
    const n = toFiniteNumber(v)
    return n === null ? EMPTY_TEXT : n.toFixed(2)
  }

  function formatPercentFixed2OrEmpty(v: unknown): string {
    const n = toFiniteNumber(v)
    return n === null ? EMPTY_TEXT : `${n.toFixed(2)}%`
  }

  function getUsageRateColor(rate: number): string {
    if (rate < 20) return '#f56c6c'
    if (rate < 40) return '#e6a23c'
    if (rate < 60) return '#e6df44'
    return '#67c23a'
  }

  function getRoiClass(roi: number): string {
    if (roi >= 90) return 'ap-roi-green'
    if (roi >= 75) return 'ap-roi-orange'
    return 'ap-roi-red'
  }

  function roiDayValue(row: AccountRow, index: number): number | null {
    const arr = row.firstThreeDayRoi?.data
    if (!Array.isArray(arr) || index < 0 || index >= arr.length) return null
    return toFiniteNumber(arr[index])
  }

  function formatRoiColumnTitle(isoDate: string | undefined, fallback: string): string {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return fallback
    const [, month, day] = isoDate.split('-').map(Number)
    return `${month}/${day}`
  }

  const roiHeaderTitles = computed(() => {
    const roiDates = accounts.value[0]?.firstThreeDayRoi?.dates ?? [...DEFAULT_ROI_DATES]
    return [
      formatRoiColumnTitle(roiDates[0], 'D1'),
      formatRoiColumnTitle(roiDates[1], 'D2'),
      formatRoiColumnTitle(roiDates[2], 'D3')
    ]
  })

  function normalizeStatus(v: unknown): AccountRow['status'] {
    if (v === 'normal' || v === 'warning' || v === 'roi_low') return v
    return 'normal'
  }

  function normalizeAccountRow(raw: unknown, index: number): AccountRow {
    const row = raw !== null && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
    const adRaw =
      row.adAccount !== null && typeof row.adAccount === 'object'
        ? (row.adAccount as Record<string, unknown>)
        : {}
    const ftRaw =
      row.firstThreeDayRoi !== null && typeof row.firstThreeDayRoi === 'object'
        ? (row.firstThreeDayRoi as Record<string, unknown>)
        : {}

    const stableId = String(adRaw.id ?? adRaw.accountId ?? row.id ?? `row-${index}`).trim()
    const accountId = String(adRaw.accountId ?? stableId).trim() || `row-${index}`
    const datesIn = Array.isArray(ftRaw.dates) ? ftRaw.dates.map(String).slice(0, 3) : null
    const dataIn = Array.isArray(ftRaw.data) ? ftRaw.data : null

    return {
      appId: String(row.appId ?? '').trim() || '—',
      appName: String(row.appName ?? '').trim() || '—',
      platform: String(row.platform ?? '').trim() || '—',
      source: String(row.source ?? '').trim(),
      adAccount: {
        id: stableId,
        name: adRaw.name === null || adRaw.name === undefined ? null : String(adRaw.name),
        accountId,
        spend: toFiniteNumber(adRaw.spend) ?? 0,
        budget: toFiniteNumber(adRaw.budget),
        cpa:
          adRaw.cpa === null || adRaw.cpa === undefined || adRaw.cpa === ''
            ? null
            : toFiniteNumber(adRaw.cpa),
        cpi: toFiniteNumber(adRaw.cpi) ?? 0,
        installs: toFiniteNumber(adRaw.installs) ?? 0
      },
      usageRate: toFiniteNumber(row.usageRate) ?? 0,
      firstThreeDayRoi: {
        dates: datesIn?.length === 3 ? datesIn : [...DEFAULT_ROI_DATES],
        data: [0, 1, 2].map((i) => (dataIn && i < dataIn.length ? toFiniteNumber(dataIn[i]) : null))
      },
      roi3: toFiniteNumber(row.roi3) ?? 0,
      roi7: toFiniteNumber(row.roi7) ?? 0,
      status: normalizeStatus(row.status)
    }
  }

  function buildMockRow(item: (typeof LEGACY_ACCOUNT_MOCK_ROWS)[number]): AccountRow {
    return {
      appId: 'demo-app',
      appName: '演示应用',
      platform: '安卓',
      source: item.source,
      adAccount: {
        id: item.id,
        name: item.name,
        accountId: item.accountId || item.id,
        spend: item.spend,
        budget: item.budget,
        cpa: null,
        cpi: item.cpi,
        installs: item.installs
      },
      usageRate: item.usageRate,
      firstThreeDayRoi: {
        dates: [...DEFAULT_ROI_DATES],
        data: [
          item.roi1,
          Number((item.roi1 * 0.98).toFixed(2)),
          Number((item.roi1 * 0.96).toFixed(2))
        ]
      },
      roi3: item.roi3,
      roi7: item.roi7,
      status: item.status
    }
  }

  const accountsFallback = LEGACY_ACCOUNT_MOCK_ROWS.map(buildMockRow)
  const totalFallback = accountsFallback.length

  const pagedData = computed<TableAccountRow[]>(() =>
    accounts.value.map((item, index) => ({
      ...item,
      id: item.adAccount.id || `row-${index}`
    }))
  )

  function canOpenCampaignDetail(row: TableAccountRow): boolean {
    return Boolean(row.adAccount?.id?.trim() && row.appId?.trim())
  }

  function goCampaignDetail(row: TableAccountRow) {
    if (!canOpenCampaignDetail(row)) return
    router.push({
      name: 'CampaignDetail',
      query: {
        id: String(row.adAccount.id),
        appId: String(row.appId),
        appName: row.appName?.trim() || ''
      }
    })
  }

  let requestSeq = 0

  async function loadAccountPerformance() {
    const [dateStart, dateEnd] = props.dateRange
    if (!dateStart || !dateEnd) return

    const seq = ++requestSeq
    accountsLoading.value = true
    accounts.value = []
    /* 请求进行中勿将 total 置 0：ElPagination 在 total=0 时会修正 current-page 回 1，导致翻页后立即再请求第 1 页 */

    try {
      const res = await request.post<{ accounts: AccountRow[]; total: number }>({
        url: `${ACCOUNT_PERFORMANCE_API_BASE}/app-performance-placeholder-table`,
        data: {
          /* 与 ElPagination 一致：从 1 开始；勿再减 1，否则第 1 页会请求成 0 */
          currentPage: currentPage.value,
          dateEnd,
          dateStart,
          keys: props.keys.trim(),
          ownerId: props.filterOwner,
          pageSize: pageSize.value,
          ...buildAppSelectionRequestBody(props.selectedAppId),
          source: props.source
        }
      })

      if (seq !== requestSeq) return
      const list = Array.isArray(res.accounts) ? res.accounts : accountsFallback
      accounts.value = list.map((item, index) => normalizeAccountRow(item, index))
      total.value = typeof res.total === 'number' ? res.total : totalFallback
    } catch {
      if (seq !== requestSeq) return
      accounts.value = accountsFallback.map((item, index) => normalizeAccountRow(item, index))
      total.value = totalFallback
    } finally {
      if (seq === requestSeq) accountsLoading.value = false
    }
  }

  let filterDebounceTimer: ReturnType<typeof setTimeout> | null = null

  watch(
    [
      () => props.dateRange,
      () => props.source,
      () => props.selectedAppId,
      () => props.filterOwner,
      () => props.keys
    ],
    () => {
      if (filterDebounceTimer) clearTimeout(filterDebounceTimer)
      filterDebounceTimer = setTimeout(() => {
        currentPage.value = 1
        void loadAccountPerformance()
      }, 300)
    },
    { deep: true }
  )

  watch([currentPage, pageSize], () => {
    void loadAccountPerformance()
  })

  void loadAccountPerformance()

  function onCurrentChange(v: number) {
    currentPage.value = v
  }

  function onSizeChange(v: number) {
    pageSize.value = v
    currentPage.value = 1
  }
</script>

<style scoped lang="scss">
  .ap-table-scroll {
    position: relative;
    width: 100%;
    min-height: 480px;
    max-height: 560px;
    overflow: hidden;
  }

  .ap-table-h-scroll {
    width: 100%;
    padding-bottom: 12px;
    overflow: auto hidden;
    scrollbar-gutter: stable;
    scrollbar-width: auto;
    scrollbar-color: #ff9f1a rgb(255 255 255 / 10%);
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      height: 12px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(90deg, #ff8a00, #ffb84d);
      border: 2px solid rgb(20 20 24 / 85%);
      border-radius: 999px;
    }

    &::-webkit-scrollbar-track {
      background: rgb(255 255 255 / 10%);
      border-radius: 999px;
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / 6%);
    }
  }

  .ap-table-empty {
    padding: 24px 0;
  }

  .ap-table-skeleton-scroll {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    min-height: 480px;
    max-height: 560px;
    padding-top: 12px;
    overflow-y: auto;

    :deep(.el-skeleton) {
      width: 85%;
      height: 100%;
    }
  }

  .ap-account-table {
    width: max-content;
    min-width: 2184px;

    --el-table-border-color: transparent;
    --el-table-header-bg-color: #18181b;
    --el-table-row-hover-bg-color: color-mix(in srgb, var(--art-warning, #ff9f1a) 8%, transparent);

    :deep(&::before) {
      display: none;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }

    :deep(.el-table__border-left-patch) {
      display: none;
    }

    :deep(.el-table__header-wrapper) {
      background: #18181b !important;

      table,
      thead,
      tr,
      th {
        padding: 6px 0;
        background: #18181b !important;
      }
    }

    :deep(.el-table__header-wrapper table) {
      background-color: #18181b !important;
    }

    :deep(.el-table__header th) {
      font-size: 12px;
      font-weight: 600;
      color: color-mix(in srgb, #fff 88%, var(--el-text-color-secondary));
      background: #18181b !important;
      border-right: 0;
      border-bottom-color: color-mix(in srgb, var(--el-border-color) 40%, transparent);
    }

    :deep(.el-table__header th:not(:last-child)) {
      box-shadow: inset -1px 0 0 rgb(255 255 255 / 10%);
    }

    :deep(.el-table__header .cell) {
      letter-spacing: 0.01em;
    }

    :deep(.el-table__cell) {
      padding: 6px 0;
      border-right: 0;
      border-bottom-color: color-mix(in srgb, var(--el-border-color) 55%, transparent);
    }

    :deep(.cell) {
      padding: 0 8px;
      font-size: 12px;
      line-height: 1.2;
      white-space: nowrap;
    }

    :deep(.el-table__row) {
      height: 56px;
    }
  }

  html.dark .ap-account-table {
    --el-table-border-color: var(--el-border-color);
    --el-table-header-bg-color: #18181b;
  }

  .ap-app-cell {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-start;
    min-width: 0;
  }

  .ap-app-glyph {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 10px;
    font-weight: 700;
    user-select: none;
    border-radius: 5px;
  }

  .ap-app-name {
    font-size: 12px;
    font-weight: 600;
  }

  .ap-terminal-txt {
    font-size: 12px;
    color: var(--el-text-color-regular);
  }

  .ap-roi-empty {
    color: var(--el-text-color-placeholder);
  }

  .ap-account-name {
    font-size: 12px;
    color: var(--el-text-color-primary);
  }

  .ap-account-id {
    font-family: ui-monospace, monospace;
    font-size: 10px;
    color: var(--el-text-color-placeholder);
  }

  .ap-account-id--solo {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ap-platform-cell {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
  }

  .ap-platform-icon-sm {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 10px;
    font-weight: 700;
    border-radius: 4px;
    box-shadow: 0 0 0 1px rgb(255 255 255 / 8%);
  }

  .ap-platform-name-sm {
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }

  .ap-usage-cell {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;
  }

  .ap-usage-value {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 500;
  }

  .ap-usage-bar {
    width: 42px;

    :deep(.el-progress-bar) {
      width: 100%;
    }
  }

  .ap-status {
    display: inline-flex;
    gap: 3px;
    align-items: center;
    font-size: 11px;

    &--normal {
      color: var(--el-color-success);

      &::before {
        font-size: 8px;
        content: '●';
      }
    }

    &--warning {
      color: var(--el-color-warning);

      &::before {
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
    font-size: 10px;
  }

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

  .ap-table-footer-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
  }

  .ap-table-footer {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .ap-pagination {
    :deep(.btn-prev),
    :deep(.btn-next),
    :deep(.el-pager li) {
      background: color-mix(in srgb, var(--default-box-color) 90%, transparent);
    }

    :deep(.el-pagination__sizes) {
      margin-left: 4px;
    }
  }
</style>
