<script setup lang="ts">
  import { ref } from 'vue'
  import { MOCK_MY_ADS_PLATFORM_TAB } from '../mock/data'

  defineOptions({ name: 'PlatformTab' })

  const groupByApp = ref(true)

  const platformMock = MOCK_MY_ADS_PLATFORM_TAB

  /* ── 数据 ── */
  interface CampaignCard {
    platform: string
    platformIcon: string
    status: 'active' | 'warn'
    spend: string
    budget: string
    roi: string
    roiTarget: string
    progress: number
    minSpend: string
    cpi: string
    warn?: string
  }

  interface AppGroup {
    name: string
    nameEn: string
    icon: string
    color: string
    totalSpend: string
    avgRoi: string
    platformCount: number
    campaigns: CampaignCard[]
  }

  const apps: AppGroup[] = platformMock.appGroups

  function progressColor(c: CampaignCard) {
    if (c.status === 'warn') return '#f59e0b'
    return '#10b981'
  }

  function roiColor(c: CampaignCard) {
    if (c.status === 'warn') return '#f97316'
    return '#f59e0b'
  }

  function platformIconStyle(p: string) {
    if (p.includes('谷歌')) return { background: '#4285f4', color: '#fff' }
    if (p.includes('Meta')) return { background: '#1877f2', color: '#fff' }
    if (p.includes('TikTok')) return { background: '#000', color: '#fff' }
    return { background: '#6b7280', color: '#fff' }
  }
</script>

