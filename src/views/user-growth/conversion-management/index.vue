<template>
  <div class="conversion-management-page art-full-height flex flex-col">
    <ConversionTabs v-model="activeTab" />
    <template v-if="activeTab === 'name'">
      <ElRow :gutter="16" class="conversion-management-page__body">
        <ElCol :xs="24" :xl="19">
          <ConversionFilters
            :filter="filterForForm"
            @search="handleSearch"
            @add-mapping="openDialog('add')"
          />
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
        <ElCol :xs="24" :xl="5">
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
    </template>
    <template v-else>
      <div class="conversion-management-page__placeholder">
        <p class="conversion-management-page__placeholder-text">
          {{ $t('conversionManagement.dataTabPlaceholder') }}
        </p>
      </div>
    </template>
    <ConversionMappingDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :row-data="dialogRowData"
      @submit="handleDialogSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import ConversionTabs from './modules/conversion-tabs.vue'
  import ConversionFilters from './modules/conversion-filters.vue'
  import ConversionTable from './modules/conversion-table.vue'
  import ConversionSidePanel from './modules/conversion-side-panel.vue'
  import ConversionMappingDialog from './modules/conversion-mapping-dialog.vue'
  import {
    fetchConversionMappingListMock,
    MOCK_TYPE_DISTRIBUTION,
    MOCK_MAPPING_STATS,
    MOCK_PLATFORM_STATS
  } from './mock/data'
  import type {
    ConversionFilterParams,
    ConversionMappingItem,
    ConversionMappingForm
  } from './types'
  import { ElMessage, ElMessageBox } from 'element-plus'

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
        app: '',
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
      app: payload.app ?? '',
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

  function handleDelete(row: ConversionMappingItem) {
    ElMessageBox.confirm('确定删除该映射？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
      .then(() => {
        console.log('Delete (mock):', row.id)
        getData()
      })
      .catch(() => {})
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
</script>

<style scoped lang="scss">
  .conversion-management-page {
    padding: 0;
  }

  .conversion-management-page__body {
    flex: 1;
    min-height: 0;
  }

  .conversion-management-page__placeholder {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }

  .conversion-management-page__placeholder-text {
    margin: 0;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
</style>
