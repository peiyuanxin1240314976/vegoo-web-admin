<script setup lang="ts">
  import { ref, computed } from 'vue'

  /* ── 类型 ── */
  interface Campaign {
    id: string
    appIcon: string
    appName: string
    name: string
    platform: string
    platformIcon: string
    country: string
    countryFlag: string
    status: 'active' | 'inactive' | 'warn'
    spend: number
    budget: number
    calcSpend: number
    agencySpend: number
    roi: number | null
    minSpend: number
    estProfit: number | null
    minProfit: number | null
    cpi: number | null
    trend: 'up' | 'down' | 'flat' | 'none'
  }

  const campaigns: Campaign[] = [
    {
      id: 'CRE001',
      appIcon: '🌤️',
      appName: 'Weather5',
      name: 'Weather5_US_Google_CRE001',
      platform: 'Google',
      platformIcon: 'G',
      country: 'US',
      countryFlag: '🇺🇸',
      status: 'active',
      spend: 5200,
      budget: 6500,
      calcSpend: 4890,
      agencySpend: 3580,
      roi: 41.2,
      minSpend: 4100,
      estProfit: 1640,
      minProfit: 820,
      cpi: 2.37,
      trend: 'up'
    },
    {
      id: 'CRE002',
      appIcon: '🌤️',
      appName: 'Weather5',
      name: 'Weather5_JP_Facebook_CRE002',
      platform: 'Facebook',
      platformIcon: 'f',
      country: 'JP',
      countryFlag: '🇯🇵',
      status: 'active',
      spend: 2100,
      budget: 2800,
      calcSpend: 1980,
      agencySpend: 1450,
      roi: 35.8,
      minSpend: 1680,
      estProfit: 580,
      minProfit: 290,
      cpi: 2.38,
      trend: 'flat'
    },
    {
      id: 'CRE003',
      appIcon: '🩸',
      appName: 'BloodSugar2',
      name: 'BloodSugar2_UK_Google_CRE003',
      platform: 'Google',
      platformIcon: 'G',
      country: 'UK',
      countryFlag: '🇬🇧',
      status: 'warn',
      spend: 3200,
      budget: 3500,
      calcSpend: 3010,
      agencySpend: 2200,
      roi: 29.4,
      minSpend: 2450,
      estProfit: -340,
      minProfit: -680,
      cpi: 2.38,
      trend: 'down'
    },
    {
      id: 'CRE004',
      appIcon: '📱',
      appName: 'PhoneTracker',
      name: 'PhoneTracker_CA_TikTok_CRE004',
      platform: 'TikTok',
      platformIcon: 'T',
      country: 'CA',
      countryFlag: '🇨🇦',
      status: 'active',
      spend: 1700,
      budget: 2200,
      calcSpend: 1600,
      agencySpend: 1170,
      roi: 36.5,
      minSpend: 1280,
      estProfit: 420,
      minProfit: 210,
      cpi: 2.26,
      trend: 'up'
    },
    {
      id: 'CRE005',
      appIcon: '🌤️',
      appName: 'Weather5',
      name: 'Weather5_AU_Google_CRE005',
      platform: 'Google',
      platformIcon: 'G',
      country: 'AU',
      countryFlag: '🇦🇺',
      status: 'inactive',
      spend: 0,
      budget: 1000,
      calcSpend: 0,
      agencySpend: 0,
      roi: null,
      minSpend: 750,
      estProfit: null,
      minProfit: null,
      cpi: null,
      trend: 'none'
    },
    {
      id: 'CRE006',
      appIcon: '🩸',
      appName: 'BloodSugar2',
      name: 'BloodSugar2_US_Meta_CRE006',
      platform: 'Facebook',
      platformIcon: 'f',
      country: 'US',
      countryFlag: '🇺🇸',
      status: 'active',
      spend: 890,
      budget: 1200,
      calcSpend: 840,
      agencySpend: 615,
      roi: 38.9,
      minSpend: 670,
      estProfit: 230,
      minProfit: 115,
      cpi: 2.41,
      trend: 'up'
    }
  ]

  /* ── 筛选 ── */
  const filterAll = ref('全部')
  const filterApp = ref('应用')
  const filterPlatform = ref('广告平台')
  const filterCountry = ref('国家')
  const filterStatus = ref('状态')
  const filterType = ref('投放类型')
  const searchText = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalCampaigns = 185

  /* ── 分页数据 ── */
  const displayedCampaigns = computed(() => {
    return campaigns
  })

  /* ── 格式化 ── */
  function fmtNum(v: number | null): string {
    if (v === null) return '--'
    if (v === 0) return '$0'
    return `$${v.toLocaleString()}`
  }
  function fmtRoi(v: number | null): string {
    if (v === null) return '--'
    return v + '%'
  }

  /* ── 颜色逻辑 ── */
  function statusStyle(s: Campaign['status']) {
    if (s === 'active') return { color: '#10b981' }
    if (s === 'warn') return { color: '#f59e0b' }
    return { color: '#4b5563' }
  }
  function roiStyle(v: number | null) {
    if (v === null) return { color: '#4b5563' }
    if (v >= 35) return { color: '#f59e0b' }
    return { color: '#f97316' }
  }
  function profitStyle(v: number | null) {
    if (v === null) return { color: '#4b5563' }
    if (v < 0) return { color: '#ef4444' }
    return { color: '#10b981' }
  }
  function minProfitStyle(v: number | null) {
    if (v === null) return { color: '#4b5563' }
    if (v < 0) return { color: '#ef4444' }
    return { color: '#a78bfa' }
  }

  function platformColor(p: string) {
    if (p === 'Google') return '#4285f4'
    if (p === 'Facebook') return '#1877f2'
    if (p === 'TikTok') return '#000'
    return '#6b7280'
  }

  function progressColor(c: Campaign) {
    if (c.status === 'warn') return '#f59e0b'
    if (c.status === 'inactive') return '#374151'
    const pct = c.budget > 0 ? c.spend / c.budget : 0
    if (pct >= 0.9) return '#f59e0b'
    return '#10b981'
  }

  function progressPct(c: Campaign) {
    if (c.budget === 0) return 0
    return Math.round((c.spend / c.budget) * 100)
  }

  function trendSvg(trend: Campaign['trend']) {
    if (trend === 'up') return '↗'
    if (trend === 'down') return '↘'
    if (trend === 'flat') return '→'
    return '—'
  }
  function trendColor(trend: Campaign['trend']) {
    if (trend === 'up') return '#10b981'
    if (trend === 'down') return '#ef4444'
    if (trend === 'flat') return '#f59e0b'
    return '#4b5563'
  }
