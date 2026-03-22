<template>
  <div class="br-root">
    <!-- ─────────────────────────────── TOP HEADER ────────────── -->
    <header class="br-header">
      <div class="header-left">
        <button v-if="showBackBtn" class="back-btn" @click="handleBack">‹</button>
        <span class="header-logo">
          <svg v-if="period === 'daily'" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="8" width="3" height="9" rx="1" fill="#00D4A1" />
            <rect x="6" y="5" width="3" height="12" rx="1" fill="#4A9EF5" />
            <rect x="11" y="2" width="3" height="15" rx="1" fill="#8B5CF6" />
            <rect x="16" y="0" width="2" height="17" rx="1" fill="#FB923C" opacity="0.5" />
          </svg>
        </span>
        <h1 class="header-title">经营报告</h1>
      </div>

      <div class="period-toggle">
        <button
          v-for="p in periods"
          :key="p.key"
          :class="['period-btn', { active: period === p.key }]"
          @click="switchPeriod(p.key)"
        >
          {{ p.label }}
        </button>
      </div>

      <div class="header-right">
        <template v-if="period === 'monthly'">
          <span class="compare-mode-label">对比模式</span>
          <button
            :class="['toggle-pill', { active: compareMode }]"
            @click="compareMode = !compareMode"
          >
            <span class="toggle-knob" />
          </button>
        </template>

        <button class="header-btn lark-btn" @click="showLarkModal = true">
          <span class="lark-icon">✈</span> 飞书推送
        </button>
        <button class="header-btn export-btn"> <span>↑</span> 导出 </button>
        <button class="header-btn icon-btn">⚙</button>
      </div>
    </header>

    <!-- ──────────────────────────── FILTER BAR ───────────────── -->
    <div class="filter-bar" :class="`filter-${activeTab}`">
      <template v-if="!compareMode">
        <div class="filter-group">
          <span class="filter-label">应用：</span>
          <select class="filter-select">
            <option>全部</option>
            <option>健康</option>
            <option>天气</option>
            <option>AI应用</option>
          </select>
        </div>

        <div class="filter-group">
          <span class="filter-label">平台：</span>
          <div class="pill-group">
            <button
              v-for="p in platforms"
              :key="p"
              :class="['pill', { active: activePlatforms.includes(p) }]"
              @click="togglePlatform(p)"
            >
              {{ p }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <template v-if="activeTab === 'adPlatform'">
            <span class="filter-label">广告平台：</span>
            <div class="pill-group scrollable">
              <button
                v-for="ap in adPlatforms"
                :key="ap"
                :class="['pill', { active: activeAdPlatforms.includes(ap) }]"
                @click="toggleAdPlatform(ap)"
              >
                <span v-if="ap !== '全部'" class="ap-dot" :style="{ background: apColors[ap] }" />
                {{ ap }}
              </button>
            </div>
          </template>
          <template v-else-if="activeTab === 'campaigns'">
            <span class="filter-label">广告平台：</span>
            <select class="filter-select">
              <option>全部</option>
            </select>
            <span class="filter-label ml-8">状态：</span>
            <div class="pill-group">
              <button
                v-for="s in campaignStatuses"
                :key="s"
                :class="['pill', { active: activeStatus === s }]"
                @click="activeStatus = s"
              >
                {{ s }}
              </button>
            </div>
            <span class="filter-label ml-8">国家：</span>
            <select class="filter-select">
              <option>全部</option>
            </select>
          </template>
          <template v-else-if="activeTab === 'byCountry'">
            <span class="filter-label">国家：</span>
            <div class="pill-group scrollable">
              <button
                v-for="c in selectedCountries"
                :key="c.code"
                :class="['pill', 'country-pill', { active: true }]"
              >
                {{ c.flag }} {{ c.name }}
              </button>
              <button class="pill">+{{ 22 - selectedCountries.length }} 个</button>
            </div>
          </template>
          <template v-else-if="activeTab === 'platformCountry'">
            <span class="filter-label">广告平台：</span>
            <div class="pill-group scrollable">
              <button
                v-for="ap in platformCountryPills"
                :key="ap"
                :class="['pill', 'bracket-pill', { active: true }]"
              >
                {{ ap }}
              </button>
            </div>
            <span class="filter-label ml-8">国家：</span>
            <select class="filter-select">
              <option>全部</option>
            </select>
          </template>
          <template v-else>
            <span class="filter-label">广告平台：</span>
            <select class="filter-select">
              <option>全部</option>
            </select>
          </template>
        </div>
      </template>

      <template v-else>
        <div class="filter-group">
          <span class="filter-label">平台：</span>
          <div class="pill-group">
            <button
              v-for="p in platforms"
              :key="p"
              :class="['pill', { active: activePlatforms.includes(p) }]"
              @click="togglePlatform(p)"
            >
              {{ p }}
            </button>
          </div>
        </div>
        <div class="filter-group">
          <span class="filter-label">广告平台：</span>
          <select class="filter-select">
            <option>全部</option>
          </select>
        </div>
      </template>

      <div class="date-nav">
        <button class="nav-arrow" @click="prevDate">‹</button>
        <span class="date-display">
          <span class="date-icon">📅</span>
          {{ currentDateLabel }}
        </span>
        <button class="nav-arrow" @click="nextDate">›</button>
      </div>

      <div class="compare-toggle">
        <span class="compare-toggle-label">{{ compareLabelLeft }}</span>
        <button
          :class="['toggle-pill', 'small', { active: compareEnabled }]"
          @click="compareEnabled = !compareEnabled"
        >
          <span class="toggle-knob" />
        </button>
        <span v-if="compareEnabled" class="compare-date">对比：{{ compareDate }}</span>
      </div>
    </div>

    <!-- ──────────────────────────── SECOND TABS ─────────────── -->
    <nav class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-item', { active: activeTab === tab.key }]"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <!-- ──────────────────────────── MAIN CONTENT ────────────── -->
    <div :class="['br-content', { 'no-sidebar': compareMode && period === 'monthly' }]">
      <!-- Monthly compare mode: no sidebar -->
      <template v-if="compareMode && period === 'monthly'">
        <main class="br-main">
          <MonthlyCompareMode />
        </main>
      </template>

      <!-- Daily: each tab has its own independent sidebar instance -->
      <template v-else-if="period === 'daily'">
        <aside class="br-sidebar">
          <div class="sidebar-card">
            <AppSidebar
              :key="`daily-${activeTab}`"
              :app-list="appList"
              :selected-id="selectedAppId"
              :show-field="tabShowField"
              @select="selectApp"
              @compare-mode="compareMode = true"
            />
          </div>
        </aside>
        <main class="br-main">
          <DailySummary v-if="activeTab === 'summary'" />
          <DailyAdPlatform v-else-if="activeTab === 'adPlatform'" />
          <DailyByCountry v-else-if="activeTab === 'byCountry'" />
          <AdPlatformByCountry v-else-if="activeTab === 'platformCountry'" period="daily" />
          <DailyCampaigns v-else-if="activeTab === 'campaigns'" />
        </main>
      </template>

      <!-- Weekly: each tab has its own independent sidebar instance -->
      <template v-else-if="period === 'weekly'">
        <aside class="br-sidebar">
          <div class="sidebar-card">
            <AppSidebar
              :key="`weekly-${activeTab}`"
              :app-list="appList"
              :selected-id="selectedAppId"
              :show-field="tabShowField"
              @select="selectApp"
              @compare-mode="compareMode = true"
            />
          </div>
        </aside>
        <main class="br-main">
          <WeeklySummary v-if="activeTab === 'summary'" />
          <WeeklyAdPlatform v-else-if="activeTab === 'adPlatform'" />
          <WeeklyByCountry v-else-if="activeTab === 'byCountry'" />
          <AdPlatformByCountry v-else-if="activeTab === 'platformCountry'" period="weekly" />
          <WeeklyCampaigns v-else-if="activeTab === 'campaigns'" />
        </main>
      </template>

      <!-- Monthly: each tab has its own independent sidebar instance -->
      <template v-else>
        <aside class="br-sidebar">
          <div class="sidebar-card">
            <AppSidebar
              :key="`monthly-${activeTab}`"
              :app-list="appList"
              :selected-id="selectedAppId"
              :show-field="tabShowField"
              @select="selectApp"
              @compare-mode="compareMode = true"
            />
          </div>
        </aside>
        <main class="br-main">
          <MonthlySummary v-if="activeTab === 'summary'" />
          <WeeklyAdPlatform v-else-if="activeTab === 'adPlatform'" />
          <WeeklyByCountry v-else-if="activeTab === 'byCountry'" />
          <AdPlatformByCountry v-else-if="activeTab === 'platformCountry'" period="monthly" />
          <WeeklyCampaigns v-else-if="activeTab === 'campaigns'" />
        </main>
      </template>
    </div>

    <!-- ──────────────────────── BOTTOM STATUS BAR ───────────── -->
    <div v-if="!(compareMode && period === 'monthly')" class="br-status-bar">
      <span class="status-app-count">共 18 个应用</span>
      <template v-if="activeTab === 'campaigns'">
        <span class="status-extra">在投 14 个 | 已暂停 3 个 | 总广告支出 $41,100</span>
      </template>
      <template v-else-if="activeTab === 'byCountry'">
        <span class="status-extra">共 22 个国家</span>
      </template>
      <button class="compare-mode-btn" @click="enterMonthlyCompareMode">+ 对比模式</button>
      <div class="status-lark">
        <span class="lark-last">上次推送：{{ lastPushTime }}</span>
        <button class="push-now-btn" @click="showLarkModal = true">立即推送</button>
      </div>
    </div>

    <LarkPushModal :visible="showLarkModal" @close="showLarkModal = false" />

    <Transition name="fade">
      <div v-if="switching" class="page-transition" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { ReportPeriod, ReportTab } from './types'

  import AppSidebar from './AppSidebar.vue'
  import LarkPushModal from './LarkPushModal.vue'

  import DailySummary from './DailySummary.vue'
  import DailyAdPlatform from './DailyAdPlatform.vue'
  import DailyByCountry from './DailyByCountry.vue'
  import DailyCampaigns from './DailyCampaigns.vue'

  import WeeklySummary from './WeeklySummary.vue'
  import WeeklyAdPlatform from './WeeklyAdPlatform.vue'
  import WeeklyByCountry from './WeeklyByCountry.vue'
  import WeeklyCampaigns from './WeeklyCampaigns.vue'

  import MonthlySummary from './MonthlySummary.vue'
  import MonthlyCompareMode from './MonthlyCompareMode.vue'

  import AdPlatformByCountry from './AdPlatformByCountry.vue'
  import { appList } from './mockData'

  defineOptions({ name: 'BusinessReport' })

  const platformCountryPills = [
    '全部',
    'Google',
    'Facebook',
    'Unity',
    'Mintegral',
    'TikTok'
  ] as const

  const period = ref<ReportPeriod>('daily')
  const activeTab = ref<ReportTab>('summary')
  const compareMode = ref(false)
  const switching = ref(false)

  const periods = [
    { key: 'daily' as ReportPeriod, label: '日报' },
    { key: 'weekly' as ReportPeriod, label: '周报' },
    { key: 'monthly' as ReportPeriod, label: '月报' }
  ]

  const tabs = computed(() => [
    { key: 'summary' as ReportTab, label: '汇总' },
    { key: 'adPlatform' as ReportTab, label: '广告平台' },
    { key: 'byCountry' as ReportTab, label: '分国家' },
    { key: 'platformCountry' as ReportTab, label: '广告平台分国家' },
    { key: 'campaigns' as ReportTab, label: '在投广告系列' }
  ])

  async function switchPeriod(p: ReportPeriod) {
    if (p === period.value) return
    switching.value = true
    await new Promise((r) => setTimeout(r, 150))
    period.value = p
    compareMode.value = false
    activeTab.value = 'summary'
    switching.value = false
  }

  function switchTab(tab: ReportTab) {
    activeTab.value = tab
  }

  const showBackBtn = computed(() => activeTab.value !== 'summary')
  function handleBack() {
    activeTab.value = 'summary'
  }

  const platforms = ['全部', '安卓', 'iOS', '网站']
  const activePlatforms = ref(['全部'])

  function togglePlatform(p: string) {
    if (p === '全部') {
      activePlatforms.value = ['全部']
    } else {
      const idx = activePlatforms.value.indexOf(p)
      activePlatforms.value = activePlatforms.value.filter((x) => x !== '全部')
      if (idx >= 0) {
        activePlatforms.value.splice(activePlatforms.value.indexOf(p), 1)
        if (activePlatforms.value.length === 0) activePlatforms.value = ['全部']
      } else {
        activePlatforms.value.push(p)
      }
    }
  }

  const adPlatforms = [
    '全部',
    'Google',
    'Facebook',
    'Unity',
    'Mintegral',
    'TikTok',
    'Snapchat',
    'Kwai',
    'Bigo'
  ]
  const activeAdPlatforms = ref(['全部'])
  const apColors: Record<string, string> = {
    Google: '#4285F4',
    Facebook: '#1877F2',
    Unity: '#222C37',
    Mintegral: '#E8770E',
    TikTok: '#010101',
    Snapchat: '#FFFC00',
    Kwai: '#FF6B00',
    Bigo: '#00A651'
  }

  function toggleAdPlatform(ap: string) {
    if (ap === '全部') {
      activeAdPlatforms.value = ['全部']
      return
    }
    activeAdPlatforms.value = activeAdPlatforms.value.filter((x) => x !== '全部')
    const idx = activeAdPlatforms.value.indexOf(ap)
    if (idx >= 0) {
      activeAdPlatforms.value.splice(idx, 1)
      if (activeAdPlatforms.value.length === 0) activeAdPlatforms.value = ['全部']
    } else {
      activeAdPlatforms.value.push(ap)
    }
  }

  const campaignStatuses = ['在投中', '已暂停', '全部']
  const activeStatus = ref('在投中')

  const selectedCountries = [
    { code: 'US', name: '美国', flag: '🇺🇸' },
    { code: 'DE', name: '德国', flag: '🇩🇪' },
    { code: 'JP', name: '日本', flag: '🇯🇵' },
    { code: 'KR', name: '韩国', flag: '🇰🇷' },
    { code: 'BR', name: '巴西', flag: '🇧🇷' }
  ]

  const currentDateLabel = computed(() => {
    if (period.value === 'monthly') return '2025年12月'
    if (period.value === 'weekly') return '2026年第10周 (3/9-3/15)'
    return '2026年3月13日'
  })
  const compareEnabled = ref(true)
  const compareLabelLeft = computed(() =>
    period.value === 'monthly' ? '对比上月' : period.value === 'weekly' ? '对比上周' : '对比昨日'
  )
  const compareDate = computed(() =>
    period.value === 'monthly'
      ? '2025年11月'
      : period.value === 'weekly'
        ? '第9周 (3/2-3/8)'
        : '2026年3月12日'
  )

  function prevDate() {}
  function nextDate() {}

  // Per-tab independent app selection state: key = `${period}-${tab}`
  const selectedAppIds = ref<Record<string, string>>({})

  const selectedAppId = computed(
    () => selectedAppIds.value[`${period.value}-${activeTab.value}`] ?? 'overall'
  )

  function selectApp(id: string) {
    selectedAppIds.value[`${period.value}-${activeTab.value}`] = id
  }

  // Each tab shows a different secondary metric in the sidebar
  const tabShowField = computed((): 'dau' | 'mau' | 'adSpend' => {
    if (activeTab.value === 'adPlatform' || activeTab.value === 'campaigns') return 'adSpend'
    if (period.value === 'monthly') return 'mau'
    return 'dau'
  })
  const showLarkModal = ref(false)

  const lastPushTime = computed(() =>
    period.value === 'daily'
      ? '今日 08:30 飞书群《经营日报》'
      : period.value === 'weekly'
        ? '本周一 08:30 飞书群《经营周报》'
        : '2026-01-01 09:00 飞书群《经营月报》'
  )

  function enterMonthlyCompareMode() {
    compareMode.value = true
    period.value = 'monthly'
    activeTab.value = 'summary'
  }
</script>

<style>
  :root {
    --rp-bg: #080f1e;
    --rp-surface: #0d1529;
    --rp-border: rgb(255 255 255 / 6%);
    --rp-text: rgb(255 255 255 / 85%);
    --rp-muted: rgb(255 255 255 / 40%);
    --rp-accent: #00d4a1;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: var(--rp-text);
    background: var(--rp-bg);
  }
</style>

<style scoped>
  .br-root {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    color: var(--rp-text);
    background: var(--rp-bg);
  }

  .br-header {
    display: flex;
    flex-shrink: 0;
    gap: 16px;
    align-items: center;
    height: 52px;
    padding: 0 20px;
    border-bottom: 1px solid var(--rp-border);
  }

  .header-left {
    display: flex;
    flex: 1;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
  }

  .back-btn {
    padding: 2px 6px;
    font-size: 18px;
    color: var(--rp-muted);
    cursor: pointer;
    background: none;
    border: none;
  }

  .header-logo {
    display: flex;
    align-items: center;
  }

  .header-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    white-space: nowrap;
  }

  .period-toggle {
    display: flex;
    flex-shrink: 0;
    gap: 4px;
    padding: 3px;
    background: rgb(255 255 255 / 5%);
    border-radius: 8px;
  }

  .period-btn {
    padding: 4px 20px;
    font-size: 13px;
    color: var(--rp-muted);
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 5px;
    transition: all 0.2s;
  }

  .period-btn.active {
    font-weight: 600;
    color: #000;
    background: var(--rp-accent);
  }

  .period-btn:hover:not(.active) {
    color: var(--rp-text);
    background: rgb(255 255 255 / 6%);
  }

  .header-right {
    display: flex;
    flex: 1;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
  }

  .compare-mode-label {
    font-size: 12px;
    color: var(--rp-muted);
  }

  .header-btn {
    display: flex;
    gap: 5px;
    align-items: center;
    padding: 5px 12px;
    font-size: 12px;
    color: var(--rp-text);
    white-space: nowrap;
    cursor: pointer;
    background: rgb(255 255 255 / 6%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 6px;
    transition: all 0.2s;
  }

  .header-btn:hover {
    background: rgb(255 255 255 / 10%);
  }

  .lark-btn {
    color: var(--rp-accent);
    background: rgb(0 212 161 / 12%);
    border-color: rgb(0 212 161 / 30%);
  }

  .lark-btn:hover {
    background: rgb(0 212 161 / 20%);
  }

  .export-btn {
    color: #4a9ef5;
    background: rgb(74 158 245 / 12%);
    border-color: rgb(74 158 245 / 30%);
  }

  .export-btn:hover {
    background: rgb(74 158 245 / 20%);
  }

  .icon-btn {
    padding: 5px 8px;
    font-size: 14px;
  }

  .lark-icon {
    font-style: normal;
  }

  .toggle-pill {
    position: relative;
    width: 36px;
    height: 18px;
    padding: 0;
    cursor: pointer;
    background: rgb(255 255 255 / 15%);
    border: none;
    border-radius: 9px;
    transition: background 0.2s;
  }

  .toggle-pill.active {
    background: var(--rp-accent);
  }

  .toggle-pill.small {
    width: 30px;
    height: 16px;
  }

  .toggle-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.2s;
  }

  .toggle-pill.small .toggle-knob {
    width: 12px;
    height: 12px;
  }

  .toggle-pill.active .toggle-knob {
    transform: translateX(18px);
  }

  .toggle-pill.small.active .toggle-knob {
    transform: translateX(14px);
  }

  .filter-bar {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    min-height: 46px;
    padding: 8px 20px;
    border-bottom: 1px solid var(--rp-border);
  }

  .filter-group {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .filter-label {
    font-size: 12px;
    color: var(--rp-muted);
    white-space: nowrap;
  }

  .ml-8 {
    margin-left: 8px;
  }

  .filter-select {
    padding: 4px 10px;
    padding-right: 20px;
    font-size: 12px;
    color: var(--rp-text);
    appearance: none;
    cursor: pointer;
    background: rgb(255 255 255 / 6%);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 6px center;
    border: 1px solid var(--rp-border);
    border-radius: 6px;
    outline: none;
  }

  .pill-group {
    display: flex;
    gap: 4px;
  }

  .pill-group.scrollable {
    max-width: 400px;
    overflow-x: auto;
  }

  .pill {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 3px 10px;
    font-size: 11px;
    color: var(--rp-muted);
    white-space: nowrap;
    cursor: pointer;
    background: rgb(255 255 255 / 6%);
    border: 1px solid var(--rp-border);
    border-radius: 5px;
    transition: all 0.15s;
  }

  .pill.active {
    color: var(--rp-accent);
    background: rgb(0 212 161 / 12%);
    border-color: var(--rp-accent);
  }

  .bracket-pill.active {
    color: var(--rp-text);
    background: rgb(255 255 255 / 8%);
    border-color: rgb(255 255 255 / 20%);
  }

  .ap-dot {
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  .date-nav {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-left: auto;
  }

  .nav-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 13px;
    color: var(--rp-muted);
    cursor: pointer;
    background: rgb(255 255 255 / 6%);
    border: 1px solid var(--rp-border);
    border-radius: 4px;
    transition: all 0.15s;
  }

  .nav-arrow:hover {
    color: var(--rp-text);
    background: rgb(255 255 255 / 10%);
  }

  .date-display {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 13px;
    white-space: nowrap;
  }

  .date-icon {
    font-size: 12px;
  }

  .compare-toggle {
    display: flex;
    gap: 6px;
    align-items: center;
    padding-left: 8px;
    border-left: 1px solid var(--rp-border);
  }

  .compare-toggle-label {
    font-size: 12px;
    color: var(--rp-muted);
    white-space: nowrap;
  }

  .compare-date {
    font-size: 11px;
    color: var(--rp-muted);
    white-space: nowrap;
  }

  .tab-nav {
    display: flex;
    flex-shrink: 0;
    gap: 0;
    align-items: center;
    padding: 0 20px;
    border-bottom: 1px solid var(--rp-border);
  }

  .tab-item {
    position: relative;
    padding: 10px 18px;
    font-size: 13px;
    color: var(--rp-muted);
    cursor: pointer;
    background: none;
    border: none;
    transition: color 0.2s;
  }

  .tab-item:hover {
    color: var(--rp-text);
  }

  .tab-item.active {
    font-weight: 500;
    color: var(--rp-accent);
  }

  .tab-item.active::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
    content: '';
    background: var(--rp-accent);
    border-radius: 1px 1px 0 0;
  }

  .br-content {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .br-sidebar {
    flex-shrink: 0;
    align-self: flex-start;
    width: 340px;
    max-height: 100%;
    padding: 16px 0 16px 16px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgb(255 255 255 / 10%) transparent;
  }

  .sidebar-card {
    overflow: hidden;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .br-main {
    flex: 1;
    padding: 16px 20px;
    overflow: hidden auto;
  }

  .br-main::-webkit-scrollbar {
    width: 4px;
  }

  .br-main::-webkit-scrollbar-thumb {
    background: rgb(255 255 255 / 8%);
    border-radius: 2px;
  }

  .br-status-bar {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    align-items: center;
    padding: 8px 20px;
    font-size: 12px;
    color: var(--rp-muted);
    border-top: 1px solid var(--rp-border);
  }

  .status-extra {
    color: var(--rp-muted);
  }

  .compare-mode-btn {
    padding: 3px 12px;
    font-size: 11px;
    color: var(--rp-accent);
    cursor: pointer;
    background: none;
    border: 1px solid rgb(0 212 161 / 30%);
    border-radius: 5px;
    transition: all 0.2s;
  }

  .compare-mode-btn:hover {
    background: rgb(0 212 161 / 8%);
  }

  .status-lark {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-left: auto;
  }

  .lark-last {
    font-size: 11px;
    color: var(--rp-muted);
  }

  .push-now-btn {
    padding: 4px 14px;
    font-size: 11px;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    background: var(--rp-accent);
    border: none;
    border-radius: 5px;
    transition: opacity 0.2s;
  }

  .push-now-btn:hover {
    opacity: 0.85;
  }

  .page-transition {
    position: fixed;
    inset: 0;
    z-index: 100;
    pointer-events: none;
    background: var(--rp-bg);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .fade-enter-to,
  .fade-leave-from {
    opacity: 0.8;
  }
</style>
