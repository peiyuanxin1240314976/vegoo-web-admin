<template>
  <div class="map-detail-page">
    <MapDetailHeader :country-code="countryCode" :country-name="countryName">
      <template #right>
        <div class="detail-filters">
          <ElDatePicker
            v-model="filterDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="detail-date-picker"
          />
          <div class="detail-range-box">
            <div
              class="detail-range-slider"
              :style="{ transform: `translateX(${rangeIndex * 100}%)` }"
            />
            <button
              v-for="opt in rangeOptions"
              :key="opt.value"
              type="button"
              class="detail-range-btn"
              :class="{ active: rangeType === opt.value }"
              @click="selectRange(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </template>
    </MapDetailHeader>
    <div class="detail-date-display">今日, {{ currentDateLabel }}</div>

    <MapDetailStatsCards :cards="statCards" />

    <div class="main-row">
      <div class="main-content">
        <div class="section-row two-cols">
          <MapDetailSpendPanel
            :channel-data="channelTableData"
            :campaign-data="campaignTableData"
          />
          <MapDetailRevenuePanel
            :metrics="revenueMetrics"
            :composition-data="revenueCompositionData"
            :app-table-data="appPerformanceData"
            :region-label="countryName"
          />
        </div>

        <div class="section-row">
          <MapDetailRetentionChart
            :local-data="retentionLocalData"
            :global-data="retentionGlobalData"
          />
          <MapDetailLtvChart :data="ltvData" />
          <MapDetailSegmentChart :data="segmentData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import {
    MapDetailHeader,
    MapDetailStatsCards,
    MapDetailSpendPanel,
    MapDetailRevenuePanel,
    MapDetailRetentionChart,
    MapDetailLtvChart,
    MapDetailSegmentChart
  } from './map-detail-component'
  import type { StatCardItem } from './map-detail-component'
  import type { ChannelRow, CampaignRow } from './map-detail-component'
  import type { RevenueCompositionItem, AppPerformanceRow } from './map-detail-component'
  import type { SegmentItem } from './map-detail-component'

  defineOptions({ name: 'CockpitMapDetail' })

  const route = useRoute()

  type RangeType = 'yesterday' | 'past7' | 'month'

  function todayStr(): string {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  function getDateByRange(type: RangeType): string {
    const d = new Date()
    if (type === 'yesterday') {
      d.setDate(d.getDate() - 1)
    } else if (type === 'past7') {
      d.setDate(d.getDate() - 6)
    } else {
      d.setDate(1)
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const rangeOptions: { value: RangeType; label: string }[] = [
    { value: 'yesterday', label: '昨天' },
    { value: 'past7', label: '过去7天' },
    { value: 'month', label: '本月' }
  ]

  const rangeType = ref<RangeType>('yesterday')
  const filterDate = ref(getDateByRange('yesterday'))

  const rangeIndex = computed(() => rangeOptions.findIndex((o) => o.value === rangeType.value))

  function selectRange(value: RangeType) {
    rangeType.value = value
    filterDate.value = getDateByRange(value)
  }

  /** 下方展示的当前日期：今日, YYYY年MM月DD日 */
  const currentDateLabel = computed(() => {
    const s = filterDate.value || todayStr()
    const [y, m, d] = s.split('-')
    return `${y}年${m}月${d}日`
  })

  const countryCode = computed(() => String(route.params.country || '').toUpperCase() || '—')
  const countryName = computed(() => {
    const c = String(route.params.country || '')
    return countryNameMap[c] || c || '—'
  })

  const countryNameMap: Record<string, string> = {
    US: '美国',
    CN: '中国',
    JP: '日本',
    GB: '英国',
    DE: '德国',
    IN: '印度',
    BR: '巴西',
    FR: '法国'
  }

  // 第一排：5 个统计卡片（可后续改为接口数据）
  const statCards = ref<StatCardItem[]>([
    {
      label: '广告收入 (Ad Revenue)',
      value: '$1.03M',
      compare: '↑+12% vs昨日',
      compareUp: true,
      bgClass: 'bg-green'
    },
    {
      label: '广告支出 (Ad Spend)',
      value: '$652K',
      compare: '↑+5% vs昨日',
      compareUp: true,
      bgClass: 'bg-orange'
    },
    { label: 'ROI', value: '1.58', compare: '↑+8% vs昨日', compareUp: true, bgClass: 'bg-blue' },
    {
      label: '活跃用户 DAU',
      value: '45,200',
      compare: '↑+18%',
      compareUp: true,
      bgClass: 'bg-purple'
    },
    { label: '新增用户', value: '3,840', compare: '↑+22%', compareUp: true, bgClass: 'bg-green' }
  ])

  const channelTableData = ref<ChannelRow[]>([
    {
      channel: 'Google Ads',
      spend: 320000,
      installs: 12400,
      cpi: 25.8,
      roi: 1.82,
      roas: '2.1x',
      trend: '↑'
    },
    {
      channel: 'TikTok Ads',
      spend: 89000,
      installs: 3100,
      cpi: 28.7,
      roi: 1.21,
      roas: '1.4x',
      trend: '↓'
    },
    {
      channel: 'Meta Ads',
      spend: 180000,
      installs: 6200,
      cpi: 29.0,
      roi: 1.45,
      roas: '1.6x',
      trend: '↑'
    }
  ])

  const campaignTableData = ref<CampaignRow[]>([
    { name: 'USA_Android_T1_Purchase', amount: 125000, count: 4200, roi: 1.92, status: '投放中' },
    { name: 'USA_iOS_Retarget', amount: 98000, count: 2100, roi: 1.75, status: '投放中' },
    { name: 'USA_Broad_Test', amount: 45000, count: 1800, roi: 0.89, status: '投放中' }
  ])

  const revenueMetrics = ref({
    ecpm: '$8.20',
    ecpmTrend: '↑+3%',
    fillRate: '94%',
    arpu: '$22.8'
  })
  const revenueCompositionData = ref<RevenueCompositionItem[]>([
    { label: '广告收入', value: '$780K', percent: 76, color: '#3984F1' },
    { label: '内购收入', value: '$250K', percent: 24, color: '#f59e0b' }
  ])
  const appPerformanceData = ref<AppPerformanceRow[]>([
    { appName: 'Weather5', adRevenue: 420000, iap: 95000, arpu: 28.5, d7Retention: '42%' },
    { appName: 'BloodPressure2', adRevenue: 198000, iap: 88000, arpu: 19.2, d7Retention: '38%' },
    { appName: 'HealthTracker3', adRevenue: 162000, iap: 67000, arpu: 15.8, d7Retention: '35%' }
  ])

  const retentionLocalData = ref([72, 58, 45, 38, 32])
  const retentionGlobalData = ref([66, 52, 39, 32, 26])

  const ltvData = ref([8.2, 18.5, 32.1, 48.6])

  const segmentData = ref<SegmentItem[]>([
    { value: 52, name: '活跃免费' },
    { value: 30, name: '流失风险' },
    { value: 18, name: '付费用户' }
  ])
</script>

<style scoped lang="scss">
  .map-detail-page {
    padding-bottom: 24px;
  }

  .main-row {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  .main-content {
    flex: 1;
    min-width: 0;
  }

  .detail-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .detail-date-picker {
    width: 140px;
  }

  .detail-range-box {
    position: relative;
    display: inline-flex;
    padding: 3px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .detail-range-slider {
    position: absolute;
    top: 3px;
    left: 3px;
    width: calc((100% - 6px) / 3);
    height: calc(100% - 6px);
    pointer-events: none;
    background: var(--el-color-primary);
    border-radius: 6px;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .detail-range-btn {
    position: relative;
    z-index: 1;
    flex: 1;
    min-width: 80px;
    padding: 6px 14px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 6px;
    transition: color 0.2s ease;

    &:hover {
      color: var(--el-text-color-primary);
    }

    &.active {
      color: #fff;
    }
  }

  .detail-date-display {
    margin-bottom: 16px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  .section-row {
    display: grid;
    gap: 16px;
    margin-bottom: 16px;

    &.two-cols {
      grid-template-columns: 1fr 1fr;
    }

    &:not(.two-cols) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (width <= 1200px) {
    .section-row.two-cols,
    .section-row:not(.two-cols) {
      grid-template-columns: 1fr;
    }
  }
</style>
