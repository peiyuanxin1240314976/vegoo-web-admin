<template>
  <div class="conversion-management-page art-full-height flex flex-col">
    <ConversionTabs v-model="activeTab" />
    <template v-if="activeTab === 'name'">
      <div class="conversion-data-page flex flex-1 flex-col min-h-0 min-w-0">
        <div class="cm-data-page-fx" aria-hidden="true"></div>
        <div
          class="conversion-management-page__section conversion-data-page__section--filters cm-entry-1"
        >
          <ConversionFilters
            :filter="filterForForm"
            @search="handleSearch"
            @add-mapping="openDialog('add')"
          />
        </div>
        <ElRow :gutter="16" class="conversion-management-page__body cm-entry-2 flex-1 min-h-0">
          <ElCol :xs="24" :md="17" :xl="19" class="conversion-management-page__main">
            <ConversionTable
              :data="data"
              :loading="loading"
              :pagination="pagination"
              @edit="openDialog('edit', $event)"
              @delete="handleDelete"
              @pagination:size-change="handleSizeChange"
              @pagination:current-change="handleCurrentChange"
            />
          </ElCol>
          <ElCol :xs="24" :md="7" :xl="5" class="conversion-management-page__side">
            <ConversionSidePanel
              :type-distribution="sideStats.typeDistribution"
              :mapping-stats="sideStats.mappingStats"
              :platform-stats="sideStats.platformStats"
              @batch-enable="handleBatchEnable"
              @batch-disable="handleBatchDisable"
              @export="handleExport"
            />
          </ElCol>
        </ElRow>
      </div>
    </template>
    <template v-else>
      <div class="conversion-data-page flex flex-1 flex-col min-h-0 min-w-0">
        <div class="cm-data-page-fx" aria-hidden="true"></div>
        <div
          class="conversion-management-page__section conversion-data-page__section--filters cm-entry-1"
        >
          <ConversionDataFilters :filter="dataFilterForForm" @search="handleDataSearch" />
        </div>
        <ElRow :gutter="16" class="conversion-management-page__body cm-entry-2 flex-1 min-h-0">
          <ElCol :xs="24" :md="15" :xl="15" class="conversion-management-page__left">
            <ConversionDataKpiCards :kpi="dataKpi" :loading="dataLoading" />
            <ConversionDataTable :data="dataTableRows" :loading="dataLoading" />
          </ElCol>
          <ElCol :xs="24" :md="9" :xl="9" class="conversion-management-page__right">
            <ConversionDataSidePanel
              :type-distribution="dataSidePanels.typeDistribution"
              :top10="dataSidePanels.top10"
              :value-trend30d="dataSidePanels.valueTrend30d"
              :account-share="dataSidePanels.accountShare"
              :loading="dataLoading"
            />
          </ElCol>
        </ElRow>
      </div>
    </template>
    <ConversionMappingDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :row-data="dialogRowData"
      @submit="handleDialogSubmit"
    />
    <ConversionDeleteDialog
      v-model:visible="deleteDialogVisible"
      :row="deleteRow"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { useIntervalFn } from '@vueuse/core'
  import ConversionTabs from './modules/conversion-tabs.vue'
  import ConversionFilters from './modules/conversion-filters.vue'
  import ConversionTable from './modules/conversion-table.vue'
  import ConversionSidePanel from './modules/conversion-side-panel.vue'
  import ConversionDataFilters from './modules/conversion-data-filters.vue'
  import ConversionDataKpiCards from './modules/conversion-data-kpi-cards.vue'
  import ConversionDataTable from './modules/conversion-data-table.vue'
  import ConversionDataSidePanel from './modules/conversion-data-side-panel.vue'
  import ConversionMappingDialog from './modules/conversion-mapping-dialog.vue'
  import ConversionDeleteDialog from './modules/conversion-delete-dialog.vue'
  import {
    fetchConversionMappingListMock,
    MOCK_TYPE_DISTRIBUTION,
    MOCK_MAPPING_STATS,
    MOCK_PLATFORM_STATS
  } from './mock/data'
  import { fetchConversionDataMock } from './mock/data-tab'
  import type {
    ConversionDataFilterParams,
    ConversionDataSidePanels,
    ConversionDataRow,
    ConversionFilterParams,
    ConversionKpi,
    ConversionMappingItem,
    ConversionMappingForm
  } from './types'
  import { ElMessage } from 'element-plus'
  import { getAppNow, cloneAppDate } from '@/utils/app-now'

  defineOptions({ name: 'ConversionManagement' })

  const activeTab = ref<'name' | 'data'>('name')

  const {
    data,
    loading,
    pagination,
    searchParams,
    getData,
    handleSizeChange,
    handleCurrentChange
  } = useTable({
    core: {
      apiFn: fetchConversionMappingListMock,
      apiParams: {
        current: 1,
        size: 20,
        platform: '',
        appId: '',
        conversionType: '',
        status: '',
        keyword: ''
      },
      columnsFactory: () => []
    }
  })

  const filterForForm = computed(() => searchParams as ConversionFilterParams)

  const sideStats = computed(() => ({
    typeDistribution: MOCK_TYPE_DISTRIBUTION,
    mappingStats: MOCK_MAPPING_STATS,
    platformStats: MOCK_PLATFORM_STATS
  }))

  function handleSearch(payload: ConversionFilterParams) {
    Object.assign(searchParams, {
      platform: payload.platform ?? '',
      appId: payload.appId ?? '',
      conversionType: payload.conversionType ?? '',
      status: payload.status ?? '',
      keyword: payload.keyword ?? ''
    })
    getData()
  }

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const dialogRowData = ref<Partial<ConversionMappingItem> | null>(null)

  function openDialog(type: 'add' | 'edit', row?: ConversionMappingItem) {
    dialogType.value = type
    dialogRowData.value = row ?? null
    dialogVisible.value = true
  }

  function handleDialogSubmit(form: ConversionMappingForm) {
    console.log('Mapping submit (mock):', form)
    dialogVisible.value = false
    getData()
  }

  const deleteDialogVisible = ref(false)
  const deleteRow = ref<ConversionMappingItem | null>(null)

  function handleDelete(row: ConversionMappingItem) {
    deleteRow.value = row
    deleteDialogVisible.value = true
  }

  function handleDeleteConfirm(row: ConversionMappingItem) {
    console.log('Delete (mock):', row.id)
    getData()
  }

  function handleBatchEnable() {
    ElMessage.info('批量启用（待接接口）')
  }

  function handleBatchDisable() {
    ElMessage.info('批量禁用（待接接口）')
  }

  function handleExport() {
    ElMessage.info('导出映射表（待接接口）')
  }

  /**
   * 转化数据（Data Tab）
   */
  const refreshIntervalMs = 30_000

  function getDefaultDateBounds(): { startDate: string; endDate: string } {
    const end = getAppNow()
    const start = cloneAppDate(end)
    start.setDate(end.getDate() - 6)
    const toYmd = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    return { startDate: toYmd(start), endDate: toYmd(end) }
  }

  const dataFilter = reactive<ConversionDataFilterParams>({
    ...getDefaultDateBounds(),
    platform: '',
    appId: '',
    source: '',
    adPlatform: '',
    conversionType: ''
  })

  const dataFilterForForm = computed(() => dataFilter as ConversionDataFilterParams)

  const dataLoading = ref(false)
  const dataKpi = ref<ConversionKpi | null>(null)
  const dataTableRows = ref<ConversionDataRow[]>([])
  const dataSidePanels = ref<ConversionDataSidePanels>({
    typeDistribution: [],
    top10: [],
    valueTrend30d: [],
    accountShare: []
  })

  let dataLoadSeq = 0

  async function loadDataTab() {
    const seq = ++dataLoadSeq
    dataLoading.value = true
    try {
      const res = await fetchConversionDataMock({ ...dataFilter })
      if (seq !== dataLoadSeq || activeTab.value !== 'data') return
      dataKpi.value = res.kpi
      dataTableRows.value = res.tableRows
      dataSidePanels.value = res.sidePanels
    } finally {
      if (seq === dataLoadSeq) dataLoading.value = false
    }
  }

  const interval = useIntervalFn(
    () => {
      if (activeTab.value !== 'data') return
      if (dataLoading.value) return
      void loadDataTab()
    },
    refreshIntervalMs,
    { immediate: false }
  )

  function restartInterval() {
    interval.pause()
    interval.resume()
  }

  function handleDataSearch(payload: ConversionDataFilterParams) {
    const bounds =
      payload.startDate && payload.endDate
        ? { startDate: payload.startDate, endDate: payload.endDate }
        : getDefaultDateBounds()
    Object.assign(dataFilter, {
      ...bounds,
      platform: payload.platform ?? '',
      appId: payload.appId ?? '',
      source: payload.source ?? payload.adPlatform ?? '',
      adPlatform: payload.source ?? payload.adPlatform ?? '',
      conversionType: payload.conversionType ?? ''
    })
    void loadDataTab().then(() => restartInterval())
  }

  watch(
    () => activeTab.value,
    (tab) => {
      if (tab === 'data') {
        void loadDataTab().then(() => restartInterval())
      } else {
        interval.pause()
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    interval.pause()
  })
</script>

<style scoped lang="scss">
  @use './styles/cm-data-page.scss' as *;

  .conversion-management-page {
    padding: 0;
  }

  .conversion-management-page__body {
    flex: 1;
    min-height: 0;
  }

  .conversion-management-page__main {
    min-width: 0;
  }

  .conversion-management-page__side {
    min-width: 0;
  }

  .conversion-management-page__left {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .conversion-management-page__right {
    min-width: 0;
    min-height: 0;
  }
</style>