</script>

<template>
  <div class="campaign-tab">
    <!-- ── 筛选栏 ── -->
    <div class="filter-bar">
      <div class="filter-selects">
        <div class="filter-select">{{ filterAll }} <span class="caret">∨</span></div>
        <div class="filter-select">{{ filterApp }} <span class="caret">∨</span></div>
        <div class="filter-select">{{ filterPlatform }} <span class="caret">∨</span></div>
        <div class="filter-select">{{ filterCountry }} <span class="caret">∨</span></div>
        <div class="filter-select">{{ filterStatus }} <span class="caret">∨</span></div>
        <div class="filter-select">{{ filterType }} <span class="caret">∨</span></div>
      </div>
      <div class="filter-right">
        <input v-model="searchText" class="search-input" placeholder="搜索广告系列名称" />
        <button class="reset-btn">重置</button>
      </div>
    </div>

    <!-- ── 数据表格 ── -->
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th class="th-app">应用</th>
            <th class="th-name">广告系列名称</th>
            <th>渠道</th>
            <th>国家</th>
            <th>状态</th>
            <th class="th-budget">广告支出/预算</th>
            <th>计算消耗</th>
            <th>代投消耗</th>
            <th>首日ROI</th>
            <th>最低消耗</th>
            <th>预估利润</th>
            <th>最低利润</th>
            <th>CPI</th>
            <th>趋势</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="c in displayedCampaigns"
            :key="c.id"
            :class="[
              'data-row',
              c.status === 'warn' ? 'row-warn' : c.status === 'inactive' ? 'row-inactive' : ''
            ]"
          >
            <!-- 应用图标 -->
            <td
              ><span class="app-icon-sm">{{ c.appIcon }}</span></td
            >

            <!-- 广告系列名称 -->
            <td class="name-cell">{{ c.name }}</td>

            <!-- 渠道 -->
            <td>
              <span
                class="plat-badge"
                :style="{ background: platformColor(c.platform), color: '#fff' }"
                >{{ c.platformIcon }}</span
              >
            </td>

            <!-- 国家 -->
            <td>
              <span class="country-cell">
                <span>{{ c.countryFlag }}</span>
                <span class="country-code">{{ c.country }}</span>
              </span>
            </td>

            <!-- 状态 -->
            <td>
              <span class="status-cell" :style="statusStyle(c.status)">
                <i class="dot" :style="{ background: statusStyle(c.status).color }"></i>
                <span v-if="c.status === 'active'">激活</span>
                <span v-else-if="c.status === 'warn'">⚠ 超预算</span>
                <span v-else>○ 未启动</span>
              </span>
            </td>

            <!-- 广告支出/预算 -->
            <td class="budget-cell">
              <div class="budget-nums">
                <span :style="{ color: c.status === 'inactive' ? '#4b5563' : '#e2e8f0' }">
                  {{ fmtNum(c.spend) }}
                </span>
                <span class="budget-sep">/</span>
                <span class="text-dim">{{ fmtNum(c.budget) }}</span>
              </div>
              <div class="mini-prog-wrap">
                <div class="mini-prog-track">
                  <div
                    class="mini-prog-fill"
                    :style="{ width: progressPct(c) + '%', background: progressColor(c) }"
                  ></div>
                </div>
                <span class="mini-pct" :style="{ color: progressColor(c) }"
                  >{{ progressPct(c) }}%</span
                >
              </div>
            </td>

            <!-- 计算消耗 -->
            <td :style="{ color: c.status === 'inactive' ? '#4b5563' : '#94a3b8' }">
              {{ c.calcSpend > 0 ? fmtNum(c.calcSpend) : '--' }}
            </td>

            <!-- 代投消耗 -->
            <td :style="{ color: c.status === 'inactive' ? '#4b5563' : '#94a3b8' }">
              {{ c.agencySpend > 0 ? fmtNum(c.agencySpend) : '--' }}
            </td>

            <!-- 首日ROI -->
            <td>
              <span :style="roiStyle(c.roi)" style="font-weight: 600">{{ fmtRoi(c.roi) }}</span>
            </td>

            <!-- 最低消耗 -->
            <td style="color: #a78bfa">{{ fmtNum(c.minSpend) }}</td>

            <!-- 预估利润 -->
            <td>
              <span :style="profitStyle(c.estProfit)" style="font-weight: 600">
                {{ fmtNum(c.estProfit) }}
              </span>
            </td>

            <!-- 最低利润 -->
            <td>
              <span :style="minProfitStyle(c.minProfit)">{{ fmtNum(c.minProfit) }}</span>
            </td>

            <!-- CPI -->
            <td :style="{ color: c.cpi === null ? '#4b5563' : '#94a3b8' }">
              {{ c.cpi === null ? '--' : '$' + c.cpi }}
            </td>

            <!-- 趋势 -->
            <td>
              <span class="trend-cell" :style="{ color: trendColor(c.trend) }">{{
                trendSvg(c.trend)
              }}</span>
            </td>

            <!-- 操作 -->
            <td>
              <button class="detail-btn">详情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── 分页 ── -->
    <div class="pagination-bar">
      <span class="page-info">共 {{ totalCampaigns }} 条广告系列</span>
      <div class="page-nums">
        <button :class="['page-btn', currentPage === 1 ? 'active' : '']" @click="currentPage = 1"
          >1</button
        >
        <button class="page-btn" @click="currentPage = 2">2</button>
        <button class="page-btn" @click="currentPage = 3">3</button>
        <span class="page-ellipsis">...</span>
        <button class="page-btn">[19]</button>
        <span class="page-sep">19</span>
      </div>
      <select class="page-size-select" v-model="pageSize">
        <option :value="10">10条/页</option>
        <option :value="20">20条/页</option>
        <option :value="50">50条/页</option>
      </select>
    </div>

    <!-- ── 底部汇总栏 ── -->
    <div class="bottom-bar">
      <div class="bar-group">
        <div class="bar-item">
          <span class="bar-label">广告支出小计</span>
          <span class="bar-val" style="color: #10b981">$12,200</span>
        </div>
        <div class="bar-item">
          <span class="bar-label">计算消耗</span>
          <span class="bar-val" style="color: #e2e8f0">$11,480</span>
        </div>
        <div class="bar-item">
          <span class="bar-label">差异</span>
          <span class="bar-val" style="color: #f97316">-$720</span>
        </div>
      </div>
      <div class="bar-divider"></div>
      <div class="bar-group">
        <div class="bar-item">
          <span class="bar-label">代投消耗小计</span>
          <span class="bar-val" style="color: #f59e0b">$8,960</span>
        </div>
        <div class="bar-item">
          <span class="bar-label">直投消耗</span>
          <span class="bar-val" style="color: #e2e8f0">$2,520</span>
        </div>
        <div class="bar-item">
          <span class="bar-label">代投占比</span>
          <span class="bar-val" style="color: #60a5fa">73.4%</span>
        </div>
      </div>
      <div class="bar-divider"></div>
      <div class="bar-group">
        <div class="bar-item">
          <span class="bar-label">利润小计预估</span>
          <span class="bar-val" style="color: #10b981">$4,660</span>
        </div>
        <div class="bar-item">
          <span class="bar-label">最低</span>
          <span class="bar-val" style="color: #a78bfa">$2,100</span>
        </div>
        <div class="bar-item">
          <span class="bar-label">不盈利</span>
          <span class="bar-val" style="color: #ef4444">1条 ⚠</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .campaign-tab {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* ── 筛选栏 ── */
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .filter-selects {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-select {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 5px 12px;
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    cursor: pointer;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
    transition: border-color 0.2s;
  }

  .filter-select:hover {
    border-color: #2a4060;
  }

  .caret {
    font-size: 10px;
    color: var(--text-dim);
  }

  .filter-right {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .search-input {
    width: 180px;
    padding: 5px 12px;
    font-size: 12px;
    color: var(--text-primary);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
    outline: none;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    border-color: var(--teal);
  }

  .search-input::placeholder {
    color: var(--text-dim);
  }

  .reset-btn {
    padding: 5px 12px;
    font-size: 12px;
    color: var(--teal);
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    background: var(--teal-dim);
  }

  /* ── 表格 ── */
  .table-wrap {
    overflow: auto;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .data-table {
    width: 100%;
    min-width: 1200px;
    font-size: 12px;
    border-collapse: collapse;
  }

  .data-table th {
    position: sticky;
    top: 0;
    padding: 10px;
    font-weight: 500;
    color: var(--text-dim);
    text-align: left;
    white-space: nowrap;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border);
  }

  .th-name {
    min-width: 200px;
  }

  .th-budget {
    min-width: 140px;
  }

  .data-row td {
    padding: 10px;
    vertical-align: middle;
    border-bottom: 1px solid rgb(30 47 69 / 40%);
  }

  .data-row:last-child td {
    border-bottom: none;
  }

  .data-row:hover td {
    background: rgb(15 25 41 / 60%);
  }

  .row-warn {
    border-left: 2px solid #f59e0b;
  }

  .row-warn td {
    background: rgb(146 64 14 / 5%);
  }

  .row-inactive {
    opacity: 0.55;
  }

  .app-icon-sm {
    font-size: 16px;
  }

  .name-cell {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .plat-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 4px;
  }

  .country-cell {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .country-code {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .status-cell {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 11px;
    white-space: nowrap;
  }

  .dot {
    display: inline-block;
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  /* ── 预算进度 ── */
  .budget-cell {
    min-width: 130px;
  }

  .budget-nums {
    display: flex;
    gap: 2px;
    align-items: center;
    font-size: 12px;
  }

  .budget-sep {
    color: var(--text-dim);
  }

  .text-dim {
    color: var(--text-dim);
  }

  .mini-prog-wrap {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-top: 4px;
  }

  .mini-prog-track {
    flex: 1;
    height: 4px;
    overflow: hidden;
    background: var(--bg-card2);
    border-radius: 2px;
  }

  .mini-prog-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s;
  }

  .mini-pct {
    min-width: 28px;
    font-size: 11px;
    font-weight: 500;
  }

  /* ── 趋势 ── */
  .trend-cell {
    font-size: 16px;
    font-weight: 700;
  }

  /* ── 详情按钮 ── */
  .detail-btn {
    padding: 3px 10px;
    font-size: 11px;
    color: var(--teal);
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 4px;
    transition: all 0.2s;
  }

  .detail-btn:hover {
    background: var(--teal-dim);
    border-color: var(--teal);
  }

  /* ── 分页 ── */
  .pagination-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
    font-size: 12px;
  }

  .page-info {
    margin-right: 8px;
    color: var(--text-dim);
  }

  .page-nums {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .page-btn {
    min-width: 28px;
    height: 28px;
    padding: 0 8px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 4px;
    transition: all 0.2s;
  }

  .page-btn:hover {
    color: var(--teal);
    border-color: var(--teal);
  }

  .page-btn.active {
    font-weight: 600;
    color: #000;
    background: var(--teal);
    border-color: var(--teal);
  }

  .page-ellipsis,
  .page-sep {
    padding: 0 4px;
    color: var(--text-dim);
  }

  .page-size-select {
    padding: 4px 8px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 4px;
    outline: none;
  }

  /* ── 底部汇总栏 ── */
  .bottom-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    align-items: center;
    padding: 12px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .bar-group {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 0 20px;
  }

  .bar-group:first-child {
    padding-left: 0;
  }

  .bar-divider {
    width: 1px;
    height: 40px;
    margin: 0 4px;
    background: var(--border);
  }

  .bar-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .bar-label {
    font-size: 11px;
    color: var(--text-dim);
  }

  .bar-val {
    font-size: 18px;
    font-weight: 700;
  }
</style>
