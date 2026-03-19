<template>
  <div ref="rootRef" class="revenue-overview-root art-full-height">
    <div
      class="revenue-overview-wrap revenue-overview-page"
      :style="{
        width: `${designWidth}px`,
        height: `${designHeight}px`,
        transform: `scale(${scale})`,
        transformOrigin: '0 0'
      }"
    >
      <!-- 顶部栏：筛选 + 导出（对齐原型右上角） -->
      <header class="rev-header">
        <div class="rev-header__filters">
          <div class="rev-pill">
            <span class="rev-pill__k">App:</span>
            <ElSelect
              v-model="filters.s_app_id"
              class="rev-select"
              popper-class="rev-select__popper"
              :teleported="false"
              :fit-input-width="true"
            >
              <ElOption
                v-for="opt in appOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
          </div>

          <div class="rev-pill">
            <span class="rev-pill__k">Platform:</span>
            <ElSelect
              v-model="filters.platform"
              class="rev-select"
              popper-class="rev-select__popper"
              :teleported="false"
              :fit-input-width="true"
            >
              <ElOption
                v-for="opt in platformOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
          </div>

          <div class="rev-pill">
            <span class="rev-pill__k">Country:</span>
            <ElSelect
              v-model="filters.s_country_code"
              class="rev-select"
              popper-class="rev-select__popper"
              :teleported="false"
              :fit-input-width="true"
              filterable
            >
              <ElOption
                v-for="opt in countryOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
          </div>

          <div class="rev-pill">
            <span class="rev-pill__k">Version:</span>
            <ElSelect
              v-model="filters.app_version"
              class="rev-select"
              popper-class="rev-select__popper"
              :teleported="false"
              :fit-input-width="true"
            >
              <ElOption
                v-for="opt in versionOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
          </div>

          <div class="rev-pill">
            <span class="rev-pill__k">Date:</span>
            <ElDatePicker
              v-model="filters.t_date"
              type="date"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              class="rev-date"
              :teleported="false"
              :clearable="false"
            />
          </div>
        </div>

        <button type="button" class="rev-export" @click="onExport">Export</button>
      </header>

      <!-- KPI 卡片 -->
      <section class="rev-kpi-grid">
        <article v-for="k in kpis" :key="k.id" class="rev-kpi" :data-accent="k.accent">
          <div class="rev-kpi__head">
            <div class="rev-kpi__title">{{ k.title }}</div>
            <div class="rev-kpi__trend" :class="k.trendUp ? 'up' : 'down'">
              {{ k.trendPercentText }}
            </div>
          </div>
          <div class="rev-kpi__value">{{ k.primaryValue }}</div>
          <div class="rev-kpi__sub">
            <span class="rev-kpi__subitem">{{ k.subLeftLabel }} {{ k.subLeftValue }}</span>
            <span class="rev-kpi__subitem">{{ k.subRightLabel }} {{ k.subRightValue }}</span>
          </div>
          <div :ref="(el) => setSparkRef(k.id, el)" class="rev-kpi__spark" />
        </article>
      </section>

      <!-- 主体栅格：完全按原型固定列宽/高度 -->
      <section class="rev-main">
        <!-- 上排：左 IAA / 中 IAP / 右 7天 IAA vs IAP -->
        <div class="rev-panel rev-panel--iaa">
          <div class="rev-panel__header">
            <div class="rev-panel__title">IAA 广告收入构成分析</div>
            <div class="rev-tabs">
              <button
                v-for="t in iaaTabs"
                :key="t.key"
                type="button"
                class="rev-tab"
                :class="{ active: iaaTab === t.key }"
                @click="iaaTab = t.key"
              >
                {{ t.label }}
              </button>
            </div>
          </div>

          <div class="rev-iaa-bar">
            <div class="rev-iaa-bar__track">
              <div
                v-for="seg in iaaSegments"
                :key="seg.key"
                class="rev-iaa-bar__seg"
                :style="{ width: `${seg.percent}%`, background: seg.color }"
              />
            </div>
            <div class="rev-iaa-bar__labels">
              <span v-for="seg in iaaSegments" :key="seg.key" class="rev-iaa-bar__label">
                <span class="rev-dot" :style="{ background: seg.color }" />
                {{ seg.label }} {{ seg.percent.toFixed(1) }}%
              </span>
            </div>
          </div>

          <div class="rev-table-wrap rev-table-wrap--iaa">
            <ArtTable
              class="rev-art-table"
              :data="iaaRowsWithTotal"
              :columns="iaaColumns"
              row-key="s_ad_type_name"
              :stripe="false"
              :border="false"
              size="default"
              :pagination="undefined"
              :header-cell-style="iaaHeaderCellStyle"
              :cell-style="iaaCellStyle"
            />
          </div>
        </div>

        <div class="rev-panel rev-panel--iap">
          <div class="rev-panel__header">
            <div class="rev-panel__title">IAP 付费收入分析</div>
            <div class="rev-tabs">
              <button
                v-for="t in iapTabs"
                :key="t.key"
                type="button"
                class="rev-tab"
                :class="{ active: iapTab === t.key }"
                @click="iapTab = t.key"
              >
                {{ t.label }}
              </button>
            </div>
          </div>

          <div class="rev-iap-top">
            <div class="rev-iap-kpi">
              <div class="rev-iap-kpi__k">订阅收入</div>
              <div class="rev-iap-kpi__v">$52.30</div>
              <div class="rev-iap-kpi__p">60.5%</div>
            </div>
            <div class="rev-iap-kpi">
              <div class="rev-iap-kpi__k">一次性购买</div>
              <div class="rev-iap-kpi__v">$34.17</div>
              <div class="rev-iap-kpi__p">39.5%</div>
            </div>
          </div>

          <div class="rev-table-wrap rev-table-wrap--iap">
            <ArtTable
              height="150px"
              class="rev-art-table"
              :data="iapRowsWithTotal"
              :columns="iapColumns"
              row-key="s_product"
              :stripe="false"
              :border="false"
              size="default"
              :pagination="undefined"
              :header-cell-style="iapHeaderCellStyle"
              :cell-style="iapCellStyle"
            >
              <template #d_purchase_rate="{ row }">
                <span
                  class="rev-pill-metric"
                  :class="
                    row.d_purchase_rate >= 70 ? 'good' : row.d_purchase_rate >= 30 ? 'mid' : 'bad'
                  "
                >
                  {{ row.d_purchase_rate.toFixed(1) }}%
                </span>
              </template>
            </ArtTable>
          </div>

          <div class="rev-iap-bottom">
            <div class="rev-mini-kpi">
              <div class="rev-mini-kpi__k">付费转化率</div>
              <div class="rev-mini-kpi__v">2.1%</div>
            </div>
            <div class="rev-mini-kpi">
              <div class="rev-mini-kpi__k">ARPPU</div>
              <div class="rev-mini-kpi__v">$9.99</div>
            </div>
            <div class="rev-mini-kpi">
              <div class="rev-mini-kpi__k">订阅续费率</div>
              <div class="rev-mini-kpi__v">78.4%</div>
            </div>
          </div>
        </div>

        <div class="rev-panel rev-panel--trend7d">
          <div class="rev-panel__header">
            <div class="rev-panel__title">近7天 IAA vs IAP 收入趋势</div>
            <div class="rev-legend">
              <span class="rev-legend__item"
                ><span class="rev-dot" style="background: var(--rev-c-teal)" /> IAA</span
              >
              <span class="rev-legend__item"
                ><span class="rev-dot" style="background: var(--rev-c-purple)" /> IAP</span
              >
            </div>
          </div>
          <div ref="trend7dRef" class="rev-chart" />
        </div>

        <!-- 下排：左 饼图 / 中 Top5 / 右 ECPM + AI + 质量 -->
        <div class="rev-panel rev-panel--pie">
          <div class="rev-panel__header">
            <div class="rev-panel__title">广告平台分布</div>
          </div>
          <div class="rev-pie">
            <div class="rev-pie__chart-wrap">
              <div ref="pieRef" class="rev-pie__chart" />
              <div class="rev-pie__center">
                <div class="rev-pie__center-value">{{ platformPieCenterTotal }}</div>
                <div class="rev-pie__center-label">广告收入</div>
              </div>
            </div>
            <div class="rev-pie__list">
              <div class="rev-pie__col">
                <div v-for="s in platformPieLeft" :key="s.name" class="rev-pie__item">
                  <span class="rev-dot" :style="{ background: s.color }" />
                  <div class="rev-pie__item-text">
                    <span class="rev-pie__name">{{ s.name }}</span>
                    <span class="rev-pie__percent" :style="{ color: s.color }">{{
                      s.percentText
                    }}</span>
                  </div>
                  <div class="rev-pie__money">{{ s.moneyText }}</div>
                </div>
              </div>
              <div class="rev-pie__col">
                <div v-for="s in platformPieRight" :key="s.name" class="rev-pie__item">
                  <span class="rev-dot" :style="{ background: s.color }" />
                  <div class="rev-pie__item-text">
                    <span class="rev-pie__name">{{ s.name }}</span>
                    <span class="rev-pie__percent" :style="{ color: s.color }">{{
                      s.percentText
                    }}</span>
                  </div>
                  <div class="rev-pie__money">{{ s.moneyText }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="rev-panel rev-panel--top5">
          <div class="rev-panel__header">
            <div class="rev-panel__title">Top 5 国家收入</div>
            <div class="rev-tabs rev-tabs--compact rev-tabs--segmented">
              <button type="button" class="rev-tab active">合计</button>
              <button type="button" class="rev-tab">IAA</button>
              <button type="button" class="rev-tab">IAP</button>
            </div>
          </div>

          <div class="rev-table-wrap rev-table-wrap--top5">
            <ArtTable
              class="rev-art-table rev-art-table--top5"
              :data="topCountriesWithTotal"
              :columns="top5Columns"
              row-key="s_country_code"
              :stripe="false"
              :border="false"
              size="default"
              :pagination="undefined"
              :header-cell-style="top5HeaderCellStyle"
              :cell-style="top5CellStyle"
              :row-class-name="top5RowClassName"
            >
              <template #s_country_name="{ row }">
                <span class="rev-flag">{{ flagEmojiByCode(row.s_country_code) }}</span>
                {{ row.s_country_name }}
              </template>
            </ArtTable>
          </div>
        </div>

        <div class="rev-right-stack">
          <div class="rev-panel rev-panel--ecpm">
            <div class="rev-panel__header">
              <div class="rev-panel__title">ECPM 趋势（7天）</div>
              <div class="rev-legend">
                <span class="rev-legend__item">
                  <span class="rev-dot" style="background: var(--rev-c-amber)" />
                  预估 eCPM
                </span>
                <span class="rev-legend__item">
                  <span class="rev-dot" style="background: var(--rev-c-cyan)" />
                  真实 eCPM
                </span>
              </div>
            </div>
            <div ref="ecpmRef" class="rev-chart rev-chart--sm" />
          </div>

          <div class="rev-right-bottom">
            <div class="rev-panel rev-panel--ai">
              <div class="rev-panel__header">
                <div class="rev-panel__title">{{ aiInsight.title }}</div>
              </div>
              <ul class="rev-ai">
                <li v-for="(b, i) in aiInsight.bullets" :key="i">{{ b }}</li>
              </ul>
            </div>

            <div class="rev-panel rev-panel--quality">
              <div class="rev-panel__header">
                <div class="rev-panel__title">收入质量指标</div>
              </div>
              <div class="rev-quality-grid">
                <div
                  v-for="m in qualityMetrics"
                  :key="m.title"
                  class="rev-quality"
                  :data-accent="m.accent"
                >
                  <div class="rev-quality__k">{{ m.title }}</div>
                  <div class="rev-quality__v">{{ m.valueText }}</div>
                  <div class="rev-quality__sub">
                    <span class="rev-quality__hint">{{ m.subText }}</span>
                    <span class="rev-quality__trend" :class="m.trendUp ? 'up' : 'down'">{{
                      m.trendText
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import { graphic, type EChartsOption } from '@/plugins/echarts'
  import type { ColumnOption } from '@/types'
  import {
    MOCK_REVENUE_OVERVIEW_AI_INSIGHT,
    MOCK_REVENUE_OVERVIEW_ECPM_7D,
    MOCK_REVENUE_OVERVIEW_FILTERS,
    MOCK_REVENUE_OVERVIEW_IAA_ROWS,
    MOCK_REVENUE_OVERVIEW_IAA_TABS,
    MOCK_REVENUE_OVERVIEW_IAP_ROWS,
    MOCK_REVENUE_OVERVIEW_IAP_TABS,
    MOCK_REVENUE_OVERVIEW_KPIS,
    MOCK_REVENUE_OVERVIEW_7D_DATES,
    MOCK_REVENUE_OVERVIEW_7D_TREND,
    MOCK_REVENUE_OVERVIEW_PLATFORM_PIE,
    MOCK_REVENUE_OVERVIEW_TOP_COUNTRIES,
    MOCK_REVENUE_OVERVIEW_QUALITY_METRICS,
    type RevenueOverviewFilterState
  } from './mock'

  defineOptions({ name: 'RevenueOverview' })

  // 对齐原型：固定画布 + 自适应缩放（与项目 big-screen/finance-screen 一致）
  const designWidth = 1700
  const designHeight = 980
  const rootRef = ref<HTMLElement>()
  const scale = ref(1)
  const updateScale = () => {
    const el = rootRef.value
    if (!el) return
    const w = el.clientWidth
    if (w <= 0) return
    scale.value = w / designWidth
  }
  let resizeObserver: ResizeObserver | null = null

  type SelectOption<T extends string = string> = { label: string; value: T }

  const filters = reactive<RevenueOverviewFilterState>({ ...MOCK_REVENUE_OVERVIEW_FILTERS })

  const appOptions = computed<SelectOption[]>(() => [
    { label: 'Weather5', value: 'weather5' },
    { label: 'App A', value: 'app_a' },
    { label: 'App B', value: 'app_b' }
  ])
  const platformOptions = computed<SelectOption<RevenueOverviewFilterState['platform']>[]>(() => [
    { label: 'Android & iOS', value: 'all' },
    { label: 'Android', value: 'android' },
    { label: 'iOS', value: 'ios' }
  ])
  const countryOptions = computed<SelectOption[]>(() => [
    { label: '全部', value: 'all' },
    { label: '美国', value: 'US' },
    { label: '英国', value: 'GB' },
    { label: '德国', value: 'DE' },
    { label: '台湾', value: 'TW' },
    { label: '日本', value: 'JP' }
  ])
  const versionOptions = computed<SelectOption[]>(() => [
    { label: '全部', value: 'all' },
    { label: '1.2.0', value: '1.2.0' },
    { label: '1.1.8', value: '1.1.8' },
    { label: '1.1.2', value: '1.1.2' }
  ])

  const kpis = ref(MOCK_REVENUE_OVERVIEW_KPIS)
  const iaaTabs = ref(MOCK_REVENUE_OVERVIEW_IAA_TABS)
  const iapTabs = ref(MOCK_REVENUE_OVERVIEW_IAP_TABS)
  const iaaTab = ref<(typeof MOCK_REVENUE_OVERVIEW_IAA_TABS)[number]['key']>('ad_type')
  const iapTab = ref<(typeof MOCK_REVENUE_OVERVIEW_IAP_TABS)[number]['key']>('product')

  const platformPie = ref(MOCK_REVENUE_OVERVIEW_PLATFORM_PIE)
  const platformPieCenterTotal = computed(() => {
    const list = platformPie.value
    const total = list.reduce((sum, s) => {
      const num = Number(String(s.moneyText || '').replace(/[^0-9.-]/g, '')) || 0
      return sum + num
    }, 0)
    return total ? `$${Math.round(total).toLocaleString()}` : '$0'
  })
  const platformPieLeft = computed(() => {
    const list = platformPie.value
    const mid = Math.ceil(list.length / 2)
    return list.slice(0, mid)
  })
  const platformPieRight = computed(() => {
    const list = platformPie.value
    const mid = Math.ceil(list.length / 2)
    return list.slice(mid)
  })
  const topCountries = ref(MOCK_REVENUE_OVERVIEW_TOP_COUNTRIES)
  const aiInsight = ref(MOCK_REVENUE_OVERVIEW_AI_INSIGHT)
  const qualityMetrics = ref(MOCK_REVENUE_OVERVIEW_QUALITY_METRICS)

  function formatInt(n: number) {
    return Number(n || 0).toLocaleString()
  }
  function formatMoneyInt(n: number) {
    return Math.round(Number(n || 0)).toLocaleString()
  }
  function formatFixed(n: number, digits: number) {
    const v = Number(n || 0)
    return Number.isFinite(v) ? v.toFixed(digits) : '0'
  }

  const iaaSegments = computed(() => {
    const rows = MOCK_REVENUE_OVERVIEW_IAA_ROWS
    const colors = ['#20d6b5', '#5ad6ff', '#8b5cf6', '#f59e0b']
    return rows.map((r, idx) => ({
      key: r.s_ad_type_name,
      label: r.s_ad_type_name,
      percent: r.percent,
      color: colors[idx % colors.length]
    }))
  })

  const iaaRowsWithTotal = computed(() => {
    const rows = [...MOCK_REVENUE_OVERVIEW_IAA_ROWS]
    const sumRevenue = rows.reduce((acc, r) => acc + r.revenue, 0)
    const sumUsers = rows.reduce((acc, r) => acc + r.n_users, 0)
    const sumImp = rows.reduce((acc, r) => acc + r.n_impression, 0)
    const avgEcpm = rows.length ? rows.reduce((acc, r) => acc + r.d_ecpm, 0) / rows.length : 0
    const avgArpdau = rows.length ? rows.reduce((acc, r) => acc + r.d_arpdau, 0) / rows.length : 0
    rows.push({
      s_ad_type_name: '合计',
      revenue: sumRevenue,
      percent: 100,
      n_users: sumUsers,
      n_impression: sumImp,
      d_ecpm: avgEcpm,
      d_arpdau: avgArpdau
    })
    return rows
  })

  const iapRowsWithTotal = computed(() => {
    const rows = [...MOCK_REVENUE_OVERVIEW_IAP_ROWS]
    const sumRevenue = rows.reduce((acc, r) => acc + r.revenue, 0)
    const sumTimes = rows.reduce((acc, r) => acc + r.n_buy_times, 0)
    const avgArppu = rows.length ? rows.reduce((acc, r) => acc + r.d_arppu, 0) / rows.length : 0
    const avgRate = rows.length
      ? rows.reduce((acc, r) => acc + r.d_purchase_rate, 0) / rows.length
      : 0
    rows.push({
      s_product: '合计',
      s_type: '订阅',
      revenue: sumRevenue,
      percent: 100,
      n_buy_times: sumTimes,
      n_users: rows.reduce((acc, r) => acc + r.n_users, 0),
      d_arppu: avgArppu,
      d_purchase_rate: avgRate
    })
    return rows
  })

  const iaaHeaderCellStyle = {
    color: 'var(--rev-muted)',
    fontSize: '12px',
    padding: '6px 0',
    background: 'rgba(0,0,0,0.18)',
    borderBottom: '1px solid var(--rev-border-soft)'
  } as const

  const iaaCellStyle = {
    background: 'transparent',
    color: 'var(--rev-text)',
    fontSize: '12px',
    padding: '6px 0',
    borderBottom: '1px solid var(--rev-border-soft)'
  } as const

  const iaaColumns = computed<ColumnOption[]>(() => [
    { label: '广告类型', prop: 's_ad_type_name', minWidth: 100 },
    {
      label: '收入',
      prop: 'revenue',
      minWidth: 88,
      formatter: (row: any) => `$${formatMoneyInt(row.revenue)}`
    },
    {
      label: '占比',
      prop: 'percent',
      minWidth: 70,
      formatter: (row: any) => `${Number(row.percent).toFixed(1)}%`
    },
    {
      label: '广告用户',
      prop: 'n_users',
      minWidth: 90,
      formatter: (row: any) => formatInt(row.n_users)
    },
    {
      label: '展示次数',
      prop: 'n_impression',
      minWidth: 90,
      formatter: (row: any) => formatInt(row.n_impression)
    },
    {
      label: '平均展示',
      prop: 'd_ecpm',
      minWidth: 80,
      formatter: (row: any) => formatFixed(row.d_ecpm, 1)
    },
    {
      label: '平均 eCPM',
      prop: 'd_arpdau',
      minWidth: 88,
      formatter: (row: any) => `$${formatFixed(row.d_arpdau, 3)}`
    }
  ])

  const iapHeaderCellStyle = {
    color: 'var(--rev-muted)',
    fontSize: '12px',
    padding: '6px 0',
    background: 'rgba(0,0,0,0.18)',
    borderBottom: '1px solid var(--rev-border-soft)'
  } as const

  const iapCellStyle = {
    background: 'transparent',
    color: 'var(--rev-text)',
    fontSize: '12px',
    padding: '6px 0',
    borderBottom: '1px solid var(--rev-border-soft)'
  } as const

  const iapColumns = computed<ColumnOption[]>(() => [
    { label: '商品', prop: 's_product', minWidth: 80, fixed: 'left' },
    {
      label: '价格',
      prop: 'd_arppu',
      minWidth: 70,
      formatter: (row: any) => `$${formatFixed(row.d_arppu, 2)}`
    },
    {
      label: '购买次数',
      prop: 'n_buy_times',
      minWidth: 80,
      formatter: (row: any) => formatInt(row.n_buy_times)
    },
    {
      label: '收入',
      prop: 'revenue',
      minWidth: 80,
      formatter: (row: any) => `$${formatFixed(row.revenue, 2)}`
    },
    {
      label: '占比',
      prop: 'percent',
      minWidth: 60,
      formatter: (row: any) => `${Number(row.percent).toFixed(1)}%`
    },
    { label: '续费率', prop: 'd_purchase_rate', minWidth: 60, useSlot: true }
  ])

  const top5HeaderCellStyle = {
    color: 'var(--rev-muted)',
    fontSize: '12px',
    padding: '6px 0',
    background: 'rgba(0,0,0,0.18)',
    borderBottom: '1px solid var(--rev-border-soft)'
  } as const

  const top5CellStyle = {
    background: 'transparent',
    color: 'var(--rev-text)',
    fontSize: '12px',
    padding: '6px 0',
    borderBottom: '1px solid var(--rev-border-soft)'
  } as const

  function top5RowClassName({ row }: { row: { s_country_code?: string } }) {
    return row?.s_country_code === 'ALL' ? 'is-subtotal' : ''
  }

  const top5Columns = computed<ColumnOption[]>(() => [
    { label: '国家', prop: 's_country_name', minWidth: 100, useSlot: true },
    {
      label: 'IAA收入',
      prop: 'iaa',
      minWidth: 90,
      'class-name': 'col-iaa',
      formatter: (row: any) => `$${formatMoneyInt(row.iaa)}`
    },
    {
      label: 'IAP收入',
      prop: 'iap',
      minWidth: 90,
      'class-name': 'col-iap',
      formatter: (row: any) => `$${formatFixed(row.iap, 1)}`
    },
    {
      label: '合计',
      prop: 'total',
      minWidth: 90,
      formatter: (row: any) => `$${formatMoneyInt(row.total)}`
    },
    {
      label: '占比',
      prop: 'percent',
      minWidth: 70,
      formatter: (row: any) => `${Number(row.percent).toFixed(1)}%`
    }
  ])

  const topCountriesWithTotal = computed(() => {
    const rows = [...topCountries.value]
    const sumIaa = rows.reduce((acc, r) => acc + r.iaa, 0)
    const sumIap = rows.reduce((acc, r) => acc + r.iap, 0)
    const sumTotal = rows.reduce((acc, r) => acc + r.total, 0)
    rows.push({
      s_country_name: '小计',
      s_country_code: 'ALL',
      iaa: sumIaa,
      iap: sumIap,
      total: sumTotal,
      percent: rows.reduce((acc, r) => acc + r.percent, 0)
    })
    return rows
  })

  function flagEmojiByCode(code: string) {
    const upper = String(code || '').toUpperCase()
    if (upper === 'ALL') return '🏳️'
    if (!/^[A-Z]{2}$/.test(upper)) return '🏳️'
    const base = 0x1f1e6
    const chars = [...upper].map((c) => String.fromCodePoint(base + (c.charCodeAt(0) - 65)))
    return chars.join('')
  }

  function getVar(el: HTMLElement | null, name: string, fallback: string) {
    const root = el ?? document.documentElement
    const v = getComputedStyle(root).getPropertyValue(name).trim()
    return v || fallback
  }

  // --- 图表：KPI sparkline（每卡一个） ---
  const sparkRefs = ref<Record<string, HTMLElement>>({})
  function setSparkRef(id: string, el: unknown) {
    if (el instanceof HTMLElement) sparkRefs.value[id] = el
    else if (el === null) delete sparkRefs.value[id]
  }
  const sparkCharts = new Map<string, ReturnType<typeof useChart>>()
  kpis.value.forEach((k) => sparkCharts.set(k.id, useChart({ autoTheme: true })))

  function buildSparkOption(data: number[], accent: string): EChartsOption {
    return {
      grid: { left: 0, right: 0, top: 2, bottom: 0 },
      xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
      yAxis: { type: 'value', show: false, scale: true },
      series: [
        {
          type: 'line',
          data,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: accent, width: 1.8 },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: accent },
              { offset: 1, color: 'rgba(0,0,0,0)' }
            ]),
            opacity: 0.22
          }
        }
      ]
    }
  }

  // --- 图表：趋势 / 饼图 / eCPM ---
  const trend7dRef = ref<HTMLElement>()
  const pieRef = ref<HTMLElement>()
  const ecpmRef = ref<HTMLElement>()

  const chartTrend7d = useChart({ autoTheme: true })
  const chartPie = useChart({ autoTheme: true })
  const chartEcpm = useChart({ autoTheme: true })

  function buildTrend7dOption(): EChartsOption {
    const el = trend7dRef.value ?? null
    const axis = getVar(el, '--rev-chart-axis', '#94a3b8')
    const split = getVar(el, '--rev-chart-split', 'rgba(255,255,255,0.08)')
    const teal = getVar(el, '--rev-c-teal', '#20d6b5')
    const purple = getVar(el, '--rev-c-purple', '#a78bfa')

    return {
      tooltip: chartTrend7d.getTooltipStyle('axis'),
      grid: { left: 38, right: 18, top: 18, bottom: 26, containLabel: true },
      xAxis: {
        type: 'category',
        data: MOCK_REVENUE_OVERVIEW_7D_DATES,
        axisLine: { lineStyle: { color: axis } },
        axisLabel: { color: axis, fontSize: 11 },
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          axisLine: { show: false },
          axisLabel: { color: axis, fontSize: 11 },
          splitLine: { lineStyle: { color: split } }
        },
        {
          type: 'value',
          axisLine: { show: false },
          axisLabel: { color: axis, fontSize: 11 },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'IAA',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: [...MOCK_REVENUE_OVERVIEW_7D_TREND.iaa],
          lineStyle: { color: teal, width: 2 },
          itemStyle: { color: teal },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: teal },
              { offset: 1, color: 'rgba(0,0,0,0)' }
            ]),
            opacity: 0.18
          }
        },
        {
          name: 'IAP',
          type: 'line',
          smooth: true,
          symbol: 'none',
          yAxisIndex: 1,
          data: [...MOCK_REVENUE_OVERVIEW_7D_TREND.iap],
          lineStyle: { color: purple, width: 2 },
          itemStyle: { color: purple },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: purple },
              { offset: 1, color: 'rgba(0,0,0,0)' }
            ]),
            opacity: 0.12
          }
        }
      ]
    }
  }

  function buildEcpmOption(): EChartsOption {
    const el = ecpmRef.value ?? null
    const axis = getVar(el, '--rev-chart-axis', '#94a3b8')
    const split = getVar(el, '--rev-chart-split', 'rgba(255,255,255,0.08)')
    const amber = getVar(el, '--rev-c-amber', '#f59e0b')
    const cyan = getVar(el, '--rev-c-cyan', '#38bdf8')

    return {
      tooltip: chartEcpm.getTooltipStyle('axis'),
      grid: { left: 34, right: 16, top: 16, bottom: 22, containLabel: true },
      xAxis: {
        type: 'category',
        data: MOCK_REVENUE_OVERVIEW_7D_DATES,
        axisLine: { lineStyle: { color: axis } },
        axisLabel: { color: axis, fontSize: 11 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: axis, fontSize: 11 },
        splitLine: { lineStyle: { color: split } }
      },
      series: [
        {
          name: '预估 eCPM',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: [...MOCK_REVENUE_OVERVIEW_ECPM_7D.predicted],
          lineStyle: { color: amber, width: 2, type: 'dashed' },
          itemStyle: { color: amber }
        },
        {
          name: '真实 eCPM',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: [...MOCK_REVENUE_OVERVIEW_ECPM_7D.actual],
          lineStyle: { color: cyan, width: 2 },
          itemStyle: { color: cyan }
        }
      ]
    }
  }

  function buildPieOption(): EChartsOption {
    const el = pieRef.value ?? null
    const muted = getVar(el, '--rev-muted', '#94a3b8')
    const slices = platformPie.value
    const rich: Record<string, { color: string }> = {}
    slices.forEach((s, i) => {
      rich[`c${i}`] = { color: s.color }
    })

    return {
      tooltip: chartPie.getTooltipStyle('item', {
        formatter: (p: any) => {
          const name = p?.name ?? ''
          const val = Number(p?.value ?? 0)
          return `${name}<br/>占比 ${val.toFixed(1)}%`
        }
      }),
      series: [
        {
          type: 'pie',
          radius: ['62%', '84%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: {
            show: true,
            position: 'outside',
            formatter: (params: any) => {
              const i = params.dataIndex ?? 0
              const pct = params.percent?.toFixed(1) ?? 0
              return `{c${i}|${pct}%}`
            },
            rich,
            fontSize: 12
          },
          labelLine: {
            show: true,
            lineStyle: { color: muted },
            length: 8,
            length2: 6
          },
          data: slices.map((s) => ({
            name: s.name,
            value: s.value,
            itemStyle: { color: s.color }
          }))
        }
      ]
    }
  }

  function onExport() {
    // Mock 页面：仅模拟交互
    // 后端接入后在 api 层实现导出

    console.log('[RevenueOverview] export', { ...filters })
  }

  async function initCharts() {
    await nextTick()

    // KPI sparks
    kpis.value.forEach((k) => {
      const dom = sparkRefs.value[k.id]
      if (!dom) return
      const chart = sparkCharts.get(k.id)
      if (!chart) return
      chart.chartRef!.value = dom
      const accent =
        k.accent === 'blue'
          ? getVar(dom, '--rev-c-blue', '#60a5fa')
          : k.accent === 'teal'
            ? getVar(dom, '--rev-c-teal', '#20d6b5')
            : k.accent === 'purple'
              ? getVar(dom, '--rev-c-purple', '#a78bfa')
              : k.accent === 'amber'
                ? getVar(dom, '--rev-c-amber', '#f59e0b')
                : k.accent === 'green'
                  ? getVar(dom, '--rev-c-green', '#22c55e')
                  : getVar(dom, '--rev-c-indigo', '#60a5fa')
      chart.initChart(buildSparkOption(k.spark, accent))
    })

    if (trend7dRef.value) {
      chartTrend7d.chartRef!.value = trend7dRef.value
      chartTrend7d.initChart(buildTrend7dOption())
    }
    if (ecpmRef.value) {
      chartEcpm.chartRef!.value = ecpmRef.value
      chartEcpm.initChart(buildEcpmOption())
    }
    if (pieRef.value) {
      chartPie.chartRef!.value = pieRef.value
      chartPie.initChart(buildPieOption())
    }
  }

  onMounted(() => {
    updateScale()
    if (rootRef.value) {
      resizeObserver = new ResizeObserver(() => updateScale())
      resizeObserver.observe(rootRef.value)
    }
    window.addEventListener('resize', updateScale)
    initCharts()
  })

  watch(
    () => [
      filters.s_app_id,
      filters.platform,
      filters.s_country_code,
      filters.app_version,
      filters.t_date
    ],
    () => {
      // mock：筛选变化仅刷新图表（真实接口接入后在此触发 load）
      chartTrend7d.updateChart(buildTrend7dOption())
      chartEcpm.updateChart(buildEcpmOption())
      chartPie.updateChart(buildPieOption())
      kpis.value.forEach((k) => {
        const dom = sparkRefs.value[k.id]
        const chart = sparkCharts.get(k.id)
        if (!dom || !chart) return
        const accent =
          k.accent === 'blue'
            ? getVar(dom, '--rev-c-blue', '#60a5fa')
            : k.accent === 'teal'
              ? getVar(dom, '--rev-c-teal', '#20d6b5')
              : k.accent === 'purple'
                ? getVar(dom, '--rev-c-purple', '#a78bfa')
                : k.accent === 'amber'
                  ? getVar(dom, '--rev-c-amber', '#f59e0b')
                  : k.accent === 'green'
                    ? getVar(dom, '--rev-c-green', '#22c55e')
                    : getVar(dom, '--rev-c-indigo', '#60a5fa')
        chart.updateChart(buildSparkOption(k.spark, accent))
      })
    }
  )

  onUnmounted(() => {
    if (resizeObserver && rootRef.value) {
      resizeObserver.unobserve(rootRef.value)
      resizeObserver = null
    }
    window.removeEventListener('resize', updateScale)
    sparkCharts.forEach((c) => c.destroyChart?.())
    chartTrend7d.destroyChart?.()
    chartEcpm.destroyChart?.()
    chartPie.destroyChart?.()
  })
