<!-- 我是账户页面 -->
<template>
  <div>
    <div v-if="accountsLoading" class="ap-table-skeleton-scroll">
      <ElSkeleton animated :rows="11" />
    </div>

    <div v-else class="ap-table-scroll">
      <ElTable :data="pagedData" size="default" class="ap-account-table">
        <!-- 账户名称（含 ID 后缀） -->
        <ElTableColumn label="账户名称" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="ap-account-name-cell">
              <span class="ap-account-name">{{ row.name }}</span>
              <span v-if="row.accountId" class="ap-account-id">({{ row.accountId }})</span>
            </div>
          </template>
        </ElTableColumn>

        <!-- 广告平台（图标 + 平台名） -->
        <ElTableColumn label="广告平台" width="130" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="ap-platform-cell">
              <span
                class="ap-platform-icon-sm"
                :style="{
                  background: getPlatformIcon(row.platform).bg,
                  color: getPlatformIcon(row.platform).color
                }"
                >{{ getPlatformIcon(row.platform).char }}</span
              >
              <span class="ap-platform-name-sm">{{ row.platform }}</span>
            </div>
          </template>
        </ElTableColumn>

        <!-- 广告支出 -->
        <ElTableColumn label="广告支出" width="100" align="center" sortable show-overflow-tooltip>
          <template #default="{ row }">{{ formatMoney(row.spend) }}</template>
        </ElTableColumn>

        <!-- 预算 -->
        <ElTableColumn label="预算" width="90" align="center" show-overflow-tooltip>
          <template #default="{ row }">{{ formatMoney(row.budget) }}</template>
        </ElTableColumn>

        <!-- 使用率 -->
        <ElTableColumn label="使用率" width="130" align="center" show-overflow-tooltip>
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
        <ElTableColumn label="安装数" width="90" align="center" show-overflow-tooltip>
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
        <ElTableColumn label="操作" width="110" align="center" fixed="right" show-overflow-tooltip>
          <template #default="{ row }">
            <ElButton round link type="primary" size="small" @click="goCampaignDetail(row)">
              系列
            </ElButton>
            <!-- <ElButton link type="primary" size="small">详情</ElButton> -->
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <!-- 底部：汇总文字 + 分页 -->
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
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import request from '@/utils/http'
  import { ACCOUNT_PERFORMANCE_API_BASE } from '@/views/user-growth/account-performance/config/api-base'

  defineOptions({ name: 'AppPerformancePlaceholder' })

  const router = useRouter()

  const props = defineProps<{
    dateRange: [string, string]
    source: string
    platform: string
    filterOwner: string
  }>()

  /* ── 分页状态 ── */
  const currentPage = ref(1)
  const pageSize = ref(10)

  /* ── 平台图标配置 ── */
  interface PlatformIconConfig {
    bg: string
    color: string
    char: string
  }

  const PLATFORM_ICON_MAP: Record<string, PlatformIconConfig> = {
    TikTok: { bg: '#010101', color: '#ffffff', char: '♪' },
    Facebook: { bg: '#1877f2', color: '#ffffff', char: 'f' },
    Google: { bg: '#4285f4', color: '#ffffff', char: 'G' },
    Mintegral: { bg: '#7c3aed', color: '#ffffff', char: 'M' },
    Kwai: { bg: '#ff6d00', color: '#ffffff', char: 'K' },
    NewsBreak: { bg: '#e53e3e', color: '#ffffff', char: 'N' }
  }

  function getPlatformIcon(platform: string): PlatformIconConfig {
    return PLATFORM_ICON_MAP[platform] ?? { bg: '#666', color: '#fff', char: platform[0] }
  }

  /* ── 账户 Mock 数据 ── */
  interface AccountRow {
    id: string
    name: string
    accountId: string
    platform: string
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

  function goCampaignDetail(row: AccountRow) {
    router.push({
      name: 'CampaignDetail',
      query: {
        id: String(row.id),
        appId: String(row.id),
        appName: row.name
      }
    })
  }

  const MOCK_ACCOUNTS_FALLBACK: AccountRow[] = [
    {
      id: 'a01',
      name: 'BV_TT_Vegoo_VD_09',
      accountId: '7589...',
      platform: 'TikTok',
      spend: 502,
      budget: 3200,
      usageRate: 15.7,
      cpi: 0.08,
      installs: 2122,
      roi1: 115,
      roi3: 108,
      roi7: 110,
      status: 'normal'
    },
    {
      id: 'a02',
      name: 'panda-VEGOO-PT-02',
      accountId: '7513...',
      platform: 'TikTok',
      spend: 502,
      budget: 3200,
      usageRate: 15.7,
      cpi: 0.19,
      installs: 2649,
      roi1: 104,
      roi3: 109,
      roi7: 96,
      status: 'normal'
    },
    {
      id: 'a03',
      name: 'BV_ZL_TT_PT_06',
      accountId: '758952...',
      platform: 'TikTok',
      spend: 502,
      budget: 3200,
      usageRate: 15.7,
      cpi: 0.15,
      installs: 1290,
      roi1: 104,
      roi3: 109,
      roi7: 96,
      status: 'normal'
    },
    {
      id: 'a04',
      name: 'BV_TT_Vegoo_W8_01',
      accountId: '',
      platform: 'TikTok',
      spend: 502,
      budget: 3200,
      usageRate: 5.5,
      cpi: 0.15,
      installs: 1290,
      roi1: 104,
      roi3: 109,
      roi7: 96,
      status: 'normal'
    },
    {
      id: 'a05',
      name: 'BV_TT_Vegoo_W8_01',
      accountId: '',
      platform: 'TikTok',
      spend: 371,
      budget: 2950,
      usageRate: 7.8,
      cpi: 0.06,
      installs: 5168,
      roi1: 106,
      roi3: 91,
      roi7: 96,
      status: 'normal'
    },
    {
      id: 'a06',
      name: 'BV_ZL_PT_04',
      accountId: '',
      platform: 'TikTok',
      spend: 500,
      budget: 3200,
      usageRate: 15.7,
      cpi: 0.14,
      installs: 2649,
      roi1: 74,
      roi3: 74,
      roi7: 94,
      status: 'normal'
    },
    {
      id: 'a07',
      name: 'GIMC-TT-Vegoo_VD_07',
      accountId: '',
      platform: 'TikTok',
      spend: 196,
      budget: 3200,
      usageRate: 4.9,
      cpi: 0.08,
      installs: 821,
      roi1: 107,
      roi3: 104,
      roi7: 103,
      status: 'normal'
    },
    {
      id: 'a08',
      name: 'OM_TT_Vegoo_PT_02',
      accountId: '',
      platform: 'TikTok',
      spend: 166,
      budget: 3200,
      usageRate: 6.5,
      cpi: 0.16,
      installs: 879,
      roi1: 63,
      roi3: 33,
      roi7: 62,
      status: 'normal'
    },
    {
      id: 'a09',
      name: 'OM_TT_Vegoo_PT_02',
      accountId: '',
      platform: 'TikTok',
      spend: 166,
      budget: 3200,
      usageRate: 3.3,
      cpi: 0.18,
      installs: 181,
      roi1: 57,
      roi3: 33,
      roi7: 62,
      status: 'normal'
    },
    {
      id: 'a10',
      name: 'BV_TT_Vegoo_PT3_03',
      accountId: '',
      platform: 'TikTok',
      spend: 68,
      budget: 500,
      usageRate: 13.6,
      cpi: 0.38,
      installs: 181,
      roi1: 77,
      roi3: 91,
      roi7: 70,
      status: 'normal'
    },
    {
      id: 'a11',
      name: 'BV_ZL-SDV-03',
      accountId: '',
      platform: 'TikTok',
      spend: 61,
      budget: 340,
      usageRate: 17.8,
      cpi: 0.07,
      installs: 924,
      roi1: 96,
      roi3: 110,
      roi7: 92,
      status: 'normal'
    },
    {
      id: 'a12',
      name: 'KN_TT_Vegoo_PT3_01',
      accountId: '',
      platform: 'TikTok',
      spend: 19,
      budget: 550,
      usageRate: 3.5,
      cpi: 0.26,
      installs: 72,
      roi1: 50,
      roi3: 46,
      roi7: 53,
      status: 'roi_low'
    },
    {
      id: 'a13',
      name: 'FB_VD_Vegoo_US_01',
      accountId: '',
      platform: 'Facebook',
      spend: 842,
      budget: 2000,
      usageRate: 42.1,
      cpi: 0.21,
      installs: 4010,
      roi1: 91,
      roi3: 88,
      roi7: 85,
      status: 'normal'
    },
    {
      id: 'a14',
      name: 'FB_PT_Vegoo_US_02',
      accountId: '',
      platform: 'Facebook',
      spend: 720,
      budget: 1800,
      usageRate: 40.0,
      cpi: 0.18,
      installs: 4000,
      roi1: 94,
      roi3: 90,
      roi7: 87,
      status: 'normal'
    },
    {
      id: 'a15',
      name: 'FB_VD_Vegoo_SEA_03',
      accountId: '',
      platform: 'Facebook',
      spend: 611,
      budget: 1500,
      usageRate: 40.7,
      cpi: 0.15,
      installs: 4073,
      roi1: 95,
      roi3: 91,
      roi7: 88,
      status: 'normal'
    },
    {
      id: 'a16',
      name: 'FB_PT_Vegoo_SEA_04',
      accountId: '',
      platform: 'Facebook',
      spend: 540,
      budget: 1400,
      usageRate: 38.6,
      cpi: 0.17,
      installs: 3177,
      roi1: 93,
      roi3: 89,
      roi7: 86,
      status: 'normal'
    },
    {
      id: 'a17',
      name: 'FB_VD_Vegoo_BR_01',
      accountId: '',
      platform: 'Facebook',
      spend: 480,
      budget: 1200,
      usageRate: 40.0,
      cpi: 0.19,
      installs: 2526,
      roi1: 92,
      roi3: 88,
      roi7: 85,
      status: 'normal'
    },
    {
      id: 'a18',
      name: 'FB_PT_DramaVue_01',
      accountId: '',
      platform: 'Facebook',
      spend: 380,
      budget: 1100,
      usageRate: 34.5,
      cpi: 0.16,
      installs: 2375,
      roi1: 90,
      roi3: 87,
      roi7: 84,
      status: 'normal'
    },
    {
      id: 'a19',
      name: 'FB_VD_DramaVue_02',
      accountId: '',
      platform: 'Facebook',
      spend: 261,
      budget: 900,
      usageRate: 29.0,
      cpi: 0.22,
      installs: 1187,
      roi1: 82,
      roi3: 78,
      roi7: 75,
      status: 'warning'
    },
    {
      id: 'a20',
      name: 'GG_VD_Vegoo_US_01',
      accountId: '',
      platform: 'Google',
      spend: 521,
      budget: 1200,
      usageRate: 43.4,
      cpi: 0.22,
      installs: 2368,
      roi1: 89,
      roi3: 86,
      roi7: 83,
      status: 'normal'
    },
    {
      id: 'a21',
      name: 'GG_PT_Vegoo_US_02',
      accountId: '',
      platform: 'Google',
      spend: 480,
      budget: 1200,
      usageRate: 40.0,
      cpi: 0.2,
      installs: 2400,
      roi1: 87,
      roi3: 84,
      roi7: 81,
      status: 'normal'
    },
    {
      id: 'a22',
      name: 'GG_VD_DramaVue_01',
      accountId: '',
      platform: 'Google',
      spend: 360,
      budget: 800,
      usageRate: 45.0,
      cpi: 0.21,
      installs: 1714,
      roi1: 85,
      roi3: 82,
      roi7: 79,
      status: 'normal'
    },
    {
      id: 'a23',
      name: 'MTG_VD_Vegoo_US_01',
      accountId: '',
      platform: 'Mintegral',
      spend: 451,
      budget: 1100,
      usageRate: 41.0,
      cpi: 0.19,
      installs: 2374,
      roi1: 83,
      roi3: 77,
      roi7: 74,
      status: 'warning'
    },
    {
      id: 'a24',
      name: 'MTG_VD_DramaVue_01',
      accountId: '',
      platform: 'Mintegral',
      spend: 400,
      budget: 1000,
      usageRate: 40.0,
      cpi: 0.19,
      installs: 2105,
      roi1: 80,
      roi3: 72,
      roi7: 70,
      status: 'warning'
    },
    {
      id: 'a25',
      name: 'KW_VD_Vegoo_SEA_01',
      accountId: '',
      platform: 'Kwai',
      spend: 511,
      budget: 1500,
      usageRate: 34.1,
      cpi: 0.23,
      installs: 3244,
      roi1: 79,
      roi3: 75,
      roi7: 71,
      status: 'warning'
    },
    {
      id: 'a26',
      name: 'NB_PT_Vegoo_US_01',
      accountId: '',
      platform: 'NewsBreak',
      spend: 178,
      budget: 800,
      usageRate: 22.3,
      cpi: 0.41,
      installs: 180,
      roi1: 61,
      roi3: 55,
      roi7: 49,
      status: 'roi_low'
    },
    {
      id: 'a27',
      name: 'TT_VD_Vegoo_VD_05',
      accountId: '',
      platform: 'TikTok',
      spend: 193,
      budget: 3200,
      usageRate: 6.0,
      cpi: 0.19,
      installs: 1016,
      roi1: 65,
      roi3: 46,
      roi7: 62,
      status: 'normal'
    },
    {
      id: 'a28',
      name: 'TT_Vegoo_PT_07',
      accountId: '',
      platform: 'TikTok',
      spend: 149,
      budget: 3200,
      usageRate: 4.7,
      cpi: 0.19,
      installs: 784,
      roi1: 39,
      roi3: 46,
      roi7: 62,
      status: 'normal'
    },
    {
      id: 'a29',
      name: 'BV_TT_Vegoo_SDV_01',
      accountId: '',
      platform: 'TikTok',
      spend: 120,
      budget: 1000,
      usageRate: 12.0,
      cpi: 0.14,
      installs: 857,
      roi1: 98,
      roi3: 95,
      roi7: 91,
      status: 'normal'
    },
    {
      id: 'a30',
      name: 'BV_TT_PhoneTracker_01',
      accountId: '',
      platform: 'TikTok',
      spend: 88,
      budget: 600,
      usageRate: 14.7,
      cpi: 0.12,
      installs: 733,
      roi1: 101,
      roi3: 97,
      roi7: 94,
      status: 'normal'
    },
    {
      id: 'a31',
      name: 'BV_TT_DramaVue_01',
      accountId: '',
      platform: 'TikTok',
      spend: 55,
      budget: 400,
      usageRate: 13.8,
      cpi: 0.2,
      installs: 275,
      roi1: 72,
      roi3: 68,
      roi7: 65,
      status: 'normal'
    }
  ]

  const accountsFallback = MOCK_ACCOUNTS_FALLBACK
  // 接口未返回时不要展示 mock 数据，否则骨架屏会“盖在 mock 上面”
  const accountsLoading = ref(true)
  const accounts = ref<AccountRow[]>([])
  const totalFallback = accountsFallback.length
  const total = ref<number>(0)

  const pagedData = computed<AccountRow[]>(() => accounts.value)

  let requestSeq = 0

  async function loadAccountPerformance() {
    const [dateStart, dateEnd] = props.dateRange
    if (!dateStart || !dateEnd) return

    const seq = ++requestSeq
    accountsLoading.value = true
    accounts.value = []
    total.value = 0

    try {
      const res = await request.post<{
        accounts: AccountRow[]
        total: number
      }>({
        url: `${ACCOUNT_PERFORMANCE_API_BASE}/app-performance-placeholder-table`,
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
      accounts.value = Array.isArray(res.accounts) ? res.accounts : accountsFallback
      total.value = typeof res.total === 'number' ? res.total : totalFallback
    } catch {
      if (seq !== requestSeq) return
      accounts.value = accountsFallback
      total.value = totalFallback
    } finally {
      if (seq === requestSeq) accountsLoading.value = false
    }
  }

  let filterDebounceTimer: ReturnType<typeof setTimeout> | null = null
  watch(
    [() => props.dateRange, () => props.source, () => props.platform, () => props.filterOwner],
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

  /* ── 工具函数 ── */
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
    min-height: 480px;
    max-height: 560px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;

    :deep(.el-table) {
      min-width: 1080px;
    }
  }

  .ap-table-skeleton-scroll {
    box-sizing: border-box;
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

  html.dark .ap-table-loading-overlay {
    background: rgb(0 0 0 / 18%);
  }

  .ap-account-table {
    --el-table-border-color: var(--el-border-color-lighter);
    --el-table-header-bg-color: var(--el-fill-color-light);

    :deep(.el-table__row) {
      height: 52px;
    }
  }

  html.dark .ap-account-table {
    --el-table-border-color: var(--el-border-color);
    --el-table-header-bg-color: var(--el-fill-color-dark);

    :deep(.el-table__header-wrapper th),
    :deep(.el-table__header-wrapper th .cell) {
      color: #fff;
    }
  }

  html.dark .ap-table-skeleton-scroll {
    :deep(.el-skeleton) {
      opacity: 0.95;
    }
  }

  /* 账户名称单元格 */
  .ap-account-name-cell {
    display: flex;
    gap: 4px;
    align-items: baseline;
    font-family: ui-monospace, monospace;
    font-size: 12.5px;
  }

  .ap-account-name {
    color: var(--el-text-color-primary);
  }

  .ap-account-id {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
  }

  /* 平台单元格 */
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
    width: 22px;
    height: 22px;
    font-size: 11px;
    font-weight: 700;
    user-select: none;
    border-radius: 5px;
  }

  .ap-platform-name-sm {
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  /* 使用率进度条组合 */
  .ap-usage-cell {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
  }

  .ap-usage-value {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 500;
  }

  .ap-usage-bar {
    flex-shrink: 0;
    width: 48px;

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

  /* 底部：汇总 + 分页 */
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
    :deep(.el-pagination__sizes) {
      margin-left: 4px;
    }
  }
</style>
