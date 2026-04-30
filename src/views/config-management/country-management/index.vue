<template>
  <div class="account-sub-page credential-page country-page art-full-height">
    <div class="account-sub-page__toolbar">
      <div class="account-sub-page__toolbar-fx" aria-hidden="true" />
      <div class="account-sub-page__toolbar-row">
        <div class="account-sub-page__toolbar-copy">
          <span class="account-sub-page__toolbar-line" aria-hidden="true" />
          <div class="account-sub-page__toolbar-titles">
            <span class="account-sub-page__toolbar-eyebrow">Country</span>
            <span class="account-sub-page__toolbar-title">国家列表</span>
          </div>
          <span class="account-sub-page__toolbar-hint">国家档案、地区分布与主要市场占比</span>
        </div>
        <div class="account-sub-page__toolbar-actions">
          <ElButton type="primary" round class="account-sub-page__btn-primary" @click="handleAdd">
            <ElIcon><Plus /></ElIcon>新增国家
          </ElButton>
          <ElButton round class="account-sub-page__btn-secondary" @click="importVisible = true">
            批量导入
          </ElButton>
          <ElButton round class="account-sub-page__btn-secondary" @click="handleExport">
            导出
          </ElButton>
        </div>
      </div>
    </div>

    <section class="account-sub-page__list-panel credential-page__panel" aria-label="国家列表">
      <div class="account-sub-page__list-panel-fx" aria-hidden="true" />
      <div class="account-sub-page__list-panel-body credential-page__panel-body">
        <div class="country-filter-bar">
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索国家名称或代码"
            class="header-search"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <span class="country-filter-bar__label">地区</span>
          <el-select v-model="filterForm.region" placeholder="全部" class="header-select" clearable>
            <el-option v-for="r in metaRegionOptions" :key="r" :label="r" :value="r" />
          </el-select>
          <span class="country-filter-bar__label">货币</span>
          <el-select
            v-model="filterForm.currency"
            placeholder="全部"
            class="header-select"
            clearable
          >
            <el-option v-for="c in metaCurrencyOptions" :key="c" :label="c" :value="c" />
          </el-select>
          <ElButton
            type="primary"
            round
            class="account-sub-page__btn-primary btn-query"
            @click="handleQuery"
          >
            查询
          </ElButton>
        </div>

        <!-- ── 内容区：左右两列大网格 ──────────────────────── -->
        <div class="content-grid">
          <!-- ── 左列：KPI行 + 表格 ──────────────────────────── -->
          <div class="left-col">
            <!-- KPI 四卡 -->
            <div class="kpi-row">
              <div class="kpi-card kpi-card--teal">
                <div class="kpi-icon-wrap kpi-icon-wrap--teal">🌐</div>
                <div class="kpi-body">
                  <div class="kpi-label">已配置国家</div>
                  <div class="kpi-value kpi-value--teal"
                    >{{ kpi.total }}<span class="kpi-unit">个</span></div
                  >
                </div>
                <div class="kpi-accent kpi-accent--teal" />
              </div>
              <div class="kpi-card kpi-card--blue">
                <div class="kpi-icon-wrap kpi-icon-wrap--blue">💱</div>
                <div class="kpi-body">
                  <div class="kpi-label">支持货币</div>
                  <div class="kpi-value kpi-value--blue"
                    >{{ kpi.currencies }}<span class="kpi-unit">种</span></div
                  >
                </div>
                <div class="kpi-accent kpi-accent--blue" />
              </div>
              <div class="kpi-card kpi-card--green">
                <div class="kpi-icon-wrap kpi-icon-wrap--green">📈</div>
                <div class="kpi-body">
                  <div class="kpi-label">主要市场</div>
                  <div class="kpi-value kpi-value--green"
                    >{{ kpi.mainMarkets }}<span class="kpi-unit">个</span></div
                  >
                </div>
                <div class="kpi-accent kpi-accent--green" />
              </div>
              <div class="kpi-card kpi-card--amber">
                <div class="kpi-icon-wrap kpi-icon-wrap--amber">💰</div>
                <div class="kpi-body">
                  <div class="kpi-label">未配置货币</div>
                  <div class="kpi-value kpi-value--amber"
                    >{{ kpi.noCurrency }}<span class="kpi-unit">个</span></div
                  >
                </div>
                <div class="kpi-accent kpi-accent--amber" />
              </div>
            </div>

            <!-- 表格 -->
            <div class="table-panel">
              <el-table
                :data="pagedList"
                v-loading="loading"
                class="country-table"
                table-layout="fixed"
                row-class-name="country-table-row"
                @row-click="handleRowClick"
              >
                <el-table-column prop="code" label="国家代码" width="120" show-overflow-tooltip />
                <el-table-column label="国旗" width="72" align="center">
                  <template #default="{ row }">
                    <img
                      v-if="row.flagIconUrl"
                      :src="row.flagIconUrl"
                      alt=""
                      class="flag-cell-img"
                    />
                    <span v-else class="flag-cell-fallback">{{ row.code }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="nameCn" label="中文名称" width="110" show-overflow-tooltip />
                <el-table-column
                  prop="nameEn"
                  label="国家名称"
                  min-width="140"
                  show-overflow-tooltip
                />
                <el-table-column prop="timezone" label="时区" width="110" show-overflow-tooltip />
                <el-table-column
                  prop="phoneCode"
                  label="电话代码"
                  width="100"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="code3"
                  label="三位数代码"
                  width="110"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="criteriaId"
                  label="Criteria ID"
                  width="120"
                  show-overflow-tooltip
                />
                <el-table-column label="是否主要市场" width="120" align="center">
                  <template #default="{ row }">
                    <span
                      :class="[
                        'market-badge',
                        row.isMainMarket ? 'market-badge--yes' : 'market-badge--no'
                      ]"
                    >
                      {{ row.isMainMarket ? '是 主要' : '否' }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right" align="center">
                  <template #default="{ row }">
                    <div class="action-btns">
                      <button class="action-btn action-btn--view" @click.stop="handleView(row)"
                        >查看</button
                      >
                      <button class="action-btn action-btn--edit" @click.stop="handleEdit(row)"
                        >编辑</button
                      >
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
              <div class="pagination-bar">
                <span class="total-text">共 {{ total }} 条</span>
                <el-select v-model="pageSize" class="page-size-select" @change="currentPage = 1">
                  <el-option label="10条/页" :value="10" />
                  <el-option label="20条/页" :value="20" />
                  <el-option label="50条/页" :value="50" />
                </el-select>
                <el-pagination
                  v-model:current-page="currentPage"
                  :page-size="pageSize"
                  :total="total"
                  layout="prev, pager, next"
                  class="country-pagination"
                />
              </div>
            </div>
          </div>

          <!-- ── 右列：地区分布 + 主要市场收入占比 ────────────── -->
          <div class="right-col">
            <!-- 地区分布 -->
            <div class="chart-card">
              <div class="chart-title">地区分布</div>
              <div ref="donutEl" class="donut-chart" />
              <div class="donut-legend">
                <span v-for="item in regionDist" :key="item.name" class="legend-item">
                  <span class="legend-dot" :style="{ background: item.color }" />{{ item.name }}
                </span>
              </div>
              <div v-if="chartLoading || regionChartEmpty" class="chart-state-mask">
                <div class="chart-state-text">
                  {{ chartLoading ? '图表加载中...' : '暂无地区分布数据' }}
                </div>
              </div>
            </div>
            <!-- 主要市场收入占比 -->
            <div class="chart-card">
              <div class="chart-title">主要市场收入占比</div>
              <div ref="barEl" class="bar-chart" />
              <div v-if="chartLoading || mainMarketChartEmpty" class="chart-state-mask">
                <div class="chart-state-text">
                  {{ chartLoading ? '图表加载中...' : '暂无主要市场占比数据' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 子组件 ──────────────────────────────────────── -->
    <CountryDetailDrawer
      v-model:visible="drawerVisible"
      :data="currentCountry"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <CountryFormDialog
      v-model:visible="formVisible"
      :edit-data="editData"
      :timezone-options="metaTimezoneOptions"
      :region-options="metaRegionOptions"
      :currency-options="metaCurrencyOptions"
      @success="handleFormSuccess"
    />

    <CountryImportDialog v-model:visible="importVisible" @success="handleImportSuccess" />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { Plus, Search } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import * as echarts from 'echarts/core'
  import { PieChart, BarChart } from 'echarts/charts'
  import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import {
    fetchCountryDetail,
    fetchCountryMetaOptions,
    fetchCountryMainMarketShare,
    fetchCountryOverviewKpi,
    fetchCountryRegionDistribution,
    fetchCountryTable,
    createCountry,
    updateCountry,
    deleteCountry,
    exportCountryList,
    importCountryList
  } from '@/api/config-management/country-management'
  import CountryDetailDrawer from './modules/country-detail-drawer.vue'
  import CountryFormDialog from './modules/country-form-dialog.vue'
  import CountryImportDialog from './modules/country-import-dialog.vue'
  import type {
    CountryFormModel,
    CountryItem,
    CountryMainMarketShareItem,
    CountryRegionDistributionItem
  } from './types'

  echarts.use([
    PieChart,
    BarChart,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    CanvasRenderer
  ])

  defineOptions({ name: 'CountryManagement' })

  // ─── 数据 ──────────────────────────────────────────────
  const countryList = ref<CountryItem[]>([])
  const total = ref(0)
  const loading = ref(false)
  const filterForm = reactive({ keyword: '', region: '', currency: '' })
  const currentPage = ref(1)
  const pageSize = ref(10)
  const drawerVisible = ref(false)
  const formVisible = ref(false)
  const importVisible = ref(false)
  const currentCountry = ref<CountryItem | null>(null)
  const editData = ref<CountryItem | null>(null)
  const metaTimezoneOptions = ref<string[]>([])
  const metaRegionOptions = ref<string[]>([])
  const metaCurrencyOptions = ref<string[]>([])
  const overviewKpi = ref({
    total: 0,
    currencies: 0,
    mainMarkets: 0,
    noCurrency: 0
  })
  const chartLoading = ref(false)
  const regionChartData = ref<CountryRegionDistributionItem[]>([])
  const mainMarketShareData = ref<CountryMainMarketShareItem[]>([])
  const REGION_COLOR_MAP: Record<string, string> = {
    亚太: '#14b8a6',
    欧洲: '#3b82f6',
    北美: '#8b5cf6',
    其他: '#f59e0b'
  }

  const loadCountryMetaOptions = async () => {
    try {
      const data = await fetchCountryMetaOptions()
      metaTimezoneOptions.value = data.timezoneOptions ?? []
      metaRegionOptions.value = data.regionOptions ?? []
      metaCurrencyOptions.value = data.currencyOptions ?? []
    } catch {
      metaTimezoneOptions.value = []
      metaRegionOptions.value = []
      metaCurrencyOptions.value = []
    }
  }

  const loadCountryOverviewKpi = async () => {
    try {
      overviewKpi.value = await fetchCountryOverviewKpi({
        keyword: filterForm.keyword.trim() || undefined,
        region: filterForm.region || undefined,
        currency: filterForm.currency || undefined
      })
    } catch {
      overviewKpi.value = { total: 0, currencies: 0, mainMarkets: 0, noCurrency: 0 }
    }
  }

  const loadCountryCharts = async () => {
    chartLoading.value = true
    try {
      const params = {
        keyword: filterForm.keyword.trim() || undefined,
        region: filterForm.region || undefined,
        currency: filterForm.currency || undefined
      }
      const [regionRes, mainMarketRes] = await Promise.all([
        fetchCountryRegionDistribution(params),
        fetchCountryMainMarketShare(params)
      ])
      regionChartData.value = regionRes
      mainMarketShareData.value = mainMarketRes
    } catch {
      regionChartData.value = []
      mainMarketShareData.value = []
    } finally {
      chartLoading.value = false
      nextTick(() => {
        donutChart?.setOption(buildDonutOption())
        barChart?.setOption(buildBarOption())
      })
    }
  }

  const loadCountryTable = async () => {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: filterForm.keyword.trim(),
      region: filterForm.region,
      currency: filterForm.currency
    }
    loading.value = true
    try {
      const res = await fetchCountryTable(params)
      const r = res as Api.Common.PaginatedResponse<CountryItem> & {
        data?: { list?: CountryItem[]; total?: number }
        list?: CountryItem[]
        total?: number
      }
      const records = Array.isArray(r.records)
        ? r.records
        : (r.data?.list ?? (Array.isArray(r.list) ? r.list : []))
      countryList.value = records
      total.value = Number(r.total ?? r.data?.total ?? 0)
    } finally {
      loading.value = false
    }
  }

  watch([currentPage, pageSize], () => {
    void loadCountryTable()
  })

  const pagedList = computed(() => countryList.value)

  // ─── KPI ────────────────────────────────────────────────
  const kpi = computed(() => overviewKpi.value)

  // ─── 图表数据 ───────────────────────────────────────────
  const regionDist = computed(() =>
    regionChartData.value.map((item) => ({
      name: item.region,
      color: REGION_COLOR_MAP[item.region] ?? '#64748b'
    }))
  )
  const regionChartEmpty = computed(
    () => !chartLoading.value && regionChartData.value.every((item) => item.count === 0)
  )
  const mainMarketChartEmpty = computed(
    () => !chartLoading.value && mainMarketShareData.value.length === 0
  )

  const donutEl = ref<HTMLElement | null>(null)
  const barEl = ref<HTMLElement | null>(null)
  let donutChart: echarts.ECharts | null = null
  let barChart: echarts.ECharts | null = null

  function buildDonutOption() {
    const regionCount = regionChartData.value.map((item) => ({
      name: item.region,
      value: item.count,
      itemStyle: { color: REGION_COLOR_MAP[item.region] ?? '#64748b' }
    }))
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        borderColor: 'rgba(255,255,255,0.08)',
        textStyle: { color: '#e2e8f0', fontSize: 12 },
        formatter: '{b}: {c} ({d}%)'
      },
      series: [
        {
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: {
            show: true,
            position: 'outside',
            fontSize: 10,
            color: '#94a3b8',
            formatter: '{b} {d}%'
          },
          labelLine: { length: 5, length2: 6, lineStyle: { color: 'rgba(255,255,255,0.2)' } },
          data: regionCount
        }
      ]
    }
  }

  function buildBarOption() {
    const labels = mainMarketShareData.value.map((item) => item.countryCode)
    const pcts = mainMarketShareData.value.map((item) => item.sharePercent)
    const colors = ['#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b']
    return {
      backgroundColor: 'transparent',
      grid: { left: 10, right: 40, top: 6, bottom: 6, containLabel: true },
      xAxis: {
        type: 'value',
        max: 50,
        axisLabel: { color: '#64748b', fontSize: 10, formatter: (v: number) => `${v}%` },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'category',
        data: labels,
        inverse: true,
        axisLabel: { color: '#94a3b8', fontSize: 12, fontWeight: 600 },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        borderColor: 'rgba(255,255,255,0.08)',
        textStyle: { color: '#e2e8f0', fontSize: 12 },
        formatter: (params: { name: string; value: number }[]) =>
          `${params[0].name}: ${params[0].value}%`
      },
      series: [
        {
          type: 'bar',
          data: pcts.map((v, i) => ({
            value: v,
            itemStyle: { color: colors[i], borderRadius: [0, 4, 4, 0] }
          })),
          barMaxWidth: 14,
          label: {
            show: true,
            position: 'right',
            color: '#94a3b8',
            fontSize: 11,
            formatter: '{c}%'
          }
        }
      ]
    }
  }

  function initCharts() {
    nextTick(() => {
      if (donutEl.value && !donutChart) {
        donutChart = echarts.init(donutEl.value)
        donutChart.setOption(buildDonutOption())
      }
      if (barEl.value && !barChart) {
        barChart = echarts.init(barEl.value)
        barChart.setOption(buildBarOption())
      }
    })
  }

  const resizeCharts = () => {
    donutChart?.resize()
    barChart?.resize()
  }

  onMounted(() => {
    initCharts()
    void loadCountryMetaOptions()
    void loadCountryOverviewKpi()
    void loadCountryCharts()
    void loadCountryTable()
    window.addEventListener('resize', resizeCharts)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCharts)
    donutChart?.dispose()
    barChart?.dispose()
  })

  // ─── 操作 ──────────────────────────────────────────────
  const handleAdd = () => {
    editData.value = null
    formVisible.value = true
  }

  const openDetail = async (row: CountryItem) => {
    try {
      const detail = await fetchCountryDetail({ code: row.code })
      currentCountry.value = detail
      drawerVisible.value = true
    } catch {
      ElMessage.error('获取详情失败，请稍后重试')
    }
  }

  const handleView = (row: CountryItem) => {
    void openDetail(row)
  }

  const handleEdit = (row: CountryItem) => {
    editData.value = { ...row }
    formVisible.value = true
    drawerVisible.value = false
  }

  const handleRowClick = (row: CountryItem) => {
    void openDetail(row)
  }

  const handleDelete = async (row: CountryItem) => {
    try {
      await ElMessageBox.confirm(
        `确定删除国家「${row.nameCn}（${row.code}）」吗？此操作不可恢复。`,
        '删除确认',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
          customClass: 'country-delete-confirm'
        }
      )
    } catch {
      return
    }

    try {
      await deleteCountry(row.code)
    } catch {
      ElMessage.error('删除失败，请稍后重试')
      return
    }
    if (currentCountry.value?.code === row.code) {
      currentCountry.value = null
      drawerVisible.value = false
    }
    await loadCountryTable()
    await loadCountryOverviewKpi()
    await loadCountryCharts()
    ElMessage.success('删除成功')
  }

  const handleFormSuccess = async (payload: CountryFormModel, isEdit: boolean) => {
    if (isEdit && editData.value?.code) {
      try {
        await updateCountry(editData.value.code, payload)
      } catch {
        ElMessage.error('保存失败，请稍后重试')
        return
      }
      await loadCountryTable()
      await loadCountryOverviewKpi()
      await loadCountryCharts()
      ElMessage.success('保存成功')
    } else {
      try {
        await createCountry(payload)
      } catch {
        ElMessage.error('创建失败，请稍后重试')
        return
      }
      await loadCountryTable()
      await loadCountryOverviewKpi()
      await loadCountryCharts()
      ElMessage.success('创建成功')
    }

    formVisible.value = false
    editData.value = null
    nextTick(() => {
      donutChart?.setOption(buildDonutOption())
      barChart?.setOption(buildBarOption())
    })
  }

  const handleImportSuccess = async (items: CountryFormModel[]) => {
    try {
      await importCountryList({ items })
    } catch {
      ElMessage.error('导入失败，请稍后重试')
      return
    }

    await loadCountryTable()
    await loadCountryOverviewKpi()
    await loadCountryCharts()
    importVisible.value = false
    ElMessage.success('批量导入成功')
  }

  const handleExport = async () => {
    try {
      await exportCountryList({
        keyword: filterForm.keyword,
        region: filterForm.region,
        currency: filterForm.currency,
        page: 1,
        pageSize: 9999
      })
    } catch {
      ElMessage.error('导出失败，请稍后重试')
      return
    }
    ElMessage.success('导出成功')
  }

  const handleQuery = () => {
    if (currentPage.value !== 1) {
      currentPage.value = 1
    }
    void loadCountryOverviewKpi()
    void loadCountryCharts()
    void loadCountryTable()
  }
