<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { MOCK_MY_ADS_CAMPAIGN_ROWS } from '../mock/data'

  defineOptions({ name: 'CampaignTab' })

  /* ── 类型 ── */
  interface Campaign {
    id: string
    appIcon: string
    appName: string
    name: string
    platform: string
    platformIcon: string
    /** ISO 3166-1 alpha-2；国旗由 flag-icons 映射，不依赖接口返回 emoji */
    s_country_code: string
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

  const campaigns: Campaign[] = MOCK_MY_ADS_CAMPAIGN_ROWS

  /* ── 筛选 ── */
  const scopeOptions = [
    { value: '全部', label: '全部' },
    { value: '我负责的', label: '我负责的' }
  ]

  const filterScope = ref<string | undefined>(undefined)

  const filterApp = ref<string | undefined>(undefined)
  const filterPlatform = ref<string | undefined>(undefined)
  const filterCountry = ref<string | undefined>(undefined)
  const filterStatus = ref<Campaign['status'] | undefined>(undefined)
  const filterType = ref<'with_agency' | 'pure' | undefined>(undefined)

  const statusOptions = [
    { value: 'active' as const, label: '激活' },
    { value: 'warn' as const, label: '超预算' },
    { value: 'inactive' as const, label: '未启动' }
  ]

  const typeOptions = [
    { value: 'with_agency' as const, label: '含代投' },
    { value: 'pure' as const, label: '仅直投' }
  ]

  const appOptions = computed(() => {
    const names = [...new Set(campaigns.map((c) => c.appName))].sort()
    return names.map((n) => ({ value: n, label: n }))
  })

  const platformOptions = computed(() => {
    const ps = [...new Set(campaigns.map((c) => c.platform))].sort()
    return ps.map((p) => ({ value: p, label: p }))
  })

  const countryOptions = computed(() => {
    const cs = [...new Set(campaigns.map((c) => c.s_country_code))].sort()
    return cs.map((c) => ({ value: c, label: c }))
  })

  const searchText = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)

  /** 筛选后的全量（不分页）；接接口时等价于服务端在筛选条件下的 total 条数对应的完整列表，或由接口直接返回当前页数据 */
  const filteredCampaigns = computed(() => {
    let list = campaigns.slice()

    if (filterApp.value) {
      list = list.filter((c) => c.appName === filterApp.value)
    }
    if (filterPlatform.value) {
      list = list.filter((c) => c.platform === filterPlatform.value)
    }
    if (filterCountry.value) {
      list = list.filter((c) => c.s_country_code === filterCountry.value)
    }
    if (filterStatus.value) {
      list = list.filter((c) => c.status === filterStatus.value)
    }
    if (filterType.value === 'with_agency') {
      list = list.filter((c) => c.agencySpend > 0)
    } else if (filterType.value === 'pure') {
      list = list.filter((c) => c.agencySpend === 0)
    }

    const q = searchText.value.trim().toLowerCase()
    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q))
    }

    return list
  })

  const filteredTotal = computed(() => filteredCampaigns.value.length)

  /** 当前表格行（前端分页切片）；接接口后改为接口返回的 list，total 用接口 total */
  const pagedCampaigns = computed(() => {
    const list = filteredCampaigns.value
    const start = (currentPage.value - 1) * pageSize.value
    return list.slice(start, start + pageSize.value)
  })

  watch([filterApp, filterPlatform, filterCountry, filterStatus, filterType, searchText], () => {
    currentPage.value = 1
  })

  watch([filteredTotal, pageSize], () => {
    const maxPage = Math.max(1, Math.ceil(filteredTotal.value / pageSize.value) || 1)
    if (currentPage.value > maxPage) currentPage.value = maxPage
  })

  function resetFilters() {
    filterScope.value = undefined
    filterApp.value = undefined
    filterPlatform.value = undefined
    filterCountry.value = undefined
    filterStatus.value = undefined
    filterType.value = undefined
    searchText.value = ''
    currentPage.value = 1
  }

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

  /** flag-icons 的 `fi-xx` 后缀（小写）；非 ISO 两位码返回空不展示旗 */
  function countryFlagCode(code: string | undefined): string {
    const raw = (code || '').trim().toUpperCase()
    if (raw === 'UK') return 'gb'
    if (/^[A-Z]{2}$/.test(raw)) return raw.toLowerCase()
    return ''
  }

  /** 与业务页一致：`class="fi fi-xx"`（见 iaa-analysis tab-country） */
  function countryFlagFiClass(code: string | undefined): string {
    const suffix = countryFlagCode(code)
    return suffix ? `fi fi-${suffix}` : ''
  }
