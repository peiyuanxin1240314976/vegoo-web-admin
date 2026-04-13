<template>
  <div class="br-root">
    <div class="br-page-fx" aria-hidden="true"></div>
    <!-- ─────────────────────────────── TOP HEADER ────────────── -->
    <header class="br-header">
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
        <span class="compare-mode-label">对比模式</span>
        <button
          :class="['toggle-pill', { active: compareMode }]"
          @click="compareMode = !compareMode"
        >
          <span class="toggle-knob" />
        </button>

        <button class="header-btn lark-btn" @click="openLarkModal">
          <span class="lark-icon">✈</span> 飞书推送
        </button>
        <button class="header-btn export-btn"> <span>↑</span> 导出 </button>
      </div>
    </header>

    <!-- ──────────────────────────── FILTER BAR ───────────────── -->
    <div class="filter-bar" :class="`filter-${activeTab}`">
      <template v-if="!compareMode">
        <div class="filter-group">
          <span class="filter-label">应用：</span>
          <ElSelect
            size="small"
            :popper-class="brFilterSelectPopperClass"
            class="br-filter-el-select br-filter-el-select--app"
            :model-value="barAppValues"
            multiple
            collapse-tags
            :max-collapse-tags="1"
            placeholder="全部应用"
            @update:model-value="onBarAppUpdate"
          >
            <ElOption
              v-for="opt in appBarOptions"
              :key="opt.value === '' ? '__all_app__' : opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>

        <div class="filter-group">
          <span class="filter-label">平台：</span>
          <ElSelect
            size="small"
            :popper-class="brFilterSelectPopperClass"
            class="br-filter-el-select br-filter-el-select--platform"
            :model-value="barPlatformValues"
            multiple
            collapse-tags
            :max-collapse-tags="1"
            placeholder="全部平台"
            @update:model-value="onBarPlatformUpdate"
          >
            <ElOption
              v-for="opt in platformBarOptions"
              :key="opt.value === '' ? '__all_plat__' : opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>

        <div class="filter-group filter-group--tab">
          <template v-if="activeTab === 'adPlatform'">
            <span class="filter-label">广告平台：</span>
            <ElSelect
              size="small"
              :popper-class="brFilterSelectPopperClass"
              class="br-filter-el-select br-filter-el-select--source"
              :model-value="barSourceValues"
              multiple
              collapse-tags
              :max-collapse-tags="1"
              placeholder="全部广告平台"
              @update:model-value="onBarSourceUpdate"
            >
              <ElOption
                v-for="opt in sourceBarOptions"
                :key="opt.value === '' ? '__all_src__' : opt.value"
                :label="opt.label"
                :value="opt.value"
              >
                <span class="br-source-opt">
                  <span
                    v-if="opt.value !== ''"
                    class="ap-dot"
                    :style="{ background: sourceAccentColor(opt) }"
                  />
                  {{ opt.label }}
                </span>
              </ElOption>
            </ElSelect>
          </template>
          <template v-else-if="activeTab === 'campaigns'">
            <span class="filter-label">广告平台：</span>
            <ElSelect
              size="small"
              :popper-class="brFilterSelectPopperClass"
              class="br-filter-el-select br-filter-el-select--source"
              :model-value="barSourceValues"
              multiple
              collapse-tags
              :max-collapse-tags="1"
              placeholder="全部广告平台"
              @update:model-value="onBarSourceUpdate"
            >
              <ElOption
                v-for="opt in sourceBarOptions"
                :key="opt.value === '' ? '__all_src__' : opt.value"
                :label="opt.label"
                :value="opt.value"
              >
                <span class="br-source-opt">
                  <span
                    v-if="opt.value !== ''"
                    class="ap-dot"
                    :style="{ background: sourceAccentColor(opt) }"
                  />
                  {{ opt.label }}
                </span>
              </ElOption>
            </ElSelect>
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
            <ElSelect
              size="small"
              :popper-class="brFilterSelectPopperClass"
              class="br-filter-el-select br-filter-el-select--country"
              :model-value="barCountryValues"
              multiple
              collapse-tags
              :max-collapse-tags="1"
              placeholder="全部国家"
              @update:model-value="onBarCountryUpdate"
            >
              <ElOption
                v-for="opt in countryBarOptions"
                :key="opt.value === '' ? '__all_cty__' : opt.value"
                :label="opt.label"
                :value="opt.value"
              >
                <span class="br-country-opt">
                  <span
                    v-if="countryFlagClass(opt.value)"
                    :class="countryFlagClass(opt.value)"
                    class="br-fi"
                  />
                  {{ opt.label }}
                </span>
              </ElOption>
            </ElSelect>
          </template>
          <template v-else-if="activeTab === 'byCountry'">
            <span class="filter-label">国家：</span>
            <ElSelect
              size="small"
              :popper-class="brFilterSelectPopperClass"
              class="br-filter-el-select br-filter-el-select--country"
              :model-value="barCountryValues"
              multiple
              collapse-tags
              :max-collapse-tags="1"
              placeholder="全部国家"
              @update:model-value="onBarCountryUpdate"
            >
              <ElOption
                v-for="opt in countryBarOptions"
                :key="opt.value === '' ? '__all_cty__' : opt.value"
                :label="opt.label"
                :value="opt.value"
              >
                <span class="br-country-opt">
                  <span
                    v-if="countryFlagClass(opt.value)"
                    :class="countryFlagClass(opt.value)"
                    class="br-fi"
                  />
                  {{ opt.label }}
                </span>
              </ElOption>
            </ElSelect>
          </template>
          <template v-else-if="activeTab === 'platformCountry'">
            <span class="filter-label">广告平台：</span>
            <ElSelect
              size="small"
              :popper-class="brFilterSelectPopperClass"
              class="br-filter-el-select br-filter-el-select--source"
              :model-value="barSourceValues"
              multiple
              collapse-tags
              :max-collapse-tags="1"
              placeholder="全部广告平台"
              @update:model-value="onBarSourceUpdate"
            >
              <ElOption
                v-for="opt in sourceBarOptions"
                :key="opt.value === '' ? '__all_src__' : opt.value"
                :label="opt.label"
                :value="opt.value"
              >
                <span class="br-source-opt">
                  <span
                    v-if="opt.value !== ''"
                    class="ap-dot"
                    :style="{ background: sourceAccentColor(opt) }"
                  />
                  {{ opt.label }}
                </span>
              </ElOption>
            </ElSelect>
            <span class="filter-label ml-8">国家：</span>
            <ElSelect
              size="small"
              :popper-class="brFilterSelectPopperClass"
              class="br-filter-el-select br-filter-el-select--country"
              :model-value="barCountryValues"
              multiple
              collapse-tags
              :max-collapse-tags="1"
              placeholder="全部国家"
              @update:model-value="onBarCountryUpdate"
            >
              <ElOption
                v-for="opt in countryBarOptions"
                :key="opt.value === '' ? '__all_cty__' : opt.value"
                :label="opt.label"
                :value="opt.value"
              >
                <span class="br-country-opt">
                  <span
                    v-if="countryFlagClass(opt.value)"
                    :class="countryFlagClass(opt.value)"
                    class="br-fi"
                  />
                  {{ opt.label }}
                </span>
              </ElOption>
            </ElSelect>
          </template>
          <template v-else>
            <span class="filter-label">广告平台：</span>
            <ElSelect
              size="small"
              :popper-class="brFilterSelectPopperClass"
              class="br-filter-el-select br-filter-el-select--source"
              :model-value="barSourceValues"
              multiple
              collapse-tags
              :max-collapse-tags="1"
              placeholder="全部广告平台"
              @update:model-value="onBarSourceUpdate"
            >
              <ElOption
                v-for="opt in sourceBarOptions"
                :key="opt.value === '' ? '__all_src__' : opt.value"
                :label="opt.label"
                :value="opt.value"
              >
                <span class="br-source-opt">
                  <span
                    v-if="opt.value !== ''"
                    class="ap-dot"
                    :style="{ background: sourceAccentColor(opt) }"
                  />
                  {{ opt.label }}
                </span>
              </ElOption>
            </ElSelect>
          </template>
        </div>
      </template>

      <template v-else>
        <div class="filter-group">
          <span class="filter-label">平台：</span>
          <ElSelect
            size="small"
            :popper-class="brFilterSelectPopperClass"
            class="br-filter-el-select br-filter-el-select--platform"
            :model-value="barPlatformValues"
            multiple
            collapse-tags
            :max-collapse-tags="1"
            placeholder="全部平台"
            @update:model-value="onBarPlatformUpdate"
          >
            <ElOption
              v-for="opt in platformBarOptions"
              :key="opt.value === '' ? '__all_plat__' : opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>
        <div class="filter-group">
          <span class="filter-label">广告平台：</span>
          <ElSelect
            size="small"
            :popper-class="brFilterSelectPopperClass"
            class="br-filter-el-select br-filter-el-select--source"
            :model-value="barSourceValues"
            multiple
            collapse-tags
            :max-collapse-tags="1"
            placeholder="全部广告平台"
            @update:model-value="onBarSourceUpdate"
          >
            <ElOption
              v-for="opt in sourceBarOptions"
              :key="opt.value === '' ? '__all_src__' : opt.value"
              :label="opt.label"
              :value="opt.value"
            >
              <span class="br-source-opt">
                <span
                  v-if="opt.value !== ''"
                  class="ap-dot"
                  :style="{ background: sourceAccentColor(opt) }"
                />
                {{ opt.label }}
              </span>
            </ElOption>
          </ElSelect>
        </div>
      </template>

      <div class="date-nav">
        <ElDatePicker
          v-if="period === 'daily'"
          v-model="reportDayYmd"
          type="date"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          placeholder="选择日期"
          size="small"
          :clearable="false"
          class="br-date-picker br-date-picker--daily"
          :popper-class="brDatePickerPopperClass"
        />
        <template v-else-if="period === 'weekly'">
          <div class="br-week-picker-shell">
            <span class="br-week-picker-shell__label">{{ weekRangeDash }}</span>
            <ElDatePicker
              v-model="reportWeekStartYmd"
              type="week"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              placeholder="选择周"
              size="small"
              :clearable="false"
              class="br-date-picker br-date-picker--week-shell"
              :popper-class="brDatePickerPopperClass"
            />
          </div>
        </template>
        <ElDatePicker
          v-else
          v-model="reportMonthYm"
          type="month"
          value-format="YYYY-MM"
          format="YYYY-MM"
          placeholder="选择月份"
          size="small"
          :clearable="false"
          class="br-date-picker br-date-picker--month"
          :popper-class="brDatePickerPopperClass"
        />
      </div>

      <div class="compare-toggle">
        <span class="compare-toggle-label">{{ compareLabelLeft }}</span>
        <button
          :class="['toggle-pill', 'small', { active: compareEnabled }]"
          @click="compareEnabled = !compareEnabled"
        >
          <span class="toggle-knob" />
        </button>
        <span v-if="compareEnabled" class="compare-date">对比：{{ comparePeriodText }}</span>
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
      <!-- Compare mode: no sidebar -->
      <template v-if="compareMode">
        <main v-loading="contentLoading" class="br-main br-main--compare">
          <MonthlyCompareMode
            :period="period"
            :start-date="reportRange.startDate"
            :end-date="reportRange.endDate"
            :compare-start-date="compareRange.startDate"
            :compare-end-date="compareRange.endDate"
          />
        </main>
      </template>

      <!-- Each period×tab combination has its own completely independent sidebar + content -->
      <template v-else>
        <aside v-loading="sidebarLoading" class="br-sidebar">
          <div class="sidebar-card">
            <AppSidebar
              :key="`${period}-${activeTab}`"
              :app-list="sidebarAppList"
              :selected-id="selectedAppId"
              :show-field="tabShowField"
              :tab="activeTab"
              :period="period"
              @select="selectApp"
              @compare-mode="compareMode = true"
            />
          </div>
        </aside>
        <main v-loading="contentLoading" class="br-main">
          <!-- ── daily ─────────────────────────────────────────── -->
          <DailySummary v-if="contentKey === 'daily-summary'" />
          <DailyAdPlatform v-else-if="contentKey === 'daily-adPlatform'" />
          <DailyByCountry v-else-if="contentKey === 'daily-byCountry'" />
          <DailyPlatformCountry v-else-if="contentKey === 'daily-platformCountry'" />
          <DailyCampaigns v-else-if="contentKey === 'daily-campaigns'" />

          <!-- ── weekly ────────────────────────────────────────── -->
          <WeeklySummary v-else-if="contentKey === 'weekly-summary'" />
          <WeeklyAdPlatform v-else-if="contentKey === 'weekly-adPlatform'" />
          <WeeklyByCountry v-else-if="contentKey === 'weekly-byCountry'" />
          <WeeklyPlatformCountry v-else-if="contentKey === 'weekly-platformCountry'" />
          <WeeklyCampaigns v-else-if="contentKey === 'weekly-campaigns'" />

          <!-- ── monthly ───────────────────────────────────────── -->
          <MonthlySummary v-else-if="contentKey === 'monthly-summary'" />
          <MonthlyAdPlatform v-else-if="contentKey === 'monthly-adPlatform'" />
          <MonthlyByCountry v-else-if="contentKey === 'monthly-byCountry'" />
          <MonthlyPlatformCountry v-else-if="contentKey === 'monthly-platformCountry'" />
          <MonthlyCampaigns v-else-if="contentKey === 'monthly-campaigns'" />
        </main>
      </template>
    </div>

    <LarkPushModal
      :visible="showLarkModal"
      :model-value="larkConfig"
      :saving="larkSaving"
      :pushing="larkPushing"
      @close="showLarkModal = false"
      @save="handleLarkSave"
      @push="handleLarkPushNow"
    />

    <Transition name="fade">
      <div v-if="switching" class="page-transition" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import 'flag-icons/css/flag-icons.min.css'
  import { storeToRefs } from 'pinia'
  import { ref, computed, provide, watch, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
  import type { CockpitMetaOptionItem } from '@/types/cockpit-meta-filter'
  import type {
    AppListItem,
    ReportPeriod,
    ReportQueryParams,
    ReportAppListQueryParams,
    ReportTopBarFilterArrays,
    ReportTab,
    SummaryResponse,
    AdPlatformResponse,
    ByCountryResponse,
    PlatformCountryResponse,
    CampaignsResponse,
    LarkPushConfig
  } from './types'
  import { businessReportContextKey } from './composables/business-report-context'
  import {
    getReportAppList,
    getSummary,
    getAdPlatform,
    getByCountry,
    getPlatformCountry,
    getCampaigns,
    getLarkConfig,
    saveLarkConfig,
    pushReportNow
  } from './reportService'

  import AppSidebar from './components/AppSidebar.vue'
  import LarkPushModal from './components/LarkPushModal.vue'

  import DailySummary from './components/DailySummary.vue'
  import DailyAdPlatform from './components/DailyAdPlatform.vue'
  import DailyByCountry from './components/DailyByCountry.vue'
  import DailyPlatformCountry from './components/DailyPlatformCountry.vue'
  import DailyCampaigns from './components/DailyCampaigns.vue'

  import WeeklySummary from './components/WeeklySummary.vue'
  import WeeklyAdPlatform from './components/WeeklyAdPlatform.vue'
  import WeeklyByCountry from './components/WeeklyByCountry.vue'
  import WeeklyPlatformCountry from './components/WeeklyPlatformCountry.vue'
  import WeeklyCampaigns from './components/WeeklyCampaigns.vue'

  import MonthlySummary from './components/MonthlySummary.vue'
  import MonthlyAdPlatform from './components/MonthlyAdPlatform.vue'
  import MonthlyByCountry from './components/MonthlyByCountry.vue'
  import MonthlyPlatformCountry from './components/MonthlyPlatformCountry.vue'
  import MonthlyCampaigns from './components/MonthlyCampaigns.vue'
  import MonthlyCompareMode from './components/MonthlyCompareMode.vue'

  defineOptions({ name: 'BusinessReport' })

  const metaStore = useCockpitMetaFilterStore()
  const { data: cockpitMeta } = storeToRefs(metaStore)

  function fallbackMetaOptions(label: string): CockpitMetaOptionItem[] {
    return [{ label, value: '' }]
  }

  const appBarOptions = computed(() => {
    const list = cockpitMeta.value?.appOptions
    return list?.length ? list : fallbackMetaOptions('全部应用')
  })
  const platformBarOptions = computed(() => {
    const list = cockpitMeta.value?.platformOptions
    return list?.length ? list : fallbackMetaOptions('全部平台')
  })
  const sourceBarOptions = computed(() => {
    const list = cockpitMeta.value?.sourceOptions
    return list?.length ? list : fallbackMetaOptions('全部广告平台')
  })
  const countryBarOptions = computed(() => {
    const list = cockpitMeta.value?.countryOptions
    return list?.length ? list : fallbackMetaOptions('全部国家')
  })

  /**
   * 空数组 [] 表示不限，对应后端全局数据。
   * meta「全部」项 value 为 ''；仅选全部、清空、或在已选具体项时再选全部 → 均归一为 []。
   */
  function normalizeMetaMulti(prev: string[], next: string[]): string[] {
    if (next.length === 0) return []
    const nonAll = next.filter((v) => v !== '')
    const hasAllToken = next.includes('')
    const prevWasGlobal = prev.length === 0
    if (nonAll.length === 0) return []
    if (hasAllToken && nonAll.length > 0) {
      if (prevWasGlobal) return nonAll
      return []
    }
    return nonAll
  }

  const barAppValues = ref<string[]>([])
  const barPlatformValues = ref<string[]>([])
  const barSourceValues = ref<string[]>([])
  const barCountryValues = ref<string[]>([])

  /** 顶栏多选 → 与报告 POST 体 `filterAppIds` / `*List` 一致；空数组表示不限 */
  const topBarFilters = computed<ReportTopBarFilterArrays>(() => ({
    filterAppIds: [...barAppValues.value],
    platformList: [...barPlatformValues.value],
    sourceList: [...barSourceValues.value],
    countryCodeList: [...barCountryValues.value]
  }))

  function onBarAppUpdate(v: string[]) {
    barAppValues.value = normalizeMetaMulti([...barAppValues.value], v)
  }
  function onBarPlatformUpdate(v: string[]) {
    barPlatformValues.value = normalizeMetaMulti([...barPlatformValues.value], v)
  }
  function onBarSourceUpdate(v: string[]) {
    barSourceValues.value = normalizeMetaMulti([...barSourceValues.value], v)
  }
  function onBarCountryUpdate(v: string[]) {
    barCountryValues.value = normalizeMetaMulti([...barCountryValues.value], v)
  }

  const SOURCE_DOT_BY_VALUE: Record<string, string> = {
    '1': '#4285F4',
    '2': '#1877F2',
    '3': '#222C37',
    '4': '#6C3AD6',
    '5': '#00A3E0',
    '6': '#FF6B6B',
    '7': '#000000'
  }

  function sourceAccentColor(opt: CockpitMetaOptionItem): string {
    if (opt.value && SOURCE_DOT_BY_VALUE[opt.value]) return SOURCE_DOT_BY_VALUE[opt.value]
    const lb = opt.label.toLowerCase()
    if (lb.includes('google')) return '#4285F4'
    if (lb.includes('facebook') || lb.includes('meta')) return '#1877F2'
    if (lb.includes('unity')) return '#222C37'
    if (lb.includes('applovin')) return '#6C3AD6'
    if (lb.includes('ironsource')) return '#00A3E0'
    if (lb.includes('tiktok') || lb.includes('pangle')) return '#010101'
    if (lb.includes('snap')) return '#FFFC00'
    if (lb.includes('mintegral')) return '#E8770E'
    return 'rgb(255 255 255 / 35%)'
  }

  function countryFlagClass(value: string): string | null {
    if (!value || value.length !== 2) return null
    let c = value.toLowerCase()
    if (c === 'uk') c = 'gb'
    if (!/^[a-z]{2}$/.test(c)) return null
    return `fi fi-${c}`
  }

  function formatLarkPushAtText(input?: string): string | null {
    if (!input) return null
    // 后端可能直接返回展示文本，优先原样展示
    if (!/^\d{4}-\d{2}-\d{2}T/.test(input)) return input
    const date = new Date(input)
    if (Number.isNaN(date.getTime())) return input
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes()
    ).padStart(2, '0')}`
  }

  function reportName(periodKey: ReportPeriod): string {
    return periodKey === 'daily' ? '日报' : periodKey === 'weekly' ? '周报' : '月报'
  }

  async function ensureLarkConfigLoaded() {
    if (larkConfig.value || larkLoading.value) return
    larkLoading.value = true
    try {
      larkConfig.value = await getLarkConfig()
    } catch (error) {
      console.error('[BusinessReport] getLarkConfig(silent)', error)
    } finally {
      larkLoading.value = false
    }
  }

  function getLastPushText(periodKey: ReportPeriod): string {
    const pushAt = formatLarkPushAtText(larkConfig.value?.lastPushAt) ?? '--'
    const target = larkConfig.value?.lastPushTarget || `经营${reportName(periodKey)}`
    return `上次推送：${pushAt} 飞书群《${target}》`
  }

  onMounted(() => {
    void metaStore.ensureLoaded()
    void ensureLarkConfigLoaded()
  })

  const brFilterSelectPopperClass = 'br-filter-el-select__popper'
  const brDatePickerPopperClass = 'br-date-picker__popper'

  function parseYmdLocal(ymd: string): Date {
    const [y, m, d] = ymd.split('-').map((x) => Number(x))
    return new Date(y, m - 1, d, 12, 0, 0, 0)
  }

  function addDays(d: Date, n: number): Date {
    const x = cloneAppDate(d)
    x.setDate(x.getDate() + n)
    return x
  }

  /** 自然周：周一至周日（与「当周周一～周日」口径一致） */
  function mondayOfWeekContaining(d: Date): Date {
    const c = cloneAppDate(d)
    c.setHours(12, 0, 0, 0)
    const wd = c.getDay()
    const diff = wd === 0 ? -6 : 1 - wd
    c.setDate(c.getDate() + diff)
    c.setHours(0, 0, 0, 0)
    return c
  }

  function normalizeWeekStartYmd(ymd: string): string {
    return formatYYYYMMDD(mondayOfWeekContaining(parseYmdLocal(ymd)))
  }

  function prevMonthYm(ym: string): string {
    const [y, m] = ym.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  const appAnchorDate = getAppNow()
  const period = ref<ReportPeriod>('daily')
  const reportDayYmd = ref(formatYYYYMMDD(appAnchorDate))
  const reportWeekStartYmd = ref(formatYYYYMMDD(mondayOfWeekContaining(appAnchorDate)))
  const reportMonthYm = ref(formatYYYYMMDD(appAnchorDate).slice(0, 7))

  const weekRangeDash = computed(() => {
    const ws = parseYmdLocal(reportWeekStartYmd.value)
    const we = addDays(ws, 6)
    return `${formatYYYYMMDD(ws)} - ${formatYYYYMMDD(we)}`
  })

  watch(reportWeekStartYmd, (v) => {
    if (!v) return
    const n = normalizeWeekStartYmd(v)
    if (n !== v) reportWeekStartYmd.value = n
  })

  function syncReportDatesWhenPeriodChanges(next: ReportPeriod) {
    const cur = period.value
    if (next === 'daily') {
      if (cur === 'weekly') {
        reportDayYmd.value = formatYYYYMMDD(parseYmdLocal(reportWeekStartYmd.value))
      } else if (cur === 'monthly') {
        reportDayYmd.value = `${reportMonthYm.value}-01`
      }
    } else if (next === 'weekly') {
      if (cur === 'daily') {
        reportWeekStartYmd.value = normalizeWeekStartYmd(reportDayYmd.value)
      } else if (cur === 'monthly') {
        reportWeekStartYmd.value = normalizeWeekStartYmd(`${reportMonthYm.value}-01`)
      }
    } else if (next === 'monthly') {
      if (cur === 'daily') {
        reportMonthYm.value = reportDayYmd.value.slice(0, 7)
      } else if (cur === 'weekly') {
        reportMonthYm.value = reportWeekStartYmd.value.slice(0, 7)
      }
    }
  }

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
    syncReportDatesWhenPeriodChanges(p)
    period.value = p
    compareMode.value = false
    activeTab.value = 'summary'
    switching.value = false
  }

  function switchTab(tab: ReportTab) {
    activeTab.value = tab
  }

  // const showBackBtn = computed(() => activeTab.value !== 'summary')
  // function handleBack() {
  //   activeTab.value = 'summary'
  // }

  const campaignStatuses = ['在投中', '已暂停', '全部']
  const activeStatus = ref('在投中')

  const compareEnabled = ref(true)
  const compareLabelLeft = computed(() =>
    period.value === 'monthly' ? '对比上月' : period.value === 'weekly' ? '对比上周' : '对比昨日'
  )

  /** 对比期文案：随当前所选日/周/月实时变化（格式 YYYY-MM-DD / 周区间 / YYYY-MM） */
  const comparePeriodText = computed(() => {
    if (!compareEnabled.value) return ''
    if (period.value === 'daily') {
      return formatYYYYMMDD(addDays(parseYmdLocal(reportDayYmd.value), -1))
    }
    if (period.value === 'weekly') {
      const ws = parseYmdLocal(reportWeekStartYmd.value)
      const pStart = addDays(ws, -7)
      const pEnd = addDays(pStart, 6)
      return `${formatYYYYMMDD(pStart)} - ${formatYYYYMMDD(pEnd)}`
    }
    return prevMonthYm(reportMonthYm.value)
  })

  // Per-tab independent app selection state: key = `${period}-${tab}`
  const selectedAppIds = ref<Record<string, string>>({})

  const selectedAppId = computed(
    () => selectedAppIds.value[`${period.value}-${activeTab.value}`] ?? 'overall'
  )

  function selectApp(id: string) {
    const key = `${period.value}-${activeTab.value}`
    if ((selectedAppIds.value[key] ?? 'overall') === id) return
    selectedAppIds.value[key] = id
    void refreshReportDetail()
  }

  // Composite key for independent period×tab right-side content
  const contentKey = computed(() => `${period.value}-${activeTab.value}`)

  const loading = ref(false)
  const summary = ref<SummaryResponse | null>(null)
  const adPlatform = ref<AdPlatformResponse | null>(null)
  const byCountry = ref<ByCountryResponse | null>(null)
  const platformCountry = ref<PlatformCountryResponse | null>(null)
  const campaigns = ref<CampaignsResponse | null>(null)

  /** 侧栏列表：仅由 app-list 接口更新，与右侧详情解耦 */
  const sidebarAppList = ref<AppListItem[]>([])
  const sidebarLoading = ref(false)

  // Each tab shows a different secondary metric in the sidebar
  const tabShowField = computed((): 'dau' | 'mau' | 'adSpend' => {
    if (activeTab.value === 'adPlatform' || activeTab.value === 'campaigns') return 'adSpend'
    if (period.value === 'monthly') return 'mau'
    return 'dau'
  })
  const showLarkModal = ref(false)
  const larkConfig = ref<LarkPushConfig | null>(null)
  const larkLoading = ref(false)
  const larkSaving = ref(false)
  const larkPushing = ref(false)

  async function openLarkModal() {
    showLarkModal.value = true
    try {
      await ensureLarkConfigLoaded()
    } catch (error) {
      ElMessage.error('加载飞书配置失败')
      console.error('[BusinessReport] getLarkConfig', error)
    }
  }

  async function handleLarkSave(config: LarkPushConfig) {
    larkSaving.value = true
    try {
      await saveLarkConfig(config)
      larkConfig.value = config
      ElMessage.success('推送配置已保存')
      showLarkModal.value = false
    } catch (error) {
      ElMessage.error('保存失败，请稍后重试')
      console.error('[BusinessReport] saveLarkConfig', error)
    } finally {
      larkSaving.value = false
    }
  }

  async function handleLarkPushNow(config: LarkPushConfig) {
    larkPushing.value = true
    try {
      await pushReportNow(config)
      const now = getAppNow()
      larkConfig.value = {
        ...config,
        lastPushAt: now.toISOString(),
        lastPushTarget: config.groups[0]?.name || `经营${reportName(period.value)}`
      }
      ElMessage.success('推送成功，已发送至飞书群')
      showLarkModal.value = false
    } catch (error) {
      ElMessage.error('推送失败，请稍后重试')
      console.error('[BusinessReport] pushReportNow', error)
    } finally {
      larkPushing.value = false
    }
  }

  provide('openPushModal', () => {
    void openLarkModal()
  })

  const reportRange = computed(() => {
    if (period.value === 'daily') {
      return { startDate: reportDayYmd.value, endDate: reportDayYmd.value }
    }
    if (period.value === 'weekly') {
      const ws = parseYmdLocal(reportWeekStartYmd.value)
      return {
        startDate: formatYYYYMMDD(ws),
        endDate: formatYYYYMMDD(addDays(ws, 6))
      }
    }
    return {
      startDate: `${reportMonthYm.value}-01`,
      endDate: formatYYYYMMDD(
        new Date(
          Number(reportMonthYm.value.slice(0, 4)),
          Number(reportMonthYm.value.slice(5, 7)),
          0
        )
      )
    }
  })

  const compareRange = computed(() => {
    if (period.value === 'daily') {
      const d = addDays(parseYmdLocal(reportDayYmd.value), -1)
      const ymd = formatYYYYMMDD(d)
      return { startDate: ymd, endDate: ymd }
    }
    if (period.value === 'weekly') {
      const ws = parseYmdLocal(reportWeekStartYmd.value)
      const pStart = addDays(ws, -7)
      return {
        startDate: formatYYYYMMDD(pStart),
        endDate: formatYYYYMMDD(addDays(pStart, 6))
      }
    }
    const cur = new Date(
      Number(reportMonthYm.value.slice(0, 4)),
      Number(reportMonthYm.value.slice(5, 7)) - 1,
      1
    )
    const prevStart = new Date(cur.getFullYear(), cur.getMonth() - 1, 1)
    const prevEnd = new Date(cur.getFullYear(), cur.getMonth(), 0)
    return {
      startDate: formatYYYYMMDD(prevStart),
      endDate: formatYYYYMMDD(prevEnd)
    }
  })

  provide(businessReportContextKey, {
    loading,
    period,
    reportRange,
    refreshReport: refreshReportDetail,
    getLastPushText,
    topBarFilters,
    sidebarAppList,
    summary,
    adPlatform,
    byCountry,
    platformCountry,
    campaigns
  })

  function buildSidebarParams(): ReportAppListQueryParams {
    return {
      period: period.value,
      startDate: reportRange.value.startDate,
      endDate: reportRange.value.endDate,
      tab: activeTab.value,
      account: '',
      ...topBarFilters.value
    }
  }

  function buildReportParams(): ReportQueryParams {
    const id = selectedAppId.value
    return {
      period: period.value,
      startDate: reportRange.value.startDate,
      endDate: reportRange.value.endDate,
      appId: id === 'overall' ? '' : id,
      account: '',
      ...topBarFilters.value
    }
  }

  let reportRequestSeq = 0
  let sidebarRequestSeq = 0

  async function refreshSidebarAppList(resetSelectionToOverall: boolean) {
    if (compareMode.value) return
    const seq = ++sidebarRequestSeq
    const selectionKey = `${period.value}-${activeTab.value}`
    const selectionAtStart = selectedAppIds.value[selectionKey] ?? 'overall'
    sidebarLoading.value = true
    try {
      const { items } = await getReportAppList(buildSidebarParams())
      if (seq !== sidebarRequestSeq) return
      sidebarAppList.value = items

      if (resetSelectionToOverall) {
        const current = selectedAppIds.value[selectionKey] ?? 'overall'
        if (current === selectionAtStart) {
          selectedAppIds.value[selectionKey] = 'overall'
        }
      }

      const ids = new Set(items.map((i) => i.id))
      let sel = selectedAppIds.value[selectionKey] ?? 'overall'
      if (!ids.has(sel)) {
        sel = ids.has('overall') ? 'overall' : (items[0]?.id ?? 'overall')
        selectedAppIds.value[selectionKey] = sel
      }

      await refreshReportDetail()
    } catch (e) {
      console.error('[BusinessReport] refreshSidebarAppList', e)
    } finally {
      if (seq === sidebarRequestSeq) sidebarLoading.value = false
    }
  }

  async function refreshReportDetail() {
    if (compareMode.value) return
    const seq = ++reportRequestSeq
    const params = buildReportParams()
    const tab = activeTab.value
    loading.value = true
    try {
      const sum = await getSummary(params)
      if (compareMode.value || seq !== reportRequestSeq) return
      summary.value = sum

      if (tab !== 'adPlatform') adPlatform.value = null
      if (tab !== 'byCountry') byCountry.value = null
      if (tab !== 'platformCountry') platformCountry.value = null
      if (tab !== 'campaigns') campaigns.value = null

      if (tab === 'adPlatform') {
        const r = await getAdPlatform(params)
        if (compareMode.value || seq !== reportRequestSeq) return
        adPlatform.value = r
      } else if (tab === 'byCountry') {
        const r = await getByCountry(params)
        if (compareMode.value || seq !== reportRequestSeq) return
        byCountry.value = r
      } else if (tab === 'platformCountry') {
        const r = await getPlatformCountry(params)
        if (compareMode.value || seq !== reportRequestSeq) return
        platformCountry.value = r
      } else if (tab === 'campaigns') {
        const r = await getCampaigns(params)
        if (compareMode.value || seq !== reportRequestSeq) return
        campaigns.value = r
      }
    } catch (e) {
      console.error('[BusinessReport] refreshReportDetail', e)
    } finally {
      if (seq === reportRequestSeq) loading.value = false
    }
  }

  watch(
    [
      period,
      activeTab,
      reportDayYmd,
      reportWeekStartYmd,
      reportMonthYm,
      barAppValues,
      barPlatformValues,
      barSourceValues,
      barCountryValues
    ],
    (now, prev) => {
      if (compareMode.value) return
      const first = !prev
      const onlyTabChanged =
        !first &&
        now[0] === prev![0] &&
        now[1] !== prev![1] &&
        now[2] === prev![2] &&
        now[3] === prev![3] &&
        now[4] === prev![4] &&
        now[5] === prev![5] &&
        now[6] === prev![6] &&
        now[7] === prev![7] &&
        now[8] === prev![8]
      void refreshSidebarAppList(!onlyTabChanged)
    },
    { deep: true, immediate: true }
  )

  watch(compareMode, (on) => {
    if (!on) void refreshSidebarAppList(true)
  })

  const contentLoading = computed(() => loading.value)
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
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    overflow-x: clip;
    color: var(--rp-text);
    background: var(--rp-bg);
    isolation: isolate;
  }

  .br-root::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(
        ellipse 70% 50% at 6% 6%,
        color-mix(in srgb, var(--art-success) 32%, transparent) 0%,
        transparent 58%
      ),
      radial-gradient(
        ellipse 55% 42% at 94% 8%,
        color-mix(in srgb, var(--art-primary) 34%, transparent) 0%,
        transparent 58%
      ),
      radial-gradient(
        ellipse 40% 35% at 48% 16%,
        color-mix(in srgb, var(--art-warning) 12%, transparent) 0%,
        transparent 55%
      );
    mask-image: linear-gradient(to bottom, black 0%, black 32%, transparent 62%);
    animation: br-aurora-drift 14s ease-in-out infinite alternate;
  }

  .br-root::after {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background-image:
      linear-gradient(color-mix(in srgb, var(--art-primary) 6%, transparent) 1px, transparent 1px),
      linear-gradient(
        90deg,
        color-mix(in srgb, var(--art-primary) 6%, transparent) 1px,
        transparent 1px
      );
    background-size: 40px 40px;
    mask-image: linear-gradient(to bottom, black 0%, black 22%, transparent 48%);
  }

  .br-page-fx {
    position: absolute;
    inset: -12% -12% 52%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      color-mix(in srgb, var(--art-primary) 11%, transparent) 55deg,
      color-mix(in srgb, var(--art-success) 7%, transparent) 200deg,
      transparent 285deg,
      color-mix(in srgb, var(--art-warning) 7%, transparent) 330deg,
      transparent 360deg
    );
    opacity: 0.8;
    mask-image: linear-gradient(to bottom, black 0%, black 46%, transparent 82%);
    animation: br-fx-spin 52s linear infinite;
    will-change: transform;
  }

  @keyframes br-aurora-drift {
    0% {
      opacity: 0.72;
      transform: scale(1) translate(0, 0);
    }

    100% {
      opacity: 1;
      transform: scale(1.04) translate(1%, -0.8%);
    }
  }

  @keyframes br-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .br-root > *:not(.br-page-fx) {
    position: relative;
    z-index: 1;
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
    min-width: 0;
    min-height: 0;
  }

  .br-sidebar {
    flex-shrink: 0;
    align-self: flex-start;
    width: 340px;
    padding: 16px 0 16px 16px;
  }

  .sidebar-card {
    display: flex;
    flex-direction: column;
    min-height: 0;
    max-height: calc(100vh - 190px);
    overflow: hidden;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .br-main {
    flex: 1;
    min-width: 0;
    padding: 16px 20px;
    overflow-x: hidden;
  }

  /* Compare mode: fixed viewport height, internal panels scroll */
  .br-main--compare {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 142px); /* 52px header + 46px filter + 44px tab-nav */
    overflow: hidden;
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

  @media (prefers-reduced-motion: reduce) {
    .br-root::before {
      animation: none;
    }

    .br-page-fx {
      animation: none;
    }
  }
</style>

<style scoped lang="scss">
  .filter-group--tab {
    flex: 1;
    flex-wrap: wrap;
    min-width: 0;
  }

  .br-filter-el-select {
    min-width: 118px;
  }

  .br-filter-el-select--app {
    min-width: 100px;
    max-width: 120px;
  }

  .br-filter-el-select--source {
    min-width: 110px;
    max-width: 130px;
  }

  .br-filter-el-select--country {
    min-width: 110px;
    max-width: 130px;
  }

  :deep(.br-filter-el-select) {
    --el-input-focus-border-color: #00d4a1;
    --el-border-color-hover: rgb(0 212 161 / 45%);
    --el-color-primary: #00d4a1;
    --el-border-color-focus: #00d4a1;

    vertical-align: middle;
  }

  :deep(.br-filter-el-select .el-input__wrapper) {
    min-height: 28px;
    padding: 2px 8px;
    font-size: 12px;
    background: rgb(255 255 255 / 6%);
    border: 1px solid var(--rp-border);
    border-radius: 6px;
    box-shadow: none;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  :deep(.br-filter-el-select .el-input__inner) {
    font-size: 12px;
    color: var(--rp-text);
  }

  :deep(.br-filter-el-select .el-select__caret) {
    color: rgb(255 255 255 / 35%);
  }

  :deep(.br-filter-el-select .el-input__wrapper.is-focus) {
    border-color: var(--rp-accent);
    box-shadow: 0 0 0 1px rgb(0 212 161 / 22%);
  }

  :deep(.br-filter-el-select .el-input__wrapper:hover) {
    border-color: rgb(255 255 255 / 14%);
  }

  :deep(.br-filter-el-select .el-tag) {
    height: 20px;
    padding: 0 6px;
    font-size: 11px;
    line-height: 18px;
    color: var(--rp-accent);
    background: rgb(0 212 161 / 12%);
    border-color: var(--rp-accent);
  }

  :deep(.br-filter-el-select .el-tag .el-tag__close) {
    color: var(--rp-accent);
  }

  .br-source-opt,
  .br-country-opt {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .br-fi {
    flex-shrink: 0;
    width: 1.15em;
    line-height: 1;
    background-size: cover;
  }

  .br-date-picker {
    min-width: 120px;
  }

  .br-date-picker--daily {
    width: 148px;
  }

  .br-date-picker--month {
    width: 118px;
  }

  /** 周报：输入框内展示「周一～周日」整段区间，避免 week 类型只显示周一 */
  .br-week-picker-shell {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: min(100%, 268px);
    min-width: 220px;
    max-width: 268px;
  }

  .br-week-picker-shell__label {
    position: absolute;
    top: 50%;
    right: 28px;
    left: 10px;
    z-index: 2;
    overflow: hidden;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    line-height: 1.25;
    color: var(--rp-text);
    text-overflow: ellipsis;
    white-space: nowrap;
    pointer-events: none;
    transform: translateY(-50%);
  }

  .br-week-picker-shell :deep(.br-date-picker--week-shell) {
    width: 100%;
  }

  .br-week-picker-shell :deep(.br-date-picker--week-shell .el-input__wrapper) {
    width: 100%;
    padding-right: 28px;
    padding-left: 10px;
  }

  .br-week-picker-shell :deep(.br-date-picker--week-shell .el-input__inner) {
    color: transparent !important;
    text-shadow: none;
    caret-color: transparent;
  }

  .br-week-picker-shell :deep(.br-date-picker--week-shell .el-input__inner::placeholder) {
    color: transparent;
  }

  :deep(.br-date-picker .el-input__wrapper) {
    padding: 2px 10px;
    font-size: 12px;
    background: rgb(255 255 255 / 6%);
    border: 1px solid var(--rp-border);
    border-radius: 6px;
    box-shadow: none;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  :deep(.br-date-picker .el-input__inner) {
    font-size: 12px;
    color: var(--rp-text);
  }

  :deep(.br-date-picker .el-input__prefix-inner) {
    color: rgb(255 255 255 / 45%);
  }

  :deep(.br-date-picker .el-input__wrapper.is-focus) {
    border-color: var(--rp-accent);
    box-shadow: 0 0 0 1px rgb(0 212 161 / 22%);
  }

  :deep(.br-date-picker .el-input__wrapper:hover) {
    border-color: rgb(255 255 255 / 14%);
  }
</style>

<style lang="scss">
  .br-filter-el-select__popper.el-select__popper {
    background: #0d1529 !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;
  }

  .br-filter-el-select__popper .el-select-dropdown__item {
    height: auto;
    min-height: 30px;
    padding: 6px 12px;
    font-size: 12px;
    line-height: 1.3;
    color: rgb(255 255 255 / 88%);
  }

  .br-filter-el-select__popper .el-select-dropdown__item.is-hovering,
  .br-filter-el-select__popper .el-select-dropdown__item:hover {
    background: rgb(0 212 161 / 12%);
  }

  .br-filter-el-select__popper .el-select-dropdown__item.is-selected {
    font-weight: 600;
    color: #00d4a1;
  }

  .br-date-picker__popper.el-picker__popper {
    --el-datepicker-text-color: rgb(255 255 255 / 88%);
    --el-datepicker-off-text-color: rgb(255 255 255 / 32%);
    --el-datepicker-header-text-color: rgb(255 255 255 / 75%);
    --el-datepicker-bg-color: #0d1529;
    --el-datepicker-inner-border-color: rgb(255 255 255 / 10%);
    --el-datepicker-inrange-bg-color: rgb(0 212 161 / 12%);
    --el-datepicker-inrange-hover-bg-color: rgb(0 212 161 / 18%);
    --el-datepicker-active-color: #00d4a1;
    --el-datepicker-hover-text-color: #00d4a1;
    --el-datepicker-icon-color: rgb(255 255 255 / 45%);

    background: #0d1529 !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;
  }
</style>
