<template>
  <div class="ad-performance-table">
    <ElCard class="ad-performance-table__card" shadow="never">
      <div class="ad-performance-table__header">
        <div class="ad-performance-table__title">广告系列明细</div>

        <div class="ad-performance-table__header-row">
          <ElTabs
            :model-value="activeTab"
            class="ad-performance-table__tabs"
            @update:model-value="onActiveTabUpdate"
          >
            <ElTabPane
              v-for="tab in tableTabs"
              :key="tab.value"
              :name="tab.value"
              :label="tab.label"
            />
          </ElTabs>
          <div class="ad-performance-table__actions">
            <div class="ad-performance-table__searchbar">
              <ElInput
                :model-value="tableKeyword"
                :placeholder="tr('adPerformance.searchPlaceholder', '搜索')"
                clearable
                class="ad-performance-table__search"
                @update:model-value="emit('update:tableKeyword', $event)"
                @keyup.enter="onKeywordEnter"
              >
                <template #prefix>
                  <ElIcon><Search /></ElIcon>
                </template>
              </ElInput>

              <ElButton
                class="ad-performance-table__filter-btn"
                round
                text
                aria-label="高级筛选"
                @click="onFilter"
              >
                <ElIcon aria-hidden="true"><Filter /></ElIcon>
              </ElButton>

              <ElButton class="ad-performance-table__custom-btn" round @click="onCustomColumns">
                {{ tr('adPerformance.customColumns', '自定义列') }}
              </ElButton>
            </div>
          </div>
        </div>
      </div>
      <div v-loading="props.loading" class="ad-performance-table__body">
        <!-- component :is + KeepAlive 是 Vue 3 官方支持的缓存模式；v-if/else-if 在 slot 变空时 KeepAlive 无法正确缓存 -->
        <KeepAlive>
          <component
            :is="activeTabComp"
            :rows="activeTabRows"
            v-bind="activeTabExtraProps"
            :keyword="tableKeyword"
            ref="activeTabRef"
            @detail="onDetail"
          />
        </KeepAlive>
      </div>
      <div class="ad-performance-table__footer">
        <div v-if="activeTab === 'owner'" class="ad-performance-table__summary">
          <span class="ad-performance-table__summary-title">团队汇总:</span>
          <span class="ad-performance-table__summary-item">
            总花费
            <b>{{ formatMoney(props.ownerTeamSummary.totalSpend) }}</b>
          </span>
          <span class="ad-performance-table__summary-item">
            平均CPI
            <b>{{ formatMoney(props.ownerTeamSummary.avgCpi) }}</b>
          </span>
          <span
            v-if="props.ownerTeamSummary.avgRoi1 != null"
            class="ad-performance-table__summary-item"
          >
            平均首日ROI
            <b>{{ props.ownerTeamSummary.avgRoi1 }}%</b>
          </span>
          <span
            v-if="props.ownerTeamSummary.avgCvr != null"
            class="ad-performance-table__summary-item"
          >
            平均转化率
            <b>{{ props.ownerTeamSummary.avgCvr }}%</b>
          </span>
          <span class="ad-performance-table__summary-item">
            预估利润
            <b class="ap-profit" :class="profitClass(props.ownerTeamSummary.estimatedProfit)">
              <span
                class="ap-profit__tip"
                :class="[
                  profitClass(props.ownerTeamSummary.estimatedProfit),
                  trendClass(props.ownerTeamSummary.estimatedProfit)
                ]"
                aria-hidden="true"
              >
                <span class="ap-profit__arrow"></span>
              </span>
              <span class="ap-profit__value">
                {{ props.ownerTeamSummary.estimatedProfit >= 0 ? '+' : ''
                }}{{ formatMoney(props.ownerTeamSummary.estimatedProfit) }}
              </span>
            </b>
          </span>
        </div>
        <div v-else-if="activeTab === 'account'" class="ad-performance-table__summary">
          <span class="ad-performance-table__summary-title">账户汇总:</span>
          <span class="ad-performance-table__summary-item">
            总花费
            <b>{{ formatMoney(props.accountSummary.totalSpend) }}</b>
          </span>
          <span class="ad-performance-table__summary-item">
            平均CPI
            <b>{{ formatMoney(props.accountSummary.avgCpi) }}</b>
          </span>
          <span class="ad-performance-table__summary-item">
            低余额账户
            <b>{{ props.accountSummary.lowBalanceAccountCount }}</b>
            个
          </span>
          <span class="ad-performance-table__summary-item">
            超预算账户
            <b>{{ props.accountSummary.overBudgetAccountCount }}</b>
            个
          </span>
          <span class="ad-performance-table__summary-item">
            预估利润
            <b class="ap-profit" :class="profitClass(props.accountSummary.estimatedProfit)">
              <span
                class="ap-profit__tip"
                :class="[
                  profitClass(props.accountSummary.estimatedProfit),
                  trendClass(props.accountSummary.estimatedProfit)
                ]"
                aria-hidden="true"
              >
                <span class="ap-profit__arrow"></span>
              </span>
              <span class="ap-profit__value">
                {{ props.accountSummary.estimatedProfit >= 0 ? '+' : ''
                }}{{ formatMoney(props.accountSummary.estimatedProfit) }}
              </span>
            </b>
          </span>
        </div>
        <span class="ad-performance-table__total">{{ totalText }}</span>
        <ElPagination
          :current-page="props.pagination.current"
          :page-size="props.pagination.size"
          :total="props.pagination.total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, prev, pager, next, sizes, jumper"
          small
          background
          @size-change="onSizeChange"
          @current-change="onCurrentChange"
        />
      </div>
    </ElCard>

    <ElDrawer
      v-model="drawerVisible"
      :size="drawerSize"
      :with-header="false"
      :append-to-body="true"
      class="ad-performance__global-drawer"
    >
      <div class="ad-performance-drawer__shell">
        <div
          v-if="drawerTab === 'campaign' && drawerCampaignRow"
          class="ad-performance-drawer__content"
          v-loading="drawerDetailLoading"
        >
          <AdPerformanceDetailDrawer
            :campaign-row="drawerCampaignRow"
            :detail="drawerCampaignDetail"
            @close="drawerVisible = false"
            @data-mutated="emit('data-mutated')"
          />
        </div>

        <div v-else class="ad-performance-drawer__content">
          <div class="ad-performance-detail__header">
            <div class="ad-performance-detail__title">{{ drawerTitle }}</div>
            <ElButton
              text
              round
              class="ad-performance-detail__close"
              @click="drawerVisible = false"
            >
              关闭
            </ElButton>
          </div>

          <div class="ad-performance-detail__body">
            <template v-if="drawerTab === 'country'">
              <div class="ad-performance-detail__grid">
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">国家</span>
                  <span class="ad-performance-detail__v">{{ drawerRowAny?.country }}</span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">广告支出</span>
                  <span class="ad-performance-detail__v">{{
                    formatMoney(drawerRowAny?.spend ?? 0)
                  }}</span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">支出占比</span>
                  <span class="ad-performance-detail__v"
                    >{{ drawerRowAny?.spendSharePercent }}%</span
                  >
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">CPI</span>
                  <span class="ad-performance-detail__v">{{
                    formatMoney(drawerRowAny?.cpi ?? 0)
                  }}</span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">点击率</span>
                  <span class="ad-performance-detail__v">{{ drawerRowAny?.ctr }}%</span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">转化率</span>
                  <span class="ad-performance-detail__v">{{ drawerRowAny?.cvr }}%</span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">ROI(1/3/7/累)</span>
                  <span class="ad-performance-detail__v">
                    {{ drawerRowAny?.roi1 }}% / {{ drawerRowAny?.roi3 }}% /
                    {{ drawerRowAny?.roi7 }}% / {{ drawerRowAny?.roiTotal }}%
                  </span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">预估利润</span>
                  <span
                    class="ad-performance-detail__v ap-profit"
                    :class="profitClass(drawerRowAny?.estimatedProfit ?? 0)"
                  >
                    <span
                      class="ap-profit__tip"
                      :class="[
                        profitClass(drawerRowAny?.estimatedProfit ?? 0),
                        trendClass(drawerRowAny?.estimatedProfit ?? 0)
                      ]"
                      aria-hidden="true"
                    >
                      <span class="ap-profit__arrow"></span>
                    </span>
                    <span class="ap-profit__value">
                      {{ (drawerRowAny?.estimatedProfit ?? 0) >= 0 ? '+' : ''
                      }}{{ formatMoney(drawerRowAny?.estimatedProfit ?? 0) }}
                    </span>
                  </span>
                </div>
              </div>
            </template>

            <template v-else-if="drawerTab === 'owner'">
              <div class="ad-performance-detail__grid">
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">优化师</span>
                  <span class="ad-performance-detail__v">{{
                    drawerRowAny?.ownerName ?? drawerRowAny?.campaignName
                  }}</span>
                </div>
                <div v-if="drawerRowAny?.ownerName" class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">负责应用数</span>
                  <span class="ad-performance-detail__v">{{ drawerRowAny?.appCount }} 个</span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">广告支出</span>
                  <span class="ad-performance-detail__v">{{
                    formatMoney(drawerRowAny?.spend ?? 0)
                  }}</span>
                </div>
                <div v-if="drawerRowAny?.ownerName" class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">活跃系列数</span>
                  <span class="ad-performance-detail__v"
                    >{{ drawerRowAny?.activeCampaignCount }} 个</span
                  >
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">平均CPI</span>
                  <span class="ad-performance-detail__v">
                    {{ formatMoney(drawerRowAny?.avgCpi ?? drawerRowAny?.cpi ?? 0) }}
                  </span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">平均点击率</span>
                  <span class="ad-performance-detail__v"
                    >{{ drawerRowAny?.avgCtr ?? drawerRowAny?.ctr }}%</span
                  >
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">平均转化率</span>
                  <span class="ad-performance-detail__v"
                    >{{ drawerRowAny?.avgCvr ?? drawerRowAny?.cvr }}%</span
                  >
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">ROI(首日/7日)</span>
                  <span class="ad-performance-detail__v"
                    >{{ drawerRowAny?.roi1 }}% / {{ drawerRowAny?.roi7 }}%</span
                  >
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">预估利润</span>
                  <span
                    class="ad-performance-detail__v ap-profit"
                    :class="profitClass(drawerRowAny?.estimatedProfit ?? 0)"
                  >
                    <span
                      class="ap-profit__tip"
                      :class="[
                        profitClass(drawerRowAny?.estimatedProfit ?? 0),
                        trendClass(drawerRowAny?.estimatedProfit ?? 0)
                      ]"
                      aria-hidden="true"
                    >
                      <span class="ap-profit__arrow"></span>
                    </span>
                    <span class="ap-profit__value">
                      {{ (drawerRowAny?.estimatedProfit ?? 0) >= 0 ? '+' : ''
                      }}{{ formatMoney(drawerRowAny?.estimatedProfit ?? 0) }}
                    </span>
                  </span>
                </div>
              </div>
            </template>

            <template v-else-if="drawerTab === 'account'">
              <div class="ad-performance-detail__grid">
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">账户</span>
                  <span class="ad-performance-detail__v">
                    {{ drawerRowAny?.accountName ?? drawerRowAny?.campaignName }}
                  </span>
                </div>
                <div v-if="drawerRowAny?.accountName" class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">平台</span>
                  <span class="ad-performance-detail__v">{{ drawerRowAny?.platform }}</span>
                </div>
                <div
                  v-if="drawerRowAny?.accountName && drawerRowAny?.balance != null"
                  class="ad-performance-detail__item"
                >
                  <span class="ad-performance-detail__k">余额</span>
                  <span class="ad-performance-detail__v">{{
                    formatMoney(drawerRowAny.balance)
                  }}</span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">广告支出</span>
                  <span class="ad-performance-detail__v">{{
                    formatMoney(drawerRowAny?.spend ?? 0)
                  }}</span>
                </div>
                <div
                  v-if="drawerRowAny?.accountName && drawerRowAny?.budgetProgressPercent != null"
                  class="ad-performance-detail__item"
                >
                  <span class="ad-performance-detail__k">预算进度</span>
                  <span class="ad-performance-detail__v"
                    >{{ drawerRowAny.budgetProgressPercent }}%</span
                  >
                </div>
                <div
                  v-if="drawerRowAny?.accountName && drawerRowAny?.activeCampaignCount != null"
                  class="ad-performance-detail__item"
                >
                  <span class="ad-performance-detail__k">活跃系列数</span>
                  <span class="ad-performance-detail__v"
                    >{{ drawerRowAny.activeCampaignCount }} 个</span
                  >
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">平均CPI</span>
                  <span class="ad-performance-detail__v">
                    {{ formatMoney(drawerRowAny?.avgCpi ?? drawerRowAny?.cpi ?? 0) }}
                  </span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">平均点击率</span>
                  <span class="ad-performance-detail__v"
                    >{{ drawerRowAny?.avgCtr ?? drawerRowAny?.ctr }}%</span
                  >
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">平均转化率</span>
                  <span class="ad-performance-detail__v"
                    >{{ drawerRowAny?.avgCvr ?? drawerRowAny?.cvr }}%</span
                  >
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">ROI(首日/7日)</span>
                  <span class="ad-performance-detail__v"
                    >{{ drawerRowAny?.roi1 }}% / {{ drawerRowAny?.roi7 }}%</span
                  >
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">预估利润</span>
                  <span
                    class="ad-performance-detail__v ap-profit"
                    :class="profitClass(drawerRowAny?.estimatedProfit ?? 0)"
                  >
                    <span
                      class="ap-profit__tip"
                      :class="[
                        profitClass(drawerRowAny?.estimatedProfit ?? 0),
                        trendClass(drawerRowAny?.estimatedProfit ?? 0)
                      ]"
                      aria-hidden="true"
                    >
                      <span class="ap-profit__arrow"></span>
                    </span>
                    <span class="ap-profit__value">
                      {{ (drawerRowAny?.estimatedProfit ?? 0) >= 0 ? '+' : ''
                      }}{{ formatMoney(drawerRowAny?.estimatedProfit ?? 0) }}
                    </span>
                  </span>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="ad-performance-detail__grid">
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">系列</span>
                  <span class="ad-performance-detail__v">{{ drawerRowAny?.name }}</span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">应用</span>
                  <span class="ad-performance-detail__v">{{ drawerRowAny?.appName }}</span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">平台</span>
                  <span class="ad-performance-detail__v">{{ drawerRowAny?.channel }}</span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">国家</span>
                  <span class="ad-performance-detail__v">{{ drawerRowAny?.country }}</span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">花费/预算</span>
                  <span class="ad-performance-detail__v">
                    {{ formatMoney(drawerRowAny?.spend ?? 0) }}/{{
                      formatMoney(drawerRowAny?.budget ?? 0)
                    }}
                    ({{ drawerRowAny?.spendBudgetPercent }}%)
                  </span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">CPI / CTR / CVR</span>
                  <span class="ad-performance-detail__v">
                    {{ formatMoney(drawerRowAny?.cpi ?? 0) }} / {{ drawerRowAny?.ctr }}% /
                    {{ drawerRowAny?.cvr }}%
                  </span>
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">ROI(首日/7日)</span>
                  <span class="ad-performance-detail__v"
                    >{{ drawerRowAny?.roi1 }}% / {{ drawerRowAny?.roi7 }}%</span
                  >
                </div>
                <div class="ad-performance-detail__item">
                  <span class="ad-performance-detail__k">预估利润</span>
                  <span
                    class="ad-performance-detail__v ap-profit"
                    :class="profitClass(drawerRowAny?.estimatedProfit ?? 0)"
                  >
                    <span
                      class="ap-profit__tip"
                      :class="[
                        profitClass(drawerRowAny?.estimatedProfit ?? 0),
                        trendClass(drawerRowAny?.estimatedProfit ?? 0)
                      ]"
                      aria-hidden="true"
                    >
                      <span class="ap-profit__arrow"></span>
                    </span>
                    <span class="ap-profit__value">
                      {{ (drawerRowAny?.estimatedProfit ?? 0) >= 0 ? '+' : ''
                      }}{{ formatMoney(drawerRowAny?.estimatedProfit ?? 0) }}
                    </span>
                  </span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { Filter, Search } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { computed, onUnmounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { fetchAdPerformanceCampaignDetailDrawer } from '@/api/user-growth/ad-performance'
  import mittBus from '@/utils/sys/mittBus'
  import { trendClass } from '../utils/tab-utils'
  import CampaignTab from './table-tabs/campaign-tab.vue'
  import CountryTab from './table-tabs/country-tab.vue'
  import OwnerTab from './table-tabs/owner-tab.vue'
  import AccountTab from './table-tabs/account-tab.vue'
  import AdPerformanceDetailDrawer from './ad-performance-detail-drawer.vue'
  import type {
    AdPerformancePagination,
    AdPerformanceCampaignRow,
    AdPerformanceCountryRow,
    AdPerformanceOwnerRow,
    AdPerformanceAccountRow,
    OwnerTeamSummary,
    AccountSummary,
    AdPerformanceOwnerCampaignRow,
    AdPerformanceAccountCampaignRow,
    AdPerformanceCampaignDetail,
    AdPerformanceTableTab,
    CampaignRowStatus
  } from '../types'

  defineOptions({ name: 'AdPerformanceTable' })

  const { t, te } = useI18n()
  const tr = (key: string, fallback: string) => (te(key) ? t(key) : fallback)

  const props = withDefaults(
    defineProps<{
      activeTab: AdPerformanceTableTab
      tableKeyword: string
      /** 与主筛选日期同步，用于抽屉详情请求 */
      filterStartDate: string
      filterEndDate: string
      campaignRows: AdPerformanceCampaignRow[]
      countryRows: AdPerformanceCountryRow[]
      ownerRows: AdPerformanceOwnerRow[]
      ownerTeamSummary: OwnerTeamSummary
      accountRows: AdPerformanceAccountRow[]
      accountSummary: AccountSummary
      loading?: boolean
      pagination: AdPerformancePagination
    }>(),
    {
      campaignRows: () => [],
      countryRows: () => [],
      ownerRows: () => [],
      accountRows: () => [],
      ownerTeamSummary: () =>
        ({
          totalSpend: 0,
          avgCpi: 0,
          estimatedProfit: 0
        }) as OwnerTeamSummary,
      accountSummary: () =>
        ({
          totalSpend: 0,
          avgCpi: 0,
          lowBalanceAccountCount: 0,
          overBudgetAccountCount: 0,
          estimatedProfit: 0
        }) as AccountSummary,
      loading: false
    }
  )

  const emit = defineEmits<{
    (e: 'pagination:current-change', page: number): void
    (e: 'pagination:size-change', size: number): void
    (e: 'update:activeTab', tab: AdPerformanceTableTab): void
    (e: 'update:tableKeyword', v: string): void
    (e: 'keyword-search'): void
    (e: 'data-mutated'): void
  }>()

  function onActiveTabUpdate(tab: string | number) {
    emit('update:activeTab', tab as AdPerformanceTableTab)
  }

  const activeTabRef = ref<{ openCustomColumns: () => void } | null>(null)

  const drawerCampaignDetail = ref<AdPerformanceCampaignDetail | null>(null)
  const drawerDetailLoading = ref(false)

  const drawerVisible = ref(false)
  const drawerTab = ref<'campaign' | 'country' | 'owner' | 'account'>('campaign')
  type DrawerRow =
    | AdPerformanceCampaignRow
    | AdPerformanceCountryRow
    | AdPerformanceOwnerRow
    | AdPerformanceOwnerCampaignRow
    | AdPerformanceAccountRow
    | AdPerformanceAccountCampaignRow
    | null
  const drawerRow = ref<DrawerRow>(null)

  /** 抽屉内多 Tab 行结构不同，避免联合类型在模板中报缺失字段 */
  const drawerRowAny = computed(() => drawerRow.value as Record<string, any> | null)

  const onCloseOverlays = () => {
    drawerVisible.value = false
  }

  mittBus.on('closeOverlays', onCloseOverlays)
  onUnmounted(() => {
    mittBus.off('closeOverlays', onCloseOverlays)
  })

  const drawerCampaignRow = computed(() => {
    if (drawerTab.value !== 'campaign') return null
    const row = drawerRow.value
    return row && (row as AdPerformanceCampaignRow).name !== undefined
      ? (row as AdPerformanceCampaignRow)
      : null
  })

  const drawerTitle = computed(() => {
    if (drawerTab.value === 'country') return '国家地区详情'
    if (drawerTab.value === 'owner') return '优化师详情'
    if (drawerTab.value === 'account') return '广告账户详情'
    return '广告系列详情'
  })

  const drawerSize = computed(() => (drawerTab.value === 'campaign' ? '860px' : '520px'))

  const tableTabs = [
    { value: 'campaign', label: '按广告系列' },
    { value: 'country', label: '按国家地区' },
    { value: 'owner', label: '按优化师' },
    { value: 'account', label: '按广告账户' }
  ] as const

  watch(
    () => [props.pagination.total, props.pagination.size],
    () => {
      const maxPage = Math.max(1, Math.ceil(props.pagination.total / props.pagination.size))
      if (props.pagination.current > maxPage) {
        emit('pagination:current-change', maxPage)
      }
    }
  )

  function formatMoney(n: number) {
    const abs = Math.abs(n)
    const digits: 0 | 2 = abs > 0 && abs < 100 ? 2 : 0
    return (
      '$' +
      n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    )
  }

  function profitClass(profit: number): string {
    return profit >= 0 ? 'ad-performance-table__profit--up' : 'ad-performance-table__profit--down'
  }

  function onKeywordEnter() {
    emit('keyword-search')
  }

  function onCustomColumns() {
    activeTabRef.value?.openCustomColumns()
  }

  const activeTabComp = computed(() => {
    if (props.activeTab === 'campaign') return CampaignTab
    if (props.activeTab === 'country') return CountryTab
    if (props.activeTab === 'owner') return OwnerTab
    return AccountTab
  })

  const activeTabRows = computed(() => {
    if (props.activeTab === 'campaign') return campaignParentRows.value
    if (props.activeTab === 'country') return props.countryRows
    if (props.activeTab === 'owner') return props.ownerRows
    return props.accountRows
  })

  // --- 广告系列 Tab：子行懒加载（父行剥离 children，子行存 Map） ---
  const campaignChildrenMap = computed(() => {
    const map = new Map<string, AdPerformanceCampaignRow[]>()
    for (const row of props.campaignRows ?? []) {
      if (row.children?.length) map.set(row.id, row.children)
    }
    return map
  })

  const campaignParentRows = computed((): AdPerformanceCampaignRow[] => {
    return (props.campaignRows ?? []).map((row) => {
      // 父行 children 不预先传入，减少初始渲染/patch 负担；展开时由 ElTable lazy/load 注入
      const rest = { ...(row as any) } as Record<string, any>
      delete rest.children
      const hasChildren =
        (row as any).hasChildren === true ||
        (campaignChildrenMap.value.get(row.id)?.length ?? 0) > 0
      return (hasChildren ? { ...rest, hasChildren: true } : rest) as AdPerformanceCampaignRow
    })
  })

  const campaignIdByName = computed(() => {
    const map = new Map<string, string>()
    for (const row of props.campaignRows ?? []) {
      const name = String(row.name ?? '').trim()
      const campaignId = String(row.campaignId ?? '').trim()
      if (name && campaignId) map.set(name, campaignId)
    }
    return map
  })

  function resolveCampaignIdFromRow(
    row: AdPerformanceCampaignRow | AdPerformanceOwnerRow | AdPerformanceAccountRow
  ) {
    const directCampaignId = String((row as { campaignId?: string | null }).campaignId ?? '').trim()
    if (directCampaignId) return directCampaignId
    const campaignName =
      'campaignName' in row
        ? String(row.campaignName ?? '').trim()
        : 'name' in row
          ? String(row.name ?? '').trim()
          : ''
    if (!campaignName) return ''
    return campaignIdByName.value.get(campaignName) ?? ''
  }

  const activeTabExtraProps = computed(() => {
    if (props.activeTab !== 'campaign') return {}
    return { childrenMap: campaignChildrenMap.value }
  })

  function onDetail(row: unknown) {
    if (props.activeTab === 'campaign') onDetailCampaign(row as AdPerformanceCampaignRow)
    else if (props.activeTab === 'country')
      onDetailCountry(row as AdPerformanceCountryRow | AdPerformanceCampaignRow)
    else if (props.activeTab === 'owner')
      onDetailOwner(row as AdPerformanceOwnerRow | AdPerformanceOwnerCampaignRow)
    else onDetailAccount(row as AdPerformanceAccountRow | AdPerformanceAccountCampaignRow)
  }

  function onFilter() {
    // 占位：筛选弹窗/抽屉
  }

  const totalText = computed(() => {
    if (props.activeTab === 'country') return `共 ${props.countryRows.length} 个国家`
    if (props.activeTab === 'owner') return `共 ${props.ownerRows.length} 位优化师`
    if (props.activeTab === 'account') return `共 ${props.accountRows.length} 个账户`
    return `共 ${props.pagination.total} 条`
  })

  function isCampaignTableRow(row: unknown): row is AdPerformanceCampaignRow {
    return (
      typeof row === 'object' &&
      row !== null &&
      'name' in row &&
      (row as AdPerformanceCampaignRow).name !== undefined
    )
  }

  function treeChildToCampaignRow(
    row: AdPerformanceOwnerRow | AdPerformanceAccountRow
  ): AdPerformanceCampaignRow {
    const campaignId = resolveCampaignIdFromRow(row)
    const id = campaignId !== '' ? campaignId : row.id
    return {
      id,
      campaignId: campaignId || undefined,
      appName: '',
      name: row.campaignName ?? '',
      channel: row.channel ?? '',
      country: row.country ?? '',
      status: (row.status as CampaignRowStatus) ?? 'active',
      spend: row.spend ?? 0,
      budget: 0,
      spendBudgetPercent: 0,
      cpi: row.cpi ?? 0,
      ctr: row.ctr ?? 0,
      cvr: row.cvr ?? 0,
      roi1: row.roi1 ?? 0,
      roi7: row.roi7 ?? 0,
      estimatedProfit: row.estimatedProfit ?? 0
    }
  }

  async function onDetailCampaign(
    row: AdPerformanceCampaignRow | AdPerformanceOwnerRow | AdPerformanceAccountRow
  ) {
    const campaignRow: AdPerformanceCampaignRow = isCampaignTableRow(row)
      ? row
      : treeChildToCampaignRow(row)
    const campaignId = resolveCampaignIdFromRow(row)
    if (campaignId === '') {
      ElMessage.warning('缺少 campaignId，无法打开系列详情')
      return
    }

    drawerTab.value = 'campaign'
    drawerRow.value = campaignRow
    drawerVisible.value = true
    drawerCampaignDetail.value = null
    drawerDetailLoading.value = true
    try {
      drawerCampaignDetail.value = await fetchAdPerformanceCampaignDetailDrawer({
        campaignId,
        startDate: props.filterStartDate,
        endDate: props.filterEndDate
      })
    } catch {
      ElMessage.error('加载系列详情失败')
    } finally {
      drawerDetailLoading.value = false
    }
  }

  /**
   * 按国家地区：一级为国家汇总（无系列 name）；二级子行结构与「按广告系列」一致，应打开系列详情抽屉。
   * 不能仅用 spendSharePercent 判断汇总行：接口可能在子行也带该字段，需与 isCampaignTableRow 组合判断。
   */
  function onDetailCountry(row: AdPerformanceCountryRow | AdPerformanceCampaignRow) {
    if (isCampaignTableRow(row)) {
      void onDetailCampaign(row)
      return
    }
    drawerTab.value = 'country'
    drawerRow.value = row
    drawerVisible.value = true
  }

  function isOwnerAggregateRow(row: AdPerformanceOwnerRow) {
    return row.ownerName != null && String(row.ownerName).trim() !== ''
  }

  function isAccountAggregateRow(row: AdPerformanceAccountRow) {
    return row.accountName != null && String(row.accountName).trim() !== ''
  }

  function onDetailOwner(row: AdPerformanceOwnerRow | AdPerformanceOwnerCampaignRow) {
    if (!isOwnerAggregateRow(row)) {
      void onDetailCampaign(row)
      return
    }
    drawerTab.value = 'owner'
    drawerRow.value = row
    drawerVisible.value = true
  }

  function onDetailAccount(row: AdPerformanceAccountRow | AdPerformanceAccountCampaignRow) {
    if (!isAccountAggregateRow(row)) {
      void onDetailCampaign(row)
      return
    }
    drawerTab.value = 'account'
    drawerRow.value = row
    drawerVisible.value = true
  }

  function onCurrentChange(page: number) {
    emit('pagination:current-change', page)
  }

  function onSizeChange(size: number) {
    emit('pagination:size-change', size)
  }
</script>

<style scoped lang="scss">
  @use '../styles/ap-card-fx.scss' as *;

  .ad-performance-table {
    margin-bottom: 16px;
  }

  .ad-performance-table__card {
    @include ap-neon-bg;
    @include ap-panel-hover;

    position: relative;
    overflow: hidden;
    border-radius: 14px;

    --el-card-bg-color: transparent;

    :deep(.el-card__body) {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      padding: 16px;
      background: transparent;
    }
  }

  .ad-performance-table__header {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;

    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }

    :deep(.el-tabs__active-bar) {
      display: none;
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }

    :deep(.el-tabs__nav-scroll) {
      overflow: visible;
    }

    :deep(.el-tabs__nav-wrap) {
      width: fit-content;
      padding: 4px;
      background: color-mix(in srgb, var(--default-box-color) 75%, transparent);
      border: 1px solid color-mix(in srgb, var(--art-success) 35%, var(--default-border));
      border-radius: 9999px;
    }

    :deep(.el-tabs__item) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 108px;
      height: 32px;
      padding: 0 24px;
      line-height: 32px;
      border: none;
      border-radius: 9999px;
      transition:
        background-color 0.15s ease,
        color 0.15s ease,
        box-shadow 0.15s ease;
    }

    :deep(.el-tabs__nav > .el-tabs__item:nth-child(2)) {
      padding-right: 24px !important;
      padding-left: 24px !important;
    }

    :deep(.el-tabs__item:last-child) {
      padding-right: 24px !important;
      padding-left: 24px !important;
    }

    :deep(.el-tabs__item:not(.is-active):hover) {
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 12%, transparent);
    }

    :deep(.el-tabs__item.is-active) {
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 18%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--art-success) 45%, transparent) inset;
    }
  }

  .ad-performance-table__header-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
  }

  .ad-performance-table__tabs {
    flex: 0 0 auto;
    min-width: 0;
    padding: 0 8px;
  }

  .ad-performance-table__title {
    display: inline-block;
    flex: 0 0 auto;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.02em;
    background-color: transparent;
    background-image: linear-gradient(92deg, #f0f9ff 0%, #7dd3fc 30%, #22d3ee 62%, #34d399 100%);
    -webkit-background-clip: text;
    background-clip: text;
    background-size: 100%;
    -webkit-text-fill-color: transparent;
  }

  .ad-performance-table__actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .ad-performance-table__searchbar {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 6px 10px;
    background: transparent;
    border-radius: 9999px;
  }

  .ad-performance-table__search {
    width: 220px;

    :deep(.el-input__wrapper) {
      padding-right: 10px;
      padding-left: 10px;
      background: color-mix(in srgb, var(--default-box-color) 88%, transparent);
      border: 1px solid color-mix(in srgb, var(--art-success) 55%, transparent);
      border-radius: 9999px;
      box-shadow: none;
    }

    :deep(.el-input__inner) {
      color: var(--el-text-color-primary);
      caret-color: var(--art-success);
    }

    :deep(.el-input__prefix) {
      color: var(--art-success);
    }

    :deep(.el-input__suffix) {
      color: var(--art-success);
    }

    :deep(.el-input__wrapper:hover) {
      background: color-mix(in srgb, var(--art-success) 10%, transparent);
      border-color: color-mix(in srgb, var(--art-success) 75%, transparent);
    }

    :deep(.el-input__wrapper.is-focus) {
      background: color-mix(in srgb, var(--art-success) 12%, transparent);
      border-color: var(--art-success);
      box-shadow: 0 0 0 1px var(--art-success) inset !important;
    }
  }

  .ad-performance-table__filter-btn {
    width: 34px;
    height: 34px;
    padding: 0;
    color: var(--art-success);
    touch-action: manipulation;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--art-success) 55%, transparent);

    &:hover {
      background: color-mix(in srgb, var(--art-success) 10%, transparent);
      border-color: color-mix(in srgb, var(--art-success) 45%, transparent);
    }
  }

  .ad-performance-table__custom-btn {
    color: var(--art-success);
    touch-action: manipulation;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--art-success) 55%, transparent);

    &:hover {
      background: color-mix(in srgb, var(--art-success) 12%, transparent);
      border-color: color-mix(in srgb, var(--art-success) 75%, transparent);
    }
  }

  .ad-performance-table__custom-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .ad-performance-table__custom-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 16px;
    max-height: 360px;
    padding-right: 4px;
    overflow: auto;
  }

  .ad-performance-table__body {
    flex: 1;
    min-height: 180px;
    overflow: hidden;
  }

  .ad-performance-table__el-table {
    min-width: 1200px;
  }

  .ad-performance-table__dim {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .ad-performance-table__dim-main {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ad-performance-table__app-icon {
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
    background: color-mix(in srgb, var(--row-accent) 28%, var(--default-border));
    border-radius: 6px;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--row-accent) 40%, transparent) inset;
  }

  .ad-performance-table__badge {
    flex: 0 0 auto;
    height: 16px;
    padding: 0 6px;
    font-size: 11px;
    font-weight: 700;
    line-height: 16px;
    color: var(--el-text-color-secondary);
    background: color-mix(in srgb, var(--default-border) 60%, transparent);
    border-radius: 6px;
  }

  .ad-performance-table__muted {
    color: var(--el-text-color-secondary);
  }

  .ad-performance-table__channel-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 12px;
    font-weight: 800;
    color: var(--el-text-color-primary);
    background: color-mix(in srgb, var(--row-accent) 18%, transparent);
    border-radius: 6px;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--row-accent) 45%, transparent) inset;
  }

  .ad-performance-table__country {
    font-size: 16px;
    line-height: 1;
  }

  :deep(.el-table__row.is-level-campaign) {
    background: color-mix(in srgb, var(--default-box-color) 86%, var(--row-accent) 14%);
  }

  :deep(.el-table__row.is-level-adgroup) {
    background: color-mix(in srgb, var(--default-box-color) 92%, var(--row-accent) 8%);
  }

  :deep(.el-table__row.is-level-adgroup td:first-child .cell::before) {
    position: absolute;
    top: 6px;
    bottom: 6px;
    left: 6px;
    width: 4px;
    content: '';
    background: var(--row-accent);
    border-radius: 9999px;
  }

  :deep(.el-table__body td:first-child .cell) {
    position: relative;
    display: flex;
    gap: 6px;
    align-items: center;
  }

  :deep(.el-table__expand-icon) {
    display: inline-flex;
    flex: 0 0 16px;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: transparent;
  }

  :deep(.el-table__expand-icon .el-icon),
  :deep(.el-table__expand-icon i) {
    display: none !important;
  }

  :deep(.el-table__expand-icon::before) {
    display: inline-block;
    width: 7px;
    height: 7px;
    content: '';
    border-top: 2px solid var(--el-text-color-secondary);
    border-right: 2px solid var(--el-text-color-secondary);
    transform: rotate(45deg);
  }

  :deep(.el-table__expand-icon--expanded::before),
  :deep(.el-table__expand-icon.is-expanded::before),
  :deep(.el-table__expand-icon[aria-expanded='true']::before) {
    width: 0 !important;
    height: 0 !important;
    border: none !important;
    border-top: 7px solid var(--el-text-color-secondary) !important;
    border-right: 6px solid transparent !important;
    border-left: 6px solid transparent !important;
    transform: rotate(-90deg) !important;
  }

  .ad-performance-table__percent {
    margin-left: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .ad-performance-table__roi--up {
    color: var(--art-success);
  }

  .ad-performance-table__roi--down {
    color: var(--art-danger);
  }

  .ad-performance-table__profit--up {
    color: var(--art-success);
  }

  .ad-performance-table__profit--down {
    color: var(--art-danger);
  }

  .ap-profit {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    justify-content: flex-end;
    white-space: nowrap;
  }

  .ap-profit__tip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 18px;
    padding: 0 6px;
    background: color-mix(in srgb, currentcolor 10%, transparent);
    border: 1px solid color-mix(in srgb, currentcolor 28%, transparent);
    border-radius: 9999px;
    box-shadow: 0 0 0 1px color-mix(in srgb, currentcolor 8%, transparent) inset;
  }

  .ap-profit__arrow {
    width: 0;
    height: 0;
    opacity: 0.95;
  }

  .ap-profit__tip.is-trend-up .ap-profit__arrow {
    border-right: 5px solid transparent;
    border-bottom: 7px solid currentcolor;
    border-left: 5px solid transparent;
  }

  .ap-profit__tip.is-trend-down .ap-profit__arrow {
    border-top: 7px solid currentcolor;
    border-right: 5px solid transparent;
    border-left: 5px solid transparent;
  }

  .ap-profit__tip.is-trend-flat {
    display: none;
  }

  .ad-performance-table__footer {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    margin-top: 12px;
    border-top: 1px solid var(--default-border);
  }

  .ad-performance-table__total {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .ad-performance-table__summary {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 16px;
    align-items: center;
    min-width: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .ad-performance-table__summary-title {
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  .ad-performance-table__summary-item {
    display: inline-flex;
    gap: 6px;
    align-items: baseline;
    white-space: nowrap;

    b {
      font-weight: 700;
      color: var(--el-text-color-primary);
    }

    b.ad-performance-table__profit--up {
      color: var(--art-success);
    }

    b.ad-performance-table__profit--down {
      color: var(--art-danger);
    }
  }

  .ad-performance-table__progress-cell {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-start;
  }

  .ad-performance-table__progress-bg {
    width: 110px;
    height: 8px;
    overflow: hidden;
    background: color-mix(in srgb, var(--default-border) 70%, transparent);
    border-radius: 9999px;
  }

  .ad-performance-table__progress-fill {
    height: 100%;
    background: var(--art-success);
    border-radius: 9999px;
  }

  .ad-performance-table__progress-fill--teal {
    background: color-mix(in srgb, var(--art-success) 80%, #22c55e);
  }

  .ad-performance-table__progress-fill--success {
    background: var(--art-success);
  }

  .ad-performance-table__progress-fill--warning {
    background: var(--art-warning);
  }

  .ad-performance-table__progress-fill--danger {
    background: var(--art-danger);
  }

  .ad-performance-table__progress-text {
    width: 44px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    text-align: left;
  }

  .ad-performance-detail__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 12px;
    border-bottom: 1px solid var(--default-border);
  }

  .ad-performance-detail__title {
    font-size: 16px;
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  .ad-performance-detail__close {
    color: var(--el-text-color-secondary);
  }

  .ad-performance-detail__body {
    flex: 1;
    min-height: 0;
    padding: 16px;
    overflow: auto;
  }

  /* 抽屉内容较多时：禁止 Drawer 自身滚动，滚动仅发生在内部内容盒子 */
  :global(.ad-performance__global-drawer .el-drawer),
  :global(.ad-performance__global-drawer .el-drawer__body) {
    overflow: hidden;
  }

  :global(.ad-performance__global-drawer .el-drawer__body) {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
  }

  .ad-performance-drawer__shell {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  .ad-performance-drawer__content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  .ad-performance-detail__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .ad-performance-detail__item {
    display: flex;
    gap: 12px;
    align-items: baseline;
    justify-content: space-between;
    padding: 12px;
    background: color-mix(in srgb, var(--default-box-color) 88%, transparent);
    border: 1px solid color-mix(in srgb, var(--default-border) 65%, transparent);
    border-radius: 10px;
  }

  .ad-performance-detail__k {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  .ad-performance-detail__v {
    font-size: 13px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    text-align: right;
    word-break: break-word;
  }

  @media (width <= 768px) {
    .ad-performance-table__header-row {
      flex-direction: column;
      align-items: stretch;
    }

    .ad-performance-table__search {
      width: 100%;
    }

    .ad-performance-table__searchbar {
      flex-wrap: wrap;
      padding: 4px 0;
    }

    .ad-performance-table__body {
      max-height: 50vh;
    }

    :deep(.el-tabs__item) {
      min-width: 72px !important;
      padding: 0 12px !important;
      font-size: 13px;
    }

    :deep(.el-tabs__nav > .el-tabs__item:nth-child(2)),
    :deep(.el-tabs__item:last-child) {
      padding-right: 12px !important;
      padding-left: 12px !important;
    }

    :deep(.el-drawer) {
      width: 100% !important;
    }
  }

  @media (width <= 480px) {
    :deep(.el-tabs__nav-wrap) {
      overflow-x: auto;
    }
  }
</style>