<template>
  <div class="platform-tab">
    <!-- ── 副标题 + 切换 ── -->
    <div class="tab-sub-header">
      <span class="sub-desc">应用视角 | 展示各应用在各广告平台的广告数据</span>
      <div class="toggle-group">
        <div :class="['toggle-btn', groupByApp ? 'active' : '']" @click="groupByApp = true"
          >按应用分组</div
        >
        <div :class="['toggle-btn', !groupByApp ? 'active' : '']" @click="groupByApp = false"
          >按平台分组</div
        >
      </div>
    </div>

    <!-- ── 应用组列表 ── -->
    <div class="app-groups">
      <div v-for="app in apps" :key="app.nameEn" class="app-group">
        <!-- 应用标题行 -->
        <div class="app-group-header">
          <span class="app-icon">{{ app.icon }}</span>
          <span class="app-name">{{ app.name }}（{{ app.nameEn }}）</span>
          <span class="app-meta"
            >总广告支出: <b style="color: #e2e8f0">{{ app.totalSpend }}</b></span
          >
          <span class="app-meta"
            >平均首日ROI: <b style="color: #f59e0b">{{ app.avgRoi }}</b></span
          >
          <span class="app-meta"
            >平台数: <b style="color: #e2e8f0">{{ app.platformCount }}个</b></span
          >
        </div>

        <!-- 平台卡片网格 -->
        <div class="campaign-cards">
          <div
            v-for="c in app.campaigns"
            :key="c.platform"
            :class="['camp-card', c.status === 'warn' ? 'card-warn' : '']"
          >
            <!-- 卡片头 -->
            <div class="camp-card-head">
              <div class="platform-badge">
                <span class="plat-icon" :style="platformIconStyle(c.platform)">{{
                  c.platformIcon
                }}</span>
                <span class="plat-name">{{ c.platform }}</span>
              </div>
              <div class="card-head-right">
                <span :class="['status-badge', c.status === 'warn' ? 'badge-warn' : 'badge-ok']">
                  {{ c.status === 'warn' ? '⚠ 超预算' : '● 激活' }}
                </span>
              </div>
            </div>

            <!-- 数据网格 -->
            <div class="card-data-grid">
              <div class="data-cell">
                <span class="cell-label">广告支出</span>
                <span class="cell-val" style="color: #e2e8f0">{{ c.spend }}</span>
              </div>
              <div class="data-cell">
                <span class="cell-label">预算</span>
                <span class="cell-val" style="color: #e2e8f0">{{ c.budget }}</span>
              </div>
              <div class="data-cell">
                <span class="cell-label">首日ROI</span>
                <span class="cell-val" :style="{ color: roiColor(c) }">{{ c.roi }}</span>
              </div>
              <div class="data-cell">
                <span class="cell-label">目标</span>
                <span class="cell-val" style="color: #94a3b8">{{ c.roiTarget }}</span>
              </div>
            </div>

            <!-- 进度条 -->
            <div class="card-progress">
              <div class="prog-track">
                <div
                  class="prog-fill"
                  :style="{ width: c.progress + '%', background: progressColor(c) }"
                ></div>
              </div>
              <span class="prog-pct" :style="{ color: progressColor(c) }">{{ c.progress }}%</span>
            </div>

            <!-- 次要数据行 -->
            <div class="card-sub-row">
              <div class="data-cell">
                <span class="cell-label">最低利润</span>
                <span class="cell-val" style="color: #a78bfa">{{ c.minSpend }}</span>
              </div>
              <div class="data-cell">
                <span class="cell-label">CPI</span>
                <span class="cell-val" style="color: #e2e8f0">{{ c.cpi }}</span>
              </div>
            </div>

            <!-- 警告行 -->
            <div v-if="c.warn" class="card-warn-row"> ⚠ {{ c.warn }} </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 底部汇总栏 ── -->
    <div class="bottom-summary">
      <div class="summary-left">
        <span class="s-label"
          >应用汇总: {{ platformMock.footer.appCount }}个应用 |
          {{ platformMock.footer.campaignCount }}个广告系列</span
        >
        <span class="s-label"
          >总广告支出 <b style="color: #10b981">{{ platformMock.footer.totalSpend }}</b></span
        >
      </div>
      <div class="summary-alerts">
        <span class="alert-item warn"
          >超预算预警: <b>{{ platformMock.footer.overBudgetCount }}个</b></span
        >
        <span class="sep">|</span>
        <span class="alert-item orange"
          >ROI未达标: <b>{{ platformMock.footer.roiBelowTargetCount }}个</b></span
        >
      </div>
      <div class="summary-right">
        <span class="s-label"
          >平均首日ROI <b style="color: #f59e0b">{{ platformMock.footer.avgRoi }}</b></span
        >
        <span class="s-label"
          >预估总利润 <b style="color: #10b981">{{ platformMock.footer.estTotalProfit }}</b></span
        >
        <span class="s-label"
          >最低总利润 <b style="color: #a78bfa">{{ platformMock.footer.minTotalProfit }}</b></span
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
  .platform-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── 副标题 ── */
  .tab-sub-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sub-desc {
    font-size: 12px;
    color: var(--text-dim);
  }

  .toggle-group {
    display: flex;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .toggle-btn {
    padding: 5px 14px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .toggle-btn.active {
    font-weight: 600;
    color: #000;
    background: var(--teal);
  }

  /* ── 应用分组 ── */
  .app-groups {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .app-group-header {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 10px;
    font-size: 13px;
  }

  .app-icon {
    font-size: 18px;
  }

  .app-name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .app-meta {
    margin-left: 4px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  /* ── 卡片网格 ── */
  .campaign-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .camp-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    transition: border-color 0.2s;
  }

  .camp-card:hover {
    border-color: #2a4060;
  }

  .card-warn {
    background: rgb(146 64 14 / 8%);
    border-color: #92400e;
  }

  /* ── 卡片头 ── */
  .camp-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .platform-badge {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .plat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 4px;
  }

  .plat-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .card-head-right {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .flag {
    font-size: 14px;
  }

  .country-code {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .status-badge {
    padding: 1px 6px;
    font-size: 11px;
    border-radius: 4px;
  }

  .badge-ok {
    color: #10b981;
    background: rgb(16 185 129 / 15%);
  }

  .badge-warn {
    color: #f59e0b;
    background: rgb(245 158 11 / 15%);
    border: 1px solid rgb(245 158 11 / 30%);
  }

  /* ── 数据网格 ── */
  .card-data-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 4px;
  }

  .card-sub-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
  }

  .data-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cell-label {
    font-size: 11px;
    color: var(--text-dim);
  }

  .cell-val {
    font-size: 14px;
    font-weight: 600;
  }

  /* ── 进度条 ── */
  .card-progress {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .prog-track {
    flex: 1;
    height: 6px;
    overflow: hidden;
    background: var(--bg-card2);
    border-radius: 3px;
  }

  .prog-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s;
  }

  .prog-pct {
    min-width: 30px;
    font-size: 12px;
    font-weight: 600;
  }

  /* ── 警告行 ── */
  .card-warn-row {
    padding: 4px 8px;
    font-size: 11px;
    color: #f97316;
    background: rgb(249 115 22 / 10%);
    border: 1px solid rgb(249 115 22 / 20%);
    border-radius: 4px;
  }

  /* ── 底部汇总 ── */
  .bottom-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .summary-left,
  .summary-right {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
  }

  .summary-alerts {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
  }

  .s-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .alert-item {
    font-size: 12px;
  }

  .alert-item.warn {
    color: #f59e0b;
  }

  .alert-item.orange {
    color: #f97316;
  }

  .sep {
    color: var(--text-dim);
  }
</style>
