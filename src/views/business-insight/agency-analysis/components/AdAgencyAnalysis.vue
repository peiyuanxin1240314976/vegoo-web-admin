<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import * as echarts from 'echarts'
  import ScreenshotModal from './ScreenshotModal.vue'

  // ─────────────────── Types ───────────────────
  type AgencyStatus = 'normal' | 'low' | 'paused'

  interface AgencyRow {
    id: string
    name: string
    nameColor?: string
    hasWarning?: boolean
    appCount: number
    channelCount: number
    spend: number
    installs: number
    cpi: number
    cpa: number
    roi: number
    budgetRate: number
    status: AgencyStatus
  }

  interface AccountDetail {
    app: string
    platform: string
    adPlatform: string
    accountId: string
    accountName: string
    spend: string
    roi: number
    cpa: string
    cpi: string
    installs: number
  }

  interface CampaignDetail {
    name: string
    budget: number
    spend: string
    cpa: string
    cpi: string
    installs: number
    roi34: number | null
    roi33: number | null
    roi32: number | null
    isRed?: boolean
  }

  interface AgencyExpandData {
    appCount: string
    channelCount: string
    totalSpend: number
    totalInstalls: number
    roi: number
    roiTarget: number
    weeklySpend: number
    weeklyRoi: number
    weeklyInstalls: number
    weeklyApps: number
    weeklyAccounts: number
    weeklyCampaigns: number
    weeklyCountries: number
    weeklyDays: number
    accounts: AccountDetail[]
    campaigns: CampaignDetail[]
  }

  interface CampaignRow {
    agency: string
    agencyColor?: string
    name: string
    channel: string
    app: string
    spend: number
    installs: number
    cpi: number
    ctr: number
    cvr: number
    ipm: number
    budget: number
    execRate: number
    trend: 'up' | 'down' | 'flat'
  }

  interface DailyRow {
    date: string
    agency: string
    agencyColor?: string
    spend: number
    installs: number
    cpi: number
    cpa: number
    spendChange: number | null
    installsChange: number | null
  }

  // ─────────────────── KPI Cards ───────────────────
  const kpiCards = ref([
    {
      label: '代投总消耗',
      value: '$284,520',
      changeText: '↑12.3% vs昨日',
      changeUp: true,
      highlighted: true,
      sparkPoints: '0,32 12,28 24,25 36,22 48,20 60,16 72,14 84,10 96,8',
      sparkColor: '#00d4b4'
    },
    {
      label: '代投安装数',
      value: '8,642',
      changeText: '↑8.7%',
      changeUp: true,
      highlighted: true,
      sparkPoints: '0,30 12,27 24,25 36,22 48,18 60,16 72,13 84,10 96,8',
      sparkColor: '#00d4b4'
    },
    {
      label: '平均CPI',
      value: '$2.41',
      changeText: '↓3.2%',
      changeUp: false,
      highlighted: true,
      sparkPoints: '0,10 12,12 24,14 36,18 48,20 60,22 72,25 84,28 96,30',
      sparkColor: '#ef4444'
    },
    { label: '代投应用数', value: '6个', changeText: '', changeUp: null, highlighted: false },
    { label: '代投渠道数', value: '4个', changeText: '', changeUp: null, highlighted: false },
    { label: '代投方数量', value: '3个', changeText: '', changeUp: null, highlighted: false }
  ])

  // ─────────────────── Agency Table Data ───────────────────
  const agencies = ref<AgencyRow[]>([
    {
      id: 'gatherone',
      name: 'GatherOne',
      appCount: 3,
      channelCount: 2,
      spend: 198420,
      installs: 5842,
      cpi: 2.38,
      cpa: 33.96,
      roi: 96,
      budgetRate: 92,
      status: 'normal'
    },
    {
      id: 'kuainiao',
      name: '快鸟',
      nameColor: '#00d4b4',
      appCount: 2,
      channelCount: 1,
      spend: 52680,
      installs: 1845,
      cpi: 2.35,
      cpa: 28.56,
      roi: 103,
      budgetRate: 88,
      status: 'normal'
    },
    {
      id: 'xingtumedia',
      name: '星图传媒',
      nameColor: '#f59e0b',
      hasWarning: true,
      appCount: 1,
      channelCount: 1,
      spend: 33420,
      installs: 955,
      cpi: 2.51,
      cpa: 35.02,
      roi: 88,
      budgetRate: 76,
      status: 'low'
    }
  ])

  // ─────────────────── Expand Detail Data ───────────────────
  const agencyDetailMap: Record<string, AgencyExpandData> = {
    gatherone: {
      appCount: '10/3个',
      channelCount: '2/2个',
      totalSpend: 198420,
      totalInstalls: 5842,
      roi: 96,
      roiTarget: 90,
      weeklySpend: 1241580,
      weeklyRoi: 97,
      weeklyInstalls: 36421,
      weeklyApps: 3,
      weeklyAccounts: 8,
      weeklyCampaigns: 42,
      weeklyCountries: 12,
      weeklyDays: 7,
      accounts: [
        {
          app: 'PhoneTracker2',
          platform: '安卓',
          adPlatform: 'Facebook',
          accountId: '7519055062153461761',
          accountName: 'panda-VEGOO-PT-02',
          spend: '$502',
          roi: 104,
          cpa: '--',
          cpi: '0.19',
          installs: 2649
        },
        {
          app: 'PhoneTracker2',
          platform: '安卓',
          adPlatform: 'Facebook',
          accountId: '7589528572449308688',
          accountName: 'BV-ZL-PT-04',
          spend: '$120',
          roi: 113,
          cpa: '--',
          cpi: '0.13',
          installs: 918
        },
        {
          app: 'SpyApp',
          platform: '安卓',
          adPlatform: 'Google',
          accountId: '4421055062153461001',
          accountName: 'SpyApp-Google-US-01',
          spend: '$280',
          roi: 98,
          cpa: '--',
          cpi: '0.22',
          installs: 1180
        },
        {
          app: 'SpyApp',
          platform: '安卓',
          adPlatform: 'Google',
          accountId: '4421055062153461002',
          accountName: 'SpyApp-Google-CA-01',
          spend: '$150',
          roi: 95,
          cpa: '--',
          cpi: '0.25',
          installs: 620
        }
      ],
      campaigns: [
        {
          name: 'PT_761_VO_WW_IL_0228',
          budget: 200,
          spend: '$33.2',
          cpa: '--',
          cpi: '0.21',
          installs: 173,
          roi34: 116,
          roi33: 121,
          roi32: 93
        },
        {
          name: 'PT_761_VO_WW_IL_0228_03',
          budget: 200,
          spend: '$74.9',
          cpa: '--',
          cpi: '0.21',
          installs: 354,
          roi34: 105,
          roi33: 116,
          roi32: 96
        },
        {
          name: 'PT_761_VO_WW_IL_0228_01',
          budget: 200,
          spend: '$78.1',
          cpa: '--',
          cpi: '0.22',
          installs: 349,
          roi34: 99,
          roi33: 90,
          roi32: 101
        },
        {
          name: 'PT_761_VO_WW_IL_0208_2_03',
          budget: 300,
          spend: '$18.9',
          cpa: '--',
          cpi: '0.14',
          installs: 132,
          roi34: 148,
          roi33: 106,
          roi32: 95
        },
        {
          name: 'PT_761_VO_WW_IL_0208_2_02',
          budget: 200,
          spend: '$13.5',
          cpa: '--',
          cpi: '0.17',
          installs: 79,
          roi34: 125,
          roi33: 129,
          roi32: 99
        },
        {
          name: 'PT_761_VO_WW_IL_0228_02',
          budget: 200,
          spend: '$10.8',
          cpa: '--',
          cpi: '0.18',
          installs: 59,
          roi34: 100,
          roi33: 92,
          roi32: 110
        },
        {
          name: 'PT_761_VO_WW_IL_0228_04',
          budget: 100,
          spend: '$15.4',
          cpa: '--',
          cpi: '0.22',
          installs: 69,
          roi34: 135,
          roi33: 102,
          roi32: 90
        },
        {
          name: 'PT_761_VO_WW_IL_0208_2_01',
          budget: 200,
          spend: '$32.8',
          cpa: '--',
          cpi: '0.16',
          installs: 202,
          roi34: 112,
          roi33: 112,
          roi32: 103
        },
        {
          name: 'PT_761_VO_WW_IL_0228_06',
          budget: 100,
          spend: '$52.5',
          cpa: '--',
          cpi: '0.22',
          installs: 236,
          roi34: 96,
          roi33: null,
          roi32: null
        },
        {
          name: 'PT_761_VO_WW_IL_0212_1_03',
          budget: 200,
          spend: '$13.9',
          cpa: '--',
          cpi: '0.21',
          installs: 66,
          roi34: 115,
          roi33: 146,
          roi32: 75,
          isRed: true
        }
      ]
    },
    kuainiao: {
      appCount: '5/2个',
      channelCount: '1/1个',
      totalSpend: 52680,
      totalInstalls: 1845,
      roi: 103,
      roiTarget: 90,
      weeklySpend: 284500,
      weeklyRoi: 103,
      weeklyInstalls: 12840,
      weeklyApps: 2,
      weeklyAccounts: 3,
      weeklyCampaigns: 18,
      weeklyCountries: 5,
      weeklyDays: 7,
      accounts: [
        {
          app: 'PhoneTracker2',
          platform: '安卓',
          adPlatform: 'TikTok',
          accountId: '7519055062153461100',
          accountName: 'kuainiao-TK-PT-01',
          spend: '$320',
          roi: 105,
          cpa: '--',
          cpi: '0.20',
          installs: 1124
        }
      ],
      campaigns: [
        {
          name: 'KN_TK_WW_0228_01',
          budget: 300,
          spend: '$32.5',
          cpa: '--',
          cpi: '0.20',
          installs: 164,
          roi34: 108,
          roi33: 112,
          roi32: 98
        },
        {
          name: 'KN_TK_WW_0228_02',
          budget: 200,
          spend: '$21.3',
          cpa: '--',
          cpi: '0.21',
          installs: 102,
          roi34: 103,
          roi33: 95,
          roi32: 107
        }
      ]
    },
    xingtumedia: {
      appCount: '3/1个',
      channelCount: '1/1个',
      totalSpend: 33420,
      totalInstalls: 955,
      roi: 88,
      roiTarget: 90,
      weeklySpend: 196400,
      weeklyRoi: 85,
      weeklyInstalls: 6820,
      weeklyApps: 1,
      weeklyAccounts: 2,
      weeklyCampaigns: 12,
      weeklyCountries: 3,
      weeklyDays: 7,
      accounts: [
        {
          app: 'SpyApp',
          platform: '安卓',
          adPlatform: 'Meta',
          accountId: '7519055062153461300',
          accountName: 'xingtumedia-Meta-01',
          spend: '$210',
          roi: 88,
          cpa: '--',
          cpi: '0.25',
          installs: 955
        }
      ],
      campaigns: [
        {
          name: 'XTM_Meta_WW_0228_01',
          budget: 500,
          spend: '$33.4',
          cpa: '--',
          cpi: '0.25',
          installs: 136,
          roi34: 88,
          roi33: 82,
          roi32: 90
        }
      ]
    }
  }

  // ─────────────────── Campaign Detail Table ───────────────────
  const campaigns = ref<CampaignRow[]>([
    {
      agency: 'GatherOne',
      name: 'PhoneTracker2_US_Facebook_001',
      channel: 'Facebook',
      app: 'PhoneTracker2',
      spend: 68420,
      installs: 1842,
      cpi: 2.36,
      ctr: 3.8,
      cvr: 5.2,
      ipm: 18.4,
      budget: 75000,
      execRate: 91,
      trend: 'up'
    },
    {
      agency: 'GatherOne',
      name: 'PhoneTracker2_UK_Facebook_002',
      channel: 'Facebook',
      app: 'PhoneTracker2',
      spend: 52180,
      installs: 1456,
      cpi: 2.4,
      ctr: 3.5,
      cvr: 4.9,
      ipm: 16.8,
      budget: 60000,
      execRate: 87,
      trend: 'up'
    },
    {
      agency: 'GatherOne',
      name: 'PhoneTracker2_AU_Facebook_003',
      channel: 'Facebook',
      app: 'PhoneTracker2',
      spend: 38650,
      installs: 1024,
      cpi: 2.42,
      ctr: 3.2,
      cvr: 4.6,
      ipm: 15.2,
      budget: 45000,
      execRate: 86,
      trend: 'up'
    },
    {
      agency: 'GatherOne',
      name: 'SpyApp_US_Google_001',
      channel: 'Google',
      app: 'SpyApp',
      spend: 28420,
      installs: 820,
      cpi: 2.34,
      ctr: 2.8,
      cvr: 4.2,
      ipm: 14.8,
      budget: 32000,
      execRate: 89,
      trend: 'up'
    },
    {
      agency: 'GatherOne',
      name: 'SpyApp_CA_Google_002',
      channel: 'Google',
      app: 'SpyApp',
      spend: 10750,
      installs: 700,
      cpi: 2.38,
      ctr: 2.6,
      cvr: 3.9,
      ipm: 13.2,
      budget: 12000,
      execRate: 90,
      trend: 'flat'
    },
    {
      agency: '快鸟',
      agencyColor: '#00d4b4',
      name: 'PhoneTracker2_CA_TikTok_001',
      channel: 'TikTok',
      app: 'PhoneTracker2',
      spend: 32480,
      installs: 1124,
      cpi: 2.39,
      ctr: 2.9,
      cvr: 4.5,
      ipm: 15.6,
      budget: 38000,
      execRate: 85,
      trend: 'up'
    },
    {
      agency: '快鸟',
      agencyColor: '#00d4b4',
      name: 'PhoneTracker2_IN_TikTok_002',
      channel: 'TikTok',
      app: 'PhoneTracker2',
      spend: 20200,
      installs: 721,
      cpi: 2.36,
      ctr: 2.7,
      cvr: 4.1,
      ipm: 14.2,
      budget: 24000,
      execRate: 84,
      trend: 'flat'
    },
    {
      agency: '星图传媒',
      agencyColor: '#f59e0b',
      name: 'SpyApp_JP_Meta_001',
      channel: 'Meta',
      app: 'SpyApp',
      spend: 33420,
      installs: 955,
      cpi: 2.51,
      ctr: 2.4,
      cvr: 3.9,
      ipm: 12.8,
      budget: 44000,
      execRate: 76,
      trend: 'down'
    }
  ])

  // ─────────────────── Daily Comparison ───────────────────
  const dailyRows = ref<DailyRow[]>([
    {
      date: '2026-03-07',
      agency: 'GatherOne',
      spend: 198420,
      installs: 5842,
      cpi: 2.38,
      cpa: 33.96,
      spendChange: 14.3,
      installsChange: 11.2
    },
    {
      date: '2026-03-07',
      agency: '快鸟',
      agencyColor: '#00d4b4',
      spend: 52680,
      installs: 1845,
      cpi: 2.35,
      cpa: 28.56,
      spendChange: 24.0,
      installsChange: 18.6
    },
    {
      date: '2026-03-07',
      agency: '星图传媒',
      agencyColor: '#f59e0b',
      spend: 33420,
      installs: 955,
      cpi: 2.51,
      cpa: 35.02,
      spendChange: 18.2,
      installsChange: 12.4
    },
    {
      date: '2026-03-06',
      agency: 'GatherOne',
      spend: 173590,
      installs: 5257,
      cpi: 2.38,
      cpa: 33.4,
      spendChange: 6.8,
      installsChange: 5.2
    },
    {
      date: '2026-03-06',
      agency: '快鸟',
      agencyColor: '#00d4b4',
      spend: 42480,
      installs: 1554,
      cpi: 2.36,
      cpa: 27.8,
      spendChange: 3.2,
      installsChange: 2.8
    },
    {
      date: '2026-03-06',
      agency: '星图传媒',
      agencyColor: '#f59e0b',
      spend: 36420,
      installs: 1086,
      cpi: 2.49,
      cpa: 33.54,
      spendChange: -2.1,
      installsChange: -1.8
    },
    {
      date: '2026-03-05',
      agency: 'GatherOne',
      spend: 162480,
      installs: 4996,
      cpi: 2.37,
      cpa: 32.5,
      spendChange: null,
      installsChange: null
    },
    {
      date: '2026-03-05',
      agency: '快鸟',
      agencyColor: '#00d4b4',
      spend: 41160,
      installs: 1512,
      cpi: 2.35,
      cpa: 27.22,
      spendChange: null,
      installsChange: null
    }
  ])

  // ─────────────────── Expand State ───────────────────
  const expandedSet = ref<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    if (expandedSet.value.has(id)) {
      expandedSet.value.delete(id)
    } else {
      expandedSet.value.add(id)
    }
    expandedSet.value = new Set(expandedSet.value) // trigger reactivity
  }

  const isExpanded = (id: string) => expandedSet.value.has(id)

  // ─────────────────── Screenshot Modal ───────────────────
  const showScreenshot = ref(false)
  const screenshotAgency = ref('GatherOne')

  const openScreenshot = (agencyName?: string) => {
    screenshotAgency.value = agencyName || 'GatherOne'
    showScreenshot.value = true
  }

  // ─────────────────── Charts ───────────────────
  const donutRef = ref<HTMLElement | null>(null)
  const barRef = ref<HTMLElement | null>(null)
  const countryRef = ref<HTMLElement | null>(null)
  const trendRef = ref<HTMLElement | null>(null)
  let chartInstances: echarts.ECharts[] = []

  const disposeCharts = () => {
    chartInstances.forEach((c) => c.dispose())
    chartInstances = []
  }

  const initCharts = () => {
    disposeCharts()
    const bg = 'transparent'

    // Donut chart
    if (donutRef.value) {
      const c = echarts.init(donutRef.value)
      c.setOption({
        backgroundColor: bg,
        tooltip: {
          trigger: 'item',
          formatter: '{b}: ${c}',
          backgroundColor: '#1a2d44',
          borderColor: '#1e3a5f',
          textStyle: { color: '#e2e8f0', fontSize: 11 }
        },
        legend: {
          orient: 'vertical',
          right: 4,
          top: 'middle',
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { color: '#94a3b8', fontSize: 10 },
          formatter: (name: string) => {
            const map: Record<string, string> = {
              GatherOne: '$198,420 (69.7%)',
              快鸟: '$52,680 (18.5%)',
              星图传媒: '$33,420 (11.8%)'
            }
            return `${name}  ${map[name] || ''}`
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['55%', '80%'],
            center: ['32%', '50%'],
            itemStyle: { borderColor: '#0d1829', borderWidth: 2 },
            label: {
              show: true,
              position: 'center',
              formatter: () => '$284,520',
              color: '#e2e8f0',
              fontSize: 13,
              fontWeight: 'bold'
            },
            data: [
              { value: 198420, name: 'GatherOne', itemStyle: { color: '#3b82f6' } },
              { value: 52680, name: '快鸟', itemStyle: { color: '#00d4b4' } },
              { value: 33420, name: '星图传媒', itemStyle: { color: '#f59e0b' } }
            ]
          }
        ]
      })
      chartInstances.push(c)
    }

    // Grouped bar
    if (barRef.value) {
      const c = echarts.init(barRef.value)
      c.setOption({
        backgroundColor: bg,
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#1a2d44',
          borderColor: '#1e3a5f',
          textStyle: { color: '#e2e8f0', fontSize: 11 }
        },
        legend: {
          top: 4,
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { color: '#94a3b8', fontSize: 9 },
          data: ['GatherOne', '快鸟', '星图传媒']
        },
        grid: { top: 30, right: 8, bottom: 24, left: 48 },
        xAxis: {
          type: 'category',
          data: ['Facebook', 'Google', 'TikTok', 'Meta'],
          axisLabel: { color: '#64748b', fontSize: 9 },
          axisLine: { lineStyle: { color: '#1e3a5f' } },
          axisTick: { show: false }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#64748b', fontSize: 9, formatter: (v: number) => `$${v / 1000}k` },
          splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
        },
        series: [
          {
            name: 'GatherOne',
            type: 'bar',
            data: [159000, 39000, 0, 0],
            itemStyle: { color: '#3b82f6', borderRadius: [2, 2, 0, 0] },
            barMaxWidth: 14
          },
          {
            name: '快鸟',
            type: 'bar',
            data: [0, 0, 52680, 0],
            itemStyle: { color: '#00d4b4', borderRadius: [2, 2, 0, 0] },
            barMaxWidth: 14
          },
          {
            name: '星图传媒',
            type: 'bar',
            data: [0, 0, 0, 33420],
            itemStyle: { color: '#f59e0b', borderRadius: [2, 2, 0, 0] },
            barMaxWidth: 14
          }
        ]
      })
      chartInstances.push(c)
    }

    // Country horizontal bar
    if (countryRef.value) {
      const countries = ['FR', 'DE', 'JP', 'IN', 'AU', 'CA', 'UK', 'US']
      const values = [12580, 18420, 33420, 20200, 38650, 52680, 68180, 98420]
      const percents = ['4.4%', '6.5%', '11.8%', '7.1%', '13.6%', '18.5%', '24.0%', '34.6%']
      const c = echarts.init(countryRef.value)
      c.setOption({
        backgroundColor: bg,
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#1a2d44',
          borderColor: '#1e3a5f',
          textStyle: { color: '#e2e8f0', fontSize: 11 }
        },
        grid: { top: 4, right: 80, bottom: 4, left: 28 },
        xAxis: { type: 'value', show: false },
        yAxis: {
          type: 'category',
          data: countries,
          axisLabel: { color: '#94a3b8', fontSize: 10 },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        series: [
          {
            type: 'bar',
            data: values,
            barMaxWidth: 14,
            itemStyle: { color: '#00d4b4', borderRadius: [0, 3, 3, 0] },
            label: {
              show: true,
              position: 'right',
              color: '#94a3b8',
              fontSize: 9,
              formatter: (p: any) => `$${(p.value / 1000).toFixed(0)}k (${percents[p.dataIndex]})`
            }
          }
        ]
      })
      chartInstances.push(c)
    }

    // Trend area chart
    if (trendRef.value) {
      const dates = ['Mar 06', 'Mar 07', 'Mar 08', 'Mar 09', 'Mar 10', 'Mar 11', 'Mar 07']
      const c = echarts.init(trendRef.value)
      c.setOption({
        backgroundColor: bg,
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#1a2d44',
          borderColor: '#1e3a5f',
          textStyle: { color: '#e2e8f0', fontSize: 11 }
        },
        legend: {
          bottom: 2,
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { color: '#94a3b8', fontSize: 9 }
        },
        grid: { top: 12, right: 12, bottom: 36, left: 46 },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: { color: '#64748b', fontSize: 9 },
          axisLine: { lineStyle: { color: '#1e3a5f' } },
          axisTick: { show: false },
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#64748b', fontSize: 9, formatter: (v: number) => `$${v / 1000}k` },
          splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
        },
        series: [
          {
            name: 'GatherOne',
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: [120000, 140000, 160000, 175000, 185000, 195000, 198420],
            lineStyle: { color: '#3b82f6', width: 2 },
            itemStyle: { color: '#3b82f6' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(59,130,246,0.35)' },
                  { offset: 1, color: 'rgba(59,130,246,0.02)' }
                ]
              }
            }
          },
          {
            name: '快鸟',
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: [28000, 32000, 38000, 42000, 46000, 50000, 52680],
            lineStyle: { color: '#00d4b4', width: 2 },
            itemStyle: { color: '#00d4b4' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(0,212,180,0.25)' },
                  { offset: 1, color: 'rgba(0,212,180,0.02)' }
                ]
              }
            }
          },
          {
            name: '星图传媒',
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: [25000, 30000, 32000, 34000, 35000, 36000, 33420],
            lineStyle: { color: '#f59e0b', width: 2 },
            itemStyle: { color: '#f59e0b' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(245,158,11,0.2)' },
                  { offset: 1, color: 'rgba(245,158,11,0.02)' }
                ]
              }
            }
          }
        ]
      })
      chartInstances.push(c)
    }
  }

  onMounted(() => nextTick(initCharts))
  onBeforeUnmount(disposeCharts)

  // ─────────────────── Helpers ───────────────────
  const fmtM = (v: number) => `$${v.toLocaleString()}`

  const statusInfo = (s: AgencyStatus) => {
    if (s === 'normal') return { label: '正常', dot: '#10b981', text: '#10b981' }
    if (s === 'low') return { label: '偏低', dot: '#f59e0b', text: '#f59e0b' }
    return { label: '暂停', dot: '#ef4444', text: '#ef4444' }
  }

  const roiClass = (v: number) => {
    if (v >= 100) return 'teal'
    if (v >= 90) return 'yellow'
    return 'red'
  }

  const roiBadgeClass = (v: number | null) => {
    if (v === null) return ''
    if (v >= 110) return 'roi-green'
    if (v >= 95) return 'roi-teal'
    if (v >= 85) return 'roi-yellow'
    return 'roi-red'
  }

  const changeClass = (v: number | null) => (v === null ? '' : v >= 0 ? 'change-up' : 'change-down')
  const changeTxt = (v: number | null) =>
    v === null ? '--' : `${v >= 0 ? '↑' : '↓'}${Math.abs(v)}%`

  const trendPath = (t: string) => {
    if (t === 'up') return 'M2,12 L6,8 L10,9 L14,5'
    if (t === 'down') return 'M2,5 L6,8 L10,7 L14,12'
    return 'M2,8 L6,8 L10,8 L14,8'
  }
  const trendColor = (t: string) => (t === 'up' ? '#00d4b4' : t === 'down' ? '#ef4444' : '#64748b')
