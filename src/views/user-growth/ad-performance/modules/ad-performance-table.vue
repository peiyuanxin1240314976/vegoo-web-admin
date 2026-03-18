<template>
  <div class="ad-performance-table">
    <ElCard class="ad-performance-table__card" shadow="never">
      <div class="ad-performance-table__header">
        <div class="ad-performance-table__title">广告系列明细</div>

        <div class="ad-performance-table__header-row">
          <ElTabs v-model="activeTab" class="ad-performance-table__tabs">
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
                v-model="searchKeyword"
                :placeholder="tr('adPerformance.searchPlaceholder', '搜索')"
                clearable
                class="ad-performance-table__search"
                @keyup.enter="emitSearch"
              >
                <template #prefix>
                  <ElIcon><Search /></ElIcon>
                </template>
                <template #suffix>
                  <ElIcon><Search /></ElIcon>
                </template>
              </ElInput>

              <ElButton class="ad-performance-table__filter-btn" round text @click="onFilter">
                <ElIcon><Filter /></ElIcon>
              </ElButton>

              <ElButton class="ad-performance-table__custom-btn" round @click="onCustomColumns">
                {{ tr('adPerformance.customColumns', '自定义列') }}
              </ElButton>
            </div>
          </div>
        </div>
      </div>
      <div class="ad-performance-table__body">
        <CampaignTab
          v-if="activeTab === 'campaign'"
          :data="props.campaignRows"
          :keyword="searchKeyword"
          @detail="onDetailCampaign"
          ref="campaignTabRef"
        />
        <CountryTab
          v-else-if="activeTab === 'country'"
          :rows="props.countryRows"
          :keyword="searchKeyword"
          @detail="onDetailCountry"
          ref="countryTabRef"
        />
        <OwnerTab
          v-else-if="activeTab === 'owner'"
          :rows="props.ownerRows"
          :keyword="searchKeyword"
          @detail="onDetailOwner"
          ref="ownerTabRef"
        />
        <AccountTab
          v-else
          :rows="props.accountRows"
          :keyword="searchKeyword"
          @detail="onDetailAccount"
          ref="accountTabRef"
        />
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
          <span class="ad-performance-table__summary-item">
            平均首日ROI
            <b>{{ props.ownerTeamSummary.avgRoi1 }}%</b>
          </span>
          <span class="ad-performance-table__summary-item">
            平均转化率
            <b>{{ props.ownerTeamSummary.avgCvr }}%</b>
          </span>
          <span class="ad-performance-table__summary-item">
            预估利润
            <b :class="profitClass(props.ownerTeamSummary.estimatedProfit)">
              {{ props.ownerTeamSummary.estimatedProfit >= 0 ? '+' : '' }}
              {{ formatMoney(props.ownerTeamSummary.estimatedProfit) }}
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
            <b :class="profitClass(props.accountSummary.estimatedProfit)">
              {{ props.accountSummary.estimatedProfit >= 0 ? '+' : '' }}
              {{ formatMoney(props.accountSummary.estimatedProfit) }}
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

    <ElDrawer v-model="drawerVisible" :size="drawerSize" :with-header="false">
      <AdPerformanceDetailDrawer
        v-if="drawerTab === 'campaign' && drawerCampaignRow"
        :campaign-row="drawerCampaignRow"
        :detail="drawerCampaignDetail"
        @close="drawerVisible = false"
      />

      <template v-else>
        <div class="ad-performance-detail__header">
          <div class="ad-performance-detail__title">{{ drawerTitle }}</div>
          <ElButton text round class="ad-performance-detail__close" @click="drawerVisible = false">
            关闭
          </ElButton>
        </div>

        <div class="ad-performance-detail__body">
          <template v-if="drawerTab === 'country'">
            <div class="ad-performance-detail__grid">
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">国家</span>
                <span class="ad-performance-detail__v">{{ drawerRow?.country }}</span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">广告支出</span>
                <span class="ad-performance-detail__v">{{
                  formatMoney(drawerRow?.spend ?? 0)
                }}</span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">支出占比</span>
                <span class="ad-performance-detail__v">{{ drawerRow?.spendSharePercent }}%</span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">CPI</span>
                <span class="ad-performance-detail__v">{{ formatMoney(drawerRow?.cpi ?? 0) }}</span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">点击率</span>
                <span class="ad-performance-detail__v">{{ drawerRow?.ctr }}%</span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">转化率</span>
                <span class="ad-performance-detail__v">{{ drawerRow?.cvr }}%</span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">ROI(1/3/7/累)</span>
                <span class="ad-performance-detail__v">
                  {{ drawerRow?.roi1 }}% / {{ drawerRow?.roi3 }}% / {{ drawerRow?.roi7 }}% /
                  {{ drawerRow?.roiTotal }}%
                </span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">预估利润</span>
                <span
                  class="ad-performance-detail__v"
                  :class="profitClass(drawerRow?.estimatedProfit ?? 0)"
                >
                  {{ (drawerRow?.estimatedProfit ?? 0) >= 0 ? '+' : '' }}
                  {{ formatMoney(drawerRow?.estimatedProfit ?? 0) }}
                </span>
              </div>
            </div>
          </template>

          <template v-else-if="drawerTab === 'owner'">
            <div class="ad-performance-detail__grid">
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">投放师</span>
                <span class="ad-performance-detail__v">{{
                  drawerRow?.ownerName ?? drawerRow?.campaignName
                }}</span>
              </div>
              <div v-if="drawerRow?.ownerName" class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">负责应用数</span>
                <span class="ad-performance-detail__v">{{ drawerRow?.appCount }} 个</span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">广告支出</span>
                <span class="ad-performance-detail__v">{{
                  formatMoney(drawerRow?.spend ?? 0)
                }}</span>
              </div>
              <div v-if="drawerRow?.ownerName" class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">活跃系列数</span>
                <span class="ad-performance-detail__v"
                  >{{ drawerRow?.activeCampaignCount }} 个</span
                >
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">平均CPI</span>
                <span class="ad-performance-detail__v">
                  {{ formatMoney(drawerRow?.avgCpi ?? drawerRow?.cpi ?? 0) }}
                </span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">平均点击率</span>
                <span class="ad-performance-detail__v"
                  >{{ drawerRow?.avgCtr ?? drawerRow?.ctr }}%</span
                >
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">平均转化率</span>
                <span class="ad-performance-detail__v"
                  >{{ drawerRow?.avgCvr ?? drawerRow?.cvr }}%</span
                >
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">ROI(首日/7日)</span>
                <span class="ad-performance-detail__v"
                  >{{ drawerRow?.roi1 }}% / {{ drawerRow?.roi7 }}%</span
                >
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">预估利润</span>
                <span
                  class="ad-performance-detail__v"
                  :class="profitClass(drawerRow?.estimatedProfit ?? 0)"
                >
                  {{ (drawerRow?.estimatedProfit ?? 0) >= 0 ? '+' : '' }}
                  {{ formatMoney(drawerRow?.estimatedProfit ?? 0) }}
                </span>
              </div>
            </div>
          </template>

          <template v-else-if="drawerTab === 'account'">
            <div class="ad-performance-detail__grid">
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">账户</span>
                <span class="ad-performance-detail__v">
                  {{ drawerRow?.accountName ?? drawerRow?.campaignName }}
                </span>
              </div>
              <div v-if="drawerRow?.accountName" class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">平台</span>
                <span class="ad-performance-detail__v">{{ drawerRow?.platform }}</span>
              </div>
              <div v-if="drawerRow?.accountName" class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">余额</span>
                <span class="ad-performance-detail__v">{{
                  formatMoney(drawerRow?.balance ?? 0)
                }}</span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">广告支出</span>
                <span class="ad-performance-detail__v">{{
                  formatMoney(drawerRow?.spend ?? 0)
                }}</span>
              </div>
              <div v-if="drawerRow?.accountName" class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">预算进度</span>
                <span class="ad-performance-detail__v"
                  >{{ drawerRow?.budgetProgressPercent }}%</span
                >
              </div>
              <div v-if="drawerRow?.accountName" class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">活跃系列数</span>
                <span class="ad-performance-detail__v"
                  >{{ drawerRow?.activeCampaignCount }} 个</span
                >
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">平均CPI</span>
                <span class="ad-performance-detail__v">
                  {{ formatMoney(drawerRow?.avgCpi ?? drawerRow?.cpi ?? 0) }}
                </span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">平均点击率</span>
                <span class="ad-performance-detail__v"
                  >{{ drawerRow?.avgCtr ?? drawerRow?.ctr }}%</span
                >
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">平均转化率</span>
                <span class="ad-performance-detail__v"
                  >{{ drawerRow?.avgCvr ?? drawerRow?.cvr }}%</span
                >
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">ROI(首日/7日)</span>
                <span class="ad-performance-detail__v"
                  >{{ drawerRow?.roi1 }}% / {{ drawerRow?.roi7 }}%</span
                >
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">预估利润</span>
                <span
                  class="ad-performance-detail__v"
                  :class="profitClass(drawerRow?.estimatedProfit ?? 0)"
                >
                  {{ (drawerRow?.estimatedProfit ?? 0) >= 0 ? '+' : '' }}
                  {{ formatMoney(drawerRow?.estimatedProfit ?? 0) }}
                </span>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="ad-performance-detail__grid">
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">系列</span>
                <span class="ad-performance-detail__v">{{ drawerRow?.name }}</span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">应用</span>
                <span class="ad-performance-detail__v">{{ drawerRow?.appName }}</span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">平台</span>
                <span class="ad-performance-detail__v">{{ drawerRow?.channel }}</span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">国家</span>
                <span class="ad-performance-detail__v">{{ drawerRow?.country }}</span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">花费/预算</span>
                <span class="ad-performance-detail__v">
                  {{ formatMoney(drawerRow?.spend ?? 0) }}/{{
                    formatMoney(drawerRow?.budget ?? 0)
                  }}
                  ({{ drawerRow?.spendBudgetPercent }}%)
                </span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">CPI / CTR / CVR</span>
                <span class="ad-performance-detail__v">
                  {{ formatMoney(drawerRow?.cpi ?? 0) }} / {{ drawerRow?.ctr }}% /
                  {{ drawerRow?.cvr }}%
                </span>
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">ROI(首日/7日)</span>
                <span class="ad-performance-detail__v"
                  >{{ drawerRow?.roi1 }}% / {{ drawerRow?.roi7 }}%</span
                >
              </div>
              <div class="ad-performance-detail__item">
                <span class="ad-performance-detail__k">预估利润</span>
                <span
                  class="ad-performance-detail__v"
                  :class="profitClass(drawerRow?.estimatedProfit ?? 0)"
                >
                  {{ (drawerRow?.estimatedProfit ?? 0) >= 0 ? '+' : '' }}
                  {{ formatMoney(drawerRow?.estimatedProfit ?? 0) }}
                </span>
              </div>
            </div>
          </template>
        </div>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { Filter, Search } from '@element-plus/icons-vue'
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import CampaignTab from './table-tabs/campaign-tab.vue'
  import CountryTab from './table-tabs/country-tab.vue'
  import OwnerTab from './table-tabs/owner-tab.vue'
  import AccountTab from './table-tabs/account-tab.vue'
  import AdPerformanceDetailDrawer from './ad-performance-detail-drawer.vue'
  import { getMockCampaignDetail } from '../mock/data'
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
    AdPerformanceCampaignDetail
  } from '../types'

  defineOptions({ name: 'AdPerformanceTable' })

  const { t, te } = useI18n()
  const tr = (key: string, fallback: string) => (te(key) ? t(key) : fallback)

  const props = withDefaults(
    defineProps<{
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
          avgRoi1: 0,
          avgCvr: 0,
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
  }>()

  const activeTab = ref<'campaign' | 'country' | 'owner' | 'account'>('campaign')
  const searchKeyword = ref('')

  const campaignTabRef = ref<{ openCustomColumns: () => void } | null>(null)
  const countryTabRef = ref<{ openCustomColumns: () => void } | null>(null)
  const ownerTabRef = ref<{ openCustomColumns: () => void } | null>(null)
  const accountTabRef = ref<{ openCustomColumns: () => void } | null>(null)

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

  const drawerCampaignRow = computed(() => {
    if (drawerTab.value !== 'campaign') return null
    const row = drawerRow.value
    return row && (row as AdPerformanceCampaignRow).name !== undefined
      ? (row as AdPerformanceCampaignRow)
      : null
  })

  const drawerCampaignDetail = computed<AdPerformanceCampaignDetail | null>(() => {
    const row = drawerCampaignRow.value
    if (!row) return null
    return getMockCampaignDetail(row.id)
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

  watch(activeTab, () => {
    emit('pagination:current-change', 1)
  })

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

  function emitSearch() {
    emit('pagination:current-change', 1)
  }

  function onCustomColumns() {
    if (activeTab.value === 'campaign') campaignTabRef.value?.openCustomColumns()
    else if (activeTab.value === 'country') countryTabRef.value?.openCustomColumns()
    else if (activeTab.value === 'owner') ownerTabRef.value?.openCustomColumns()
    else accountTabRef.value?.openCustomColumns()
  }

  function onFilter() {
    // 占位：筛选弹窗/抽屉
  }

  const totalText = computed(() => {
    if (activeTab.value === 'country') return `共 ${props.countryRows.length} 个国家`
    if (activeTab.value === 'owner') return `共 ${props.ownerRows.length} 位投放师`
    if (activeTab.value === 'account') return `共 ${props.accountRows.length} 个账户`
    return `共 ${props.pagination.total} 条`
  })

  function onDetailCampaign(row: AdPerformanceCampaignRow) {
    drawerTab.value = 'campaign'
    drawerRow.value = row
    drawerVisible.value = true
  }

  function onDetailCountry(row: AdPerformanceCountryRow) {
    drawerTab.value = 'country'
    drawerRow.value = row
    drawerVisible.value = true
  }

  function onDetailOwner(row: AdPerformanceOwnerRow | AdPerformanceOwnerCampaignRow) {
    drawerTab.value = 'owner'
    drawerRow.value = row
    drawerVisible.value = true
  }

  function onDetailAccount(row: AdPerformanceAccountRow | AdPerformanceAccountCampaignRow) {
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
  .ad-performance-table {
    margin-bottom: 16px;
  }

  .ad-performance-table__card {
    background: var(--default-box-color);

    :deep(.el-card__body) {
      padding: 16px;
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
    flex: 0 0 auto;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
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
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--art-success) 55%, transparent);

    &:hover {
      background: color-mix(in srgb, var(--art-success) 10%, transparent);
      border-color: color-mix(in srgb, var(--art-success) 45%, transparent);
    }
  }

  .ad-performance-table__custom-btn {
    color: var(--art-success);
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
    overflow-x: auto;
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
    transform: translateY(-6px) rotate(-90deg) !important;
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
    justify-content: flex-end;
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
    text-align: right;
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
    padding: 16px;
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
</style>