</script>

<style lang="scss" scoped>
  .account-sub-page.credential-page.country-page {
    --page-border: color-mix(in srgb, var(--el-color-primary) 16%, transparent);
    --page-text-main: color-mix(in srgb, var(--text-primary) 92%, white 8%);
    --as-border: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --as-surface: color-mix(in srgb, var(--default-box-color) 94%, transparent);
    --as-header-bg: color-mix(in srgb, var(--default-box-color) 78%, black 4%);
    --bg-card: var(--as-surface);
    --border: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    --accent: var(--el-color-primary);
    --accent-dim: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    --red: var(--art-danger);
    --red-dim: color-mix(in srgb, var(--art-danger) 14%, transparent);
    --text-primary: var(--text-primary);
    --text-secondary: var(--text-secondary);
    --text-muted: var(--text-tertiary);

    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding: 24px;
    overflow: clip auto;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 13px;
    color: var(--page-text-main);
    background: var(--default-bg-color);
    isolation: isolate;
  }

  .account-sub-page.credential-page.country-page::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(
        ellipse 55% 40% at 88% 0%,
        color-mix(in srgb, var(--theme-color) 22%, transparent) 0%,
        transparent 58%
      ),
      radial-gradient(
        ellipse 40% 32% at 12% 6%,
        color-mix(in srgb, var(--el-color-primary) 16%, transparent) 0%,
        transparent 55%
      );
    mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 55%);
  }

  .account-sub-page.credential-page.country-page > * {
    position: relative;
    z-index: 1;
  }

  .account-sub-page__toolbar {
    position: relative;
    flex-shrink: 0;
    margin-bottom: 16px;
    overflow: hidden;
    backdrop-filter: blur(18px);
    border: 1px solid var(--page-border);
    border-radius: 20px;
    box-shadow:
      0 18px 48px rgb(0 0 0 / 18%),
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 7%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 7%, transparent);
  }

  .account-sub-page__toolbar-fx {
    position: absolute;
    inset: -50% -10% 35%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 200deg at 70% 40%,
      color-mix(in srgb, var(--el-color-primary) 14%, transparent),
      color-mix(in srgb, var(--theme-color) 12%, transparent),
      color-mix(in srgb, var(--art-success) 8%, transparent),
      color-mix(in srgb, var(--el-color-primary) 14%, transparent)
    );
    filter: blur(40px);
    opacity: 0.5;
  }

  .account-sub-page__toolbar-row {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 16px 20px;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--default-box-color) 88%, transparent),
        color-mix(in srgb, var(--default-box-color) 76%, transparent)
      ),
      linear-gradient(
        118deg,
        color-mix(in srgb, var(--theme-color) 8%, transparent),
        color-mix(in srgb, var(--el-color-primary) 6%, transparent)
      );

    &::after {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, var(--el-color-primary) 45%, transparent) 35%,
        color-mix(in srgb, var(--theme-color) 38%, transparent) 65%,
        transparent 100%
      );
      opacity: 0.85;
    }
  }

  .account-sub-page__toolbar-copy {
    display: grid;
    flex: 1 1 220px;
    grid-template-rows: auto auto;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 4px 12px;
    align-items: center;
    min-width: 0;
  }

  .account-sub-page__toolbar-line {
    display: inline-block;
    grid-row: 1 / span 2;
    align-self: center;
    width: 4px;
    height: 36px;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--el-color-primary) 70%, transparent),
      color-mix(in srgb, var(--theme-color) 55%, transparent)
    );
    border-radius: 999px;
    box-shadow: 0 0 18px color-mix(in srgb, var(--el-color-primary) 28%, transparent);
  }

  .account-sub-page__toolbar-titles {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .account-sub-page__toolbar-hint {
    grid-column: 2;
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-tertiary);
  }

  .account-sub-page__toolbar-eyebrow {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    opacity: 0.65;
  }

  .account-sub-page__toolbar-title {
    font-size: 17px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.02em;
    background-color: transparent;
    background-image: linear-gradient(
      105deg,
      var(--page-text-main) 0%,
      color-mix(in srgb, var(--el-color-primary) 72%, var(--page-text-main) 28%) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .account-sub-page__toolbar-actions {
    display: flex;
    flex: 1 1 280px;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
  }

  .account-sub-page__list-panel {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--default-box-color) 93%, transparent) 0%,
        color-mix(in srgb, var(--default-box-color) 86%, transparent) 100%
      ),
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--el-color-primary) 5%, transparent),
        color-mix(in srgb, var(--theme-color) 4%, transparent)
      );
    isolation: isolate;
    backdrop-filter: blur(18px);
    border: 1px solid var(--page-border);
    border-radius: 20px;
    box-shadow:
      0 18px 48px rgb(0 0 0 / 16%),
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 7%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 6%, transparent);

    &::before {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: 2;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, var(--el-color-primary) 42%, transparent) 40%,
        color-mix(in srgb, var(--theme-color) 32%, transparent) 70%,
        transparent 100%
      );
      border-radius: 20px 20px 0 0;
      opacity: 0.8;
    }
  }

  .account-sub-page__list-panel-fx {
    position: absolute;
    inset: -35% 20% 40%;
    z-index: 0;
    pointer-events: none;
    background: radial-gradient(
      ellipse 80% 55% at 18% 0%,
      color-mix(in srgb, var(--el-color-primary) 18%, transparent) 0%,
      transparent 62%
    );
    filter: blur(32px);
    opacity: 0.55;
  }

  .account-sub-page__list-panel-body {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 14px 14px 16px;
    overflow: auto;
    scrollbar-gutter: stable;
  }

  .account-sub-page__btn-primary.el-button--primary {
    font-weight: 600 !important;
    box-shadow:
      0 10px 22px color-mix(in srgb, var(--el-color-primary) 28%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 14%, transparent) !important;
    transition:
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out),
      filter var(--duration-normal) var(--ease-out);

    &:hover {
      filter: brightness(1.04);
      box-shadow:
        0 12px 28px color-mix(in srgb, var(--el-color-primary) 34%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 18%, transparent) !important;
      transform: translateY(-1px);
    }
  }

  .account-sub-page__btn-secondary.el-button {
    --el-button-bg-color: color-mix(in srgb, var(--default-box-color) 52%, transparent);
    --el-button-border-color: color-mix(in srgb, var(--el-color-primary) 20%, transparent);
    --el-button-text-color: var(--text-secondary);
    --el-button-hover-text-color: var(--el-color-primary);
    --el-button-hover-border-color: color-mix(in srgb, var(--el-color-primary) 48%, transparent);
    --el-button-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 9%, transparent);
    --el-button-active-text-color: var(--el-color-primary);
    --el-button-active-border-color: color-mix(in srgb, var(--el-color-primary) 55%, transparent);
    --el-button-active-bg-color: color-mix(in srgb, var(--el-color-primary) 12%, transparent);

    font-weight: 500;
    transition:
      border-color var(--duration-normal) var(--ease-out),
      background-color var(--duration-normal) var(--ease-out),
      color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);

    &:hover {
      box-shadow: 0 8px 18px color-mix(in srgb, var(--el-color-primary) 14%, transparent);
      transform: translateY(-1px);
    }
  }

  .btn-query.el-button {
    height: 32px !important;
    padding: 0 16px !important;
    font-size: 13px !important;
  }

  .country-filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    padding: 14px 16px;
    margin-bottom: 14px;
    background:
      radial-gradient(
        ellipse 90% 70% at 12% 0%,
        color-mix(in srgb, var(--el-color-primary) 10%, transparent) 0%,
        transparent 58%
      ),
      linear-gradient(
        165deg,
        color-mix(in srgb, var(--default-box-color) 96%, transparent) 0%,
        color-mix(in srgb, var(--default-box-color) 88%, transparent) 100%
      );
    border: 1px solid var(--as-border);
    border-radius: 14px;
    box-shadow:
      0 8px 24px rgb(0 0 0 / 6%),
      inset 0 1px 0 color-mix(in srgb, white 6%, transparent);
  }

  .country-filter-bar__label {
    font-size: 13px;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .header-search {
    width: 190px;

    :deep(.el-input__wrapper) {
      background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
      border: 1px solid var(--border) !important;
      border-radius: 7px;
      box-shadow: none !important;

      &:hover,
      &:focus-within {
        border-color: var(--accent) !important;
      }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: var(--text-primary);
    }

    :deep(.el-input__prefix) {
      color: var(--text-muted);
    }
  }

  .header-select {
    width: 100px;

    :deep(.el-select__wrapper) {
      color: var(--text-primary);
      background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
      border: 1px solid var(--border) !important;
      border-radius: 7px;
      box-shadow: none !important;

      &:hover {
        border-color: var(--accent) !important;
      }
    }
  }

  // ─── 两列大网格 ─────────────────────────────────────────
  .content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 14px;
    align-items: start;
  }

  .left-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  .right-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  // ─── KPI 四卡 ────────────────────────────────────────────
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .kpi-card {
    position: relative;
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 16px 16px 20px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .kpi-icon-wrap {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    font-size: 20px;
    border-radius: 10px;

    &--teal {
      background: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    }

    &--blue {
      background: color-mix(in srgb, var(--el-color-info) 18%, transparent);
    }

    &--green {
      background: color-mix(in srgb, var(--art-success) 18%, transparent);
    }

    &--amber {
      background: color-mix(in srgb, var(--art-warning) 18%, transparent);
    }
  }

  .kpi-body {
    flex: 1;
    min-width: 0;
  }

  .kpi-label {
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .kpi-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;

    &--teal {
      color: var(--accent);
    }

    &--blue {
      color: var(--el-color-info);
    }

    &--green {
      color: var(--art-success);
    }

    &--amber {
      color: var(--art-warning);
    }
  }

  .kpi-unit {
    margin-left: 3px;
    font-size: 13px;
    font-weight: 400;
    color: var(--text-muted);
  }

  // 底部彩色渐变线
  .kpi-accent {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 3px;
    border-radius: 0 0 10px 10px;

    &--teal {
      background: linear-gradient(90deg, var(--accent), transparent);
    }

    &--blue {
      background: linear-gradient(90deg, var(--el-color-info), transparent);
    }

    &--green {
      background: linear-gradient(90deg, var(--art-success), transparent);
    }

    &--amber {
      background: linear-gradient(90deg, var(--art-warning), transparent);
    }
  }

  // ─── 图表卡片 ───────────────────────────────────────────
  .chart-card {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 16px 14px 12px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .chart-title {
    flex-shrink: 0;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .donut-chart {
    width: 100%;
    height: 200px;
  }

  .donut-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 5px 10px;
    justify-content: center;
    padding-top: 6px;
  }

  .legend-item {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 11px;
    color: var(--text-muted);
  }

  .legend-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .bar-chart {
    width: 100%;
    height: 220px;
  }

  .chart-state-mask {
    position: absolute;
    inset: 38px 12px 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--default-bg-color) 78%, transparent);
    backdrop-filter: blur(1px);
    border: 1px dashed color-mix(in srgb, var(--el-color-primary) 22%, transparent);
    border-radius: 8px;
  }

  .chart-state-text {
    font-size: 12px;
    color: var(--text-secondary);
  }

  // ─── 表格面板 ───────────────────────────────────────────
  .table-panel {
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .country-table {
    width: 100%;
    cursor: pointer;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: var(--as-header-bg);
    --el-table-row-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-border: 1px solid var(--border);

    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 11px 8px;
      font-size: 12px;
      font-weight: 500;
      background: var(--as-header-bg) !important;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(td.el-table__cell) {
      padding: 10px 8px;
      font-size: 12px;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(tr) {
      background: transparent !important;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }
  }

  .flag-cell-img {
    display: block;
    width: 28px;
    height: 21px;
    margin: 0 auto;
    object-fit: cover;
    border-radius: 3px;
  }

  .flag-cell-fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    padding: 2px 4px;
    font-size: 10px;
    font-weight: 600;
    color: var(--text-secondary);
    background: color-mix(in srgb, var(--el-color-primary) 6%, transparent);
    border-radius: 3px;
  }

  .market-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;

    &--yes {
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 12%, transparent);
    }

    &--no {
      color: var(--text-muted);
      background: color-mix(in srgb, var(--el-color-primary) 5%, transparent);
    }
  }

  .action-btns {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;
  }

  .action-btn {
    padding: 3px 8px;
    font-size: 12px;
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 4px;
    transition: all 0.15s;

    &--view {
      color: var(--accent);

      &:hover {
        background: var(--accent-dim);
      }
    }

    &--edit {
      color: var(--text-secondary);

      &:hover {
        color: var(--text-primary);
        background: color-mix(in srgb, var(--el-color-primary) 6%, transparent);
      }
    }
  }

  // ─── 分页 ──────────────────────────────────────────────
  .pagination-bar {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
    padding: 12px 16px;
    border-top: 1px solid var(--border);
  }

  .total-text {
    font-size: 13px;
    color: var(--text-muted);
  }

  .page-size-select {
    width: 100px;

    :deep(.el-select__wrapper) {
      font-size: 12px;
      color: var(--text-secondary);
      background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
      border: 1px solid var(--border) !important;
      box-shadow: none !important;
    }
  }

  .country-pagination {
    :deep(.el-pager li) {
      min-width: 28px;
      height: 28px;
      font-size: 13px;
      line-height: 28px;
      color: var(--text-secondary);
      background: transparent;
      border-radius: 5px;

      &:hover {
        color: var(--accent);
      }

      &.is-active {
        font-weight: 700;
        color: #fff;
        background: var(--accent);
      }
    }

    :deep(.btn-prev),
    :deep(.btn-next) {
      color: var(--text-secondary) !important;
      background: color-mix(in srgb, var(--default-box-color) 40%, transparent) !important;
      border: 1px solid var(--border) !important;
      border-radius: 5px;

      &:hover {
        color: var(--accent) !important;
        border-color: var(--accent) !important;
      }
    }
  }

  // ─── 下拉选项 ───────────────────────────────────────────
  :deep(.el-select-dropdown) {
    background: color-mix(in srgb, var(--default-box-color) 96%, transparent) !important;
    border: 1px solid var(--border) !important;
  }

  :deep(.el-select-dropdown__item) {
    color: var(--text-secondary) !important;

    &:hover,
    &.is-hovering {
      color: var(--accent) !important;
      background: color-mix(in srgb, var(--el-color-primary) 10%, transparent) !important;
    }

    &.is-selected {
      color: var(--accent) !important;
      background: color-mix(in srgb, var(--el-color-primary) 14%, transparent) !important;
    }
  }

  @media (width <= 1100px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (width <= 900px) {
    .kpi-row {
      grid-template-columns: repeat(2, 1fr);
    }

    .account-sub-page__toolbar-actions {
      gap: 8px;
    }
  }

  @media (width <= 600px) {
    .account-sub-page__toolbar-row {
      flex-direction: column;
      align-items: stretch;
    }

    .account-sub-page__toolbar-actions {
      justify-content: flex-start;
    }

    .kpi-row {
      grid-template-columns: 1fr 1fr;
    }

    .country-filter-bar .header-search {
      width: 100%;
      min-width: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .account-sub-page__btn-primary.el-button--primary:hover,
    .account-sub-page__btn-secondary.el-button:hover {
      transform: none;
    }
  }
</style>
