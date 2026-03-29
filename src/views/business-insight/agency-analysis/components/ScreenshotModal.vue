<script setup lang="ts">
  import { ref, computed, useTemplateRef } from 'vue'
  import { getAppNow } from '@/utils/app-now'
  import 'flag-icons/css/flag-icons.min.css'
  import type {
    AgencyRow,
    CampaignRow,
    DailyRow,
    KpiCardItem,
    AgencyExpandData,
    CampaignDetail,
    DonutChartItem,
    CountryDistributionItem
  } from '../types'

  defineOptions({ name: 'ScreenshotModal' })

  type ScreenType = 'current' | 'all' | 'custom'
  type OutputFmt = 'png' | 'long'
  type CustomKey = 'agency' | 'campaign' | 'daily' | 'roi' | 'channel'

  interface Props {
    modelValue: boolean
    /** 报告抬头主名称（一般为当前展开代投方） */
    agencyName: string
    dataDate: string
    pageLoading: boolean
    kpiCards: KpiCardItem[]
    agencies: AgencyRow[]
    agencyDetailMap: Record<string, AgencyExpandData>
    campaigns: CampaignRow[]
    dailyRows: DailyRow[]
    donut: DonutChartItem[]
    channelDistribution: {
      categories: string[]
      series: { name: string; values: number[]; color: string }[]
    }
    countryTop8: CountryDistributionItem[]
    focusedAgencyId: string | null
  }

  const props = withDefaults(defineProps<Props>(), {
    agencyName: '',
    dataDate: '',
    pageLoading: true,
    kpiCards: () => [],
    agencies: () => [],
    agencyDetailMap: () => ({}),
    campaigns: () => [],
    dailyRows: () => [],
    donut: () => [],
    channelDistribution: () => ({ categories: [], series: [] }),
    countryTop8: () => [],
    focusedAgencyId: null
  })

  const emit = defineEmits<{
    'update:modelValue': [val: boolean]
    download: []
    copy: []
  }>()

  const ROW_CAP = 12

  const selectedType = ref<ScreenType>('current')
  const outputFormat = ref<OutputFmt>('png')

  const customChecks = ref<Record<CustomKey, boolean>>({
    agency: true,
    campaign: true,
    daily: false,
    roi: true,
    channel: false
  })

  const customModuleList: { key: CustomKey; label: string }[] = [
    { key: 'agency', label: '代投方汇总' },
    { key: 'campaign', label: '广告系列明细' },
    { key: 'daily', label: '逐日对比' },
    { key: 'roi', label: '首日 ROI（3/4·3/3·3/2）' },
    { key: 'channel', label: '分布概览' }
  ]

  const typeOptions = [
    {
      value: 'current' as ScreenType,
      title: '当前代投方报告',
      desc: '以当前展开的代投方为主：汇总 KPI、账户与系列 ROI 等（需先在列表中展开一行）',
      tags: ['概览 KPI', '账户明细', '广告系列', '首日 ROI']
    },
    {
      value: 'all' as ScreenType,
      title: '全部代投方汇总',
      desc: '全量代投方表、系列与逐日对比，以及广告平台 / 国家 / 代投占比分布',
      tags: ['代投方汇总表', '广告平台分布', '国家 Top8']
    },
    {
      value: 'custom' as ScreenType,
      title: '自定义范围',
      desc: '自行勾选要出现在报告中的模块',
      tags: []
    }
  ]

  const estimatedSize = computed(() => (selectedType.value === 'all' ? '~1.8MB' : '~2.4MB'))
  const resolution = computed(() => (outputFormat.value === 'long' ? '2560x6400px' : '2560x3200px'))

  const close = () => emit('update:modelValue', false)

  const genTimeStr = computed(() => {
    const d = getAppNow()
    const p = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
      d.getMinutes()
    )}:${p(d.getSeconds())}`
  })

  const focusAgencyRow = computed(
    () => props.agencies.find((a) => a.id === props.focusedAgencyId) ?? null
  )

  const agencyDetail = computed(() => {
    const id = props.focusedAgencyId
    if (!id) return null
    return props.agencyDetailMap[id] ?? null
  })

  const visibility = computed(() => {
    const t = selectedType.value
    if (t === 'current') {
      return {
        kpi: true,
        agency: true,
        accounts: true,
        campaign: true,
        daily: false,
        roi: true,
        donut: false,
        channelBars: false,
        country: false
      }
    }
    if (t === 'all') {
      return {
        kpi: true,
        agency: true,
        accounts: false,
        campaign: true,
        daily: true,
        roi: false,
        donut: true,
        channelBars: true,
        country: true
      }
    }
    const c = customChecks.value
    return {
      kpi: true,
      agency: c.agency,
      accounts: c.agency && !!props.focusedAgencyId,
      campaign: c.campaign,
      daily: c.daily,
      roi: c.roi && !!props.focusedAgencyId,
      donut: c.channel,
      channelBars: c.channel,
      country: c.channel
    }
  })

  const reportAgencies = computed((): AgencyRow[] => {
    if (selectedType.value === 'current' && focusAgencyRow.value) return [focusAgencyRow.value]
    return props.agencies
  })

  const reportCampaigns = computed((): CampaignRow[] => {
    let rows = props.campaigns
    if (selectedType.value === 'current' && focusAgencyRow.value) {
      rows = rows.filter((c) => c.agency === focusAgencyRow.value!.name)
    }
    return rows.slice(0, ROW_CAP)
  })

  const reportDaily = computed((): DailyRow[] => {
    let rows = props.dailyRows
    if (selectedType.value === 'current' && focusAgencyRow.value) {
      rows = rows.filter((d) => d.agency === focusAgencyRow.value!.name)
    }
    return rows.slice(0, ROW_CAP)
  })

  const roiRows = computed((): CampaignDetail[] => {
    const d = agencyDetail.value
    if (!d?.campaigns?.length) return []
    return d.campaigns.slice(0, ROW_CAP)
  })

  const accountRows = computed(() => {
    const d = agencyDetail.value
    if (!d?.accounts?.length) return []
    return d.accounts.slice(0, ROW_CAP)
  })

  const donutList = computed(() => {
    const items = props.donut
    const sum = items.reduce((s, i) => s + i.value, 0)
    if (sum <= 0) return [] as { name: string; value: number; color: string; pct: number }[]
    return items.map((i) => ({
      name: i.name,
      value: i.value,
      color: i.color,
      pct: (i.value / sum) * 100
    }))
  })

  const channelBars = computed(() => {
    const { categories, series } = props.channelDistribution
    if (!categories?.length) return [] as { name: string; value: number; widthPct: number }[]
    const totals = categories.map((_, i) => series.reduce((s, ser) => s + (ser.values[i] ?? 0), 0))
    const max = Math.max(...totals, 1)
    return categories
      .map((name, i) => ({
        name,
        value: totals[i],
        widthPct: (totals[i] / max) * 100
      }))
      .filter((x) => x.value > 0)
  })

  const countryRows = computed(() => props.countryTop8.slice(0, 8))

  const fmtMoney = (v: number) => `$${v.toLocaleString('en-US')}`

  const roiBadgeClass = (v: number | null) => {
    if (v === null) return ''
    if (v >= 110) return 'roi-green'
    if (v >= 95) return 'roi-teal'
    if (v >= 85) return 'roi-yellow'
    return 'roi-red'
  }

  const kpiChangeClass = (card: KpiCardItem) => {
    if (!card.changeText) return 'pv-s-c--muted'
    if (card.changeUp === null) return 'pv-s-c--muted'
    return card.changeUp ? 'pv-s-c--up' : 'pv-s-c--down'
  }

  const changeTxt = (v: number | null) =>
    v === null ? '--' : `${v >= 0 ? '↑' : '↓'}${Math.abs(v).toFixed(2)}%`

  const isIso2Country = (code: string) => /^[a-z]{2}$/i.test(String(code || '').trim())

  const reportTitleLine = computed(() => {
    if (selectedType.value === 'current') return props.agencyName || '代投数据报告'
    if (selectedType.value === 'all') return '全部代投方汇总'
    return '自定义数据报告'
  })

  const previewHint = computed(() => {
    if (selectedType.value !== 'current') return ''
    if (!props.focusedAgencyId)
      return '提示：先在「代投方汇总」中展开一行，即可在报告中展示账户与首日 ROI 明细。'
    return ''
  })

  const reportRootRef = useTemplateRef<HTMLElement>('reportRoot')

  defineExpose({ reportRootRef })
</script>

<template>
  <!-- 必须挂 body，避免页面内 transform/缩放导致 position:fixed 错位（与实时数据弹窗问题同源） -->
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal-box">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="#00d4b4" stroke-width="1.5" />
                  <path
                    d="M9 3H15L16.5 5H20A1 1 0 0121 6V18A1 1 0 0120 19H4A1 1 0 013 18V6A1 1 0 014 5H7.5L9 3Z"
                    stroke="#00d4b4"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                  <circle cx="12" cy="12" r="4" stroke="#00d4b4" stroke-width="1.5" />
                </svg>
              </div>
              <div>
                <div class="modal-title">截图复制</div>
                <div class="modal-subtitle">将数据报告截图并复制到剪贴板</div>
              </div>
            </div>
            <button type="button" class="modal-close" @click="close">×</button>
          </div>

          <div class="modal-body">
            <div class="modal-left">
              <div class="section-label">选择截图内容</div>

              <div class="type-list">
                <div
                  v-for="opt in typeOptions"
                  :key="opt.value"
                  class="type-item"
                  :class="{ active: selectedType === opt.value }"
                  @click="selectedType = opt.value"
                >
                  <div class="type-top">
                    <span class="radio-ring" :class="{ on: selectedType === opt.value }">
                      <span class="radio-dot" />
                    </span>
                    <span class="type-title">{{ opt.title }}</span>
                  </div>
                  <div class="type-desc">{{ opt.desc }}</div>
                  <div v-if="opt.tags.length" class="type-tags">
                    <span v-for="t in opt.tags" :key="t" class="type-tag">{{ t }}</span>
                  </div>
                  <div
                    v-if="opt.value === 'custom' && selectedType === 'custom'"
                    class="custom-checks"
                    @click.stop
                  >
                    <label v-for="m in customModuleList" :key="m.key" class="check-item">
                      <input
                        type="checkbox"
                        class="check-input"
                        :checked="customChecks[m.key]"
                        @change="customChecks[m.key] = ($event.target as HTMLInputElement).checked"
                      />
                      <span class="check-box" :class="{ checked: customChecks[m.key] }">
                        <svg v-if="customChecks[m.key]" width="9" height="9" viewBox="0 0 9 9">
                          <path
                            d="M1.5 4.5L3.5 6.5L7.5 2"
                            stroke="#00d4b4"
                            stroke-width="1.5"
                            fill="none"
                            stroke-linecap="round"
                          />
                        </svg>
                      </span>
                      <span class="check-label">{{ m.label }}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <span class="form-label">数据日期</span>
                <span class="form-readonly">{{ dataDate }}</span>
                <span class="form-hint">与页面顶部筛选一致</span>
              </div>

              <div class="form-row">
                <span class="form-label">输出格式</span>
                <div class="fmt-group">
                  <button
                    type="button"
                    class="fmt-btn"
                    :class="{ active: outputFormat === 'png' }"
                    @click="outputFormat = 'png'"
                  >
                    图片(PNG)
                  </button>
                  <button
                    type="button"
                    class="fmt-btn"
                    :class="{ active: outputFormat === 'long' }"
                    @click="outputFormat = 'long'"
                  >
                    长图截图
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-right">
              <div class="preview-label">
                预览 <span class="preview-sub">独立报告模板 · 将复制到剪贴板</span>
              </div>
              <div class="preview-wrap">
                <div
                  ref="reportRoot"
                  class="preview-card"
                  :class="{ 'preview-card--long': outputFormat === 'long' }"
                >
                  <div class="pv-header">
                    <div class="pv-logo">
                      <div class="pv-logo-icon" />
                      <span>{{ reportTitleLine }}</span>
                    </div>
                    <div>
                      <div class="pv-head-title">代投数据报告</div>
                      <div class="pv-head-date">{{ dataDate }}</div>
                    </div>
                  </div>

                  <div v-if="previewHint" class="pv-banner">{{ previewHint }}</div>

                  <template v-if="pageLoading">
                    <div class="pv-empty">数据加载中…</div>
                  </template>
                  <template v-else>
                    <template v-if="visibility.kpi && kpiCards.length">
                      <div class="pv-sec-title">数据概览</div>
                      <div class="pv-stats">
                        <div v-for="(card, i) in kpiCards" :key="i" class="pv-stat">
                          <div class="pv-s-l">{{ card.label }}</div>
                          <div class="pv-s-v">{{ card.value }}</div>
                          <div v-if="card.changeText" class="pv-s-c" :class="kpiChangeClass(card)">
                            {{ card.changeText }}
                          </div>
                        </div>
                      </div>
                    </template>

                    <template v-if="visibility.agency && reportAgencies.length">
                      <div class="pv-sec-title mt8">代投方汇总</div>
                      <table class="pv-table">
                        <thead>
                          <tr>
                            <th>代投方</th>
                            <th class="text-right">应用</th>
                            <th class="text-right">广告平台</th>
                            <th class="text-right">消耗</th>
                            <th class="text-right">安装</th>
                            <th class="text-right">CPI</th>
                            <th class="text-right">CPA</th>
                            <th class="text-right">首日ROI</th>
                            <th class="text-right">预算%</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="ag in reportAgencies" :key="ag.id">
                            <td :style="{ color: ag.nameColor || '#e2e8f0' }">{{ ag.name }}</td>
                            <td class="text-right">{{ ag.appCount }}</td>
                            <td class="text-right">{{ ag.channelCount }}</td>
                            <td class="text-right">{{ fmtMoney(ag.spend) }}</td>
                            <td class="text-right">{{ ag.installs.toLocaleString('en-US') }}</td>
                            <td class="text-right">${{ ag.cpi.toFixed(2) }}</td>
                            <td class="text-right">${{ ag.cpa.toFixed(2) }}</td>
                            <td class="text-right pv-teal">{{ ag.roi.toFixed(2) }}%</td>
                            <td class="text-right">{{ ag.budgetRate }}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </template>

                    <template v-if="visibility.accounts">
                      <div class="pv-sec-title mt8">账户汇总</div>
                      <table v-if="accountRows.length" class="pv-table">
                        <thead>
                          <tr>
                            <th>账户名称</th>
                            <th>应用</th>
                            <th>广告平台</th>
                            <th class="text-right">消耗</th>
                            <th class="text-right">ROI</th>
                            <th class="text-right">安装</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(ac, ai) in accountRows" :key="ai">
                            <td>{{ ac.accountName }}</td>
                            <td>{{ ac.app }}</td>
                            <td>{{ ac.adPlatform }}</td>
                            <td class="text-right">{{ ac.spend }}</td>
                            <td class="text-right pv-teal">{{ ac.roi }}%</td>
                            <td class="text-right">{{ ac.installs.toLocaleString('en-US') }}</td>
                          </tr>
                        </tbody>
                      </table>
                      <div v-else class="pv-mini-empty">暂无账户明细（请先展开代投方）</div>
                    </template>

                    <template v-if="visibility.campaign">
                      <div class="pv-sec-title mt8">广告系列明细</div>
                      <table v-if="reportCampaigns.length" class="pv-table">
                        <thead>
                          <tr>
                            <th>代投方</th>
                            <th>系列</th>
                            <th>广告平台</th>
                            <th class="text-right">消耗</th>
                            <th class="text-right">安装</th>
                            <th class="text-right">CPI</th>
                            <th class="text-right">执行率</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(cp, ci) in reportCampaigns" :key="ci">
                            <td :style="{ color: cp.agencyColor || '#e2e8f0' }">{{ cp.agency }}</td>
                            <td>{{ cp.appName || cp.name || '--' }}</td>
                            <td>{{ cp.channel }}</td>
                            <td class="text-right">{{ fmtMoney(cp.spend) }}</td>
                            <td class="text-right">{{ cp.installs.toLocaleString('en-US') }}</td>
                            <td class="text-right">${{ cp.cpi.toFixed(2) }}</td>
                            <td class="text-right">{{ cp.execRate }}%</td>
                          </tr>
                        </tbody>
                      </table>
                      <div v-else class="pv-mini-empty">暂无广告系列数据</div>
                    </template>

                    <template v-if="visibility.daily">
                      <div class="pv-sec-title mt8">逐日对比（近7天）</div>
                      <table v-if="reportDaily.length" class="pv-table">
                        <thead>
                          <tr>
                            <th>日期</th>
                            <th>代投方</th>
                            <th class="text-right">消耗</th>
                            <th class="text-right">安装</th>
                            <th class="text-right">CPI</th>
                            <th class="text-right">CPA</th>
                            <th class="text-right">消耗环比</th>
                            <th class="text-right">安装环比</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(row, di) in reportDaily" :key="di">
                            <td>{{ row.date }}</td>
                            <td :style="{ color: row.agencyColor || '#e2e8f0' }">{{
                              row.agency
                            }}</td>
                            <td class="text-right">{{ fmtMoney(row.spend) }}</td>
                            <td class="text-right">{{ row.installs.toLocaleString('en-US') }}</td>
                            <td class="text-right">${{ row.cpi.toFixed(2) }}</td>
                            <td class="text-right">${{ row.cpa.toFixed(2) }}</td>
                            <td class="text-right">{{ changeTxt(row.spendChange) }}</td>
                            <td class="text-right">{{ changeTxt(row.installsChange) }}</td>
                          </tr>
                        </tbody>
                      </table>
                      <div v-else class="pv-mini-empty">暂无逐日数据</div>
                    </template>

                    <template v-if="visibility.roi">
                      <div class="pv-sec-title mt8">首日 ROI</div>
                      <table v-if="roiRows.length" class="pv-table pv-table--roi">
                        <thead>
                          <tr>
                            <th>广告系列</th>
                            <th class="text-right">预算</th>
                            <th class="text-right">支出</th>
                            <th class="text-right">CPA</th>
                            <th class="text-right">CPI</th>
                            <th class="text-right">安装</th>
                            <th class="text-right">3/4</th>
                            <th class="text-right">3/3</th>
                            <th class="text-right">3/2</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(cp, ri) in roiRows" :key="ri">
                            <td>{{ cp.appName || cp.name || '--' }}</td>
                            <td class="text-right">${{ cp.budget }}</td>
                            <td class="text-right">{{ cp.spend }}</td>
                            <td class="text-right">{{ cp.cpa }}</td>
                            <td class="text-right">{{ cp.cpi }}</td>
                            <td class="text-right">{{ cp.installs }}</td>
                            <td class="text-right">
                              <span
                                v-if="cp.roi34 !== null"
                                class="pv-badge"
                                :class="roiBadgeClass(cp.roi34)"
                                >{{ cp.roi34 }}%</span
                              >
                              <span v-else class="dim">--</span>
                            </td>
                            <td class="text-right">
                              <span
                                v-if="cp.roi33 !== null"
                                class="pv-badge"
                                :class="roiBadgeClass(cp.roi33)"
                                >{{ cp.roi33 }}%</span
                              >
                              <span v-else class="dim">--</span>
                            </td>
                            <td class="text-right">
                              <span
                                v-if="cp.roi32 !== null"
                                class="pv-badge"
                                :class="roiBadgeClass(cp.roi32)"
                                >{{ cp.roi32 }}%</span
                              >
                              <span v-else class="dim">--</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div v-else class="pv-mini-empty">暂无首日 ROI（请先展开代投方）</div>
                    </template>

                    <template v-if="visibility.donut && donutList.length">
                      <div class="pv-sec-title mt8">代投方消耗占比</div>
                      <div class="pv-bar-list">
                        <div v-for="(d, di) in donutList" :key="di" class="pv-bar-row">
                          <span class="pv-bar-dot" :style="{ background: d.color }" />
                          <span class="pv-bar-name">{{ d.name }}</span>
                          <div class="pv-bar-track">
                            <div
                              class="pv-bar-fill"
                              :style="{ width: `${d.pct}%`, background: d.color }"
                            />
                          </div>
                          <span class="pv-bar-pct">{{ d.pct.toFixed(1) }}%</span>
                        </div>
                      </div>
                    </template>

                    <template v-if="visibility.channelBars && channelBars.length">
                      <div class="pv-sec-title mt8">广告平台分布</div>
                      <div class="pv-bar-list">
                        <div v-for="(b, bi) in channelBars" :key="bi" class="pv-bar-row">
                          <span class="pv-bar-name">{{ b.name }}</span>
                          <div class="pv-bar-track">
                            <div
                              class="pv-bar-fill pv-bar-fill--muted"
                              :style="{ width: `${b.widthPct}%` }"
                            />
                          </div>
                          <span class="pv-bar-val">{{ fmtMoney(b.value) }}</span>
                        </div>
                      </div>
                    </template>

                    <template v-if="visibility.country && countryRows.length">
                      <div class="pv-sec-title mt8">国家消耗 Top8</div>
                      <div class="pv-bar-list">
                        <div v-for="(c, ci) in countryRows" :key="ci" class="pv-bar-row">
                          <span
                            v-if="isIso2Country(c.s_country_code)"
                            class="pv-flag fi"
                            :class="'fi-' + c.s_country_code.toLowerCase()"
                          />
                          <span class="pv-bar-name">{{ c.s_country_code.toUpperCase() }}</span>
                          <div class="pv-bar-track">
                            <div
                              class="pv-bar-fill pv-bar-fill--country"
                              :style="{ width: `${c.sharePct}%` }"
                            />
                          </div>
                          <span class="pv-bar-pct">{{ c.sharePct.toFixed(2) }}%</span>
                        </div>
                      </div>
                    </template>

                    <div class="pv-footnote">
                      注: 时区 PST(UTC-8), 货币 USD；ROI
                      计算含广告收入及付费收入。预览最多展示各表前
                      {{ ROW_CAP }} 行。
                    </div>
                  </template>
                </div>
              </div>
              <div class="preview-meta">
                <span
                  >预计截图大小: <strong>{{ estimatedSize }}</strong></span
                >
                <span class="preview-meta-gap"
                  >分辨率: <strong>{{ resolution }}</strong></span
                >
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <div class="gen-time">生成时间: {{ genTimeStr }}</div>
            <div class="footer-btns">
              <button type="button" class="btn-cancel" @click="close">取消</button>
              <button type="button" class="btn-download" @click="emit('download')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" class="btn-ic">
                  <path d="M12 16L7 11h4V4h2v7h4l-5 5zM5 20h14v-2H5v2z" />
                </svg>
                下载 PNG
              </button>
              <button type="button" class="btn-copy" @click="(emit('copy'), close())">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" class="btn-ic">
                  <rect
                    x="9"
                    y="9"
                    width="13"
                    height="13"
                    rx="2"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <path
                    d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                </svg>
                复制到剪贴板
              </button>
            </div>
          </div>
          <div class="footer-hint">复制后可直接粘贴到微信、钉钉、邮件等任意应用</div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped lang="scss">
  .modal-overlay {
    position: fixed;
    inset: 0;

    /* 高于侧栏/顶栏 sticky，且保持 body 挂载避免 fixed 参考系错误 */
    z-index: 9000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 72%);
    backdrop-filter: blur(4px);
  }

  .modal-box {
    display: flex;
    flex-direction: column;
    width: 920px;
    max-height: 88vh;
    overflow: hidden;
    background: #0d1829;
    border: 1px solid #1e3a5f;
    border-radius: 12px;
    box-shadow:
      0 30px 80px rgb(0 0 0 / 70%),
      0 0 0 1px rgb(0 212 180 / 8%);
  }

  .modal-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px 16px;
    border-bottom: 1px solid #1e3a5f;
  }

  .modal-title-wrap {
    display: flex;
    gap: 14px;
    align-items: center;
  }

  .modal-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    background: rgb(0 212 180 / 8%);
    border: 1px solid rgb(0 212 180 / 20%);
    border-radius: 10px;
  }

  .modal-title {
    font-size: 17px;
    font-weight: 700;
    color: #e2e8f0;
  }

  .modal-subtitle {
    margin-top: 2px;
    font-size: 12px;
    color: #64748b;
  }

  .modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 18px;
    line-height: 1;
    color: #94a3b8;
    cursor: pointer;
    background: #1e2d42;
    border: 1px solid #2d3f54;
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      color: #e2e8f0;
      background: #2d3f54;
    }
  }

  .modal-body {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .modal-left {
    flex-shrink: 0;
    width: 510px;
    padding: 18px 22px;
    overflow-y: auto;
    border-right: 1px solid #1e3a5f;
  }

  .section-label {
    margin-bottom: 12px;
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
  }

  .type-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 18px;
  }

  .type-item {
    padding: 12px 14px;
    cursor: pointer;
    background: #0a1422;
    border: 1px solid #1e3a5f;
    border-radius: 8px;
    transition: all 0.15s;

    &:hover {
      border-color: #2d5a8a;
    }

    &.active {
      background: rgb(0 212 180 / 5%);
      border-color: #00d4b4;
    }
  }

  .type-top {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 5px;
  }

  .radio-ring {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: 2px solid #2d3f54;
    border-radius: 50%;
    transition: border-color 0.15s;

    &.on {
      border-color: #00d4b4;
    }
  }

  .radio-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    transition: background 0.15s;

    .radio-ring.on & {
      background: #00d4b4;
    }
  }

  .type-title {
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .type-desc {
    margin-bottom: 7px;
    margin-left: 26px;
    font-size: 11px;
    color: #64748b;
  }

  .type-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-left: 26px;
  }

  .type-tag {
    padding: 2px 8px;
    font-size: 11px;
    color: #00d4b4;
    background: rgb(0 212 180 / 10%);
    border: 1px solid rgb(0 212 180 / 20%);
    border-radius: 4px;
  }

  .custom-checks {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
    margin-left: 26px;
  }

  .check-item {
    display: flex;
    gap: 6px;
    align-items: center;
    cursor: pointer;
  }

  .check-input {
    display: none;
  }

  .check-box {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 15px;
    height: 15px;
    border: 1.5px solid #2d3f54;
    border-radius: 3px;
    transition: all 0.15s;

    &.checked {
      background: rgb(0 212 180 / 15%);
      border-color: #00d4b4;
    }
  }

  .check-label {
    font-size: 12px;
    color: #94a3b8;
  }

  .form-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 14px;
  }

  .form-label {
    flex-shrink: 0;
    font-size: 12px;
    color: #94a3b8;
    white-space: nowrap;
  }

  .form-readonly {
    padding: 6px 10px;
    font-size: 12px;
    color: #e2e8f0;
    background: #0a1422;
    border: 1px solid #2d3f54;
    border-radius: 6px;
  }

  .form-hint {
    font-size: 11px;
    color: #64748b;
  }

  .fmt-group {
    display: flex;
  }

  .fmt-btn {
    padding: 6px 14px;
    font-size: 12px;
    color: #64748b;
    cursor: pointer;
    background: #0a1422;
    border: 1px solid #2d3f54;
    transition: all 0.15s;

    &:first-child {
      border-radius: 6px 0 0 6px;
    }

    &:last-child {
      margin-left: -1px;
      border-radius: 0 6px 6px 0;
    }

    &.active {
      color: #00d4b4;
      background: rgb(0 212 180 / 12%);
      border-color: #00d4b4;
    }
  }

  .modal-right {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    padding: 18px 18px 14px;
    overflow-y: auto;
  }

  .preview-label {
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
  }

  .preview-sub {
    font-size: 11px;
    font-weight: 400;
    color: #475569;
  }

  .preview-wrap {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
    background: #111f35;
    border: 1px solid #1e3a5f;
    border-radius: 8px;
  }

  .preview-card {
    padding: 12px;
    background: #0d1829;
    border-radius: 6px;

    &--long {
      min-height: 480px;
    }
  }

  .pv-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .pv-logo {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 10px;
    font-weight: 700;
    color: #e2e8f0;
  }

  .pv-logo-icon {
    width: 14px;
    height: 14px;
    background: linear-gradient(135deg, #00d4b4, #3b82f6);
    border-radius: 3px;
  }

  .pv-head-title {
    font-size: 9px;
    font-weight: 700;
    color: #e2e8f0;
  }

  .pv-head-date {
    font-size: 8px;
    color: #64748b;
  }

  .pv-banner {
    padding: 8px 10px;
    margin-bottom: 8px;
    font-size: 10px;
    line-height: 1.4;
    color: #fbbf24;
    background: rgb(245 158 11 / 12%);
    border: 1px solid rgb(245 158 11 / 35%);
    border-radius: 6px;
  }

  .pv-empty {
    padding: 24px;
    font-size: 12px;
    color: #64748b;
    text-align: center;
  }

  .pv-mini-empty {
    padding: 10px;
    font-size: 10px;
    color: #64748b;
  }

  .pv-sec-title {
    padding-bottom: 3px;
    margin-bottom: 6px;
    font-size: 9px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    border-bottom: 1px solid #1e3a5f;
  }

  .mt8 {
    margin-top: 8px;
  }

  .pv-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    margin-bottom: 6px;
  }

  .pv-stat {
    padding: 5px;
    background: #111f35;
    border-radius: 4px;
  }

  .pv-s-l {
    font-size: 8px;
    color: #64748b;
  }

  .pv-s-v {
    font-size: 11px;
    font-weight: 700;
    color: #e2e8f0;
  }

  .pv-s-c {
    font-size: 8px;
  }

  .pv-s-c--up {
    color: #10b981;
  }

  .pv-s-c--down {
    color: #f97316;
  }

  .pv-s-c--muted {
    color: #64748b;
  }

  .pv-teal {
    color: #00d4b4;
  }

  .pv-table {
    width: 100%;
    font-size: 9px;
    border-collapse: collapse;

    th {
      padding: 3px 4px;
      color: #64748b;
      text-align: left;
      background: #0a1422;
      border-bottom: 1px solid #1e3a5f;
    }

    td {
      padding: 3px 4px;
      color: #cbd5e1;
      border-bottom: 1px solid #0f1c2e;
    }

    .text-right {
      text-align: right;
    }
  }

  .pv-table--roi {
    font-size: 8px;
  }

  .dim {
    color: #475569;
  }

  .pv-badge {
    display: inline-block;
    padding: 1px 4px;
    font-size: 8px;
    font-weight: 600;
    border-radius: 2px;
  }

  .roi-green {
    color: #fff;
    background: #059669;
  }

  .roi-teal {
    color: #fff;
    background: #00d4b4;
  }

  .roi-yellow {
    color: #0f172a;
    background: #fbbf24;
  }

  .roi-red {
    color: #fff;
    background: #ef4444;
  }

  .pv-bar-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 6px;
  }

  .pv-bar-row {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 9px;
  }

  .pv-bar-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .pv-flag {
    flex-shrink: 0;
    font-size: 12px;
    line-height: 1;
  }

  .pv-bar-name {
    flex-shrink: 0;
    min-width: 56px;
    color: #94a3b8;
  }

  .pv-bar-track {
    flex: 1;
    height: 5px;
    overflow: hidden;
    background: #0a1422;
    border-radius: 3px;
  }

  .pv-bar-fill {
    height: 100%;
    border-radius: 3px;

    &--muted {
      background: #3b82f6;
    }

    &--country {
      background: #00d4b4;
    }
  }

  .pv-bar-pct,
  .pv-bar-val {
    flex-shrink: 0;
    min-width: 52px;
    font-size: 8px;
    color: #94a3b8;
    text-align: right;
  }

  .pv-footnote {
    padding-top: 5px;
    margin-top: 7px;
    font-size: 8px;
    color: #475569;
    border-top: 1px solid #1e3a5f;
  }

  .preview-meta {
    font-size: 12px;
    color: #64748b;

    strong {
      color: #94a3b8;
    }
  }

  .preview-meta-gap {
    margin-left: 16px;
  }

  .modal-footer {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px 6px;
    border-top: 1px solid #1e3a5f;
  }

  .gen-time {
    font-size: 12px;
    color: #475569;
  }

  .footer-btns {
    display: flex;
    gap: 10px;
  }

  .btn-ic {
    margin-right: 5px;
  }

  .btn-cancel {
    padding: 8px 20px;
    font-size: 13px;
    color: #94a3b8;
    cursor: pointer;
    background: transparent;
    border: 1px solid #2d3f54;
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      color: #e2e8f0;
      border-color: #4a5568;
    }
  }

  .btn-download {
    display: flex;
    align-items: center;
    padding: 8px 18px;
    font-size: 13px;
    color: #94a3b8;
    cursor: pointer;
    background: transparent;
    border: 1px solid #2d3f54;
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      color: #e2e8f0;
      border-color: #4a5568;
    }
  }

  .btn-copy {
    display: flex;
    align-items: center;
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    background: linear-gradient(135deg, #00d4b4, #00a896);
    border: none;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgb(0 212 180 / 30%);
    transition: all 0.15s;

    &:hover {
      background: linear-gradient(135deg, #00e6c4, #00c0a8);
      box-shadow: 0 6px 16px rgb(0 212 180 / 40%);
    }
  }

  .footer-hint {
    flex-shrink: 0;
    padding: 0 24px 12px;
    font-size: 11px;
    color: #475569;
    text-align: right;
  }

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.2s;
  }

  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }
</style>