</script>

<style scoped lang="scss">
  .revenue-overview-root {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: var(--art-full-height, calc(100vh - 120px));
    overflow: auto;
    background: transparent;
  }

  .revenue-overview-page {
    /* 默认深色（对齐原型），在 light 模式覆盖 */
    --rev-bg: #0f1419;
    --rev-panel-bg: #0b0f14;
    --rev-border: rgb(51 65 85 / 100%);
    --rev-border-soft: rgb(148 163 184 / 22%);
    --rev-text: #e2e8f0;
    --rev-muted: #94a3b8;
    --rev-pill: rgb(51 65 85 / 100%);
    --rev-pill-border: rgb(51 65 85 / 100%);
    --rev-chart-axis: rgb(148 163 184 / 95%);
    --rev-chart-split: rgb(255 255 255 / 7%);
    --rev-c-blue: #60a5fa;
    --rev-c-teal: #20d6b5;
    --rev-c-purple: #a78bfa;
    --rev-c-amber: #f59e0b;
    --rev-c-green: #22c55e;
    --rev-c-indigo: #38bdf8;
    --rev-c-cyan: #38bdf8;

    position: relative;
    box-sizing: border-box;
    padding: 14px 14px 0;
    color: var(--rev-text);
    background: var(--rev-bg);
    border-radius: 12px;
  }

  .revenue-overview-wrap {
    position: absolute;
    top: 0;
    left: 0;
  }

  :global(html:not(.dark) .revenue-overview-page) {
    --rev-bg: #f7f9fc;
    --rev-panel-bg: #fff;
    --rev-border: rgb(15 23 42 / 14%);
    --rev-border-soft: rgb(15 23 42 / 8%);
    --rev-text: #0f172a;
    --rev-muted: #64748b;
    --rev-pill: rgb(15 23 42 / 6%);
    --rev-pill-border: rgb(15 23 42 / 8%);
    --rev-chart-axis: rgb(100 116 139 / 95%);
    --rev-chart-split: rgb(15 23 42 / 8%);
  }

  .rev-header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 10px;
    margin-bottom: 12px;
  }

  .rev-header__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .rev-pill {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    height: 36px;
    padding: 0 10px;
    color: var(--rev-text);
    background: var(--rev-pill);
    border: 1px solid var(--rev-pill-border);
    border-radius: 14px;
  }

  .rev-pill__k {
    font-size: 12px;
    color: var(--rev-muted);
  }

  .rev-export {
    height: 36px;
    padding: 0 14px;
    font-size: 14px;
    color: var(--rev-text);
    cursor: pointer;
    background: var(--rev-pill);
    border: 1px solid var(--rev-pill-border);
    border-radius: 8px;
  }

  .rev-export:hover {
    filter: brightness(1.06);
  }

  .rev-select,
  .rev-date {
    width: 140px;
  }

  :deep(.rev-select .el-select__wrapper) {
    min-height: 30px;
    padding: 0 8px;
    background: transparent;
    border: 0;
    box-shadow: none;
  }

  :deep(.rev-date .el-input__wrapper) {
    min-height: 30px;
    padding: 0 8px;
    background: transparent;
    border: 0;
    box-shadow: none;
  }

  :deep(.rev-date .el-input__inner) {
    color: var(--rev-text);
  }

  :deep(.rev-select .el-select__selected-item),
  :deep(.rev-select .el-select__placeholder),
  :deep(.rev-select .el-select__caret) {
    color: var(--rev-text);
  }

  :deep(.rev-date .el-input__prefix),
  :deep(.rev-date .el-input__suffix) {
    color: var(--rev-text);
  }

  .rev-kpi-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 14px;
  }

  .rev-kpi {
    position: relative;
    padding: 12px 12px 10px;
    overflow: hidden;
    background: linear-gradient(135deg, rgb(255 255 255 / 6%), rgb(255 255 255 / 2%));
    border: 2px solid var(--rev-border);
    border-radius: 12px;
  }

  :global(html:not(.dark) .rev-kpi) {
    background: linear-gradient(135deg, rgb(37 99 235 / 8%), rgb(255 255 255 / 90%));
  }

  .rev-kpi__head {
    display: flex;
    gap: 8px;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .rev-kpi__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--rev-text);
  }

  .rev-kpi__trend {
    font-size: 12px;
    color: var(--rev-muted);
    white-space: nowrap;
  }

  .rev-kpi__trend.up {
    color: var(--rev-c-green);
  }

  .rev-kpi__trend.down {
    color: #ef4444;
  }

  .rev-kpi__value {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 0.01em;
  }

  .rev-kpi__sub {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 10px;
    margin-top: 4px;
    font-size: 12px;
    color: var(--rev-muted);
  }

  .rev-kpi__spark {
    height: 38px;
    margin-top: 6px;
  }

  .rev-main {
    display: grid;
    grid-template-rows: 420px 480px;
    grid-template-columns: 650px 480px 536px;
    grid-auto-flow: row;
    gap: 12px;
    align-items: start;
  }

  .rev-panel {
    background: linear-gradient(135deg, rgb(31 45 61 / 85%), rgb(0 0 0 / 55%));
    border: 2px solid var(--rev-border);
    border-radius: 12px;
  }

  .rev-panel--iaa,
  .rev-panel--iap,
  .rev-panel--trend7d {
    height: 420px;
  }

  .rev-panel--iaa {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .rev-panel--iaa .rev-panel__header,
  .rev-panel--iaa .rev-iaa-bar {
    flex: 0 0 auto;
  }

  .rev-table-wrap--iaa {
    flex: 1 1 auto;
    min-height: 0;
    padding-bottom: 12px;
    overflow: hidden;
  }

  .rev-table-wrap--iaa .rev-art-table {
    height: 100%;
  }

  .rev-panel--iaa :deep(.el-table) {
    background: transparent;
  }

  .rev-panel--iaa :deep(.el-table__inner-wrapper::before) {
    height: 0;
  }

  .rev-panel--iaa :deep(.el-table__body-wrapper) {
    overflow: auto;
  }

  .rev-panel--iaa :deep(.el-table th.el-table__cell) {
    background: rgb(0 0 0 / 18%) !important;
  }

  :global(html:not(.dark) .rev-panel--iaa :deep(.el-table th.el-table__cell)) {
    background: rgb(15 23 42 / 6%) !important;
  }

  .rev-panel--iap {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .rev-panel--iap .rev-panel__header {
    flex: 0 0 auto;
  }

  .rev-panel--iap .rev-iap-top {
    flex: 0 0 auto;
    padding-bottom: 8px;
  }

  .rev-table-wrap--iap {
    flex: 1 1 auto;
    min-height: 0;
    padding-bottom: 8px;
    overflow: hidden;
  }

  .rev-panel--iap .rev-iap-bottom {
    flex: 0 0 auto;
    padding-top: 0;
  }

  .rev-panel--iap .rev-table th,
  .rev-panel--iap .rev-table td {
    padding: 6px 10px;
  }

  .rev-art-table {
    height: 100%;
  }

  .rev-panel--iap :deep(.el-table) {
    background: transparent;
  }

  .rev-panel--iap :deep(.el-table__inner-wrapper::before) {
    height: 0;
  }

  .rev-panel--iap :deep(.el-table__body-wrapper) {
    /* 让滚动发生在表格内部，从而固定表头 */
    overflow: auto;
  }

  .rev-panel--iap :deep(.el-table th.el-table__cell) {
    background: rgb(0 0 0 / 18%) !important;
  }

  :global(html:not(.dark) .rev-panel--iap :deep(.el-table th.el-table__cell)) {
    background: rgb(15 23 42 / 6%) !important;
  }

  .rev-panel--iap .rev-pill-metric {
    min-width: 54px;
    height: 20px;
    padding: 0 8px;
  }

  .rev-panel--pie,
  .rev-panel--top5 {
    height: 480px;
  }

  .rev-panel--top5 {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .rev-panel--top5 .rev-panel__header {
    flex: 0 0 auto;
  }

  .rev-right-stack {
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 12px;
    height: 480px;
  }

  .rev-panel--ecpm {
    height: 240px;
  }

  .rev-right-bottom {
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    gap: 12px;
    align-items: stretch;
    height: 228px;
  }

  :global(html:not(.dark) .rev-panel) {
    background: linear-gradient(135deg, rgb(255 255 255 / 96%), rgb(248 250 252 / 90%));
  }

  .rev-panel__header {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
  }

  .rev-panel__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--rev-text);
  }

  .rev-tabs {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  .rev-tabs--compact {
    gap: 6px;
  }

  /* Top5 分段按钮：对齐原型右上角 segmented control */
  .rev-tabs--segmented {
    padding: 3px;
    background: rgb(51 65 85 / 65%);
    border: 1px solid rgb(148 163 184 / 18%);
    border-radius: 999px;
  }

  :global(html:not(.dark) .rev-tabs--segmented) {
    background: rgb(15 23 42 / 6%);
    border-color: rgb(15 23 42 / 12%);
  }

  .rev-tab {
    height: 28px;
    padding: 0 10px;
    font-size: 12px;
    color: var(--rev-muted);
    cursor: pointer;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 10px;
  }

  .rev-tab.active {
    color: var(--rev-text);
    background: rgb(20 214 181 / 12%);
    border-color: rgb(20 214 181 / 20%);
  }

  :global(html:not(.dark) .rev-tab.active) {
    background: rgb(37 99 235 / 12%);
    border-color: rgb(37 99 235 / 18%);
  }

  .rev-legend {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    font-size: 12px;
    color: var(--rev-muted);
  }

  .rev-legend__item {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    white-space: nowrap;
  }

  .rev-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .rev-chart {
    height: 290px;
    padding: 0 10px 10px;
  }

  .rev-chart--sm {
    height: 170px;
  }

  .rev-iaa-bar {
    padding: 0 12px 10px;
  }

  .rev-iaa-bar__track {
    display: flex;
    height: 14px;
    overflow: hidden;
    border-radius: 8px;
  }

  .rev-iaa-bar__seg {
    height: 100%;
  }

  .rev-iaa-bar__labels {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
    margin-top: 10px;
    font-size: 12px;
    color: var(--rev-muted);
  }

  .rev-iaa-bar__label {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .rev-table-wrap {
    padding: 0 12px 12px;
  }

  .rev-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .rev-table th,
  .rev-table td {
    padding: 8px 10px;
    border-bottom: 1px solid var(--rev-border-soft);
  }

  .rev-table th {
    font-weight: 500;
    color: var(--rev-muted);
  }

  .rev-table td {
    color: var(--rev-text);
  }

  .rev-table .num {
    text-align: right;
    white-space: nowrap;
  }

  .rev-table .txt {
    text-align: left;
    white-space: nowrap;
  }

  /* Top5 ArtTable：列高亮（IAA 绿 / IAP 紫），小计行加粗 */
  .rev-art-table--top5 :deep(.el-table td.col-iaa) {
    background: linear-gradient(90deg, rgb(16 185 129 / 16%), rgb(16 185 129 / 8%));
  }

  .rev-art-table--top5 :deep(.el-table td.col-iap) {
    font-weight: 700;
    color: rgb(167 139 250 / 95%);
    background: linear-gradient(90deg, rgb(167 139 250 / 18%), rgb(167 139 250 / 8%));
  }

  .rev-art-table--top5 :deep(.el-table tr.is-subtotal td) {
    font-weight: 800;
    border-top: 2px solid rgb(148 163 184 / 22%);
  }

  :global(html:not(.dark) .rev-art-table--top5 :deep(.el-table td.col-iaa)) {
    background: linear-gradient(90deg, rgb(16 185 129 / 14%), rgb(16 185 129 / 6%));
  }

  :global(html:not(.dark) .rev-art-table--top5 :deep(.el-table td.col-iap)) {
    color: rgb(124 58 237 / 95%);
    background: linear-gradient(90deg, rgb(124 58 237 / 14%), rgb(124 58 237 / 6%));
  }

  :global(html:not(.dark) .rev-art-table--top5 :deep(.el-table tr.is-subtotal td)) {
    border-top-color: rgb(15 23 42 / 12%);
  }

  .rev-panel--top5 .rev-table-wrap--top5 {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  .rev-panel--top5 .rev-art-table--top5 {
    height: 100%;
  }

  .rev-panel--top5 :deep(.el-table) {
    background: transparent;
  }

  .rev-panel--top5 :deep(.el-table th.el-table__cell) {
    background: rgb(0 0 0 / 18%) !important;
  }

  :global(html:not(.dark) .rev-panel--top5 :deep(.el-table th.el-table__cell)) {
    background: rgb(15 23 42 / 6%) !important;
  }

  /* 保留原生 rev-table--top 以兼容其他使用处（如有） */
  .rev-table--top {
    overflow: hidden;
    border-radius: 10px;
  }

  .rev-table--top thead th {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .rev-table--top tbody tr td.col-iaa {
    background: linear-gradient(90deg, rgb(16 185 129 / 16%), rgb(16 185 129 / 8%));
  }

  .rev-table--top tbody tr td.col-iap {
    font-weight: 700;
    color: rgb(167 139 250 / 95%);
    background: linear-gradient(90deg, rgb(167 139 250 / 18%), rgb(167 139 250 / 8%));
  }

  .rev-table--top tbody tr.is-subtotal td {
    font-weight: 800;
    border-top: 2px solid rgb(148 163 184 / 22%);
  }

  :global(html:not(.dark) .rev-table--top tbody tr td.col-iaa) {
    background: linear-gradient(90deg, rgb(16 185 129 / 14%), rgb(16 185 129 / 6%));
  }

  :global(html:not(.dark) .rev-table--top tbody tr td.col-iap) {
    color: rgb(124 58 237 / 95%);
    background: linear-gradient(90deg, rgb(124 58 237 / 14%), rgb(124 58 237 / 6%));
  }

  :global(html:not(.dark) .rev-table--top tbody tr.is-subtotal td) {
    border-top-color: rgb(15 23 42 / 12%);
  }

  .rev-iap-top {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 0 12px 10px;
  }

  .rev-iap-kpi {
    padding: 10px;
    background: rgb(255 255 255 / 4%);
    border: 1px solid var(--rev-border-soft);
    border-radius: 12px;
  }

  :global(html:not(.dark) .rev-iap-kpi) {
    background: rgb(15 23 42 / 4%);
  }

  .rev-iap-kpi__k {
    font-size: 12px;
    color: var(--rev-muted);
  }

  .rev-iap-kpi__v {
    margin-top: 6px;
    font-size: 22px;
    font-weight: 800;
  }

  .rev-iap-kpi__p {
    margin-top: 4px;
    font-size: 12px;
    color: var(--rev-c-amber);
  }

  .rev-pill-metric {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 58px;
    height: 22px;
    padding: 0 10px;
    font-weight: 700;
    border-radius: 999px;
  }

  .rev-pill-metric.good {
    color: var(--rev-c-green);
    background: rgb(34 197 94 / 14%);
  }

  .rev-pill-metric.mid {
    color: var(--rev-c-amber);
    background: rgb(245 158 11 / 16%);
  }

  .rev-pill-metric.bad {
    color: #ef4444;
    background: rgb(239 68 68 / 14%);
  }

  .rev-iap-bottom {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    padding: 0 12px 12px;
  }

  .rev-mini-kpi {
    padding: 10px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid var(--rev-border-soft);
    border-radius: 12px;
  }

  :global(html:not(.dark) .rev-mini-kpi) {
    background: rgb(15 23 42 / 4%);
  }

  .rev-mini-kpi__k {
    font-size: 12px;
    color: var(--rev-muted);
  }

  .rev-mini-kpi__v {
    margin-top: 6px;
    font-size: 18px;
    font-weight: 800;
  }

  .rev-pie {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 12px;
    align-items: center;
    padding: 0 8px 12px;
  }

  .rev-pie__chart-wrap {
    position: relative;
    height: 300px;
  }

  .rev-pie__chart {
    width: 100%;
    height: 100%;
  }

  .rev-pie__center {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  .rev-pie__center-value {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--rev-text);
  }

  .rev-pie__center-label {
    margin-top: 4px;
    font-size: 12px;
    color: var(--rev-muted);
  }

  .rev-pie__list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 20px;
    padding: 0 6px;
  }

  .rev-pie__col {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .rev-pie__item {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 8px;
    align-items: baseline;
    padding: 4px 0;
    font-size: 12px;
  }

  .rev-pie__item-text {
    display: flex;
    gap: 4px;
    align-items: baseline;
  }

  .rev-pie__name {
    color: var(--rev-text);
  }

  .rev-pie__percent {
    font-weight: 500;
  }

  .rev-pie__money {
    width: 100%;
    padding-left: 18px;
    font-size: 12px;
    font-weight: 700;
    color: var(--rev-text);
  }

  .rev-flag {
    display: inline-block;
    width: 1.4em;
    margin-right: 6px;
    text-align: center;
  }

  .rev-ai {
    padding: 0 14px 14px 28px;
    margin: 0;
    font-size: 12px;
    line-height: 1.6;
    color: var(--rev-muted);
  }

  .rev-ai li {
    margin: 6px 0;
  }

  .rev-quality-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 0 12px 12px;
  }

  .rev-quality {
    padding: 10px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid var(--rev-border-soft);
    border-radius: 12px;
  }

  :global(html:not(.dark) .rev-quality) {
    background: rgb(15 23 42 / 4%);
  }

  .rev-quality__k {
    font-size: 12px;
    color: var(--rev-muted);
  }

  .rev-quality__v {
    margin-top: 6px;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 0.01em;
  }

  .rev-quality__sub {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
    font-size: 12px;
    color: var(--rev-muted);
  }

  .rev-quality__trend.up {
    color: var(--rev-c-green);
  }

  .rev-quality__trend.down {
    color: #ef4444;
  }

  /* 固定画布布局：不做响应式重排，保持原型一致 */
</style>
