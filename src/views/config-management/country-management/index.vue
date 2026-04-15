<template>
  <div class="country-page art-full-height">
    <!-- ── 页面头部 ─────────────────────────────────────── -->
    <div class="page-header">
      <span class="breadcrumb">
        <span class="bc-parent">系统管理</span>
        <span class="bc-sep">›</span>
        <span class="bc-current">国家列表</span>
      </span>
      <div class="header-actions">
        <ElButton round class="btn-add" @click="handleAdd">
          <ElIcon><Plus /></ElIcon>新增国家
        </ElButton>
        <ElButton round class="btn-secondary" @click="importVisible = true">批量导入</ElButton>
        <ElButton round class="btn-secondary" @click="handleExport">导出</ElButton>
        <el-input
          v-model="filterForm.keyword"
          placeholder="搜索国家名称或代码"
          class="header-search"
          clearable
        >
          <template #prefix
            ><el-icon><Search /></el-icon
          ></template>
        </el-input>
        <span class="filter-label">地区</span>
        <el-select v-model="filterForm.region" placeholder="全部" class="header-select" clearable>
          <el-option v-for="r in metaRegionOptions" :key="r" :label="r" :value="r" />
        </el-select>
        <span class="filter-label">货币</span>
        <el-select v-model="filterForm.currency" placeholder="全部" class="header-select" clearable>
          <el-option v-for="c in metaCurrencyOptions" :key="c" :label="c" :value="c" />
        </el-select>
        <ElButton round class="btn-secondary" @click="handleQuery">查询</ElButton>
      </div>
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
                <img v-if="row.flagIconUrl" :src="row.flagIconUrl" alt="" class="flag-cell-img" />
                <span v-else class="flag-cell-fallback">{{ row.code }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="nameCn" label="中文名称" width="110" show-overflow-tooltip />
            <el-table-column prop="nameEn" label="国家名称" min-width="140" show-overflow-tooltip />
            <el-table-column prop="timezone" label="时区" width="110" show-overflow-tooltip />
            <el-table-column prop="phoneCode" label="电话代码" width="100" show-overflow-tooltip />
            <el-table-column prop="code3" label="三位数代码" width="110" show-overflow-tooltip />
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
    亚太: '#2dd4bf',
    欧洲: '#60a5fa',
    北美: '#a78bfa',
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
      color: REGION_COLOR_MAP[item.region] ?? '#94a3b8'
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
      itemStyle: { color: REGION_COLOR_MAP[item.region] ?? '#94a3b8' }
    }))
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1a2540',
        borderColor: 'rgba(255,255,255,0.1)',
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
    const colors = ['#2dd4bf', '#60a5fa', '#a78bfa', '#f59e0b', '#f472b6', '#94a3b8']
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
        backgroundColor: '#1a2540',
        borderColor: 'rgba(255,255,255,0.1)',
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
  // ─── CSS 变量 ───────────────────────────────────────────
  .country-page {
    --bg-page: #0b1120;
    --bg-card: #131c2e;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;
    --accent-dim: rgb(45 212 191 / 10%);
    --red: #ef4444;
    --red-dim: rgb(239 68 68 / 12%);

    position: relative;
    padding: 0 24px 24px;
    overflow-y: auto;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: var(--text-primary);
    background: var(--bg-page);
  }

  // ─── 页面头部 ───────────────────────────────────────────
  .page-header {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    padding: 18px 0 14px;
  }

  .breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-right: 8px;
    font-size: 14px;
  }

  .bc-parent {
    color: var(--text-secondary);
  }

  .bc-sep {
    color: var(--text-muted);
  }

  .bc-current {
    font-weight: 600;
    color: var(--text-primary);
  }

  .header-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-left: auto;
  }

  .btn-add {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 8px 16px !important;
    font-weight: 600 !important;
    color: #0b1120 !important;
    background: var(--accent) !important;
    border: none !important;
    border-radius: 8px !important;
    transition: all 0.2s;

    &:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
  }

  .btn-secondary {
    padding: 8px 14px !important;
    color: var(--text-secondary) !important;
    background: transparent !important;
    border: 1px solid var(--border) !important;
    border-radius: 8px !important;
    transition: all 0.2s;

    &:hover {
      color: var(--accent) !important;
      border-color: var(--accent) !important;
    }
  }

  .header-search {
    width: 190px;

    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
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

  .filter-label {
    font-size: 13px;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .header-select {
    width: 100px;

    :deep(.el-select__wrapper) {
      color: var(--text-primary);
      background: rgb(255 255 255 / 4%) !important;
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
      background: rgb(45 212 191 / 15%);
    }

    &--blue {
      background: rgb(96 165 250 / 15%);
    }

    &--green {
      background: rgb(34 197 94 / 15%);
    }

    &--amber {
      background: rgb(245 158 11 / 15%);
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
      color: #2dd4bf;
    }

    &--blue {
      color: #60a5fa;
    }

    &--green {
      color: #22c55e;
    }

    &--amber {
      color: #f59e0b;
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
      background: linear-gradient(90deg, #2dd4bf, transparent);
    }

    &--blue {
      background: linear-gradient(90deg, #60a5fa, transparent);
    }

    &--green {
      background: linear-gradient(90deg, #22c55e, transparent);
    }

    &--amber {
      background: linear-gradient(90deg, #f59e0b, transparent);
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
    background: rgb(11 17 32 / 72%);
    backdrop-filter: blur(1px);
    border: 1px dashed rgb(148 163 184 / 30%);
    border-radius: 8px;
  }

  .chart-state-text {
    font-size: 12px;
    color: #94a3b8;
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
    --el-table-header-bg-color: #0f1829;
    --el-table-row-hover-bg-color: #162035;
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-border: 1px solid var(--border);

    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 11px 8px;
      font-size: 12px;
      font-weight: 500;
      background: #0f1829 !important;
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
    color: #94a3b8;
    background: rgb(255 255 255 / 6%);
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
      color: #22c55e;
      background: rgb(34 197 94 / 12%);
    }

    &--no {
      color: var(--text-muted);
      background: rgb(255 255 255 / 5%);
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
      color: #2dd4bf;

      &:hover {
        background: var(--accent-dim);
      }
    }

    &--edit {
      color: var(--text-secondary);

      &:hover {
        color: var(--text-primary);
        background: rgb(255 255 255 / 6%);
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
      background: rgb(255 255 255 / 4%) !important;
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
        color: #0b1120;
        background: var(--accent);
      }
    }

    :deep(.btn-prev),
    :deep(.btn-next) {
      color: var(--text-secondary) !important;
      background: rgb(255 255 255 / 4%) !important;
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
    background: #1a2540 !important;
    border: 1px solid var(--border) !important;
  }

  :deep(.el-select-dropdown__item) {
    color: var(--text-secondary) !important;

    &:hover,
    &.is-hovering {
      color: var(--accent) !important;
      background: rgb(45 212 191 / 8%) !important;
    }

    &.is-selected {
      color: var(--accent) !important;
      background: rgb(45 212 191 / 12%) !important;
    }
  }
</style>
