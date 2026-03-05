<template>
  <div class="deep-analysis-root">
    <div class="deep-analysis-wrap">
      <!-- 页面标题与面包屑 -->
      <header class="deep-analysis-header">
        <h1 class="deep-analysis-title">广告系列深度分析</h1>
        <div class="deep-analysis-breadcrumb">
          <span>所有应用</span>
          <span class="breadcrumb-sep">></span>
          <span>{{ filterApp || '--' }}</span>
          <span class="breadcrumb-sep">></span>
          <span>{{ filterPlatform || '--' }}</span>
        </div>
      </header>

      <!-- 筛选与操作 -->
      <section class="deep-analysis-filters">
        <div class="filters-left">
          <ElSelect
            v-model="filterApp"
            class="filter-select"
            placeholder="App"
            clearable
            @change="onFilterChange"
          >
            <ElOption v-for="app in appOptions" :key="app" :label="app" :value="app" />
          </ElSelect>
          <ElSelect
            v-model="filterPlatform"
            class="filter-select"
            placeholder="Platform"
            clearable
            @change="onFilterChange"
          >
            <ElOption v-for="p in platformOptions" :key="p" :label="p" :value="p" />
          </ElSelect>
          <ElSelect
            v-model="filterAdAccount"
            class="filter-select"
            placeholder="Ad Account"
            clearable
            @change="onFilterChange"
          >
            <ElOption v-for="acc in adAccountOptions" :key="acc" :label="acc" :value="acc" />
          </ElSelect>
          <ElDatePicker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="filter-date"
            @change="onFilterChange"
          />
        </div>
        <div class="filters-right">
          <ElButton type="primary" :icon="Download" @click="onExportExcel"> 导出Excel </ElButton>
          <ElButton :icon="Refresh" @click="onRefresh">刷新</ElButton>
        </div>
      </section>

      <!-- 汇总指标卡片 -->
      <section class="deep-analysis-kpi">
        <div class="kpi-card kpi-card--spend">
          <div class="kpi-card-title">总花费</div>
          <div class="kpi-card-value">{{ formatCurrency(summaryStats.totalSpend) }}</div>
        </div>
        <div class="kpi-card kpi-card--cpi">
          <div class="kpi-card-title">总CPI</div>
          <div class="kpi-card-value">{{ formatCurrency(summaryStats.totalCpi) }}</div>
        </div>
        <div class="kpi-card kpi-card--roi">
          <div class="kpi-card-title">累计ROI</div>
          <div class="kpi-card-value">{{ summaryStats.cumulativeRoi }}%</div>
        </div>
        <div class="kpi-card kpi-card--profit">
          <div class="kpi-card-title">预估利润</div>
          <div
            class="kpi-card-value"
            :class="
              summaryStats.estimatedProfit >= 0 ? 'kpi-card-value--green' : 'kpi-card-value--red'
            "
          >
            {{ formatCurrency(summaryStats.estimatedProfit) }}
          </div>
        </div>
      </section>

      <!-- 按广告系列汇总表格（可展开 -> 按日期 -> 按国家） -->
      <section class="deep-analysis-table-section">
        <div class="table-section-head">
          <span class="table-section-title">按广告系列汇总</span>
        </div>
        <ElTable
          :data="campaignList"
          class="deep-analysis-table"
          stripe
          :header-cell-style="tableHeaderStyle"
          row-key="id"
          @expand-change="onCampaignExpandChange"
        >
          <ElTableColumn type="expand">
            <template #default="{ row }">
              <div v-if="row.dateBreakdown?.length" class="expand-date-block">
                <div class="expand-date-title">
                  <span class="expand-date-icon">◀</span>
                  按日期展开: {{ row.campaignName }}
                </div>
                <p class="expand-date-tip">点击某一天可继续下钻查看国家维度</p>
                <ElTable
                  :data="row.dateBreakdown"
                  class="expand-date-table"
                  stripe
                  :header-cell-style="tableHeaderStyle"
                  row-key="date"
                  @expand-change="
                    (_: unknown, expandedRows: DateBreakdownRow[]) =>
                      onDateExpandChange(expandedRows)
                  "
                >
                  <ElTableColumn type="expand">
                    <template #default="{ row: dateRow }">
                      <div v-if="dateRow.countryBreakdown?.length" class="expand-country-block">
                        <div class="expand-country-title">
                          <span class="expand-country-icon">◀</span>
                          按国家展开: {{ dateRow.date }}
                        </div>
                        <ElTable
                          :data="dateRow.countryBreakdown"
                          class="expand-country-table"
                          stripe
                          :header-cell-style="tableHeaderStyle"
                          row-key="countryCode"
                        >
                          <ElTableColumn label="国家" min-width="100">
                            <template #default="{ row: countryRow }">
                              <span class="country-cell">
                                <span class="country-flag">{{
                                  countryFlag(countryRow.countryCode)
                                }}</span>
                                {{ countryRow.country }}
                              </span>
                            </template>
                          </ElTableColumn>
                          <ElTableColumn label="花费" width="100" align="right">
                            <template #default="{ row: r }">
                              {{ formatCurrency(r.spend) }}
                            </template>
                          </ElTableColumn>
                          <ElTableColumn label="CPI" width="80" align="right">
                            <template #default="{ row: r }">
                              {{ formatCurrency(r.cpi) }}
                            </template>
                          </ElTableColumn>
                          <ElTableColumn label="买量用户" width="100" align="right">
                            <template #default="{ row: r }">
                              {{ r.installs.toLocaleString() }}
                            </template>
                          </ElTableColumn>
                          <ElTableColumn label="点击率" width="80" align="right">
                            <template #default="{ row: r }"> {{ r.clickRate }}% </template>
                          </ElTableColumn>
                          <ElTableColumn label="转化率" width="80" align="right">
                            <template #default="{ row: r }"> {{ r.conversionRate }}% </template>
                          </ElTableColumn>
                          <ElTableColumn label="D0 ROI" width="80" align="right">
                            <template #default="{ row: r }">
                              {{ r.d0Roi >= 0 ? r.d0Roi + '%' : '-' }}
                            </template>
                          </ElTableColumn>
                          <ElTableColumn label="D3 ROI" width="80" align="right">
                            <template #default="{ row: r }">
                              {{ r.d3Roi >= 0 ? r.d3Roi + '%' : '-' }}
                            </template>
                          </ElTableColumn>
                          <ElTableColumn label="D7 ROI" width="80" align="right">
                            <template #default="{ row: r }">
                              {{ r.d7Roi >= 0 ? r.d7Roi + '%' : '-' }}
                            </template>
                          </ElTableColumn>
                          <ElTableColumn label="累计ROI" width="90" align="right">
                            <template #default="{ row: r }"> {{ r.cumulativeRoi }}% </template>
                          </ElTableColumn>
                          <ElTableColumn label="预估利润" width="100" align="right">
                            <template #default="{ row: r }">
                              <span
                                :class="
                                  r.estimatedProfit >= 0 ? 'profit-positive' : 'profit-negative'
                                "
                              >
                                {{ formatCurrency(r.estimatedProfit) }}
                              </span>
                            </template>
                          </ElTableColumn>
                        </ElTable>
                      </div>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="日期" min-width="110">
                    <template #default="{ row: r }">
                      <span class="date-cell">{{ r.date }}</span>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="花费" width="100" align="right">
                    <template #default="{ row: r }">
                      {{ formatCurrency(r.spend) }}
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="CPI" width="80" align="right">
                    <template #default="{ row: r }">
                      {{ formatCurrency(r.cpi) }}
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="买量用户" width="100" align="right">
                    <template #default="{ row: r }">
                      {{ r.installs.toLocaleString() }}
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="点击率" width="80" align="right">
                    <template #default="{ row: r }"> {{ r.clickRate }}% </template>
                  </ElTableColumn>
                  <ElTableColumn label="转化率" width="80" align="right">
                    <template #default="{ row: r }"> {{ r.conversionRate }}% </template>
                  </ElTableColumn>
                  <ElTableColumn label="D0 ROI" width="80" align="right">
                    <template #default="{ row: r }">
                      {{ r.d0Roi >= 0 ? r.d0Roi + '%' : '-' }}
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="D3 ROI" width="80" align="right">
                    <template #default="{ row: r }">
                      {{ r.d3Roi >= 0 ? r.d3Roi + '%' : '-' }}
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="D7 ROI" width="80" align="right">
                    <template #default="{ row: r }">
                      {{ r.d7Roi >= 0 ? r.d7Roi + '%' : '-' }}
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="累计ROI" width="90" align="right">
                    <template #default="{ row: r }"> {{ r.cumulativeRoi }}% </template>
                  </ElTableColumn>
                  <ElTableColumn label="预估利润" width="100" align="right">
                    <template #default="{ row: r }">
                      <span :class="r.estimatedProfit >= 0 ? 'profit-positive' : 'profit-negative'">
                        {{ formatCurrency(r.estimatedProfit) }}
                      </span>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="操作" width="100" fixed="right">
                    <template #default="{ row: r }">
                      <span v-if="r.countryBreakdown?.length" class="action-link"> 查看国家 </span>
                      <span v-else class="action-link disabled">--</span>
                    </template>
                  </ElTableColumn>
                </ElTable>
              </div>
              <div v-else class="expand-empty">暂无按日期展开数据</div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="广告系列" min-width="220" show-overflow-tooltip>
            <template #default="{ row }">
              <span>{{ row.campaignName }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="花费" width="110" align="right">
            <template #default="{ row }">
              {{ formatCurrency(row.spend) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="CPI" width="90" align="right">
            <template #default="{ row }">
              {{ formatCurrency(row.cpi) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="点击率" width="90" align="right">
            <template #default="{ row }"> {{ row.clickRate }}% </template>
          </ElTableColumn>
          <ElTableColumn label="转化率" width="90" align="right">
            <template #default="{ row }"> {{ row.conversionRate }}% </template>
          </ElTableColumn>
          <ElTableColumn label="D0 ROI" width="90" align="right">
            <template #default="{ row }"> {{ row.d0Roi }}% </template>
          </ElTableColumn>
          <ElTableColumn label="D3 ROI" width="90" align="right">
            <template #default="{ row }"> {{ row.d3Roi }}% </template>
          </ElTableColumn>
          <ElTableColumn label="D7 ROI" width="90" align="right">
            <template #default="{ row }"> {{ row.d7Roi }}% </template>
          </ElTableColumn>
          <ElTableColumn label="累计ROI" width="100" align="right">
            <template #default="{ row }"> {{ row.cumulativeRoi }}% </template>
          </ElTableColumn>
          <ElTableColumn label="预估利润" width="110" align="right">
            <template #default="{ row }">
              <span :class="row.estimatedProfit >= 0 ? 'profit-positive' : 'profit-negative'">
                {{ formatCurrency(row.estimatedProfit) }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="160" fixed="right">
            <!-- eslint-disable-next-line vue/no-unused-vars -->
            <template #default="{ row }">
              <span class="action-link">暂停{{ row.id }}</span>
              <span class="action-divider">|</span>
              <span class="action-link">编辑</span>
              <span class="action-divider">|</span>
              <span class="action-link">更多</span>
            </template>
          </ElTableColumn>
        </ElTable>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Download, Refresh } from '@element-plus/icons-vue'
  import {
    MOCK_SUMMARY_STATS,
    MOCK_CAMPAIGN_SUMMARY,
    MOCK_APP_OPTIONS,
    MOCK_PLATFORM_OPTIONS,
    MOCK_AD_ACCOUNT_OPTIONS,
    type CampaignSummaryRow,
    type DateBreakdownRow
  } from './mock'

  defineOptions({ name: 'DeepAnalysis' })

  const filterApp = ref('PhoneTracker2')
  const filterPlatform = ref('Google Ads')
  const filterAdAccount = ref('523-793-2262')
  const dateRange = ref<[string, string]>(['2026-01-21', '2026-01-27'])

  const appOptions = ref(MOCK_APP_OPTIONS)
  const platformOptions = ref(MOCK_PLATFORM_OPTIONS)
  const adAccountOptions = ref(MOCK_AD_ACCOUNT_OPTIONS)

  const summaryStats = ref(MOCK_SUMMARY_STATS)
  const campaignList = ref<CampaignSummaryRow[]>(MOCK_CAMPAIGN_SUMMARY)

  const formatCurrency = (n: number) => {
    const sign = n >= 0 ? '' : '-'
    return (
      sign +
      '$' +
      Math.abs(n).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    )
  }

  const tableHeaderStyle = () => ({
    background: 'var(--deep-analysis-table-header-bg)',
    color: 'var(--deep-analysis-table-header-color)'
  })

  function onFilterChange() {
    // 实际可在此请求接口
  }

  function onExportExcel() {
    console.log('导出Excel')
  }

  function onRefresh() {
    console.log('刷新')
    summaryStats.value = { ...MOCK_SUMMARY_STATS }
    campaignList.value = [...MOCK_CAMPAIGN_SUMMARY]
  }

  function onCampaignExpandChange() {
    // 可在此记录展开状态
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onDateExpandChange(_expandedRows: DateBreakdownRow[]) {
    // 可在此记录日期展开状态
  }

  /** 国家简码 -> 国旗 emoji（简化） */
  function countryFlag(code: string) {
    const map: Record<string, string> = {
      US: '🇺🇸',
      MX: '🇲🇽',
      CO: '🇨🇴'
    }
    return map[code] ?? '🏳️'
  }
</script>

<style lang="scss" scoped>
  .deep-analysis-root {
    box-sizing: border-box;
    width: 100%;
    min-height: var(--art-full-height, calc(100vh - 120px));
    padding: 24px;
    overflow: auto;
    background: var(--deep-analysis-bg);

    --deep-analysis-bg: #f0f2f5;
    --deep-analysis-wrap-bg: #fff;
    --deep-analysis-border: rgb(0 0 0 / 8%);
    --deep-analysis-text-primary: #1d1e1f;
    --deep-analysis-text-secondary: #606266;
    --deep-analysis-panel-bg: #fff;
    --deep-analysis-table-header-bg: #409eff;
    --deep-analysis-table-header-color: #fff;
  }

  html.dark .deep-analysis-root {
    --deep-analysis-bg: #0a1628;
    --deep-analysis-wrap-bg: linear-gradient(180deg, #0d1b2a 0%, #0a1628 100%);
    --deep-analysis-border: rgb(255 255 255 / 8%);
    --deep-analysis-text-primary: #e8edf5;
    --deep-analysis-text-secondary: #8b9dc3;
    --deep-analysis-panel-bg: rgb(255 255 255 / 3%);
    --deep-analysis-table-header-bg: #1e3a5f;
    --deep-analysis-table-header-color: #e8edf5;
  }

  .deep-analysis-wrap {
    max-width: 1600px;
    padding: 24px 28px;
    margin: 0 auto;
    background: var(--deep-analysis-wrap-bg);
    border: 1px solid var(--deep-analysis-border);
    border-radius: 12px;
  }

  .deep-analysis-header {
    margin-bottom: 20px;
  }

  .deep-analysis-title {
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: 600;
    color: var(--deep-analysis-text-primary);
  }

  .deep-analysis-breadcrumb {
    font-size: 13px;
    color: var(--deep-analysis-text-secondary);

    .breadcrumb-sep {
      margin: 0 6px;
      color: var(--deep-analysis-text-secondary);
      opacity: 0.7;
    }
  }

  .deep-analysis-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .filters-left {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .filter-select {
    width: 160px;
  }

  .filter-date {
    width: 260px;
  }

  .filters-right {
    display: flex;
    gap: 10px;
  }

  .deep-analysis-kpi {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .kpi-card {
    padding: 16px 20px;
    border: 1px solid var(--deep-analysis-border);
    border-radius: 10px;

    .kpi-card-title {
      margin-bottom: 8px;
      font-size: 13px;
      color: var(--deep-analysis-text-secondary);
    }

    .kpi-card-value {
      font-size: 22px;
      font-weight: 700;
      color: var(--deep-analysis-text-primary);

      &.kpi-card-value--green {
        color: var(--el-color-success);
      }

      &.kpi-card-value--red {
        color: var(--el-color-danger);
      }
    }

    &.kpi-card--spend,
    &.kpi-card--cpi {
      background: rgb(64 158 255 / 6%);
      border-color: rgb(64 158 255 / 35%);
    }

    &.kpi-card--roi,
    &.kpi-card--profit {
      background: rgb(157 96 180 / 6%);
      border-color: rgb(157 96 180 / 35%);
    }
  }

  .deep-analysis-table-section {
    padding: 16px;
    overflow: hidden;
    background: var(--deep-analysis-panel-bg);
    border: 1px solid var(--deep-analysis-border);
    border-radius: 10px;
  }

  .table-section-head {
    margin-bottom: 12px;
  }

  .table-section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--deep-analysis-text-primary);
  }

  .deep-analysis-table {
    :deep(.el-table__header th) {
      color: var(--deep-analysis-table-header-color) !important;
      background: var(--deep-analysis-table-header-bg) !important;
    }
  }

  .expand-date-block,
  .expand-country-block {
    padding: 12px 0 12px 24px;
    background: var(--deep-analysis-panel-bg);
  }

  .expand-date-title,
  .expand-country-title {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--deep-analysis-text-primary);

    .expand-date-icon,
    .expand-country-icon {
      margin-right: 6px;
      font-size: 12px;
      color: var(--deep-analysis-text-secondary);
    }
  }

  .expand-date-tip {
    margin: 0 0 10px;
    font-size: 12px;
    color: var(--deep-analysis-text-secondary);
  }

  .expand-date-table,
  .expand-country-table {
    margin-left: 0;

    :deep(.el-table__header th) {
      color: var(--deep-analysis-table-header-color) !important;
      background: var(--deep-analysis-table-header-bg) !important;
    }
  }

  .expand-country-block {
    padding-left: 32px;
  }

  .expand-empty {
    padding: 16px 24px;
    font-size: 13px;
    color: var(--deep-analysis-text-secondary);
  }

  .country-cell {
    display: inline-flex;
    gap: 6px;
    align-items: center;

    .country-flag {
      font-size: 14px;
    }
  }

  .date-cell {
    font-variant-numeric: tabular-nums;
  }

  .profit-positive {
    color: var(--el-color-success);
  }

  .profit-negative {
    color: var(--el-color-danger);
  }

  .action-link {
    color: var(--el-color-primary);
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }

    &.disabled {
      color: var(--deep-analysis-text-secondary);
      cursor: default;
    }
  }

  .action-divider {
    margin: 0 6px;
    font-size: 12px;
    color: var(--deep-analysis-text-secondary);
  }
</style>
