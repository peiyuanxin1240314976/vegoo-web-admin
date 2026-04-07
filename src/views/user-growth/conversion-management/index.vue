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
            :platform-options="platformOptions"
            :app-options="appOptions"
            :conversion-type-options="conversionTypeOptions"
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
          <ConversionDataFilters
            :filter="dataFilterForForm"
            :platform-options="platformOptions"
            :app-options="appOptions"
            :conversion-type-options="conversionTypeOptions"
            @search="handleDataSearch"
          />
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
  import {
    fetchBatchUpdateConversionMappingStatus,
    fetchConversionDataTabOverviewKpi,
    fetchConversionDataTabSidePanels,
    fetchConversionDataTabTableRows,
    fetchConversionMappingDetail,
    fetchConversionMappingList,
    fetchConversionMappingStats,
    fetchConversionMetaConversionTypeOptions,
    fetchCreateConversionMapping,
    fetchDeleteConversionMapping,
    fetchExportConversionMappings,
    fetchUpdateConversionMapping
  } from '@/api/user-growth/conversion-management'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
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
  import { MOCK_CONVERSION_TYPE_OPTIONS } from './mock/data'
  import type {
    ConversionDataFilterParams,
    ConversionDataSidePanels,
    ConversionDataRow,
    ConversionFilterParams,
    ConversionKpi,
    ConversionMappingItem,
    ConversionMappingForm,
    ConversionTypeDistributionItem
  } from './types'
  import { ElMessage } from 'element-plus'
  import { getAppNow, cloneAppDate } from '@/utils/app-now'

  defineOptions({ name: 'ConversionManagement' })

  const cockpitMetaFilterStore = useCockpitMetaFilterStore()
  const conversionTypeOptions = ref<{ label: string; value: string }[]>(
    MOCK_CONVERSION_TYPE_OPTIONS
  )

  const platformOptions = computed(
    () => cockpitMetaFilterStore.data?.platformOptions ?? [{ label: '全部终端平台', value: '' }]
  )
  const appOptions = computed(
    () => cockpitMetaFilterStore.data?.appOptions ?? [{ label: '全部应用', value: '' }]
  )

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
      apiFn: fetchConversionMappingList,
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

  const sideStats = ref({
    typeDistribution: [] as ConversionTypeDistributionItem[],
    mappingStats: { mapped: 0, duplicate: 0, unmapped: 0 },
    platformStats: { android: 0, ios: 0 }
  })

  async function loadNameTabStats() {
    try {
      const res = await fetchConversionMappingStats({
        platform: searchParams.platform ?? '',
        appId: searchParams.appId ?? '',
        conversionType: searchParams.conversionType ?? '',
        status: searchParams.status ?? '',
        keyword: searchParams.keyword ?? ''
      })
      sideStats.value = {
        typeDistribution: res.typeDistribution ?? [],
        mappingStats: res.mappingStats ?? { mapped: 0, duplicate: 0, unmapped: 0 },
        platformStats: res.platformStats ?? { android: 0, ios: 0 }
      }
    } catch (error) {
      console.warn('[conversion-management] 加载统计失败', error)
    }
  }

  async function handleSearch(payload: ConversionFilterParams) {
    Object.assign(searchParams, {
      platform: payload.platform ?? '',
      appId: payload.appId ?? '',
      conversionType: payload.conversionType ?? '',
      status: payload.status ?? '',
      keyword: payload.keyword ?? ''
    })
    await Promise.resolve(getData())
    await loadNameTabStats()
  }

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const dialogRowData = ref<Partial<ConversionMappingItem> | null>(null)

  async function openDialog(type: 'add' | 'edit', row?: ConversionMappingItem) {
    dialogType.value = type
    if (type === 'edit' && row?.id) {
      try {
        const detail = await fetchConversionMappingDetail({ id: row.id })
        dialogRowData.value = detail
      } catch {
        dialogRowData.value = row ?? null
      }
    } else {
      dialogRowData.value = row ?? null
    }
    dialogVisible.value = true
  }

  async function handleDialogSubmit(form: ConversionMappingForm) {
    try {
      if (dialogType.value === 'add') {
        await fetchCreateConversionMapping(form)
        ElMessage.success('新增成功')
      } else {
        const id = dialogRowData.value?.id
        if (!id) return
        await fetchUpdateConversionMapping({
          id,
          systemDisplayName: form.systemDisplayName ?? '',
          conversionDisplayType: form.conversionDisplayType,
          status: form.status,
          remarks: form.remarks
        })
        ElMessage.success('保存成功')
      }
      dialogVisible.value = false
      await Promise.resolve(getData())
      await loadNameTabStats()
    } catch {
      ElMessage.error(dialogType.value === 'add' ? '新增失败' : '保存失败')
    }
  }

  const deleteDialogVisible = ref(false)
  const deleteRow = ref<ConversionMappingItem | null>(null)

  function handleDelete(row: ConversionMappingItem) {
    deleteRow.value = row
    deleteDialogVisible.value = true
  }

  async function handleDeleteConfirm(row: ConversionMappingItem) {
    try {
      await fetchDeleteConversionMapping({ id: row.id })
      ElMessage.success('删除成功')
      await Promise.resolve(getData())
      await loadNameTabStats()
    } catch {
      ElMessage.error('删除失败')
    }
  }

  async function handleBatchEnable() {
    try {
      const res = await fetchBatchUpdateConversionMappingStatus({
        mode: 'byFilter',
        filters: {
          platform: searchParams.platform ?? '',
          appId: searchParams.appId ?? '',
          conversionType: searchParams.conversionType ?? '',
          status: searchParams.status ?? '',
          keyword: searchParams.keyword ?? ''
        },
        targetStatus: 'enabled'
      })
      ElMessage.success(res.message || `批量启用成功，影响 ${res.affectedCount} 条`)
      await Promise.resolve(getData())
      await loadNameTabStats()
    } catch {
      ElMessage.error('批量启用失败')
    }
  }

  async function handleBatchDisable() {
    try {
      const res = await fetchBatchUpdateConversionMappingStatus({
        mode: 'byFilter',
        filters: {
          platform: searchParams.platform ?? '',
          appId: searchParams.appId ?? '',
          conversionType: searchParams.conversionType ?? '',
          status: searchParams.status ?? '',
          keyword: searchParams.keyword ?? ''
        },
        targetStatus: 'unmapped'
      })
      ElMessage.success(res.message || `批量禁用成功，影响 ${res.affectedCount} 条`)
      await Promise.resolve(getData())
      await loadNameTabStats()
    } catch {
      ElMessage.error('批量禁用失败')
    }
  }

  async function handleExport() {
    try {
      const res = await fetchExportConversionMappings({
        platform: searchParams.platform ?? '',
        appId: searchParams.appId ?? '',
        conversionType: searchParams.conversionType ?? '',
        status: searchParams.status ?? '',
        keyword: searchParams.keyword ?? '',
        format: 'xlsx'
      })
      if (res.downloadUrl) {
        window.open(res.downloadUrl, '_blank', 'noopener,noreferrer')
      } else {
        ElMessage.success('导出请求已提交')
      }
    } catch {
      ElMessage.error('导出失败')
    }
  }

  async function loadConversionTypeOptions() {
    try {
      const res = await fetchConversionMetaConversionTypeOptions()
      conversionTypeOptions.value =
        res.conversionTypeOptions?.length > 0
          ? res.conversionTypeOptions
          : MOCK_CONVERSION_TYPE_OPTIONS
    } catch (error) {
      console.warn('[conversion-management] 加载转化类型下拉失败，回退 mock 选项', error)
      conversionTypeOptions.value = MOCK_CONVERSION_TYPE_OPTIONS
    }
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
      const params = { ...dataFilter }
      const [kpiRes, rowsRes, sideRes] = await Promise.all([
        fetchConversionDataTabOverviewKpi(params),
        fetchConversionDataTabTableRows(params),
        fetchConversionDataTabSidePanels(params)
      ])
      if (seq !== dataLoadSeq || activeTab.value !== 'data') return
      dataKpi.value = kpiRes.kpi
      dataTableRows.value = rowsRes.tableRows
      dataSidePanels.value = sideRes.sidePanels
    } catch (error) {
      console.warn('[conversion-management] 加载 data tab 失败', error)
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

  onMounted(() => {
    void cockpitMetaFilterStore.ensureLoaded()
    void loadConversionTypeOptions()
    void loadNameTabStats()
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
