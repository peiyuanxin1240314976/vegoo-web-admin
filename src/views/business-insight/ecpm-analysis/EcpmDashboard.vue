<template>
  <div class="ecpm-dash">
    <div class="ecpm-page-fx" aria-hidden="true"></div>
    <!-- ══════════════════ HEADER ══════════════════ -->
    <header class="dash-header">
      <!-- <div class="breadcrumb">
        <span class="bc-parent">商业洞察</span>
        <span class="bc-sep">›</span>
        <span class="bc-cur">ECPM分析</span>
      </div> -->
      <div class="bi-filters bi-filter-panel">
        <div class="bi-filter-field">
          <AppDatePicker
            v-model="dateRange"
            type="daterange"
            unlink-panels
            :shortcuts="dateRangeShortcuts"
            size="default"
            range-separator="～"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            class="bi-filter-date"
            popper-class="ecpm-filter__popper"
            :prefix-icon="Calendar"
          />
        </div>

        <div class="bi-filter-field">
          <el-skeleton :loading="loadingMetaFilterOptions" animated>
            <template #template>
              <el-skeleton-item variant="text" class="filter-sel-skeleton" />
            </template>
            <AppPlatformSearchSelect
              v-model="filterApp"
              mode="app"
              class="bi-filter-select bi-filter-select--app"
              input-class="bi-filter-select__input"
              placeholder="应用"
              search-placeholder="应用"
              :setting-apps="settingAppsForSelect"
              :height="36"
              :min-width="200"
              :max-width="240"
              dropdown-class="ecpm-filter__popper"
            />
          </el-skeleton>
        </div>

        <div class="bi-filter-field">
          <el-skeleton :loading="loadingMetaFilterOptions" animated>
            <template #template>
              <el-skeleton-item variant="text" class="filter-sel-skeleton" />
            </template>
            <el-select
              :model-value="filterPlatform"
              size="default"
              class="bi-filter-select bi-filter-select--platform"
              popper-class="ecpm-filter__popper"
              placeholder="广告平台"
              clearable
              @update:model-value="onPlatformFilterUpdate"
            >
              <el-option :label="tr('adPerformance.filterAll', '全部')" value="" />
              <el-option
                v-for="item in cockpitSourceOptionsForSelect"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-skeleton>
        </div>

        <div class="bi-filter-field">
          <el-skeleton :loading="loadingMetaFilterOptions" animated>
            <template #template>
              <el-skeleton-item variant="text" class="filter-sel-skeleton" />
            </template>
            <el-select
              :model-value="filterCountry"
              size="default"
              class="bi-filter-select"
              popper-class="ecpm-filter__popper"
              placeholder="国家"
              filterable
              clearable
              @update:model-value="onCountryFilterUpdate"
            >
              <el-option :label="tr('adPerformance.filterAll', '全部')" value="" />
              <el-option
                v-for="item in cockpitCountryOptionsForSelect"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-skeleton>
        </div>

        <el-button
          class="bi-query-btn"
          size="default"
          type="primary"
          plain
          round
          :icon="Search"
          :loading="querying"
          :disabled="querying"
          @click="handleQuery"
        >
          查询
        </el-button>
      </div>
    </header>

    <!-- ══════════════════ MAIN GRID ══════════════════ -->
    <div class="main-grid">
      <!-- ══════════════════ KPI ROW ══════════════════ -->
      <div class="kpi-row">
        <!-- 预估 ECPM（暂隐藏；恢复时请取消本段注释，并将 .kpi-row 改回 repeat(4,1fr)，并恢复 TrendCharts 导入） -->
        <!--
        <el-skeleton :loading="loadingOverviewKpis" animated>
          <template #template>
            <div class="kpi-card-skeleton-lines">
              <el-skeleton-item variant="p" class="s-line w40" />
              <el-skeleton-item variant="p" class="s-line w70" />
              <el-skeleton-item variant="p" class="s-line w45" />
              <el-skeleton-item variant="p" class="s-line w55" />
            </div>
          </template>
          <div class="kpi-card kpi-teal">
            <div class="kpi-label">
              <el-icon class="kpi-icon teal"><TrendCharts /></el-icon>
              ECPM（预估）
            </div>
            <div class="kpi-value teal">{{ fmt2(kpis.d_ecpm_estimated) }}</div>
            <div class="kpi-meta">广告平台上报</div>
            <div
              class="kpi-change"
              :class="kpis.estimated_change_pct_vs_prev_month >= 0 ? 'up' : 'dn'"
            >
              {{ kpis.estimated_change_pct_vs_prev_month >= 0 ? '↑' : '↓'
              }}{{ Math.abs(kpis.estimated_change_pct_vs_prev_month) }}% vs 上月
            </div>
          </div>
        </el-skeleton>
        -->

        <!-- 真实 ECPM -->
        <el-skeleton :loading="loadingOverviewKpis" animated>
          <template #template>
            <div class="kpi-card-skeleton-lines">
              <el-skeleton-item variant="p" class="s-line w40" />
              <el-skeleton-item variant="p" class="s-line w70" />
              <el-skeleton-item variant="p" class="s-line w45" />
              <el-skeleton-item variant="p" class="s-line w55" />
            </div>
          </template>
          <div class="kpi-card kpi-blue">
            <div class="kpi-label">
              <el-icon class="kpi-icon blue"><Money /></el-icon>
              ECPM（真实）
            </div>
            <div class="kpi-value blue">{{ fmt2(kpis.d_ecpm_real) }}</div>
            <div class="kpi-meta">实际入账</div>
            <div class="kpi-change" :class="kpis.real_change_pct_vs_prev_month >= 0 ? 'up' : 'dn'">
              {{ kpis.real_change_pct_vs_prev_month >= 0 ? '↑' : '↓'
              }}{{ Math.abs(kpis.real_change_pct_vs_prev_month) }}% vs 上周期
            </div>
          </div>
        </el-skeleton>

        <!-- 最高 ECPM 国家 -->
        <el-skeleton :loading="loadingOverviewKpis" animated>
          <template #template>
            <div class="kpi-card-skeleton-lines">
              <el-skeleton-item variant="p" class="s-line w40" />
              <el-skeleton-item variant="p" class="s-line w70" />
              <el-skeleton-item variant="p" class="s-line w45" />
              <el-skeleton-item variant="p" class="s-line w55" />
            </div>
          </template>
          <div class="kpi-card kpi-dark">
            <div class="kpi-label">
              <el-icon class="kpi-icon white"><Location /></el-icon>
              最高ECPM国家
            </div>
            <div class="kpi-value white large">
              {{ kpis.top_country.label_display }} ${{ fmt2(kpis.top_country.d_ecpm) }}
            </div>
            <div class="kpi-meta">全球最高</div>
            <div class="kpi-meta dim">
              {{ kpis.top_country.second.label_display }} ${{
                fmt2(kpis.top_country.second.d_ecpm)
              }}
              第二
            </div>
          </div>
        </el-skeleton>

        <!-- 最高 ECPM 广告位 -->
        <el-skeleton :loading="loadingOverviewKpis" animated>
          <template #template>
            <div class="kpi-card-skeleton-lines">
              <el-skeleton-item variant="p" class="s-line w40" />
              <el-skeleton-item variant="p" class="s-line w70" />
              <el-skeleton-item variant="p" class="s-line w45" />
              <el-skeleton-item variant="p" class="s-line w55" />
            </div>
          </template>
          <div class="kpi-card kpi-orange">
            <div class="kpi-label">
              <el-icon class="kpi-icon orange"><Grid /></el-icon>
              最高ECPM广告位
            </div>
            <div class="kpi-value orange xlarge">{{ kpis.top_ad_slot.n_ad_type_label }}</div>
            <div class="kpi-meta orange-dim">
              ${{ fmt2(kpis.top_ad_slot.d_ecpm) }} {{ kpis.top_ad_slot.s_app_name }}
            </div>
            <div class="kpi-meta dim">远高于平均水平</div>
          </div>
        </el-skeleton>
      </div>

      <!-- ── LEFT COLUMN ── -->
      <div class="col col-left">
        <!-- 趋势图 -->
        <div class="card">
          <div class="card-title">ECPM趋势分析（30天）</div>
          <div class="chart-loading-wrap">
            <div ref="trendRef" class="echart echart-trend" />
            <div v-if="loadingOverviewTrend" class="chart-loading-overlay">
              <div class="chart-skeleton-lines">
                <el-skeleton-item variant="p" class="s-line w90" />
                <el-skeleton-item variant="p" class="s-line w85" />
                <el-skeleton-item variant="p" class="s-line w95" />
                <el-skeleton-item variant="p" class="s-line w80" />
                <el-skeleton-item variant="p" class="s-line w88" />
                <el-skeleton-item variant="p" class="s-line w92" />
              </div>
            </div>
          </div>
          <!-- 趋势 Tab 文案来自 trendTabs；「预估ECPM」项在脚本中注释保留 -->
          <div class="tab-row">
            <button
              v-for="tab in trendTabs"
              :key="tab"
              :class="['tab-btn', activeTrendTab === tab && 'active']"
              @click="activeTrendTab = tab"
              >{{ tab }}</button
            >
          </div>
        </div>

        <!-- 平台对比表 -->
        <div class="card" style="margin-top: 10px">
          <div class="card-title">平台ECPM对比</div>
          <el-skeleton :loading="loadingTablePlatform" animated>
            <template #template>
              <div class="table-skeleton-lines">
                <el-skeleton-item variant="p" class="s-line w95" />
                <el-skeleton-item variant="p" class="s-line w92" />
                <el-skeleton-item variant="p" class="s-line w90" />
                <el-skeleton-item variant="p" class="s-line w94" />
                <el-skeleton-item variant="p" class="s-line w89" />
                <el-skeleton-item variant="p" class="s-line w96" />
              </div>
            </template>
            <ArtTable
              class="ecpm-platform-art-table"
              :data="platformTableRows"
              :columns="platformTableColumns"
              :loading="loadingTablePlatform"
              :header-cell-style="{ background: '#131D2F' }"
              row-key="name"
              :stripe="false"
              :border="false"
              size="default"
              :pagination="undefined"
              :row-class-name="platformTableRowClassName"
            >
              <template #name="{ row }">
                <span class="pname">{{ row.name }}</span>
              </template>
              <template #real="{ row }">
                <span class="tr blue">{{ fmt2(row.real) }}</span>
              </template>
              <template #revenue="{ row }">
                <span class="tr">{{ row.revenue }}</span>
              </template>
              <template #share="{ row }">
                <span class="tr dim">{{ row.share }}</span>
              </template>
              <template #trend="{ row }">
                <span v-if="row.__isSubtotal" class="tr dim">--</span>
                <svg v-else width="58" height="22" style="display: block; margin-left: auto">
                  <path
                    :d="sparkPath(row.sparkData)"
                    fill="none"
                    :stroke="
                      row.trend === 'up' ? '#00d4aa' : row.trend === 'down' ? '#ff6b6b' : '#4db6e8'
                    "
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </template>
            </ArtTable>
          </el-skeleton>
        </div>
      </div>

      <!-- ── MIDDLE COLUMN ── -->
      <div class="col col-mid">
        <!-- 世界地图 -->
        <div class="card">
          <div class="card-header-row">
            <span class="card-title">ECPM国家分布</span>
            <div class="toggle-group">
              <!-- 预估ECPM（暂隐藏；恢复时请取消注释，并将 mapMode 默认值改回 estimated 如需一致） -->
              <!--
              <button
                :class="['tgl', mapMode === 'estimated' && 'active']"
                @click="mapMode = 'estimated'"
                >预估ECPM</button
              >
              -->
              <button :class="['tgl', mapMode === 'real' && 'active']" @click="mapMode = 'real'"
                >真实ECPM</button
              >
            </div>
          </div>
          <div class="chart-loading-wrap">
            <div ref="worldMapRef" class="echart echart-map" />
            <div v-if="loadingOverviewMapCountry" class="chart-loading-overlay">
              <div class="chart-skeleton-lines">
                <el-skeleton-item variant="p" class="s-line w92" />
                <el-skeleton-item variant="p" class="s-line w85" />
                <el-skeleton-item variant="p" class="s-line w89" />
                <el-skeleton-item variant="p" class="s-line w95" />
                <el-skeleton-item variant="p" class="s-line w83" />
                <el-skeleton-item variant="p" class="s-line w91" />
              </div>
            </div>
          </div>
        </div>

        <!-- Top 10 国家（与右侧列整体等高，图表区自适应拉伸） -->
        <div class="card card-top10" style="margin-top: 10px">
          <div class="card-title">ECPM Top 10 国家</div>
          <div class="chart-loading-wrap">
            <div ref="top10Ref" class="echart echart-top10" />
            <div v-if="loadingOverviewTop10Country" class="chart-loading-overlay">
              <div class="table-skeleton-lines">
                <el-skeleton-item variant="p" class="s-line w80" />
                <el-skeleton-item variant="p" class="s-line w75" />
                <el-skeleton-item variant="p" class="s-line w85" />
                <el-skeleton-item variant="p" class="s-line w70" />
                <el-skeleton-item variant="p" class="s-line w90" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── RIGHT COLUMN ── -->
      <div class="col col-right">
        <!-- 提示条 -->
        <el-skeleton :loading="loadingOverviewInsightTip" animated>
          <template #template>
            <el-skeleton-item variant="p" class="s-line w96 insight-tip-line" />
          </template>
          <div class="alert-bar">
            <el-icon class="alert-icon"><Warning /></el-icon>
            <span>{{ insightTip }}</span>
          </div>
        </el-skeleton>

        <!-- 广告位排行 -->
        <div class="card" style="margin-top: 10px">
          <div class="card-title">ECPM广告位排行</div>
          <el-skeleton :loading="loadingOverviewAdSlotRanking" animated>
            <template #template>
              <div class="table-skeleton-lines">
                <el-skeleton-item variant="p" class="s-line w92" />
                <el-skeleton-item variant="p" class="s-line w88" />
                <el-skeleton-item variant="p" class="s-line w86" />
                <el-skeleton-item variant="p" class="s-line w79" />
                <el-skeleton-item variant="p" class="s-line w84" />
                <el-skeleton-item variant="p" class="s-line w76" />
              </div>
            </template>
            <div class="adslot-list">
              <div v-for="slot in adSlots" :key="slot.name" class="adslot-row">
                <span class="slot-name">{{ slot.name }}</span>
                <div class="slot-track">
                  <div
                    class="slot-bar"
                    :style="{
                      width: (slot.value / 22) * 100 + '%',
                      background: slot.color
                    }"
                  />
                </div>
                <span class="slot-val">{{ slot.value }}</span>
              </div>
            </div>
          </el-skeleton>
        </div>

        <!-- 应用排行 -->
        <div class="card" style="margin-top: 10px">
          <div class="card-header-row">
            <span class="card-title">ECPM应用排行</span>
            <el-select v-model="appRankType" size="small" class="mini-sel">
              <!-- 预估ECPM（暂隐藏；恢复时请取消注释，并将 appRankType 默认值改回 estimated 如需一致） -->
              <!-- <el-option label="预估ECPM" value="estimated" /> -->
              <el-option label="真实ECPM" value="real" />
            </el-select>
          </div>
          <el-skeleton :loading="loadingOverviewAppRanking" animated>
            <template #template>
              <div class="table-skeleton-lines">
                <el-skeleton-item variant="p" class="s-line w95" />
                <el-skeleton-item variant="p" class="s-line w90" />
                <el-skeleton-item variant="p" class="s-line w93" />
                <el-skeleton-item variant="p" class="s-line w87" />
                <el-skeleton-item variant="p" class="s-line w91" />
              </div>
            </template>
            <table class="dtable">
              <thead>
                <tr>
                  <th>应用</th>
                  <th class="tr">ECPM</th>
                  <th class="tr">广告收入</th>
                  <th class="tr">环比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in apps" :key="row.name">
                  <td class="app-name-cell">
                    <span class="app-icon-box">{{ row.icon }}</span>
                    {{ row.name }}
                  </td>
                  <td class="tr teal">{{ fmt2(row.ecpm) }}</td>
                  <td class="tr">{{ row.revenue }}</td>
                  <td :class="['tr', row.change >= 0 ? 'up' : 'dn']">
                    {{ row.change >= 0 ? '↑' : '↓' }}{{ Math.abs(row.change) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </el-skeleton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { storeToRefs } from 'pinia'
  import { useResizeObserver } from '@vueuse/core'
  import { echarts } from '@/plugins/echarts'
  import {
    Calendar,
    // TrendCharts, // 与「预估 ECPM」卡片一并恢复
    Money,
    Search,
    Location,
    Grid,
    Warning
  } from '@element-plus/icons-vue'
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { getAppNow, cloneAppDate } from '@/utils/app-now'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'
  import {
    fetchEcpmOverviewAdSlotRanking,
    fetchEcpmOverviewAppRanking,
    fetchEcpmOverviewInsightTip,
    fetchEcpmOverviewMapCountry,
    fetchEcpmOverviewKpis,
    fetchEcpmOverviewTop10Country,
    fetchEcpmOverviewTrend,
    fetchEcpmTablePlatform
  } from '@/api/business-insight'
  import type { CockpitMetaOptionItem } from '@/types/cockpit-meta-filter'
  import type { EcpmOverviewKpis, EcpmTrendBundle } from './types'
  import type { ColumnOption } from '@/types'
  import { ISO2_TO_ECHARTS_WORLD_GEO_NAME } from './config/world-map-iso-to-geo-json-name'

  defineOptions({ name: 'EcpmDashboard' })

  const { t, te } = useI18n()
  const tr = (key: string, fallback: string) => (te(key) ? t(key) : fallback)

  const cockpitMetaStore = useCockpitMetaFilterStore()
  const { data: cockpitMeta } = storeToRefs(cockpitMetaStore)
  /** 应用下拉与驾驶舱 settingApps 对齐（sAppId），勿仅用 ecpm meta 的 apps 文案项 */
  const settingAppsForSelect = computed(() => cockpitMeta.value?.settingApps ?? [])
  const cockpitSourceOptions = computed<CockpitMetaOptionItem[]>(
    () => cockpitMeta.value?.sourceOptions ?? []
  )
  const cockpitCountryOptions = computed<CockpitMetaOptionItem[]>(
    () => cockpitMeta.value?.countryOptions ?? []
  )
  const cockpitSourceOptionsForSelect = computed(() =>
    cockpitSourceOptions.value.filter((o) => {
      const v = String(o.value ?? '')
        .trim()
        .toLowerCase()
      return v !== '' && v !== 'all'
    })
  )
  const cockpitCountryOptionsForSelect = computed(() =>
    cockpitCountryOptions.value.filter((o) => {
      const v = String(o.value ?? '')
        .trim()
        .toLowerCase()
      return v !== '' && v !== 'all'
    })
  )

  function fmt2(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function formatYmdSlash(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}/${m}/${day}`
  }

  const kpis = ref<EcpmOverviewKpis>({
    d_ecpm_estimated: 0,
    d_ecpm_real: 0,
    estimated_change_pct_vs_prev_month: 0,
    real_change_pct_vs_prev_month: 0,
    top_country: {
      s_country_code: '',
      label_display: '',
      d_ecpm: 0,
      second: { s_country_code: '', label_display: '', d_ecpm: 0 }
    },
    top_ad_slot: {
      s_app_id: '',
      s_app_name: '',
      n_ad_type_label: '',
      d_ecpm: 0
    }
  })
  const platformSubtotal = ref({
    d_ecpm_real: 0,
    revenue_display: '',
    share_display: ''
  })
  const platforms = ref<
    Array<{
      name: string
      real: number
      revenue: string
      share: string
      trend: 'up' | 'down' | 'flat'
      sparkData: number[]
    }>
  >([])
  const adSlots = ref<Array<{ name: string; value: number; color: string }>>([])
  const insightTip = ref('')

  const appRankRows = ref<
    Array<{
      s_app_name: string
      icon_text: string
      d_ecpm_estimated: number
      d_ecpm_real: number
      revenue_display: string
      mom_change_pct: number
    }>
  >([])
  const apps = computed(() =>
    appRankRows.value.map((r) => ({
      name: r.s_app_name,
      icon: r.icon_text,
      ecpm: appRankType.value === 'estimated' ? r.d_ecpm_estimated : r.d_ecpm_real,
      revenue: r.revenue_display,
      change: r.mom_change_pct
    }))
  )

  // ─── State ───────────────────────────────────────────────────────────────
  const defaultEnd = getAppNow()
  const defaultStart = cloneAppDate(defaultEnd)
  defaultStart.setDate(defaultStart.getDate() - 6)
  const dateRange = ref<[string, string]>([
    formatYmdSlash(defaultStart),
    formatYmdSlash(defaultEnd)
  ])
  const filterPlatform = ref('')
  const filterApp = ref<string | string[]>([])
  const filterCountry = ref('')

  function onPlatformFilterUpdate(v: string | undefined | null) {
    filterPlatform.value = v ?? ''
  }

  function onCountryFilterUpdate(v: string | undefined | null) {
    filterCountry.value = v ?? ''
  }

  const loadingMetaFilterOptions = ref(false)
  const loadingOverviewKpis = ref(false)
  const loadingOverviewTrend = ref(false)
  const loadingTablePlatform = ref(false)
  const loadingOverviewMapCountry = ref(false)
  const loadingOverviewTop10Country = ref(false)
  const loadingOverviewAdSlotRanking = ref(false)
  const loadingOverviewAppRanking = ref(false)
  const loadingOverviewInsightTip = ref(false)
  const querying = ref(false)
  const trendData = ref<EcpmTrendBundle>({
    x_labels: [],
    series_estimated: [],
    series_real: [],
    series_revenue: []
  })
  const mapCountries = ref<
    Array<{
      s_country_code: string
      geo_name: string
      d_ecpm_estimated: number
      d_ecpm_real: number
    }>
  >([])
  const top10Countries = ref<
    Array<{ s_country_code: string; label_zh: string; d_ecpm: number; bar_color: string }>
  >([])
  const mapMode = ref<'estimated' | 'real'>('real')
  const activeTrendTab = ref('真实ECPM')
  const trendTabs = [
    // '预估ECPM', // 暂隐藏；恢复时请取消注释并将 activeTrendTab 默认改回「预估ECPM」如需一致
    '真实ECPM',
    '广告收入'
  ]
  const appRankType = ref('real')

  const platformTableRows = computed(() => [
    ...platforms.value.map((row) => ({ ...row, __isSubtotal: false })),
    {
      name: '小计',
      real: platformSubtotal.value.d_ecpm_real,
      revenue: platformSubtotal.value.revenue_display,
      share: platformSubtotal.value.share_display,
      trend: 'flat' as const,
      sparkData: [],
      __isSubtotal: true
    }
  ])

  const platformTableColumns = computed<ColumnOption[]>(() => [
    {
      prop: 'name',
      label: '广告平台',
      minWidth: 100,
      useSlot: true,
      slotName: 'name',
      showOverflowTooltip: true
    },
    {
      prop: 'real',
      label: '真实ECPM',
      minWidth: 100,
      align: 'left',
      useSlot: true,
      slotName: 'real'
    },
    {
      prop: 'revenue',
      label: '广告收入',
      minWidth: 110,
      align: 'left',
      useSlot: true,
      slotName: 'revenue'
    },
    {
      prop: 'share',
      label: '占比',
      minWidth: 100,
      align: 'left',
      useSlot: true,
      slotName: 'share'
    },
    { prop: 'trend', label: '趋势', minWidth: 90, align: 'left', useSlot: true, slotName: 'trend' }
  ])

  function platformTableRowClassName({ row }: { row: { __isSubtotal?: boolean } }) {
    return row.__isSubtotal ? 'platform-total-row' : ''
  }

  // ─── Chart Refs ───────────────────────────────────────────────────────────
  const trendRef = ref<HTMLDivElement>()
  const worldMapRef = ref<HTMLDivElement>()
  const top10Ref = ref<HTMLDivElement>()

  let trendChart: ReturnType<typeof echarts.init> | null = null
  let worldMapChart: ReturnType<typeof echarts.init> | null = null
  let top10Chart: ReturnType<typeof echarts.init> | null = null
  let mapRequestSeq = 0
  let top10RequestSeq = 0

  useResizeObserver(top10Ref, () => {
    nextTick(() => top10Chart?.resize())
  })

  /** 顶栏「全部」：cockpit 常见为 `all` 或空串；POST 不限时统一为 '' */
  function toUnlimitedDimension(v: string): string {
    const s = String(v ?? '').trim()
    return s === 'all' || s === '' ? '' : s
  }

  function fromSelectAppValue(value: string | string[]): string | string[] {
    if (Array.isArray(value)) {
      return value.map((item) => String(item ?? '').trim()).filter((item) => item && item !== 'all')
    }
    const s = String(value ?? '').trim()
    return s === '' || s === 'all' ? '' : s
  }

  function normalizeYmd(value: string) {
    return String(value).replace(/\//g, '-')
  }

  function sparkPath(data: number[]): string {
    const W = 58
    const H = 20
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * W
        const y = H - ((v - min) / range) * (H - 2) - 1
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }

  /** 去掉 min/max 上的 IEEE-754 噪声，减轻 ECharts 等分刻度时出现 5.7680000000000001 */
  function snapTrendAxisBound(n: number): number {
    return Number.parseFloat(Number(n).toPrecision(10))
  }

  /**
   * 趋势图 Y 轴刻度文案：避免 split 计算产生的浮点尾数直接显示在标签上
   * （根因：JS 浮点运算 + ECharts 内部等分，与业务数据精度无关）
   */
  function formatTrendYAxisTick(raw: number | string): string {
    const v = typeof raw === 'number' ? raw : Number(raw)
    if (!Number.isFinite(v)) return ''
    if (v === 0) return '0'
    const snapped = Number.parseFloat(v.toPrecision(12))
    const abs = Math.abs(snapped)
    if (abs >= 1000) return String(Math.round(snapped))
    if (abs >= 100) return String(Math.round(snapped))
    if (abs >= 10) return String(Number(snapped.toFixed(1)))
    return String(Number(snapped.toFixed(2)))
  }

  /** 趋势折线图左侧数值轴：按当前序列留出上下边距，无有效数据时交给 ECharts 自适应 */
  function trendValueAxisFromSeries(values: number[]) {
    const nums = values.map((v) => Number(v)).filter((n) => Number.isFinite(n))
    if (!nums.length) {
      return {
        yMin: null as number | null,
        yMax: null as number | null,
        yInterval: null as number | null
      }
    }
    const minV = Math.min(...nums)
    const maxV = Math.max(...nums)
    const span = maxV - minV || (Math.abs(maxV) > 1e-9 ? Math.abs(maxV) * 0.1 : 1)
    const padLow = span * 0.05
    const padHigh = span * 0.12
    let min = minV - padLow
    let max = maxV + padHigh
    if (minV >= 0 && min < 0) min = 0
    return {
      yMin: snapTrendAxisBound(min),
      yMax: snapTrendAxisBound(max),
      yInterval: null as number | null
    }
  }

  // ─── ECharts Theme ────────────────────────────────────────────────────────
  const TRANSPARENT = 'transparent'
  const COLOR_TEAL = '#00d4aa'
  const COLOR_ORANGE = '#f5a623'
  const AXIS_COLOR = '#243a55'
  const LABEL_COLOR = '#6a8aaa'
  const TEXT_COLOR = '#b0c8df'

  const TOOLTIP_STYLE = {
    backgroundColor: '#162035',
    borderColor: '#1e3250',
    textStyle: { color: TEXT_COLOR, fontSize: 12 }
  }

  function getTrendSeriesConfig() {
    if (activeTrendTab.value === '广告收入') {
      return {
        legend: ['广告收入'],
        series: [
          {
            name: '广告收入',
            type: 'line',
            data: trendData.value.series_revenue,
            smooth: 0.4,
            symbol: 'none',
            lineStyle: { color: COLOR_TEAL, width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0,212,170,0.18)' },
                { offset: 1, color: 'rgba(0,212,170,0.01)' }
              ])
            }
          }
        ],
        yMin: null as number | null,
        yMax: null as number | null,
        yInterval: null as number | null
      }
    }
    if (activeTrendTab.value === '真实ECPM') {
      const axis = trendValueAxisFromSeries(trendData.value.series_real)
      return {
        legend: ['真实ECPM'],
        series: [
          {
            name: '真实ECPM',
            type: 'line',
            data: trendData.value.series_real,
            smooth: 0.4,
            symbol: 'none',
            lineStyle: { color: COLOR_TEAL, width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0,212,170,0.18)' },
                { offset: 1, color: 'rgba(0,212,170,0.01)' }
              ])
            }
          }
        ],
        yMin: axis.yMin,
        yMax: axis.yMax,
        yInterval: axis.yInterval
      }
    }
    const axisEst = trendValueAxisFromSeries(trendData.value.series_estimated)
    return {
      legend: ['预估ECPM'],
      series: [
        {
          name: '预估ECPM',
          type: 'line',
          data: trendData.value.series_estimated,
          smooth: 0.4,
          symbol: 'none',
          lineStyle: { color: COLOR_ORANGE, type: 'dashed', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245,166,35,0.18)' },
              { offset: 1, color: 'rgba(245,166,35,0.01)' }
            ])
          }
        }
      ],
      yMin: axisEst.yMin,
      yMax: axisEst.yMax,
      yInterval: axisEst.yInterval
    }
  }

  function updateTrendChart() {
    if (!trendChart) return
    const cfg = getTrendSeriesConfig()
    trendChart.setOption({
      legend: { show: false },
      xAxis: { data: trendData.value.x_labels },
      yAxis: {
        min: cfg.yMin,
        max: cfg.yMax,
        interval: cfg.yInterval
      },
      series: cfg.series
    })
    trendChart.resize()
  }

  // ─── Trend Chart ──────────────────────────────────────────────────────────
  function initTrendChart() {
    if (!trendRef.value) return
    trendChart = echarts.getInstanceByDom(trendRef.value) ?? echarts.init(trendRef.value)

    trendChart.setOption({
      backgroundColor: TRANSPARENT,
      grid: { top: 36, right: 16, bottom: 30, left: 40 },
      tooltip: {
        trigger: 'axis',
        ...TOOLTIP_STYLE,
        axisPointer: { lineStyle: { color: AXIS_COLOR } }
      },
      legend: {
        show: false,
        right: 8,
        top: 4,
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 16,
        textStyle: { color: LABEL_COLOR, fontSize: 11 }
      },
      xAxis: {
        type: 'category',
        data: trendData.value.x_labels,
        boundaryGap: false,
        axisLine: { lineStyle: { color: AXIS_COLOR } },
        axisTick: { show: false },
        axisLabel: { color: LABEL_COLOR, fontSize: 10 },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        min: null,
        max: null,
        interval: null,
        splitLine: { lineStyle: { color: AXIS_COLOR, type: 'dashed' } },
        axisLabel: {
          color: LABEL_COLOR,
          fontSize: 10,
          formatter: formatTrendYAxisTick
        },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          name: '预估ECPM',
          type: 'line',
          data: trendData.value.series_estimated,
          smooth: 0.4,
          symbol: 'none',
          lineStyle: { color: COLOR_ORANGE, type: 'dashed', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245,166,35,0.18)' },
              { offset: 1, color: 'rgba(245,166,35,0.01)' }
            ])
          }
        }
      ]
    })
    updateTrendChart()
  }

  function normalizeMapCountryName(rawName: string) {
    const name = String(rawName ?? '').trim()
    if (!name) return ''

    const isAllCaps =
      name.length >= 3 && name === name.toUpperCase() && /[A-Z]/.test(name) && !/\d/.test(name)

    const normalized = isAllCaps
      ? name
          .replace(/[_-]+/g, ' ')
          .toLowerCase()
          .split(' ')
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : name

    // GeoJSON country name quirks / aliases
    const aliasMap: Record<string, string> = {
      'United States Of America': 'United States',
      'Russian Federation': 'Russia',
      'Korea, South': 'South Korea',
      'Korea (Republic Of)': 'South Korea',
      'South Korea': 'Korea',
      'United Kingdom Of Great Britain And Northern Ireland': 'United Kingdom',
      'Brunei Darussalam': 'Brunei'
    }

    return aliasMap[normalized] ?? normalized
  }

  /** 与 `public/geo/world.json` 的 `properties.name` 对齐，供 map / geo 系列匹配 */
  function resolveWorldMapSeriesName(item: { geo_name?: string; s_country_code?: string }) {
    const code = String(item.s_country_code ?? '')
      .trim()
      .toUpperCase()
    if (code && ISO2_TO_ECHARTS_WORLD_GEO_NAME[code]) {
      return ISO2_TO_ECHARTS_WORLD_GEO_NAME[code]
    }
    return normalizeMapCountryName(item.geo_name || item.s_country_code || '')
  }

  function mapVisualValueMax() {
    const vals = mapSeriesData().map((d) => Number(d.value))
    return Math.max(10, ...vals, 0)
  }

  function mapSeriesData() {
    return mapCountries.value.map((c) => ({
      name: resolveWorldMapSeriesName(c),
      value: mapMode.value === 'estimated' ? c.d_ecpm_estimated : c.d_ecpm_real
    }))
  }

  function mapEffectScatterSymbolSize(_val: unknown, params: { data?: { value?: unknown } }) {
    const v = Number(params?.data?.value ?? 0)
    return Math.max(7, Math.min(20, v * 2))
  }

  /** Top N：用国家名让 geo 解析经纬度（勿再依赖手写坐标表） */
  function mapPulseData() {
    return mapCountries.value
      .map((c) => {
        const value = mapMode.value === 'estimated' ? c.d_ecpm_estimated : c.d_ecpm_real
        const name = resolveWorldMapSeriesName(c)
        if (!name) return null
        return { name, value }
      })
      .filter((d): d is { name: string; value: number } => d !== null)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }

  // ─── World Map ────────────────────────────────────────────────────────────
  async function initWorldMap() {
    if (!worldMapRef.value) return

    try {
      const res = await fetch('/geo/world.json')
      const geoJson = await res.json()
      echarts.registerMap('world', geoJson)

      worldMapChart = echarts.init(worldMapRef.value)
      worldMapChart.setOption({
        backgroundColor: TRANSPARENT,
        animationDuration: 900,
        animationEasing: 'quarticOut',
        animationDurationUpdate: 700,
        tooltip: {
          trigger: 'item',
          ...TOOLTIP_STYLE,
          formatter: (params: any) => {
            const rawValue = Array.isArray(params.value) ? params.value[2] : params.value
            const row = mapCountries.value.find((c) => resolveWorldMapSeriesName(c) === params.name)
            const label = String(row?.geo_name ?? '').trim() || String(params.name ?? '')
            return `${label}<br/>$${rawValue != null && rawValue !== '' ? fmt2(Number(rawValue)) : 'N/A'}`
          }
        },
        geo: {
          map: 'world',
          roam: true,
          scaleLimit: { min: 1, max: 6 },
          zoom: 1.12,
          center: [20, 10],
          itemStyle: {
            areaColor: '#16253d',
            borderColor: '#243b5d',
            borderWidth: 0.7
          },
          emphasis: {
            itemStyle: {
              areaColor: '#2f6cff',
              borderColor: '#8fb4ff',
              borderWidth: 1.4,
              shadowBlur: 18,
              shadowColor: 'rgb(47 108 255 / 55%)'
            },
            label: { show: false }
          },
          select: {
            itemStyle: {
              areaColor: '#4f8fff'
            }
          }
        },
        visualMap: {
          show: false,
          min: 0,
          max: mapVisualValueMax(),
          left: 'left',
          bottom: 8,
          orient: 'horizontal',
          text: ['', ''],
          textStyle: { color: LABEL_COLOR, fontSize: 10 },
          inRange: { color: ['#243b5d', '#2f6cff', '#00bcd4', '#00d4aa', '#f5a623'] },
          itemWidth: 100,
          itemHeight: 10,
          calculable: false
        },
        series: [
          {
            type: 'map',
            geoIndex: 0,
            label: { show: false },
            data: mapSeriesData()
          },
          {
            type: 'effectScatter',
            coordinateSystem: 'geo',
            zlevel: 3,
            symbolSize: mapEffectScatterSymbolSize,
            rippleEffect: {
              period: 3,
              scale: 4,
              brushType: 'stroke'
            },
            showEffectOn: 'render',
            itemStyle: {
              color: '#ffd166',
              shadowBlur: 16,
              shadowColor: 'rgb(255 209 102 / 68%)'
            },
            emphasis: {
              scale: true
            },
            data: mapPulseData()
          },
          {
            type: 'scatter',
            coordinateSystem: 'geo',
            zlevel: 2,
            symbolSize: 4,
            itemStyle: {
              color: '#7dd3fc',
              opacity: 0.9
            },
            silent: true,
            data: mapPulseData().map((d) => ({
              name: d.name,
              value: d.value
            }))
          }
        ]
      })
    } catch (e) {
      console.warn('[EcpmDashboard] 世界地图数据加载失败，请检查网络', e)
    }
  }

  // ─── Top 10 Chart ─────────────────────────────────────────────────────────
  function initTop10Chart() {
    if (!top10Ref.value) return
    top10Chart = echarts.init(top10Ref.value)

    const countries = top10Countries.value.map((r) => r.label_zh)
    const values = top10Countries.value.map((r) => r.d_ecpm)
    const colors = top10Countries.value.map((r) => r.bar_color)

    top10Chart.setOption({
      backgroundColor: TRANSPARENT,
      grid: { top: 8, right: 48, bottom: 8, left: 72, containLabel: false },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'none' },
        ...TOOLTIP_STYLE
      },
      xAxis: {
        type: 'value',
        show: false,
        max: 10
      },
      yAxis: {
        type: 'category',
        data: countries,
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: TEXT_COLOR, fontSize: 11 }
      },
      series: [
        {
          type: 'bar',
          data: values.map((v, i) => ({
            value: v,
            itemStyle: { color: colors[i], borderRadius: [0, 3, 3, 0] }
          })),
          barMaxWidth: 14,
          label: {
            show: true,
            position: 'right',
            color: TEXT_COLOR,
            fontSize: 11,
            formatter: '{c}'
          }
        }
      ]
    })
  }

  // ─── Resize Handler ───────────────────────────────────────────────────────
  function onResize() {
    trendChart?.resize()
    worldMapChart?.resize()
    top10Chart?.resize()
  }

  async function loadMetaFilterOptions() {
    loadingMetaFilterOptions.value = true
    try {
      await cockpitMetaStore.ensureLoaded()
      const meta = cockpitMeta.value
      filterPlatform.value = ''
      filterCountry.value = ''
      const cockpitApps = meta?.settingApps ?? []
      if (cockpitApps.length > 0) {
        filterApp.value = [String(cockpitApps[0]!.sAppId ?? '').trim()].filter(Boolean)
      } else {
        const firstApp = meta?.appOptions?.find((o) => {
          const v = String(o.value ?? '').trim()
          return v && v !== 'all'
        })
        filterApp.value = firstApp ? [firstApp.value] : []
      }
    } finally {
      loadingMetaFilterOptions.value = false
    }
  }

  async function loadOverviewKpis() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    loadingOverviewKpis.value = true
    try {
      kpis.value = await fetchEcpmOverviewKpis({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        source: toUnlimitedDimension(filterPlatform.value),
        // 网关 POST 体由 fetchEcpm* 转为 appIds: string[]（见 api/business-insight.ts）
        s_app_id: fromSelectAppValue(filterApp.value),
        s_country_code: toUnlimitedDimension(filterCountry.value)
      })
    } finally {
      loadingOverviewKpis.value = false
    }
  }

  async function loadOverviewTrend() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    loadingOverviewTrend.value = true
    try {
      trendData.value = await fetchEcpmOverviewTrend({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        source: toUnlimitedDimension(filterPlatform.value),
        // 网关 POST 体由 fetchEcpm* 转为 appIds: string[]（见 api/business-insight.ts）
        s_app_id: fromSelectAppValue(filterApp.value),
        s_country_code: toUnlimitedDimension(filterCountry.value)
      })
      if (trendChart) initTrendChart()
    } finally {
      loadingOverviewTrend.value = false
    }
  }

  async function loadTablePlatform() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    loadingTablePlatform.value = true
    try {
      const response = await fetchEcpmTablePlatform({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        // 网关 POST 体由 fetchEcpm* 转为 appIds: string[]（见 api/business-insight.ts）
        s_app_id: fromSelectAppValue(filterApp.value),
        s_country_code: toUnlimitedDimension(filterCountry.value)
      })
      platforms.value = response.rows.map((row) => ({
        name: row.name,
        real: row.d_ecpm_real,
        revenue: row.revenue_display,
        share: row.share_display,
        trend: row.trend,
        sparkData: row.spark_series
      }))
      platformSubtotal.value = {
        d_ecpm_real: response.subtotal.d_ecpm_real,
        revenue_display: response.subtotal.revenue_display,
        share_display: response.subtotal.share_display
      }
    } finally {
      loadingTablePlatform.value = false
    }
  }

  async function loadOverviewMapCountry() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    const requestSeq = ++mapRequestSeq
    loadingOverviewMapCountry.value = true
    try {
      const response = await fetchEcpmOverviewMapCountry({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        source: toUnlimitedDimension(filterPlatform.value),
        // 网关 POST 体由 fetchEcpm* 转为 appIds: string[]（见 api/business-insight.ts）
        s_app_id: fromSelectAppValue(filterApp.value),
        s_country_code: toUnlimitedDimension(filterCountry.value),
        map_metric: mapMode.value
      })
      if (requestSeq !== mapRequestSeq) return
      mapCountries.value = response.items
      if (worldMapChart) {
        const pulse = mapPulseData()
        worldMapChart.setOption(
          {
            visualMap: { min: 0, max: mapVisualValueMax() },
            series: [
              { type: 'map', geoIndex: 0, label: { show: false }, data: mapSeriesData() },
              {
                type: 'effectScatter',
                coordinateSystem: 'geo',
                zlevel: 3,
                symbolSize: mapEffectScatterSymbolSize,
                rippleEffect: { period: 3, scale: 4, brushType: 'stroke' },
                showEffectOn: 'render',
                itemStyle: {
                  color: '#ffd166',
                  shadowBlur: 16,
                  shadowColor: 'rgb(255 209 102 / 68%)'
                },
                emphasis: { scale: true },
                data: pulse
              },
              {
                type: 'scatter',
                coordinateSystem: 'geo',
                zlevel: 2,
                symbolSize: 4,
                itemStyle: { color: '#7dd3fc', opacity: 0.9 },
                silent: true,
                data: pulse.map((d) => ({ name: d.name, value: d.value }))
              }
            ]
          },
          { replaceMerge: ['series'] as any }
        )
      }
    } finally {
      if (requestSeq === mapRequestSeq) {
        loadingOverviewMapCountry.value = false
        await nextTick()
        worldMapChart?.resize()
      }
    }
  }

  async function loadOverviewTop10Country() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    const requestSeq = ++top10RequestSeq
    loadingOverviewTop10Country.value = true
    try {
      const response = await fetchEcpmOverviewTop10Country({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        source: toUnlimitedDimension(filterPlatform.value),
        // 网关 POST 体由 fetchEcpm* 转为 appIds: string[]（见 api/business-insight.ts）
        s_app_id: fromSelectAppValue(filterApp.value),
        s_country_code: toUnlimitedDimension(filterCountry.value),
        metric: mapMode.value
      })
      if (requestSeq !== top10RequestSeq) return
      top10Countries.value = response.rows
      if (top10Chart) initTop10Chart()
    } finally {
      if (requestSeq === top10RequestSeq) {
        loadingOverviewTop10Country.value = false
        await nextTick()
        top10Chart?.resize()
      }
    }
  }

  async function loadOverviewAdSlotRanking() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    loadingOverviewAdSlotRanking.value = true
    try {
      const response = await fetchEcpmOverviewAdSlotRanking({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        source: toUnlimitedDimension(filterPlatform.value),
        // 网关 POST 体由 fetchEcpm* 转为 appIds: string[]（见 api/business-insight.ts）
        s_app_id: fromSelectAppValue(filterApp.value),
        s_country_code: toUnlimitedDimension(filterCountry.value)
      })
      adSlots.value = response.rows.map((row) => ({
        name: row.s_ad_unit_label,
        value: row.d_ecpm,
        color: row.bar_color
      }))
    } finally {
      loadingOverviewAdSlotRanking.value = false
    }
  }

  async function loadOverviewAppRanking() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    loadingOverviewAppRanking.value = true
    try {
      const response = await fetchEcpmOverviewAppRanking({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        source: toUnlimitedDimension(filterPlatform.value),
        // 网关 POST 体由 fetchEcpm* 转为 appIds: string[]（见 api/business-insight.ts）
        s_app_id: fromSelectAppValue(filterApp.value),
        s_country_code: toUnlimitedDimension(filterCountry.value)
      })
      appRankRows.value = response.rows
    } finally {
      loadingOverviewAppRanking.value = false
    }
  }

  async function loadOverviewInsightTip() {
    const [start, end] = dateRange.value
    if (!start || !end) return
    loadingOverviewInsightTip.value = true
    try {
      const response = await fetchEcpmOverviewInsightTip({
        t_start_date: normalizeYmd(start),
        t_end_date: normalizeYmd(end),
        platform: 'all',
        // 网关 POST 体由 fetchEcpm* 转为 appIds: string[]（见 api/business-insight.ts）
        s_app_id: fromSelectAppValue(filterApp.value)
      })
      insightTip.value = response.message
    } finally {
      loadingOverviewInsightTip.value = false
    }
  }

  async function loadOverviewModulesInParallel() {
    await Promise.allSettled([
      loadOverviewKpis(),
      loadOverviewTrend(),
      loadTablePlatform(),
      loadOverviewMapCountry(),
      loadOverviewTop10Country(),
      loadOverviewAdSlotRanking(),
      loadOverviewAppRanking(),
      loadOverviewInsightTip()
    ])
  }

  async function handleQuery() {
    if (querying.value) return
    querying.value = true
    try {
      await loadOverviewModulesInParallel()
    } finally {
      querying.value = false
    }
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  onMounted(async () => {
    // 先初始化图表实例，避免请求完成后 loading 提前结束导致空白闪烁
    initTrendChart()
    await initWorldMap()
    initTop10Chart()

    await loadMetaFilterOptions()
    await loadOverviewModulesInParallel()
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    trendChart?.dispose()
    worldMapChart?.dispose()
    top10Chart?.dispose()
    window.removeEventListener('resize', onResize)
  })

  watch(mapMode, async () => {
    await Promise.allSettled([loadOverviewMapCountry(), loadOverviewTop10Country()])
  })

  watch(activeTrendTab, () => {
    updateTrendChart()
  })
</script>

<style scoped lang="scss">
  @use '../../user-growth/styles/app-platform-select-ad-theme.scss' as apSelect;
  @use '../../user-growth/styles/filter-bar-theme.scss' as filterTheme;

  /* ── Root & Variables ─────────────────────────────────────────── */
  .ecpm-dash {
    /* 优先继承布局 --theme-color，否则 Art 主色，最后回退 EP 主色（避免再强制绑死 --el-color-primary） */
    --ecpm-accent: var(--theme-color, var(--art-primary, var(--el-color-primary)));
    --text-sec: #64748b;
    --bg: #0d1422;
    --bg-card: #131d2f;
    --bg-card-2: #162038;
    --border: #1a2b41;
    --border-2: #203350;
    --text: #d4e6f5;
    --text-dim: #5a7a99;
    --text-mid: #8aaac8;
    --teal: #00d4aa;
    --blue: #4db6e8;
    --orange: #f5a623;
    --green: #52c41a;
    --red: #ff6b6b;
    --teal-dim: rgb(0 212 170 / 12%);
    --blue-dim: rgb(77 182 232 / 12%);
    --orange-dim: rgb(245 166 35 / 12%);

    position: relative;
    box-sizing: border-box;
    min-height: 100vh;
    padding: 0;
    overflow-x: clip;
    font-family:
      'PingFang SC',
      'Microsoft YaHei',
      -apple-system,
      sans-serif;
    font-size: 13px;
    color: var(--text);
    background: var(--bg);
  }

  .ecpm-dash::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(
        1100px 520px at 12% -10%,
        color-mix(in srgb, var(--art-primary, #3b82f6) 26%, transparent),
        transparent 62%
      ),
      radial-gradient(
        900px 440px at 78% 4%,
        color-mix(in srgb, var(--art-success, #10b981) 16%, transparent),
        transparent 60%
      ),
      radial-gradient(
        840px 520px at 52% 0%,
        color-mix(in srgb, var(--art-warning, #f97316) 14%, transparent),
        transparent 66%
      );
    opacity: 0.95;
    mask-image: linear-gradient(to bottom, #000 0%, #000 36%, transparent 78%);
  }

  .ecpm-dash::after {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      linear-gradient(to right, rgb(255 255 255 / 1%) 1px, transparent 1px),
      linear-gradient(to bottom, rgb(255 255 255 / 1%) 1px, transparent 1px);
    background-size: 22px 22px;
    opacity: 0.18;
    mask-image: radial-gradient(ellipse 92% 52% at 40% 0%, #000 0%, transparent 70%);
  }

  .ecpm-page-fx {
    position: absolute;
    top: -220px;
    right: -280px;
    z-index: 0;
    width: 640px;
    height: 640px;
    pointer-events: none;
    background: conic-gradient(
      from 180deg,
      transparent,
      color-mix(in srgb, var(--art-primary, #3b82f6) 52%, transparent),
      transparent,
      color-mix(in srgb, var(--art-success, #10b981) 45%, transparent),
      transparent,
      color-mix(in srgb, var(--art-warning, #f97316) 44%, transparent),
      transparent
    );
    filter: blur(40px);
    border-radius: 9999px;
    opacity: 0.48;
    animation: ecpm-fx-spin 18s linear infinite;
  }

  .ecpm-dash > :not(.ecpm-page-fx) {
    position: relative;
    z-index: 1;
  }

  @keyframes ecpm-fx-spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  /* ── Header ──────────────────────────────────────────────────── */
  .dash-header {
    padding: 14px 20px;
    border-bottom: 0;
  }

  /* .breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
  } */

  /* .bc-parent {
    font-size: 14px;
    font-weight: 400;
    color: var(--text-dim);
  }

  .bc-sep {
    color: var(--text-dim);
  }

  .bc-cur {
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
  } */

  .bi-filters.bi-filter-panel {
    @include filterTheme.filter-panel(14px 16px);
    @include filterTheme.filter-panel-children;
    @include filterTheme.filter-row;

    min-width: 0;
  }

  .bi-filters.bi-filter-panel > .bi-filter-field {
    display: inline-flex;
    gap: 0;
    align-items: center;
    min-height: 0;
    padding: 0;
    background: transparent;
    border: none;
  }

  .bi-filter-select:not(.bi-filter-select--app) {
    @include filterTheme.filter-select-size(240px, 200px, 240px);
  }

  .bi-filter-select--platform {
    flex: 0 0 128px;
    width: 128px;
    min-width: 128px;
    max-width: 128px;
  }

  :deep(.bi-filter-date) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
    --el-date-editor-width: 260px;
    --el-date-editor-daterange-width: 260px;
  }

  @include filterTheme.date-range-trigger('.bi-filter-date', 260px);
  @include filterTheme.element-select-trigger('.bi-filter-select');
  @include apSelect.apply-app-platform-select-ad-theme(
    '.bi-filters.bi-filter-panel',
    'bi-filter-select__input',
    'ecpm-filter__popper',
    240px,
    200px,
    240px
  );
  @include filterTheme.select-popper('ecpm-filter__popper');
  @include filterTheme.app-platform-popper('ecpm-filter__popper');
  @include filterTheme.date-picker-popper('ecpm-filter__popper');

  :global(.ecpm-filter__popper.el-popper),
  :global(.ecpm-filter__popper.el-select__popper),
  :global(.ecpm-filter__popper.el-picker__popper) {
    z-index: 4000 !important;
  }

  :deep(.bi-filter-select),
  :deep(.bi-filter-select__input) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
  }

  .bi-filter-panel :deep(.bi-query-btn.el-button) {
    height: 36px;
    padding: 0 18px;
    font-weight: 600;
    color: var(--theme-color, var(--art-primary, #3b82f6));
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: none;
  }

  .bi-filter-panel :deep(.bi-query-btn.el-button:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  :deep(.filter-sel-skeleton.el-skeleton__item) {
    width: 240px;
    height: 36px;
    border-radius: var(--el-border-radius-base, 4px);
  }

  .kpi-card-skeleton-lines,
  .table-skeleton-lines,
  .chart-skeleton-lines {
    display: grid;
    gap: 10px;
    padding: 10px 0;
  }

  .kpi-card-skeleton-lines {
    min-height: 144px;
  }

  .table-skeleton-lines {
    min-height: 240px;
  }

  .chart-skeleton-lines {
    min-height: 280px;
  }

  .chart-loading-wrap {
    position: relative;
    border-radius: 14px;
  }

  .chart-loading-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    padding: 8px;
    pointer-events: none;
    background: rgb(10 14 22 / 64%);
    backdrop-filter: blur(6px);
    border-radius: 14px;
  }

  :deep(.s-line.el-skeleton__item) {
    height: 12px;
    border-radius: 6px;
  }

  :deep(.insight-tip-line.el-skeleton__item) {
    height: 16px;
    margin-top: 10px;
    border-radius: 6px;
  }

  .w40 {
    width: 40%;
  }

  .w45 {
    width: 45%;
  }

  .w55 {
    width: 55%;
  }

  .w70 {
    width: 70%;
  }

  .w75 {
    width: 75%;
  }

  .w76 {
    width: 76%;
  }

  .w79 {
    width: 79%;
  }

  .w80 {
    width: 80%;
  }

  .w83 {
    width: 83%;
  }

  .w84 {
    width: 84%;
  }

  .w85 {
    width: 85%;
  }

  .w86 {
    width: 86%;
  }

  .w87 {
    width: 87%;
  }

  .w88 {
    width: 88%;
  }

  .w89 {
    width: 89%;
  }

  .w90 {
    width: 90%;
  }

  .w91 {
    width: 91%;
  }

  .w92 {
    width: 92%;
  }

  .w93 {
    width: 93%;
  }

  .w94 {
    width: 94%;
  }

  .w95 {
    width: 95%;
  }

  .w96 {
    width: 96%;
  }

  :deep(.filter-icon-btn.el-button) {
    width: 32px;
    height: 32px;
    color: var(--text-mid);
    background: var(--bg-card-2);
    border-color: var(--border-2);
  }

  @media (prefers-reduced-motion: reduce) {
    .ecpm-page-fx {
      animation: none;
    }

    .bi-filters.bi-filter-panel {
      transition: none;
    }
  }

  :deep(.mini-sel.el-select) {
    --el-input-bg-color: var(--bg-card-2);
    --el-input-border-color: var(--border-2);
    --el-input-text-color: var(--text-mid);

    width: 106px;
  }

  /* ── KPI Row ─────────────────────────────────────────────────── */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-column: 1 / -1;
    gap: 10px;
    padding: 0 0 14px;
  }

  .kpi-card {
    position: relative;
    padding: 16px 18px;
    overflow: hidden;
    cursor: pointer;
    background:
      radial-gradient(780px 260px at 10% 0%, rgb(255 255 255 / 8%), transparent 58%),
      radial-gradient(620px 240px at 92% 12%, rgb(255 255 255 / 6%), transparent 60%),
      linear-gradient(145deg, rgb(19 29 47 / 96%), rgb(22 32 56 / 94%));
    border: 1px solid rgb(96 165 250 / 14%);
    border-radius: 16px;
    box-shadow:
      0 12px 38px rgb(0 0 0 / 46%),
      0 0 0 1px rgb(96 165 250 / 10%),
      inset 0 1px 0 rgb(186 230 253 / 10%),
      inset 0 -10px 22px rgb(0 0 0 / 26%);
    transition:
      box-shadow var(--duration-slow, 350ms) var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color var(--duration-normal, 250ms) var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      filter var(--duration-fast, 150ms) var(--ease-out, cubic-bezier(0, 0, 0.2, 1));
  }

  .kpi-card::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      linear-gradient(to right, rgb(255 255 255 / 5%) 1px, transparent 1px),
      linear-gradient(to bottom, rgb(255 255 255 / 5%) 1px, transparent 1px);
    background-size: 22px 22px;
    opacity: 0.7;
    mask-image: radial-gradient(circle at 16% 0%, #000 0%, transparent 62%);
  }

  .kpi-card::after {
    position: absolute;
    top: 0;
    right: -10%;
    left: -10%;
    z-index: 0;
    height: 2px;
    pointer-events: none;
    content: '';
    background: linear-gradient(90deg, transparent, rgb(255 255 255 / 40%), transparent);
    filter: blur(0.2px);
    opacity: 0.55;
  }

  .kpi-card > * {
    position: relative;
    z-index: 1;
  }

  .kpi-card:hover {
    filter: brightness(1.05) saturate(1.06);
    border-color: rgb(96 165 250 / 34%);
    box-shadow:
      0 16px 46px rgb(0 0 0 / 56%),
      0 0 0 1px rgb(96 165 250 / 16%),
      inset 0 1px 0 rgb(186 230 253 / 14%),
      0 0 52px rgb(59 130 246 / 12%),
      0 0 40px rgb(34 211 238 / 8%),
      0 0 96px rgb(34 211 238 / 10%);
  }

  .kpi-card.kpi-teal {
    border-color: rgb(0 212 170 / 20%);
    box-shadow:
      0 12px 38px rgb(0 0 0 / 46%),
      0 0 0 1px rgb(0 212 170 / 12%),
      inset 0 1px 0 rgb(153 246 228 / 10%),
      0 0 40px rgb(0 212 170 / 10%);
  }

  .kpi-card.kpi-teal:hover {
    border-color: rgb(0 212 170 / 44%);
    box-shadow:
      0 16px 46px rgb(0 0 0 / 56%),
      0 0 0 1px rgb(0 212 170 / 18%),
      inset 0 1px 0 rgb(153 246 228 / 12%),
      0 0 52px rgb(0 212 170 / 14%),
      0 0 110px rgb(0 212 170 / 14%);
  }

  .kpi-card.kpi-blue {
    border-color: rgb(77 182 232 / 20%);
    box-shadow:
      0 12px 38px rgb(0 0 0 / 46%),
      0 0 0 1px rgb(77 182 232 / 12%),
      inset 0 1px 0 rgb(186 230 253 / 10%),
      0 0 44px rgb(77 182 232 / 10%);
  }

  .kpi-card.kpi-blue:hover {
    border-color: rgb(77 182 232 / 42%);
    box-shadow:
      0 16px 46px rgb(0 0 0 / 56%),
      0 0 0 1px rgb(77 182 232 / 18%),
      inset 0 1px 0 rgb(186 230 253 / 12%),
      0 0 54px rgb(77 182 232 / 14%),
      0 0 120px rgb(77 182 232 / 14%);
  }

  .kpi-card.kpi-dark {
    border-color: rgb(96 165 250 / 12%);
  }

  .kpi-card.kpi-dark:hover {
    border-color: rgb(96 165 250 / 32%);
    box-shadow:
      0 16px 46px rgb(0 0 0 / 56%),
      0 0 0 1px rgb(96 165 250 / 14%),
      inset 0 1px 0 rgb(186 230 253 / 12%),
      0 0 52px rgb(59 130 246 / 12%),
      0 0 110px rgb(59 130 246 / 10%);
  }

  .kpi-card.kpi-orange {
    border-color: rgb(245 166 35 / 22%);
    box-shadow:
      0 12px 38px rgb(0 0 0 / 46%),
      0 0 0 1px rgb(245 166 35 / 12%),
      inset 0 1px 0 rgb(254 215 170 / 10%),
      0 0 44px rgb(245 166 35 / 10%);
  }

  .kpi-card.kpi-orange:hover {
    border-color: rgb(245 166 35 / 46%);
    box-shadow:
      0 16px 46px rgb(0 0 0 / 56%),
      0 0 0 1px rgb(245 166 35 / 18%),
      inset 0 1px 0 rgb(254 215 170 / 12%),
      0 0 56px rgb(245 166 35 / 14%),
      0 0 120px rgb(245 166 35 / 14%);
  }

  .kpi-label {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--text-mid);
    letter-spacing: 0.2px;
  }

  .kpi-icon {
    font-size: 13px;
    filter: drop-shadow(0 8px 18px rgb(0 0 0 / 55%));
  }

  .kpi-value {
    margin-bottom: 6px;
    font-size: 36px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    text-shadow:
      0 10px 28px rgb(0 0 0 / 55%),
      0 0 22px rgb(59 130 246 / 10%);
    letter-spacing: -0.5px;
  }

  .kpi-value.large {
    font-size: 28px;
  }

  .kpi-value.xlarge {
    font-size: 22px;
    font-weight: 800;
  }

  .kpi-meta {
    margin-bottom: 2px;
    font-size: 11px;
    color: var(--text-dim);
  }

  .kpi-meta.orange-dim {
    margin-bottom: 4px;
    color: rgb(245 166 35 / 70%);
  }

  .kpi-meta.dim {
    color: var(--text-dim);
  }

  .kpi-change {
    margin-top: 4px;
    font-size: 12px;
  }

  .kpi-change.up {
    color: var(--green);
  }

  .kpi-change.dn {
    color: var(--red);
  }

  @media (prefers-reduced-motion: reduce) {
    .kpi-card {
      transition: none;
    }

    .kpi-card:hover {
      filter: brightness(1.05) saturate(1.06);
      box-shadow:
        0 16px 46px rgb(0 0 0 / 56%),
        0 0 0 1px rgb(96 165 250 / 16%),
        inset 0 1px 0 rgb(186 230 253 / 14%),
        0 0 52px rgb(59 130 246 / 12%),
        0 0 40px rgb(34 211 238 / 8%),
        0 0 96px rgb(34 211 238 / 10%);
    }

    .kpi-card.kpi-teal:hover {
      border-color: rgb(0 212 170 / 44%);
      box-shadow:
        0 16px 46px rgb(0 0 0 / 56%),
        0 0 0 1px rgb(0 212 170 / 18%),
        inset 0 1px 0 rgb(153 246 228 / 12%),
        0 0 52px rgb(0 212 170 / 14%),
        0 0 110px rgb(0 212 170 / 14%);
    }

    .kpi-card.kpi-blue:hover {
      border-color: rgb(77 182 232 / 42%);
      box-shadow:
        0 16px 46px rgb(0 0 0 / 56%),
        0 0 0 1px rgb(77 182 232 / 18%),
        inset 0 1px 0 rgb(186 230 253 / 12%),
        0 0 54px rgb(77 182 232 / 14%),
        0 0 120px rgb(77 182 232 / 14%);
    }

    .kpi-card.kpi-dark:hover {
      border-color: rgb(96 165 250 / 32%);
      box-shadow:
        0 16px 46px rgb(0 0 0 / 56%),
        0 0 0 1px rgb(96 165 250 / 14%),
        inset 0 1px 0 rgb(186 230 253 / 12%),
        0 0 52px rgb(59 130 246 / 12%),
        0 0 110px rgb(59 130 246 / 10%);
    }

    .kpi-card.kpi-orange:hover {
      border-color: rgb(245 166 35 / 46%);
      box-shadow:
        0 16px 46px rgb(0 0 0 / 56%),
        0 0 0 1px rgb(245 166 35 / 18%),
        inset 0 1px 0 rgb(254 215 170 / 12%),
        0 0 56px rgb(245 166 35 / 14%),
        0 0 120px rgb(245 166 35 / 14%);
    }
  }

  /* Colors */
  .teal {
    color: var(--teal) !important;
  }

  .blue {
    color: var(--blue) !important;
  }

  .orange {
    color: var(--orange) !important;
  }

  .white {
    color: var(--text) !important;
  }

  .up {
    color: var(--green);
  }

  .dn {
    color: var(--red);
  }

  .dim {
    color: var(--text-dim);
  }

  /* ── Main Grid ───────────────────────────────────────────────── */
  .main-grid {
    position: relative;
    display: grid;
    grid-template-columns: 38% 38% 24%;
    gap: 10px;
    align-items: stretch;
    padding: 14px 20px 20px;
  }

  .main-grid::before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 0;
    height: 22px;
    pointer-events: none;
    content: '';

    /* background: var(--bg); */
  }

  .col {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .col-mid {
    min-height: 0;
  }

  /* ── Card ────────────────────────────────────────────────────── */
  .card {
    flex-shrink: 0;
    padding: 14px;
    overflow: hidden;
    background:
      radial-gradient(820px 240px at 12% 0%, rgb(255 255 255 / 8%), transparent 58%),
      radial-gradient(720px 260px at 86% 0%, rgb(255 255 255 / 6%), transparent 62%),
      linear-gradient(148deg, rgb(19 29 47 / 96%), rgb(22 32 56 / 94%));
    border: 1px solid rgb(96 165 250 / 14%);
    border-radius: 16px;
    box-shadow:
      0 12px 40px rgb(0 0 0 / 44%),
      0 0 0 1px rgb(96 165 250 / 10%),
      inset 0 1px 0 rgb(186 230 253 / 10%),
      inset 0 -10px 26px rgb(0 0 0 / 26%);
    transition:
      box-shadow var(--duration-slow, 350ms) var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color var(--duration-normal, 250ms) var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));
  }

  .card::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      linear-gradient(to right, rgb(255 255 255 / 1%) 1px, transparent 1px),
      linear-gradient(to bottom, rgb(255 255 255 / 1%) 1px, transparent 1px);
    background-size: 22px 22px;
    opacity: 0.66;
    mask-image: radial-gradient(circle at 16% 0%, #000 0%, transparent 62%);
  }

  .card::after {
    position: absolute;
    top: 0;
    right: -10%;
    left: -10%;
    z-index: 0;
    height: 2px;
    pointer-events: none;
    content: '';
    background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0%), transparent);
    filter: blur(0.2px);
    opacity: 0.55;
  }

  .card > * {
    position: relative;
    z-index: 1;
  }

  .card:hover {
    border-color: rgb(96 165 250 / 34%);
    box-shadow:
      0 16px 52px rgb(0 0 0 / 56%),
      0 0 0 1px rgb(96 165 250 / 16%),
      inset 0 1px 0 rgb(186 230 253 / 14%),
      0 0 56px rgb(59 130 246 / 12%),
      0 0 44px rgb(34 211 238 / 8%),
      0 0 110px rgb(34 211 238 / 10%);
  }

  .card-title {
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    text-shadow: 0 12px 28px rgb(0 0 0 / 55%);
    letter-spacing: 0.2px;
  }

  .card-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .card-header-row .card-title {
    margin-bottom: 0;
  }

  /* Top 10：在网格行内与右侧区块底部对齐，图表高度随列剩余空间变化 */
  .card.card-top10 {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
  }

  .card-top10 .chart-loading-wrap {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
  }

  /* ── Charts ──────────────────────────────────────────────────── */
  .echart {
    width: 100%;
  }

  .echart-trend {
    height: 220px;
  }

  .echart-map {
    height: 240px;
    background:
      radial-gradient(760px 280px at 12% 0%, rgb(59 130 246 / 12%), transparent 58%),
      radial-gradient(640px 260px at 86% 0%, rgb(0 212 170 / 10%), transparent 62%),
      linear-gradient(180deg, rgb(0 0 0 / 14%), rgb(0 0 0 / 0%));
    box-shadow:
      0 0 0 1px rgb(96 165 250 / 10%) inset,
      inset 0 18px 40px rgb(0 0 0 / 20%);
  }

  .echart-top10 {
    flex: 1 1 auto;
    width: 100%;
    min-height: 160px;
  }

  /* ── Trend Tabs ──────────────────────────────────────────────── */
  .tab-row {
    display: flex;
    gap: 6px;
    margin-top: 10px;
  }

  .tab-btn {
    padding: 4px 12px;
    font-size: 11px;
    color: var(--text-dim);
    cursor: pointer;
    background: rgb(0 0 0 / 22%);
    border: 1px solid rgb(96 165 250 / 16%);
    border-radius: 9999px;
    box-shadow: 0 0 0 1px rgb(59 130 246 / 6%) inset;
    transition:
      border-color var(--duration-fast, 150ms) var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      background-color var(--duration-fast, 150ms) var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      box-shadow var(--duration-normal, 250ms) var(--ease-out, cubic-bezier(0, 0, 0.2, 1));
  }

  .tab-btn:hover {
    color: var(--text-mid);
    border-color: rgb(0 212 170 / 40%);
    box-shadow:
      0 10px 26px rgb(0 0 0 / 44%),
      0 0 0 1px rgb(0 212 170 / 14%),
      0 0 60px rgb(0 212 170 / 8%);
  }

  .tab-btn.active {
    color: var(--teal);
    background: rgb(0 212 170 / 12%);
    border-color: rgb(0 212 170 / 44%);
    box-shadow:
      0 0 0 1px rgb(0 212 170 / 14%) inset,
      0 10px 30px rgb(0 212 170 / 10%);
  }

  /* ── Toggle Group ────────────────────────────────────────────── */
  .toggle-group {
    display: flex;
    padding: 2px;
    overflow: hidden;
    background: rgb(0 0 0 / 20%);
    border: 1px solid rgb(96 165 250 / 18%);
    border-radius: 9999px;
    box-shadow:
      0 0 0 1px rgb(59 130 246 / 6%) inset,
      0 10px 28px rgb(0 0 0 / 38%);
  }

  .tgl {
    padding: 5px 12px;
    font-size: 11px;
    color: var(--text-dim);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 9999px;
    transition:
      background-color var(--duration-fast, 150ms) var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      color var(--duration-fast, 150ms) var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      box-shadow var(--duration-normal, 250ms) var(--ease-out, cubic-bezier(0, 0, 0.2, 1));
  }

  .tgl:last-child {
    border-right: none;
  }

  .tgl:hover {
    color: var(--text-mid);
    box-shadow: 0 0 0 1px rgb(0 212 170 / 14%) inset;
  }

  .tgl.active {
    color: var(--teal);
    background: rgb(0 212 170 / 12%);
    box-shadow:
      0 0 0 1px rgb(0 212 170 / 14%) inset,
      0 10px 28px rgb(0 212 170 / 10%);
  }

  .echart-map,
  .echart-top10,
  .echart-trend {
    border-radius: 14px;
  }

  /* ── Data Table ──────────────────────────────────────────────── */
  .dtable {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .dtable thead th {
    padding: 0 0 8px;
    font-size: 11px;
    font-weight: 400;
    color: var(--text-dim);
    white-space: nowrap;
    border-bottom: 1px solid var(--border);
  }

  .dtable tbody td {
    padding: 7px 0;
    color: var(--text);
    white-space: nowrap;
    border-bottom: 1px solid var(--border);
  }

  .dtable tbody tr:last-child td {
    border-bottom: none;
  }

  .dtable .pname {
    color: var(--text);
  }

  .dtable .tr {
    padding-right: 4px;
    text-align: right;
  }

  .total-row td {
    padding-top: 8px !important;
    font-size: 12px;
    border-top: 1px solid var(--border-2) !important;
  }

  .ecpm-platform-art-table :deep(.el-table) {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-row-hover-bg-color: rgb(96 165 250 / 8%);
    --el-table-header-bg-color: #131d2f;
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text);
    --el-table-header-text-color: var(--text-dim);
  }

  @media (prefers-reduced-motion: reduce) {
    .card {
      transition: none;
    }

    .card:hover {
      box-shadow:
        0 16px 52px rgb(0 0 0 / 56%),
        0 0 0 1px rgb(96 165 250 / 16%),
        inset 0 1px 0 rgb(186 230 253 / 14%),
        0 0 56px rgb(59 130 246 / 12%),
        0 0 44px rgb(34 211 238 / 8%),
        0 0 110px rgb(34 211 238 / 10%);
    }

    .tab-btn {
      transition: none;
    }

    .tab-btn:hover {
      box-shadow:
        0 10px 26px rgb(0 0 0 / 44%),
        0 0 0 1px rgb(0 212 170 / 14%),
        0 0 60px rgb(0 212 170 / 8%);
    }

    .tgl {
      transition: none;
    }

    .tgl:hover {
      box-shadow: 0 0 0 1px rgb(0 212 170 / 14%) inset;
    }
  }

  .ecpm-platform-art-table :deep(.el-table th.el-table__cell) {
    padding: 0 10px 8px;
    font-size: 11px;
    font-weight: 400;
    white-space: nowrap;
    border-bottom: 1px solid var(--border);
  }

  .ecpm-platform-art-table :deep(.el-table td.el-table__cell) {
    padding: 7px 10px;
    white-space: nowrap;
    border-bottom: 1px solid var(--border);
  }

  .ecpm-platform-art-table :deep(.el-table .platform-total-row td.el-table__cell) {
    padding-top: 8px;
    font-size: 12px;
    border-top: 1px solid var(--border-2);
  }

  .fw6 {
    font-weight: 600;
  }

  .app-name-cell {
    display: flex;
    gap: 6px;
    align-items: center;
    color: var(--text);
  }

  .app-icon-box {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 13px;
    background: var(--bg-card-2);
    border-radius: 4px;
  }

  /* ── Alert Bar ───────────────────────────────────────────────── */
  .alert-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 9px 12px;
    font-size: 12px;
    line-height: 1.4;
    color: #e0b860;
    background: rgb(245 166 35 / 10%);
    border: 1px solid rgb(245 166 35 / 25%);
    border-radius: 6px;
  }

  .alert-icon {
    flex-shrink: 0;
    font-size: 14px;
    color: var(--orange);
  }

  /* ── Ad Slot Bars ────────────────────────────────────────────── */
  .adslot-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .adslot-row {
    display: grid;
    grid-template-columns: 100px 1fr 38px;
    gap: 8px;
    align-items: center;
  }

  .slot-name {
    overflow: hidden;
    font-size: 11px;
    color: var(--text-mid);
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .slot-track {
    height: 8px;
    overflow: hidden;
    background: rgb(255 255 255 / 4%);
    border-radius: 2px;
  }

  .slot-bar {
    height: 100%;
    border-radius: 2px;
    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .slot-val {
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    color: var(--text);
    text-align: right;
  }

  /* ── Responsive ──────────────────────────────────────────────── */
  @media (width <= 1280px) {
    .main-grid {
      grid-template-columns: 1fr 1fr;
    }

    .col-right {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-column: 1 / -1;
      gap: 10px;
    }

    .alert-bar {
      grid-column: 1 / -1;
    }
  }

  @media (width <= 900px) {
    .main-grid {
      grid-template-columns: 1fr;
    }

    .kpi-row {
      grid-template-columns: 1fr 1fr;
    }

    .col-right {
      grid-template-columns: 1fr;
    }
  }
</style>