</script>

<template>
  <div class="page-wrap">
    <!-- ── Top bar ── -->
    <div class="top-bar">
      <div class="breadcrumb">
        <span class="bc-parent">用户增长</span>
        <span class="bc-sep">›</span>
        <span class="bc-current">代投分析</span>
      </div>
      <div class="top-filters">
        <el-date-picker
          model-value="2026-03-07"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          size="small"
          class="filter-date"
          prefix-icon=""
        >
          <template #prefix>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-right: 2px">
              <rect x="1" y="2" width="12" height="11" rx="2" stroke="#64748b" stroke-width="1.2" />
              <path
                d="M1 5h12M4 1v2M10 1v2"
                stroke="#64748b"
                stroke-width="1.2"
                stroke-linecap="round"
              />
            </svg>
          </template>
        </el-date-picker>

        <el-select model-value="全部应用" size="small" class="filter-select">
          <el-option label="全部应用" value="all" />
        </el-select>

        <el-select model-value="全部代投方" size="small" class="filter-select">
          <el-option label="全部代投方" value="all" />
        </el-select>

        <el-select model-value="全部渠道" size="small" class="filter-select">
          <el-option label="全部渠道" value="all" />
        </el-select>

        <button class="btn-screenshot" @click="openScreenshot()">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-right: 6px">
            <rect
              x="1"
              y="2"
              width="12"
              height="10"
              rx="2"
              stroke="currentColor"
              stroke-width="1.2"
            />
            <circle cx="7" cy="7" r="2.5" stroke="currentColor" stroke-width="1.2" />
          </svg>
          一键截图复制
        </button>
      </div>
    </div>

    <!-- ── KPI Cards ── -->
    <div class="kpi-row">
      <div
        v-for="(card, i) in kpiCards"
        :key="i"
        class="kpi-card"
        :class="{ highlighted: card.highlighted }"
      >
        <div class="kpi-label">{{ card.label }}</div>
        <div class="kpi-value">{{ card.value }}</div>
        <div v-if="card.changeText" class="kpi-change" :class="card.changeUp ? 'up' : 'down'">
          {{ card.changeText }}
        </div>
        <svg
          v-if="card.sparkPoints"
          class="kpi-spark"
          viewBox="0 0 96 36"
          fill="none"
          preserveAspectRatio="none"
        >
          <polyline
            :points="card.sparkPoints"
            :stroke="card.sparkColor"
            stroke-width="1.5"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <!-- Badge numbers top-left for highlighted -->
        <div v-if="card.highlighted" class="kpi-idx">{{ i + 1 }}</div>
      </div>
    </div>

    <!-- ── Main layout ── -->
    <div class="main-layout">
      <!-- Left content -->
      <div class="main-left">
        <!-- ① Agency Summary Table -->
        <div class="section-block">
          <div class="section-header">
            <div class="section-title">
              <span class="section-num">1</span>
              代投方汇总
              <span class="section-subtitle">14px</span>
            </div>
            <div class="section-actions">
              <span class="data-date">数据日期: 2026-03-07</span>
              <button class="btn-small-outline">导出</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th class="th-expand"></th>
                <th>代投方</th>
                <th class="text-right">应用数</th>
                <th class="text-right">渠道数</th>
                <th class="text-right">消耗($)</th>
                <th class="text-right">安装数</th>
                <th class="text-right">CPI($)</th>
                <th class="text-right">CPA($)</th>
                <th class="text-right">首日ROI</th>
                <th>预算执行率</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="ag in agencies" :key="ag.id">
                <!-- Main row -->
                <tr class="agency-row" :class="{ expanded: isExpanded(ag.id) }">
                  <td class="td-expand">
                    <button
                      class="expand-arrow"
                      :class="{ open: isExpanded(ag.id) }"
                      @click="toggleExpand(ag.id)"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M2 3.5L5 6.5L8 3.5"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />
                      </svg>
                    </button>
                  </td>
                  <td>
                    <div class="agency-name-cell">
                      <span :style="{ color: ag.nameColor || '#e2e8f0' }">{{ ag.name }}</span>
                      <span v-if="ag.hasWarning" class="warn-icon">⚠</span>
                    </div>
                  </td>
                  <td class="text-right">{{ ag.appCount }}</td>
                  <td class="text-right">{{ ag.channelCount }}</td>
                  <td class="text-right fw-600">{{ fmtM(ag.spend) }}</td>
                  <td class="text-right">{{ ag.installs.toLocaleString() }}</td>
                  <td class="text-right">${{ ag.cpi.toFixed(2) }}</td>
                  <td class="text-right">${{ ag.cpa.toFixed(2) }}</td>
                  <td class="text-right" :class="roiClass(ag.roi)">
                    <span :class="[`roi-text-${roiClass(ag.roi)}`]">{{ ag.roi }}%</span>
                  </td>
                  <td>
                    <div class="budget-bar-wrap">
                      <div class="budget-bar-track">
                        <div
                          class="budget-bar-fill"
                          :style="{
                            width: `${ag.budgetRate}%`,
                            background:
                              ag.budgetRate >= 90
                                ? '#00d4b4'
                                : ag.budgetRate >= 80
                                  ? '#3b82f6'
                                  : '#f59e0b'
                          }"
                        />
                      </div>
                      <span class="budget-pct">{{ ag.budgetRate }}%</span>
                    </div>
                  </td>
                  <td>
                    <div class="status-cell">
                      <span class="status-dot" :style="{ background: statusInfo(ag.status).dot }" />
                      <span :style="{ color: statusInfo(ag.status).text }">{{
                        statusInfo(ag.status).label
                      }}</span>
                    </div>
                  </td>
                  <td>
                    <button class="btn-expand-text" @click="toggleExpand(ag.id)">
                      {{ isExpanded(ag.id) ? '收起 ∧' : '展开 ∨' }}
                    </button>
                  </td>
                </tr>

                <!-- Expanded row -->
                <tr v-if="isExpanded(ag.id)" class="expand-row">
                  <td colspan="12" class="expand-td">
                    <div class="expand-panel">
                      <!-- Expand header -->
                      <div class="exp-hd">
                        <div class="exp-hd-left">
                          <span class="exp-device-icon">📱</span>
                          <span class="exp-name" :style="{ color: ag.nameColor || '#e2e8f0' }">{{
                            ag.name
                          }}</span>
                          <span class="exp-badge active">ACTIVE</span>
                          <span class="exp-meta">广告投放代理商</span>
                          <span class="exp-meta">数据日期: 2026-03-07</span>
                        </div>
                        <div class="exp-hd-right">
                          <button class="btn-sm-teal">展开全部</button>
                          <button class="btn-sm-ghost">自定义列</button>
                          <button class="btn-sm-ghost">↓ 导出</button>
                          <button class="btn-sm-ghost" @click="toggleExpand(ag.id)">收起 ∧</button>
                        </div>
                      </div>

                      <!-- Summary metrics -->
                      <div class="exp-metrics">
                        <div class="exp-metric">
                          <div class="exp-metric-label">应用数</div>
                          <div class="exp-metric-value">{{ agencyDetailMap[ag.id].appCount }}</div>
                        </div>
                        <div class="exp-metric">
                          <div class="exp-metric-label">广告渠道</div>
                          <div class="exp-metric-value">{{
                            agencyDetailMap[ag.id].channelCount
                          }}</div>
                        </div>
                        <div class="exp-metric">
                          <div class="exp-metric-label">总消耗</div>
                          <div class="exp-metric-value teal">{{
                            fmtM(agencyDetailMap[ag.id].totalSpend)
                          }}</div>
                        </div>
                        <div class="exp-metric">
                          <div class="exp-metric-label">总安装</div>
                          <div class="exp-metric-value">{{
                            agencyDetailMap[ag.id].totalInstalls.toLocaleString()
                          }}</div>
                        </div>
                        <div class="exp-metric">
                          <div class="exp-metric-label">平均首日ROI</div>
                          <div class="exp-metric-value-roi">
                            <span :class="`roi-text-${roiClass(agencyDetailMap[ag.id].roi)}`">
                              {{ agencyDetailMap[ag.id].roi }}%
                            </span>
                            <span
                              class="roi-tag"
                              :class="
                                agencyDetailMap[ag.id].roi >= agencyDetailMap[ag.id].roiTarget
                                  ? 'roi-tag-meet'
                                  : 'roi-tag-miss'
                              "
                            >
                              {{
                                agencyDetailMap[ag.id].roi >= agencyDetailMap[ag.id].roiTarget
                                  ? '达标'
                                  : '未达'
                              }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- Weekly summary -->
                      <div class="exp-weekly">
                        <span class="weekly-lbl">近7天汇总</span>
                        <span class="weekly-item"
                          >广告支出:
                          <strong
                            >${{ agencyDetailMap[ag.id].weeklySpend.toLocaleString() }}</strong
                          ></span
                        >
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item"
                          >首日ROI:
                          <strong class="teal"
                            >{{ agencyDetailMap[ag.id].weeklyRoi }}%</strong
                          ></span
                        >
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item">CPA: <strong>--</strong></span>
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item"
                          >安装数:
                          <strong>{{
                            agencyDetailMap[ag.id].weeklyInstalls.toLocaleString()
                          }}</strong></span
                        >
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item"
                          >在投应用: <strong>{{ agencyDetailMap[ag.id].weeklyApps }}</strong></span
                        >
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item"
                          >广告账户:
                          <strong>{{ agencyDetailMap[ag.id].weeklyAccounts }}</strong></span
                        >
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item"
                          >广告系列:
                          <strong>{{ agencyDetailMap[ag.id].weeklyCampaigns }}</strong></span
                        >
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item"
                          >投放国家:
                          <strong>{{ agencyDetailMap[ag.id].weeklyCountries }}</strong></span
                        >
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item"
                          >投放天数: <strong>{{ agencyDetailMap[ag.id].weeklyDays }}</strong></span
                        >
                      </div>

                      <!-- Account summary sub-table -->
                      <div class="exp-sub-section">
                        <div class="exp-sub-title">账户汇总</div>
                        <table class="sub-table">
                          <thead>
                            <tr>
                              <th>应用</th>
                              <th>平台</th>
                              <th>广告平台</th>
                              <th>账户ID</th>
                              <th>账户名称</th>
                              <th>广告支出</th>
                              <th>首日ROI</th>
                              <th>CPA</th>
                              <th>CPI</th>
                              <th>安装数</th>
                              <th>操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(acc, ai) in agencyDetailMap[ag.id].accounts" :key="ai">
                              <td>{{ acc.app }}</td>
                              <td>{{ acc.platform }}</td>
                              <td>{{ acc.adPlatform }}</td>
                              <td class="account-id">{{ acc.accountId }}</td>
                              <td>{{ acc.accountName }}</td>
                              <td>{{ acc.spend }}</td>
                              <td :class="`roi-text-${roiClass(acc.roi)}`">{{ acc.roi }}%</td>
                              <td>{{ acc.cpa }}</td>
                              <td>{{ acc.cpi }}</td>
                              <td>{{ acc.installs.toLocaleString() }}</td>
                              <td><span class="link-action">详情</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <!-- Campaign detail sub-table -->
                      <div class="exp-sub-section">
                        <div class="exp-sub-title">近期明细</div>
                        <table class="sub-table">
                          <thead>
                            <tr>
                              <th>广告系列名称</th>
                              <th>预算</th>
                              <th>广告支出</th>
                              <th>CPA</th>
                              <th>CPI</th>
                              <th>安装数</th>
                              <th class="roi-date-head">3/4</th>
                              <th class="roi-date-head">3/3</th>
                              <th class="roi-date-head">3/2</th>
                              <th>明细</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(cp, ci) in agencyDetailMap[ag.id].campaigns"
                              :key="ci"
                              :class="{ 'row-red-tint': cp.isRed }"
                            >
                              <td :class="{ 'text-danger': cp.isRed }">{{ cp.name }}</td>
                              <td>${{ cp.budget }}</td>
                              <td>{{ cp.spend }}</td>
                              <td>{{ cp.cpa }}</td>
                              <td>{{ cp.cpi }}</td>
                              <td>{{ cp.installs }}</td>
                              <td>
                                <span
                                  v-if="cp.roi34 !== null"
                                  class="roi-badge"
                                  :class="roiBadgeClass(cp.roi34)"
                                  >{{ cp.roi34 }}%</span
                                >
                                <span v-else class="dim">--</span>
                              </td>
                              <td>
                                <span
                                  v-if="cp.roi33 !== null"
                                  class="roi-badge"
                                  :class="roiBadgeClass(cp.roi33)"
                                  >{{ cp.roi33 }}%</span
                                >
                                <span v-else class="dim">--</span>
                              </td>
                              <td>
                                <span
                                  v-if="cp.roi32 !== null"
                                  class="roi-badge"
                                  :class="roiBadgeClass(cp.roi32)"
                                  >{{ cp.roi32 }}%</span
                                >
                                <span v-else class="dim">--</span>
                              </td>
                              <td><span class="link-action">查看</span></td>
                            </tr>
                          </tbody>
                        </table>
                        <div class="sub-footnote"
                          >注: 时区 PST(UTC-8), 货币 USD; ROI计算包含广告收入及付费收入。</div
                        >
                      </div>
                    </div>
                  </td>
                </tr>
              </template>

              <!-- Total row -->
              <tr class="total-row">
                <td></td>
                <td>小计</td>
                <td class="text-right">6</td>
                <td class="text-right">4</td>
                <td class="text-right fw-600">$284,520</td>
                <td class="text-right">8,642</td>
                <td class="text-right">$2.41</td>
                <td class="text-right">$32.18</td>
                <td class="text-right">96%</td>
                <td>
                  <div class="budget-bar-wrap">
                    <div class="budget-bar-track">
                      <div class="budget-bar-fill" style="width: 88%; background: #94a3b8" />
                    </div>
                    <span class="budget-pct">88%</span>
                  </div>
                </td>
                <td>--</td>
                <td>--</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ② Campaign Detail Table -->
        <div class="section-block">
          <div class="section-header">
            <div class="section-title">
              <span class="section-num">2</span>
              代投广告系列明细
            </div>
            <div class="section-actions">
              <button class="btn-small-outline">自定义列</button>
              <button class="btn-small-outline">导出</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>代投方</th>
                <th>广告系列名称</th>
                <th>渠道</th>
                <th>应用</th>
                <th class="text-right">消耗($)</th>
                <th class="text-right">安装数</th>
                <th class="text-right">CPI($)</th>
                <th class="text-right">CTR(%)</th>
                <th class="text-right">CVR(%)</th>
                <th class="text-right">IPM</th>
                <th class="text-right">预算($)</th>
                <th class="text-right">执行率</th>
                <th>7日趋势</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cp, i) in campaigns" :key="i" class="data-row">
                <td :style="{ color: cp.agencyColor || '#e2e8f0' }">{{ cp.agency }}</td>
                <td class="name-cell">{{ cp.name }}</td>
                <td>{{ cp.channel }}</td>
                <td>{{ cp.app }}</td>
                <td class="text-right">${{ cp.spend.toLocaleString() }}</td>
                <td class="text-right">{{ cp.installs.toLocaleString() }}</td>
                <td class="text-right">${{ cp.cpi.toFixed(2) }}</td>
                <td class="text-right">{{ cp.ctr }}%</td>
                <td class="text-right">{{ cp.cvr }}%</td>
                <td class="text-right">{{ cp.ipm }}</td>
                <td class="text-right">${{ cp.budget.toLocaleString() }}</td>
                <td class="text-right">{{ cp.execRate }}%</td>
                <td>
                  <svg width="40" height="18" viewBox="0 0 16 14" fill="none">
                    <path
                      :d="trendPath(cp.trend)"
                      :stroke="trendColor(cp.trend)"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      fill="none"
                    />
                    <path
                      :d="trendPath(cp.trend) + ' V14 H2 Z'"
                      :fill="trendColor(cp.trend)"
                      fill-opacity="0.15"
                    />
                  </svg>
                  <span class="trend-arrow" :style="{ color: trendColor(cp.trend) }">
                    {{ cp.trend === 'up' ? '↑' : cp.trend === 'down' ? '↓' : '→' }}
                  </span>
                </td>
                <td><span class="link-action">详情 ›</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ③ Daily Comparison -->
        <div class="section-block">
          <div class="section-header">
            <div class="section-title">
              <span class="section-num">3</span>
              逐日对比分析（近7天）
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>代投方</th>
                <th class="text-right">消耗($)</th>
                <th class="text-right">安装数</th>
                <th class="text-right">CPI($)</th>
                <th class="text-right">CPA($)</th>
                <th class="text-right">消耗环比</th>
                <th class="text-right">安装环比</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in dailyRows" :key="i" class="data-row">
                <td>{{ row.date }}</td>
                <td :style="{ color: row.agencyColor || '#e2e8f0' }">{{ row.agency }}</td>
                <td class="text-right">${{ row.spend.toLocaleString() }}</td>
                <td class="text-right">{{ row.installs.toLocaleString() }}</td>
                <td class="text-right">${{ row.cpi.toFixed(2) }}</td>
                <td class="text-right">${{ row.cpa.toFixed(2) }}</td>
                <td class="text-right" :class="changeClass(row.spendChange)">
                  {{ changeTxt(row.spendChange) }}
                </td>
                <td class="text-right" :class="changeClass(row.installsChange)">
                  {{ changeTxt(row.installsChange) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right sidebar -->
      <div class="sidebar-right">
        <!-- Donut chart -->
        <div class="chart-block">
          <div class="chart-title">代投方消耗占比</div>
          <div ref="donutRef" class="chart-area" style="height: 160px" />
        </div>

        <!-- Bar chart -->
        <div class="chart-block">
          <div class="chart-title">渠道分布分析</div>
          <div ref="barRef" class="chart-area" style="height: 160px" />
        </div>

        <!-- Country horizontal bar -->
        <div class="chart-block">
          <div class="chart-title">国家消耗分布 Top 8</div>
          <div ref="countryRef" class="chart-area" style="height: 210px" />
        </div>

        <!-- Trend area -->
        <div class="chart-block">
          <div class="chart-title">代投消耗趋势（近30天）</div>
          <div ref="trendRef" class="chart-area" style="height: 180px" />
        </div>
      </div>
    </div>

    <!-- Screenshot Modal -->
    <ScreenshotModal
      v-model="showScreenshot"
      :agency-name="screenshotAgency"
      @download="() => {}"
      @copy="() => {}"
    />
  </div>
</template>

<style scoped lang="scss">
  // ─── Variables ───
  $bg-page: #08111e;
  $bg-card: #0d1829;
  $bg-row-hover: #111f35;
  $bg-header: #0a1422;
  $border: #1e3a5f;
  $text-primary: #e2e8f0;
  $text-secondary: #94a3b8;
  $text-muted: #64748b;
  $teal: #00d4b4;
  $blue: #3b82f6;
  $amber: #f59e0b;
  $red: #ef4444;
  $green: #10b981;

  // ─── Page ───
  .page-wrap {
    min-height: 100vh;
    padding: 0;
    font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    font-size: 13px;
    color: $text-primary;
    background: $bg-page;
  }

  // ─── Topbar ───
  .top-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: $bg-card;
    border-bottom: 1px solid $border;
  }

  .breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 14px;
  }

  .bc-parent {
    color: $text-muted;
  }

  .bc-sep {
    color: $text-muted;
  }

  .bc-current {
    font-weight: 600;
    color: $text-primary;
  }

  .top-filters {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .filter-date {
    width: 130px !important;

    :deep(.el-input__wrapper) {
      height: 30px;
      background: #111f35 !important;
      border-color: $border !important;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      font-size: 12px;
      color: $text-primary !important;
    }
  }

  .filter-select {
    width: 110px !important;

    :deep(.el-input__wrapper) {
      height: 30px;
      background: #111f35 !important;
      border-color: $border !important;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      font-size: 12px;
      color: $text-primary !important;
    }

    :deep(.el-select__suffix) {
      color: $text-muted !important;
    }
  }

  .btn-screenshot {
    display: flex;
    align-items: center;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #0a1628;
    white-space: nowrap;
    cursor: pointer;
    background: $teal;
    border: none;
    border-radius: 6px;
    transition: background 0.2s;

    &:hover {
      background: #00bfa3;
    }
  }

  // ─── KPI Cards ───
  .kpi-row {
    display: flex;
    gap: 0;
    gap: 12px;
    padding: 16px 20px;
  }

  .kpi-card {
    position: relative;
    flex: 1;
    min-width: 0;
    padding: 14px 16px;
    overflow: hidden;
    background: $bg-card;
    border: 1px solid $border;
    border-radius: 8px;
    transition: border-color 0.2s;

    &:hover {
      border-color: #2d5070;
    }

    &.highlighted {
      background: linear-gradient(135deg, rgb(0 212 180 / 6%) 0%, $bg-card 60%);
      border-color: $teal;
    }
  }

  .kpi-idx {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 10px;
    font-weight: 700;
    color: #0a1628;
    background: $teal;
    border-radius: 50%;
  }

  .kpi-label {
    margin-bottom: 6px;
    margin-left: 22px;
    font-size: 11px;
    color: $text-muted;
  }

  .kpi-value {
    margin-bottom: 4px;
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
    color: $text-primary;
  }

  .kpi-change {
    font-size: 11px;

    &.up {
      color: $teal;
    }

    &.down {
      color: $red;
    }
  }

  .kpi-spark {
    position: absolute;
    right: 10px;
    bottom: 8px;
    width: 80px;
    height: 28px;
    opacity: 0.8;
  }

  // ─── Main layout ───
  .main-layout {
    display: flex;
    gap: 12px;
    padding: 0 20px 20px;
  }

  .main-left {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  .sidebar-right {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 10px;
    width: 260px;
  }

  // ─── Section blocks ───
  .section-block {
    overflow: hidden;
    background: $bg-card;
    border: 1px solid $border;
    border-radius: 8px;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: $bg-header;
    border-bottom: 1px solid $border;
  }

  .section-title {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    font-weight: 600;
    color: $text-primary;
  }

  .section-num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 11px;
    font-weight: 700;
    color: $text-secondary;
    background: #1e3a5f;
    border-radius: 4px;
  }

  .section-subtitle {
    font-size: 11px;
    font-weight: 400;
    color: $text-muted;
  }

  .section-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .data-date {
    font-size: 11px;
    color: $text-muted;
  }

  .btn-small-outline {
    padding: 3px 10px;
    font-size: 11px;
    color: $text-secondary;
    cursor: pointer;
    background: transparent;
    border: 1px solid $border;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: $text-primary;
      border-color: #3d5570;
    }
  }

  // ─── Data Table ───
  .data-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;

    thead tr {
      background: $bg-header;
    }

    th {
      padding: 8px 10px;
      font-weight: 500;
      color: $text-muted;
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid $border;
    }

    td {
      padding: 9px 10px;
      color: $text-secondary;
      white-space: nowrap;
      border-bottom: 1px solid #0f1c2e;
    }

    .text-right {
      text-align: right;
    }

    .fw-600 {
      font-weight: 600;
      color: $text-primary;
    }

    .data-row:hover td {
      background: $bg-row-hover;
    }
  }

  // ─── Agency row ───
  .th-expand {
    width: 28px;
  }

  .td-expand {
    width: 28px;
    text-align: center;
  }

  .expand-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: $text-muted;
    cursor: pointer;
    background: #1a2d44;
    border: none;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: $text-primary;
      background: #243d57;
    }

    svg {
      transition: transform 0.2s;
    }

    &.open svg {
      transform: rotate(180deg);
    }
  }

  .agency-row {
    transition: background 0.15s;

    &:hover td {
      background: $bg-row-hover;
    }

    &.expanded td {
      background: rgb(0 212 180 / 4%);
      border-bottom-color: $teal;
    }
  }

  .agency-name-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .warn-icon {
    font-size: 12px;
    color: $amber;
  }

  .roi-text-teal {
    color: $teal;
  }

  .roi-text-yellow {
    color: $amber;
  }

  .roi-text-red {
    color: $red;
  }

  .budget-bar-wrap {
    display: flex;
    gap: 6px;
    align-items: center;
    min-width: 100px;
  }

  .budget-bar-track {
    flex: 1;
    height: 6px;
    overflow: hidden;
    background: #1a2d44;
    border-radius: 3px;
  }

  .budget-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s;
  }

  .budget-pct {
    min-width: 32px;
    font-size: 11px;
    color: $text-secondary;
  }

  .status-cell {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;
  }

  .status-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .btn-expand-text {
    padding: 3px 8px;
    font-size: 11px;
    color: $teal;
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: 1px solid $border;
    border-radius: 4px;

    &:hover {
      background: rgb(0 212 180 / 8%);
    }
  }

  // ─── Expand panel ───
  .expand-row td {
    padding: 0 !important;
  }

  .expand-td {
    padding: 0 !important;
  }

  .expand-panel {
    margin: 0 2px 4px;
    overflow: hidden;
    background: #091523;
    border: 1px solid rgb(0 212 180 / 30%);
    border-radius: 0 0 6px 6px;
  }

  .exp-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: #0d1e30;
    border-bottom: 1px solid $border;

    &-left {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    &-right {
      display: flex;
      gap: 6px;
      align-items: center;
    }
  }

  .exp-device-icon {
    font-size: 14px;
  }

  .exp-name {
    font-size: 13px;
    font-weight: 700;
  }

  .exp-badge {
    padding: 2px 7px;
    font-size: 10px;
    border-radius: 4px;

    &.active {
      color: $teal;
      background: rgb(0 212 180 / 15%);
      border: 1px solid rgb(0 212 180 / 30%);
    }
  }

  .exp-meta {
    font-size: 11px;
    color: $text-muted;
  }

  .btn-sm-teal {
    padding: 4px 10px;
    font-size: 11px;
    color: $teal;
    cursor: pointer;
    background: transparent;
    border: 1px solid $teal;
    border-radius: 4px;

    &:hover {
      background: rgb(0 212 180 / 10%);
    }
  }

  .btn-sm-ghost {
    padding: 4px 10px;
    font-size: 11px;
    color: $text-secondary;
    cursor: pointer;
    background: transparent;
    border: 1px solid $border;
    border-radius: 4px;

    &:hover {
      border-color: #3d5570;
    }
  }

  // ─── Exp metrics ───
  .exp-metrics {
    display: flex;
    gap: 1px;
    background: $border;
    border-bottom: 1px solid $border;
  }

  .exp-metric {
    flex: 1;
    padding: 12px 14px;
    background: #091523;

    &-label {
      margin-bottom: 4px;
      font-size: 11px;
      color: $text-muted;
    }

    &-value {
      font-size: 20px;
      font-weight: 700;
      color: $text-primary;

      &.teal {
        color: $teal;
      }
    }

    &-value-roi {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 20px;
      font-weight: 700;
    }
  }

  .roi-tag {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;

    &-meet {
      color: $teal;
      background: rgb(0 212 180 / 15%);
    }

    &-miss {
      color: $red;
      background: rgb(239 68 68 / 15%);
    }
  }

  // ─── Weekly summary ───
  .exp-weekly {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    padding: 8px 14px;
    font-size: 11px;
    background: #060e1a;
    border-bottom: 1px solid $border;

    .weekly-lbl {
      font-weight: 500;
      color: $text-secondary;
    }

    .weekly-item {
      color: $text-muted;

      strong {
        color: $text-primary;
      }
    }

    .weekly-sep {
      color: #2d3f54;
    }

    .teal {
      color: $teal;
    }
  }

  // ─── Sub tables ───
  .exp-sub-section {
    padding: 10px 14px;
    border-bottom: 1px solid $border;

    &:last-child {
      border-bottom: none;
    }
  }

  .exp-sub-title {
    margin-bottom: 8px;
    font-size: 11px;
    font-weight: 600;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .sub-table {
    width: 100%;
    font-size: 11px;
    border-collapse: collapse;

    th {
      padding: 5px 8px;
      font-weight: 500;
      color: $text-muted;
      text-align: left;
      white-space: nowrap;
      background: #060e1a;
      border-bottom: 1px solid $border;
    }

    td {
      padding: 6px 8px;
      color: $text-secondary;
      white-space: nowrap;
      border-bottom: 1px solid #0a1422;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background: #0d1829;
    }

    .roi-date-head {
      color: $teal;
      text-align: center;
      background: rgb(0 212 180 / 8%);
    }
  }

  .account-id {
    font-size: 10px;
    color: $text-muted;
  }

  .roi-badge {
    display: inline-block;
    min-width: 40px;
    padding: 1px 6px;
    font-size: 10px;
    font-weight: 600;
    text-align: center;
    border-radius: 4px;

    &.roi-green {
      color: #10b981;
      background: rgb(16 185 129 / 15%);
    }

    &.roi-teal {
      color: $teal;
      background: rgb(0 212 180 / 15%);
    }

    &.roi-yellow {
      color: $amber;
      background: rgb(245 158 11 / 15%);
    }

    &.roi-red {
      color: $red;
      background: rgb(239 68 68 / 15%);
    }
  }

  .row-red-tint td {
    background: rgb(239 68 68 / 4%);
  }

  .text-danger {
    color: $red !important;
  }

  .dim {
    color: $text-muted;
  }

  .link-action {
    font-size: 11px;
    color: $teal;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .sub-footnote {
    padding-top: 6px;
    margin-top: 8px;
    font-size: 10px;
    color: #475569;
    border-top: 1px solid $border;
  }

  // ─── Campaign table ───
  .name-cell {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .trend-arrow {
    margin-left: 2px;
    font-size: 11px;
  }

  // ─── Daily change ───
  .change-up {
    color: $teal;
  }

  .change-down {
    color: $red;
  }

  // ─── Total row ───
  .total-row {
    td {
      font-weight: 600;
      color: $text-primary;
      background: $bg-header;
      border-top: 1px solid $border;
    }
  }

  // ─── Sidebar charts ───
  .chart-block {
    padding: 10px 12px 8px;
    overflow: hidden;
    background: $bg-card;
    border: 1px solid $border;
    border-radius: 8px;
  }

  .chart-title {
    margin-bottom: 4px;
    font-size: 11px;
    font-weight: 600;
    color: $text-secondary;
  }

  .chart-area {
    width: 100%;
  }
</style>