</script>

<template>
  <div class="campaign-tab">
    <!-- ── 筛选栏 ── -->
    <div class="filter-bar">
      <div class="filter-selects">
        <div class="filter-select-wrap">
          <ElSelect
            v-model="filterScope"
            class="filter-el"
            placeholder="请选择数据范围"
            clearable
            popper-class="campaign-tab-filter-popper"
            :teleported="true"
          >
            <ElOption v-for="o in scopeOptions" :key="o.value" :label="o.label" :value="o.value" />
          </ElSelect>
        </div>
        <div class="filter-select-wrap">
          <ElSelect
            v-model="filterApp"
            class="filter-el filter-el--app"
            placeholder="请选择应用"
            clearable
            popper-class="campaign-tab-filter-popper"
            :teleported="true"
          >
            <ElOption v-for="o in appOptions" :key="o.value" :label="o.label" :value="o.value" />
          </ElSelect>
        </div>
        <div class="filter-select-wrap">
          <ElSelect
            v-model="filterPlatform"
            class="filter-el"
            placeholder="请选择广告平台"
            clearable
            popper-class="campaign-tab-filter-popper"
            :teleported="true"
          >
            <ElOption
              v-for="o in platformOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </ElSelect>
        </div>
        <div class="filter-select-wrap">
          <ElSelect
            v-model="filterCountry"
            class="filter-el"
            placeholder="请选择国家或地区"
            clearable
            popper-class="campaign-tab-filter-popper"
            :teleported="true"
          >
            <ElOption
              v-for="o in countryOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </ElSelect>
        </div>
        <div class="filter-select-wrap">
          <ElSelect
            v-model="filterStatus"
            class="filter-el"
            placeholder="请选择状态"
            clearable
            popper-class="campaign-tab-filter-popper"
            :teleported="true"
          >
            <ElOption v-for="o in statusOptions" :key="o.value" :label="o.label" :value="o.value" />
          </ElSelect>
        </div>
        <div class="filter-select-wrap">
          <ElSelect
            v-model="filterType"
            class="filter-el"
            placeholder="请选择投放类型"
            clearable
            popper-class="campaign-tab-filter-popper"
            :teleported="true"
          >
            <ElOption v-for="o in typeOptions" :key="o.value" :label="o.label" :value="o.value" />
          </ElSelect>
        </div>
      </div>
      <div class="filter-right">
        <input v-model="searchText" class="search-input" placeholder="输入广告系列名称搜索" />
        <button type="button" class="reset-btn" @click="resetFilters">重置</button>
      </div>
    </div>

    <!-- ── 数据表格 ── -->
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th class="th-app">应用</th>
            <th class="th-name">广告系列名称</th>
            <th>广告平台</th>
            <th>国家</th>
            <th>状态</th>
            <th class="th-budget">广告支出/预算</th>
            <th>预算</th>
            <th>代投消耗</th>
            <th>首日ROI</th>
            <th>预估利润</th>
            <th>最低利润</th>
            <th>CPI</th>
            <th>趋势</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="c in pagedCampaigns"
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

            <!-- 广告平台 -->
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
                <span
                  v-if="countryFlagFiClass(c.s_country_code)"
                  class="campaign-tab-flag"
                  :class="countryFlagFiClass(c.s_country_code)"
                  :title="c.s_country_code"
                ></span>
                <span class="country-code">{{ c.s_country_code || '—' }}</span>
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

            <!-- 预算 -->
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

    <!-- ── 分页：Mock 下为前端切片；接接口后 total/page/page_size 与后端一致即可 -->
    <div class="pagination-bar">
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filteredTotal"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        small
        background
        class="campaign-tab-pagination"
      />
    </div>

    <!-- ── 底部汇总栏 ── -->
    <div class="bottom-bar">
      <div class="bar-group">
        <div class="bar-item">
          <span class="bar-label">广告支出小计</span>
          <span class="bar-val" style="color: #10b981">$12,200</span>
        </div>
        <div class="bar-item">
          <span class="bar-label">预算</span>
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

  .filter-select-wrap {
    display: inline-flex;
  }

  .filter-el {
    min-width: 104px;
  }

  .filter-el--app {
    min-width: 120px;
  }

  .filter-select-wrap :deep(.el-select__wrapper) {
    gap: 6px;
    min-height: 30px;
    padding: 5px 28px 5px 12px;
    font-size: 12px;
    color: var(--text-secondary);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
    box-shadow: none;
    transition: border-color 0.2s;
  }

  .filter-select-wrap :deep(.el-select__wrapper.is-hovering) {
    border-color: #2a4060;
  }

  .filter-select-wrap :deep(.el-select__wrapper.is-focused) {
    border-color: var(--teal);
    box-shadow: none;
  }

  .filter-select-wrap :deep(.el-select__selected-item) {
    font-size: 12px;
    font-weight: 400;
    color: var(--text-secondary);
  }

  .filter-select-wrap :deep(.el-select__placeholder) {
    font-size: 12px;
    color: var(--text-dim);
  }

  .filter-select-wrap :deep(.el-select__caret) {
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

  /* 勿覆盖 .fi 的宽高/line-height，否则 flag-icons 背景图不可见 */
  .campaign-tab-flag {
    flex-shrink: 0;
    margin-right: 2px;
    border-radius: 1px;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 12%);
  }

  .country-code {
    font-size: 11px;
    color: var(--text-secondary, #94a3b8);
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

  /* ── 分页（对齐原自定义 .page-info / .page-btn / .page-size-select 视觉） ── */
  .pagination-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
    font-size: 12px;
  }

  .campaign-tab-pagination {
    justify-content: flex-end;
    width: 100%;

    :deep(.el-pagination) {
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
    }

    :deep(.el-pagination__total) {
      margin-right: 8px;
      font-size: 12px;
      color: var(--text-dim);
    }

    :deep(.el-pagination__sizes) {
      margin-right: 0;
    }

    :deep(.el-pagination__jump) {
      margin-left: 0;
      font-size: 12px;
      color: var(--text-dim);
    }

    :deep(.el-pagination__goto),
    :deep(.el-pagination__classifier) {
      color: var(--text-dim);
    }

    :deep(.el-pagination__editor.el-input) {
      width: 48px;
    }

    :deep(.el-pagination__editor .el-input__wrapper) {
      min-height: 28px;
      padding: 0 8px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 4px;
      box-shadow: none;
    }

    :deep(.el-pagination__editor .el-input__inner) {
      font-size: 12px;
      color: var(--text-secondary);
      text-align: center;
    }

    :deep(.el-select .el-select__wrapper) {
      gap: 4px;
      min-height: 28px;
      padding: 4px 28px 4px 8px;
      font-size: 12px;
      color: var(--text-secondary);
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 4px;
      box-shadow: none;
    }

    :deep(.el-select:hover .el-select__wrapper) {
      border-color: #2a4060;
    }

    :deep(.el-select .el-select__caret) {
      font-size: 10px;
      color: var(--text-dim);
    }

    :deep(.el-pagination.is-background .btn-prev),
    :deep(.el-pagination.is-background .btn-next),
    :deep(.el-pagination.is-background .el-pager li) {
      min-width: 28px;
      height: 28px;
      margin: 0 2px;
      font-size: 12px;
      font-weight: 400;
      color: var(--text-secondary);
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 4px;
      box-shadow: none;
    }

    :deep(.el-pagination.is-background .btn-prev:not(:disabled):hover),
    :deep(.el-pagination.is-background .btn-next:not(:disabled):hover),
    :deep(.el-pagination.is-background .el-pager li:not(.is-active):hover) {
      color: #00d4aa;
      border-color: #00d4aa;
    }

    :deep(.el-pagination.is-background .el-pager li.is-active) {
      font-weight: 600;
      color: #000;
      background: var(--teal);
      border-color: var(--teal);
    }

    :deep(.el-pagination.is-background .btn-prev.is-disabled),
    :deep(.el-pagination.is-background .btn-next.is-disabled) {
      color: var(--text-dim);
      background: var(--bg-card);
      border-color: var(--border);
      opacity: 0.55;
    }
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

<style lang="scss">
  .campaign-tab-filter-popper.el-popper {
    background: #0f1929;
    border: 1px solid #1e2f45;
  }

  .campaign-tab-filter-popper .el-select-dropdown__item {
    font-size: 12px;
    color: #e2e8f0;
  }

  .campaign-tab-filter-popper .el-select-dropdown__item.is-hovering {
    background: rgb(0 212 170 / 12%);
  }

  .campaign-tab-filter-popper .el-select-dropdown__item.is-selected {
    font-weight: 600;
    color: #00d4aa;
  }
</style>
